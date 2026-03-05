"use client";

// app/components/FeaturedNews.tsx
import Image from "next/image";
import Link from "next/link";
import authorIcon from "@/public/icon/author.svg";
import { useNavigation } from "@/contexts/NavigationContext";
import { normalizeImageUrl } from "@/utils/image.utils";
import { useTranslations } from "next-intl";
import { BlurFade } from "@/components/ui/blur-fade";
import { Badge } from "@/components/ui/badge";

interface Props {
  data: {
    title: string;
    description: string;
    category: string;
    author: string;
    readTime: string;
    image: string;
    slug: string;
  };
  locale: string;
}

export default function FeaturedNews({ data, locale }: Props) {
  const { setIsNavigating } = useNavigation();
  const t = useTranslations("Header");

  const handleCardClick = () => {
    setIsNavigating(true);
  };

  // Only show real images from API - skip fallback images
  const fallbackImages = [
    "/google-news.png",
    "/quantum-ai.png",
    "/ai-ethics.png",
    "/neural-interfaces.png",
    "/default/blog-placeholder.png",
  ];

  // Check if image is fallback - only if image exists
  const isFallback = data.image
    ? fallbackImages.some((fallback) => data.image.includes(fallback))
    : false; // Nếu không có image, không phải fallback, chỉ là null

  // Show image if:
  // 1. Có image và không phải fallback
  // 2. Hoặc image là full URL (từ backend API)
  let imageSrc: string | null = null;
  if (data.image && (!isFallback || data.image.startsWith("http://") || data.image.startsWith("https://"))) {
    try {
      // Clean up URL first - remove any duplicate prefixes
      let cleanImage = data.image.trim();

      // Check if URL contains duplicate http:// pattern
      if (
        cleanImage.includes("http://") &&
        cleanImage.split("http://").length > 2
      ) {
        // Extract all URLs from the string
        const allMatches = cleanImage.match(/(https?:\/\/[^\s]+)/g);
        if (allMatches && allMatches.length > 1) {
          // Use the last URL (the actual one, not the duplicate prefix)
          const lastMatch = allMatches[allMatches.length - 1];
          if (lastMatch) {
            cleanImage = lastMatch;
          }
        } else if (allMatches && allMatches.length === 1) {
          // Only one URL found, use it
          cleanImage = allMatches[0];
        }
      }

      // If already a full URL, use as-is; otherwise normalize
      if (
        cleanImage.startsWith("http://") ||
        cleanImage.startsWith("https://")
      ) {
        imageSrc = cleanImage;
      } else {
        // Use normalizeImageUrl to properly handle URL construction for relative paths
        imageSrc = normalizeImageUrl(cleanImage);
      }
    } catch (error) {
      // SECURITY: Do not log image URL normalization errors
      // Only log in development mode for debugging
      if (process.env.NODE_ENV === "development") {
        console.debug("Failed to normalize image URL:", error);
      }
      imageSrc = null;
    }
  }

  return (
    <BlurFade delay={0.1} direction="up" inView>
      <Link
        href={`/${locale}/blog/${data.slug}?source=featured-news`}
        onClick={handleCardClick}
        className="h-full flex flex-col"
      >
        <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0F1722] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] transition-all duration-300 hover:shadow-[0_25px_70px_-20px_rgba(0,229,255,0.25)] hover:border-cyan-400/30 hover:scale-[1.02] h-full flex flex-col">
        {imageSrc ? (
          <div className="relative w-full h-40 sm:h-0 sm:pt-[58%] overflow-hidden">
            <div
              className="absolute inset-0 transition-transform duration-300 will-change-transform group-hover:scale-[1.04]"
              style={{ transformOrigin: "top center" }}
            >
              <Image
                src={imageSrc}
                alt={data.title}
                fill
                unoptimized
                priority
                loading="eager"
                style={{ objectFit: "cover" }}
                onError={(e) => {
                  console.error("[Image] Failed to load:", imageSrc);
                  // Hide image on error
                  const target = e.target as HTMLImageElement;
                  if (target.parentElement) {
                    target.parentElement.style.display = 'none';
                  }
                }}
              />
            </div>
          </div>
        ) : (
          <div className="relative w-full h-40 sm:h-0 sm:pt-[58%] overflow-hidden bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
            <div className="text-center px-4">
              <p className="text-white/50 text-sm">{t("noImageAvailable")}</p>
            </div>
          </div>
        )}

        <div className="px-2 py-1 sm:px-[24px] sm:py-[24px] flex flex-col gap-1.5 sm:gap-0 flex-1">
          <Badge variant="outline" className="self-start hidden sm:inline-flex bg-white/10 border-white/25 text-white/85 mb-4 truncate max-w-[200px] text-[11px] hover:bg-white/20 transition-colors">
            {data.category}
          </Badge>
          <h5 className="text-sm sm:text-lg md:text-xl font-semibold leading-tight sm:leading-8 text-white mb-0 sm:mb-6 ">
            {data.title}
          </h5>
          <p className="hidden sm:block mb-8 text-sm sm:text-base leading-7 text-white/70 flex-1">
            {data.description}
          </p>

          <div className="flex items-center justify-between gap-[52px] sm:gap-0 text-xs sm:text-sm text-white/70 mt-auto">
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-2">
                <Image src={authorIcon} alt="author" width={16} height={16} />
                {data.author}
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/70" />
                {data.readTime}
              </span>
            </div>

            <span className="text-teal-300 text-lg">↗</span>
          </div>
        </div>
      </article>
    </Link>
    </BlurFade>
  );
}
