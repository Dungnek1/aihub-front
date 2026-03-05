import BlogClient from "@/components/blog/BlogClient";
import { BlogPost } from "@/services/client/blog.client";
import { Metadata } from "next";
import { getServerUser } from "@/lib/auth.server";
import type { AppSession } from "@/types/session";

// 🔄 Force dynamic rendering to fix build timeout and ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    title: `${t("title")} | AI Hub`,
    description: t("description"),
  };
}

async function getPosts() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000/api/v1';
    const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
    const apiUrl = baseUrl.includes('/api/v1')
      ? `${baseUrl}/blog/filter`
      : `${baseUrl}/api/v1/blog/filter`;

    // Default to PUBLISHED status for community blog posts
    const queryParams = new URLSearchParams();
    queryParams.set("status", "PUBLISHED");

    const res = await fetch(
      `${apiUrl}?${queryParams.toString()}`,
      {
        cache: 'no-store',
        //  next: { revalidate: 60 },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch posts: ${res.status}`);
    }

    const data = await res.json();

    return data.data || [];
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    return [];
  }
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const posts = await getPosts();

  // Get user session
  const user = await getServerUser();

  // Convert user to AppSession format
  const session: AppSession | undefined = user
    ? {
      user: {
        userId: user.userId,
        name: user.name || user.username || "",
        email: user.email || "",
        image: user.avatarUrl || null,
      },
    }
    : undefined;

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
    <BlogClient
      initialPosts={posts}
      session={session}
    />
  );
}
