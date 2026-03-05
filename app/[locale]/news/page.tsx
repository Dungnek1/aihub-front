import FeaturedStories from "@/components/news/FeaturedStories";
import NewStories from "@/components/news/NewStories";
import { getNewsData } from "@/services/client/news.client";
import { normalizeImageUrl } from "@/utils/image.utils";
import { Metadata } from "next";
import increaseIcon from "@/public/icon/increase-icon.svg";
import Image from "next/image";
import Link from "next/link";
import NewsHighlightsSection from "@/components/news/NewsHighlightsSection";
import ListNewsSection from "@/components/news/ListNewsSection";
import { httpServer } from "@/services/http.server";
import type { BlogPost } from "@/services/client/blog.client";
import type { IApiResponse } from "@/types/api.types";

// 🔄 Force dynamic rendering to fix build timeout and ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>): Promise<Metadata> {
  const { locale } = await params;
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000"
    ),
    title: "AI News Portal | Cập nhật xu hướng AI mới nhất",
    description:
      "Khám phá tin tức, bài viết và nghiên cứu mới nhất về trí tuệ nhân tạo, công nghệ lượng tử, và AI tương lai. Cập nhật nhanh, chuẩn SEO, trải nghiệm mượt.",
    keywords: [
      "AI",
      "Machine Learning",
      "Deep Learning",
      "Tech News",
      "Quantum AI",
    ],
    openGraph: {
      title: "AI News Portal - Cập nhật tin tức AI mới nhất",
      description:
        "Trang tin tức công nghệ trí tuệ nhân tạo hàng đầu. Đọc ngay những bài viết chuyên sâu từ các chuyên gia.",
      url: `/${locale}/news`,
      siteName: "AI News Portal",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "AI News Portal Preview",
        },
      ],
      locale: locale === "vi" ? "vi_VN" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "AI News Portal | Tin tức AI mới nhất",
      description:
        "Theo dõi các xu hướng trí tuệ nhân tạo, công nghệ lượng tử và tương lai AI.",
      images: ["/og-image.jpg"],
    },
  };
}

export default async function NewsPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!locale || (locale !== "vi" && locale !== "en")) {
    throw new Error(`Invalid locale: ${locale}`);
  }

  try {
    const messages = (await import(`@/lib/i18n/message/${locale}.json`))
      .default;
    const t = (key: string): string => {
      const fullKey = key.startsWith("HomePage.") ? key : `HomePage.${key}`;
      const keys = fullKey.split(".");
      let value: any = messages;
      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = value[k];
        } else {
          return key;
        }
      }
      return typeof value === "string" ? value : key;
    };

    const data = await getNewsData();
    const { featuredNews: featuredNewsData, newStories = [] } = data;

    // Fetch blog posts for Featured Stories with limit 9
    let featuredStoriesPosts: BlogPost[] = [];
    try {
      const response = await httpServer.get<IApiResponse<BlogPost[]>>(
        "/blog/admin/posts?limit=9"
      );

      // Handle different response structures
      let posts: BlogPost[] = [];
      if (Array.isArray(response)) {
        posts = response;
      } else if (response?.data && Array.isArray(response.data)) {
        posts = response.data;
      }

      // Skip first post (featured news), take next 8 posts for featured stories
      featuredStoriesPosts = posts.slice(1, 9);
    } catch (error) {
      console.error("Error fetching featured stories posts:", error);
      featuredStoriesPosts = [];
    }

    // Transform BlogPost to FeaturedStory format
    const featuredStories = featuredStoriesPosts.map((post) => {
      const description =
        post.bodyHtml?.replace(/<[^>]*>/g, "").substring(0, 100) || "";
      return {
        title: post.title,
        image: post.coverImageId || "",
        slug: post.slug,
        author:
          post.content?.author?.name ||
          post.content?.author?.username ||
          "Administrator",
        readTime: post.content?.createdAt
          ? (() => {
            const date = new Date(post.content.createdAt);
            const now = new Date();
            const diffInMs = now.getTime() - date.getTime();
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
            if (diffInDays === 0) return "Today";
            if (diffInDays === 1) return "Yesterday";
            if (diffInDays < 7) return `${diffInDays} days ago`;
            if (diffInDays < 30)
              return `${Math.floor(diffInDays / 7)} weeks ago`;
            return date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
          })()
          : "Recently",
        category: post.category?.name || "Article",
        description: description,
      };
    });

    // Fetch blog posts for List News section - using same API as Featured News with limit 9
    let blogPosts: BlogPost[] = [];
    try {
      const response = await httpServer.get<IApiResponse<BlogPost[]>>(
        "/blog/admin/posts?limit=9"
      );

      // Handle different response structures
      if (Array.isArray(response)) {
        blogPosts = response;
      } else if (response?.data && Array.isArray(response.data)) {
        blogPosts = response.data;
      }
    } catch (error) {
      console.error("Error fetching list news posts:", error);
      blogPosts = [];
    }

    if (!featuredNewsData) {
      throw new Error("Featured news data is missing");
    }

    return (
      <div className="relative bg-[#0A0F18] font-sans overflow-hidden text-white">
        <div
          className="mx-auto px-4 sm:px-6 xl:px-0"
          style={{
            maxWidth: "1440px",
            width: "100%",
          }}
        >
          <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-[57px]">
            <NewsHighlightsSection
              locale={locale}
              featuredNews={
                featuredNewsData
                  ? {
                    ...featuredNewsData,
                    image: normalizeImageUrl(featuredNewsData.image),
                  }
                  : null
              }
              stories={newStories.map((story) => ({
                ...story,
                previewImg: normalizeImageUrl(story.image),
              }))}
              texts={{
                featuredTitle: t("featuredNews.title"),
                featuredSubtitle: t("featuredNews.subtitle"),
                storiesTitle: t("newStories.title"),
                storiesSubtitle: t("newStories.subtitle"),
              }}
              newStoriesProps={{
                equalHeight: true,
                gapClass: "gap-7 md:gap-9 xl:gap-[42px]",
                previewHeight: 180,
              }}
            />
          </div>

          {/* Mobile: New Stories Section */}
          <section id="new-stories" className="lg:hidden mb-6 sm:mb-8 md:mb-10">
            <div className="mb-4">
              <h4 className="text-xl sm:text-[28px] md:text-[32px] font-bold text-white mb-2">
                {t("newStories.title")}
              </h4>
              <p className="text-base sm:text-lg text-white/70">
                {t("newStories.subtitle")}
              </p>
            </div>
            <div className="-mx-4 sm:-mx-6 lg:mx-0">
              <NewStories
                stories={newStories.map((story) => ({
                  ...story,
                  previewImg: normalizeImageUrl(story.image),
                }))}
                equalHeight={false}
                gapClass="gap-4"
                previewHeight={180}
              />
            </div>
          </section>

          <section
            id="featured-stories"
            className="relative mt-12 sm:mt-16 mb-6 sm:mb-[57px]"
          >
            <div className="mb-4">
              <h3 className="text-white text-xl sm:text-[28px] md:text-[32px] font-bold flex items-center gap-2">
                {t("featuredStories.title")}
              </h3>
              <p className="mt-2 text-base sm:text-lg text-white/70">
                {t("featuredStories.subtitle")}
              </p>
            </div>
            <div>
              <FeaturedStories stories={featuredStories} />
            </div>
          </section>

          {/* List News Section - Desktop only (hidden on mobile and tablet) */}
          <div className="hidden lg:block">
            <ListNewsSection
              blogPosts={blogPosts}
              blogPostsLoading={false}
              locale={locale}
              texts={{
                title: t("listNews.title"),
                subtitle: t("listNews.subtitle"),
                noPosts: t("listNews.noPosts"),
                views: t("listNews.views"),
                likes: t("listNews.likes"),
                comments: t("listNews.comments"),
                shares: t("listNews.shares"),
                readMore: t("listNews.readMore"),
              }}
            />
          </div>
        </div>

        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-20 blur-3xl bg-linear-to-br from-light-green"></div>
          <div className="absolute right-20 bottom-20 w-80 h-80 rounded-full blur-3xl bg-linear-to-br from-primary-cyan to-light-green opacity-15"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl transform -translate-x-1/2 -translate-y-1/2 bg-linear-to-br from-primary-cyan"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(159,243,223,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(159,243,223,0.03)_1px,transparent_1px)] bg-size-[50px_50px]"></div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading news page:", error);
    return (
      <main className="relative bg-[#0A0F18] font-sans overflow-hidden text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error loading news</h1>
          <p className="text-gray-400">Please try again later.</p>
        </div>
      </main>
    );
  }
}
