"use client";
import AllListWithFilter from "@/components/common/AllListWithFilter";
import type { Tool, Price, Audience } from "@/types/tool.types";

type Props = {
  initialTools: Tool[];
  prices?: Price[];
  audiences?: Audience[];
};

export default function MarketingAllSection({
  initialTools,
  prices = [],
  audiences = [],
}: Props) {
  return (
    <div className="mt-3 sm:mt-4">
      <AllListWithFilter titleI18nKey="AITools.allMarketing" initialItems={initialTools} prices={prices} audiences={audiences} isMarketing={true} />
    </div>
  );
}


