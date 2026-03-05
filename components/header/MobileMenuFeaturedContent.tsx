"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Eye,
  ThumbsUp,
  MessageCircle,
  Share2,
  Clock,
  Bookmark,
  ArrowRight,
  Package,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { getNewsDataClient } from "@/services/client/news.client";
import { getTopTools } from "@/services/client/tools.client";
import { filterPosts } from "@/services/client/blog.client";
import { http } from "@/services/http";
import type { IApiResponse } from "@/types/api.types";
import type { Tool } from "@/types/tool.types";
import type { BlogPost } from "@/services/client/blog.client";
import { normalizeImageUrl } from "@/utils/image.utils";

// Helper function to get cover image URL - same logic as News component
// Returns the coverImageId as-is, let normalizeImageUrl handle URL construction
function getCoverImageUrl(coverImageId?: string): string | undefined {
  if (!coverImageId) {
    return undefined;
  }

  // If already a full URL, return as is (like News component)
  if (
    coverImageId.startsWith("http://") ||
    coverImageId.startsWith("https://")
  ) {
    return coverImageId;
  }

  // If starts with /, return as is (like News component)
  if (coverImageId.startsWith("/")) {
    return coverImageId;
  }

  // Return the relative path as-is - will be normalized in imageSrc function
  // This avoids duplicate normalization and path issues
  return coverImageId;
}

interface FeaturedContent {
  type: "news" | "tool" | "blog" | "contact" | "portfolio";
  // News
  newsImage?: string;
  newsTitle?: string;
  // Tool
  toolImage?: string;
  toolTitle?: string;
  toolDescription?: string;
  toolRating?: number;
  toolReviews?: string;
  toolPrice?: string; // "PAID", "TRIAL", etc
  // Blog
  blogImage?: string;
  blogTitle?: string;
  blogTag?: string;
  blogViews?: number;
  blogLikes?: number;
  blogComments?: number;
  blogShares?: number;
  contactImage?: string;
  contactTitle?: string;
  contactSubtitle?: string;
  contactButtonLabel?: string;
  contactHref?: string;
  // Portfolio
  portfolioImage?: string;
  portfolioTitle?: string;
  portfolioSubtitle?: string;
}

interface MobileMenuFeaturedContentProps {
  activeTab: "news" | "tools" | "blog" | "contact" | "portfolio";
}

// Cache for fetched content to avoid re-fetching
const contentCache = new Map<string, FeaturedContent>();

// Prefetch function that can be called externally
export async function prefetchMobileMenuContent(
  tab: "news" | "tools" | "blog" | "contact" | "portfolio"
) {
  // Skip if already cached
  if (contentCache.has(tab)) {
    return;
  }

  try {
    if (tab === "news") {
      const newsData = await getNewsDataClient();
      const featuredNews = newsData.featuredNews;
      const newsContent: FeaturedContent =
        featuredNews && featuredNews.image
          ? {
            type: "news",
            newsImage: (() => {
              try {
                return normalizeImageUrl(featuredNews.image);
              } catch (error) {
                // SECURITY: Do not log image URL normalization errors
                // Only log in development mode for debugging
                if (process.env.NODE_ENV === "development") {
                  console.debug("Failed to normalize news image URL:", error);
                }
                return featuredNews.image; // Fallback to original
              }
            })(),
            newsTitle: featuredNews.title,
          }
          : {
            type: "news",
            newsImage: undefined,
            newsTitle: featuredNews?.title || undefined, // Will use translation in component
          };
      contentCache.set("news", newsContent);
    } else if (tab === "tools") {
      const tools = await getTopTools(0, 1);
      const tool = tools[0];
      const toolContent: FeaturedContent = tool
        ? {
          type: "tool",
          toolImage: tool.logoUrl
            ? (() => {
              try {
                const normalized = normalizeImageUrl(tool.logoUrl);
                return normalized;
              } catch (error) {
                console.error(
                  "❌ [prefetch] Failed to normalize tool image URL:",
                  error,
                  {
                    original: tool.logoUrl,
                  }
                );
                return undefined;
              }
            })()
            : undefined,
          toolTitle: tool.name,
          toolDescription: tool.description || tool.shortDesc || undefined,
          toolRating:
            typeof tool.avgRating === "string"
              ? parseFloat(tool.avgRating)
              : tool.avgRating || 0,
          toolReviews: `${tool.ratingsCount || 0} reviews`,
          toolPrice: tool.price || "TRIAL",
        }
        : {
          type: "tool",
          toolImage: undefined,
          toolTitle: undefined, // Will use translation in component
          toolRating: 0,
          toolReviews: "0 reviews",
          toolPrice: "TRIAL",
        };
      contentCache.set("tools", toolContent);
    } else if (tab === "blog") {
      // Use same API as Community Blog (/blog/posts) to get first post
      try {
        const response = await http.get<IApiResponse<BlogPost[]>>(
          "/blog/posts?skip=0&take=1"
        );
        let posts: BlogPost[] = [];
        if (Array.isArray(response?.data)) {
          posts = response.data;
        } else if (
          response?.data &&
          typeof response.data === "object" &&
          "data" in response.data
        ) {
          const nestedData = (response.data as any).data;
          posts = Array.isArray(nestedData) ? nestedData : [];
        }
        const post = posts && posts.length > 0 ? posts[0] : null;
        const firstTag =
          post?.content?.tags &&
            post.content.tags.length > 0 &&
            post.content.tags[0]?.name
            ? post.content.tags[0].name.trim()
            : undefined;
        const blogContent: FeaturedContent =
          post && post.content
            ? {
              type: "blog",
              blogImage: getCoverImageUrl(post.coverImageId),
              blogTitle: post.title,
              blogTag: firstTag,
              blogViews: post.content.viewsCount || 0,
              blogLikes: post.content.reactionsCount || 0,
              blogComments: post.content.commentsCount || 0,
              blogShares: post.content.sharesCount || 0,
            }
            : {
              type: "blog",
              blogImage: undefined,
              blogTitle: undefined, // Will use translation in component
              blogTag: undefined,
              blogViews: 0,
              blogLikes: 0,
              blogComments: 0,
              blogShares: 0,
            };
        contentCache.set("blog", blogContent);
      } catch (fetchError) {
        // Fallback to filterPosts if /blog/posts API fails
        try {
          const posts = await filterPosts({ take: 1 });
          const post = posts && posts.length > 0 ? posts[0] : null;
          const firstTag =
            post?.content?.tags &&
              post.content.tags.length > 0 &&
              post.content.tags[0]?.name
              ? post.content.tags[0].name.trim()
              : undefined;
          const blogContent: FeaturedContent =
            post && post.content
              ? {
                type: "blog",
                blogImage: getCoverImageUrl(post.coverImageId),
                blogTitle: post.title,
                blogTag: firstTag,
                blogViews: post.content.viewsCount || 0,
                blogLikes: post.content.reactionsCount || 0,
                blogComments: post.content.commentsCount || 0,
                blogShares: post.content.sharesCount || 0,
              }
              : {
                type: "blog",
                blogImage: undefined,
                blogTitle: undefined, // Will use translation in component
                blogTag: undefined,
                blogViews: 0,
                blogLikes: 0,
                blogComments: 0,
                blogShares: 0,
              };
          contentCache.set("blog", blogContent);
        } catch (fallbackError) {
          console.error(`Failed to prefetch ${tab} content:`, fallbackError);
        }
      }
    } else if (tab === "contact") {
      const contactContent: FeaturedContent = {
        type: "contact",
        contactTitle: "Contact",
        contactSubtitle: "Let's build something amazing together.",
        contactButtonLabel: "CONTACT US",
        contactImage: "/panel1.png",
        contactHref: "/contact",
      };
      contentCache.set("contact", contactContent);
    } else if (tab === "portfolio") {
      const portfolioContent: FeaturedContent = {
        type: "portfolio",
        portfolioTitle: "Portfolio",
        portfolioSubtitle: "Explore our other projects.",
        portfolioImage: "/panel1.png",
      };
      contentCache.set("portfolio", portfolioContent);
    }
  } catch (error) {
    console.error(`Failed to prefetch ${tab} content:`, error);
  }
}

export default function MobileMenuFeaturedContent({
  activeTab,
}: MobileMenuFeaturedContentProps) {
  const t = useTranslations("Header");
  const tAITools = useTranslations("AITools");
  const locale = useLocale();
  const [content, setContent] = useState<FeaturedContent | null>(() => {
    // Try to get from cache first
    return contentCache.get(activeTab) || null;
  });
  const [loading, setLoading] = useState(() => {
    // Only show loading if not in cache
    return !contentCache.has(activeTab);
  });
  const [imageError, setImageError] = useState(false);
  const imageErrorRef = useRef<string | null>(null); // Track which image URL failed
  const [toolImageError, setToolImageError] = useState(false); // Separate error state for tool image

  // Memoize imageSrc helper to avoid recreating function on every render
  // MUST be called before any early returns to follow Rules of Hooks
  const imageSrc = useMemo(
    () => (img?: string) => {
      if (!img || img === "undefined" || img === "null") {
        return null;
      }
      if (img.startsWith("/")) {
        return img;
      }
      try {
        // Use normalizeImageUrl to handle all URL cases properly
        const normalized = normalizeImageUrl(img);
        return normalized;
      } catch (error) {
        // SECURITY: Do not log image URL normalization errors
        // Only log in development mode for debugging
        if (process.env.NODE_ENV === "development") {
          console.debug("[imageSrc] Failed to normalize image URL:", error, {
            original: img,
          });
        }
        return null;
      }
    },
    []
  );

  // Memoize image URLs - MUST be called before any early returns to follow Rules of Hooks
  // Use safe access with optional chaining to handle null content
  const currentImage = useMemo(
    () =>
      content?.newsImage ||
      content?.toolImage ||
      content?.blogImage ||
      content?.contactImage ||
      null,
    [content]
  );

  // Memoize normalized image URLs to avoid calling imageSrc multiple times
  const originalImageUrl = useMemo(
    () => (currentImage ? imageSrc(currentImage) : null),
    [currentImage, imageSrc]
  );

  // Memoize tool image URL separately to avoid calling imageSrc multiple times
  const toolImageUrl = useMemo(
    () => (content?.toolImage ? imageSrc(content.toolImage) : null),
    [content, imageSrc]
  );

  // Memoize final image URL based on error state
  const imageUrl = useMemo(
    () =>
      imageError || imageErrorRef.current === originalImageUrl
        ? null
        : originalImageUrl,
    [imageError, originalImageUrl]
  );

  useEffect(() => {
    // Check cache first
    const cachedContent = contentCache.get(activeTab);
    if (cachedContent) {
      setContent(cachedContent);
      setLoading(false);
      setToolImageError(false); // Reset tool image error when switching tabs
      return;
    }

    let isMounted = true;

    const fetchContent = async () => {
      if (!isMounted) return;

      setLoading(true);
      setImageError(false); // Reset image error when fetching new content
      setToolImageError(false); // Reset tool image error
      imageErrorRef.current = null; // Reset error ref

      try {
        if (activeTab === "news") {
          // Fetch Featured News from API
          const newsData = await getNewsDataClient();
          if (!isMounted) return;

          const featuredNews = newsData.featuredNews;
          const newsContent: FeaturedContent =
            featuredNews && featuredNews.image
              ? {
                type: "news",
                newsImage: (() => {
                  try {
                    return normalizeImageUrl(featuredNews.image);
                  } catch (error) {
                    console.error(
                      "Failed to normalize news image URL:",
                      error
                    );
                    return featuredNews.image; // Fallback to original
                  }
                })(),
                newsTitle: featuredNews.title,
              }
              : {
                type: "news",
                newsImage: undefined,
                newsTitle: featuredNews?.title || t("featuredNews"),
              };

          // Cache the content
          contentCache.set("news", newsContent);
          if (isMounted) {
            setContent(newsContent);
            setLoading(false);
          }
        } else if (activeTab === "tools") {
          // Fetch Top Rated Tools
          const tools = await getTopTools(0, 1);
          if (!isMounted) return;

          const tool = tools && tools.length > 0 ? tools[0] : null;
          const toolContent: FeaturedContent = tool
            ? {
              type: "tool",
              toolImage: tool.logoUrl
                ? (() => {
                  try {
                    const normalized = normalizeImageUrl(tool.logoUrl);
                    return normalized;
                  } catch (error) {
                    console.error(
                      "❌ [useEffect] Failed to normalize tool image URL:",
                      error,
                      {
                        original: tool.logoUrl,
                      }
                    );
                    return undefined;
                  }
                })()
                : undefined,
              toolTitle: tool.name,
              toolDescription:
                tool.description || tool.shortDesc || undefined,
              toolRating:
                typeof tool.avgRating === "string"
                  ? parseFloat(tool.avgRating)
                  : tool.avgRating || 0,
              toolReviews: `${tool.ratingsCount || 0} ${tAITools("reviews")}`,
              toolPrice: tool.price || "TRIAL",
            }
            : {
              type: "tool",
              toolImage: undefined,
              toolTitle: t("topRatedTool"),
              toolDescription: undefined,
              toolRating: 0,
              toolReviews: `0 ${tAITools("reviews")}`,
              toolPrice: "TRIAL",
            };

          // Cache the content
          contentCache.set("tools", toolContent);
          if (isMounted) {
            setContent(toolContent);
            setLoading(false);
          }
        } else if (activeTab === "blog") {
          // Fetch Blog posts - use public endpoint (/blog/filter) to get first post
          // Default to PUBLISHED status for community blog posts
          const status = "PUBLISHED";
          try {
            const response = await http.get<IApiResponse<BlogPost[]>>(
              `/blog/filter?status=${status}&skip=0&take=1`
            );
            let posts: BlogPost[] = [];
            if (Array.isArray(response?.data)) {
              posts = response.data;
            } else if (
              response?.data &&
              typeof response.data === "object" &&
              "data" in response.data
            ) {
              const nestedData = (response.data as any).data;
              posts = Array.isArray(nestedData) ? nestedData : [];
            }
            if (!isMounted) return;

            const post = posts && posts.length > 0 ? posts[0] : null;
            if (post && post.content) {
              // Get first tag from API, only if exists
              const firstTag =
                post.content.tags &&
                  post.content.tags.length > 0 &&
                  post.content.tags[0]?.name
                  ? post.content.tags[0].name.trim() // Trim whitespace
                  : undefined;

              const blogContent: FeaturedContent = {
                type: "blog",
                blogImage: getCoverImageUrl(post.coverImageId),
                blogTitle: post.title,
                blogTag: firstTag, // Only from API, no fallback
                blogViews: post.content.viewsCount || 0,
                blogLikes: post.content.reactionsCount || 0,
                blogComments: post.content.commentsCount || 0,
                blogShares: post.content.sharesCount || 0,
              };

              // Cache the content
              contentCache.set("blog", blogContent);
              if (isMounted) {
                setContent(blogContent);
                setLoading(false);
              }
            } else {
              // No fallback image
              const blogContent: FeaturedContent = {
                type: "blog",
                blogImage: undefined,
                blogTitle: t("featuredBlog"),
                blogTag: undefined,
                blogViews: 0,
                blogLikes: 0,
                blogComments: 0,
                blogShares: 0,
              };

              // Cache the content
              contentCache.set("blog", blogContent);
              if (isMounted) {
                setContent(blogContent);
                setLoading(false);
              }
            }
          } catch (fetchError) {
            // Only log error if it's not an authentication issue
            if (!(fetchError instanceof Error && fetchError?.message?.includes("Unauthorized"))) {
              console.error("Failed to fetch blog post:", fetchError);
            }
            if (!isMounted) return;
            // Fallback to filterPosts if /blog/filter API fails
            try {
              const posts = await filterPosts({ take: 1 });
              if (!isMounted) return;
              const post = posts && posts.length > 0 ? posts[0] : null;
              if (post && post.content) {
                const firstTag =
                  post.content.tags &&
                    post.content.tags.length > 0 &&
                    post.content.tags[0]?.name
                    ? post.content.tags[0].name.trim()
                    : undefined;
                const blogContent: FeaturedContent = {
                  type: "blog",
                  blogImage: getCoverImageUrl(post.coverImageId),
                  blogTitle: post.title,
                  blogTag: firstTag,
                  blogViews: post.content.viewsCount || 0,
                  blogLikes: post.content.reactionsCount || 0,
                  blogComments: post.content.commentsCount || 0,
                  blogShares: post.content.sharesCount || 0,
                };
                contentCache.set("blog", blogContent);
                if (isMounted) {
                  setContent(blogContent);
                  setLoading(false);
                }
              } else {
                const blogContent: FeaturedContent = {
                  type: "blog",
                  blogImage: undefined,
                  blogTitle: t("featuredBlog"),
                  blogTag: undefined,
                  blogViews: 0,
                  blogLikes: 0,
                  blogComments: 0,
                  blogShares: 0,
                };
                contentCache.set("blog", blogContent);
                if (isMounted) {
                  setContent(blogContent);
                  setLoading(false);
                }
              }
            } catch (fallbackError) {
              console.error(
                "Failed to fetch blog post fallback:",
                fallbackError
              );
              if (isMounted) {
                setLoading(false);
              }
            }
          }
        } else if (activeTab === "contact") {
          const contactContent: FeaturedContent = {
            type: "contact",
            contactImage: "/panel1.png",
            contactTitle: t("contact"),
            contactSubtitle: t("contactSubtitle", {
              defaultMessage: "Let's build something amazing together.",
            } as any),
            contactButtonLabel: "CONTACT US",
            contactHref: `/${locale}/contact`,
          };
          contentCache.set("contact", contactContent);
          if (isMounted) {
            setContent(contactContent);
            setLoading(false);
          }
        } else if (activeTab === "portfolio") {
          const portfolioContent: FeaturedContent = {
            type: "portfolio",
            portfolioTitle: t("portfolio"),
            portfolioSubtitle: t("exploreDescription"),
            portfolioImage: "/panel1.png",
          };
          contentCache.set("portfolio", portfolioContent);
          if (isMounted) {
            setContent(portfolioContent);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Failed to fetch featured content:", error);
        if (!isMounted) return;

        // No fallback image on error
        const errorContent: FeaturedContent = {
          type:
            activeTab === "news"
              ? "news"
              : activeTab === "tools"
                ? "tool"
                : activeTab === "blog"
                  ? "blog"
                  : "contact",
          newsImage: undefined,
          toolImage: undefined,
          blogImage: undefined,
          contactImage: undefined,
          newsTitle: activeTab === "news" ? t("featuredNews") : undefined,
          toolTitle: activeTab === "tools" ? t("topRatedTool") : undefined,
          blogTitle: activeTab === "blog" ? t("featuredBlog") : undefined,
          contactTitle: activeTab === "contact" ? t("contact") : undefined,
          portfolioTitle: activeTab === "portfolio" ? t("portfolio") : undefined,
          contactButtonLabel: "CONTACT US",
          contactHref: `/${locale}/contact`,
        };

        // Cache the error content too
        contentCache.set(activeTab, errorContent);
        if (isMounted) {
          setContent(errorContent);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchContent();

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  if (loading || !content) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-[#1a2332] to-[#0f1520] h-40 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <div className="text-gray-400 text-xs">{t("loading")}</div>
        </div>
      </div>
    );
  }

  // Tool UI - Card layout with icon, name, reviews, rating, and Trial button
  if (content.type === "tool") {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-[#1a2332] to-[#0f1520] h-40 p-3">
        <div className="flex flex-col h-full">
          <div className="flex items-start gap-3 mb-auto">
            {/* Left Side: Icon */}
            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center">
              {toolImageUrl && !toolImageError ? (
                <img
                  src={toolImageUrl}
                  alt={content.toolTitle || t("topRatedTool")}
                  className="w-full h-full object-cover"
                  style={{ objectFit: "cover" }}
                  onError={() => {
                    setToolImageError(true);
                  }}
                />
              ) : (
                // Fallback UI giống như UI dưới trang (TopToolCard)
                <div className="w-full h-full rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Package className="w-10 h-10 text-cyan-400" />
                </div>
              )}
            </div>

            {/* Right Side: Title + Description + Bookmark */}
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <h3 className="text-white font-bold text-base line-clamp-1">
                    {content.toolTitle || t("topRatedTool")}
                  </h3>
                  {content.toolDescription && (
                    <p className="text-gray-400 text-xs line-clamp-2">
                      {content.toolDescription}
                    </p>
                  )}
                </div>
                <Bookmark className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* Bottom Section: Stars + Rating Number + Trial Button (same row) */}
          <div className="flex items-center mt-auto">
            {/* Stars + Rating Number */}
            <div className="flex items-center gap-2">
              {/* Stars */}
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(content.toolRating || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-500"
                      }`}
                  />
                ))}
              </div>
              {/* Rating Number */}
              <span className="text-white font-bold text-base">
                {content.toolRating?.toFixed(1)}
              </span>
            </div>

            {/* Trial/PAID Button */}
            <button className="px-2.5 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-white text-xs font-medium hover:bg-yellow-500/30 transition-colors flex-shrink-0 ml-auto">
              {content.toolPrice === "PAID"
                ? tAITools("paid")
                : tAITools("trial")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (content.type === "contact" || content.type === "portfolio") {
    const image = content.type === "contact" ? content.contactImage : content.portfolioImage;
    const title = content.type === "contact" ? content.contactTitle : content.portfolioTitle;
    const displayImage = image || imageUrl;

    return (
      <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-[#1a2332] to-[#0f1520] h-40">
        {displayImage ? (
          <img
            src={displayImage}
            alt={title || t("contact")}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
            {title || t("contact")}
          </div>
        )}
      </div>
    );
  }

  // News and Blog UI - Background image with overlay
  return (
    <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-[#1a2332] to-[#0f1520] h-40">
      {/* Background Image */}
      {imageUrl ? (
        <div className="absolute inset-0">
          <img
            key={originalImageUrl || "image"} // Force re-render when URL changes
            src={imageUrl}
            alt={
              content.newsTitle ||
              content.toolTitle ||
              content.blogTitle ||
              (content.type === "news"
                ? t("featuredNews")
                : content.type === "blog"
                  ? t("featuredBlog")
                  : t("topRatedTool"))
            }
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const failedUrl = target.src;
              // SECURITY: Do not log image loading errors to console
              // Image loading failures are common and not security issues
              // Only log in development mode for debugging
              if (process.env.NODE_ENV === "development") {
                console.debug("[Image] Failed to load:", failedUrl);
              }
              // Hide image on error
              if (imageErrorRef.current !== failedUrl) {
                imageErrorRef.current = failedUrl;
                setImageError(true);
                // Hide the image element
                target.style.display = "none";
              }
            }}
          />
          {/* Blog Tag Badge - Top Right Corner */}
          {content.type === "blog" && content.blogTag && (
            <div className="absolute top-3 right-3 z-20">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-cyan-400/90 border border-cyan-300/50 text-white text-xs font-semibold shadow-lg shadow-cyan-400/30 backdrop-blur-sm">
                #{content.blogTag.toLowerCase()}
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Loading indicator when no image */
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <div className="text-gray-400 text-xs">{t("loading")}</div>
          </div>
        </div>
      )}

      {/* Content Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-3">
        {/* Bottom: Title and Metrics (for Blog) */}
        {content.type === "blog" && (
          <div className="flex flex-col gap-1.5 relative z-20">
            {/* Title */}
            <h3 className="text-white font-bold text-base line-clamp-2 drop-shadow-lg">
              {content.blogTitle || t("featuredBlog")}
            </h3>

            {/* Metrics */}
            <div className="flex items-center gap-2.5 text-xs text-white">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{content.blogViews?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                <span>{content.blogLikes?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>{content.blogComments?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="w-3 h-3" />
                <span>{content.blogShares?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gradient overlay for better text readability - only at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-0" />
      {/* Top gradient overlay for tag visibility */}
      {content.type === "blog" && (
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/60 via-black/30 to-transparent pointer-events-none z-[5]" />
      )}
    </div>
  );
}
