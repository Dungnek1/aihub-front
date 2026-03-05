import AnimationBreakingNews from "./AnimationBreakingNews";

interface BreakingNewsSectionProps {
  title: string;
  items: string[];
}

export default function BreakingNewsSection({ title, items }: BreakingNewsSectionProps) {
  return (
    <section className="relative mt-12 sm:mt-16 mb-8 sm:mb-[57px] overflow-visible">
      <div className="relative z-10 flex flex-col items-center w-full overflow-visible">
        {/* Title Section */}
        <div className="w-full px-4 mb-4 lg:mb-[50px] lg:px-0">
          <div className="mx-auto max-w-[980px]">
        <h3
              className="text-center text-xl sm:text-[28px] md:text-[32px] font-bold tracking-tight text-white"
          style={{
            fontFamily:
              "var(--font-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          {title}
        </h3>
          </div>
        </div>
        {/* Animation Section */}
        <div className="w-full overflow-visible relative px-4 lg:px-0">
          <div className="mx-auto max-w-[980px] flex justify-center">
          <AnimationBreakingNews items={items} />
          </div>
        </div>
      </div>
    </section>
  );
}
