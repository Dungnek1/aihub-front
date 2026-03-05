import ActivityListClient from "@/components/blog/ActivityListClient";
import BlogBreadcrumbWithTabs from "@/components/blog/BlogBreadcrumbWithTabs";
import { Metadata } from "next";

const activityData = [
  {
    id: 1,
    type: "reacted",
    tag: "#GenerativeAI",
    timeAgo: "2 weeks ago",
    title: "Data Visualization in AI: Making Insights Accessible",
    description:
      "Learn how to create compelling data visualizations that communicate AI-driven insights effectively to stakeholders.",
    reaction: "Sparkle",
    image: "https://res.cloudinary.com/dabb0yavq/image/upload/v1756920155/foodAppImage_paek91.jpg",
  },
  {
    id: 2,
    type: "reacted",
    tag: "#GenerativeAI",
    timeAgo: "2 weeks ago",
    title: "Data Visualization in AI: Making Insights Accessible",
    description:
      "Learn how to create compelling data visualizations that communicate AI-driven insights effectively to stakeholders.",
    reaction: "Fire",
    image: "https://res.cloudinary.com/dabb0yavq/image/upload/v1756920155/foodAppImage_paek91.jpg",
  },
  {
    id: 3,
    type: "commented",
    tag: "#AICommunity",
    timeAgo: "3 days ago",
    title: "New Trends in AI Infrastructure",
    description:
      "Explore the next generation of AI-driven infrastructure and its impact on modern systems.",
    reaction: "None",
    image: "https://res.cloudinary.com/dabb0yavq/image/upload/v1756920155/foodAppImage_paek91.jpg",
  },
  {
    id: 4,
    type: "shared",
    tag: "#AIResearch",
    timeAgo: "1 week ago",
    title: "Transformers: The Backbone of Modern AI Models",
    description:
      "A detailed look into transformer architectures that power GPT, BERT, and more.",
    reaction: "None",
    image: "https://res.cloudinary.com/dabb0yavq/image/upload/v1756920155/foodAppImage_paek91.jpg",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // Import messages directly based on locale to ensure correct translations
  const messages = (await import(`@/lib/i18n/message/${locale}.json`)).default;
  const t = (key: string) => {
    const keys = key.split(".");
    let value: any = messages.Blog;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === "string" ? value : key;
  };
  return {
    title: `${t("activityLog")} | AI Hub`,
    description: t("activityLogDescription"),
  };
}

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Get user session
  const { getServerUser } = await import("@/lib/auth.server");
  const user = await getServerUser();

  // Redirect to blog page if not authenticated
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect(`/${locale}/blog`);
  }

  // Import messages directly based on locale to ensure correct translations
  const messages = (await import(`@/lib/i18n/message/${locale}.json`)).default;
  const t = (key: string) => {
    const keys = key.split(".");
    let value: any = messages.Blog;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === "string" ? value : key;
  };

  return (
    <div className="relative bg-[#0A0F18] font-sans overflow-hidden text-white">
      <BlogBreadcrumbWithTabs />
      
      <div
        className="mx-auto px-4 sm:px-6"
        style={{
          maxWidth: "1440px",
          width: "100%",
        }}
      >

        {/* Content Section */}
        <div className="py-10">
          <h1 className="text-2xl font-semibold flex items-center gap-2 mb-3">
            ⚡ {t("activityLog")}
          </h1>
          <p className="text-gray-400 mb-8">{t("activityLogDescription")}</p>

          <ActivityListClient initialActivities={activityData} />
        </div>
      </div>
    </div>
  );
}
