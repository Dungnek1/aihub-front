"use client";

import { useEffect, useState } from "react";

interface BlogPost {
  id: string;
  title: string;
  author: string;
  timeAgo: string;
  tag: string;
  description: string;
  image: string;
  views: number;
  comments: number;
  likes: number;
}

interface UseBlogsParams {
  search?: string;
  filterTag?: string;
  category?: string;
  skip?: number;
  take?: number;
  authorId?: string;
  status?: string;
}

export function useFilterBlogs(params: UseBlogsParams = {}) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();

        if (params.search) queryParams.append("search", params.search);
        if (params.filterTag) queryParams.append("filterTag", params.filterTag);
        if (params.category) queryParams.append("category", params.category);
        if (params.skip) queryParams.append("skip", params.skip.toString());
        if (params.take) queryParams.append("take", params.take.toString());
        if (params.authorId) queryParams.append("authorId", params.authorId);
        // Default to PUBLISHED status for community blog posts if not specified
        queryParams.append("status", params.status || "PUBLISHED");

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000/api/v1';
        const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
        const apiUrl = baseUrl.includes('/api/v1') 
          ? `${baseUrl}/blog/filter`
          : `${baseUrl}/api/v1/blog/filter`;
        
        const res = await fetch(
          `${apiUrl}?${queryParams.toString()}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch blogs: ${res.status}`);
        }

        const data = await res.json();

        setPosts(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch blogs");
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
    // ✅ Use individual dependencies instead of JSON.stringify for better performance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.search, params.filterTag, params.category, params.skip, params.take, params.authorId, params.status]);

  return { posts, loading, error };
}
