"use client";

import Image from "next/image";
import { BlogPost } from "@/services/client/blog.client";
import { formatDateByLocale } from "@/utils/date";
import Link from "next/link";
import CardInteractions from "@/components/blog/CardInteractions";
import React from "react";
import { useNavigation } from "@/contexts/NavigationContext";
import { getCoverImageUrl } from "@/utils/image.utils";

interface ListNewsSectionProps {
  blogPosts: BlogPost[];
  blogPostsLoading: boolean;
  locale: string;
  texts: {
    title: string;
    subtitle: string;
    noPosts: string;
    views: string;
    likes: string;
    comments: string;
    shares: string;
    readMore: string;
  };
}

export default function ListNewsSection({
  blogPosts,
  blogPostsLoading,
  locale,
  texts,
}: ListNewsSectionProps) {
  const formatDate = (date: string) => formatDateByLocale(date, locale);
  const [avatarErrors, setAvatarErrors] = React.useState<
    Record<string, boolean>
  >({});
  const { setIsNavigating } = useNavigation();

  // Guard against non-array inputs to avoid runtime map errors
  const safePosts = Array.isArray(blogPosts) ? blogPosts : [];

  const handleCardClick = () => {
    setIsNavigating(true);
  };

  const handleAvatarError = (postId: string) => {
    setAvatarErrors((prev) => ({ ...prev, [postId]: true }));
  };

  if (blogPostsLoading) {
    return (
      <section className="relative mt-12 sm:mt-16 mb-6 sm:mb-[57px]">
        <div className="mb-4">
          <h3 className="text-white text-xl sm:text-[28px] md:text-[32px] font-bold flex items-center gap-2 tracking-tight">
            {texts.title}
          </h3>
          <p className="mt-2 text-base sm:text-lg text-white/70">{texts.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 sm:gap-x-8 md:gap-x-[36px] gap-y-6 sm:gap-y-[24px]">
          {Array.from({ length: 6 }).map((_, idx) => (
            <article
              key={idx}
              className="rounded-2xl border border-white/10 bg-[#0F1722] overflow-hidden flex flex-col animate-pulse"
            >
              <div className="relative w-full pt-[66.67%] bg-gray-700"></div>
              <div className="flex flex-col gap-3 p-5">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-6 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-8 bg-gray-700 rounded mt-4"></div>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (safePosts.length === 0) {
    return (
      <section className="relative mt-12 sm:mt-16 mb-6 sm:mb-[57px]">
        <div className="mb-4">
          <h3 className="text-white text-xl sm:text-[28px] md:text-[32px] font-bold flex items-center gap-2 tracking-tight">
            {texts.title}
          </h3>
          <p className="mt-2 text-base sm:text-lg text-white/70">{texts.subtitle}</p>
        </div>
        <div className="text-center py-12 text-gray-400">
          <p>{texts.noPosts}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="list-news relative mt-12 sm:mt-16 mb-6 sm:mb-[57px]">
      <div className="mb-4">
        <h3 className="text-white text-xl sm:text-[28px] md:text-[32px] font-bold flex items-center gap-2 tracking-tight">
          {texts.title}
        </h3>
        <p className="mt-2 text-sm sm:text-base text-white/70">{texts.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 sm:gap-x-8 md:gap-x-[36px] gap-y-6 sm:gap-y-[24px] items-stretch">
        {safePosts.map((post, idx) => (
          <Link
            key={post.id}
            href={`/${locale}/blog/${post.slug}`}
            className="block"
            onClick={handleCardClick}
          >
            <article className="rounded-2xl border border-white/10 bg-[#0F1722] overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:shadow-[0_25px_70px_-20px_rgba(0,229,255,0.25)] hover:border-cyan-400/30 h-full">
              <div className="relative w-full pt-[66.67%] overflow-hidden rounded-t-2xl">
                <Image
                  src={getCoverImageUrl(post.coverImageId)}
                  alt={post.title}
                  fill
                  unoptimized
                  priority={idx < 3}
                  loading={idx < 3 ? "eager" : "lazy"}
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  style={{ objectFit: "cover" }}
                  className="rounded-t-2xl"
                />
              </div>
              <div className="flex flex-col gap-3 p-5 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mb-2">
                  {post.content?.tags && Array.isArray(post.content.tags) && post.content.tags.length > 0 && (
                    <>
                      <div className="inline-block bg-cyan-900/30 text-cyan-400 text-xs px-2 py-1 rounded-full border border-[#00D3F280]">
                        #{post.content.tags.map((tag) => tag.name).join(", ")}
                      </div>
                      <span>•</span>
                    </>
                  )}
                  {post.content?.createdAt && (
                    <span>{formatDate(post.content.createdAt)}</span>
                  )}
                </div>
                <div className="px-6 -mx-5">
                  <h4 className="text-sm font-semibold line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="mt-3 text-sm leading-6 text-white/70 line-clamp-2">
                    {post.bodyHtml?.replace(/<[^>]*>/g, "").substring(0, 200) || ""}...
                  </p>
                </div>
                <div className="mt-auto pt-4 flex flex-col gap-2 px-[24px] -mx-5">
                  <div
                    className="w-full relative flex justify-center"
                    id={`action-buttons-container-${post.id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {post.content ? (
                      <CardInteractions
                        content={post.content}
                        postId={post.id}
                        postSlug={post.slug}
                        alignPickerToCard
                      />
                    ) : (
                      <div className="relative flex flex-wrap items-center justify-center gap-4 text-sm text-white/85 tracking-wide">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-white/80">
                          <span className="font-semibold text-xs sm:text-sm">0</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-white/80">
                          <span className="font-semibold text-xs sm:text-sm">0</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-white/80">
                          <span className="font-semibold text-xs sm:text-sm">0</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-white/80">
                          <span className="font-semibold text-xs sm:text-sm">0</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      borderColor: "#243B55",
                      boxShadow: "0 6px 16px 0 rgba(11, 90, 92, 0.50)",
                      background:
                        "linear-gradient(180deg, #06A8AC 0%, #19DDE2 100%)",
                    }}
                    className="mt-1 text-white text-sm font-semibold py-2 rounded-lg text-center block w-full transition-all duration-300 hover:shadow-cyan-400/40 hover:brightness-105 hover:saturate-110 transform hover:-translate-y-0.5"
                  >
                    {texts.readMore}
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}

