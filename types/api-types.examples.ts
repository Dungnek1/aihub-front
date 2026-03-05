/**
 * API Types Usage Examples
 * Generic type definitions for all API responses
 */

import {
    IApiResponse,
    IApiPaginatedResponse,
    IApiErrorResponse,
    ILoginResponse,
    IUserResponse,
    IBlogPostResponse
} from "@/types/api.types";

/**
 * EXAMPLE 1: Simple API call with generic response
 * Backend returns: { timestamp, message, data: T }
 */
export async function fetchUser(userId: string) {
    // This function returns IApiResponse<IUserResponse>
    // Type: { timestamp, message, data: IUserResponse }
    const response: IApiResponse<IUserResponse> = {
        timestamp: "2025-11-02T10:30:00Z",
        message: "User fetched successfully",
        data: {
            userId: "123",
            username: "john_doe",
            email: "john@example.com",
            name: "John Doe",
            phone: "0123456789",
            avatarUrl: "https://example.com/avatar.jpg",
            createdAt: "2025-01-01T00:00:00Z",
        }
    };
    return response;
}

/**
 * EXAMPLE 2: Paginated API response
 * Backend returns: { timestamp, message, data: { items: T[], total, page, limit, totalPages } }
 */
export async function fetchBlogPosts(page: number = 1, limit: number = 10) {
    // This function returns IApiPaginatedResponse<IBlogPostResponse>
    const response: IApiPaginatedResponse<IBlogPostResponse> = {
        timestamp: "2025-11-02T10:30:00Z",
        message: "Blog posts fetched successfully",
        data: {
            items: [
                {
                    id: "1",
                    slug: "first-post",
                    title: "First Post",
                    author: "John Doe",
                    tag: "tutorial",
                    description: "This is the first post",
                    image: "https://example.com/image.jpg",
                    views: 100,
                    comments: 5,
                    likes: 20,
                    createdAt: "2025-01-01T00:00:00Z",
                }
            ],
            total: 50,
            page: 1,
            limit: 10,
            totalPages: 5
        }
    };
    return response;
}

/**
 * EXAMPLE 3: Login response
 * Backend returns: { timestamp, message, data: ILoginResponse }
 */
export async function loginExample() {
    // This function returns IApiResponse<ILoginResponse>
    const response: IApiResponse<ILoginResponse> = {
        timestamp: "2025-11-02T10:30:00Z",
        message: "Login successful",
        data: {
            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            user: {
                userId: "123",
                username: "john_doe",
                email: "john@example.com",
                name: "John Doe",
                phone: "0123456789",
                avatarUrl: "https://example.com/avatar.jpg",
                createdAt: "2025-01-01T00:00:00Z",
            }
        }
    };
    return response;
}

/**
 * EXAMPLE 4: Using generic types in http.ts API calls
 * 
 * // For simple responses
 * const response = await http.post<IApiResponse<IUserResponse>>("/api/users", userData);
 * 
 * // For paginated responses
 * const posts = await http.get<IApiPaginatedResponse<IBlogPostResponse>>("/api/posts?page=1");
 * 
 * // For login
 * const auth = await http.post<IApiResponse<ILoginResponse>>("/auth/login", credentials);
 */

/**
 * EXAMPLE 5: Extending the generic types for custom responses
 * 
 * interface ICustomData {
 *   id: string;
 *   name: string;
 *   custom: string;
 * }
 * 
 * const response: IApiResponse<ICustomData> = {
 *   timestamp: "2025-11-02T10:30:00Z",
 *   message: "Success",
 *   data: {
 *     id: "1",
 *     name: "Test",
 *     custom: "value"
 *   }
 * };
 */

/**
 * STRUCTURE SUMMARY:
 * 
 * Backend Response Format (Standard):
 * {
 *   timestamp: string;     // ISO 8601 timestamp
 *   message: string;       // Response message
 *   data: T;              // Generic data type
 * }
 * 
 * Use Case 1 - Simple Response:
 * IApiResponse<T> → for single object responses
 * 
 * Use Case 2 - Paginated Response:
 * IApiPaginatedResponse<T> → for list responses with pagination
 * 
 * Use Case 3 - Login/Auth Response:
 * IApiResponse<ILoginResponse> → for authentication endpoints
 * 
 * Use Case 4 - User Profile:
 * IApiResponse<IUserResponse> → for user data endpoints
 * 
 * Use Case 5 - Blog Posts:
 * IApiResponse<IBlogPostResponse> or IApiPaginatedResponse<IBlogPostResponse>
 */
