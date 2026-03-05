import WriteClient from "@/components/blog/WriteClient";
import { getServerUser } from "@/lib/auth.server";
import { getPostBySlug } from "@/services/server/blog.server";
import type { AppSession } from "@/types/session";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("Blog");

  return {
    title: t("editPost"),
    description: t("editPost"),
  };
}

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  // Get user session
  const user = await getServerUser();

  // Redirect to blog page if not authenticated
  if (!user) {
    redirect(`/${locale}/blog`);
  }

  // Load post data with authentication (to get draft/pending posts)
  let post = null;
  try {
    post = await getPostBySlug(slug, true); // Use authenticated request
    console.log("Edit page - post loaded:", post ? "found" : "not found");
    if (!post) {
      console.log("Edit page - redirecting: post not found");
      redirect(`/${locale}/blog`);
    }

    // Check if user owns this post
    // Try multiple possible author ID locations
    const postAuthorId = 
      post.content?.author?.userId || 
      (post as any).authorId || 
      (post as any).author?.userId ||
      (post as any).author?.id;
    
    if (!postAuthorId || postAuthorId !== user.userId) {
      redirect(`/${locale}/blog`);
    }
  } catch (error) {
    console.error("Error loading post:", error);
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
      <div className="max-w-6xl xl:max-w-[1248px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-16 text-gray-100">
        <WriteClient session={session} initialPost={post} />
      </div>
    </div>
  );
}

