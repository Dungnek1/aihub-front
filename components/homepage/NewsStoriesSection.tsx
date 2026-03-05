// server-friendly wrapper: receives texts/data via props
import NewStories from "@/components/news/NewStories";

interface NewsStory {
  title: string;
  category: string;
  author: string;
  readTime: string;
  slug: string;
  desc?: string;
  detail?: string;
  previewImg?: string;
}

interface NewsStoriesSectionProps {
  newsStories: NewsStory[];
  title: string;
  subtitle: string;
  fallbackStories: NewsStory[];
}

export default function NewsStoriesSection({
  newsStories,
  title,
  subtitle,
  fallbackStories,
}: NewsStoriesSectionProps) {
  return (
    <aside className="w-full flex flex-col self-stretch">
      <h4 className="text-xl sm:text-[28px] md:text-[32px] font-bold text-white">
        {title}
      </h4>
      <p className="mb-4 text-base sm:text-lg text-white/70">{subtitle}</p>

      <div className="flex-1 min-h-0 flex flex-col">
        <NewStories
          equalHeight
          gapClass="gap-7 md:gap-9 xl:gap-[42px]"
          previewHeight={180}
          stories={newsStories.length ? newsStories : fallbackStories}
        />
      </div>
    </aside>
  );
}
