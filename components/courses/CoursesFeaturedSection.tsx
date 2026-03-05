"use client";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import CourseFeaturedCard from "./CourseFeaturedCard";
import type { Tool } from "@/types/tool.types";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  featured: Tool[];
  following?: Tool[];
};

export default function CoursesFeaturedSection({
  featured,
  following = [],
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

  // Debug logging removed to reduce console noise

  return (
    <section className="mt-2 mb-1.5">
      <div className="hidden sm:block">
        <div className="flex gap-6 items-center border-b border-gray-700 mb-4">
          <button
            onClick={() => setTab("featured")}
            className={`relative cursor-pointer pb-2 text-sm font-semibold transition-all duration-300 ease-out ${
              tab === "featured"
                ? "text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t("featured")}
            {tab === "featured" && (
              <motion.div
                layoutId="coursesActiveTab"
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#56E3E1] rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
          <button
            onClick={() => setTab("following")}
            className={`relative cursor-pointer pb-2 text-sm font-semibold transition-all duration-300 ease-out ${
              tab === "following"
                ? "text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t("following")}
            {tab === "following" && (
              <motion.div
                layoutId="coursesActiveTab"
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
          {/* Responsive layout: horizontal scroll on mobile, grid on larger screens */}
          <div
            ref={containerRef}
            className="w-full mt-5 pb-6 flex gap-3 overflow-x-auto sm:overflow-visible sm:overflow-hidden scrollbar-thin sm:grid sm:grid-cols-2 sm:gap-4 sm:gap-y-5 xl:grid-cols-4 xl:gap-5"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(6, 182, 212, 0.5) transparent",
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
                  <CourseFeaturedCard tool={tool} />
                </motion.div>
              ))
            ) : (
              <div
                ref={emptyStateRef}
                className="col-span-full text-center py-12 text-gray-400 flex items-center justify-center"
              >
                {tab === "featured"
                  ? "Chưa có khóa học nổi bật"
                  : "Chưa có khóa học đang theo dõi"}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
