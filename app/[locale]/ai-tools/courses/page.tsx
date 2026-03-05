import { getServerUser } from "@/lib/auth.server";
import { BookOpen } from "lucide-react";
import type { Tool } from "@/types/tool.types";
import CoursesAllSection from "@/components/courses/CoursesAllSection";
import CoursesFeaturedSection from "@/components/courses/CoursesFeaturedSection";
import CoursesGalleryTabs from "@/components/courses/CoursesGalleryTabs";
import { getTranslations } from "next-intl/server";
import { getFeaturedCourses, getCourses, getUserUsedCourses, getUserSavedCourses } from "@/services/server/courses.server";

// Force dynamic rendering since we use getServerUser which uses headers()
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = (await import(`@/lib/i18n/message/${locale}.json`)).default;
  return {
    title: `${messages.AITools.coursesPageTitle} | AI Hub`,
    description: messages.AITools.coursesPageDesc,
  };
}

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("AITools");
  const user = await getServerUser();

  // Fetch featured courses from API
  const featuredCourses = await getFeaturedCourses(4);
  
  // Fetch initial courses for "All Courses" section (12 items)
  const coursesData = await getCourses({ take: 12, page: 1 });
  const allCourses = coursesData.items;

  // Fetch user's used and saved courses (if authenticated)
  const [usedCourses, savedCourses] = await Promise.all([
    getUserUsedCourses(0, 10).catch(() => []),
    getUserSavedCourses(0, 10).catch(() => []),
  ]);

  // Debug logging removed to reduce console noise

  return (
    <div className="relative bg-[#0A0F18] font-sans overflow-hidden text-white">
      <div className="mx-auto px-4 sm:px-6 xl:px-0" style={{ maxWidth: "1440px", width: "100%" }}>
        <main className="pt-0 pb-12 text-gray-100">
          {/* Page Header */}
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-white font-bold flex items-center gap-2 text-xl sm:text-[28px] md:text-[32px] tracking-tight">
                <BookOpen className="w-6 h-6" /> {t("coursesPageTitle")}
              </h1>
              <p className="mt-2 text-base sm:text-lg text-white/70">
                {t("coursesPageDesc")}
              </p>
            </div>
          </div>
          {/* Featured section at top */}
          <CoursesFeaturedSection featured={featuredCourses} />
          
          {/* Gallery section - Used and Saved courses */}
          {/* Temporarily hidden used and saved tabs */}
          {false && user && (
            <section className="mt-12 sm:mt-16 mb-12">
              <h2 className="hidden sm:block text-xl sm:text-[28px] md:text-[32px] font-bold mb-2 tracking-tight">{t("myCoursesGallery")}</h2>
              <p className="hidden sm:block text-sm sm:text-base text-white/70 mb-4">{t("myCoursesGalleryDesc")}</p>
              <CoursesGalleryTabs
                usedCourses={usedCourses}
                savedCourses={savedCourses}
                user={user}
              />
            </section>
          )}
          
          <CoursesAllSection initialCourses={allCourses} />
        </main>
      </div>
    </div>
  );
}

