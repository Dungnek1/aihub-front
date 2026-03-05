import type { ComponentProps, CSSProperties } from "react";
import FeaturedNews from "@/components/news/FeaturedNews";
import NewStories from "@/components/news/NewStories";

type FeaturedNewsProps = ComponentProps<typeof FeaturedNews>;
type NewStoriesProps = ComponentProps<typeof NewStories>;

interface NewsHighlightsSectionTexts {
  featuredTitle: string;
  featuredSubtitle?: string;
  storiesTitle: string;
  storiesSubtitle?: string;
}

interface NewsHighlightsSectionProps {
  locale: string;
  featuredNews?: FeaturedNewsProps["data"] | null;
  stories: NewStoriesProps["stories"];
  texts: NewsHighlightsSectionTexts;
  className?: string;
  wrapperStyle?: CSSProperties;
  headingsWrapperStyle?: CSSProperties;
  contentWrapperStyle?: CSSProperties;
  newStoriesProps?: Partial<
    Omit<NewStoriesProps, "stories">
  >;
}

const defaultGridStyle: CSSProperties = {
  maxWidth: "1440px",
  gridTemplateColumns:
    "minmax(0, clamp(820px, 52vw, 880px)) clamp(380px, 26vw, 420px)",
  gap: "clamp(40px, 3.8vw, 56px)",
};

export default function NewsHighlightsSection({
  locale,
  featuredNews,
  stories,
  texts,
  className = "w-full",
  wrapperStyle,
  headingsWrapperStyle,
  contentWrapperStyle,
  newStoriesProps,
}: NewsHighlightsSectionProps) {
  return (
    <>
      <section
        id="featured-news"
        className={`lg:hidden ${className}`}
        style={wrapperStyle}
      >
        <div className="mb-4">
          <h4 className="text-xl sm:text-[28px] md:text-[32px] font-bold tracking-tight text-white mb-2">
            {texts.featuredTitle}
          </h4>
          {texts.featuredSubtitle ? (
            <p className="text-base sm:text-lg text-white/70">
              {texts.featuredSubtitle}
            </p>
          ) : null}
        </div>
        <div>
          {featuredNews ? (
            <FeaturedNews data={featuredNews} locale={locale} />
          ) : null}
        </div>
      </section>

      <section
        id="featured-news"
        className={`hidden lg:block ${className}`}
        style={wrapperStyle}
      >
        <div
          className="mx-auto grid grid-cols-1 gap-4 lg:grid-cols-[auto_auto] lg:gap-0"
          style={{ ...defaultGridStyle, ...headingsWrapperStyle }}
        >
          <div>
            <h4 className="text-xl sm:text-[28px] md:text-[32px] font-bold tracking-tight text-white">
              {texts.featuredTitle}
            </h4>
            {texts.featuredSubtitle ? (
              <p className="mb-4 text-base sm:text-lg text-white/70">
                {texts.featuredSubtitle}
              </p>
            ) : null}
          </div>
          <div>
            <h4 className="text-xl sm:text-[28px] md:text-[32px] font-bold tracking-tight text-white">
              {texts.storiesTitle}
            </h4>
            {texts.storiesSubtitle ? (
              <p className="mb-4 text-base sm:text-lg text-white/70">
                {texts.storiesSubtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div
          className="mx-auto grid grid-cols-1 items-stretch lg:grid-cols-[auto_auto]"
          style={{ ...defaultGridStyle, ...contentWrapperStyle }}
        >
          <div className="w-full h-full flex flex-col">
            {featuredNews ? (
              <FeaturedNews data={featuredNews} locale={locale} />
            ) : null}
          </div>
          <div id="new-stories" className="w-full h-full flex flex-col">
              <NewStories
                stories={stories}
              equalHeight={true}
                {...newStoriesProps}
              />
          </div>
        </div>
      </section>
    </>
  );
}

