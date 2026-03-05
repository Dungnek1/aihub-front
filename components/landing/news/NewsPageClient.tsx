'use client';

import React, { useState, useEffect } from 'react';
import NewsCard from '@/components/landing/news/NewsCard';
import { getCoverImageUrl } from '@/utils/image.utils';
import { formatDateByLocale } from '@/utils/date';
import { stripHtmlTags } from '@/utils/sanitize.utils';
import { BlogPost, BlogCategory, filterPosts } from "@/services/client/blog.client";

interface NewsPageClientProps {
    initialPosts: BlogPost[];
    categories: BlogCategory[];
    locale: string;
}

const NewsPageClient: React.FC<NewsPageClientProps> = ({ initialPosts, categories, locale }) => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
    const [isLoading, setIsLoading] = useState(false);
    const postsPerPage = 7; // 1 featured + 6 grid posts

    // Construct filters from categories
    const filters = [
        { id: 'all', label: 'Tất cả', slug: 'all' },
        ...categories.map(cat => ({ id: cat.id, label: cat.name, slug: cat.slug }))
    ];

    const handleFilterChange = async (filterSlug: string) => {
        setActiveFilter(filterSlug);
        setCurrentPage(1);
        setIsLoading(true);

        try {
            if (filterSlug === 'all') {
                // Fetch all published posts
                const res = await filterPosts({ status: 'PUBLISHED', take: 100 });
                setPosts(res);
            } else {
                // Fetch posts by category slug (not ID)
                const res = await filterPosts({ category: filterSlug, status: 'PUBLISHED', take: 100 });
                setPosts(res);
            }
        } catch (error) {
            console.error("Failed to filter posts:", error);
            setPosts([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate pagination
    const totalPages = Math.ceil(posts.length / postsPerPage);
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const currentPosts = posts.slice(startIndex, endIndex);

    // Split into featured and grid posts
    const featuredPost = currentPosts[0];
    const gridPosts = currentPosts.slice(1);

    return (
        <div className="min-h-screen bg-white pt-24 pb-8 px-4 sm:px-8">
            <div className="max-w-[1280px] mx-auto w-full">
                {/* Header Section */}
                <div className="mb-8 flex justify-center">
                    <div className="flex flex-col text-center w-full max-w-[958px] gap-3">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tin Tức & Cập Nhật</h1>
                        <p className="text-gray-500 text-sm sm:text-base">
                            Khám phá những bài viết mới nhất về blockchain, tin tức và sự kiện từ cộng đồng AI Hub Việt Nam
                        </p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="mb-8 w-full">
                    <div className="flex overflow-x-auto pb-2 w-full sm:w-auto sm:max-w-[833px] gap-4 no-scrollbar px-4 mx-auto">
                        {filters.map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => handleFilterChange(filter.slug)}
                                className="px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all flex-shrink-0"
                                style={{
                                    background: activeFilter === filter.slug
                                        ? 'linear-gradient(17.67deg, #47C2FF 7.6%, #00E5FF 88.27%)'
                                        : '#FFFFFF',
                                    color: activeFilter === filter.slug ? '#FFFFFF' : '#6B7280',
                                    border: activeFilter === filter.slug ? 'none' : '1px solid #E5E7EB',
                                }}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* News Content */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                    </div>
                ) : posts.length > 0 ? (
                    <div className="flex flex-col gap-8 w-full">
                        {/* Featured Post (Horizontal) */}
                        {featuredPost && (
                            <div className="flex justify-center w-full">
                                <NewsCard
                                    variant="horizontal"
                                    imageUrl={getCoverImageUrl(featuredPost.coverImageId)}
                                    category={featuredPost.category?.name || 'Uncategorized'}
                                    date={formatDateByLocale(featuredPost.createdAt || '', locale)}
                                    title={featuredPost.title}
                                    description={stripHtmlTags(featuredPost.bodyHtml)}
                                    href={`/${locale}/landing/news/${featuredPost.slug}`}
                                />
                            </div>
                        )}

                        {/* Grid Posts */}
                        {gridPosts.length > 0 && (
                            <div className="flex justify-center w-full">
                                <div
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-[1240px] gap-4 justify-items-center mx-auto"
                                >
                                    {gridPosts.map((post) => (
                                        <NewsCard
                                            key={post.id}
                                            variant="vertical"
                                            imageUrl={getCoverImageUrl(post.coverImageId)}
                                            category={post.category?.name || 'Uncategorized'}
                                            date={formatDateByLocale(post.createdAt || '', locale)}
                                            title={post.title}
                                            description={stripHtmlTags(post.bodyHtml)}
                                            href={`/${locale}/landing/news/${post.slug}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className="w-10 h-10 rounded-lg font-medium text-sm transition-all"
                                        style={{
                                            background: currentPage === page
                                                ? 'linear-gradient(17.67deg, #47C2FF 7.6%, #00E5FF 88.27%)'
                                                : '#FFFFFF',
                                            color: currentPage === page ? '#FFFFFF' : '#6B7280',
                                            border: currentPage === page ? 'none' : '1px solid #E5E7EB',
                                        }}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-12">
                        No news available at the moment.
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsPageClient;
