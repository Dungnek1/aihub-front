"use client";

import Image, { StaticImageData } from "next/image";
import { Star, Bookmark, ArrowRight, Package, ExternalLink, MoreVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import bin from "@/public/icon/bin-round.svg";
import AIToolModal from "./AIToolModal";
import MarketingToolModal from "@/components/marketing/MarketingToolModal";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const RatingModal = dynamic(() => import("./RatingModal"), {
  ssr: false,
  loading: () => null,
});
import clock1 from "@/public/icon/clock1.svg";
import { Tool } from "@/types/tool.types";
import { useToolRatingUpdates } from "@/hooks/useToolRatingUpdates";
import {
  toggleSaveTool,
  removeToolUsage,
  removeSavedTool,
} from "@/services/client/tools-actions.client";
import { useToast } from "@/components/ui/Toast";
import { Tooltip } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedTools } from "@/contexts/SavedToolsContext";
import { normalizeMediaUrl } from "@/utils/image.utils";

interface AIToolCardProps {
  tool: Tool;
  type?: string;
  context?: "used" | "saved" | "default";
  onRemove?: (toolId: string) => void;
  savedToolIds?: string[];
  isMarketing?: boolean;
}
const AIToolCard = ({
  tool,
  type = "tool",
  context = "default",
  onRemove,
  savedToolIds = [],
  isMarketing = false,
}: AIToolCardProps) => {
  const t = useTranslations("AITools");
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();
  const { isToolSaved, toggleSave } = useSavedTools();
  const [openModal, setOpenModal] = useState(false);
  const [openRatingModal, setOpenRatingModal] = useState({
    Open: false,
    start: 0,
  });
  const [currentTool, setCurrentTool] = useState(tool);
  const [saveLoading, setSaveLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  const priceRaw =
    typeof currentTool.price === "string"
      ? currentTool.price
      : (currentTool.price as any)?.name ?? "";
  const priceLabel = priceRaw || t("free");

  // Lấy saved state từ context (global state)
  const isSaved = context === "saved" || isToolSaved(tool.id);
  // isAuthenticated already from useAuth

  // Handle save/unsave tool
  const handleToggleSave = async () => {
    if (saveLoading) return;

    setSaveLoading(true);
    try {
      const isNowSaved = await toggleSave(tool.id);

      if (isNowSaved) {
        toast.success(t("saved"));
      } else {
        toast.success(t("unsaved"));
      }

      // Force re-render by updating currentTool state
      setCurrentTool((prev) => ({ ...prev }));

      // Refresh the page to update UI
      router.refresh();
    } catch (error) {
      toast.error(t("saveError"));
      console.error("Save tool error:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle remove tool from list
  const handleRemoveTool = async () => {
    if (!onRemove) return;

    try {
      if (context === "used") {
        await removeToolUsage(tool.id);
        toast.success(t("removedFromUsed"));
      } else if (context === "saved") {
        await removeSavedTool(tool.id);
        toast.success(t("removedFromSaved"));
      }

      // Call onRemove callback to refresh parent component
      onRemove(tool.id);
      router.refresh();
    } catch (error) {
      toast.error(t("removeError"));
      console.error("Remove tool error:", error);
    }
  }; // Listen for real-time rating updates
  useToolRatingUpdates({
    onRatingUpdate: (data) => {
      if (data.toolId === tool.id) {
        setCurrentTool((prev) => ({
          ...prev,
          avgRating: data.newAvgRating,
          useCount: data.newRatingsCount, // Assuming useCount represents ratings count
        }));
      }
    },
  });
  const getStatusColor = (price: string) => {
    const normalized = (price || "").toString().toUpperCase();
    return normalized.includes("PAID")
      ? "text-green-400"
      : "text-yellow-400";
  };

  return (
    <>
      {/* Mobile Card Layout - For Top Rated Tools */}
      {type !== "gallery" && (
        <div
          className="sm:hidden flex items-center gap-3 p-4 rounded-lg bg-[#1E293B]/50 border border-[#9FF3DF]/30 hover:border-cyan-500/50 transition-all cursor-pointer min-w-[280px] flex-shrink-0"
          onClick={() => setOpenModal(true)}
        >
          {/* Icon */}
          <div className="flex-shrink-0">
            {(!currentTool.logoUrl || imageError) ? (
              <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Package className="w-10 h-10 text-cyan-400" />
              </div>
            ) : (
              isMarketing ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={normalizeMediaUrl(currentTool.logoUrl)}
                  alt={currentTool.name}
                  className="rounded-lg object-cover w-20 h-20"
                  style={{ objectFit: "cover" }}
                  onError={() => setImageError(true)}
                />
              ) : (
                <Image
                  src={normalizeMediaUrl(currentTool.logoUrl)}
                  alt={currentTool.name}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover w-20 h-20"
                  style={{ objectFit: "cover" }}
                  onError={() => setImageError(true)}
                />
              )
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white text-sm sm:text-base font-semibold truncate">
              {currentTool.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <div className="flex items-center gap-0.5">
                <Star className="fill-yellow-400 text-yellow-400 w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-yellow-400 text-xs font-semibold">
                  {Number(currentTool.avgRating).toFixed(1)}
                </span>
              </div>
              <span
                className={`text-xs font-medium whitespace-nowrap ${getStatusColor(
                  priceRaw
                )}`}
              >
                {priceLabel}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (tool.homepageUrl) {
                  window.open(tool.homepageUrl, "_blank");
                }
              }}
              className="text-gray-400 hover:text-cyan-400 transition-colors p-1"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // More options menu could go here
              }}
              className="text-gray-400 hover:text-cyan-400 transition-colors p-1"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile List Layout - Only for gallery type on mobile */}
      {type === "gallery" && (
        <div
          className="sm:hidden flex items-center gap-4 p-4 rounded-lg bg-[#1E293B]/50 border border-[#414651] hover:border-cyan-500/50 transition-all cursor-pointer"
          onClick={() => setOpenModal(true)}
        >
          {/* Icon */}
          <div className="flex-shrink-0">
            {(!currentTool.logoUrl || imageError) ? (
              <div className="w-[92px] h-[92px] rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Package className="w-11 h-11 text-cyan-400" />
              </div>
            ) : (
              isMarketing ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={normalizeMediaUrl(currentTool.logoUrl)}
                  alt={currentTool.name}
                  className="rounded-lg object-cover w-[92px] h-[92px]"
                  style={{ objectFit: "cover" }}
                  onError={() => setImageError(true)}
                />
              ) : (
                <Image
                  src={normalizeMediaUrl(currentTool.logoUrl)}
                  alt={currentTool.name}
                  width={88}
                  height={88}
                  className="rounded-lg object-cover w-[92px] h-[92px]"
                  style={{ objectFit: "cover" }}
                  onError={() => setImageError(true)}
                />
              )
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white text-sm sm:text-base font-semibold truncate">
              {currentTool.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex items-center gap-0.5">
                <Star className="fill-yellow-400 text-yellow-400 w-3.5 h-3.5" />
                <span className="text-yellow-400 text-xs font-semibold">
                  {Number(currentTool.avgRating).toFixed(1)}
                </span>
              </div>
              <span
                className={`text-xs font-medium ${getStatusColor(
                  priceRaw
                )}`}
              >
                {priceLabel}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (tool.homepageUrl) {
                  window.open(tool.homepageUrl, "_blank");
                }
              }}
              className="text-gray-400 hover:text-cyan-400 transition-colors p-1"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // More options menu could go here
              }}
              className="text-gray-400 hover:text-cyan-400 transition-colors p-1"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop/Gallery Card Layout */}
      <div
        key={tool.id}
  className={`${type === "gallery" ? "hidden sm:block" : "hidden sm:block"} 
              p-4 sm:p-5 rounded-2xl 
              transition-all duration-500 ease-out cursor-pointer 
              grid grid-rows-[auto_auto_1fr_auto] h-full min-w-0
              hover:scale-[1.01] hover:shadow-[0_0_24px_rgba(23,239,247,0.4)]
              hover:border hover:border-cyan-400/40
              group`}
        style={{
    background: "#1E293B",
        }}
        onClick={() => setOpenModal(true)}
      >
  {/* Header (row 1) */}
  <div className="flex justify-between items-start mb-3">
    <div className="flex items-center gap-3 min-w-0 flex-1">
          {(!currentTool.logoUrl || imageError) ? (
        <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-[140px] lg:h-[140px] flex-shrink-0 rounded-md bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
          <Package className="w-12 h-12 sm:w-14 sm:h-14 lg:w-[64px] lg:h-[64px] text-cyan-400" />
            </div>
          ) : (
            isMarketing ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={normalizeMediaUrl(currentTool.logoUrl)}
                alt={currentTool.name}
                className="rounded-md w-24 h-24 sm:w-28 sm:h-28 lg:w-[140px] lg:h-[140px] object-cover flex-shrink-0"
                style={{ objectFit: "cover" }}
                onError={() => setImageError(true)}
              />
            ) : (
              <Image
                src={normalizeMediaUrl(currentTool.logoUrl)}
                alt={currentTool.name}
                width={140}
                height={140}
                className="rounded-md w-24 h-24 sm:w-28 sm:h-28 lg:w-[140px] lg:h-[140px] object-cover flex-shrink-0"
                style={{ objectFit: "cover" }}
                onError={() => setImageError(true)}
              />
            )
          )}
      <div className="min-w-0 flex-1">
        <h3 className="text-sm sm:text-base font-semibold text-white truncate">
              {currentTool.name}
            </h3>
        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-400 mt-1">
          <Image src={clock1} alt="reviews" width={12} height={12} className="flex-shrink-0" />
          <span className="truncate">
                {currentTool.useCount} {t("reviews")}
              </span>
            </div>
          </div>
        </div>
    {isAuthenticated && (
        <Bookmark
          size={18}
        className={`cursor-pointer transition flex-shrink-0 ${
          isSaved ? "text-yellow-400 fill-yellow-400" : "text-gray-400 hover:text-yellow-400"
          } ${saveLoading ? "opacity-50" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            handleToggleSave();
          }}
        />
    )}
      </div>

  {/* Rating (row 2) */}
  <div className="flex items-center gap-2 mt-3 flex-wrap">
        <div className="flex cursor-pointer">
          {[...Array(5)].map((_, i) => (
            <Star
              onClick={(e) => {
                e.stopPropagation();
                setOpenRatingModal({ Open: true, start: i });
              }}
              key={i}
          size={14}
              className={
                i < Math.floor(Number(currentTool.avgRating))
                  ? "fill-yellow-400 text-yellow-400 hover:scale-110 transition"
                  : "text-gray-500 hover:text-yellow-300 hover:scale-110 transition"
              }
            />
          ))}
        </div>
    <span className="text-yellow-400 text-xs sm:text-sm font-semibold">
          {Number(currentTool.avgRating).toFixed(1)}
        </span>
    <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-600/30 text-emerald-300 border border-emerald-400/30 whitespace-nowrap">
          {priceLabel}
        </span>
      </div>

  {/* Description (row 3 grows) */}
  <p className="text-gray-300 text-xs sm:text-sm mt-4 line-clamp-3 leading-snug min-h-[3.6em]">
        {currentTool.description}
      </p>

  {/* Button (row 4 sticks to bottom) */}
      {type === "gallery" ? (
        <div className="flex mt-4 items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenModal(true);
            }}
            className="w-full border border-cyan-300/40 text-cyan-300 text-sm py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-300/10 transition cursor-pointer"
          >
            {t("tryNow")} <ArrowRight size={16} />
          </button>

          {(context === "used" || context === "saved") && (
        <Tooltip title={context === "used" ? t("removeFromUsed") : t("removeFromSaved")} placement="bottom">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTool();
                }}
                className="hover:bg-red-300/10 transition cursor-pointer"
              >
                <Image src={bin} alt="remove" width={40} height={40} />
              </button>
            </Tooltip>
          )}
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenModal(true);
          }}
          className="mt-4 w-full border border-cyan-300/40 text-cyan-300 text-sm py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-300/10 transition cursor-pointer"
        >
          {t("tryNow")} <ArrowRight size={16} />
        </button>
      )}
</div>

      {/* Modals - Render outside of card layouts */}
        {isMarketing ? (
          <MarketingToolModal open={openModal} onClose={() => setOpenModal(false)} tool={tool} toolId={tool.id} />
        ) : (
          <AIToolModal open={openModal} onClose={() => setOpenModal(false)} data={tool} />
        )}
      <RatingModal
        open={openRatingModal.Open}
        onClose={() => setOpenRatingModal({ Open: false, start: 0 })}
        tool={tool}
        start={openRatingModal.start}
        onRatingSuccess={() => {}}
        onRatingUpdate={(newAvgRating, newRatingsCount) => {
          setCurrentTool((prev) => ({ ...prev, avgRating: newAvgRating, ratingsCount: newRatingsCount }));
        }}
      />
    </>
  );
};

export default AIToolCard;
