// app/my-posts/page.tsx
import PostsListClient from "@/components/blog/PostsListClient";
import BlogBreadcrumbWithTabs from "@/components/blog/BlogBreadcrumbWithTabs";
import { Metadata } from "next";
import { getUserPosts } from "@/services/server/blog.server";
import { getTranslations } from "next-intl/server";
import { getServerUser } from "@/lib/auth.server";
import type { BlogPost } from "@/services/client/blog.client";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("Blog");

  return {
    title: t("myPostsTitle"),
    description: t("myPostsDescription"),
  };
}

export default async function MyPostsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("Blog");

  // Get user session
  const user = await getServerUser();

  // Redirect to blog page if not authenticated
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect(`/${locale}/blog`);
  }

  // Only fetch user posts if session exists
  let apiPosts: BlogPost[] = [];
  try {
    const result = await getUserPosts({
      status: 'all',
      pageNo: 0,
      pageSize: 20,
      sortBy: 'updatedAt',
      sortType: 'desc',
    });
    console.log("API result:", result);
    console.log("API result type:", typeof result);
    console.log("Is array:", Array.isArray(result));
    apiPosts = Array.isArray(result) ? result : [];
    console.log("Final apiPosts:", apiPosts);
    console.log("Final apiPosts length:", apiPosts.length);
  } catch (error) {
    // If API fails, use empty array - PostsListClient will handle empty state
    console.error("Error fetching user posts:", error);
    apiPosts = [];
  }

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
          <div className="mb-6">
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              📁 {t("myPosts")}
            </h1>
            <p className="text-gray-400">
              {t("myPostsSubtitle")}
            </p>
          </div>

          <PostsListClient initialPosts={apiPosts} />
        </div>
      </div>
    </div>
  );
}
