import BlogClient from "@/components/blog/BlogClient";
import { listPosts } from "@/services/server/blog.server";
import { Metadata } from "next";
import { defaultIcons } from "@/lib/metadata/icons";

export const metadata: Metadata = {
  title: "Community Blog | AI Blog",
  description:
    "Explore and engage with the latest posts from our AI community. Share your insights and discover ideas in AI, design, and innovation.",
  icons: defaultIcons,
};

// 🧠 Hàm gọi API server-side
async function getPosts() {
  try {
    const posts = await listPosts({
      skip: 0,
      take: 10,
    });

    // Ensure posts is always an array
    return Array.isArray(posts) ? posts : [];
  } catch (error) {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="w-full bg-[#0A0F18] font-sans overflow-hidden text-white -mt-4 sm:-mt-6">
      <div className="relative w-full pt-4 sm:pt-6">
        <div
          className="mx-auto px-4 sm:px-6 xl:px-0"
          style={{
            maxWidth: "1440px",
            width: "100%",
          }}
        >
          {/* Content Section */}
          <div className="py-10">
            <BlogClient initialPosts={posts} />
          </div>
        </div>
      </div>
    </div>
  );
}
