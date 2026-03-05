// app/components/FeaturedStories.tsx
import Image from "next/image";
import Marquee from "react-fast-marquee";
import googleImage from "@/public/slide-test.jpg";
import arrowIcon from "@/public/icon/arrow-right.svg";
import authorIcon from "@/public/icon/author.svg";
import clockIcon from "@/public/icon/clock-color.svg";
import Link from "next/link";
import { useLocale } from "next-intl";
import { normalizeImageUrl } from "@/utils/image.utils";
import { BlurFade } from "@/components/ui/blur-fade";
import { Badge } from "@/components/ui/badge";

interface Story {
  title: string;
  image: string;
  slug?: string;
  author?: string;
  readTime?: string;
  category?: string;
  description?: string;
}

export default function FeaturedStories({ stories }: { stories: Story[] }) {
  const locale = useLocale();
  const imageSrc = (img?: string | null) => {
    if (!img) return "";
    try {
      return normalizeImageUrl(img);
    } catch {
      return img;
    }
  };

  return (
    <>
      {/* Mobile: Horizontal Scroll */}
      <div className="lg:hidden -mx-4 px-4">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide items-stretch">
          {stories.map((story, idx) => {
            return (
              <BlurFade key={`mobile-${idx}`} delay={idx * 0.1} direction="up" inView>
                <Link
                  href={
                    story.slug
                      ? `/${locale}/blog/${story.slug}?source=featured-stories`
                      : "#"
                  }
                  className="flex-shrink-0 w-[280px] block"
                >
                  <div className="flex flex-col h-full rounded-lg border border-white/10 bg-gradient-to-b from-[#1B2333] to-[#131A26] overflow-hidden transition-all duration-300 hover:border-cyan-400/30 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:scale-[1.02]" style={{ minHeight: '360px' }}>
                  {/* Image - Top */}
                  <div className="relative w-full h-[160px] overflow-hidden flex-shrink-0">
                    {story.image && (
                      <Image
                        src={imageSrc(story.image)}
                        alt={story.title}
                        fill
                        unoptimized
                        priority={idx === 0}
                        loading={idx === 0 ? "eager" : "lazy"}
                        style={{ objectFit: "cover" }}
                      />
                    )}
                  </div>

                  {/* Content - Bottom */}
                  <div className="p-4 flex flex-col gap-3 flex-1 min-h-0 overflow-hidden">
                    <div className="flex-1 min-h-0 overflow-hidden">
                      <h3 className="text-sm font-semibold text-white mb-2 line-clamp-3 leading-tight overflow-hidden">
                        {story.title}
                      </h3>
                      {story.description && (
                        <p className="text-xs leading-[18px] text-white/70 line-clamp-3 overflow-hidden">
                          {story.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/70 flex-shrink-0 mt-auto pt-2">
                      <span className="flex items-center gap-1.5 truncate">
                        <Image
                          src={authorIcon}
                          alt="author"
                          width={14}
                          height={14}
                          className="flex-shrink-0"
                        />
                        <span className="truncate">{story.author}</span>
                      </span>
                      <span className="flex items-center gap-1.5 flex-shrink-0">
                        <Image
                          src={clockIcon}
                          alt="readTime"
                          width={14}
                          height={14}
                        />
                        <span className="whitespace-nowrap">{story.readTime}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              </BlurFade>
            );
          })}
        </div>
      </div>

      {/* Desktop: Marquee Scroll */}
      <div className="hidden lg:block w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <div className="mt-6">
          <Marquee speed={100} autoFill>
            {stories.map((story, idx) => (
              <Link
                key={`marquee-1-${idx}`}
                href={
                  story.slug
                    ? `/${locale}/blog/${story.slug}?source=featured-stories`
                    : "#"
                }
                className="group block w-[430px] h-[156px] flex-shrink-0"
                style={{ marginRight: "24px" }}
              >
                <div className="flex items-stretch gap-6 h-full bg-gradient-to-b from-[#1E293B] to-[#1E293B]/50 rounded-xl overflow-hidden border border-[#FBFBFB] p-3 transition-all duration-300 group-hover:border-cyan-400/40 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] group-hover:translate-y-[-2px]">
                  <Image
                    src={story.image ? imageSrc(story.image) : googleImage}
                    alt={story.title}
                    width={120}
                    height={120}
                    priority={idx === 0}
                    loading={idx === 0 ? "eager" : "lazy"}
                    className="rounded-xl object-cover w-[120px] h-[120px] flex-shrink-0"
                  />

                  <div className="flex flex-col items-start gap-3 flex-1 min-h-0">
                    <h4 className="text-sm text-white font-bold line-clamp-3 leading-tight">
                      {story.title}
                    </h4>
                    <Badge variant="outline" className="bg-[rgba(255,255,255,0.10)] border-[#717680] text-white font-medium flex-shrink-0 group-hover:bg-[rgba(255,255,255,0.15)] transition-colors">
                      {story.category || "Research"}
                    </Badge>
                    <div className="flex items-center gap-2 mt-auto flex-shrink-0 text-white font-semibold">
                      <span>Read More</span>
                      <Image
                        src={arrowIcon}
                        alt="arrowIcon"
                        width={20}
                        height={20}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </Marquee>

          <Marquee direction="right" speed={100} className="mt-6" autoFill>
            {stories.map((story, idx) => (
              <Link
                key={`marquee-2-${idx}`}
                href={
                  story.slug
                    ? `/${locale}/blog/${story.slug}?source=featured-stories`
                    : "#"
                }
                className="group block w-[430px] h-[156px] flex-shrink-0"
                style={{ marginRight: "24px" }}
              >
                <div className="flex items-stretch gap-6 h-full bg-gradient-to-b from-[#1E293B] to-[#1E293B]/50 rounded-xl overflow-hidden border border-[#FBFBFB] p-3 transition-all duration-300 group-hover:border-cyan-400/40 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] group-hover:translate-y-[-2px]">
                  <Image
                    src={story.image ? imageSrc(story.image) : googleImage}
                    alt={story.title}
                    width={120}
                    height={120}
                    className="rounded-xl object-cover w-[120px] h-[120px] flex-shrink-0"
                  />

                  <div className="flex flex-col items-start gap-3 flex-1 min-h-0">
                    <h4 className="text-sm text-white font-bold line-clamp-3 leading-tight">
                      {story.title}
                    </h4>
                    <Badge variant="outline" className="bg-[rgba(255,255,255,0.10)] border-[#717680] text-white font-medium flex-shrink-0 group-hover:bg-[rgba(255,255,255,0.15)] transition-colors">
                      {story.category || "Research"}
                    </Badge>
                    <div className="flex items-center gap-2 mt-auto flex-shrink-0 text-white font-semibold">
                      <span>Read More</span>
                      <Image
                        src={arrowIcon}
                        alt="arrowIcon"
                        width={20}
                        height={20}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </Marquee>
        </div>
      </div>
    </>
  );
}
