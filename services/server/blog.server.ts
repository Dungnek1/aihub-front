/**
 * Blog Service Server
 * Server-side API calls for blog operations
 * Use this instead of client-side blog.client.ts when called from server components or server actions
 */

import httpServerClient from "@/services/http.server";
import type { IApiResponse } from "@/types/api.types";
import type { BlogPost, BlogCategory, BlogComment } from "@/services/client/blog.client";

/**
 * List blog posts (server-side)
 * @param params - Pagination parameters
 * @returns Blog posts
 */
export async function listPosts(params: {
    skip?: number;
    take?: number;
    status?: string;
}): Promise<BlogPost[]> {
    try {
        const queryParams = new URLSearchParams();
        if (params.skip !== undefined) queryParams.set("skip", String(params.skip));
        if (params.take !== undefined) queryParams.set("take", String(params.take));
        // Default to PUBLISHED status for community blog posts if not specified
        queryParams.set("status", params.status || "PUBLISHED");

        // Use /blog/filter endpoint which is public, instead of /blog/posts which may require auth
        const response = await httpServerClient.get<any>(
            `/blog/filter?${queryParams.toString()}`
        );

        // Backend returns structure: { timestamp, message, data: { items: [...], total, page, limit } }
        // axios wraps it: response.data = { timestamp, message, data: { items: [...], total, page, limit } }
        // So we need to access: response.data.data.items

        // Try multiple possible response structures
        let posts: any[] = [];

        // Structure 1: response.data.data.items (IApiResponse wrapping paginated response)
        if (response?.data?.data?.items && Array.isArray(response.data.data.items)) {
            posts = response.data.data.items;
        }
        // Structure 2: response.data.data (IApiResponse wrapping array directly)
        else if (response?.data?.data && Array.isArray(response.data.data)) {
            posts = response.data.data;
        }
        // Structure 3: response.data.items (direct paginated response)
        else if (response?.data?.items && Array.isArray(response.data.items)) {
            posts = response.data.items;
        }
        // Structure 4: response.data (direct array)
        else if (Array.isArray(response?.data)) {
            posts = response.data;
        }

        return Array.isArray(posts) ? posts : [];
    } catch (error) {
        return [];
    }
}

/**
 * Filter blog posts (server-side)
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

        const response = await httpServerClient.get<any>(
            `/blog/filter?${queryParams.toString()}`
        );

        // Backend returns: { items: [...], total, page, limit }
        // axios wraps it: response.data = { items: [...], total, page, limit }
        // Or might be wrapped in IApiResponse: response.data = { data: { items: [...], total, page, limit } }
        const posts = response?.data?.items || response?.data?.data || [];

        // Ensure we always return an array
        return Array.isArray(posts) ? posts : [];
    } catch (error) {
        return [];
    }
}

/**
 * Get blog post by slug (server-side)
 * @param slug - Post slug
 * @param authenticated - Whether to use authenticated request (for editing own posts)
 * @returns Blog post
 */
export async function getPostBySlug(slug: string, authenticated: boolean = false): Promise<BlogPost | null> {
    try {
        if (authenticated) {
            // Use authenticated client for editing own posts
            const { getAuthenticatedHttpClient } = await import("@/services/http.server");
            const { getServerToken } = await import("@/lib/auth.server");

            const accessToken = await getServerToken();
            if (!accessToken) {
                console.log("getPostBySlug - No access token for authenticated request");
                return null;
            }

            const http = await getAuthenticatedHttpClient();
            // getAuthenticatedHttpClient already unwraps .data, so response is the actual data
            // Use /blog/posts/... because baseURL already includes /api/v1
            const response = await http.get<IApiResponse<BlogPost>>(`/blog/posts/${slug}`);
            // Response structure: response.data (from IApiResponse) or response directly
            return (response as any)?.data || response || null;
        } else {
            // Public endpoint - use /blog/posts/... because baseURL already includes /api/v1
            const response = await httpServerClient.get<IApiResponse<BlogPost>>(`/blog/posts/${slug}`);
            return response?.data?.data || response?.data || null;
        }
    } catch (error) {
        console.error("getPostBySlug error:", error);
        return null;
    }
}

/**
 * Get blog categories (server-side)
 * @returns Blog categories
 */
export async function getCategories(): Promise<BlogCategory[]> {
    try {
        const response = await httpServerClient.get<IApiResponse<BlogCategory[]>>("/blog/categories");
        return response?.data?.data || [];
    } catch (error) {
        return [];
    }
}

/**
 * Get trending posts (server-side)
 * @returns Trending posts
 */
export async function getTrendingPosts(take: number = 5): Promise<BlogPost[]> {
    try {
        const response = await httpServerClient.get<IApiResponse<BlogPost[]>>(
            `/blog/trending?take=${take}`
        );
        return response?.data?.data || [];
    } catch (error) {
        return [];
    }
}

/**
 * Get post comments (server-side)
 * @param postId - Post ID
 * @param skip - Skip count
 * @param take - Take count
 * @returns Post comments
 */
export async function getPostComments(
    postId: string,
    skip: number = 0,
    take: number = 10
): Promise<BlogComment[]> {
    try {
        const response = await httpServerClient.get<IApiResponse<BlogComment[]>>(
            `/blog/posts/${postId}/comments?skip=${skip}&take=${take}`
        );
        return response?.data?.data || [];
    } catch (error) {
        return [];
    }
}

/**
 * Get related posts (server-side)
 * @param postId - Current post ID
 * @param take - Take count
 * @returns Related posts
 */
export async function getRelatedPosts(postId: string, take: number = 4): Promise<BlogPost[]> {
    try {
        const response = await httpServerClient.get<IApiResponse<BlogPost[]>>(
            `/blog/posts/${postId}/related?take=${take}`
        );
        return response?.data?.data || [];
    } catch (error) {
        return [];
    }
}

/**
 * Get next post by slug (server-side)
 * @param slug - Current post slug
 * @returns Next blog post
 */
export async function getNextPost(slug: string): Promise<BlogPost | null> {
    try {
        const response = await httpServerClient.get<IApiResponse<BlogPost>>(`/blog/posts/${slug}/next`);
        return response?.data?.data || null;
    } catch (error) {
        return null;
    }
}

/**
 * Get user blog posts with filters (server-side)
 * Requires authentication token from request
 * @param params - Filter parameters
 * @param req - Optional request object for authentication
 * @returns User blog posts
 */
export async function getUserPosts(
    params: {
        status?: string;
        pageNo?: number;
        pageSize?: number;
        sortBy?: string;
        sortType?: 'asc' | 'desc';
    },
    req?: Request | any
): Promise<BlogPost[]> {
    try {
        // Import dependencies
        const { getAuthenticatedHttpClient } = await import("@/services/http.server");
        const { getServerToken } = await import("@/lib/auth.server");

        const accessToken = await getServerToken();
        console.log("getUserPosts - accessToken exists:", !!accessToken);

        // If we have a token, use authenticated client
        if (accessToken) {
            try {
                const http = await getAuthenticatedHttpClient();

                const queryParams = new URLSearchParams();
                if (params.status) queryParams.set("status", params.status);
                if (params.pageNo !== undefined) queryParams.set("pageNo", String(params.pageNo));
                if (params.pageSize !== undefined) queryParams.set("pageSize", String(params.pageSize));
                if (params.sortBy) queryParams.set("sortBy", params.sortBy);
                if (params.sortType) queryParams.set("sortType", params.sortType);

                const url = `/blog/user/filter?${queryParams.toString()}`;
                console.log("getUserPosts - calling URL:", url);

                const response = await http.get<IApiResponse<BlogPost[]> | { data?: unknown }>(url);
                console.log("getUserPosts - raw response:", response);
                console.log("getUserPosts - response type:", typeof response);
                console.log("getUserPosts - response keys:", response ? Object.keys(response) : "null");
                console.log("getUserPosts - response.data:", (response as any)?.data);
                console.log("getUserPosts - response.data type:", typeof (response as any)?.data);
                console.log("getUserPosts - response.data isArray:", Array.isArray((response as any)?.data));

                const payload = (response as { data?: any }).data ?? response;

                // Try different response structures
                let posts: BlogPost[] = [];
                if (payload) {
                    // Check if data is an array directly
                    if (Array.isArray(payload)) {
                        posts = payload;
                    }
                    // Check if data has nested data property (paginated response)
                    else if ((payload as any)?.data && Array.isArray((payload as any).data)) {
                        posts = (payload as any).data;
                    }
                    // Check if data has nested data.data (double nested)
                    else if ((payload as any)?.data?.data && Array.isArray((payload as any).data.data)) {
                        posts = (payload as any).data.data;
                    }
                }

                console.log("getUserPosts parsed posts:", posts.length);
                return posts;
            } catch (error) {
                // Log error for debugging
                console.error("getUserPosts API error:", error);
                throw error; // Re-throw to be caught by outer try-catch
            }
        }

        // No token available - return empty array
        return [];

    } catch (error) {
        // Log error for debugging
        console.error("getUserPosts error:", error);
        return [];
    }
}
