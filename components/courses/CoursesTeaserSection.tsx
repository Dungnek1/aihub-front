"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/common.utils";
import { useLocale } from "next-intl";
import CourseFeaturedCard from "@/components/courses/CourseFeaturedCard";
import type { Tool } from "@/types/tool.types";
import { useEffect, useState } from "react";
import { getFeaturedCourses } from "@/services/client/courses.client";

interface CoursesTeaserSectionProps {
  className?: string;
}

export default function CoursesTeaserSection({ className }: CoursesTeaserSectionProps) {
  const t = useTranslations("AITools");
  const locale = useLocale();
  const [courses, setCourses] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getFeaturedCourses(4);
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch featured courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);


  return (
    <section
      id="courses"
      className={cn(
        `
        mt-12
        sm:mt-16
        mb-12
      `,
        className
      )}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-white font-bold flex items-center gap-2 text-xl sm:text-[28px] md:text-[32px] tracking-tight">
            {t("coursesTitle")}
          </h3>
          <p className="mt-2 text-base sm:text-lg text-white/70">
            {t("coursesDesc")}
          </p>
        </div>
        <div className="shrink-0">
          <Link href={`/${locale}/ai-tools/courses`} className="text-cyan-300 hover:text-cyan-200 text-base font-medium hover:underline transition-all duration-200">
            {t("seeMore")}
          </Link>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="animate-pulse">
              <div className="bg-gray-800 rounded-xl h-48"></div>
            </div>
          ))
        ) : courses.length > 0 ? (
          courses.slice(0, 4).map((course) => (
            <CourseFeaturedCard key={course.id} tool={course} />
          ))
        ) : (
          // Empty state
          <div className="col-span-full text-center text-gray-400 py-8">
            {t("noResults") || "No courses available"}
          </div>
        )}
      </div>
    </section>
  );
}


