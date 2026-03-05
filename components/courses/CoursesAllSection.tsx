"use client";
import AllListWithFilter from "@/components/common/AllListWithFilter";
import type { Tool, Price, Audience } from "@/types/tool.types";

type Props = {
  initialCourses: Tool[];
  prices?: Price[];
  audiences?: Audience[];
};

export default function CoursesAllSection({
  initialCourses,
  prices = [],
  audiences = [],
}: Props) {
  return (
    <div className="mt-3 sm:mt-4">
      <AllListWithFilter titleI18nKey="AITools.allCourse" initialItems={initialCourses} prices={prices} audiences={audiences} />
    </div>
  );
}


