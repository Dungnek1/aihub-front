"use client";
import Image from "next/image";
import Link from "next/link";
import CardInteractions from "./CardInteractions";
import { formatDateByLocale } from "@/utils/date";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNavigation } from "@/contexts/NavigationContext";
import { getCoverImageUrl } from "@/utils/image.utils";
import { sanitizeBlogHtml } from "@/utils/sanitize.utils";
import Avatar from "@/components/ui/Avatar";
import { ArrowUpRight, Clock } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "next-intl";
const ShareModal = dynamic(() => import("./ShareModal"), { ssr: false });

interface BlogCardProps {
  post: any;
  viewMode?: "grid" | "list";
  locale: string;
  texts: any;
}

export default function BlogCard({
  post,
  viewMode = "grid",
  locale,
  texts,
  priority = false,
}: BlogCardProps & { priority?: boolean }) {
  const isList = viewMode === "list";
  const router = useRouter();
  const { setIsNavigating } = useNavigation();
  const t = useTranslations("Blog");
  const currentLocale = useLocale();

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCardClick = () => {
    setIsNavigating(true);
    // Use router.push with scroll: false to avoid RSC prefetch issues
    router.push(`/${locale}/blog/${post.slug}`, { scroll: false });
  };

  const stopCardNavigation = (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const nativeEvent = event.nativeEvent as Event & {
      stopImmediatePropagation?: () => void;
    };
    nativeEvent.stopImmediatePropagation?.();
  };

  const handleShareClick = (e: React.MouseEvent) => {
    stopCardNavigation(e);
    setShareModalOpen(true);
  };

  const handleDesktopShareClick = (e: React.SyntheticEvent) => {
    stopCardNavigation(e);
    setShareModalOpen(true);
  };

  const handleCommentsClick = (event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    const nativeEvent = event?.nativeEvent as Event & {
      stopImmediatePropagation?: () => void;
    };
    nativeEvent?.stopImmediatePropagation?.();
    setIsNavigating(true);
    router.push(`/${locale}/blog/${post.slug}#comments`);
  };

  const getAuthorName = () => {
    return post.content?.author?.name || texts.unknownAuthor || "Unknown";
  };

  const formatDate = (date: string) => formatDateByLocale(date, locale);

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor(
      (now.getTime() - postDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) return locale === "vi" ? "Vừa xong" : "Just now";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return locale === "vi" ? `${minutes} phút trước` : `${minutes}m ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return locale === "vi" ? `${hours} giờ trước` : `${hours}h ago`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    return locale === "vi" ? `${days} ngày trước` : `${days}d ago`;
  };

  return (
    <>
      {/* Mobile Layout (< 640px) */}
      <div
        onClick={handleCardClick}
        style={{
          borderColor: "#243B55",
          background:
            "linear-gradient(180deg, #1E293B 0%, rgba(30,41,59,0.5) 100%)",
        }}
        className="sm:hidden flex flex-col h-full rounded-lg border overflow-hidden cursor-pointer w-full hover:shadow-[0_25px_70px_-20px_rgba(0,229,255,0.25)] hover:border-cyan-400/30 transition-all duration-300"
      >
       {/* Thumbnail - Full width on top (fix spacing) */}
<div className="relative w-full overflow-hidden rounded-t-lg aspect-[16/9]">
  <Image
    src={getCoverImageUrl(post.coverImageId)}
    alt={post.title}
    fill             // dùng fill + absolute để ảnh chiếm đúng khung aspect
    className="absolute inset-0 object-cover"
    sizes="100vw"
    priority={priority}
    loading={priority ? "eager" : "lazy"}
  />
</div>
        {/* Content */}
        <div className="p-5 grid grid-rows-[auto_1fr_auto] gap-4 min-h-0">
          {/* Tag + Share Icon Row */}
          <div className="flex items-center justify-between">
            <div
              className="inline-block text-sm px-4 py-2 border"
              style={{
                borderRadius: "16px",
                border: "1px solid rgba(0, 211, 242, 0.50)",
                background: "rgba(0, 184, 219, 0.20)",
                color: "rgba(0, 211, 242, 1)",
              }}
            >
              #
              {post.content?.tags?.[0]?.name ||
                post.category?.name ||
                "Uncategorized"}
            </div>
            <button
              type="button"
              onClick={(event) => handleShareClick(event)}
              onMouseDown={stopCardNavigation}
              onMouseUp={stopCardNavigation}
              onPointerDown={stopCardNavigation}
              onPointerUp={stopCardNavigation}
              onTouchStart={stopCardNavigation}
              onTouchEnd={stopCardNavigation}
              onKeyDown={stopCardNavigation}
              onKeyUp={stopCardNavigation}
              className="text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <ArrowUpRight size={22} />
            </button>
          </div>

          {/* Title + Description - Middle row that expands */}
          <div className="flex flex-col gap-2 min-h-0">
            {/* Title */}
            <h3 className="text-white font-semibold text-base sm:text-lg md:text-xl leading-snug line-clamp-2 min-h-[3.2rem]">
              {post.title}
            </h3>

            {/* Content/Description - 1-2 lines */}
            <div
              className="prose prose-invert max-w-none text-gray-400 text-xs sm:text-sm leading-relaxed
                [&_*]:!font-inherit [&_p]:!font-inherit [&_div]:!font-inherit [&_span]:!font-inherit"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
              dangerouslySetInnerHTML={{
                __html: sanitizeBlogHtml(post.bodyHtml),
              }}
            />
            </div>

            {/* Footer: Time + Reactions */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-gray-400 text-sm whitespace-nowrap">
              <Clock size={20} />
              <span className="whitespace-nowrap">
                {isMounted && post.content?.createdAt
                  ? getTimeAgo(post.content.createdAt)
                  : post.content?.createdAt
                  ? formatDate(post.content.createdAt)
                  : ""}
              </span>
            </div>
            <div
              id={`action-buttons-container-mobile-${post.id}`}
              className="flex justify-end"
              onClick={(event) => event.stopPropagation()}
            >
              <CardInteractions
                content={post.content}
                postId={post.id}
                postSlug={post.slug}
                alignPickerToCard
                compact
                className="flex items-center gap-3 sm:gap-4 text-sm text-gray-300"
                onComment={(event) => handleCommentsClick(event)}
                onShare={(event) => handleShareClick(event)}
              />
            </div>
          </div>
        </div>

        {/* Mobile Share Panel - Bottom Sheet */}
      </div>

      {/* Desktop Layout (>= 640px) */}
      {!isList ? (
        <div
          onClick={handleCardClick}
          style={{
            borderColor: "#243B55",
            background:
              "linear-gradient(180deg, #1E293B 0%, rgba(30,41,59,0.5) 100%)",
          }}
          className="hidden sm:flex flex-col h-full rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-[0_25px_70px_-20px_rgba(0,229,255,0.25)] hover:border-cyan-400/30"
        >
          {/* IMAGE */}
          <div className="relative w-full overflow-hidden rounded-t-2xl flex-shrink-0">
            <Image
              src={getCoverImageUrl(post.coverImageId)}
              alt={post.title}
              width={400}
              height={300}
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              className="object-cover w-full h-56 rounded-t-2xl"
            />
          </div>

          {/* CONTENT */}
          <div className="flex flex-1 min-h-0 flex-col p-5">
            <div className="flex flex-col flex-shrink-0 gap-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <div
                    className="inline-block text-xs px-2 py-1 border"
                    style={{
                      borderRadius: "16px",
                      border: "1px solid rgba(0, 211, 242, 0.50)",
                      background: "rgba(0, 184, 219, 0.20)",
                      color: "rgba(0, 211, 242, 1)",
                    }}
                  >
                    #
                    {post.content?.tags?.[0]?.name ||
                      post.category?.name ||
                      "Uncategorized"}
                  </div>
                  <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                  <span className="text-gray-400 text-sm">
                    {formatDate(post.content?.createdAt)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDesktopShareClick(e)}
                  onMouseDown={stopCardNavigation}
                  onMouseUp={stopCardNavigation}
                  onPointerDown={stopCardNavigation}
                  onPointerUp={stopCardNavigation}
                  onTouchStart={stopCardNavigation}
                  onTouchEnd={stopCardNavigation}
                  onKeyDown={stopCardNavigation}
                  onKeyUp={stopCardNavigation}
                  className="text-gray-400 hover:text-cyan-400 transition-transform duration-200 hover:scale-110"
                >
                  <ArrowUpRight size={20} />
                </button>
              </div>

              <h3 className="text-white font-semibold text-base mb-2 line-clamp-2 min-h-[3rem]">
                {post.title}
              </h3>

              <div
                className="prose prose-invert max-w-none text-gray-400 text-sm mb-3 leading-relaxed
                  [&_*]:!font-inherit [&_p]:!font-inherit [&_div]:!font-inherit [&_span]:!font-inherit"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
                dangerouslySetInnerHTML={{
                  __html: sanitizeBlogHtml(post.bodyHtml),
                }}
              />
            </div>

            <div className="flex flex-col w-full mt-auto pt-4">
              <div className="w-full cursor-pointer" onClick={handleCardClick}>
                <div
                  style={{
                    borderColor: "#243B55",
                    boxShadow: "0 6px 16px 0 rgba(11, 90, 92, 0.50)",
                    background:
                      "linear-gradient(180deg, #06A8AC 0%, #19DDE2 100%)",
                  }}
                  className="text-white text-sm font-semibold px-6 py-2 rounded-lg text-center block w-full transition-all duration-300 hover:shadow-cyan-400/40 hover:brightness-105 hover:saturate-110 transform hover:-translate-y-0.5"
                >
                  {texts.readMore}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={handleCardClick}
          style={{
            borderColor: "#243B55",
            background:
              "linear-gradient(180deg, #1E293B 0%, rgba(30,41,59,0.5) 100%)",
          }}
          className="hidden sm:flex flex-row items-stretch rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-[0_30px_80px_-15px_rgba(0,229,255,0.35)] hover:border-cyan-300/40"
        >
          {/* Image Section */}
          <div className="relative flex-shrink-0 w-[300px] lg:w-[360px]">
            <div className="relative w-full h-full min-h-[280px] overflow-hidden rounded-l-2xl">
              <div className="absolute inset-0 p-6 lg:p-8">
                <div className="relative w-full h-full rounded-xl overflow-hidden">
                  <Image
                    src={getCoverImageUrl(post.coverImageId)}
                    alt={post.title}
                    fill
                    priority={priority}
                    loading={priority ? "eager" : "lazy"}
                    className="object-cover"
                    sizes="(min-width: 1024px) 360px, 300px"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex flex-1 flex-col min-w-0 px-6 pt-6 pb-4 lg:px-8 lg:pt-8 lg:pb-6">
            {/* Top Row: Tag + Date + Share */}
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3 text-sm text-white/80">
                <div
                  className="inline-block text-xs px-3 py-1 border leading-none uppercase tracking-wide whitespace-nowrap"
                  style={{
                    borderRadius: "999px",
                    border: "1.5px solid rgba(0, 211, 242, 0.65)",
                    background:
                      "linear-gradient(90deg, rgba(0,210,255,0.25), rgba(58,123,213,0.2))",
                    color: "#6FE3FF",
                  }}
                >
                  #
                  {post.content?.tags?.[0]?.name ||
                    post.category?.name ||
                    "Uncategorized"}
                </div>
                <span className="text-white/50">•</span>
                <span className="text-white/60 font-medium text-sm">
                  {formatDate(post.content?.createdAt)}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => handleDesktopShareClick(e)}
                onMouseDown={stopCardNavigation}
                onMouseUp={stopCardNavigation}
                onPointerDown={stopCardNavigation}
                onPointerUp={stopCardNavigation}
                onTouchStart={stopCardNavigation}
                onTouchEnd={stopCardNavigation}
                onKeyDown={stopCardNavigation}
                onKeyUp={stopCardNavigation}
                className="text-white/60 hover:text-cyan-300 transition-transform duration-200 hover:scale-110 flex-shrink-0"
              >
                <ArrowUpRight size={24} strokeWidth={1.6} />
              </button>
            </div>

            {/* Title + Description */}
            <div className="flex-1 min-h-0 mb-5">
              <h3 className="text-white font-semibold text-lg sm:text-xl lg:text-2xl leading-tight mb-3 line-clamp-2">
                {post.title}
              </h3>
              <div
                className="prose prose-invert max-w-none text-white/85 text-body-md lg:text-base leading-7 line-clamp-2
                  [&_*]:!font-inherit [&_p]:!font-inherit [&_div]:!font-inherit [&_span]:!font-inherit"
                style={{
                  fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
                dangerouslySetInnerHTML={{
                  __html: sanitizeBlogHtml(post.bodyHtml),
                }}
              />
            </div>

            {/* Footer: Author + Interactions + Button */}
            <div className="mt-auto pt-3 border-t border-white/10">
              <div className="flex items-center justify-between gap-4">
                {/* Author Info - Hidden on tablet, visible on desktop */}
                <div className="hidden lg:flex items-center gap-3 min-w-0">
                <Avatar
                  src={post.content?.author?.avatarUrl}
                  alt={getAuthorName()}
                  size="md"
                />
                  <span className="text-white text-sm lg:text-base font-semibold truncate">
                    {getAuthorName()}
                  </span>
                </div>

                {/* Interactions + Button */}
                <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0 ml-auto lg:ml-0">
                  <div
                    id={`action-buttons-container-${post.id}`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <CardInteractions
                      content={post.content}
                      postId={post.id}
                      postSlug={post.slug}
                      alignPickerToCard
                      className="flex items-center gap-4 lg:gap-6 text-white/80"
                      onComment={(event) => handleCommentsClick(event)}
                      onShare={(event) => handleShareClick(event)}
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick();
                    }}
                    className="text-white text-sm font-semibold px-6 lg:px-8 py-2.5 lg:py-3 rounded-xl transition-all duration-300 hover:shadow-cyan-400/50 hover:brightness-110 hover:saturate-120 transform hover:-translate-y-0.5 whitespace-nowrap"
                    style={{
                      borderColor: "#243B55",
                      boxShadow: "0 10px 24px 0 rgba(11, 90, 92, 0.55)",
                      background:
                        "linear-gradient(180deg, #06A8AC 0%, #19DDE2 100%)",
                    }}
                  >
                    {texts.readMore}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        postSlug={post.slug}
      />
    </>
  );
}
