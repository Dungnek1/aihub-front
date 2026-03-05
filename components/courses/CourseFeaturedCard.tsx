"use client";
import { Star, MoreHorizontal, BookOpen, Bookmark, ArrowRight } from "lucide-react";
import type { Tool } from "@/types/tool.types";
import { useState } from "react";
import CourseModal from "./CourseModal";
import { normalizeMediaUrl } from "@/utils/image.utils";
import CourseRatingModal from "./CourseRatingModal";
import GlareHover from "@/components/ui/glare-hover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedCourses } from "@/contexts/SavedCoursesContext";
import { useTranslations } from "next-intl";

type Props = { tool: Tool };

export default function CourseFeaturedCard({ tool }: Props) {
  const t = useTranslations("AITools");
  const toast = useToast();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { isCourseSaved, toggleSave, refreshSavedCourses } = useSavedCourses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [openRatingModal, setOpenRatingModal] = useState({
    open: false,
    start: 0,
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const priceText = typeof tool.price === "string" ? tool.price : "";
  const priceLabel = priceText || "FREE";

  // Check if course is saved
  const isSaved = isCourseSaved(tool.id);

  // Handle save/unsave course
  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập");
      return;
    }
    if (saveLoading) return;

    setSaveLoading(true);
    try {
      const isNowSaved = await toggleSave(tool.id);
      
      // If toggleSave returns false, it might be because:
      // 1. Course was unsaved (isNowSaved = false)
      // 2. API returned null (400 error - silent fail)
      // Only show success if we got a valid response
      if (isNowSaved !== undefined) {
        if (isNowSaved) {
          toast.success(t("saved") || "Đã lưu");
        } else {
          toast.success(t("unsaved") || "Đã bỏ lưu");
        }
        // Refresh saved courses context to update UI
        await refreshSavedCourses();
        router.refresh();
      } else {
        // If undefined, API might have failed silently (400 error)
        // Don't show error, just don't update UI
      }
    } catch (error: any) {
      const status = error?.response?.status || error?.status;
      const errorMessage = error?.message || "";
      
      // Only show error for unexpected errors (not 400, 401, 403, 404)
      if (
        status !== 400 &&
        status !== 401 &&
        status !== 403 &&
        status !== 404 &&
        !errorMessage.includes("not found") &&
        !errorMessage.includes("Bad Request")
      ) {
        toast.error(t("saveError") || "Lỗi khi lưu khóa học");
        console.error("Save course error:", error);
      }
    } finally {
      setSaveLoading(false);
    }
  };

  // Normalize rating to ensure it's always a valid number
  const avgRating =
    tool.avgRating && !isNaN(Number(tool.avgRating)) && Number(tool.avgRating) > 0
      ? Number(tool.avgRating)
      : 5; // Fallback to 5 if no rating
  const ratingsCount = tool.ratingsCount || 0;

  return (
    <>
      <GlareHover
        glareColor="#56E3E1"
        glareOpacity={0.6}
        glareAngle={-30}
        glareSize={400}
        transitionDuration={600}
        playOnce={false}
        className="h-full rounded-xl overflow-hidden"
      >
        <article
          className="rounded-xl overflow-hidden border border-white/10 bg-[#0A0F18] hover:border-cyan-400/40 transition-all cursor-pointer h-full"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="relative">
            {!tool.logoUrl || imageError ? (
              <div className="w-full h-[160px] sm:h-[180px] bg-gray-700/50 border-b border-gray-600/50 flex items-center justify-center">
                <BookOpen className="w-12 h-12 md:w-14 md:h-14 text-gray-400" />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={normalizeMediaUrl(tool.logoUrl)}
                alt={tool.name}
                className="w-full h-[160px] sm:h-[180px] object-cover"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onError={async (e) => {
                  const normalizedSrc = normalizeMediaUrl(tool.logoUrl);
                  const imgElement = e.target as HTMLImageElement;

                  // Try to fetch the image to get more error details
                  let fetchError: any = null;
                  try {
                    const response = await fetch(normalizedSrc, {
                      method: "HEAD",
                      mode: "cors",
                    });
                    if (!response.ok) {
                      fetchError = {
                        status: response.status,
                        statusText: response.statusText,
                        headers: Object.fromEntries(response.headers.entries()),
                      };
                    }
                  } catch (fetchErr: any) {
                    fetchError = {
                      message: fetchErr.message,
                      name: fetchErr.name,
                      stack: fetchErr.stack,
                    };
                  }

                  console.error("[CourseFeaturedCard] Image load error:", {
                    src: normalizedSrc,
                    actualSrc: imgElement?.src,
                    originalLogoUrl: tool.logoUrl,
                    courseId: tool.id,
                    courseName: tool.name,
                    // Check if browser upgraded http to https
                    isHttpsUpgrade:
                      normalizedSrc.startsWith("http://") &&
                      imgElement?.src?.startsWith("https://"),
                    fetchError,
                    networkState: imgElement?.complete ? "complete" : "loading",
                  });
                  setImageError(true);
                }}
                onLoad={() => {
                  if (process.env.NODE_ENV === "development") {
                    const normalizedSrc = normalizeMediaUrl(tool.logoUrl);
                    console.log(
                      "[CourseFeaturedCard] Image loaded successfully:",
                      {
                        src: normalizedSrc,
                        originalLogoUrl: tool.logoUrl,
                        courseId: tool.id,
                      }
                    );
                  }
                }}
              />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 flex items-center justify-center text-white z-10"
                  title="More"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[#1E293B] border-gray-700 text-white min-w-[160px]"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem
                  onClick={handleToggleSave}
                  disabled={saveLoading || !isAuthenticated}
                  className="cursor-pointer hover:bg-gray-700/50 focus:bg-gray-700/50 flex items-center gap-2"
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                  <span>{isSaved ? (t("unsaved") || "Bỏ lưu") : "Lưu"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="p-3 sm:p-4">
            <h4 className="text-white font-semibold text-base line-clamp-1">
              {tool.name}
            </h4>
            <div className="mt-1 flex items-center gap-2 text-sm flex-wrap">
              <div className="flex items-center gap-1 text-yellow-300 cursor-pointer">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 transition ${
                      i < Math.round(avgRating)
                        ? "fill-yellow-400 text-yellow-400 hover:scale-110"
                        : "text-yellow-700 hover:text-yellow-400 hover:scale-110"
                    } pointer-events-auto`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenRatingModal({ open: true, start: i });
                    }}
                  />
                ))}
              </div>
              <span className="text-white/90 font-semibold">
                {avgRating.toFixed(1)}
              </span>
              {tool.price && (
                <span
                  className={`ml-2 text-[10px] px-2 py-0.5 rounded-full border ${
                    priceText.toUpperCase().includes("PAID")
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-400/30"
                      : "bg-amber-500/10 text-amber-300 border-amber-400/30"
                  }`}
                >
                  {priceText.toUpperCase().includes("PAID")
                    ? "PAID"
                    : priceLabel.toUpperCase()}
                </span>
              )}
            </div>
            {tool.description && (
              <p className="mt-2 text-xs text-white/70 line-clamp-2">
                {tool.description}
              </p>
            )}
            {/* Enroll Now Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const link = tool.homepageUrl || (tool as any).link;
                if (link && link !== "#") {
                  window.open(link, "_blank");
                }
              }}
              className="mt-3 w-full border border-cyan-300/40 text-cyan-300 text-sm py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-300/10 transition cursor-pointer"
            >
              {t("enrollNow") || "Enroll Now"}
              <ArrowRight size={16} />
            </button>
          </div>
        </article>
      </GlareHover>
      <CourseModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        courseId={tool.id}
        initialData={tool}
      />
      <CourseRatingModal
        open={openRatingModal.open}
        onClose={() => setOpenRatingModal({ open: false, start: 0 })}
        course={tool}
        start={openRatingModal.start}
      />
    </>
  );
}
