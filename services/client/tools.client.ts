/**
 * Tools Service Client
 * Server-side API calls for tools
 */

import { http } from "@/services/http";
import { IApiResponse } from "@/types";
import { logger } from "@/utils/logger";
import type {
  Tool,
  FilterToolsResponse,
  TopToolsResponse,
  UserToolsResponse,
  Price,
  Audience,
  PricesResponse,
  AudiencesResponse,
} from "@/types/tool.types";

function normalizeTool(raw: any): Tool {
  if (!raw || typeof raw !== "object") {
    return {
      id: "",
      name: "",
      description: "",
      price: "FREE",
      avgRating: 5,
      ratingsCount: 0,
      logoUrl: "",
      homepageUrl: "",
      slug: "",
    } as Tool;
  }

  const price =
    typeof raw.price === "string"
      ? raw.price
      : raw.price?.name || raw.price?.id || "FREE";

  return {
    ...raw,
    price,
    name: raw.title || raw.name || "",
    description: raw.shortDesc || raw.description || "",
    logoUrl: raw.coverImageLink || raw.thumbnail || raw.logoUrl || "",
    avgRating:
      typeof raw.avgRating === "number"
        ? raw.avgRating
        : raw.ratings?.length
        ? 5
        : 5,
    ratingsCount:
      typeof raw.ratingsCount === "number"
        ? raw.ratingsCount
        : raw.ratings?.length || 0,
  } as Tool;
}

/**
 * Normalize marketing tool data from API response
 * Marketing tools may have different structure than regular tools
 */
function normalizeMarketingTool(raw: any): Tool {
  if (!raw || typeof raw !== "object") {
    return {
      id: "",
      name: "",
      description: "",
      price: "FREE",
      avgRating: 5,
      ratingsCount: 0,
      logoUrl: "",
      homepageUrl: "",
      slug: "",
    } as Tool;
  }

  // Handle price - marketing tools may have price object with name/id
  const price =
    typeof raw.price === "string"
      ? raw.price
      : raw.price?.name || raw.price?.id || "FREE";

  // Handle coverImageLink - marketing tools use coverImageLink
  const logoUrl = raw.coverImageLink || raw.thumbnail || raw.logoUrl || "";

  // Handle ratings - marketing tools may have ratings array or direct fields
  const ratingsCount =
    typeof raw.ratingsCount === "number"
      ? raw.ratingsCount
      : raw.ratings?.length > 0
      ? raw.ratings[0]?.totalRatings || raw.ratings.length
      : 0;

  const avgRating =
    typeof raw.avgRating === "number" && raw.avgRating > 0
      ? raw.avgRating
      : raw.ratings?.length > 0 && raw.ratings[0]?.avgRating && raw.ratings[0].avgRating > 0
      ? raw.ratings[0].avgRating
      : 5; // Default to 5 if no rating

  return {
    ...raw,
    price,
    name: raw.title || raw.name || "",
    description: raw.shortDesc || raw.description || "",
    shortDesc: raw.shortDesc || null,
    bodyHtml: raw.bodyHtml || raw.description || null,
    logoUrl,
    avgRating,
    ratingsCount,
    homepageUrl: raw.homepageUrl || raw.link || "#",
    slug: raw.slug || "",
    conversationStarters: raw.conversationStarters || [],
    usageInstructions: raw.usageInstructions || [],
    capabilities: raw.capabilities || [],
    tags: raw.tags || [],
    audiences: raw.audiences || [],
  } as Tool;
}

/**
 * Get featured marketing tools
 * @param limit - Number of featured marketing tools to return (default: 4)
 * @returns Featured marketing tools
 */
export async function getFeaturedMarketingTools(
  limit: number = 4
): Promise<Tool[]> {
  try {
    const response = await http.get<IApiResponse<Tool[]> | { data?: unknown }>(
      `/tool-marketings/featured?limit=${limit}`
    );

    const payload = (response as { data?: any }).data ?? response;

    // Handle different response structures
    if (Array.isArray(payload)) {
      return payload.map(normalizeMarketingTool);
    } else if (payload?.data && Array.isArray(payload.data)) {
      return payload.data.map(normalizeMarketingTool);
    }

    return [];
  } catch (error: any) {
    console.error(
      "[Marketing Tools Client] Failed to fetch featured marketing tools:",
      error
    );
    return [];
  }
}

/**
 * Get marketing tool by ID (client-side)
 * @param id - Marketing tool ID
 * @returns Marketing tool details
 */
export async function getMarketingToolById(id: string): Promise<Tool | null> {
  try {
    const response = await http.get<IApiResponse<Tool> | { data?: unknown }>(
      `/tool-marketings/${id}`
    );

    const payload = (response as { data?: any }).data ?? response;

    // Handle different response structures
    let rawData: any = null;

    if (payload) {
      // Case 1: response is the data directly
      if ((payload as any).id) {
        rawData = payload;
      }
      // Case 2: response.data is the data
      else if ((payload as any).data) {
        if ((payload as any).data.id) {
          rawData = (payload as any).data;
        } else if ((payload as any).data.data && (payload as any).data.data.id) {
          rawData = (payload as any).data.data;
        }
      }
    }

    if (rawData) {
      const normalized = normalizeMarketingTool(rawData);
      // Debug logging removed to reduce console noise
      return normalized;
    }

    return null;
  } catch (error: any) {
    const statusCode = error?.response?.status || error?.status;
    if (statusCode === 404) {
      console.warn(
        `[Marketing Tools Client] Marketing tool with ID ${id} not found`
      );
    } else {
      console.error(
        "[Marketing Tools Client] Failed to fetch marketing tool by ID:",
        {
          id,
          error: error?.message || error,
          status: statusCode,
          response: error?.response?.data,
        }
      );
    }
    return null;
  }
}

/**
 * Get marketing tool ratings
 * @param id - Marketing tool ID
 * @param skip - Skip items (optional)
 * @param take - Take items (optional)
 * @returns Marketing tool ratings
 */
export async function getMarketingToolRatings(
  id: string,
  skip?: number,
  take?: number
): Promise<RatingStats | null> {
  try {
    const params: Record<string, number> = {};
    if (skip !== undefined) params.skip = skip;
    if (take !== undefined) params.take = take;

    const response = await http.get<IApiResponse<RatingStats> | { data?: unknown }>(
      `/tool-marketings/${id}/ratings`,
      { params }
    );

    const payload = (response as { data?: any }).data ?? response;

    // Handle different response structures
    if (payload) {
      if (
        (payload as any).avgRating !== undefined ||
        (payload as any).total !== undefined
      ) {
        return payload as RatingStats;
      } else if ((payload as any).data) {
        return (payload as any).data as RatingStats;
      }
    }

    return null;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      console.warn(
        `[Marketing Tools Client] Ratings for marketing tool ${id} not found`
      );
    } else {
      console.error(
        "[Marketing Tools Client] Failed to fetch marketing tool ratings:",
        error
      );
    }
    return null;
  }
}

/**
 * Rate a marketing tool
 * @param id - Marketing tool ID
 * @param stars - Rating stars (1-5)
 * @returns Rating response with updated average rating and count
 */
export interface RateMarketingToolResponse {
  success?: boolean;
  avgRating: number;
  ratingsCount: number;
  message?: string;
}

export async function rateMarketingTool(
  id: string,
  stars: number
): Promise<RateMarketingToolResponse | null> {
  try {
    const response = await http.post<IApiResponse<RateMarketingToolResponse> | { data?: unknown }>(
      `/tool-marketings/${id}/ratings`,
      {
        rating: stars,
      }
    );

    const payload = (response as { data?: any }).data ?? response;

    // Handle different response structures
    if (payload) {
      if ((payload as any).avgRating !== undefined) {
        return payload as RateMarketingToolResponse;
      } else if (
        (payload as any).data &&
        (payload as any).data.avgRating !== undefined
      ) {
        return (payload as any).data as RateMarketingToolResponse;
      }
    }

    return null;
  } catch (error: any) {
    if (error?.response?.status === 400) {
      throw new Error("User already rated this marketing tool");
    }
    console.error(
      "[Marketing Tools Client] Failed to rate marketing tool:",
      error
    );
    throw error;
  }
}

/**
 * Get all marketing tools with pagination
 * @param params - Pagination parameters
 * @returns Marketing tools with pagination info
 */
export async function getMarketingTools(params: {
  page?: number;
  limit?: number;
  skip?: number;
  take?: number;
  status?: string;
  isFeatured?: boolean;
}): Promise<{ items: Tool[]; total: number; page: number; limit: number }> {
  try {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.set("page", String(params.page));
    if (params.limit !== undefined)
      queryParams.set("limit", String(params.limit));
    if (params.skip !== undefined) queryParams.set("skip", String(params.skip));
    if (params.take !== undefined) queryParams.set("take", String(params.take));
    if (params.status) queryParams.set("status", params.status);
    if (params.isFeatured !== undefined)
      queryParams.set("isFeatured", String(params.isFeatured));

    const response = await http.get<
      IApiResponse<{
        items: Tool[];
        total: number;
        page: number;
        limit: number;
      }> | { data?: unknown }
    >(`/tool-marketings?${queryParams.toString()}`);

    const payload = (response as { data?: any }).data ?? response;

    // Handle different response structures
    if (payload) {
      if (Array.isArray(payload)) {
        return {
          items: payload.map(normalizeMarketingTool),
          total: payload.length,
          page: params.page || 1,
          limit: params.limit || params.take || 10,
        };
      } else if (payload.items && Array.isArray(payload.items)) {
        return {
          items: payload.items.map(normalizeMarketingTool),
          total: payload.total || payload.items.length,
          page: payload.page || params.page || 1,
          limit: payload.limit || params.limit || params.take || 10,
        };
      } else if (payload.data && payload.data.items) {
        return {
          items: payload.data.items.map(normalizeMarketingTool),
          total: payload.data.total || payload.data.items.length,
          page: payload.data.page || params.page || 1,
          limit: payload.data.limit || params.limit || params.take || 10,
        };
      }
    }

    return {
      items: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || params.take || 10,
    };
  } catch (error: any) {
    console.error(
      "[Marketing Tools Client] Failed to fetch marketing tools:",
      error
    );
    return {
      items: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || params.take || 10,
    };
  }
}

/**
 * Get top rated tools
 * @param pageNo - Page number (default: 0)
 * @param pageSize - Page size (default: 4)
 * @returns Top rated tools
 */
export async function getTopTools(
  pageNo: number = 0,
  pageSize: number = 4
): Promise<Tool[]> {
  try {
    const response = await http.get<TopToolsResponse>("/tools/top", {
      params: {
        pageNo,
        pageSize,
        sortBy: "avgRating",
        sortType: "desc",
        status: 1,
      },
    });

    // Backend response structure: { timestamp, message, data: { tools: Tool[], ... } }
    if (!response) {
      return [];
    }

    if (
      response.data &&
      typeof response.data === "object" &&
      "tools" in response.data
    ) {
      const tools = (response.data as any).tools;
      if (Array.isArray(tools)) {
        return tools;
      }
    }

    // Fallback: check if response.data is array directly
    if (Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  } catch (error: any) {
    // If error is marked as silent (grace period) or expected, don't log
    if (error?._silent || error?._expected) {
      return [];
    }

    // Handle different error types gracefully
    const errorMessage = error?.message || "";
    const status = error?.status || error?.response?.status;

    // 404, 401, and other expected errors should return empty array silently
    const isExpectedError =
      error?._expected ||
      status === 404 ||
      status === 401 ||
      status === 403 ||
      errorMessage.includes("404") ||
      errorMessage.includes("401") ||
      errorMessage.includes("403") ||
      errorMessage.includes("Not found") ||
      errorMessage.includes("Invalid token") ||
      errorMessage.includes("Unauthorized") ||
      errorMessage.includes("Request failed with status code 404") ||
      errorMessage.includes("Request failed with status code 401");

    if (isExpectedError) {
      // Only log in development mode for debugging
      if (process.env.NODE_ENV === "development") {
        console.debug(
          `[getTopTools] Expected error (${status || "unknown"}):`,
          errorMessage
        );
      }
      return [];
    }

    // Only log actual errors (network issues, server errors, etc.) in development
    if (process.env.NODE_ENV === "development") {
      logger.error("Failed to fetch top tools:", error);
    }
    return [];
  }
}

/**
 * Filter tools with search/filter criteria
 * @param pageNo - Page number (default: 0)
 * @param pageSize - Page size (default: 8)
 * @param price - Filter by price (PAID, TRIAL)
 * @param audience - Filter by audience
 * @returns Filtered tools
 */
export async function filterTools(
  pageNo: number = 0,
  pageSize: number = 8,
  price?: string,
  audience?: string
): Promise<Tool[]> {
  try {
    const params: Record<string, string | number> = {
      pageNo,
      pageSize,
      sortBy: "avgRating",
      sortType: "desc",
    };

    if (price) params.price = price;
    if (audience) params.audience = audience;

    const response = await http.get<FilterToolsResponse>("/tools/filter", {
      params,
    });

    // Backend response structure: { timestamp, message, data: { tools: Tool[], ... } }
    if (!response) {
      return [];
    }

    if (
      response.data &&
      typeof response.data === "object" &&
      "tools" in response.data
    ) {
      const tools = (response.data as any).tools;
      if (Array.isArray(tools)) {
        return tools;
      }
    }

    // Fallback: check if response.data is array directly
    if (Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  } catch (error: any) {
    // If error is marked as silent (grace period) or expected, don't log
    if (error?._silent || error?._expected) {
      return [];
    }

    // Handle different error types gracefully
    const errorMessage = error?.message || "";
    const status = error?.status || error?.response?.status;

    // 404, 401, and other expected errors should return empty array silently
    const isExpectedError =
      error?._expected ||
      status === 404 ||
      status === 401 ||
      status === 403 ||
      errorMessage.includes("404") ||
      errorMessage.includes("401") ||
      errorMessage.includes("403") ||
      errorMessage.includes("Not found") ||
      errorMessage.includes("Invalid token") ||
      errorMessage.includes("Unauthorized") ||
      errorMessage.includes("Request failed with status code 404") ||
      errorMessage.includes("Request failed with status code 401");

    if (isExpectedError) {
      // Only log in development mode for debugging
      if (process.env.NODE_ENV === "development") {
        console.debug(
          `[filterTools] Expected error (${status || "unknown"}):`,
          errorMessage
        );
      }
      return [];
    }

    // Only log actual errors (network issues, server errors, etc.) in development
    if (process.env.NODE_ENV === "development") {
      logger.error("Failed to filter tools:", error);
    }
    return [];
  }
}

/**
 * Get user's used tools (requires authentication)
 * @param pageNo - Page number (default: 0)
 * @param pageSize - Page size (default: 10)
 * @returns User's used tools
 */
export async function getUserUsedTools(
  pageNo: number = 0,
  pageSize: number = 10
): Promise<Tool[]> {
  try {
    const response = await http.get<UserToolsResponse>("/tools/used", {
      params: {
        pageNo,
        pageSize,
      },
    });

    // Backend response structure: { timestamp, message, data: { tools: Tool[], total, pageNo, pageSize } }
    // http.get() returns res.data from axios, so response is already the backend response body
    if (!response) {
      return [];
    }

    // Check if response has error message (from proxy 401 response)
    if (
      response &&
      typeof response === "object" &&
      "message" in response &&
      !("data" in response)
    ) {
      // This is an error response from proxy (e.g., { message: "Invalid token!" })
      return [];
    }

    // Check if response is UserToolsResponse structure
    if (
      response.data &&
      typeof response.data === "object" &&
      "tools" in response.data
    ) {
      const tools = (response.data as any).tools;
      if (Array.isArray(tools)) {
        return tools;
      }
    }

    // Fallback: check if response.data is array directly
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // Fallback: check if response itself is array
    if (Array.isArray(response)) {
      return response;
    }

    // Log in development if structure is unexpected
    if (process.env.NODE_ENV === "development") {
      logger.warn("Unexpected response structure for getUserUsedTools", {
        response: JSON.stringify(response).substring(0, 200),
      });
    }

    return [];
  } catch (error: any) {
    // If error is marked as silent (grace period) or expected, don't log
    if (error?._silent || error?._expected) {
      return [];
    }

    // If error is 401, 404, 403 (unauthorized/not found) or invalid token, user is not authenticated
    // This is expected behavior, don't log as error
    const errorMessage = error?.message || "";
    const status = error?.status || error?.response?.status;
    const isAuthError =
      error?._expected ||
      status === 401 ||
      status === 404 ||
      status === 403 ||
      errorMessage.includes("401") ||
      errorMessage.includes("404") ||
      errorMessage.includes("403") ||
      errorMessage.includes("Invalid token") ||
      errorMessage.includes("Unauthorized") ||
      errorMessage.includes("Token") ||
      errorMessage.includes("Not found") ||
      errorMessage.includes("Request failed with status code 404") ||
      errorMessage.includes("Request failed with status code 401");

    if (isAuthError) {
      // Silent fail - user not authenticated
      return [];
    }

    // Only log actual errors (network issues, server errors, etc.)
    if (process.env.NODE_ENV === "development") {
      logger.error("Failed to fetch used tools:", error);
    }
    return [];
  }
}

/**
 * Get user's saved tools (requires authentication)
 * @param pageNo - Page number (default: 0)
 * @param pageSize - Page size (default: 10)
 * @returns User's saved tools
 */
export async function getUserSavedTools(
  pageNo: number = 0,
  pageSize: number = 10
): Promise<Tool[]> {
  try {
    const response = await http.get<UserToolsResponse>("/tools/saved", {
      params: {
        pageNo,
        pageSize,
      },
    });

    // Backend response structure: { timestamp, message, data: { tools: Tool[], total, pageNo, pageSize } }
    // http.get() returns res.data from axios, so response is already the backend response body
    if (!response) {
      return [];
    }

    // Check if response has error message (from proxy 401 response)
    if (
      response &&
      typeof response === "object" &&
      "message" in response &&
      !("data" in response)
    ) {
      // This is an error response from proxy (e.g., { message: "Invalid token!" })
      return [];
    }

    // Check if response is UserToolsResponse structure
    if (
      response.data &&
      typeof response.data === "object" &&
      "tools" in response.data
    ) {
      const tools = (response.data as any).tools;
      if (Array.isArray(tools)) {
        return tools;
      }
    }

    // Fallback: check if response.data is array directly
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // Fallback: check if response itself is array
    if (Array.isArray(response)) {
      return response;
    }

    // Log in development if structure is unexpected
    if (process.env.NODE_ENV === "development") {
      logger.warn("Unexpected response structure for getUserSavedTools", {
        response: JSON.stringify(response).substring(0, 200),
      });
    }

    return [];
  } catch (error: any) {
    // If error is marked as silent (grace period) or expected, don't log
    if (error?._silent || error?._expected) {
      return [];
    }

    // If error is 401, 404, 403 (unauthorized/not found) or invalid token, user is not authenticated
    // This is expected behavior, don't log as error
    const errorMessage = error?.message || "";
    const status = error?.status || error?.response?.status;
    const isAuthError =
      error?._expected ||
      status === 401 ||
      status === 404 ||
      status === 403 ||
      errorMessage.includes("401") ||
      errorMessage.includes("404") ||
      errorMessage.includes("403") ||
      errorMessage.includes("Invalid token") ||
      errorMessage.includes("Unauthorized") ||
      errorMessage.includes("Token") ||
      errorMessage.includes("Not found") ||
      errorMessage.includes("Request failed with status code 404") ||
      errorMessage.includes("Request failed with status code 401");

    if (isAuthError) {
      // Silent fail - user not authenticated
      return [];
    }

    // Only log actual errors (network issues, server errors, etc.)
    if (process.env.NODE_ENV === "development") {
      logger.error("Failed to fetch saved tools:", error);
    }
    return [];
  }
}

/**
 * Get user's used marketing tools (requires authentication)
 * @param pageNo - Page number (default: 0)
 * @param pageSize - Page size (default: 10)
 * @returns User's used marketing tools
 */
export async function getUserUsedMarketingTools(
  pageNo: number = 0,
  pageSize: number = 10
): Promise<Tool[]> {
  try {
    const response = await http.get<UserToolsResponse>(
      "/tool-marketings/used",
      {
        params: {
          pageNo,
          pageSize,
        },
      }
    );

    if (!response) {
      return [];
    }

    if (
      response &&
      typeof response === "object" &&
      "message" in response &&
      !("data" in response)
    ) {
      return [];
    }

    if (
      response.data &&
      typeof response.data === "object" &&
      "tools" in response.data
    ) {
      const tools = (response.data as any).tools;
      if (Array.isArray(tools)) {
        return tools.map(normalizeMarketingTool);
      }
    }

    if (Array.isArray(response.data)) {
      return response.data.map(normalizeMarketingTool);
    }

    if (Array.isArray(response)) {
      return response.map(normalizeMarketingTool);
    }

    return [];
  } catch (error: any) {
    const errorMessage = error?.message || "";
    const status = error?.status || error?.response?.status;
    const isAuthError =
      error?._expected ||
      error?._silent ||
      status === 401 ||
      status === 404 ||
      status === 403 ||
      status === 400 || // 400 Bad Request - endpoint may not exist yet
      errorMessage.includes("401") ||
      errorMessage.includes("404") ||
      errorMessage.includes("403") ||
      errorMessage.includes("400") ||
      errorMessage.includes("Bad Request") ||
      errorMessage.includes("Internal server error") ||
      errorMessage.includes("Invalid token") ||
      errorMessage.includes("Unauthorized") ||
      errorMessage.includes("Token") ||
      errorMessage.includes("Not found") ||
      errorMessage.includes("Request failed with status code 404") ||
      errorMessage.includes("Request failed with status code 401") ||
      errorMessage.includes("Request failed with status code 400");

    if (isAuthError) {
      // Silent fail - user not authenticated or endpoint not available
      return [];
    }

    if (process.env.NODE_ENV === "development") {
      logger.error("Failed to fetch used marketing tools:", error);
    }
    return [];
  }
}

/**
 * Get user's saved marketing tools (requires authentication)
 * @param pageNo - Page number (default: 0)
 * @param pageSize - Page size (default: 10)
 * @returns User's saved marketing tools
 */
export async function getUserSavedMarketingTools(
  pageNo: number = 0,
  pageSize: number = 10
): Promise<Tool[]> {
  try {
    const response = await http.get<UserToolsResponse>(
      "/tool-marketings/saved",
      {
        params: {
          pageNo,
          pageSize,
        },
      }
    );

    if (!response) {
      return [];
    }

    if (
      response &&
      typeof response === "object" &&
      "message" in response &&
      !("data" in response)
    ) {
      return [];
    }

    if (
      response.data &&
      typeof response.data === "object" &&
      "tools" in response.data
    ) {
      const tools = (response.data as any).tools;
      if (Array.isArray(tools)) {
        return tools.map(normalizeMarketingTool);
      }
    }

    if (Array.isArray(response.data)) {
      return response.data.map(normalizeMarketingTool);
    }

    if (Array.isArray(response)) {
      return response.map(normalizeMarketingTool);
    }

    return [];
  } catch (error: any) {
    const errorMessage = error?.message || "";
    const status = error?.status || error?.response?.status;
    const isAuthError =
      error?._expected ||
      error?._silent ||
      status === 401 ||
      status === 404 ||
      status === 403 ||
      status === 400 || // 400 Bad Request - endpoint may not exist yet
      errorMessage.includes("401") ||
      errorMessage.includes("404") ||
      errorMessage.includes("403") ||
      errorMessage.includes("400") ||
      errorMessage.includes("Bad Request") ||
      errorMessage.includes("Internal server error") ||
      errorMessage.includes("Invalid token") ||
      errorMessage.includes("Unauthorized") ||
      errorMessage.includes("Token") ||
      errorMessage.includes("Not found") ||
      errorMessage.includes("Request failed with status code 404") ||
      errorMessage.includes("Request failed with status code 401") ||
      errorMessage.includes("Request failed with status code 400");

    if (isAuthError) {
      // Silent fail - user not authenticated or endpoint not available
      return [];
    }

    if (process.env.NODE_ENV === "development") {
      logger.error("Failed to fetch saved marketing tools:", error);
    }
    return [];
  }
}

/**
 * Get all prices for filtering
 * @returns All available prices
 */
export async function getPrices(): Promise<Price[]> {
  try {
    const response = await http.get<IApiResponse<Price[]>>("/tools/prices");
    return response?.data || [];
  } catch (error) {
    logger.error("Failed to fetch prices:", error);
    return [];
  }
}

/**
 * Get all audiences for filtering
 * @returns All available audiences
 */
export async function getAudiences(): Promise<Audience[]> {
  try {
    const response = await http.get<IApiResponse<Audience[]>>(
      "/tools/audiences"
    );
    return response?.data || [];
  } catch (error) {
    logger.error("Failed to fetch audiences:", error);
    return [];
  }
}

export interface RatingStats {
  distribution: Record<number, number>; // { 1: count, 2: count, ... }
  percentages: Record<number, number>; // { 1: percentage, 2: percentage, ... }
  total: number;
  average: number;
}

/**
 * Get tool rating statistics
 * @param toolId - Tool ID
 * @returns Rating statistics including distribution and percentages
 */
export async function getToolRatingStats(
  toolId: string
): Promise<RatingStats | null> {
  try {
    const response = await http.get<IApiResponse<RatingStats>>(
      `/tools/rating-stats/${toolId}`
    );
    return response?.data || null;
  } catch (error) {
    logger.error("Failed to fetch rating stats:", error);
    return null;
  }
}

/**
 * Get similar tools based on price and audience
 * @param price - Tool price (PAID, TRIAL)
 * @param audience - Tool audience
 * @param pageNo - Page number (default: 0)
 * @param pageSize - Page size (default: 4)
 * @param excludeToolId - Tool ID to exclude from results
 * @returns Similar tools
 */
export async function getSimilarTools(
  price: string,
  audience: string,
  pageNo: number = 0,
  pageSize: number = 2,
  excludeToolId?: string
): Promise<Tool[]> {
  try {
    const params: Record<string, string | number> = {
      pageNo,
      pageSize,
      sortBy: "avgRating",
      sortType: "desc",
    };

    if (price) params.price = price;
    if (audience) params.audience = audience;

    const response = await http.get<FilterToolsResponse>("/tools/filter", {
      params,
    });

    let tools = response?.data?.tools || [];

    // Exclude current tool if excludeToolId is provided
    if (excludeToolId) {
      tools = tools.filter((tool) => tool.id !== excludeToolId);
    }

    return tools.slice(0, pageSize);
  } catch (error) {
    logger.error("Failed to fetch similar tools:", error);
    return [];
  }
}

/**
 * Rate a tool
 * @param toolId - Tool ID to rate
 * @param stars - Rating stars (0-5)
 * @returns Rating response with updated average rating and count
 */
export interface RateToolResponse {
  success: boolean;
  avgRating: number;
  ratingsCount: number;
}

export async function rateTool(
  toolId: string,
  stars: number
): Promise<RateToolResponse | null> {
  try {
    const response = await http.post<IApiResponse<RateToolResponse>>(
      "/tools/rate",
      {
        toolId,
        stars,
      }
    );
    return response?.data || null;
  } catch (error) {
    logger.error("Failed to rate tool:", error);
    throw error;
  }
}
