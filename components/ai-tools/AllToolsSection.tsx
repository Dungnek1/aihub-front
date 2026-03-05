"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Filter } from "lucide-react";
import FilterSidebarWrapper from "./FilterSidebarWrapper";
import ToolCardModern from "./ToolCardModern";
import MobileFilterModal from "./MobileFilterModal";
import type { Tool, Price, Audience } from "@/types/tool.types";
import { User } from "@/lib/auth";
import { filterTools } from "@/services/client/tools.client";
import { BlurFade } from "@/components/ui/blur-fade";
import { Skeleton } from "@/components/ui/skeleton";

interface AllToolsSectionProps {
  initialTools: Tool[];
  prices: Price[];
  audiences: Audience[];
  user?: User;
  savedToolIds?: string[]; // Optional: chỉ dùng trong context "saved"
}

export default function AllToolsSection({
  initialTools,
  prices,
  audiences,
  user,
  savedToolIds = [],
}: AllToolsSectionProps) {
  const t = useTranslations("AITools");
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const handleToolsChange = (filteredTools: Tool[]) => {
    setTools(filteredTools);
  };

  const handleMobileFilterChange = async (price?: string, audience?: string) => {
    setIsLoading(true);
    try {
      const filteredTools = await filterTools(0, 8, price, audience);
      setTools(filteredTools);
      let count = 0;
      if (price) count++;
      if (audience) count++;
      setActiveFilterCount(count);
    } catch (error) {
      console.error("Failed to filter tools:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsMobileFilterOpen(false);
  };

  return (
    <section className="mb-2 sm:mb-8 md:mb-12">
      {/* 🔹 Mobile Header */}
      <div className="lg:hidden mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-[28px] xl:text-[32px] font-bold tracking-tight truncate">{t("allTools")}</h2>
            <p className="text-xs sm:text-sm text-[#717680] mt-1">
              {tools.length} {t("results")}
            </p>
          </div>
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#1a1a1a] text-white rounded-full text-xs sm:text-sm hover:bg-[#2a2a2a] transition-colors flex-shrink-0"
          >
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-800 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                {activeFilterCount}
              </span>
            )}
            <span className="font-medium uppercase hidden xs:inline">{t("filters")}</span>
            <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* 🔹 Desktop Header */}
      <div className="hidden lg:block">
        <h2 className="text-xl sm:text-2xl md:text-[28px] lg:text-[32px] font-bold mb-2 sm:mb-3 tracking-tight">{t("allTools")}</h2>
        <p className="text-sm sm:text-base text-[#717680] mb-4 sm:mb-6">
          {tools.length} {t("results")}
        </p>
      </div>

      {/* 🔹 Desktop Layout (≥ 1024px) */}
      <div className="hidden lg:grid lg:grid-cols-8 gap-6 items-start">
        <div className="lg:col-span-2">
          <FilterSidebarWrapper
            prices={prices}
            audiences={audiences}
            onToolsChange={handleToolsChange}
          />
        </div>
        <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-2 gap-3 lg:gap-5">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-[200px] rounded-2xl bg-[#1E293B]" />
            ))
          ) : tools.length > 0 ? (
            tools.map((tool: Tool, index: number) => (
              <BlurFade key={tool.id} delay={index * 0.05} direction="up" inView>
                <ToolCardModern tool={tool} savedToolIds={savedToolIds} />
              </BlurFade>
            ))
          ) : null}
        </div>
      </div>

      {/* 🔹 Tablet Layout (≥640px and <1024px) */}
      <div className="hidden sm:grid lg:hidden grid-cols-2 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-[200px] rounded-2xl bg-[#1E293B]" />
          ))
        ) : tools.length > 0 ? (
          tools.map((tool: Tool, index: number) => (
            <BlurFade key={tool.id} delay={index * 0.05} direction="up" inView>
              <ToolCardModern tool={tool} savedToolIds={savedToolIds} />
            </BlurFade>
          ))
        ) : null}
      </div>

      {/* 🔹 Mobile Layout (<640px) */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-[200px] rounded-2xl bg-[#1E293B]" />
          ))
        ) : tools.length > 0 ? (
          tools.map((tool: Tool, index: number) => (
            <BlurFade key={tool.id} delay={index * 0.05} direction="up" inView>
              <ToolCardModern tool={tool} savedToolIds={savedToolIds} />
            </BlurFade>
          ))
        ) : null}
      </div>

      {/* 🔹 Mobile Filter Modal */}
      <MobileFilterModal
        isOpen={isMobileFilterOpen}
        onClose={handleModalClose}
        prices={prices}
        audiences={audiences}
        onApplyFilter={handleMobileFilterChange}
        isLoading={isLoading}
      />
    </section>
  );
}
