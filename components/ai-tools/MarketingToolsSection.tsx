"use client";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/utils/common.utils";
import { Megaphone } from "lucide-react";
import MarketingToolCard from "@/components/marketing/MarketingToolCard";
import type { Tool } from "@/types/tool.types";
import { useEffect, useState } from "react";
import { getFeaturedMarketingTools } from "@/services/client/tools.client";

interface MarketingToolsSectionProps {
  className?: string;
}

export default function MarketingToolsSection({ className }: MarketingToolsSectionProps) {
  const t = useTranslations("AITools");
  const locale = useLocale();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketingTools = async () => {
      try {
        const data = await getFeaturedMarketingTools(4);
        setTools(data);
      } catch (error) {
        console.error("Failed to fetch featured marketing tools:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketingTools();
  }, []);

  return (
    <section
      id="marketing"
      className={cn(
        `
        mt-12
        sm:mt-16
        mb-10
      `,
        className
      )}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-white font-bold flex items-center gap-2 text-xl sm:text-[28px] md:text-[32px] tracking-tight">
            <Megaphone className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-cyan-400" />
            {t("toolsMarketingTitle")}
          </h3>
          <p className="mt-2 text-base sm:text-lg text-white/70">
            {t("toolsMarketingDesc")}
          </p>
        </div>
        <div className="shrink-0">
          <Link href={`/${locale}/ai-tools/marketing-tools`} className="text-cyan-300 hover:text-cyan-200 text-base font-medium hover:underline transition-all duration-200">
            {t("seeMore")}
          </Link>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="animate-pulse">
              <div className="bg-gray-800 rounded-xl h-64"></div>
            </div>
          ))
        ) : tools.length > 0 ? (
          tools.slice(0, 4).map((tool) => (
            <MarketingToolCard key={tool.id} tool={tool} />
          ))
        ) : (
          // Empty state
          <div className="col-span-full text-center text-gray-400 py-8">
            {t("noResults") || "No marketing tools available"}
          </div>
        )}
      </div>
    </section>
  );
}


