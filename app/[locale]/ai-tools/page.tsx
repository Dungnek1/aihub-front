import { Suspense } from "react";
import GalleryTabs from "@/components/ai-tools/GalleryTabs";
import AllToolsSection from "@/components/ai-tools/AllToolsSection";
import TopRatedToolsSection from "@/components/homepage/TopRatedToolsSection";
import MarketingToolsSection from "@/components/ai-tools/MarketingToolsSection";
import CoursesTeaserSection from "@/components/courses/CoursesTeaserSection";
import ToolModalFromUrl from "@/components/ai-tools/ToolModalFromUrl";
import {
  getTopTools,
  filterTools,
  getUserUsedTools,
  getUserSavedTools,
  getPrices,
  getAudiences,
} from "@/services/server/tools.server";
import type { Tool } from "@/types/tool.types";
import { getServerUser } from "@/lib/auth.server";

// 🔄 Force dynamic rendering to fix build timeout and ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = (await import(`@/lib/i18n/message/${locale}.json`)).default;
  return {
    title: messages.AITools.pageTitle || "AI Tools Gallery - Discover and Manage Your Favorite Tools",
    description: messages.AITools.pageDesc || "Explore top rated and personalized AI tools for productivity, design, and innovation.",
  };
}

export default async function AiToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Import messages directly based on locale to ensure correct translations
  const messages = (await import(`@/lib/i18n/message/${locale}.json`)).default;
  const t = (key: string) => {
    const keys = key.split(".");
    let value: any = messages.AITools;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === "string" ? value : key;
  };

  // Fetch data in parallel for better performance with error handling
  const [topRatedTools, allTools, prices, audiences] = await Promise.all([
    getTopTools(0, 4).catch(() => []),
    filterTools(0, 8).catch(() => []),
    getPrices().catch(() => []),
    getAudiences().catch(() => []),
  ]);

  // Get user session to fetch personalized data
  const user = await getServerUser();
  const [usedTools, savedTools] = user
    ? await Promise.all([
      getUserUsedTools(0, 10).catch(() => []),
      getUserSavedTools(0, 10).catch(() => []),
    ])
    : [[], []];

  // Get saved tool IDs chỉ cho GalleryTabs (context "saved")
  const savedToolIds = user ? savedTools.map((t: Tool) => t.id) : [];

  return (
    <div className="relative bg-[#0A0F18] font-sans overflow-hidden text-white">
      <div
        className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-0"
        style={{
          maxWidth: "1440px",
          width: "100%",
        }}
      >
        <main className="pt-0 pb-8 sm:pb-10 lg:pb-12 text-gray-100">
          <TopRatedToolsSection
            /* Anchor for header dropdown */
            className="mt-0 sm:mt-0 md:mt-0 min-[1367px]:mt-0"
            topRatedTools={topRatedTools}
          />

          {/* Order per Figma: Courses first, then Tools Marketing */}
          <CoursesTeaserSection />
          <MarketingToolsSection />

          {/* Gallery */}
          {/* Temporarily hidden used and saved tabs */}
          {false && <section id="community" className="mt-8 sm:mt-12 md:mt-16 mb-8 sm:mb-12">
            {user && (
              <>
                <h2 className="hidden sm:block text-xl sm:text-2xl md:text-[28px] lg:text-[32px] font-bold mb-2 sm:mb-3 tracking-tight px-2 sm:px-0">{t("myGallery")}</h2>
                <p className="hidden sm:block text-xs sm:text-sm md:text-base text-white/70 mb-3 sm:mb-4 px-2 sm:px-0">{t("myGalleryDesc")}</p>
                <GalleryTabs
                  usedTools={usedTools}
                  savedTools={savedTools}
                  user={user}
                />
              </>
            )}
          </section>}

          {/* All Tools */}
          <section id="all-tools" className="mt-8 sm:mt-12 md:mt-16">
            <AllToolsSection
              initialTools={allTools}
              prices={prices}
              audiences={audiences}
              user={user ?? undefined}
            />
          </section>
        </main>
      </div>

      {/* Tool Modal from URL - Client Component */}
      <Suspense fallback={null}>
        <ToolModalFromUrl
          allTools={allTools}
          topRatedTools={topRatedTools}
          usedTools={usedTools}
          savedTools={savedTools}
        />
      </Suspense>
    </div>
  );
}
