"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import ToolCardModern from "@/components/ai-tools/ToolCardModern";
import type { Tool, Price, Audience } from "@/types/tool.types";

type Props = {
  titleI18nKey: string; // e.g., "AITools.allCourse" or "AITools.allMarketing"
  initialItems: Tool[];
  prices?: Price[];
  audiences?: Audience[];
  isMarketing?: boolean;
};

export default function AllListWithFilter({
  titleI18nKey,
  initialItems,
  prices = [],
  audiences = [],
  isMarketing = false,
}: Props) {
  const t = useTranslations();
  const [items, setItems] = useState<Tool[]>(initialItems);

  // Debug logging
  if (process.env.NODE_ENV === "development") {
    console.log("[AllListWithFilter] Props:", {
      titleI18nKey,
      initialItemsCount: initialItems.length,
      itemsCount: items.length,
      isMarketing,
      sampleItems: initialItems.slice(0, 2).map(i => ({ id: i?.id, name: i?.name })),
    });
  }


  return (
    <section className="mb-12">
      {/* Header - visible on all screen sizes */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-[28px] md:text-[32px] font-bold mb-2 tracking-tight">
          {t(titleI18nKey as any)}
        </h2>
        <p className="text-[#717680] text-sm sm:text-base">{items.length} {t("AITools.results")}</p>
      </div>

      {/* Desktop Layout - Full width grid without filter */}
      <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-5">
        {items.length > 0 ? (
          items.map((tool) => (
            <ToolCardModern key={tool.id} tool={tool} isMarketing={isMarketing} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-400">
            {t("AITools.noResults")}
          </div>
        )}
      </div>

      {/* Tablet Layout */}
      <div className="hidden sm:grid lg:hidden grid-cols-2 gap-4">
        {items.length > 0 ? (
          items.map((tool) => (
            <ToolCardModern key={tool.id} tool={tool} isMarketing={isMarketing} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-400">
            {t("AITools.noResults")}
          </div>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {items.length > 0 ? (
          items.map((tool) => (
            <ToolCardModern key={tool.id} tool={tool} isMarketing={isMarketing} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-400">
            {t("AITools.noResults")}
          </div>
        )}
      </div>
    </section>
  );
}


