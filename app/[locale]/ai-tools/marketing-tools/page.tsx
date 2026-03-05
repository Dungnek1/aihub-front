import type { Tool } from "@/types/tool.types";
import { Megaphone } from "lucide-react";
import MarketingAllSection from "@/components/marketing/MarketingAllSection";
import MarketingFeaturedSection from "@/components/marketing/MarketingFeaturedSection";
import MarketingGalleryTabs from "@/components/marketing/MarketingGalleryTabs";
import { getTranslations } from "next-intl/server";
import { getServerUser } from "@/lib/auth.server";
import {
  getFeaturedMarketingTools,
  getMarketingTools,
  getUserUsedMarketingTools,
  getUserSavedMarketingTools,
} from "@/services/server/tools.server";

// Force dynamic rendering since we use getServerUser which uses headers()
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = (await import(`@/lib/i18n/message/${locale}.json`)).default;
  return {
    title: `${messages.AITools.toolsMarketingTitle} | AI Hub`,
    description: messages.AITools.toolsMarketingDesc,
  };
}

export default async function MarketingToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("AITools");
  const user = await getServerUser();

  // Fetch featured marketing tools
  const featuredTools = await getFeaturedMarketingTools(4).catch(() => []);

  // Fetch all marketing tools with pagination
  const allToolsData = await getMarketingTools({
    page: 1,
    limit: 10,
    skip: 0,
    take: 10,
  }).catch(() => ({ items: [], total: 0, page: 1, limit: 10 }));

  const allTools = allToolsData.items || [];

  // Fetch user's used and saved marketing tools (if authenticated)
  const [usedTools, savedTools] = await Promise.all([
    getUserUsedMarketingTools(0, 10).catch(() => []),
    getUserSavedMarketingTools(0, 10).catch(() => []),
  ]);

  // Debug logging removed to reduce console noise

  return (
    <div className="relative bg-[#0A0F18] font-sans overflow-hidden text-white">
      <div
        className="mx-auto px-4 sm:px-6 xl:px-0"
        style={{ maxWidth: "1440px", width: "100%" }}
      >
        <main className="pt-0 pb-12 text-gray-100">
          {/* Page Header */}
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-white font-bold flex items-center gap-2 text-xl sm:text-[28px] md:text-[32px] tracking-tight">
                <Megaphone className="w-6 h-6" /> {t("toolsMarketingTitle")}
              </h1>
              <p className="mt-2 text-base sm:text-lg text-white/70">
                {t("toolsMarketingDesc")}
              </p>
            </div>
          </div>
          {/* Featured section at top */}
          <MarketingFeaturedSection
            featured={featuredTools}
            className="mt-8 sm:mt-10"
          />
          
          {/* Gallery section - Used and Saved marketing tools */}
          {/* Temporarily hidden used and saved tabs */}
          {false && user && (
            <section className="mt-12 sm:mt-16 mb-12">
              <h2 className="hidden sm:block text-xl sm:text-[28px] md:text-[32px] font-bold mb-2 tracking-tight">{t("myMarketingToolsGallery")}</h2>
              <p className="hidden sm:block text-sm sm:text-base text-white/70 mb-4">{t("myMarketingToolsGalleryDesc")}</p>
              <MarketingGalleryTabs
                usedTools={usedTools}
                savedTools={savedTools}
                user={user}
              />
            </section>
          )}
          
          <MarketingAllSection initialTools={allTools} />
        </main>
      </div>
    </div>
  );
}
