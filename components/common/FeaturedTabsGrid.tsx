"use client";
import { useState, useRef, useEffect } from "react";
import ToolCardModern from "@/components/ai-tools/ToolCardModern";
import MarketingToolCard from "@/components/marketing/MarketingToolCard";
import type { Tool } from "@/types/tool.types";
import { cn } from "@/utils/common.utils";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  featured: Tool[];
  following?: Tool[];
  className?: string;
  isMarketing?: boolean;
};

export default function FeaturedTabsGrid({
  featured,
  following = [],
  className,
  isMarketing = false,
}: Props) {
  const t = useTranslations("AITools");
  const [tab, setTab] = useState<"featured" | "following">("featured");
  const data = tab === "featured" ? featured : following;
  const emptyStateRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fixedHeight, setFixedHeight] = useState<number | null>(null);

  // Measure height of tab with panels (Featured) and use it as fixed height for both tabs
  useEffect(() => {
    if (containerRef.current && featured.length > 0 && tab === "featured") {
      // Measure when Featured tab is active and has panels
      requestAnimationFrame(() => {
        if (containerRef.current) {
          const height = containerRef.current.offsetHeight;
          if (height > 0) {
            setFixedHeight(height);
          }
        }
      });
    }
  }, [featured.length, tab]);

  // Use fixed height or fallback to 400px
  const containerHeight = fixedHeight ? `${fixedHeight}px` : "400px";

  return (
    <section className={cn("mt-0 mb-2 lg:mb-2.5", className)}>
      <div className="hidden sm:block">
        <div className="flex gap-8 items-center border-b border-gray-700 mb-6">
          <button
            onClick={() => setTab("featured")}
            className={`relative cursor-pointer pb-3 text-base font-semibold transition-all duration-300 ease-out ${
              tab === "featured"
                ? "text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t("featured")}
            {tab === "featured" && (
              <motion.div
                layoutId="featuredTab"
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#56E3E1] rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
          <button
            onClick={() => setTab("following")}
            className={`relative cursor-pointer pb-3 text-base font-semibold transition-all duration-300 ease-out ${
              tab === "following"
                ? "text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t("following")}
            {tab === "following" && (
              <motion.div
                layoutId="featuredTab"
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#56E3E1] rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div
            ref={containerRef}
            className="
              w-full
              mt-5 pb-6
              flex gap-3 overflow-x-auto
              sm:overflow-visible sm:overflow-hidden
              scrollbar-thin
              sm:grid sm:grid-cols-2 sm:gap-4 sm:gap-y-5
              xl:grid-cols-4 xl:gap-5
            "
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(6, 182, 212, 0.2) transparent",
              minHeight: containerHeight, // Fixed height to prevent layout shift
              overflow: data.length > 0 ? "hidden" : "visible", // Hide overflow when panels are present
            }}
          >
            {data.length > 0 ? (
              data.slice(0, 4).map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                  className="min-w-[260px] sm:min-w-0 sm:w-full flex-shrink-0"
                >
                  {isMarketing ? (
                    <MarketingToolCard tool={tool} />
                  ) : (
                    <ToolCardModern
                      tool={tool}
                      avatarShape="square"
                      isMarketing={isMarketing}
                    />
                  )}
                </motion.div>
              ))
            ) : (
              <div
                ref={emptyStateRef}
                className="col-span-full text-center py-12 text-gray-400 flex items-center justify-center"
              >
                {tab === "featured"
                  ? t("noResults") || "Chưa có dữ liệu"
                  : t("noResults") || "Chưa có dữ liệu đang theo dõi"}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
