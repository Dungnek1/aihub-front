import Image, { StaticImageData } from "next/image";
import { normalizeMediaUrl } from "@/utils/image.utils";
import { motion, AnimatePresence } from "framer-motion";
import comment from "@/public/icon/comment.svg";
import { ArrowRight, Bookmark, Star, Package, X, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Tool } from "@/types/tool.types";
import { createPortal } from "react-dom";
import {
  getToolRatingStats,
  getSimilarTools,
  type RatingStats as ApiRatingStats,
} from "@/services/client/tools.client";
import { useToolRatingUpdates } from "@/hooks/useToolRatingUpdates";
import { sanitizeNewsHtml } from "@/utils/sanitize.utils";

interface AIToolModalProps {
  open: boolean;
  onClose: () => void;
  data: Tool;
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
  
  // Check if it's already in the correct format (from backend)
  if ('avgRating' in apiStats && 'ratingDistribution' in apiStats) {
    return apiStats as unknown as RatingStats;
  }
  
  // Convert from old format (distribution/percentages as Record)
  const distribution = apiStats.distribution || {};
  const percentages = apiStats.percentages || {};
  
  return {
    avgRating: 0, // Will be set from data if not available
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

interface SimilarTool {
  img: string | StaticImageData;
  title: string;
  rating: number;
  reviews: string;
  description: string;
}

export default function AIToolModal({ open, onClose, data }: AIToolModalProps) {
  const t = useTranslations("AITools");
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [similarTools, setSimilarTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [similarImageErrors, setSimilarImageErrors] = useState<Record<string, boolean>>({});

  // Real-time rating updates
  useToolRatingUpdates({
    onRatingUpdate: (updateData) => {
      if (updateData.toolId === data?.id) {
        // Update rating stats if available
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

  useEffect(() => {
    if (open && data?.id) {
      setLoading(true);
      setImageError(false);
      setSimilarImageErrors({});
      Promise.all([
        getToolRatingStats(data.id),
        getSimilarTools(
          data.price || "",
          data.audiences?.[0]?.name || "",
          0,
          2,
          data.id
        ),
      ])
        .then(([stats, similar]) => {
          if (stats) {
            const convertedStats = convertRatingStats(stats);
            if (convertedStats) {
              // Merge with avgRating from data if not in stats
              setRatingStats({
                ...convertedStats,
                avgRating: convertedStats.avgRating || parseFloat(String(data?.avgRating || 0)),
              });
            }
          }
          if (similar) setSimilarTools(similar);
        })
        .finally(() => setLoading(false));
    }
  }, [open, data?.id]);

  // Lock body scroll when modal is open (but allow scroll inside modal)
  useEffect(() => {
    if (open) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Lock body scroll
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;
      
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Restore scroll position when modal closes
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!open) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const avgRating =
    ratingStats?.avgRating || parseFloat(String(data?.avgRating || 0));
  const ratingsCount = ratingStats?.totalRatings || data?.ratingsCount || 0;

  // Parse conversation starters from bodyHtml (placeholder for now)
  const conversationStarters: string[] = [];
  // Parse usage instructions from bodyHtml (placeholder for now)
  const usageInstructions: string[] = [];
  // Parse capabilities from bodyHtml (placeholder for now)
  const capabilities: string[] = [];

  // Use portal to render modal outside DOM hierarchy
  if (typeof window === "undefined") {
    return null;
  }

  // Add custom scrollbar styles
  useEffect(() => {
    if (!open) return;
    
    const style = document.createElement('style');
    style.setAttribute('data-modal-scrollbar', 'true');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(30, 41, 59, 0.3);
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(6, 182, 212, 0.5);
        border-radius: 4px;
        transition: background 0.2s;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(6, 182, 212, 0.7);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.head.querySelector('style[data-modal-scrollbar="true"]');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, [open]);

  const modalContent = (
    <AnimatePresence>
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
          className="hidden sm:block bg-[#181D27] text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 sm:w-[90vw] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[900px] max-h-[90vh] overflow-y-auto overscroll-contain touch-pan-y border border-light-green shadow-[0_0_16px_rgba(23,239,247,0.3)] custom-scrollbar"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(6, 182, 212, 0.5) transparent',
            touchAction: 'pan-y',
            WebkitOverflowScrolling: 'touch',
          }}
          onWheel={(e) => {
            // Allow wheel scroll inside modal
            e.stopPropagation();
          }}
          onTouchMove={(e) => {
            // Allow touch scroll inside modal
            e.stopPropagation();
          }}
        >
          {/* Desktop Header */}
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden mb-3 sm:mb-4 border border-light-green">
              {(!data.logoUrl || imageError) ? (
                <div className="w-full h-full bg-gray-700/50 border border-gray-600/50 flex items-center justify-center">
                  <Package className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-gray-400" />
                </div>
              ) : (
                <Image
                  src={normalizeMediaUrl(data.logoUrl)}
                  alt={data.name}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                  style={{ objectFit: "cover" }}
                  onError={() => setImageError(true)}
                />
              )}
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 px-2 text-center">{data.name}</h2>
            <p className="text-white text-sm sm:text-base md:text-lg text-center max-w-2xl px-2">
              {data.description}
            </p>
          </div>

          {/* Desktop Stats */}
          <div className="grid grid-cols-3 text-center mb-6 sm:mb-8 gap-3 sm:gap-4">
            <div>
              <p className="text-xl sm:text-2xl md:text-3xl font-semibold">{avgRating.toFixed(1)}</p>
              <p className="text-gray-400 text-xs sm:text-sm md:text-base mt-1">
                {t("ratingCount")} ({ratingsCount}+)
              </p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl md:text-3xl font-semibold">{ratingsCount}</p>
              <p className="text-gray-400 text-xs sm:text-sm md:text-base mt-1">{t("topRates")}</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl md:text-3xl font-semibold">{data.useCount || 0}</p>
              <p className="text-gray-400 text-xs sm:text-sm md:text-base mt-1">{t("conversations")}</p>
            </div>
          </div>

          {/* Desktop Body HTML */}
          <div
            className="text-white text-sm sm:text-base md:text-lg space-y-3 sm:space-y-4 p-3 sm:p-4 mb-6 sm:mb-8"
          >
            {data?.bodyHtml ? (
              <div
                className="prose prose-invert max-w-none prose-sm sm:prose-base md:prose-lg lg:prose-xl"
                dangerouslySetInnerHTML={{ __html: sanitizeNewsHtml(data.bodyHtml) }}
              />
            ) : (
              <p className="text-gray-400 text-sm sm:text-base">{t("noDetails")}</p>
            )}
          </div>

          {/* Desktop Conversation Starters */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="block w-[3px] h-5 sm:h-6 bg-primary-cyan"></div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold">{t("conversationStarters")}</h3>
            </div>
            {conversationStarters.length > 0 ? (
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {conversationStarters.map((starter, idx) => (
                  <button
                    key={idx}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#1E293B]/50 border border-gray-600 text-white text-xs sm:text-sm md:text-base hover:border-cyan-500/50 transition-colors cursor-pointer"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-xs sm:text-sm md:text-base">{t("noConversationStarters")}</p>
            )}
          </div>

          {/* Desktop Usage Instructions */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="block w-[3px] h-6 bg-primary-cyan"></div>
              <h3 className="text-lg md:text-xl font-semibold">{t("usageInstructions")}</h3>
            </div>
            {usageInstructions.length > 0 ? (
              <div className="space-y-3">
                {usageInstructions.map((instruction, idx) => (
                  <div key={idx} className="text-gray-300 text-sm md:text-base">
                    {instruction}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm md:text-base">{t("noUsageInstructions")}</p>
            )}
          </div>

          {/* Desktop Capabilities */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="block w-[3px] h-6 bg-primary-cyan"></div>
              <h3 className="text-lg md:text-xl font-semibold">{t("capabilities")}</h3>
            </div>
            {capabilities.length > 0 ? (
              <div className="space-y-3">
                {capabilities.map((capability, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-gray-300 text-sm md:text-base">
                    <Check className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 flex-shrink-0" />
                    <span>{capability}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm md:text-base">{t("noCapabilities")}</p>
            )}
          </div>

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
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={`star-${i}`}
                          size={16}
                          className={
                            i < Math.floor(ratingStats.avgRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-500"
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
                            width: `${
                              star === 5
                                ? ratingStats.percentages.fiveStars
                                : star === 4
                                ? ratingStats.percentages.fourStars
                                : star === 3
                                ? ratingStats.percentages.threeStars
                                : star === 2
                                ? ratingStats.percentages.twoStars
                                : ratingStats.percentages.oneStar
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-gray-400 text-sm">{t("loadingRatings")}</div>
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
                {similarTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center gap-2 bg-linear-to-b from-[#1E293B] to-[#1E293B]/50 rounded-xl px-2 py-3"
                  >
                    {(!tool.logoUrl || similarImageErrors[tool.id]) ? (
                      <div className="w-20 h-20 rounded-md bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                        <Package className="w-10 h-10 text-cyan-400" />
                      </div>
                    ) : (
                        <Image
                          src={normalizeMediaUrl(tool.logoUrl)}
                        alt={tool.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-md object-cover flex-shrink-0"
                        style={{ objectFit: "cover" }}
                        onError={() => setSimilarImageErrors(prev => ({ ...prev, [tool.id]: true }))}
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{tool.name}</p>
                        <div className="flex items-center text-[#FAC515] text-sm gap-1">
                          <Star
                            size={12}
                            className="fill-yellow-400 text-yellow-400"
                          />
                          <span>
                            {parseFloat(String(tool.avgRating || 0)).toFixed(1)}
                          </span>
                        </div>
                        <p className="text-sm text-[#D5D7DA]">
                          {tool.ratingsCount} {t("reviews")}
                        </p>
                        <Bookmark
                          className="text-yellow-400 cursor-pointer transition hover:scale-110"
                          size={20}
                        />
                      </div>
                      <p className="text-sm text-[#D5D7DA] line-clamp-1">
                        {tool.description}
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
              if (data.homepageUrl) {
                window.open(data.homepageUrl, "_blank");
              }
              onClose();
            }}
          >
            Try Now
            <ArrowRight />
          </button>
        </motion.div>

        {/* Mobile Full-Page Modal */}
        <motion.div
          onClick={(e) => {
            // Chỉ đóng khi click vào backdrop (không phải content)
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="sm:hidden fixed inset-0 w-full h-full bg-[#0b0d11]/95 backdrop-blur-sm z-[9999] flex flex-col overflow-y-auto overscroll-contain touch-pan-y custom-scrollbar"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(6, 182, 212, 0.5) transparent',
            touchAction: 'pan-y',
            WebkitOverflowScrolling: 'touch',
          }}
          onWheel={(e) => {
            // Allow wheel scroll inside modal
            e.stopPropagation();
          }}
          onTouchMove={(e) => {
            // Allow touch scroll inside modal
            e.stopPropagation();
          }}
        >
          {/* Mobile Header */}
          <div className="flex-shrink-0 bg-[#0b0d11] px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between border-b border-gray-700 sticky top-0 z-10">
            <h2 className="text-white text-base sm:text-lg font-semibold truncate flex-1 min-w-0 pr-2">{data.name}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Mobile Content */}
          <div 
            className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 bg-[#0b0d11]"
            onClick={(e) => e.stopPropagation()}
          >
            <style>{`
              .scrollbar-hide::-webkit-scrollbar { display: none; }
              .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
            `}</style>
            {/* Tool Overview */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden mb-2 sm:mb-3 border border-[#9FF3DF]/30">
                {(!data.logoUrl || imageError) ? (
                  <div className="w-full h-full bg-gray-700/50 border border-gray-600/50 flex items-center justify-center">
                    <Package className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                ) : (
                    <Image
                      src={normalizeMediaUrl(data.logoUrl)}
                    alt={data.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    style={{ objectFit: "cover" }}
                    onError={() => setImageError(true)}
                  />
                )}
              </div>
              <p className="text-white text-xs sm:text-sm text-center px-2">
                {data.description}
              </p>
            </div>

            {/* Mobile Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div>
                <p className="text-base sm:text-lg font-semibold text-white">{avgRating.toFixed(1)}</p>
                <p className="text-gray-400 text-xs mt-0.5 sm:mt-1">
                  {t("ratingCount")}
                </p>
              </div>
              <div>
                <p className="text-base sm:text-lg font-semibold text-white">{ratingsCount}</p>
                <p className="text-gray-400 text-xs mt-0.5 sm:mt-1">{t("topRates")}</p>
              </div>
              <div>
                <p className="text-base sm:text-lg font-semibold text-white">{data.useCount || 0}</p>
                <p className="text-gray-400 text-xs mt-0.5 sm:mt-1">{t("conversations")}</p>
              </div>
            </div>

            {/* Conversation Starters */}
            <div>
              <div className="flex items-center gap-1 mb-3">
                <div className="block w-[2px] h-5 bg-primary-cyan"></div>
                <h3 className="font-semibold text-white">{t("conversationStarters")}</h3>
              </div>
              {conversationStarters.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {conversationStarters.map((starter, idx) => (
                    <button
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-[#1E293B]/50 border border-gray-600 text-white text-sm hover:border-cyan-500/50 transition-colors"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">{t("noConversationStarters")}</p>
              )}
            </div>

            {/* Usage Instructions */}
            <div>
              <div className="flex items-center gap-1 mb-3">
                <div className="block w-[2px] h-5 bg-primary-cyan"></div>
                <h3 className="font-semibold text-white">{t("usageInstructions")}</h3>
              </div>
              {usageInstructions.length > 0 ? (
                <div className="space-y-2">
                  {usageInstructions.map((instruction, idx) => (
                    <div key={idx} className="text-gray-300 text-sm">
                      {instruction}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">{t("noUsageInstructions")}</p>
              )}
            </div>

            {/* Capabilities */}
            <div>
              <div className="flex items-center gap-1 mb-3">
                <div className="block w-[2px] h-5 bg-primary-cyan"></div>
                <h3 className="font-semibold text-white">{t("capabilities")}</h3>
              </div>
              {capabilities.length > 0 ? (
                <div className="space-y-2">
                  {capabilities.map((capability, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-300 text-sm">
                      <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span>{capability}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">{t("noCapabilities")}</p>
              )}
            </div>

            {/* Mobile User Ratings */}
            <div>
              <div className="flex items-center gap-1 mb-3">
                <div className="block w-[2px] h-5 bg-primary-cyan"></div>
                <h3 className="font-semibold text-white">{t("userRatings")}</h3>
              </div>
              {ratingStats ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <p className="text-3xl font-bold text-white">
                      {ratingStats.avgRating.toFixed(1)}
                    </p>
                    <div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={`star-mobile-${i}`}
                            size={14}
                            className={
                              i < Math.floor(ratingStats.avgRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-500"
                            }
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400">
                        {t("averageRating")}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-2">
                        <div className="flex items-center gap-1 min-w-[40px]">
                          <span className="text-xs text-white">{star}</span>
                          <Star size={10} className="fill-white text-white" />
                        </div>
                        <div className="flex-1 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#56E3E1] h-1.5 rounded-full"
                            style={{
                              width: `${
                                star === 5
                                  ? ratingStats.percentages.fiveStars
                                  : star === 4
                                  ? ratingStats.percentages.fourStars
                                  : star === 3
                                  ? ratingStats.percentages.threeStars
                                  : star === 2
                                  ? ratingStats.percentages.twoStars
                                  : ratingStats.percentages.oneStar
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-gray-400 text-sm">{t("loadingRatings")}</div>
              )}
            </div>

            {/* Mobile Similar Tools - Horizontal Scroll */}
            <div>
              <div className="flex items-center gap-1 mb-3">
                <div className="block w-[2px] h-5 bg-primary-cyan"></div>
                <h3 className="font-semibold text-white">{t("similarTools")}</h3>
              </div>
              {loading ? (
                <div className="text-gray-400 text-sm">{t("loadingSimilar")}</div>
              ) : similarTools.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  {similarTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="flex-shrink-0 w-[200px] bg-[#1E293B]/50 rounded-xl p-3 border border-gray-600"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {(!tool.logoUrl || similarImageErrors[tool.id]) ? (
                          <div className="w-10 h-10 rounded-full bg-gray-700/50 border border-gray-600/50 flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        ) : (
                            <Image
                              src={normalizeMediaUrl(tool.logoUrl)}
                            alt={tool.name}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                            onError={() => setSimilarImageErrors(prev => ({ ...prev, [tool.id]: true }))}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{tool.name}</p>
                          <div className="flex items-center gap-1 text-xs text-yellow-400">
                            <Star size={10} className="fill-yellow-400 text-yellow-400" />
                            <span>{parseFloat(String(tool.avgRating || 0)).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">{tool.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-sm">{t("noSimilarTools")}</div>
              )}
            </div>
          </div>

          {/* Mobile Button - Sticky Bottom */}
          <div className="flex-shrink-0 bg-[#0b0d11] px-4 py-4 border-t border-gray-700 sticky bottom-0">
            <button
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg text-white font-semibold transition-all"
              style={{
                background: "linear-gradient(90deg, #00C6FF 0%, #0072FF 100%)",
              }}
              onClick={() => {
                if (data.homepageUrl) {
                  window.open(data.homepageUrl, "_blank");
                }
                onClose();
              }}
            >
              {t("tryNow")}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // Only render modal when open, using portal to render outside DOM hierarchy
  if (!open) return null;

  // Render modal using portal to body to escape container constraints
  return createPortal(modalContent, document.body);
}
