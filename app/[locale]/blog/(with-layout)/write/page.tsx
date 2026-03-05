import WriteClient from "@/components/blog/WriteClient";
import BlogBreadcrumbWithTabs from "@/components/blog/BlogBreadcrumbWithTabs";
import { getServerUser } from "@/lib/auth.server";
import type { AppSession } from "@/types/session";
import { Metadata } from "next";
import { defaultIcons } from "@/lib/metadata/icons";

export const metadata: Metadata = {
  title: "Write Blog | AI Blog",
  description:
    "Explore and engage with the latest posts from our AI community. Share your insights and discover ideas in AI, design, and innovation.",
  icons: defaultIcons,
};

export default async function WriteBlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Get user session
  const user = await getServerUser();

  // Redirect to blog page if not authenticated
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect(`/${locale}/blog`);
  }

  const ensuredUser = user as NonNullable<typeof user>;

  // Convert user to AppSession format
  const session: AppSession = {
    user: {
      userId: ensuredUser.userId,
      name: ensuredUser.name || ensuredUser.username || "",
      email: ensuredUser.email || "",
      image: ensuredUser.avatarUrl || null,
    },
  };

  return (
    <div className="relative bg-[#0A0F18] font-sans overflow-hidden text-white">
      <BlogBreadcrumbWithTabs />

      <div className="max-w-6xl xl:max-w-[1248px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-16 text-gray-100">
        <WriteClient session={session} />
      </div>
    </div>
  );
}
