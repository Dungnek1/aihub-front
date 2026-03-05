"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import MarketingToolCard from "./MarketingToolCard";
import { Tool } from "@/types/tool.types";
import {
  getUserUsedMarketingTools,
  getUserSavedMarketingTools,
} from "@/services/client/tools.client";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { Star, ExternalLink, MoreVertical, Megaphone } from "lucide-react";
import { normalizeMediaUrl } from "@/utils/image.utils";
import { AnimatePresence, motion } from "framer-motion";

interface MarketingGalleryTabsProps {
  usedTools?: Tool[];
  savedTools?: Tool[];
  user?: any;
}

export default function MarketingGalleryTabs({
  usedTools: initialUsedTools = [],
  savedTools: initialSavedTools = [],
  user: initialUser,
}: MarketingGalleryTabsProps) {
  const t = useTranslations("AITools");
  const locale = useLocale();
  const { user } = useAuth();
  const currentUser = user || initialUser;

  const [activeTab, setActiveTab] = useState<"used" | "saved">("used");
  const [usedTools, setUsedTools] = useState<Tool[]>(initialUsedTools);
  const [savedTools, setSavedTools] = useState<Tool[]>(initialSavedTools);
  const [loading, setLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const hasFetchedToolsRef = useRef(false);
  const fetchingRef = useRef(false);

  const userId = useMemo(
    () => currentUser?.userId || null,
    [currentUser?.userId]
  );

  useEffect(() => {
    if (!userId) {
      hasFetchedToolsRef.current = false;
      fetchingRef.current = false;
      setUsedTools([]);
      setSavedTools([]);
      return;
    }

    if (userId && !hasFetchedToolsRef.current && !fetchingRef.current) {
      fetchingRef.current = true;
      
      const timeoutId = setTimeout(async () => {
        if (!userId || hasFetchedToolsRef.current) {
          fetchingRef.current = false;
          return;
        }

        setLoading(true);
        try {
          const [usedToolsData, savedToolsData] = await Promise.all([
            getUserUsedMarketingTools(),
            getUserSavedMarketingTools(),
          ]);
          setUsedTools(usedToolsData);
          setSavedTools(savedToolsData);
          hasFetchedToolsRef.current = true;
        } catch (error: any) {
          // Mark error as silent if it's an auth error (401, 404, 400, etc.)
          const errorMessage = error?.message || "";
          const status = error?.status || error?.response?.status;
          const isAuthError = 
            error?._silent ||
            status === 401 ||
            status === 404 ||
            status === 403 ||
            status === 400 || // 400 Bad Request - endpoint may not exist yet
            errorMessage.includes("401") ||
            errorMessage.includes("404") ||
            errorMessage.includes("403") ||
            errorMessage.includes("400") ||
            errorMessage.includes("Bad Request") ||
            errorMessage.includes("Internal server error") ||
            errorMessage.includes("Invalid token") ||
            errorMessage.includes("Unauthorized") ||
            errorMessage.includes("Not found");
          
          if (!isAuthError && process.env.NODE_ENV === "development") {
            console.error("Failed to fetch marketing tools:", error);
          }
          // Don't reset hasFetchedToolsRef on auth errors - allow retry
          if (!isAuthError) {
            hasFetchedToolsRef.current = false;
          }
        } finally {
          setLoading(false);
          fetchingRef.current = false;
        }
      }, 500);

      return () => {
        clearTimeout(timeoutId);
        fetchingRef.current = false;
      };
    }
  }, [userId]);

  const handleRemoveTool = useCallback(
    (toolId: string, context: "used" | "saved") => {
      if (context === "used") {
        setUsedTools((prev) => prev.filter((tool) => tool.id !== toolId));
      } else {
        setSavedTools((prev) => prev.filter((tool) => tool.id !== toolId));
      }
    },
    []
  );

  const currentTools = useMemo(
    () => (activeTab === "used" ? usedTools : savedTools),
    [activeTab, usedTools, savedTools]
  );

  const translations = useMemo(
    () => ({
      usedTools: t("usedTools") || "Đã Dùng",
      savedTools: t("savedTools") || "Đã Lưu",
      usedToolsTitle: t("usedToolsTitle") || "Công Cụ Marketing Đã Dùng",
      savedToolsTitle: t("savedToolsTitle") || "Công Cụ Marketing Đã Lưu",
      noUsedTools: t("noUsedTools") || "Chưa có công cụ marketing đã dùng",
      noSavedTools: t("noSavedTools") || "Chưa có công cụ marketing đã lưu",
    }),
    [t]
  );

  const handleImageError = useCallback(
    (toolId: string) => {
      setImageErrors((prev) => ({ ...prev, [toolId]: true }));
    },
    []
  );

  const renderMobileToolList = useCallback(
    (tools: Tool[], title: string) => (
      <div className="mb-6">
        <h3 className="text-white font-semibold text-base mb-3 px-1">{title}</h3>
        {tools.length > 0 ? (
          <div className="space-y-2">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-900/30 border border-gray-700/50 w-full"
              >
                {(!tool.logoUrl || imageErrors[tool.id]) ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
                  </div>
                ) : (
                  <Image
                    src={normalizeMediaUrl(tool.logoUrl)}
                    alt={tool.name}
                    width={64}
                    height={64}
                    className="rounded-lg w-16 h-16 sm:w-20 sm:h-20 object-cover flex-shrink-0"
                    style={{ objectFit: "cover" }}
                    onError={() => handleImageError(tool.id)}
                  />
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {tool.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star
                        size={12}
                        className="fill-yellow-400 text-yellow-400"
                      />
                      <span className="text-xs text-white font-medium">
                        {Number(tool.avgRating).toFixed(1)}
                      </span>
                    </div>
                    {tool.price && (
                      <span className="px-1.5 py-0.5 rounded text-badge-xs bg-emerald-600/30 text-emerald-300 border border-emerald-400/30">
                        {(() => {
                          const priceKey = tool.price.toLowerCase();
                          const validKeys = ["paid", "trial", "subscription", "free"];
                          if (validKeys.includes(priceKey)) {
                            return t(priceKey as "paid" | "trial" | "subscription" | "free");
                          }
                          return tool.price;
                        })()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button className="p-1.5 sm:p-2 rounded-lg border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10 transition">
                    <ExternalLink size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <button className="p-1.5 sm:p-2 text-gray-400 hover:text-white transition">
                    <MoreVertical size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm text-center py-6 px-1">
            {title.includes("Used") || title.includes("Đã Dùng")
              ? translations.noUsedTools
              : translations.noSavedTools}
          </div>
        )}
      </div>
    ),
    [translations, imageErrors, handleImageError, t]
  );

  return (
    <div className="mt-4 sm:mt-2 relative">
      {/* Temporarily hidden used and saved tabs */}
      {false && <div className="hidden sm:block">
        <div
          className={`flex gap-6 items-center border-b border-gray-700 mb-6 relative ${
            !currentUser ? "opacity-50 blur-[1px] pointer-events-none" : ""
          }`}
        >
          <button
            onClick={() => setActiveTab("used")}
            disabled={loading || !currentUser}
            className={`relative cursor-pointer pb-2 text-sm font-semibold transition-all duration-300 ease-out ${
              activeTab === "used"
                ? "text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {translations.usedTools}
            {activeTab === "used" && (
              <motion.div
                layoutId="marketingGalleryActiveTab"
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#56E3E1] rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            disabled={loading || !currentUser}
            className={`relative cursor-pointer pb-2 text-sm font-semibold transition-all duration-300 ease-out ${
              activeTab === "saved"
                ? "text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {translations.savedTools}
            {activeTab === "saved" && (
              <motion.div
                layoutId="marketingGalleryActiveTab"
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#56E3E1] rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#56E3E1]"></div>
          </div>
        )}

        {!loading && currentUser && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {currentTools.length > 0 ? (
                currentTools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.05,
                      ease: "easeOut" 
                    }}
                  >
                    <MarketingToolCard tool={tool} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="col-span-full text-center py-8 text-gray-500"
                >
                  {activeTab === "used"
                    ? translations.noUsedTools
                    : translations.noSavedTools}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>}

      {/* Temporarily hidden used and saved sections */}
      {false && !loading && currentUser && (
        <div className="sm:hidden">
          {renderMobileToolList(usedTools, translations.usedToolsTitle)}
          {renderMobileToolList(savedTools, translations.savedToolsTitle)}
        </div>
      )}
    </div>
  );
}

