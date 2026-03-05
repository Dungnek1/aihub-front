import { getTopTools, getUserSavedTools } from "@/services/server/tools.server";
import { getNewsData } from "@/services/client/news.client";
import { listPosts } from "@/services/server/blog.server";
import HeroSection from "@/components/homepage/HeroSection";
import BreakingNewsSection from "@/components/homepage/BreakingNewsSection";
import TopRatedToolsSection from "@/components/homepage/TopRatedToolsSection";
import CommunityBlogSection from "@/components/homepage/CommunityBlogSection";
import BackgroundEffects from "@/components/homepage/BackgroundEffects";
import FeaturedNews from "@/components/news/FeaturedNews";
import NewStories from "@/components/news/NewStories";
import Link from "next/link";
import { getServerUser } from "@/lib/auth.server";
import { Metadata } from "next";
import PopupCard from "@/components/pop-up/PopUp";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aihubvietnam.com";
const OG_VERSION = process.env.NEXT_PUBLIC_OG_VERSION || "v5-zalo-fix";

// 🔄 Force dynamic rendering to fix build timeout and ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const localizedContent = {
    vi: {
      title: "AIHub Vietnam - Nền tảng AI tiên tiến",
      description: "Khám phá tương lai của trí tuệ nhân tạo với AIHub Vietnam. Tin tức AI mới nhất, công cụ AI hàng đầu, và cộng đồng AI Việt Nam.",
      keywords: ["AI Vietnam", "Trí tuệ nhân tạo", "Công cụ AI", "Tin tức AI", "Machine Learning", "Deep Learning", "AI Tools", "AI News"],
    },
    en: {
      title: "AIHub Vietnam - Advanced AI Platform",
      description: "Discover the future of artificial intelligence with AIHub Vietnam. Latest AI news, top AI tools, and Vietnamese AI community.",
      keywords: ["AI Vietnam", "Artificial Intelligence", "AI Tools", "AI News", "Machine Learning", "Deep Learning"],
    },
  };

  const content = localizedContent[locale as keyof typeof localizedContent] || localizedContent.vi;
  const ogImageUrl = `${SITE_URL}/og-image.png?v=${OG_VERSION}&locale=${locale}&t=${Date.now()}`;

  return {
    title: content.title,
    description: content.description,
    keywords: content.keywords,
    authors: [{ name: "AIHub Vietnam", url: SITE_URL }],
    creator: "AIHub Vietnam",
    publisher: "AIHub Vietnam",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      siteName: "AIHub Vietnam",
      title: content.title,
      description: content.description,
      url: `${SITE_URL}/${locale}`,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: locale === "vi" ? ["en_US"] : ["vi_VN"],
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: content.title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@aihubvietnam",
      creator: "@aihubvietnam",
      title: content.title,
      description: content.description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        'vi': `${SITE_URL}/vi`,
        'en': `${SITE_URL}/en`,
        'x-default': SITE_URL,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
        { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
    },
    manifest: "/site.webmanifest",
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const messages = (await import(`@/lib/i18n/message/${locale}.json`)).default;

  const tFeatured = (key: string) => {
    const keys = key.split(".");
    let value: any = messages.HomePage?.featuredNews;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === "string" ? value : key;
  };

  const tNewStories = (key: string) => {
    const keys = key.split(".");
    let value: any = messages.HomePage?.newStories;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === "string" ? value : key;
  };

  const tHero = (key: string) => {
    const keys = key.split(".");
    let value: any = messages.HomePage?.hero;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === "string" ? value : key;
  };

  const tBreakingNews = (key: string) => {
    const keys = key.split(".");
    let value: any = messages.HomePage?.breakingNews;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === "string" ? value : key;
  };

  const tCommunityBlog = (key: string) => {
    const keys = key.split(".");
    let value: any = messages.HomePage?.communityBlog;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === "string" ? value : key;
  };

  const tTopRated = (key: string) => {
    const keys = key.split(".");
    let value: any = messages.HomePage;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === "string" ? value : key;
  };

  // Get user session (không cần fetch saved tools ở đây nữa)
  const user = await getServerUser();

  const topRatedTools = await getTopTools(0, 4).catch(() => []);
  const blogPosts = await listPosts({ skip: 0, take: 6 }).catch(() => []);
  const newsData = await getNewsData().catch(() => null);

  const newsStories = (newsData?.newStories || []).map(
    (story: any, idx: number) => ({
      ...story,
      slug: story.slug || `story-${idx + 1}`,
      // Don't normalize here - let component handle it to avoid duplicate normalization
      previewImg: story.image,
    })
  );

  const featuredNews = newsData?.featuredNews
    ? {
      ...newsData.featuredNews,
      // Don't normalize here - let FeaturedNews component handle it
      // to avoid duplicate normalization
      image: newsData.featuredNews.image,
    }
    : null;
  const hasFeaturedNews = Boolean(featuredNews);

  return (
    <div className="relative bg-[#0A0F18] font-sans overflow-hidden text-white min-h-screen">
      <PopupCard />
      <div
        className="mx-auto px-4 sm:px-6"
        style={{
          maxWidth: "1440px",
          width: "100%",
        }}
      >
        <HeroSection
          texts={{
            title: tHero("title"),
            subtitle: tHero("subtitle"),
            emailPlaceholder: tHero("emailPlaceholder"),
            signInButton: tHero("signInButton"),
            newsletterAgreement: tHero("newsletterAgreement"),
            welcomeBack: tHero("welcomeBack"),
            exploreDescription: tHero("exploreDescription"),
          }}
        />
        <BreakingNewsSection
          title={tBreakingNews("title")}
          items={
            [
              messages.HomePage?.breakingNews?.items?.products,
              messages.HomePage?.breakingNews?.items?.applications,
              messages.HomePage?.breakingNews?.items?.business,
              messages.HomePage?.breakingNews?.items?.ethics,
              messages.HomePage?.breakingNews?.items?.healthcare,
              messages.HomePage?.breakingNews?.items?.security,
            ].filter(Boolean) as string[]
          }
        />
        {/* Desktop Layout - 2 cột (>=1367px) */}
        <section className="w-full hidden min-[1367px]:block min-[1367px]:mb-[72px]">
          <div
            className={`mx-auto grid grid-cols-1 gap-4 ${hasFeaturedNews
              ? "min-[1367px]:grid-cols-[clamp(820px,52vw,880px)_1fr]"
              : ""
              }`}
            style={{
              maxWidth: "1440px",
              gap: "clamp(40px, 3.8vw, 56px)",
            }}
          >
            {hasFeaturedNews && (
              <div>
                <h4 className="text-xl sm:text-[28px] md:text-[32px] font-bold text-white tracking-tight">
                  {tFeatured("title")}
                </h4>
                {tFeatured("subtitle") && (
                  <p className="mb-4 text-base sm:text-lg text-white/70">
                    {tFeatured("subtitle")}
                  </p>
                )}
              </div>
            )}
            <div>
              <h4 className="text-xl sm:text-[28px] md:text-[32px] font-bold text-white tracking-tight">
                {tNewStories("title")}
              </h4>
              {tNewStories("subtitle") && (
                <p className="mb-4 text-base sm:text-lg text-white/70">
                  {tNewStories("subtitle")}
                </p>
              )}
            </div>
          </div>

          <div
            className={`mx-auto grid grid-cols-1 items-stretch ${hasFeaturedNews
              ? "min-[1367px]:grid-cols-[clamp(820px,52vw,880px)_1fr]"
              : ""
              }`}
            style={{
              maxWidth: "1440px",
              gap: "clamp(40px, 3.8vw, 56px)",
            }}
          >
            {hasFeaturedNews && (
              <div className="w-full">
                <FeaturedNews data={featuredNews!} locale={locale} />
              </div>
            )}
            <div
              className={`w-full flex flex-col self-stretch ${hasFeaturedNews ? "" : "max-w-[880px]"
                }`}
            >
              <div className="flex-1 min-h-0 flex flex-col">
                <NewStories
                  equalHeight
                  gapClass="gap-7 md:gap-9 xl:gap-[42px]"
                  previewHeight={180}
                  stories={newsStories}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mobile & Tablet Layout (≤1366px) */}
        <section className="w-full block min-[1367px]:hidden mb-[30px] gap-y-8">
          <div className="mx-auto flex flex-col gap-6 sm:gap-8">
            {/* Featured + New stories stacked */}
            <div className="flex flex-col gap-6 sm:gap-8">
              <div className="flex flex-col flex-1">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xl sm:text-[28px] md:text-[32px] font-bold text-white">
                      {tFeatured("title")}
                    </h4>
                    <Link
                      href={`/${locale}/news`}
                      className="text-sm sm:text-[20px] lg:text-[28px] font-normal underline text-[#00D3F2] sm:block lg:hidden"
                    >
                      See All
                    </Link>
                  </div>
                  {tFeatured("subtitle") && (
                    <p className="mb-4 text-base sm:text-lg text-white/70">
                      {tFeatured("subtitle")}
                    </p>
                  )}
                </div>
                {featuredNews && (
                  <div className="px-1 sm:px-0">
                    <FeaturedNews data={featuredNews} locale={locale} />
                  </div>
                )}
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xl sm:text-[28px] md:text-[32px] font-bold text-white">
                    {tNewStories("title")}
                  </h4>
                  <Link
                    href={`/${locale}/news`}
                    className="text-sm sm:text-[20px] lg:text-[28px] font-normal underline text-[#00D3F2] sm:block lg:hidden"
                  >
                    See All
                  </Link>
                </div>
                {tNewStories("subtitle") && (
                  <p className="mb-4 text-base sm:text-lg text-white/70">
                    {tNewStories("subtitle")}
                  </p>
                )}
                <div className="-mx-2 sm:-mx-3">
                  <NewStories
                    equalHeight={false}
                    gapClass="gap-6 md:gap-8"
                    previewHeight={140}
                    stories={newsStories}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <div
          className="mx-auto"
          style={{
            maxWidth: "1440px",
            width: "100%",
          }}
        >
          <TopRatedToolsSection
            className="px-0"
            topRatedTools={topRatedTools}
            texts={{
              topRated: tTopRated("topRated"),
              topRatedDesc: tTopRated("topRatedDesc"),
              noResults: tTopRated("noResults"),
            }}
          />
        </div>
        <div
          className="mx-auto"
          style={{
            maxWidth: "1440px",
            width: "100%",
          }}
        >
          <CommunityBlogSection
            blogPosts={blogPosts}
            blogPostsLoading={false}
            locale={locale}
            texts={{
              title: tCommunityBlog("title"),
              subtitle: tCommunityBlog("subtitle"),
              noPosts: tCommunityBlog("noPosts"),
              views: tCommunityBlog("views"),
              likes: tCommunityBlog("likes"),
              comments: tCommunityBlog("comments"),
              shares: tCommunityBlog("shares"),
              readMore: tCommunityBlog("readMore"),
            }}
          />
        </div>
      </div>
      <BackgroundEffects />
    </div>
  );
}
