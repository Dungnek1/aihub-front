"use client";

import Image from "next/image";
import { normalizeMediaUrl } from "@/utils/image.utils";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Bookmark, Star, Megaphone, X, Check, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Tool } from "@/types/tool.types";
import { createPortal } from "react-dom";
import { sanitizeNewsHtml } from "@/utils/sanitize.utils";
import {
  getSimilarTools,
  getMarketingToolById,
  getMarketingToolRatings,
  type RatingStats as ApiRatingStats,
} from "@/services/client/tools.client";
import { useToolRatingUpdates } from "@/hooks/useToolRatingUpdates";
import MarketingToolRatingModal from "./MarketingToolRatingModal";

interface MarketingToolModalProps {
  open: boolean;
  onClose: () => void;
  tool: Tool;
  toolId?: string; // Optional: if provided, will fetch fresh data from API
}

interface RatingStats {
  avgRating: number;
  totalRatings: number;
  ratingDistribution: {
    oneStar: number;
    twoStars: number;
    threeStars: number;
    fourStars: number;
    fiveStars: number;
  };
  percentages: {
    oneStar: string;
    twoStars: string;
    threeStars: string;
    fourStars: string;
    fiveStars: string;
  };
}

// Helper function to convert API RatingStats to component RatingStats
function convertRatingStats(apiStats: ApiRatingStats | null): RatingStats | null {
  if (!apiStats) return null;
  
  if ('avgRating' in apiStats && 'ratingDistribution' in apiStats) {
    return apiStats as unknown as RatingStats;
  }
  
  const distribution = apiStats.distribution || {};
  const percentages = apiStats.percentages || {};
  
  return {
    avgRating: 0,
    totalRatings: apiStats.total || 0,
    ratingDistribution: {
      oneStar: distribution[1] || 0,
      twoStars: distribution[2] || 0,
      threeStars: distribution[3] || 0,
      fourStars: distribution[4] || 0,
      fiveStars: distribution[5] || 0,
    },
    percentages: {
      oneStar: String(percentages[1] || 0),
      twoStars: String(percentages[2] || 0),
      threeStars: String(percentages[3] || 0),
      fourStars: String(percentages[4] || 0),
      fiveStars: String(percentages[5] || 0),
    },
  };
}

export default function MarketingToolModal({ open, onClose, tool, toolId }: MarketingToolModalProps) {
  const t = useTranslations("AITools");
  // Normalize tool prop on initial state to ensure logoUrl is set from coverImageLink
  const normalizedInitialTool: Tool = tool.logoUrl 
    ? tool 
    : { ...tool, logoUrl: (tool as any).coverImageLink || tool.logoUrl || "" };
  const [currentTool, setCurrentTool] = useState<Tool | null>(normalizedInitialTool);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [similarTools, setSimilarTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [similarImageErrors, setSimilarImageErrors] = useState<Record<string, boolean>>({});
  const [openRatingModal, setOpenRatingModal] = useState({
    open: false,
    start: 0,
  });

  // Real-time rating updates
  useToolRatingUpdates({
    onRatingUpdate: (updateData) => {
      if (updateData.toolId === currentTool?.id) {
        if (ratingStats) {
          setRatingStats((prev) =>
            prev
              ? {
                  ...prev,
                  avgRating: updateData.newAvgRating,
                  totalRatings: updateData.newRatingsCount,
                }
              : null
          );
        }
      }
    },
  });

  // Fetch tool details if toolId is provided, but only if tool prop doesn't have full data
  useEffect(() => {
    if (!open) return;

    // Normalize tool prop first
    const normalizedTool: Tool = tool.logoUrl 
      ? tool 
      : { ...tool, logoUrl: (tool as any).coverImageLink || tool.logoUrl || "" };
    
    // Check if tool has full data (bodyHtml indicates full data)
    const hasFullData = normalizedTool.bodyHtml || (normalizedTool as any).bodyHtml;

    if (toolId && !hasFullData) {
      // Only fetch if we don't have full data
      setLoading(true);
      setImageError(false);
      getMarketingToolById(toolId)
        .then((data) => {
          if (data) {
            setCurrentTool(data);
          } else {
            // Fallback to provided tool if API fails
            console.warn("[MarketingToolModal] API fetch failed, using provided tool prop");
            setCurrentTool(normalizedTool);
          }
        })
        .catch((error) => {
          console.error("[MarketingToolModal] Failed to fetch marketing tool:", error);
          // Fallback to provided tool if API fails
          setCurrentTool(normalizedTool);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Use provided tool prop directly (either no toolId or already has full data)
      setCurrentTool(normalizedTool);
      setLoading(false);
    }
  }, [open, toolId, tool]);

  useEffect(() => {
    if (open && currentTool?.id) {
      setImageError(false);
      setSimilarImageErrors({});
      Promise.all([
        getMarketingToolRatings(currentTool.id),
        getSimilarTools(
          currentTool.price || "",
          currentTool.audiences?.[0]?.name || "",
          0,
          2,
          currentTool.id
        ),
      ])
        .then(([stats, similar]) => {
          if (stats) {
            const convertedStats = convertRatingStats(stats);
            if (convertedStats) {
              setRatingStats({
                ...convertedStats,
                avgRating: convertedStats.avgRating || parseFloat(String(currentTool?.avgRating || 0)),
              });
            }
          }
          if (similar) setSimilarTools(similar);
        })
        .catch((error) => {
          console.error("Failed to fetch rating stats or similar tools:", error);
        });
    }
  }, [open, currentTool?.id]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;

      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        document.body.style.overflow = originalOverflow;
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  // Add custom scrollbar styles
  useEffect(() => {
    if (!open) return;
    
    const style = document.createElement('style');
    style.setAttribute('data-marketing-modal-scrollbar', 'true');
    style.textContent = `
      .marketing-modal-scrollbar::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      .marketing-modal-scrollbar::-webkit-scrollbar-track {
        background: rgba(30, 41, 59, 0.3);
        border-radius: 4px;
      }
      .marketing-modal-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(6, 182, 212, 0.5);
        border-radius: 4px;
        transition: background 0.2s;
      }
      .marketing-modal-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(6, 182, 212, 0.7);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.head.querySelector('style[data-marketing-modal-scrollbar="true"]');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, [open]);

  if (typeof window === "undefined") {
    return null;
  }

  if (!open) {
    return null;
  }

  if (loading && !currentTool) {
    return (
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  if (!currentTool) {
    return null;
  }

  const avgRating =
    (ratingStats?.avgRating && ratingStats.avgRating > 0)
      ? ratingStats.avgRating
      : (currentTool?.avgRating && parseFloat(String(currentTool.avgRating)) > 0)
      ? parseFloat(String(currentTool.avgRating))
      : 5; // Default to 5 if no rating
  const ratingsCount = ratingStats?.totalRatings || currentTool?.ratingsCount || 0;

  const modalContent = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm sm:flex sm:items-center sm:justify-center"
            onClick={onClose}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onClose();
              }
            }}
          >
            {/* Desktop Modal */}
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="hidden sm:block bg-[#181D27] text-white rounded-2xl p-6 sm:p-8 md:p-10 sm:w-[600px] md:w-[700px] lg:w-[900px] max-h-[90vh] overflow-y-auto overscroll-contain touch-pan-y border border-cyan-400/30 shadow-[0_0_16px_rgba(23,239,247,0.3)] marketing-modal-scrollbar"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(6, 182, 212, 0.5) transparent',
                touchAction: 'pan-y',
                WebkitOverflowScrolling: 'touch',
              }}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {/* Desktop Header */}
              <div className="flex flex-col items-center mb-8">
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden mb-4 border border-cyan-400/30">
                          {(!currentTool.logoUrl || imageError) ? (
                            <div className="w-full h-full bg-gray-700/50 border border-gray-600/50 flex items-center justify-center">
                              <Megaphone className="w-12 h-12 md:w-14 md:h-14 text-gray-400" />
                            </div>
                          ) : (
                            <Image
                              src={normalizeMediaUrl(currentTool.logoUrl)}
                              alt={currentTool.name}
                              width={112}
                              height={112}
                              className="w-full h-full object-cover"
                              style={{ objectFit: "cover" }}
                              onError={() => setImageError(true)}
                            />
                          )}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-center">{currentTool.name}</h2>
                        <p className="text-white/80 text-base md:text-lg text-center max-w-2xl">
                          {currentTool.description}
                        </p>
              </div>

              {/* Desktop Stats */}
              <div className="grid grid-cols-3 text-center mb-8 gap-4">
                <div>
                  <p className="text-2xl md:text-3xl font-semibold">
                    {avgRating.toFixed(1)}
                  </p>
                  <p className="text-gray-400 text-sm md:text-base mt-1">
                    {t("ratingCount")} ({ratingsCount}+)
                  </p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-semibold">{ratingsCount}</p>
                  <p className="text-gray-400 text-sm md:text-base mt-1">{t("reviews")}</p>
                </div>
                        <div>
                          <p className="text-2xl md:text-3xl font-semibold">{currentTool.useCount || 0}</p>
                          <p className="text-gray-400 text-sm md:text-base mt-1">{t("conversations")}</p>
                        </div>
              </div>

                      {/* Desktop Body HTML */}
                      <div
                        className="text-white text-base md:text-lg space-y-4 p-4 mb-8"
                      >
                        {currentTool?.bodyHtml ? (
                          <div
                            className="prose prose-invert max-w-none prose-lg md:prose-xl"
                            dangerouslySetInnerHTML={{ __html: sanitizeNewsHtml(currentTool.bodyHtml) }}
                          />
                        ) : currentTool?.description && currentTool.description !== currentTool.shortDesc ? (
                          <p className="text-gray-300 whitespace-pre-wrap">{currentTool.description}</p>
                        ) : (
                          <p className="text-gray-400">{t("noDetails")}</p>
                        )}
                      </div>

                      {/* Desktop Conversation Starters */}
              {currentTool.conversationStarters && currentTool.conversationStarters.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="block w-[3px] h-6 bg-primary-cyan"></div>
                    <h3 className="text-lg md:text-xl font-semibold">{t("conversationStarters")}</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {currentTool.conversationStarters.map((starter, idx) => (
                      <button
                        key={idx}
                        className="px-4 py-2 rounded-lg bg-[#1E293B]/50 border border-gray-600 text-white text-sm md:text-base hover:border-cyan-500/50 transition-colors cursor-pointer"
                      >
                        {starter}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Desktop Usage Instructions */}
              {currentTool.usageInstructions && currentTool.usageInstructions.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="block w-[3px] h-6 bg-primary-cyan"></div>
                    <h3 className="text-lg md:text-xl font-semibold">{t("usageInstructions")}</h3>
                  </div>
                  <div className="space-y-3">
                    {currentTool.usageInstructions.map((instruction, idx) => (
                      <div key={idx} className="text-gray-300 text-sm md:text-base">
                        {instruction}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Desktop Capabilities */}
              {currentTool.capabilities && currentTool.capabilities.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="block w-[3px] h-6 bg-primary-cyan"></div>
                    <h3 className="text-lg md:text-xl font-semibold">{t("capabilities")}</h3>
                  </div>
                  <div className="space-y-3">
                    {currentTool.capabilities.map((capability, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-gray-300 text-sm md:text-base">
                        <Check className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 flex-shrink-0" />
                        <span>{capability}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                      {/* Desktop Rating */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="block w-[3px] h-6 bg-primary-cyan"></div>
                  <h3 className="text-lg md:text-xl font-semibold">{t("userRatings")}</h3>
                </div>
                {ratingStats ? (
                  <>
                    <div className="flex items-center gap-2">
                      <p className="text-4xl font-bold">
                        {ratingStats.avgRating.toFixed(1)}
                      </p>
                      <div>
                    <div className="flex cursor-pointer">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={`star-${i}`}
                          size={16}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenRatingModal({ open: true, start: i });
                          }}
                          className={
                            i < Math.floor(ratingStats.avgRating)
                              ? "fill-yellow-400 text-yellow-400 hover:scale-110 transition pointer-events-auto"
                              : "text-gray-500 hover:text-yellow-300 hover:scale-110 transition pointer-events-auto"
                          }
                        />
                      ))}
                    </div>
                        <p className="text-sm text-gray-400">
                          {t("averageRating")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const hasNoRatings = ratingStats.totalRatings === 0;
                        const width = hasNoRatings
                          ? star === 5 ? "100%" : "0%"
                          : `${
                              star === 5
                                ? ratingStats.percentages.fiveStars
                                : star === 4
                                ? ratingStats.percentages.fourStars
                                : star === 3
                                ? ratingStats.percentages.threeStars
                                : star === 2
                                ? ratingStats.percentages.twoStars
                                : ratingStats.percentages.oneStar
                            }%`;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <span className="text-sm">{star}</span>
                              <Star size={12} className="fill-white text-white" />
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-[#56E3E1] h-2 rounded-full"
                                style={{
                                  width,
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <p className="text-4xl font-bold">
                        {avgRating.toFixed(1)}
                      </p>
                      <div>
                        <div className="flex cursor-pointer">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={`star-${i}`}
                              size={16}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenRatingModal({ open: true, start: i });
                              }}
                              className={
                                i < Math.floor(avgRating)
                                  ? "fill-yellow-400 text-yellow-400 hover:scale-110 transition pointer-events-auto"
                                  : "text-gray-500 hover:text-yellow-300 hover:scale-110 transition pointer-events-auto"
                              }
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-400">
                          {t("averageRating")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{star}</span>
                            <Star size={12} className="fill-white text-white" />
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-[#56E3E1] h-2 rounded-full"
                              style={{
                                width: star === 5 ? "100%" : "0%",
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Desktop Similar Tools */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="block w-[3px] h-6 bg-primary-cyan"></div>
                  <h3 className="text-lg md:text-xl font-semibold">{t("similarTools")}</h3>
                </div>
                {loading ? (
                  <div className="text-gray-400 text-sm">{t("loadingSimilar")}</div>
                ) : similarTools.length > 0 ? (
                  <div className="space-y-2">
                    {similarTools.map((similarTool) => (
                      <div
                        key={similarTool.id}
                        className="flex items-center gap-2 bg-linear-to-b from-[#1E293B] to-[#1E293B]/50 rounded-xl px-2 py-3"
                      >
                        {(!similarTool.logoUrl || similarImageErrors[similarTool.id]) ? (
                          <div className="w-20 h-20 rounded-md bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                            <Package className="w-10 h-10 text-cyan-400" />
                          </div>
                        ) : (
                          <Image
                            src={normalizeMediaUrl(similarTool.logoUrl)}
                            alt={similarTool.name}
                            width={80}
                            height={80}
                            className="w-20 h-20 rounded-md object-cover flex-shrink-0"
                            style={{ objectFit: "cover" }}
                            onError={() => setSimilarImageErrors(prev => ({ ...prev, [similarTool.id]: true }))}
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">{similarTool.name}</p>
                            <div className="flex items-center text-[#FAC515] text-sm gap-1">
                              <Star
                                size={12}
                                className="fill-yellow-400 text-yellow-400"
                              />
                              <span>
                                {parseFloat(String(similarTool.avgRating || 0)).toFixed(1)}
                              </span>
                            </div>
                            <p className="text-sm text-[#D5D7DA]">
                              {similarTool.ratingsCount} {t("reviews")}
                            </p>
                            <Bookmark
                              className="text-yellow-400 cursor-pointer transition hover:scale-110"
                              size={20}
                            />
                          </div>
                          <p className="text-sm text-[#D5D7DA] line-clamp-1">
                            {similarTool.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">{t("noSimilarTools")}</div>
                )}
              </div>

                      {/* Desktop Button */}
                      <button
                        className="flex items-center justify-center gap-2 w-full py-2 mt-4 rounded-full bg-white text-gray-800 font-semibold hover:bg-gray-100 transition cursor-pointer"
                        onClick={() => {
                          if (currentTool.homepageUrl) {
                            window.open(currentTool.homepageUrl, "_blank");
                          }
                          onClose();
                        }}
                      >
                        {t("tryNow")}
                        <ArrowRight />
                      </button>
            </motion.div>

            {/* Mobile Full-Page Modal */}
            <motion.div
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  onClose();
                }
              }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="sm:hidden fixed inset-0 w-full h-full bg-[#0b0d11]/95 backdrop-blur-sm z-[9999] flex flex-col overflow-y-auto overscroll-contain touch-pan-y marketing-modal-scrollbar"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(6, 182, 212, 0.5) transparent',
                touchAction: 'pan-y',
                WebkitOverflowScrolling: 'touch',
              }}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {/* Mobile Header */}
              <div className="flex-shrink-0 bg-[#0b0d11] px-4 py-4 flex items-center justify-between border-b border-gray-700 sticky top-0 z-10">
                <h2 className="text-white text-lg font-semibold">
                  {currentTool.name}
                </h2>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-300 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Content */}
              <div 
                className="flex-1 px-4 py-6 space-y-6 bg-[#0b0d11]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Tool Overview */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border border-cyan-400/30">
                    {(!currentTool.logoUrl || imageError) ? (
                      <div className="w-full h-full bg-gray-700/50 border border-gray-600/50 flex items-center justify-center">
                        <Megaphone className="w-8 h-8 text-gray-400" />
                      </div>
                    ) : (
                      <Image
                        src={normalizeMediaUrl(currentTool.logoUrl)}
                        alt={currentTool.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        style={{ objectFit: "cover" }}
                        onError={() => setImageError(true)}
                      />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-center">{currentTool.name}</h3>
                  <p className="text-white/80 text-sm text-center">{currentTool.description}</p>
                </div>

                {/* Mobile Stats */}
                <div className="grid grid-cols-3 text-center gap-4">
                  <div>
                    <p className="text-2xl font-semibold">
                      {avgRating.toFixed(1)}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">Rating</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{ratingsCount}</p>
                    <p className="text-gray-400 text-xs mt-1">{t("reviews")}</p>
                  </div>
                          <div>
                            <p className="text-2xl font-semibold">{currentTool.useCount || 0}</p>
                            <p className="text-gray-400 text-xs mt-1">{t("conversations")}</p>
                          </div>
                </div>

                        {/* Mobile Body HTML */}
                        <div className="text-white text-sm space-y-4">
                          {currentTool?.bodyHtml ? (
                            <div
                              className="prose prose-invert max-w-none prose-sm"
                              dangerouslySetInnerHTML={{ __html: sanitizeNewsHtml(currentTool.bodyHtml) }}
                            />
                          ) : currentTool?.description && currentTool.description !== currentTool.shortDesc ? (
                            <p className="text-gray-300 whitespace-pre-wrap">{currentTool.description}</p>
                          ) : (
                            <p className="text-gray-400">{t("noDetails")}</p>
                          )}
                        </div>

                {/* Mobile Conversation Starters */}
                {currentTool.conversationStarters && currentTool.conversationStarters.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="block w-[3px] h-5 bg-primary-cyan"></div>
                      <h3 className="text-base font-semibold">{t("conversationStarters")}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentTool.conversationStarters.map((starter, idx) => (
                        <button
                          key={idx}
                          className="px-3 py-1.5 rounded-lg bg-[#1E293B]/50 border border-gray-600 text-white text-xs hover:border-cyan-500/50 transition-colors"
                        >
                          {starter}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile Usage Instructions */}
                {currentTool.usageInstructions && currentTool.usageInstructions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="block w-[3px] h-5 bg-primary-cyan"></div>
                      <h3 className="text-base font-semibold">{t("usageInstructions")}</h3>
                    </div>
                    <div className="space-y-2">
                      {currentTool.usageInstructions.map((instruction, idx) => (
                        <div key={idx} className="text-gray-300 text-xs">
                          {instruction}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile Capabilities */}
                {currentTool.capabilities && currentTool.capabilities.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="block w-[3px] h-5 bg-primary-cyan"></div>
                      <h3 className="text-base font-semibold">{t("capabilities")}</h3>
                    </div>
                    <div className="space-y-2">
                      {currentTool.capabilities.map((capability, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-gray-300 text-xs">
                          <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                          <span>{capability}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile Rating */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="block w-[3px] h-5 bg-primary-cyan"></div>
                    <h3 className="text-base font-semibold">{t("userRatings")}</h3>
                  </div>
                  {ratingStats ? (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <p className="text-3xl font-bold">
                          {ratingStats.avgRating.toFixed(1)}
                        </p>
                        <div>
                          <div className="flex cursor-pointer">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={`star-${i}`}
                                size={14}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenRatingModal({ open: true, start: i });
                                }}
                                className={
                                  i < Math.floor(ratingStats.avgRating)
                                    ? "fill-yellow-400 text-yellow-400 hover:scale-110 transition pointer-events-auto"
                                    : "text-gray-500 hover:text-yellow-300 hover:scale-110 transition pointer-events-auto"
                                }
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-400">
                            {t("averageRating")}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const hasNoRatings = ratingStats.totalRatings === 0;
                          const width = hasNoRatings
                            ? star === 5 ? "100%" : "0%"
                            : `${
                                star === 5
                                  ? ratingStats.percentages.fiveStars
                                  : star === 4
                                  ? ratingStats.percentages.fourStars
                                  : star === 3
                                  ? ratingStats.percentages.threeStars
                                  : star === 2
                                  ? ratingStats.percentages.twoStars
                                  : ratingStats.percentages.oneStar
                              }%`;
                          return (
                            <div key={star} className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <span className="text-xs">{star}</span>
                                <Star size={10} className="fill-white text-white" />
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-[#56E3E1] h-1.5 rounded-full"
                                  style={{
                                    width,
                                  }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <p className="text-3xl font-bold">
                          {avgRating.toFixed(1)}
                        </p>
                        <div>
                          <div className="flex cursor-pointer">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={`star-${i}`}
                                size={14}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenRatingModal({ open: true, start: i });
                                }}
                                className={
                                  i < Math.floor(avgRating)
                                    ? "fill-yellow-400 text-yellow-400 hover:scale-110 transition pointer-events-auto"
                                    : "text-gray-500 hover:text-yellow-300 hover:scale-110 transition pointer-events-auto"
                                }
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-400">
                            {t("averageRating")}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {[5, 4, 3, 2, 1].map((star) => (
                          <div key={star} className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <span className="text-xs">{star}</span>
                              <Star size={10} className="fill-white text-white" />
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#56E3E1] h-1.5 rounded-full"
                                style={{
                                  width: star === 5 ? "100%" : "0%",
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile Similar Tools */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="block w-[3px] h-5 bg-primary-cyan"></div>
                    <h3 className="text-base font-semibold">{t("similarTools")}</h3>
                  </div>
                  {loading ? (
                    <div className="text-gray-400 text-xs">{t("loadingSimilar")}</div>
                  ) : similarTools.length > 0 ? (
                    <div className="space-y-2">
                      {similarTools.map((similarTool) => (
                        <div
                          key={similarTool.id}
                          className="flex items-center gap-2 bg-[#1E293B]/50 rounded-lg px-2 py-2"
                        >
                          {(!similarTool.logoUrl || similarImageErrors[similarTool.id]) ? (
                            <div className="w-16 h-16 rounded-md bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                              <Package className="w-8 h-8 text-cyan-400" />
                            </div>
                          ) : (
                            <Image
                              src={normalizeMediaUrl(similarTool.logoUrl)}
                              alt={similarTool.name}
                              width={64}
                              height={64}
                              className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                              style={{ objectFit: "cover" }}
                              onError={() => setSimilarImageErrors(prev => ({ ...prev, [similarTool.id]: true }))}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold truncate">{similarTool.name}</p>
                              <div className="flex items-center text-[#FAC515] text-xs gap-0.5">
                                <Star
                                  size={10}
                                  className="fill-yellow-400 text-yellow-400"
                                />
                                <span>
                                  {parseFloat(String(similarTool.avgRating || 0)).toFixed(1)}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-[#D5D7DA] line-clamp-1">
                              {similarTool.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-xs">{t("noSimilarTools")}</div>
                  )}
                </div>

                        {/* Mobile Button */}
                        <button
                          className="flex items-center justify-center gap-2 w-full py-3 mt-4 rounded-full bg-white text-gray-800 font-semibold hover:bg-gray-100 transition cursor-pointer"
                          onClick={() => {
                            if (currentTool.homepageUrl) {
                              window.open(currentTool.homepageUrl, "_blank");
                            }
                            onClose();
                          }}
                        >
                          {t("tryNow")}
                          <ArrowRight size={18} />
                        </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(
    <>
      {modalContent}
      {currentTool && (
        <MarketingToolRatingModal
          open={openRatingModal.open}
          onClose={() => setOpenRatingModal({ open: false, start: 0 })}
          tool={currentTool}
          start={openRatingModal.start}
          onRatingSuccess={() => {
            if (currentTool.id) {
              getMarketingToolRatings(currentTool.id)
                .then((stats) => {
                  if (stats) {
                    const convertedStats = convertRatingStats(stats);
                    if (convertedStats) {
                      setRatingStats({
                        ...convertedStats,
                        avgRating: convertedStats.avgRating || parseFloat(String(currentTool?.avgRating || 0)),
                      });
                    }
                  }
                })
                .catch(console.error);
            }
          }}
          onRatingUpdate={(newAvgRating, newRatingsCount) => {
            if (ratingStats) {
              setRatingStats((prev) =>
                prev
                  ? {
                      ...prev,
                      avgRating: newAvgRating,
                      totalRatings: newRatingsCount,
                    }
                  : null
              );
            }
            setCurrentTool((prev) =>
              prev
                ? {
                    ...prev,
                    avgRating: newAvgRating,
                    ratingsCount: newRatingsCount,
                  }
                : null
            );
          }}
        />
      )}
    </>,
    document.body
  );
}
