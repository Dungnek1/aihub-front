/**
 * Tool Types - Match backend API response
 */

export interface Tag {
    id: string;
    name: string;
}

export interface Audience {
    id: string;
    name: string;
}

export interface Price {
    id: string;
    name: string;
}

export interface Tool {
    id: string;
    name: string;
    description: string;
    slug: string;
    logoUrl: string | null;
    shortDesc: string | null;
    longDesc: string | null;
    avgRating: string | number;
    ratingsCount: number;
    useCount: number;
    status: number;
    bodyHtml: string | null;
    tags: Tag[];
    audiences: Audience[];
    price: string; // "PAID", "TRIAL", etc
    homepageUrl?: string | null;
    conversationStarters?: string[];
    usageInstructions?: string[];
    capabilities?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface FilterToolsResponse {
    timestamp: string;
    message: string;
    data: {
        tools: Tool[];
        total?: number;
        pageNo?: number;
        pageSize?: number;
    };
}

export interface TopToolsResponse {
    timestamp: string;
    message: string;
    data: {
        tools: Tool[];
        total?: number;
        pageNo?: number;
        pageSize?: number;
    };
}

export interface UserToolsResponse {
    timestamp: string;
    message: string;
    data: {
        tools: Tool[];
        total?: number;
        pageNo?: number;
        pageSize?: number;
    };
}

export interface PricesResponse {
    timestamp: string;
    message: string;
    data: {
        prices: Price[];
    };
}

export interface AudiencesResponse {
    timestamp: string;
    message: string;
    data: {
        audiences: Audience[];
    };
}
