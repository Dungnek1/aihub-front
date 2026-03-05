import { Metadata } from "next";
import arrowIcon from "@/public/icon/arrow-right-news.svg";
import Image from "next/image";
import Link from "next/link";
import FeaturedStories from "@/components/news/FeaturedStories";
import { RefreshCw, Copy } from "lucide-react";
import { normalizeImageUrl } from "@/utils/image.utils";
import { BackButton } from "@/components/navigation/BackButton";
import { getTranslations } from "next-intl/server";
import { sanitizeBlogHtml } from "@/utils/sanitize.utils";
import {
  getNewsData,
  getNewsBySlug,
  type NewsDetail,
} from "@/services/client/news.client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  
  // Fetch news detail from API
  const newsDetail = await getNewsBySlug(slug);
  
  const title = newsDetail?.title || "News Article";
  const description = newsDetail?.content 
    ? newsDetail.content.substring(0, 160) 
    : "Read the latest news and updates.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'}/${locale}/news/${slug}`,
    },
  };
}

// 📄 Trang chi tiết news (Server Component)
export default async function NewsDetailPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string; slug: string }>;
}>) {
  const { locale, slug } = await params;
  const t = await getTranslations("Blog");

  // Fetch news detail from API
  const newsDetail = await getNewsBySlug(slug);

  // Fetch related data (for FeaturedStories)
  const data = await getNewsData();
  const { featuredStories } = data;

  // If no news detail found, return 404
  if (!newsDetail) {
    return (
      <div className="relative bg-[#0A0F18] font-sans text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">News Not Found</h1>
          <p className="text-gray-400">The news article you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const post = newsDetail;
  const coverImageUrl = post.image ? normalizeImageUrl(post.image) : null;
  const matchedStory =
    post.nextPost && featuredStories
      ? featuredStories.find((story) => story.slug === post.nextPost?.slug)
      : null;

  const fallbackStory =
    post.nextPost && matchedStory
      ? matchedStory
      : featuredStories && featuredStories.length > 0
      ? featuredStories[0]
      : null;

  const panelPost = post.nextPost
    ? {
        title: post.nextPost.title,
        slug: post.nextPost.slug,
        category: matchedStory?.category || post.category,
        readTime: matchedStory?.readTime || post.readTime,
        image: matchedStory?.image || coverImageUrl,
      }
    : fallbackStory
    ? {
        title: fallbackStory.title,
        slug: fallbackStory.slug || post.slug,
        category: fallbackStory.category,
        readTime: fallbackStory.readTime,
        image: fallbackStory.image,
      }
    : null;

  const panelCoverImage = panelPost?.image
    ? normalizeImageUrl(panelPost.image)
    : null;

  return (
    <div className="relative bg-[#0A0F18] font-sans text-white">
      <div className="max-w-6xl xl:max-w-[1248px] mx-auto px-4 sm:px-6 md:px-8 lg:px-8 py-6 sm:py-8 md:py-12 lg:py-16 text-gray-100">
        <BackButton
          fallbackHref={`/${locale}/news`}
          className="hidden sm:flex fixed left-6 top-1/2 -translate-y-1/2"
        />

        {post.nextPost && (
          <a
            href={`/${locale}/news/${post.nextPost.slug}`}
            className="hidden sm:flex fixed right-6 top-1/2 justify-center items-center text-white bg-gray-800 rounded-full shadow-md transition -translate-y-1/2 hover:bg-gray-700 w-15 h-15"
          >
            <Image alt="right" src={arrowIcon} width={20} height={20} />
          </a>
        )}

        <article>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-white">
              <div className="size-10 rounded-full bg-cyan-500/20 text-cyan-200 flex items-center justify-center font-semibold">
                {post.author?.[0] || "A"}
              </div>
              <div>
                <p className="font-medium">{post.author}</p>
                <p className="text-gray-400 text-xs">{post.readTime}</p>
              </div>
            </div>
            {post.category && (
              <span className="inline-block px-3 py-1.5 rounded-lg border border-cyan-400/50 bg-cyan-400/10 text-cyan-400 text-sm font-medium flex-shrink-0">
                #{post.category}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 sm:mb-6 text-white">
            {post.title}
          </h1>

          {coverImageUrl && (
            <div className="mb-6">
              <Image
                src={coverImageUrl}
                alt={post.title}
                width={1200}
                height={600}
                className="object-cover w-full rounded-2xl"
              />
            </div>
          )}

          <div
            className="prose prose-invert prose-lg max-w-none leading-relaxed text-white/95 mb-8 sm:mb-12 
              prose-headings:text-white prose-headings:font-bold prose-headings:mb-6 prose-headings:mt-10
              prose-h1:mb-8 prose-h1:mt-12 prose-h1:leading-tight
              prose-h2:mb-6 prose-h2:mt-10 prose-h2:leading-tight
              prose-h3:mb-5 prose-h3:mt-8 prose-h3:leading-snug
              prose-p:text-white/95 prose-p:leading-relaxed sm:prose-p:leading-[1.9] lg:prose-p:leading-[2] prose-p:mb-8 prose-p:tracking-wide prose-p:font-normal
              prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-a:transition-all
              prose-strong:text-white prose-strong:font-bold
              prose-ul:text-white/95 prose-ul:my-8 prose-ul:space-y-4 prose-ul:pl-6
              prose-ol:text-white/95 prose-ol:my-8 prose-ol:space-y-4 prose-ol:pl-6
              prose-li:text-white/95 prose-li:leading-relaxed sm:prose-li:leading-[1.9] prose-li:pl-2 prose-li:mb-3
              prose-blockquote:border-l-4 prose-blockquote:border-l-cyan-400/50 prose-blockquote:pl-8 prose-blockquote:pr-6 prose-blockquote:py-6 prose-blockquote:bg-cyan-400/5 prose-blockquote:rounded-r-lg prose-blockquote:text-white/95 prose-blockquote:italic prose-blockquote:my-10 prose-blockquote:leading-relaxed
              prose-code:text-cyan-300 prose-code:bg-cyan-400/10 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-mono
              prose-pre:bg-[#0F172A] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-pre:p-6 prose-pre:my-10 prose-pre:overflow-x-auto
              prose-img:rounded-xl prose-img:my-10 prose-img:shadow-2xl prose-img:border prose-img:border-white/10
              prose-hr:border-white/10 prose-hr:my-12
              [&_*]:!font-inherit [&_p]:!font-inherit [&_div]:!font-inherit [&_span]:!font-inherit [&_h1]:!font-inherit [&_h2]:!font-inherit [&_h3]:!font-inherit [&_h4]:!font-inherit [&_h5]:!font-inherit [&_h6]:!font-inherit [&_li]:!font-inherit [&_ul]:!font-inherit [&_ol]:!font-inherit [&_blockquote]:!font-inherit [&_strong]:!font-inherit [&_em]:!font-inherit [&_a]:!font-inherit"
            style={{
              fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
            dangerouslySetInnerHTML={{
              __html: post.bodyHtml ? sanitizeBlogHtml(post.bodyHtml) : post.content.split("\n").map((p) => `<p>${p}</p>`).join(""),
            }}
          />
        </article>
      </div>

      <div aria-hidden="true">
        {panelPost ? (
          <aside className="hidden xl:block fixed right-6 top-[400px] w-[280px] z-20">
            <div className="group bg-[#1C2333] border border-white/10 rounded-2xl p-4 shadow-[0_15px_35px_rgba(2,6,23,0.45)] transition-all duration-300 hover:border-white/30 hover:shadow-[0_20px_45px_rgba(2,6,23,0.6)]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-white">{t("nextPost")}</p>
                <div className="flex items-center gap-2 text-white/60">
                  <span className="p-1.5 rounded-full bg-white/5">
                    <RefreshCw size={14} strokeWidth={1.6} />
                  </span>
                  <span className="p-1.5 rounded-full bg-white/5">
                    <Copy size={14} strokeWidth={1.6} />
                  </span>
                </div>
              </div>

              <div className="relative h-28 overflow-hidden rounded-xl mb-3 border border-white/15 bg-gradient-to-br from-[#1F2937] to-[#0B1120]">
                {panelCoverImage ? (
                  <Image
                    src={panelCoverImage}
                    alt={panelPost.title}
                    fill
                    className="object-cover translate-y-4 opacity-0 transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:opacity-100 group-hover:scale-105"
                    sizes="280px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/60 text-sm text-center px-3">
                    {panelPost.title}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/80 to-transparent transition-opacity duration-500 group-hover:opacity-80" />
              </div>

              <Link
                href={`/${locale}/news/${panelPost.slug}`}
                className="block text-base font-semibold leading-snug text-white hover:text-cyan-300 transition-colors"
              >
                {panelPost.title}
              </Link>

              <p className="mt-3 text-xs text-white/60">
                {panelPost.category ? `${panelPost.category} • ` : ""}
                {panelPost.readTime || ""}
              </p>
            </div>
          </aside>
        ) : (
          <aside className="hidden xl:block fixed right-6 top-[400px] w-[280px] z-20">
            <div className="bg-[#1C2333] border border-white/10 rounded-2xl p-4 text-white/70 shadow-[0_15px_35px_rgba(2,6,23,0.45)]">
              <p className="text-sm font-semibold text-white">{t("nextPost")}</p>
              <p className="mt-3 text-xs">
                {t("nextPostEmpty")}
              </p>
            </div>
          </aside>
        )}
      </div>

      <section className="px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14 mb-12 w-full text-white">
        <div className="max-w-6xl xl:max-w-[1248px] mx-auto">
          <h2 className="text-xl sm:text-[28px] md:text-[32px] font-bold mb-6 sm:mb-8">Related Posts</h2>
          <FeaturedStories stories={featuredStories} />
        </div>
      </section>
    </div>
  );
}
