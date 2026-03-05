"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { getPostBySlug } from "@/services/client/blog.client";

interface BreadcrumbItem {
  label: string;
  href: string;
}

// Helper function to safely get translation
// Returns fallback immediately to avoid next-intl errors
function safeTranslate(
  t: (key: string) => string,
  key: string,
  locale: string,
  fallback: { vi: string; en: string }
): string {
  // Use fallback directly to avoid MISSING_MESSAGE errors
  // Translation keys should exist, but if they don't, we have fallbacks
  return locale === "vi" ? fallback.vi : fallback.en;
}

function BreadcrumbContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("Header");
  const tBlog = useTranslations("Blog");
  const tNews = useTranslations("HomePage.featuredNews");
  const tAITools = useTranslations("AITools");
  const [blogTitle, setBlogTitle] = useState<string | null>(null);
  const [isLoadingBlogTitle, setIsLoadingBlogTitle] = useState(false);

  // Extract blog slug from pathname
  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
  const segments = pathWithoutLocale.split("/").filter(Boolean);
  const blogSlug =
    segments.length === 2 &&
    segments[0] === "blog" &&
    segments[1] &&
    !["write", "my-post", "activity-log", "community"].includes(segments[1])
      ? segments[1]
      : null;

  // Fetch blog title if on blog detail page
  useEffect(() => {
    if (blogSlug) {
      setIsLoadingBlogTitle(true);
      getPostBySlug(blogSlug)
        .then((post) => {
          if (post?.title) {
            setBlogTitle(post.title);
          }
          setIsLoadingBlogTitle(false);
        })
        .catch((error) => {
          console.error("Failed to fetch blog title:", error);
          setIsLoadingBlogTitle(false);
        });
    } else {
      setBlogTitle(null);
      setIsLoadingBlogTitle(false);
    }
  }, [blogSlug]);

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [];
    items.push({
      label: t("home"),
      href: `/${locale}`,
    });

    if (segments.length === 0) {
      return items;
    }

    let currentPath = `/${locale}`;

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      let label = segment;
      const isLastSegment = index === segments.length - 1;
      const prevSegment = index > 0 ? segments[index - 1] : null;

      const isBlogDetailSlug =
        prevSegment === "blog" &&
        isLastSegment &&
        !["write", "my-post", "activity-log", "community"].includes(segment);

      const isNewsDetailSlug = prevSegment === "news" && isLastSegment;

      switch (segment) {
        case "news":
          label = t("news");
          break;
        case "ai-tools":
          label = t("aiTools");
          break;
        case "courses":
          label = tAITools("coursesTitle") || "Courses";
          break;
        case "marketing-tools":
          label = tAITools("toolsMarketingTitle") || "Marketing Tools";
          break;
        case "blog":
          label = t("blog");
          break;
        case "write":
          label = tBlog("writeBlog");
          break;
        case "my-post":
          label = tBlog("myPosts");
          break;
        case "activity-log":
          label = tBlog("activityLog");
          break;
        case "community":
          label = tBlog("Community Posts");
          break;
        case "featured":
          label = t("breadcrumb.featured");
          break;
        case "new":
          label = t("breadcrumb.new");
          break;
        case "stories":
          label = t("breadcrumb.stories");
          break;
        case "about": {
          label = safeTranslate(t, "about", locale, {
            vi: "Về chúng tôi",
            en: "About Us",
          });
          break;
        }
        case "contact": {
          label = safeTranslate(t, "contact", locale, {
            vi: "Liên Hệ",
            en: "Contact",
          });
          break;
        }
        case "career":
        case "careers": {
          label = safeTranslate(t, "careers", locale, {
            vi: "Tuyển dụng",
            en: "Careers",
          });
          break;
        }
        case "privacy": {
          label = safeTranslate(t, "privacy", locale, {
            vi: "Chính sách bảo mật",
            en: "Privacy Policy",
          });
          break;
        }
        default:
          // For news detail page slug, show breadcrumb based on source query parameter
          if (isNewsDetailSlug) {
            const source = searchParams?.get("source");
            if (source === "featured-news") {
              label = t("breadcrumb.featuredNews");
            } else if (source === "new-stories") {
              label = t("breadcrumb.newStories");
            } else if (source === "featured-stories") {
              label = t("breadcrumb.featuredStories");
            } else {
              // Default to "News Detail" if no source
              label = t("breadcrumb.newsDetail");
            }
          } else if (isBlogDetailSlug) {
            // For blog detail page slug, only show blog title if available
            // Don't show "Blog Detail" while loading - skip this item
            if (!blogTitle && isLoadingBlogTitle) {
              return; // Skip adding this breadcrumb item while loading
            }
            if (!blogTitle) {
              return; // Skip if no title available
            }
            label = blogTitle;
          } else {
            // For other slugs or dynamic segments, try to format them
            label = segment
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
          }
      }

      items.push({
        label,
        href: currentPath,
      });
    });

    return items;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumb on home page
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="text-base sm:text-lg text-gray-400 mb-4 sm:mb-6 text-left">
      <div
        className="mx-auto px-4 sm:px-6 xl:px-0"
        style={{
          maxWidth: "1440px",
          width: "100%",
        }}
      >
        <div className="flex items-center flex-wrap gap-1 justify-start">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <div key={item.href} className="flex items-center gap-1">
                <>
                  <Link
                    href={item.href}
                    className={`font-semibold text-cyan-300 transition-colors ${
                      isLast ? "" : "hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                  {!isLast && (
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  )}
                </>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function BreadcrumbFallback() {
  return (
    <nav className="text-base sm:text-lg text-gray-400 mb-4 sm:mb-6 text-left">
      <div
        className="mx-auto px-4 sm:px-6 xl:px-0"
        style={{
          maxWidth: "1440px",
          width: "100%",
        }}
      >
        <div className="flex items-center flex-wrap gap-1 justify-start">
          <div className="animate-pulse bg-gray-600 h-5 w-20 rounded"></div>
        </div>
      </div>
    </nav>
  );
}

export default function Breadcrumb() {
  return (
    <Suspense fallback={<BreadcrumbFallback />}>
      <BreadcrumbContent />
    </Suspense>
  );
}
