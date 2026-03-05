import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getRelatedPosts } from "@/services/server/blog.server";
import { getCoverImageUrl } from "@/utils/image.utils";
import { formatTimeAgo } from "@/utils/formatTime";
import { sanitizeBlogHtml } from "@/utils/sanitize.utils";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import ShareButtons from "@/components/landing/news/ShareButtons";
import NewsCard from "@/components/landing/news/NewsCard";
import { getTranslations } from "next-intl/server";
import ReadingProgress from "@/components/blog/ReadingProgress";
import TextHighlight from "@/components/blog/TextHighlight";
import TableOfContents from "@/components/blog/TableOfContents";
import { calculateReadingTime } from "@/utils/readingTime";
import Avatar from "@/components/ui/Avatar";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
    const resolvedParams = await params;
    const post = await getPostBySlug(resolvedParams.slug);

    if (!post) {
        return {
            title: "News Not Found",
        };
    }

    const seo = (post as any).seo || {};

    return {
        title: seo.metaTitle || post.title,
        description: seo.metaDescription || post.category?.description || "",
        openGraph: {
            title: seo.ogTitle || post.title,
            description: seo.ogDescription || post.category?.description,
            images: post.coverImageId ? [getCoverImageUrl(post.coverImageId)] : [],
        },
    };
}

export default async function NewsDetailPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const resolvedParams = await params;
    const { locale, slug } = resolvedParams;
    const t = await getTranslations("Blog");

    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    // Fetch 3 related posts
    const relatedPosts = await getRelatedPosts(post.id, 3);

    const coverImageUrl = getCoverImageUrl(post.coverImageId);
    const readingTime = calculateReadingTime(post.bodyHtml);

    // Get current URL for sharing
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aihubvietnam.com";
    const currentUrl = `${siteUrl}/${locale}/landing/news/${slug}`;

    return (
        <div className="relative overflow-hidden bg-white min-h-screen">
            <ReadingProgress postId={post.id} />
            <TextHighlight />

            <div className="max-w-6xl xl:max-w-[1248px] mx-auto px-4 sm:px-6 md:px-8 lg:px-8 py-4 sm:py-8 md:py-12 lg:py-16 text-gray-900">
                {/* Back Button - Top position, Hidden on mobile */}
                <Link
                    href={`/${locale}/landing/news`}
                    className="hidden sm:inline-flex fixed left-6 top-24 z-30 items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg shadow-lg backdrop-blur-sm border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back</span>
                </Link>

                {/* Main Article */}
                <article className="bg-gradient-to-b from-gray-50/50 to-transparent rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 border border-gray-200 shadow-xl backdrop-blur-sm">
                    {/* Author Info & Category */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 text-sm text-gray-900">
                            <Avatar
                                src={post.content?.author?.avatarUrl || undefined}
                                alt={post.content?.author?.name || "Unknown Author"}
                                size="sm"
                            />
                            <div>
                                <p className="font-semibold text-base">
                                    {post.content?.author?.name || "Unknown Author"}
                                </p>
                                <div className="flex items-center gap-3 text-gray-600 text-xs sm:text-sm">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatTimeAgo(post.content?.createdAt)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {readingTime} min read
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Category Badge */}
                        {post.category?.name && (
                            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-cyan-500/50 bg-cyan-500/10 text-cyan-600 text-xs sm:text-sm font-semibold flex-shrink-0 shadow-lg shadow-cyan-500/10">
                                {post.category.name}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 sm:mb-6 md:mb-8 text-gray-900 tracking-tight">
                        {post.title}
                    </h1>

                    {/* Cover Image */}
                    {post.coverImageId && coverImageUrl && (
                        <div className="mb-8 sm:mb-12 rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
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
                    )}

                    {/* Content */}
                    <div
                        className="prose prose-lg max-w-none leading-relaxed text-gray-900 mb-8 sm:mb-12 
                        prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mb-6 prose-headings:mt-10
                        prose-h1:mb-8 prose-h1:mt-12 prose-h1:leading-tight
                        prose-h2:mb-6 prose-h2:mt-10 prose-h2:leading-tight
                        prose-h3:mb-5 prose-h3:mt-8 prose-h3:leading-snug
                        prose-p:text-gray-900 prose-p:leading-relaxed sm:prose-p:leading-[1.9] lg:prose-p:leading-[2] prose-p:mb-8 prose-p:tracking-wide prose-p:font-normal
                        prose-a:text-cyan-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-a:transition-all
                        prose-strong:text-gray-900 prose-strong:font-bold
                        prose-ul:text-gray-900 prose-ul:my-8 prose-ul:space-y-4 prose-ul:pl-6 prose-ul:list-disc prose-ul:list-outside
                        prose-ol:text-gray-900 prose-ol:my-8 prose-ol:space-y-4 prose-ol:pl-6 prose-ol:list-decimal prose-ol:list-outside
                        prose-li:text-gray-900 prose-li:leading-relaxed sm:prose-li:leading-[1.9] prose-li:pl-2 prose-li:mb-3 prose-li:marker:text-gray-700
                        [&_ul]:!list-disc [&_ul]:!list-outside [&_ul]:ml-6 [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:my-6
                        [&_ol]:!list-decimal [&_ol]:!list-outside [&_ol]:ml-6 [&_ol]:space-y-2 [&_ol]:pl-6 [&_ol]:my-6
                        [&_ul_li]:!list-none [&_ul_li]:ml-0 [&_ul_li]:pl-2 [&_ul_li]:mb-2
                        [&_ol_li]:!list-none [&_ol_li]:ml-0 [&_ol_li]:pl-2 [&_ol_li]:mb-2
                        prose-blockquote:border-l-4 prose-blockquote:border-l-cyan-500/50 prose-blockquote:pl-8 prose-blockquote:pr-6 prose-blockquote:py-6 prose-blockquote:bg-cyan-500/5 prose-blockquote:rounded-r-lg prose-blockquote:text-gray-900 prose-blockquote:italic prose-blockquote:my-10 prose-blockquote:leading-relaxed
                        prose-code:text-cyan-700 prose-code:bg-cyan-500/10 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-mono
                        prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:rounded-xl prose-pre:p-6 prose-pre:my-10 prose-pre:overflow-x-auto
                        prose-img:rounded-xl prose-img:my-10 prose-img:shadow-2xl prose-img:border prose-img:border-gray-200
                        prose-img:max-w-full prose-img:h-auto prose-img:mx-auto prose-img:block
                        prose-hr:border-gray-200 prose-hr:my-12
                        [&_figure.image-container]:my-10 [&_figure.image-container]:flex [&_figure.image-container]:flex-col [&_figure.image-container]:items-center [&_figure.image-container]:w-full
                        [&_figure.image-container_img]:max-w-full [&_figure.image-container_img]:h-auto [&_figure.image-container_img]:rounded-xl [&_figure.image-container_img]:shadow-2xl [&_figure.image-container_img]:border [&_figure.image-container_img]:border-gray-200
                        [&_figcaption.image-caption]:mt-3 [&_figcaption.image-caption]:text-sm [&_figcaption.image-caption]:text-gray-600 [&_figcaption.image-caption]:text-center [&_figcaption.image-caption]:italic [&_figcaption.image-caption]:w-full [&_figcaption.image-caption]:block
                        [&_img[alt]]:cursor-help
                        [&_h1]:text-gray-900 [&_h1]:font-bold [&_h1]:text-3xl [&_h1]:sm:text-4xl [&_h1]:md:text-5xl [&_h1]:mb-6 [&_h1]:mt-8
                        [&_h2]:text-gray-900 [&_h2]:font-bold [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:md:text-4xl [&_h2]:mb-5 [&_h2]:mt-7
                        [&_h3]:text-gray-900 [&_h3]:font-bold [&_h3]:text-xl [&_h3]:sm:text-2xl [&_h3]:md:text-3xl [&_h3]:mb-4 [&_h3]:mt-6
                        [&_h4]:text-gray-900 [&_h4]:font-bold [&_h4]:text-lg [&_h4]:sm:text-xl [&_h4]:md:text-2xl [&_h4]:mb-3 [&_h4]:mt-5
                        [&_h5]:text-gray-900 [&_h5]:font-bold [&_h5]:text-base [&_h5]:sm:text-lg [&_h5]:md:text-xl [&_h5]:mb-2 [&_h5]:mt-4
                        [&_h6]:text-gray-900 [&_h6]:font-bold [&_h6]:text-sm [&_h6]:sm:text-base [&_h6]:md:text-lg [&_h6]:mb-2 [&_h6]:mt-4
                        [&_*]:!font-inherit [&_p]:!font-inherit [&_div]:!font-inherit [&_span]:!font-inherit [&_h1]:!font-inherit [&_h2]:!font-inherit [&_h3]:!font-inherit [&_h4]:!font-inherit [&_h5]:!font-inherit [&_h6]:!font-inherit [&_li]:!font-inherit [&_ul]:!font-inherit [&_ol]:!font-inherit [&_blockquote]:!font-inherit [&_strong]:!font-inherit [&_em]:!font-inherit [&_a]:!font-inherit"
                        style={{
                            fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                        }}
                        dangerouslySetInnerHTML={{
                            __html: sanitizeBlogHtml(post.bodyHtml),
                        }}
                    />
                    {/* Global styles for list formatting */}
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
                            color: rgba(31, 41, 55, 0.7) !important;
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

                    {/* Share Section */}
                    <div className="border-t border-gray-200 py-8 mb-8">
                        <ShareButtons url={currentUrl} title={post.title} />
                    </div>
                </article>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <section className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Bài viết khác</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center mx-auto">
                            {relatedPosts.map((relatedPost) => (
                                <NewsCard
                                    key={relatedPost.id}
                                    imageUrl={getCoverImageUrl(relatedPost.coverImageId)}
                                    category={relatedPost.category?.name || "News"}
                                    date={relatedPost.createdAt ? formatTimeAgo(relatedPost.createdAt) : ''}
                                    title={relatedPost.title}
                                    description={relatedPost.category?.description || ""}
                                    href={`/${locale}/landing/news/${relatedPost.slug}`}
                                    variant="vertical"
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Table of Contents */}
            <TableOfContents theme="light" />
        </div>
    );
}
