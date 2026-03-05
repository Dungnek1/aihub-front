import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BlogDetailInteractionsWrapper from "@/components/blog/BlogDetailInteractionsWrapper";
import FooterSlug from "@/components/blog/FooterSlug";
import {
  getPostBySlug,
  getNextPost,
  getTrendingPosts,
  listPosts,
} from "@/services/server/blog.server";
import Avatar from "@/components/ui/Avatar";
import { getCoverImageUrl } from "@/utils/image.utils";
import { formatTimeAgo } from "@/utils/formatTime";
import { getTranslations } from "next-intl/server";
import { sanitizeBlogHtml } from "@/utils/sanitize.utils";
import { RefreshCw, Copy, Clock } from "lucide-react";
import { BackButton } from "@/components/navigation/BackButton";
import ReadingProgress from "@/components/blog/ReadingProgress";
import TextHighlight from "@/components/blog/TextHighlight";
import TableOfContents from "@/components/blog/TableOfContents";
import AuthorBio from "@/components/blog/AuthorBio";
import { calculateReadingTime } from "@/utils/readingTime";

// 🔄 Force dynamic rendering to fix build timeout and ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 🧩 SEO metadata động (SSR luôn)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    const t = await getTranslations("Blog");
    return {
      title: t("notFound"),
      description: t("notFoundDescription"),
    };
  }

  // Get SEO data from backend
  const seo = (post as any).seo || {};
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://aihubvietnam.com';
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://aihubvietnam.com';
  const postUrl = `${siteUrl}/${resolvedParams.locale}/blog/${resolvedParams.slug}`;

  // Use SEO data or fallback to defaults
  const metaTitle = seo.metaTitle || post.title;
  const metaDescription = seo.metaDescription || post.category?.description || post.bodyHtml?.replace(/<[^>]+>/g, "").slice(0, 160) || "";
  const ogTitle = seo.ogTitle || metaTitle;
  const ogDescription = seo.ogDescription || metaDescription;

  // Build ogImage - ensure it's always an absolute URL from our backend (not proxy URLs)
  let ogImage: string | undefined;

  // Check if seo.ogImage is a proxy URL (e.g., Zalo proxy)
  const isProxyUrl = seo.ogImage && (
    seo.ogImage.includes('zadn.vn') ||
    seo.ogImage.includes('photo-link-talk') ||
    seo.ogImage.includes('photolink')
  );

  // Always prefer coverImageId over seo.ogImage to ensure direct backend URL
  // Only use seo.ogImage if it's not a proxy URL and coverImageId doesn't exist
  if (post.coverImageId && !isProxyUrl) {
    // Use cover image - use getCoverImageUrl for consistency
    const coverImage = getCoverImageUrl(post.coverImageId);
    // Ensure it's absolute
    if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
      ogImage = coverImage;
    } else {
      // If still relative, prepend backend URL
      ogImage = `${backendUrl.replace(/\/+$/, '')}/${coverImage.replace(/^\/+/, '')}`;
    }
  } else if (seo.ogImage && !isProxyUrl) {
    // If ogImage from SEO is provided and not a proxy URL, ensure it's absolute
    ogImage = seo.ogImage.startsWith('http://') || seo.ogImage.startsWith('https://')
      ? seo.ogImage
      : `${backendUrl.replace(/\/+$/, '')}/${seo.ogImage.replace(/^\/+/, '')}`;
  } else if (post.coverImageId) {
    // Fallback: use coverImageId even if seo.ogImage is a proxy URL
    const coverImage = getCoverImageUrl(post.coverImageId);
    if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
      ogImage = coverImage;
    } else {
      ogImage = `${backendUrl.replace(/\/+$/, '')}/${coverImage.replace(/^\/+/, '')}`;
    }
  } else {
    // Fallback to default OG image
    ogImage = `${siteUrl}/og-image.png`;
  }

  const twitterTitle = seo.twitterTitle || ogTitle;
  const twitterDescription = seo.twitterDescription || ogDescription;
  const twitterImage = seo.twitterImage || ogImage;
  const canonicalUrl = seo.canonicalUrl || postUrl;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: postUrl,
      siteName: "AIHub Vietnam",
      images: ogImage
        ? [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: ogTitle,
          },
        ]
        : [],
      type: "article",
      publishedTime: post.content?.createdAt,
      modifiedTime: post.content?.updatedAt,
      authors: post.content?.author?.name ? [post.content.author.name] : undefined,
      tags: post.content?.tags?.map((tag: any) => tag.name) || [],
    },
    twitter: {
      card: seo.twitterCard || "summary_large_image",
      title: twitterTitle,
      description: twitterDescription,
      images: twitterImage ? [twitterImage] : undefined,
    },
  };
}

// 📄 Trang chi tiết blog (Server Component)
export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const resolvedParams = await params; // ✅ unwrap Promise
  const { locale, slug } = resolvedParams;
  const t = await getTranslations("Blog");

  // Fetch post data
  const [post, nextPost, postsList, trendingPosts] = await Promise.all([
    getPostBySlug(slug),
    getNextPost(slug),
    listPosts({ take: 50 }),
    getTrendingPosts(3),
  ]);

  if (!post) {
    return (
      <div className="text-center text-gray-400 py-20">
        <h1 className="text-2xl font-semibold mb-4">{t("notFound")} 😢</h1>
        <p>{t("notFoundDescription")}</p>
      </div>
    );
  }

  // Debug: Log bodyHtml info
  if (typeof window === "undefined") {
    // Server-side logging
    const bodyHtmlLength = post.bodyHtml?.length || 0;
    const imgCount = post.bodyHtml ? (post.bodyHtml.match(/<img/gi) || []).length : 0;
    console.log(`[BlogDetailPage] bodyHtml length: ${bodyHtmlLength}, images: ${imgCount}`);
    if (post.bodyHtml) {
      const preview = post.bodyHtml.substring(0, 300);
      console.log(`[BlogDetailPage] bodyHtml preview: ${preview}...`);
    }
    // Debug cover image
    console.log(`[BlogDetailPage] coverImageId: ${post.coverImageId}`);
  }

  // Use getCoverImageUrl to be consistent with other pages (BlogCard, etc.)
  // This function handles null/undefined and provides fallback
  const coverImageUrl = getCoverImageUrl(post.coverImageId);

  // Debug: Log cover image info
  if (typeof window === "undefined") {
    console.log(`[BlogDetailPage] coverImageId: ${post.coverImageId}`);
    console.log(`[BlogDetailPage] coverImageUrl from getCoverImageUrl: ${coverImageUrl}`);
    console.log(`[BlogDetailPage] NEXT_PUBLIC_BACKEND_URL: ${process.env.NEXT_PUBLIC_BACKEND_URL}`);
  }

  const derivedNextPost =
    postsList?.length > 0
      ? (() => {
        const orderedPosts = postsList;
        const currentIndex = orderedPosts.findIndex(
          (item) => item.slug === slug
        );
        if (currentIndex >= 0 && currentIndex + 1 < orderedPosts.length) {
          return orderedPosts[currentIndex + 1];
        }
        if (currentIndex > 0) {
          return orderedPosts[currentIndex - 1];
        }
        const alternative = orderedPosts.find((item) => item.slug !== slug);
        return alternative || null;
      })()
      : null;

  const fallbackPanelPost =
    trendingPosts?.find((item) => item.slug !== slug) || null;
  const panelPost = nextPost ?? derivedNextPost ?? fallbackPanelPost;
  const panelCoverImage = panelPost?.coverImageId
    ? getCoverImageUrl(panelPost.coverImageId)
    : null;

  const readingTime = calculateReadingTime(post.bodyHtml);

  // Generate JSON-LD Schema
  const seo = (post as any).seo || {};
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://aihubvietnam.com';
  const postUrl = `${siteUrl}/${locale}/blog/${slug}`;

  // Article Schema - Auto-generated from Meta Title, Description, and Cover Image
  const articleSchema: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": seo.metaTitle || post.title,
    "description": seo.metaDescription || post.category?.description || post.bodyHtml?.replace(/<[^>]+>/g, "").slice(0, 200) || "",
    "author": {
      "@type": "Person",
      "name": post.content?.author?.name || "AI Hub Vietnam",
    },
    "publisher": {
      "@type": "Organization",
      "name": "AI Hub Vietnam",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      }
    },
    "datePublished": post.content?.createdAt || post.createdAt,
    "dateModified": post.content?.updatedAt || post.updatedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": postUrl
    },
  };

  // Add image if cover image exists
  if (coverImageUrl) {
    articleSchema.image = {
      "@type": "ImageObject",
      "url": coverImageUrl,
      "width": 1200,
      "height": 630
    };
  }

  // Add article section and keywords if available
  if (post.category?.name) {
    articleSchema.articleSection = post.category.name;
  }
  if (seo.focusKeyword) {
    articleSchema.keywords = [seo.focusKeyword, ...(seo.secondaryKeywords || [])].join(", ");
  }

  // Get DefinedTerm and FAQPage schemas from SEO data if available
  const definedTermSchema = seo.schema?.definedTerm;
  const faqPageSchema = seo.schema?.faqPage;

  return (
    <>
      {/* JSON-LD Structured Data - Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      {/* JSON-LD Structured Data - DefinedTerm Schema */}
      {definedTermSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              ...definedTermSchema,
            }),
          }}
        />
      )}
      {/* JSON-LD Structured Data - FAQPage Schema */}
      {faqPageSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              ...faqPageSchema,
            }),
          }}
        />
      )}

      {/* Nội dung chính với Layout Grid */}
      <div className="relative overflow-hidden bg-[#0A0F18] min-h-screen">
        <ReadingProgress postId={post.id} />
        <TextHighlight />
        <div className="max-w-6xl xl:max-w-[1248px] mx-auto px-4 sm:px-6 md:px-8 lg:px-8 py-4 sm:py-8 md:py-12 lg:py-16 text-gray-100">
          {/* Calculate top position to align with article start */}
          <div
            id="article-start-marker"
            className="absolute top-0 left-0 w-0 h-0"
          />
          {/* Nút back trái - Hidden on mobile */}
          <BackButton
            fallbackHref={`/${locale}/blog`}
            className="hidden sm:flex fixed left-6 top-1/2 -translate-y-1/2 z-30"
          />

          {/* Nội dung chính */}
          <article className="bg-gradient-to-b from-[#0F172A]/50 to-transparent rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 border border-white/5 shadow-2xl backdrop-blur-sm">
            {/* Author Info & Tag */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-3 text-sm text-white">
                <Avatar
                  src={post.content?.author?.avatarUrl || undefined}
                  alt={post.content?.author?.name || "Unknown Author"}
                  size="sm"
                />
                <div>
                  <p className="font-semibold text-base">
                    {post.content?.author?.name || "Unknown Author"}
                  </p>
                  <div className="flex items-center gap-3 text-gray-400 text-xs sm:text-sm">
                    <span>{formatTimeAgo(post.content?.createdAt)}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{readingTime} min read</span>
                    </span>
                  </div>
                </div>
              </div>
              {/* Tag */}
              {post.content?.tags?.[0]?.name && (
                <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-cyan-400/50 bg-cyan-400/10 text-cyan-400 text-xs sm:text-sm font-semibold flex-shrink-0 shadow-lg shadow-cyan-400/10">
                  #{post.content.tags[0].name}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 sm:mb-6 md:mb-8 text-white tracking-tight">
              {post.title}
            </h1>

            {/* Cover Image - LCP element, load eagerly */}
            {/* Only show cover image if post.coverImageId exists (not fallback) */}
            {/* {post.coverImageId && coverImageUrl && (
            <div className="mb-8 sm:mb-12 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <Image
                src={coverImageUrl}
                alt={post.title}
                width={1200}
                height={600}
                priority
                loading="eager"
                className="object-cover w-full h-auto"
              />
            </div>
          )} */}

            {/* Content */}
            <div
              className="prose prose-invert prose-lg max-w-none leading-relaxed text-white/95 mb-8 sm:mb-12 
              prose-headings:text-white prose-headings:font-bold prose-headings:mb-6 prose-headings:mt-10
              prose-h1:mb-8 prose-h1:mt-12 prose-h1:leading-tight
              prose-h2:mb-6 prose-h2:mt-10 prose-h2:leading-tight
              prose-h3:mb-5 prose-h3:mt-8 prose-h3:leading-snug
              prose-p:text-white/95 prose-p:leading-relaxed sm:prose-p:leading-[1.9] lg:prose-p:leading-[2] prose-p:mb-8 prose-p:tracking-wide prose-p:font-normal
              prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-a:transition-all
              prose-strong:text-white prose-strong:font-bold
              prose-ul:text-white/95 prose-ul:my-8 prose-ul:space-y-4 prose-ul:pl-6 prose-ul:list-disc prose-ul:list-outside
              prose-ol:text-white/95 prose-ol:my-8 prose-ol:space-y-4 prose-ol:pl-6 prose-ol:list-decimal prose-ol:list-outside
              prose-li:text-white/95 prose-li:leading-relaxed sm:prose-li:leading-[1.9] prose-li:pl-2 prose-li:mb-3 prose-li:marker:text-white/70
              [&_ul]:!list-disc [&_ul]:!list-outside [&_ul]:ml-6 [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:my-6
              [&_ol]:!list-decimal [&_ol]:!list-outside [&_ol]:ml-6 [&_ol]:space-y-2 [&_ol]:pl-6 [&_ol]:my-6
              [&_ul_li]:!list-none [&_ul_li]:ml-0 [&_ul_li]:pl-2 [&_ul_li]:mb-2
              [&_ol_li]:!list-none [&_ol_li]:ml-0 [&_ol_li]:pl-2 [&_ol_li]:mb-2
              prose-blockquote:border-l-4 prose-blockquote:border-l-cyan-400/50 prose-blockquote:pl-8 prose-blockquote:pr-6 prose-blockquote:py-6 prose-blockquote:bg-cyan-400/5 prose-blockquote:rounded-r-lg prose-blockquote:text-white/95 prose-blockquote:italic prose-blockquote:my-10 prose-blockquote:leading-relaxed
              prose-code:text-cyan-300 prose-code:bg-cyan-400/10 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-mono
              prose-pre:bg-[#0F172A] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-pre:p-6 prose-pre:my-10 prose-pre:overflow-x-auto
              prose-img:rounded-xl prose-img:my-10 prose-img:shadow-2xl prose-img:border prose-img:border-white/10
              prose-img:max-w-full prose-img:h-auto prose-img:mx-auto prose-img:block
              prose-hr:border-white/10 prose-hr:my-12
              [&_figure.image-container]:my-10 [&_figure.image-container]:flex [&_figure.image-container]:flex-col [&_figure.image-container]:items-center [&_figure.image-container]:w-full
              [&_figure.image-container_img]:max-w-full [&_figure.image-container_img]:h-auto [&_figure.image-container_img]:rounded-xl [&_figure.image-container_img]:shadow-2xl [&_figure.image-container_img]:border [&_figure.image-container_img]:border-white/10
              [&_figcaption.image-caption]:mt-3 [&_figcaption.image-caption]:text-sm [&_figcaption.image-caption]:text-white/70 [&_figcaption.image-caption]:text-center [&_figcaption.image-caption]:italic [&_figcaption.image-caption]:w-full [&_figcaption.image-caption]:block
              [&_img[alt]]:cursor-help
              [&_h1]:text-white [&_h1]:font-bold [&_h1]:text-3xl [&_h1]:sm:text-4xl [&_h1]:md:text-5xl [&_h1]:mb-6 [&_h1]:mt-8
              [&_h2]:text-white [&_h2]:font-bold [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:md:text-4xl [&_h2]:mb-5 [&_h2]:mt-7
              [&_h3]:text-white [&_h3]:font-bold [&_h3]:text-xl [&_h3]:sm:text-2xl [&_h3]:md:text-3xl [&_h3]:mb-4 [&_h3]:mt-6
              [&_h4]:text-white [&_h4]:font-bold [&_h4]:text-lg [&_h4]:sm:text-xl [&_h4]:md:text-2xl [&_h4]:mb-3 [&_h4]:mt-5
              [&_h5]:text-white [&_h5]:font-bold [&_h5]:text-base [&_h5]:sm:text-lg [&_h5]:md:text-xl [&_h5]:mb-2 [&_h5]:mt-4
              [&_h6]:text-white [&_h6]:font-bold [&_h6]:text-sm [&_h6]:sm:text-base [&_h6]:md:text-lg [&_h6]:mb-2 [&_h6]:mt-4
              [&_*]:!font-inherit [&_p]:!font-inherit [&_div]:!font-inherit [&_span]:!font-inherit [&_h1]:!font-inherit [&_h2]:!font-inherit [&_h3]:!font-inherit [&_h4]:!font-inherit [&_h5]:!font-inherit [&_h6]:!font-inherit [&_li]:!font-inherit [&_ul]:!font-inherit [&_ol]:!font-inherit [&_blockquote]:!font-inherit [&_strong]:!font-inherit [&_em]:!font-inherit [&_a]:!font-inherit"
              style={{
                fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', // Use web font, not editor font
              }}
              dangerouslySetInnerHTML={{
                __html: sanitizeBlogHtml(post.bodyHtml),
              }}
            />
            {/* Global styles for list formatting - Force all lists to use bullets */}
            <style dangerouslySetInnerHTML={{
              __html: `
              /* Force all lists (ul and ol) to display as bullet points */
              .prose ul,
              .prose ol {
                list-style-type: disc !important;
                list-style-position: outside !important;
                padding-left: 1.5rem !important;
                margin-top: 1.5rem !important;
                margin-bottom: 1.5rem !important;
              }
              .prose li {
                list-style: none !important;
                margin-left: 0 !important;
                padding-left: 0.5rem !important;
                margin-bottom: 0.5rem !important;
              }
              /* Use bullet for both ul and ol */
              .prose ul > li::before,
              .prose ol > li::before {
                content: "•" !important;
                color: rgba(255, 255, 255, 0.7) !important;
                font-weight: bold !important;
                display: inline-block !important;
                width: 1em !important;
                margin-left: -1.5rem !important;
                margin-right: 0.5rem !important;
              }
              /* Force center alignment for all images */
              .prose img {
                display: block !important;
                margin-left: auto !important;
                margin-right: auto !important;
              }
              .prose figure.image-container {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
              }
            `
            }} />

            {/* Engagement Metrics - Moved to bottom, aligned right */}
            <div className="flex justify-end pt-6 border-t border-white/10">
              <BlogDetailInteractionsWrapper
                content={post.content}
                postId={post.id}
                postSlug={post.slug}
              />
            </div>

            {/* Author Bio */}
            {post.content?.author && (
              <AuthorBio
                author={{
                  name: post.content.author.name || "Unknown Author",
                  avatarUrl: post.content.author.avatarUrl,
                  userId: post.content.author.userId,
                }}
                locale={locale}
              />
            )}
          </article>
        </div>

        {/* Table of Contents - Renders for all breakpoints, component handles responsive logic */}
        <TableOfContents />

        {/* Next Post preview - Fixed right sidebar */}
        <div
          aria-hidden="true"
          className="hidden xl:block fixed z-20"
          style={{
            right: "1rem", // More padding from blog, shifted right
            top: "calc(4rem + 4rem)", // Match py-4 sm:py-16 + extra space
          }}
        >
          {/* Next Post preview */}
          {panelPost ? (
            <aside className="mt-6 w-[280px]">
              <div className="group bg-[#1C2333] border border-white/10 rounded-2xl p-3 shadow-[0_15px_35px_rgba(2,6,23,0.45)] transition-all duration-300 hover:border-white/30 hover:shadow-[0_20px_45px_rgba(2,6,23,0.6)]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-white">
                    {t("nextPost")}
                  </p>
                  <div className="flex items-center gap-2 text-white/60">
                    <span className="p-1 rounded-full bg-white/5">
                      <RefreshCw size={12} strokeWidth={1.6} />
                    </span>
                    <span className="p-1 rounded-full bg-white/5">
                      <Copy size={12} strokeWidth={1.6} />
                    </span>
                  </div>
                </div>

                <div className="relative h-24 overflow-hidden rounded-xl mb-3 border border-white/15 bg-gradient-to-br from-[#1F2937] to-[#0B1120]">
                  {panelCoverImage ? (
                    <Image
                      src={panelCoverImage}
                      alt={panelPost.title}
                      fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                      sizes="280px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/60 text-sm text-center px-3">
                      {panelPost.title}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/80 to-transparent transition-opacity duration-500 group-hover:opacity-60" />
                </div>

                <Link
                  href={`/${locale}/blog/${panelPost.slug}`}
                  className="block text-sm font-semibold leading-snug text-white hover:text-cyan-300 transition-colors line-clamp-2"
                >
                  {panelPost.title}
                </Link>

                <p className="mt-2 text-[11px] text-white/60">
                  {panelPost.category?.name
                    ? `${panelPost.category.name} • `
                    : ""}
                  {panelPost.content?.createdAt
                    ? formatTimeAgo(panelPost.content.createdAt)
                    : ""}
                </p>
              </div>
            </aside>
          ) : (
            <aside className="mt-6 w-[280px]">
              <div className="bg-[#1C2333] border border-white/10 rounded-2xl p-3 text-white/70 shadow-[0_15px_35px_rgba(2,6,23,0.45)]">
                <p className="text-xs font-semibold text-white">
                  {t("nextPost")}
                </p>
                <p className="mt-2 text-[11px]">{t("nextPostEmpty")}</p>
              </div>
            </aside>
          )}
        </div>

        {/* Footer */}
        <FooterSlug
          category={post.category?.name}
          authorId={post.content?.author?.userId}
          refId={post.content.id}
          title={post.title}
          tags={post.content?.tags[0]?.name}
        />
      </div>
    </>
  );
}
