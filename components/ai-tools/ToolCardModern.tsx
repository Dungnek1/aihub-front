import Image, { StaticImageData } from "next/image";
import { Star, Bookmark, Package } from "lucide-react";
import { Tool } from "@/types/tool.types";
import { useState, useEffect } from "react";
import { useToolRatingUpdates } from "@/hooks/useToolRatingUpdates";
import { toggleSaveTool } from "@/services/client/tools-actions.client";
import { useToast } from "@/components/ui/Toast";
import { Tooltip } from "antd";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import AIToolModal from "./AIToolModal";
import MarketingToolModal from "@/components/marketing/MarketingToolModal";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedTools } from "@/contexts/SavedToolsContext";
import { normalizeMediaUrl } from "@/utils/image.utils";

interface ToolCardModernProps {
  tool: Tool;
  context?: "used" | "saved" | "default";
  onRemove?: (toolId: string) => void;
  savedToolIds?: string[];
  avatarShape?: "round" | "square";
  isMarketing?: boolean;
}

const ToolCardModern = ({
  tool,
  context = "default",
  onRemove,
  savedToolIds = [],
  avatarShape = "round",
  isMarketing = false,
}: ToolCardModernProps) => {
  const t = useTranslations("AITools");
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();
  const { isToolSaved, toggleSave } = useSavedTools();
  const [currentTool, setCurrentTool] = useState(tool);
  const [saveLoading, setSaveLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  const priceRaw =
    typeof currentTool.price === "string"
      ? currentTool.price
      : (currentTool.price as any)?.name ?? "";
  const priceLabel = priceRaw || t("free");
  const avgRating =
    typeof currentTool.avgRating === "number" && currentTool.avgRating > 0
      ? currentTool.avgRating
      : 5;
  const reviewsCount =
    currentTool.useCount ?? currentTool.ratingsCount ?? 0;
  
  // Lấy saved state từ context (global state)
  const isSaved = context === "saved" || isToolSaved(tool.id);
  // isAuthenticated already from useAuth

  // Handle save/unsave tool
  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering card click
    if (saveLoading) return;

    setSaveLoading(true);
    try {
      const isNowSaved = await toggleSave(tool.id);

      if (isNowSaved) {
        toast.success(t("saved"));
      } else {
        toast.success(t("unsaved"));
      }

      // Refresh page để update UI
      router.refresh();
    } catch (error) {
      toast.error(t("saveError"));
      console.error("Save tool error:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle card click to open modal
  const handleCardClick = () => {
    setOpenModal(true);
  };

  // Real-time rating updates
  useToolRatingUpdates({
    onRatingUpdate: (data) => {
      if (data.toolId === tool.id) {
        setCurrentTool((prev) => ({
          ...prev,
          avgRating: data.newAvgRating,
          useCount: data.newRatingsCount,
        }));
      }
    },
  });
  return (
    <>
      {/* Desktop Layout - Horizontal */}
      <div
        key={tool.id}
        className={`hidden sm:flex items-start gap-5 rounded-2xl border transition-all duration-300 hover:shadow-[0_0_24px_rgba(23,239,247,0.3)] cursor-pointer ${
          avatarShape === "square" ? "p-5 lg:p-6" : "p-4"
        } h-full`}
        style={{
          borderColor: "#243B55",
          background: "#1E293B",
          minHeight: avatarShape === "square" ? 240 : undefined,
        }}
        onClick={handleCardClick}
      >
        {/* Image + Status */}
        <div className={`relative ${avatarShape === "square" ? "rounded-md overflow-hidden" : ""}`}>
          {(!tool.logoUrl || imageError) ? (
            <div className={`${avatarShape === "square" ? "w-[160px] h-[160px] lg:w-[180px] lg:h-[180px]" : "w-[120px] h-[120px]"} ${avatarShape === "round" ? "rounded-full" : "rounded-md"} bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0`}>
              <Package className={`${avatarShape === "square" ? "w-[64px] h-[64px] lg:w-[72px] lg:h-[72px]" : "w-12 h-12"} text-cyan-400`} />
            </div>
          ) : (
            // Use img tag for marketing tools to avoid Next.js Image optimization issues with backend URLs
            isMarketing ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={normalizeMediaUrl(tool.logoUrl)}
                alt={tool.name}
                className={`${avatarShape === "round" ? "rounded-full" : "rounded-md"} ${avatarShape === "square" ? "w-[160px] h-[160px] lg:w-[180px] lg:h-[180px]" : "w-[120px] h-[120px]"} object-cover`}
                style={{ objectFit: "cover" }}
                onError={(e) => {
                  console.error("[ToolCardModern] Marketing tool image load error:", {
                    src: normalizeMediaUrl(tool.logoUrl),
                    originalLogoUrl: tool.logoUrl,
                    toolId: tool.id,
                    toolName: tool.name,
                  });
                  setImageError(true);
                }}
              />
            ) : (
              <Image
                src={normalizeMediaUrl(tool.logoUrl)}
                alt={tool.name}
                width={avatarShape === "square" ? 180 : 120}
                height={avatarShape === "square" ? 180 : 120}
                className={`${avatarShape === "round" ? "rounded-full" : "rounded-md"} ${avatarShape === "square" ? "w-[160px] h-[160px] lg:w-[180px] lg:h-[180px]" : "w-[120px] h-[120px]"} object-cover`}
                style={{ objectFit: "cover" }}
                unoptimized
                onError={(e) => {
                  console.error("[ToolCardModern] Image load error:", {
                    src: normalizeMediaUrl(tool.logoUrl),
                    originalLogoUrl: tool.logoUrl,
                    toolId: tool.id,
                    toolName: tool.name,
                  });
                  setImageError(true);
                }}
              />
            )
          )}
          <span className={`absolute bottom-3 right-3 ${avatarShape === "square" ? "px-3 py-1 text-xs lg:text-sm" : "px-2 py-0.5 text-xs"} font-medium rounded-2xl text-[#FAC515] bg-[#544D36] border border-[#FDE272]`}>
            {priceLabel}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 text-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3
                className={`${avatarShape === "square" ? "text-lg sm:text-xl lg:text-2xl" : "text-base sm:text-lg"} font-semibold text-white ${
                  avatarShape === "square" ? "line-clamp-2" : "line-clamp-1"
                }`}
              >
                {tool.name}
              </h3>
              <div className={`flex items-center gap-2 ${avatarShape === "square" ? "text-base sm:text-lg" : "text-sm sm:text-base"} mt-2`}>
                <Star className={`${avatarShape === "square" ? "w-5 h-5 lg:w-6 lg:h-6" : "w-5 h-5"} `} style={{ fill: "#FAC515", color: "#FAC515" }} />
                <span className="font-semibold text-[#FAC515]">
                  {Number(avgRating).toFixed(1)}
                </span>
                <span className="text-[#d5d7da]">
                  • {reviewsCount} reviews
                </span>
              </div>
            </div>
            {isAuthenticated && (
              <Tooltip title={t("saveTool")} placement="bottom">
                <Bookmark
                  className={`cursor-pointer transition ${
                    isSaved
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-400 hover:text-yellow-400"
                  } ${saveLoading ? "opacity-50" : ""} ${avatarShape === "square" ? "w-5 h-5 lg:w-6 lg:h-6" : "w-5 h-5"}`}
                  onClick={handleToggleSave}
                />
              </Tooltip>
            )}
          </div>

          <p
            className={`${avatarShape === "square" ? "text-base sm:text-lg" : "text-sm sm:text-base"} text-gray-300 mt-3 leading-relaxed line-clamp-2 min-h-[3.2rem]`}
          >
            {tool.description}
          </p>
        </div>
      </div>

      {/* Mobile Layout - Grid 2 columns */}
      <div
        key={`${tool.id}-mobile`}
        className="sm:hidden flex flex-col rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden"
        style={{
          borderColor: "#243B55",
          background: "#1E293B",
        }}
        onClick={handleCardClick}
      >
        {/* Image + Status */}
        <div className="relative w-full aspect-square">
          {(!tool.logoUrl || imageError) ? (
            <div className="w-full h-full bg-gray-700/50 border-b border-gray-600/50 flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
          ) : (
            <Image
              src={normalizeMediaUrl(tool.logoUrl)}
              alt={tool.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          )}
          <span className="absolute top-2 right-2 px-2.5 py-0.5 text-xs font-medium rounded-2xl text-[#FAC515] bg-[#544D36] border border-[#FDE272]">
            {priceLabel}
          </span>
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col gap-2">
          <h3 className="text-sm sm:text-base font-semibold text-white line-clamp-2">
            {tool.name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs">
              <Star className="w-3.5 h-3.5" style={{ fill: "#FAC515", color: "#FAC515" }} />
              <span className="text-[#FAC515] font-semibold">
                {Number(avgRating).toFixed(1)}
              </span>
              <span className="text-[#d5d7da]">
                {reviewsCount} {t("reviews")}
              </span>
            </div>
            {isAuthenticated && (
              <Tooltip title={t("saveTool")} placement="bottom">
                <Bookmark
                  className={`cursor-pointer transition ${
                    isSaved
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-400 hover:text-yellow-400"
                  } ${saveLoading ? "opacity-50" : ""}`}
                  size={18}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSave(e);
                  }}
                />
              </Tooltip>
            )}
          </div>
        </div>
      </div>

            {isMarketing ? (
              <MarketingToolModal open={openModal} onClose={() => setOpenModal(false)} tool={tool} toolId={tool.id} />
            ) : (
              <AIToolModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                data={tool}
              />
            )}
    </>
  );
};

export default ToolCardModern;
