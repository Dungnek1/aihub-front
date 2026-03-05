/**
 * Blog Service Client
 * Client-side API calls for blog operations
 */

import { http } from "@/services/http";
import type { IApiResponse } from "@/types/api.types";
import { logger } from "@/utils/logger";
import type { ActivityLog } from "./blog-actions.client";

/**
 * Author interface
 */
export interface Author {
    userId: string;
    username: string;
    email: string;
    name: string;
    role: string;
    bio?: string;
    avatarUrl: string;
}

/**
 * Tag interface
 */
export interface Tag {
    id: string;
    name: string;
}

/**
 * Content interface
 */
export interface Content {
    id: string;
    kind: string;
    status: string;
    viewsCount: number;
    reactionsCount: number;
    sharesCount: number;
    commentsCount: number;
    scheduledAt?: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    updatedBy?: string;
    author: Author;
    tags: Tag[];
}

/**
 * Category interface
 */
export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Blog post interface
 */
export interface BlogPost {
    id: string;
    contentId: string;
    title: string;
    slug: string;
    coverImageId?: string;
    bodyHtml: string;
    status: string;
    categoryId: string;
    seo?: any;
    content: Content;
    category: BlogCategory;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Blog comment user interface
 */
export interface BlogCommentUser {
    userId: string;
    username: string;
    avatarUrl: string;
}

/**
 * Blog comment interface
 */
export interface BlogComment {
    id: string;
    userId: string;
    refId: string; // Post ID
    targetType: string;
    parentCommentId?: string | null;
    status: string;
    body: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: string | null;
    updatedBy?: string | null;
    user?: BlogCommentUser;
    parentComment?: BlogComment | null;
    replies?: BlogComment[];
}

/**
 * Filter blog posts
 * @param params - Filter parameters
 * @returns Filtered blog posts
 */
export async function filterPosts(params: {
    userId?: string;
    category?: string;
    tagName?: string;
    title?: string;
    skip?: number;
    take?: number;
    status?: string;
}): Promise<BlogPost[]> {
    try {
        const queryParams = new URLSearchParams();

        if (params.userId) queryParams.set("userId", params.userId);
        if (params.category) queryParams.set("category", params.category);
        if (params.tagName) queryParams.set("tagName", params.tagName);
        if (params.title) queryParams.set("title", params.title);
        if (params.skip !== undefined) queryParams.set("skip", String(params.skip));
        if (params.take !== undefined) queryParams.set("take", String(params.take));
        // Default to PUBLISHED status for community blog posts if not specified
        queryParams.set("status", params.status || "PUBLISHED");

        const response = await http.get<any>(
            `/blog/filter?${queryParams.toString()}`
        );

        // Backend returns: { items: [...], total, page, limit }
        // http.get() already unwraps axios response, so response = { items: [...], total, page, limit }
        // Or might be wrapped in IApiResponse: response = { data: { items: [...], total, page, limit } }
        // Or old format: response = { data: [...] }
        const posts = response?.items || response?.data?.items || response?.data || [];
        return Array.isArray(posts) ? posts : [];
    } catch (error) {
        logger.error("Failed to filter posts:", error);
        return [];
    }
}

/**
 * Get blog post by slug
 * @param slug - Post slug
 * @returns Blog post
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
        // Use /blog/posts/... - interceptor will proxy to /api/proxy/blog/posts/...
        const response = await http.get<IApiResponse<BlogPost>>(`/blog/posts/${slug}`);
        return response?.data || null;
    } catch (error) {
        logger.error("Failed to get post by slug:", error);
        return null;
    }
}

/**
 * Get user's blog posts
 * @param params - Filter parameters
 * @returns User's blog posts
 */
export async function getUserPosts(params: {
    status?: string;
    pageNo?: number;
    pageSize?: number;
    sortBy?: string;
    sortType?: 'asc' | 'desc';
}): Promise<BlogPost[]> {
    try {
        const queryParams = new URLSearchParams();

        if (params.status) queryParams.set("status", params.status);
        if (params.pageNo !== undefined) queryParams.set("pageNo", String(params.pageNo));
        if (params.pageSize !== undefined) queryParams.set("pageSize", String(params.pageSize));
        if (params.sortBy) queryParams.set("sortBy", params.sortBy);
        if (params.sortType) queryParams.set("sortType", params.sortType);

        const response = await http.get<IApiResponse<BlogPost[]>>(
            `/blog/user/filter?${queryParams.toString()}`
        );

        return response?.data || [];
    } catch (error) {
        logger.error("Failed to get user posts:", error);
        return [];
    }
}

/**
 * Create a new blog post
 * @param postData - Post data
 * @returns Created post
 */
export async function createPost(postData: {
    title: string;
    bodyHtml?: string;
    categoryId?: string;
    tagIds?: string[];
    coverImageType?: 'image' | 'audio';
    file?: File;
}): Promise<BlogPost | null> {
    try {
        const formData = new FormData();

        formData.append("title", postData.title);
        if (postData.bodyHtml) formData.append("bodyHtml", postData.bodyHtml);
        if (postData.categoryId) formData.append("categoryId", postData.categoryId);
        if (postData.tagIds) {
            postData.tagIds.forEach(tagId => formData.append("tagIds", tagId));
        }
        if (postData.coverImageType) {
            formData.append("coverImageType", postData.coverImageType);
        }
        if (postData.file) {
            formData.append("file", postData.file);
        }

        const response = await http.post<IApiResponse<BlogPost>>("/blog/posts", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response?.data || null;
    } catch (error) {
        logger.error("Failed to create post:", error);
        throw error;
    }
}

/**
 * Update a blog post
 * @param id - Post ID
 * @param postData - Updated post data
 * @returns Updated post
 */
export async function updatePost(
    id: string,
    postData: {
        title?: string;
        slug?: string;
        bodyHtml?: string;
        categoryId?: string;
    }
): Promise<BlogPost | null> {
    try {
        // Use /blog/posts/... - interceptor will proxy to /api/proxy/blog/posts/...
        const response = await http.put<IApiResponse<BlogPost>>(`/blog/posts/${id}`, postData);
        return response?.data || null;
    } catch (error) {
        logger.error("Failed to update post:", error);
        throw error;
    }
}

/**
 * Delete a blog post
 * @param id - Post ID
 * @returns Success status
 */
export async function deletePost(id: string): Promise<boolean> {
    try {
        // Use /blog/posts/... - interceptor will proxy to /api/proxy/blog/posts/...
        await http.delete(`/blog/posts/${id}`);
        return true;
    } catch (error) {
        logger.error("Failed to delete post:", error);
        throw error;
    }
}

/**
 * Publish a blog post
 * @param id - Post ID
 * @returns Success status
 */
export async function publishPost(id: string): Promise<boolean> {
    try {
        await http.post(`/blog/posts/${id}/publish`);
        return true;
    } catch (error) {
        logger.error("Failed to publish post:", error);
        throw error;
    }
}

/**
 * Get blog categories
 * @returns Blog categories
 */
export async function getCategories(): Promise<BlogCategory[]> {
    try {
        const response = await http.get<IApiResponse<BlogCategory[]>>("/blog/categories");
        return response?.data || [];
    } catch (error) {
        logger.error("Failed to get categories:", error);
        return [];
    }
}

/**
 * Create a blog category
 * @param categoryData - Category data
 * @returns Created category
 */
export async function createCategory(categoryData: {
    name: string;
    slug: string;
    description?: string;
}): Promise<BlogCategory | null> {
    try {
        const response = await http.post<IApiResponse<BlogCategory>>("/blog/categories", categoryData);
        return response?.data || null;
    } catch (error) {
        logger.error("Failed to create category:", error);
        throw error;
    }
}

/**
 * Get comments for a post
 * @param params - Comment parameters
 * @returns Comments
 */
export async function getComments(params: {
    refId?: string;
    pageNo?: number;
    pageSize?: number;
    status?: string;
    sortBy?: string;
    sortType?: 'asc' | 'desc';
}): Promise<BlogComment[]> {
    try {
        const queryParams = new URLSearchParams();

        if (params.refId) queryParams.set("refId", params.refId);
        if (params.pageNo !== undefined) queryParams.set("pageNo", String(params.pageNo));
        if (params.pageSize !== undefined) queryParams.set("pageSize", String(params.pageSize));
        if (params.status) queryParams.set("status", params.status);
        if (params.sortBy) queryParams.set("sortBy", params.sortBy);
        if (params.sortType) queryParams.set("sortType", params.sortType);

        const response = await http.get<IApiResponse<BlogComment[]>>(
            `/blog/comment/list?${queryParams.toString()}`
        );

        return response?.data || [];
    } catch (error) {
        logger.error("Failed to get comments:", error);
        return [];
    }
}

/**
 * Create a comment
 * @param commentData - Comment data
 * @returns Created comment
 */
export async function createComment(commentData: {
    refId: string;
    bodyHtml: string;
    parentCommentId?: string;
}): Promise<BlogComment | null> {
    try {
        const response = await http.post<IApiResponse<BlogComment>>("/blog/comment/create", commentData);
        return response?.data || null;
    } catch (error) {
        logger.error("Failed to create comment:", error);
        throw error;
    }
}

/**
 * Get user's reaction to a post
 * @param contentId - Content ID of the post
 * @returns User reaction info or null if not reacted
 */
export async function getMyReaction(contentId: string): Promise<{ hasReacted: boolean; reactionType?: string } | null> {
    try {
        const response = await http.get<IApiResponse<{ hasReacted: boolean; reactionType?: string }>>(
            `/blog/posts/${contentId}/my-reaction`
        );
        return response?.data || null;
    } catch (error: any) {
        // 404 means user hasn't reacted, which is fine
        if (error?.response?.status === 404) {
            return { hasReacted: false };
        }
        logger.error("Failed to get my reaction:", error);
        return null;
    }
}

/**
 * Create/update/delete reactions
 * @param postId - Post ID
 * @param reactionType - Reaction type (for create/update)
 * @param method - HTTP method ('POST' | 'PUT' | 'DELETE')
 * @returns Success status
 */
export async function manageReaction(
    postId: string,
    reactionType?: string,
    method: 'POST' | 'PUT' | 'DELETE' = 'POST'
): Promise<boolean> {
    try {
        const url = `/blog/react/${postId}`;
        const data = reactionType ? { reactionType } : undefined;

        if (method === 'POST') {
            await http.post(url, data);
        } else if (method === 'PUT') {
            await http.put(url, data);
        } else if (method === 'DELETE') {
            await http.delete(url);
        }

        return true;
    } catch (error) {
        logger.error("Failed to manage reaction:", error);
        throw error;
    }
}

/**
 * Share a post
 * @param postId - Post ID
 * @param userId - User ID
 * @returns Success status
 */
export async function sharePost(postId: string, userId: string): Promise<boolean> {
    try {
        await http.post(`/blog/share/${postId}`, { userId });
        return true;
    } catch (error) {
        logger.error("Failed to share post:", error);
        throw error;
    }
}

/**
 * Get user activity
 * @param params - Activity parameters
 * @returns User activity
 */
export async function getUserActivity(params: {
    type?: 'reacted' | 'commented' | 'shared' | 'all';
    pageNo?: number;
    pageSize?: number;
}): Promise<ActivityLog[]> {
    try {
        const queryParams = new URLSearchParams();

        if (params.type) queryParams.set("type", params.type);
        if (params.pageNo !== undefined) queryParams.set("pageNo", String(params.pageNo));
        if (params.pageSize !== undefined) queryParams.set("pageSize", String(params.pageSize));

        const response = await http.get<IApiResponse<ActivityLog[]>>(
            `/blog/activity?${queryParams.toString()}`
        );

        return response?.data || [];
    } catch (error) {
        logger.error("Failed to get user activity:", error);
        return [];
    }
}

/**
 * Increment view count for a post
 * @param postId - Post ID
 * @returns Success status
 */
export async function incrementView(postId: string): Promise<boolean> {
    try {
        await http.post(`/blog/posts/${postId}/view`);
        return true;
    } catch (error) {
        logger.error("Failed to increment view:", error);
        return false;
    }
}