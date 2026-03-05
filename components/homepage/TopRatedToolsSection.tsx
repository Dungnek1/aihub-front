"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import AIToolCard from "@/components/ai-tools/TopToolCard";
import { Tool } from "@/types/tool.types";
import { cn } from "@/utils/common.utils";
import { BlurFade } from "@/components/ui/blur-fade";
import { Skeleton } from "@/components/ui/skeleton";

interface TopRatedToolsSectionProps {
  topRatedTools: Tool[];
  savedToolIds?: string[]; // Optional: chỉ dùng trong context "saved"
  texts?: {
    topRated?: string;
    topRatedDesc?: string;
    noResults?: string;
  };
  className?: string;
}
export default function TopRatedToolsSection({
  topRatedTools,
  savedToolIds = [], // Default to empty array
  className,
}: TopRatedToolsSectionProps) {
  const t = useTranslations("HomePage");

  return (
    <section
      id="top-rated"
      className={cn(
        `
        mt-6
        sm:mt-6
        md:mt-8
        min-[1367px]:mt-0
        mb-6
        sm:mb-8
        md:mb-10
        min-[1367px]:mb-[72px]
        px-0
        overflow-visible
      `,
        className
      )}
    >
      <h3 className="text-white font-bold flex items-center gap-2 text-xl sm:text-[28px] md:text-[32px] tracking-tight">
        {t("topRated")}
      </h3>

      <p className="mt-2 text-base sm:text-lg text-white/70">
        {t("topRatedDesc")}
      </p>

      <div
        className="
          w-full
          mt-3 pb-4
          flex gap-3 overflow-x-auto
          sm:overflow-visible
          scrollbar-thin
          sm:grid sm:grid-cols-2 sm:gap-4 sm:gap-y-5
          xl:grid-cols-4 xl:gap-5
        "
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(6, 182, 212, 0.2) transparent",
        }}
      >
        {topRatedTools.length > 0 ? (
          topRatedTools.map((tool: Tool, index: number) => (
            <BlurFade key={tool.id} delay={index * 0.1} direction="up" inView>
              {/* ✅ bọc card để control độ rộng giống marketing tools */}
              <div className="min-w-[260px] sm:min-w-0 sm:w-full flex-shrink-0">
                <AIToolCard tool={tool} savedToolIds={savedToolIds} />
              </div>
            </BlurFade>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-400">
            {t("noResults")}
          </div>
        )}
      </div>
    </section>
  );
}
