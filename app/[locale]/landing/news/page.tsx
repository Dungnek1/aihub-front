import React from 'react';
import { getCoverImageUrl } from '@/utils/image.utils';
import { BlogPost } from "@/services/client/blog.client";
import NewsPageClient from '@/components/landing/news/NewsPageClient';

interface PageProps {
    params: Promise<{ locale: string }>;
}

import { getCategories } from "@/services/server/blog.server";

// ... existing imports

// Revalidate mỗi 60 giây để cập nhật bài viết mới
export const revalidate = 60;

const NewsPage = async ({ params }: PageProps) => {
    const { locale } = await params;

    let posts: BlogPost[] = [];
    let categories: any[] = [];

    try {
        // Fetch categories
        categories = await getCategories();

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000/api/v1';
        const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
        const apiUrl = baseUrl.includes('/api/v1')
            ? `${baseUrl}/blog/filter`
            : `${baseUrl}/api/v1/blog/filter`;

        const queryParams = new URLSearchParams();
        queryParams.set("status", "PUBLISHED");
        queryParams.set("take", "10");

        const res = await fetch(
            `${apiUrl}?${queryParams.toString()}`,
            {
                next: { revalidate: 60 },
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!res.ok) {
            throw new Error(`Failed to fetch posts: ${res.status}`);
        }

        const data = await res.json();

        // Handle different response structures
        if (Array.isArray(data.data)) {
            posts = data.data;
        } else if (data.data && Array.isArray(data.data.items)) {
            posts = data.data.items;
        } else if (Array.isArray(data)) {
            posts = data;
        }

    } catch (error) {
        console.error("❌ Error fetching data:", error);
    }

    return <NewsPageClient initialPosts={posts} categories={categories} locale={locale} />;
};

export default NewsPage;
