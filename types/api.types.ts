/**
 * Generic API Response Type
 * Matches backend response format: { timestamp, message, data }
 */

/**
 * Generic API Response wrapper
 * @template T - The type of data being returned
 */
export interface IApiResponse<T> {
    timestamp: string;
    message: string;
    data: T;
}

/**
 * Paginated response wrapper
 * @template T - The type of items in the data array
 */
export interface IApiPaginatedResponse<T> {
    timestamp: string;
    message: string;
    data: {
        items: T[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

/**
 * Error response (when API returns error status)
 */
export interface IApiErrorResponse {
    timestamp: string;
    message: string;
    statusCode: number;
    error?: string;
    data?: any;
}

/**
 * Login/Auth Response
 */
export interface ILoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        userId: string;
        username: string;
        email: string;
        name: string;
        phone?: string;
        avatarUrl?: string;
        createdAt: string;
    };
}

/**
 * User Profile Response
 */
export interface IUserResponse {
    userId: string;
    username: string;
    email: string;
    name: string;
    phone?: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt?: string;
}

/**
 * Blog Post Response
 */
export interface IBlogPostResponse {
    id: string;
    slug: string;
    title: string;
    author: string;
    tag: string;
    description: string;
    image: string;
    views: number;
    comments: number;
    likes: number;
    bodyHtml?: string;
    content?: {
        kind?: string;
        createdAt?: string;
        viewsCount?: number;
        commentsCount?: number;
        reactionsCount?: number;
        sharesCount?: number;
    };
    createdAt: string;
    updatedAt?: string;
}
