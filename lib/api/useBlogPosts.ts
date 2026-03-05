"use client";

import { useState, useEffect, useMemo } from "react";

interface BlogPost {
  id: string;
  title: string;
  author: string;
  tag: string;
  description: string;
  image: string;
  views: number;
  comments: number;
  likes: number;
}

interface FilterOptions {
  userId?: string;
  category?: string;
  tagName?: string;
  title?: string;
  skip?: number;
  take?: number;
  status?: string;
}

export default function useBlogPosts(filters: FilterOptions) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Memoize filter values to prevent unnecessary re-renders
  const memoizedFilters = useMemo(
    () => ({
      userId: filters.userId,
      category: filters.category,
      tagName: filters.tagName,
      title: filters.title,
      skip: filters.skip ?? 0,
      take: filters.take ?? 10,
      status: filters.status,
    }),
    [
      filters.userId,
      filters.category,
      filters.tagName,
      filters.title,
      filters.skip,
      filters.take,
      filters.status,
    ]
  );

  useEffect(() => {
    const controller = new AbortController();
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (memoizedFilters.userId)
          params.append("userId", memoizedFilters.userId);
        if (memoizedFilters.category)
          params.append("category", memoizedFilters.category);
        if (memoizedFilters.tagName)
          params.append("tagName", memoizedFilters.tagName);
        if (memoizedFilters.title)
          params.append("title", memoizedFilters.title);
        params.append("skip", String(memoizedFilters.skip));
        params.append("take", String(memoizedFilters.take));
        // Default to PUBLISHED status for community blog posts if not specified
        params.append("status", memoizedFilters.status || "PUBLISHED");

        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000/api/v1";
        const baseUrl = backendUrl.endsWith("/")
          ? backendUrl.slice(0, -1)
          : backendUrl;
        const apiUrl = baseUrl.includes("/api/v1")
          ? `${baseUrl}/blog/filter`
          : `${baseUrl}/api/v1/blog/filter`;

        const res = await fetch(`${apiUrl}?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const data = await res.json();

        setPosts(data.data || []);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    return () => controller.abort();
  }, [memoizedFilters]);

  return { posts, loading, error };
}
