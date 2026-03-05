"use client";
import type { Tool } from "@/types/tool.types";
import FeaturedTabsGrid from "@/components/common/FeaturedTabsGrid";

type Props = {
  featured: Tool[];
  following?: Tool[];
  className?: string;
};

export default function MarketingFeaturedSection({
  featured,
  following = [],
  className,
}: Props) {
  return (
    <FeaturedTabsGrid
      featured={featured}
      following={following}
      isMarketing={true}
      className={className}
    />
  );
}
