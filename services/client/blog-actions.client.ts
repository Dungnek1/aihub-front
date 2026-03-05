/**
 * Blog Actions Service - Client Side
 * Handle POST/PUT/DELETE requests for blog operations
 */

import httpClient, { http } from "@/services/http";
import type { IApiResponse } from "@/types/api.types";
import type { BlogComment, BlogPost } from "@/services/client/blog.client";
import { logger } from "@/utils/logger";
import { httpServer } from "../http.server";

/**
 * Create a new blog post
 * @param data - Blog post data
 * @returns Created blog post
 */
export async function createBlogPost(data: {
    title: string;
    bodyHtml: string;
    categoryId: string;
    tags?: Array<{ id?: string; name: string }>;
    coverImageId?: string;
    status?: string;
}): Promise<BlogPost | null> {
    try {
        const response = await http.post<IApiResponse<BlogPost>>(
            "/blog/posts",
            data
        );
        // Handle both nested and flat response structures
        return (response as any).data?.data || (response as any).data || response || null;
    } catch (error) {
        logger.error("Failed to create blog post:", error);
        throw error;
    }
}

/**
 * Update an existing blog post
 * @param postId - Post ID
 * @param data - Updated blog post data
 * @returns Updated blog post
 */
export async function updateBlogPost(
    postId: string,
    data: {
        title?: string;
        bodyHtml?: string;
        categoryId?: string;
        tags?: Array<{ id?: string; name: string }>;
        coverImageId?: string;
        status?: string;
    }
): Promise<BlogPost | null> {
    try {
        const response = await http.put<IApiResponse<BlogPost>>(
            `/blog/posts/${postId}`,
            data
        );
        // Handle both nested and flat response structures
        return (response as any).data?.data || (response as any).data || response || null;
    } catch (error) {
        logger.error("Failed to update blog post:", error);
        throw error;
    }
}

/**
 * Delete a blog post
 * @param postId - Post ID
 * @returns Success status
 */
export async function deleteBlogPost(postId: string): Promise<boolean> {
    try {
        await http.delete(`/blog/posts/${postId}`);
        return true;
    } catch (error) {
        logger.error("Failed to delete blog post:", error);
        throw error;
    }
}

/**
 * Publish a blog post
 * @param postId - Post ID
 * @returns Published blog post
 */
export async function publishBlogPost(postId: string): Promise<BlogPost | null> {
    try {
        const response = await http.post<IApiResponse<BlogPost>>(
            `/blog/posts/${postId}/publish`
        );
        // Handle both nested and flat response structures
        return (response as any).data?.data || (response as any).data || response || null;
    } catch (error) {
        logger.error("Failed to publish blog post:", error);
        throw error;
    }
}

/**
 * Unpublish a blog post
 * @param postId - Post ID
 * @returns Unpublished blog post
 */
export async function unpublishBlogPost(postId: string): Promise<BlogPost | null> {
    try {
        const response = await http.post<IApiResponse<BlogPost>>(
            `/blog/posts/${postId}/unpublish`
        );
        // Handle both nested and flat response structures
        return (response as any).data?.data || (response as any).data || response || null;
    } catch (error) {
        logger.error("Failed to unpublish blog post:", error);
        throw error;
    }
}

/**
 * Add a comment to a blog post
 * @param postId - Post ID
 * @param bodyHtml - Comment HTML content
 * @param parentCommentId - Parent comment ID (for replies)
 * @returns Created comment
 */
export async function createComment(
    postId: string,
    bodyHtml: string,
    parentCommentId?: string
): Promise<BlogComment | null> {
    try {
        const response = await http.post<IApiResponse<BlogComment>>(
            `/blog/posts/${postId}/comments`,
            {
                bodyHtml,
                parentCommentId,
            }
        );
        // Handle both nested and flat response structures
        return (response as any).data?.data || (response as any).data || response || null;
    } catch (error) {
        logger.error("Failed to create comment:", error);
        throw error;
    }
}

/**
 * Update a comment
 * @param commentId - Comment ID
 * @param bodyHtml - Updated comment HTML content
 * @returns Updated comment
 */
export async function updateComment(
    commentId: string,
    bodyHtml: string
): Promise<BlogComment | null> {
    try {
        const response = await http.put<IApiResponse<BlogComment>>(
            `/blog/comments/${commentId}`,
            { bodyHtml }
        );
        // Handle both nested and flat response structures
        return (response as any).data?.data || (response as any).data || response || null;
    } catch (error) {
        logger.error("Failed to update comment:", error);
        throw error;
    }
}

/**
 * Delete a comment
 * @param commentId - Comment ID
 * @returns Success status
 */
export async function deleteComment(commentId: string): Promise<boolean> {
    try {
        await http.delete(`/blog/comments/${commentId}`);
        return true;
    } catch (error) {
        logger.error("Failed to delete comment:", error);
        throw error;
    }
}

/**
 * React to a blog post
 * @param postId - Post ID
 * @param reactionType - Reaction type (like, love, etc.)
 * @returns Reaction data
 */
export interface ReactionResponse {
    id: string;
    userId: string;
    refId: string;
    reactionType: string;
    createdAt: string;
}

export async function reactToPost(
    postId: string,
    reactionType: string
): Promise<ReactionResponse | null> {
    try {
        const response = await http.post<IApiResponse<ReactionResponse>>(
            `/blog/posts/${postId}/reactions`,
            { reactionType }
        );
        // Handle both nested and flat response structures
        return (response as any).data?.data || (response as any).data || response || null;
    } catch (error) {
        logger.error("Failed to react to post:", error);
        throw error;
    }
}

/**
 * Share a blog post
 * @param postId - Post ID
 * @returns Share data
 */
export interface ShareResponse {
    id: string;
    postId: string;
    userId: string;
    createdAt: string;
}

export async function sharePost(postId: string): Promise<ShareResponse | null> {
    try {
        const response = await http.post<IApiResponse<ShareResponse>>(
            `/blog/posts/${postId}/share`
        );
        // Handle both nested and flat response structures
        return (response as any).data?.data || (response as any).data || response || null;
    } catch (error) {
        logger.error("Failed to share post:", error);
        throw error;
    }
}

/**
 * Upload blog cover image
 * @param file - Image file
 * @returns Uploaded image URL
 */
export async function uploadBlogImage(file: File): Promise<string> {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await http.post<IApiResponse<{ url: string }>>(
            "/blog/upload",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        // Handle both nested and flat response structures
        return (response as any).data?.data?.url || (response as any).data?.url || (response as any).url || "";
    } catch (error) {
        logger.error("Failed to upload blog image:", error);
        throw error;
    }
}

/**
 * Get user's draft posts
 * @returns Draft posts
 */
export async function getDraftPosts(): Promise<BlogPost[]> {
    try {
        const response = await http.get<IApiResponse<BlogPost[]>>(
            "/blog/user/drafts"
        );
        // Handle both nested and flat response structures
        return (response as any).data?.data || (response as any).data || response || [];
    } catch (error) {
        logger.error("Failed to fetch draft posts:", error);
        return [];
    }
}

/**
 * Get user's published posts
 * @returns Published posts
 */
export async function getPublishedPosts(): Promise<BlogPost[]> {
    try {
        const response = await http.get<IApiResponse<BlogPost[]>>(
            "/blog/user/published"
        );
        // Handle both nested and flat response structures
        return (response as any).data?.data || (response as any).data || response || [];
    } catch (error) {
        logger.error("Failed to fetch published posts:", error);
        return [];
    }
}
/**
 * Get user's activity log
 * @param skip - Skip count
 * @param take - Take count
 * @returns Activity log
 */
export interface ActivityLog {
    id: string;
    action: string;
    targetType: string;
    targetId: string;
    createdAt: string;
    metadata?: Record<string, unknown>;
}

export async function getUserActivityLog(
    skip: number = 0,
    take: number = 10
): Promise<ActivityLog[]> {
    try {
        const response = await http.get<IApiResponse<ActivityLog[]>>(
            `/blog/user/activity?skip=${skip}&take=${take}`
        );
        // Handle both nested and flat response structures
        return (response as any).data?.data || (response as any).data || response || [];
    } catch (error) {
        logger.error("Failed to fetch activity log:", error);
        return [];
    }
}

/**
 * Filter blog posts by category/author
 * @param params - Filter parameters
 * @returns Filtered blog posts
 */
export async function filterBlogPosts(params: {
    category?: string;
    userId?: string;
    skip?: number;
    take?: number;
    tagName?: string;
    title?: string;
    status?: string;
}): Promise<BlogPost[]> {
    try {
        const queryParams = new URLSearchParams();
        if (params.category) queryParams.set("category", params.category);
        if (params.userId) queryParams.set("userId", params.userId);
        if (params.skip !== undefined) queryParams.set("skip", String(params.skip));
        if (params.take !== undefined) queryParams.set("take", String(params.take));
        if (params.tagName) queryParams.set("tagName", params.tagName);
        if (params.title) queryParams.set("title", params.title);
        // Default to PUBLISHED status for community blog posts if not specified
        queryParams.set("status", params.status || "PUBLISHED");

        const response = await http.get<IApiResponse<BlogPost[]>>(
            `/blog/filter?${queryParams.toString()}`
        );
        logger.log("Filtered blog posts response:", (response as any).data?.data || (response as any).data);

        // Handle both nested and flat response structures
        return (response as any).data?.data || (response as any).data || response || [];
    } catch (error) {
        logger.error("Failed to filter blog posts:", error);
        return [];
    }
}

/**
 * Get comments for a blog post
 * @param refId - Reference ID (post ID)
 * @param pageNo - Page number (0-indexed)
 * @param pageSize - Number of records per page
 * @param status - Filter by status (PUBLISHED, DRAFT, etc.)
 * @param sortBy - Sort field (createdAt)
 * @param sortType - Sort order (asc/desc)
 * @returns Comments list
 */
export async function getBlogComments(
    refId: string,
    pageNo: number = 0,
    pageSize: number = 5,
    status: string = 'PUBLISHED',
    sortBy: string = 'createdAt',
    sortType: 'asc' | 'desc' = 'desc'
): Promise<BlogComment[]> {
    try {
        const response = await http.get<IApiResponse<BlogComment[]>>(
            `/blog/comment/list?refId=${refId}&pageNo=${pageNo}&pageSize=${pageSize}&status=${status}&sortBy=${sortBy}&sortType=${sortType}`
        );
        logger.log("Blog comments response:", (response as any).data?.data || (response as any).data);
        // Handle both nested and flat response structures
        return (response as any).data?.data || (response as any).data || response || [];
    } catch (error) {
        logger.error("Failed to fetch blog comments:", error);
        return [];
    }
}

/**
 * Create a comment on a blog post
 * @param data - Comment data
 * @returns Created comment
 */
export async function createBlogComment(data: {
    refId: string;
    bodyHtml: string;
    parentCommentId?: string;
    userId: string;
}): Promise<BlogComment | null> {
    try {
        const response = await http.post<IApiResponse<BlogComment>>(
            `/blog/comment/create`,
            data
        );
        // Handle both nested and flat response structures
        return (response as any).data?.data || (response as any).data || response || null;
    } catch (error) {
        logger.error("Failed to create blog comment:", error);
        throw error;
    }
}

/**
 * Update a blog comment
 * @param commentId - Comment ID
 * @param data - Updated comment data
 * @returns Updated comment
 */
export async function updateBlogComment(
    commentId: string,
    data: { bodyHtml: string }
): Promise<BlogComment | null> {
    try {
        const response = await http.put<IApiResponse<BlogComment>>(
            `/blog/comments/${commentId}`,
            data
        );
        // Handle both nested and flat response structures
        return (response as any).data?.data || (response as any).data || response || null;
    } catch (error) {
        logger.error("Failed to update blog comment:", error);
        throw error;
    }
}

/**
 * Delete a blog comment
 * @param commentId - Comment ID
 * @returns Success status
 */
export async function deleteBlogComment(commentId: string): Promise<boolean> {
    try {
        await http.delete(`/blog/comments/${commentId}`);
        return true;
    } catch (error) {
        logger.error("Failed to delete blog comment:", error);
        throw error;
    }
}

/**
 * Create a reaction on a blog post
 * @param postId - Post ID
 * @param reactionType - Type of reaction (LIKE, LOVE, HAHA, WOW, SAD, ANGRY, THANKFUL, THUONGTHUONG)
 * @returns Created reaction
 */
export async function createReaction(
    postId: string,
    reactionType: string
): Promise<ReactionResponse | null> {
    try {
        const response = await httpClient.post<IApiResponse<ReactionResponse>>(
            `/blog/react/${postId}`,
            { reactionType }
        );
        // Handle both nested and flat response structures
        return (response as any).data?.data || (response as any).data || response || null;
    } catch (error) {
        logger.error("Failed to create reaction:", error);
        throw error;
    }
}
