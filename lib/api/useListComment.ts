"use client";

import { useEffect, useState } from "react";

interface Comment {
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

interface UseCommentsParams {
  pageNo?: number;
  pageSize?: number;
  status?: string;
  sortBy?: number;
  sortType?: string;
  refId?: string;
}

export function useListComments(params: UseCommentsParams = {}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComments() {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();

        if (params.pageNo)
          queryParams.append("pageNo", params.pageNo.toString());
        if (params.pageSize)
          queryParams.append("pageSize", params.pageSize.toString());
        if (params.status) queryParams.append("status", params.status);
        if (params.sortBy)
          queryParams.append("sortBy", params.sortBy.toString());
        if (params.sortType)
          queryParams.append("sortType", params.sortType.toString());
        if (params.refId) queryParams.append("refId", params.refId);

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000/api/v1';
        const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
        const apiUrl = baseUrl.includes('/api/v1') 
          ? `${baseUrl}/blog/comment/list`
          : `${baseUrl}/api/v1/blog/comment/list`;
        
        const res = await fetch(
          `${apiUrl}?${queryParams.toString()}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch blogs: ${res.status}`);
        }

        const data = await res.json();

        setComments(data.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch comments"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchComments();
  }, [JSON.stringify(params)]);

  return { comments, loading, error };
}
