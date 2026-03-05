// News service client
import { http } from "@/services/http";
import type { BlogPost } from "@/services/client/blog.client";
import { stripHtml, stripAndTruncate } from "@/utils/html.utils";
import type { IApiResponse } from "@/types/api.types";
import { logger } from "@/utils/logger";
import { getCoverImageUrl } from "@/utils/image.utils";

export interface NewsDetail {
  id: string;
  slug: string;
  title: string;
  content: string; // Plain text for metadata/description
  bodyHtml?: string; // HTML content for rendering (with images, formatting, etc.)
  author: string;
  readTime: string;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
  image?: string;
  nextPost?: {
    title: string;
    slug: string;
  };
  prevPost?: {
    title: string;
    slug: string;
  };
}

interface FeaturedNews {
  title: string;
  description: string;
  category: string;
  author: string;
  readTime: string;
  image: string;
  slug: string;
}

interface NewStory {
  title: string;
  category: string;
  author: string;
  readTime: string;
  desc: string;
  detail: string;
  image: string;
  slug: string;
}

interface FeaturedStory {
  title: string;
  image: string;
  slug?: string;
  author?: string;
  readTime?: string;
  category?: string;
  description?: string;
}

interface NewsData {
  featuredNews: FeaturedNews;
  newStories: NewStory[];
  featuredStories: FeaturedStory[];
}

/**
 * Transform BlogPost to NewsDetail format
 */
function transformToNewsDetail(post: BlogPost, allPosts: BlogPost[]): NewsDetail {
  const currentIndex = allPosts.findIndex(p => p.id === post.id);
  const nextPost = currentIndex >= 0 && currentIndex < allPosts.length - 1 
    ? allPosts[currentIndex + 1] 
    : null;
  const prevPost = currentIndex > 0 
    ? allPosts[currentIndex - 1] 
    : null;

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    content: stripHtml(post.bodyHtml), // Plain text for metadata/description
    bodyHtml: post.bodyHtml || undefined, // HTML content for rendering
    author: post.content.author.name || post.content.author.username,
    readTime: formatDate(post.content.createdAt),
    createdAt: post.content.createdAt,
    updatedAt: post.content.updatedAt,
    category: post.category?.name,
    image: getCoverImageUrl(post.coverImageId),
    nextPost: nextPost ? {
      title: nextPost.title,
      slug: nextPost.slug,
    } : undefined,
    prevPost: prevPost ? {
      title: prevPost.title,
      slug: prevPost.slug,
    } : undefined,
  };
}

async function getHttpClient() {
  if (typeof window === "undefined") {
    const { httpServer } = await import("@/services/http.server");
    return httpServer;
  }
  return http;
}

/**
 * Get news detail by slug from admin posts API
 * Uses the same API endpoint as Featured News and New Stories
 * Now fetches limit 9 to match Featured Stories
 */
export async function getNewsBySlug(slug: string): Promise<NewsDetail | null> {
  try {
    const httpClient = await getHttpClient();
    // Use the same API endpoint as Featured Stories - limit to 9 posts
    const response = await httpClient.get<IApiResponse<BlogPost[]>>('/blog/admin/posts?limit=9');
    // Backend trả về structure: { data: BlogPost[] }
    // Wrapped trong IApiResponse: { data: { data: BlogPost[] } }
    const posts = (response as any)?.data?.data || (response as any)?.data || response || [];
    
    const post = posts.find((p: BlogPost) => p.slug === slug);
    
    if (!post) {
      logger.warn(`News post with slug "${slug}" not found`);
      return null;
    }

    return transformToNewsDetail(post, posts);
  } catch (error: any) {
    // Xử lý timeout và các lỗi khác một cách graceful
    if (error?.message?.includes('timeout') || error?.code === 'ECONNABORTED') {
      logger.warn(`Timeout when fetching news by slug "${slug}"`);
    } else {
    logger.error("Error fetching news by slug:", error);
    }
    return null;
  }
}

/**
 * Format date to readable string
 */
function formatDate(dateString: string | undefined): string {
  if (!dateString) return "Recently";

  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;

  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Transform BlogPost to FeaturedNews format
 */
function transformToFeaturedNews(post: BlogPost): FeaturedNews {
  const description = stripAndTruncate(post.bodyHtml, 150);

  // Chỉ dùng getCoverImageUrl nếu có coverImageId, nếu không thì để null
  // để component có thể xử lý riêng (không hiển thị fallback image)
  const imageUrl = post.coverImageId 
    ? getCoverImageUrl(post.coverImageId) 
    : "";

  return {
    title: post.title,
    description: description || "Explore this amazing article about AI and technology.",
    category: post.category?.name || "Article",
    author: post.content.author.name || post.content.author.username,
    readTime: formatDate(post.content.createdAt),
    image: imageUrl,
    slug: post.slug,

  };
}

/**
 * Transform BlogPost to NewStory format
 */
function transformToNewStory(post: BlogPost): NewStory {
  const plainText = stripHtml(post.bodyHtml);
  const desc = stripAndTruncate(post.bodyHtml, 100);

  // Chỉ dùng getCoverImageUrl nếu có coverImageId, nếu không thì để null
  const imageUrl = post.coverImageId 
    ? getCoverImageUrl(post.coverImageId) 
    : "";

  return {
    title: post.title,
    category: post.category?.name || "Article",
    author: post.content.author.name || post.content.author.username,
    readTime: formatDate(post.content.createdAt),
    desc: desc || "Discover insights about AI, technology, and innovation.",
    detail: plainText || "Read more about this fascinating topic in artificial intelligence and its impact on our world.",
    image: imageUrl,
    slug: post.slug,
  };
}

/**
 * Transform BlogPost to FeaturedStory format
 */
function transformToFeaturedStory(post: BlogPost): FeaturedStory {
  const description = stripAndTruncate(post.bodyHtml, 100);

  // Chỉ dùng getCoverImageUrl nếu có coverImageId, nếu không thì để null
  const imageUrl = post.coverImageId 
    ? getCoverImageUrl(post.coverImageId) 
    : "";

  return {
    title: post.title,
    image: imageUrl,
    slug: post.slug,
    author: post.content.author.name || post.content.author.username,
    readTime: formatDate(post.content.createdAt),
    category: post.category?.name || "Article",
    description: description || "Explore this amazing article about AI and technology.",
  };
}

/**
 * Get news data from API (Server-side)
 */
export async function getNewsData(): Promise<NewsData> {
  try {
    const { httpServer } = await import("@/services/http.server");

    // Call API to get admin posts - limit to 4 posts
    // http.get() already returns res.data
    const response = await httpServer.get<IApiResponse<BlogPost[]>>('/blog/admin/posts?limit=4');


    // Handle different response structures:
    // Case 1: response is array directly -> BlogPost[]
    // Case 2: response is IApiResponse -> { timestamp, message, data: BlogPost[] }
    let posts: BlogPost[] = [];
    if (Array.isArray(response)) {
      // API returns array directly
      posts = response;
    } else if (response?.data && Array.isArray(response.data)) {
      // API returns wrapped in IApiResponse
      posts = response.data;
    }

    if (posts.length === 0) {
      logger.warn("No admin posts found, using fallback data", {
        response,
        responseData: response?.data,
      });
      return getFallbackNewsData();
    }

    // First post becomes featured news
    const featuredNews = posts[0] ? transformToFeaturedNews(posts[0]) : null;

    // Next 3 posts become new stories (posts 1, 2, 3)
    const newStories = posts.slice(1, 4).map(transformToNewStory);

    // Featured stories - reuse new stories for featured stories section
    const featuredStories: FeaturedStory[] = posts.slice(1, 4).map(transformToFeaturedStory);

    return {
      featuredNews: featuredNews || getFallbackNewsData().featuredNews,
      newStories,
      featuredStories,
    };
  } catch (error: any) {
    // Xử lý timeout và các lỗi khác một cách graceful
    if (error?.message?.includes('timeout') || error?.code === 'ECONNABORTED') {
      logger.warn("Timeout when fetching news data from API, using fallback");
    } else {
    logger.error("Error fetching news data from API:", error);
    }
    return getFallbackNewsData();
  }
}

/**
 * Get news data from API (Client-side)
 */
export async function getNewsDataClient(): Promise<NewsData> {
  try {
    // Call API to get admin posts - limit to 4 posts
    // http.get() returns AxiosResponse
    // Note: This endpoint may require auth, so we handle 401 gracefully
    const response = await http.get<IApiResponse<BlogPost[]>>('/blog/admin/posts?limit=4');


    // Handle different response structures:
    // Case 1: response.data is array directly -> BlogPost[]
    // Case 2: response.data is IApiResponse -> { timestamp, message, data: BlogPost[] }
    let posts: BlogPost[] = [];
    if (Array.isArray(response?.data)) {
      // API returns array directly
      posts = response.data;
    } else if ((response as any)?.data?.data && Array.isArray((response as any).data.data)) {
      // API returns wrapped in IApiResponse
      posts = (response as any).data.data;
    }

    if (posts.length === 0) {
      logger.warn("No admin posts found, using fallback data", {
        responseData: (response as any)?.data,
      });
      return getFallbackNewsData();
    }

    // First post becomes featured news
    const featuredNews = posts[0] ? transformToFeaturedNews(posts[0]) : null;

    // Next 3 posts become new stories (posts 1, 2, 3)
    const newStories = posts.slice(1, 4).map(transformToNewStory);

    // Featured stories - reuse new stories for featured stories section
    const featuredStories: FeaturedStory[] = posts.slice(1, 4).map(transformToFeaturedStory);

    return {
      featuredNews: featuredNews || getFallbackNewsData().featuredNews,
      newStories,
      featuredStories,
    };
  } catch (error: any) {
    // Nếu là 401 hoặc error được đánh dấu silent → không log
    const isAuthError = 
      error?.status === 401 || 
      error?.response?.status === 401 ||
      error?._silent ||
      error?._expected;
    
    if (!isAuthError) {
    logger.error("Error fetching news data from API:", error);
    }
    
    // Trả về fallback data cho mọi trường hợp
    return getFallbackNewsData();
  }
}

/**
 * Fallback news data when API fails
 */
function getFallbackNewsData(): NewsData {
  return {
    featuredNews: {
      title: "Google AI Studio",
      description: "Nâng Cấp Khả Năng Xử Lý Thông Tin: Gặp Gỡ Làn Chabot AI Thông Thường",
      category: "Featured",
      author: "AI Hub Team",
      readTime: "Recently",
      image: "/google-news.png",
      slug: "google-ai-studio",
    },
    newStories: [
      {
        title: "Quantum AI: The Next Frontier",
        category: "Research",
        author: "AI Hub Team",
        readTime: "Recently",
        desc: "Where Quantum Computing Meets Artificial Intelligence",
        detail: "Explore the fascinating intersection of quantum computing and artificial intelligence, and discover how this revolutionary combination is reshaping the future of technology.",
        image: "/quantum-ai.png",
        slug: "quantum-ai-next-frontier",
      },
      {
        title: "AI Ethics in 2025: New Frameworks",
        category: "Research",
        author: "AI Hub Team",
        readTime: "Recently",
        desc: "Exploring ethical considerations in modern AI development.",
        detail: "As artificial intelligence continues to evolve, new ethical frameworks are emerging to guide responsible development and deployment of AI systems.",
        image: "/ai-ethics.png",
        slug: "ai-ethics-2025",
      },
      {
        title: "Breakthrough in Neural Interfaces",
        category: "Research",
        author: "AI Hub Team",
        readTime: "Recently",
        desc: "The future of human-computer interaction is here.",
        detail: "Recent breakthroughs in neural interface technology are bringing us closer to seamless human-computer integration than ever before.",
        image: "/neural-interfaces.png",
        slug: "breakthrough-neural-interfaces",
      },
    ],
    featuredStories: [
      {
        title: "TOKEN2049 Singapore 2025: Từ Quá Khứ Đến Hiện Tại – Hành Trình Trở Thành Sự Kiện Web3 Lớn Nhất Thế Giới",
        image: "/thumb1.jpg",
      },
      {
        title: "TOKEN2049 Singapore 2025: Từ Quá Khứ Đến Hiện Tại – Hành Trình Trở Thành Sự Kiện Web3 Lớn Nhất Thế Giới",
        image: "/thumb2.jpg",
      },
      {
        title: "TOKEN2049 Singapore 2025: Từ Quá Khứ Đến Hiện Tại – Hành Trình Trở Thành Sự Kiện Web3 Lớn Nhất Thế Giới",
        image: "/thumb3.jpg",
      },
    ],
  };
}
