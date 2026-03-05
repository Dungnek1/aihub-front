/**
 * Tools Service Server
 * Server-side only API calls for tools using axios
 */

import { httpServer } from "@/services/http.server";
import { IApiResponse } from "@/types";
// getServerToken will be imported dynamically to avoid client bundling
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

const normalizeTool = (raw: any): Tool => {
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
};

/**
 * Normalize marketing tool data from API response
 * Marketing tools may have different structure than regular tools
 */
const normalizeMarketingTool = (raw: any): Tool => {
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

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === "development" && raw.coverImageLink) {
    console.log("[normalizeMarketingTool] coverImageLink found:", {
      toolId: raw.id,
      toolTitle: raw.title,
      coverImageLink: raw.coverImageLink,
      normalizedLogoUrl: logoUrl,
    });
  }

  // Handle ratings - marketing tools may have ratings array or direct fields
  const avgRating =
    typeof raw.avgRating === "number" && raw.avgRating > 0
      ? raw.avgRating
      : raw.ratings?.length > 0
      ? raw.ratings[0]?.avgRating || 5
      : 5;

  const ratingsCount =
    typeof raw.ratingsCount === "number"
      ? raw.ratingsCount
      : raw.ratings?.length > 0
      ? raw.ratings[0]?.totalRatings || raw.ratings.length
      : 0;

  return {
    ...raw,
    price,
    name: raw.title || raw.name || "",
    description: raw.shortDesc || raw.description || "",
    logoUrl,
    avgRating,
    ratingsCount,
    homepageUrl: raw.homepageUrl || "#",
    slug: raw.slug || "",
    conversationStarters: raw.conversationStarters || [],
    usageInstructions: raw.usageInstructions || [],
    capabilities: raw.capabilities || [],
    tags: raw.tags || [],
    audiences: raw.audiences || [],
  } as Tool;
};

/**
 * Get featured marketing tools (server-side)
 * @param limit - Number of featured marketing tools to return (default: 4)
 * @returns Featured marketing tools
 */
export async function getFeaturedMarketingTools(
  limit: number = 4
): Promise<Tool[]> {
  try {
    const response = await httpServer.get<IApiResponse<Tool[]>>(
      `/tool-marketings/featured`,
      {
        params: { limit },
      }
    );
    // Normalize response structure
    const data = response?.data as unknown;

    if (Array.isArray(data)) {
      return data.map(normalizeMarketingTool);
    }

    if (
      data &&
      typeof data === "object" &&
      Array.isArray((data as { data?: Tool[] }).data)
    ) {
      return ((data as { data?: Tool[] }).data ?? []).map(
        normalizeMarketingTool
      );
    }

    // Some APIs might return the array directly without wrapping
    if (Array.isArray(response as unknown as Tool[])) {
      return (response as unknown as Tool[]).map(normalizeMarketingTool);
    }

    return [];
  } catch (error: any) {
    console.error("Failed to fetch featured marketing tools:", error);
    return [];
  }
}

/**
 * Get all marketing tools with pagination (server-side)
 * @param params - Pagination and filter parameters
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
    const response = await httpServer.get<
      IApiResponse<{
        items: Tool[];
        total: number;
        page: number;
        limit: number;
      }>
    >("/tool-marketings", {
      params,
    });

    // Debug logging
    if (process.env.NODE_ENV === "development") {
      console.log("[getMarketingTools] Raw response:", {
        responseType: typeof response,
        isArray: Array.isArray(response),
        hasData: !!(response as any)?.data,
        responseKeys:
          response && typeof response === "object" ? Object.keys(response) : [],
        params,
      });
    }

    // Normalize response structure
    const data = response?.data as unknown;

    // Handle different response structures
    let items: any[] = [];
    let total = 0;
    let page = params.page || 1;
    let limit = params.limit || params.take || 10;

    if (Array.isArray(data)) {
      items = data;
      total = data.length;
    } else if (data && typeof data === "object") {
      // Check for nested data structure
      if ((data as any).items && Array.isArray((data as any).items)) {
        items = (data as any).items;
        total = (data as any).total || items.length;
        page = (data as any).page || page;
        limit = (data as any).limit || limit;
      } else if ((data as any).data) {
        if (Array.isArray((data as any).data)) {
          items = (data as any).data;
          total = items.length;
        } else if (
          (data as any).data?.items &&
          Array.isArray((data as any).data.items)
        ) {
          items = (data as any).data.items;
          total = (data as any).data.total || items.length;
          page = (data as any).data.page || page;
          limit = (data as any).data.limit || limit;
        } else if (
          (data as any).data?.data &&
          Array.isArray((data as any).data.data)
        ) {
          items = (data as any).data.data;
          total = (data as any).data.total || items.length;
          page = (data as any).data.page || page;
          limit = (data as any).data.limit || limit;
        }
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[getMarketingTools] Extracted data:", {
        itemsCount: items.length,
        total,
        page,
        limit,
        sampleItems: items
          .slice(0, 2)
          .map((t) => ({ id: t?.id, title: t?.title || t?.name })),
      });
    }

    return {
      items: items.map(normalizeMarketingTool),
      total,
      page,
      limit,
    };
  } catch (error: any) {
    const errorMessage = error?.message || "Unknown error";
    const statusCode = error?.response?.status || error?.status || "N/A";

    if (statusCode === 503 || errorMessage.includes("did not respond")) {
      console.warn(
        "[Marketing Tools Service] Marketing Tools Service not responding. Please check if the service is running."
      );
    } else if (statusCode === 404) {
      console.warn(
        "[Marketing Tools Service] Marketing tools endpoint not found (404). API may not be available yet."
      );
    } else {
      console.error(
        "[Marketing Tools Service] Failed to fetch marketing tools:",
        {
          errorMessage,
          statusCode,
          error: error,
          response: error?.response?.data,
          params,
        }
      );
    }

    return {
      items: [],
      total: 0,
      page: params.page ?? 1,
      limit: params.limit ?? params.take ?? 10,
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
    const response = await httpServer.get<IApiResponse<Tool[]>>("/tools/top", {
      params: {
        pageNo,
        pageSize,
        sortBy: "avgRating",
        sortType: "desc",
        status: 1,
      },
    });
    //@ts-ignore
    return response?.data?.tools || [];
  } catch (error: any) {
    // Log chi tiết hơn để debug
    const errorMessage = error?.message || "Unknown error";
    const statusCode = error?.response?.status || "N/A";
    const responseData = error?.response?.data;

    // Kiểm tra nếu là lỗi service không phản hồi
    if (statusCode === 503 || errorMessage.includes("did not respond")) {
      console.warn(
        `[getTopTools] Tool Service không phản hồi (503). ` +
          `Vui lòng kiểm tra xem Tool Service đã được khởi động chưa. ` +
          `Chạy: npm run start:dev:tool trong thư mục backend.`
      );
    } else if (statusCode === 404) {
      console.warn(`[getTopTools] Endpoint not found (404). URL: /tools/top`);
    } else {
      console.error(`[getTopTools] Failed to fetch top tools:`, {
        status: statusCode,
        message: errorMessage,
        responseData,
        url: "/tools/top",
      });
    }

    // Return empty array để không break UI
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
    const params: any = {
      pageNo,
      pageSize,
      sortBy: "avgRating",
      sortType: "desc",
    };

    if (price) params.price = price;
    if (audience) params.audience = audience;

    const response = await httpServer.get<IApiResponse<Tool[]>>(
      "/tools/filter",
      {
        params,
      }
    );

    return response?.data || [];
  } catch (error) {
    console.error("Failed to filter tools:", error);
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
    // SECURITY: This function requires authentication
    // Get token from cookies (dynamic import to avoid client bundling)
    const { getServerToken } = await import("@/lib/auth.server");
    const accessToken = await getServerToken();

    if (!accessToken) {
      return [];
    }

    const response = await httpServer.get<IApiResponse<Tool[]>>("/tools/used", {
      params: {
        pageNo,
        pageSize,
      },
      __accessToken: accessToken,
    } as any);
    //@ts-ignore
    return response?.data?.tools || [];
  } catch (error: any) {
    const errorMessage = error?.message || "";

    if (
      errorMessage.includes("Invalid token") ||
      errorMessage.includes("Unauthorized") ||
      errorMessage.includes("401") ||
      error?.response?.status === 401
    ) {
      if (process.env.NODE_ENV === "development") {
        // Silent fallback - user not authenticated
      }
      return [];
    }

    // Các lỗi khác (network, server errors) thì vẫn log trong development
    if (process.env.NODE_ENV === "development") {
      console.debug("Failed to fetch used tools:", errorMessage);
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
  pageSize: number = 4
): Promise<Tool[]> {
  try {
    // Get token from cookies (dynamic import to avoid client bundling)
    const { getServerToken } = await import("@/lib/auth.server");
    const accessToken = await getServerToken();

    if (!accessToken) {
      // No token, return empty array (guest user)
      return [];
    }

    // SECURITY: Pass accessToken via __accessToken in config
    // The interceptor in http.server.ts will convert this to Authorization header
    const response = await httpServer.get<IApiResponse<Tool[]>>(
      "/tools/saved",
      {
        params: {
          pageNo,
          pageSize,
        },
        __accessToken: accessToken, // Interceptor will convert to Authorization header
      } as any
    );

    //@ts-ignore
    return response?.data?.tools || [];
  } catch (error: any) {
    const errorMessage = error?.message || "";

    // ⚠️ Token không hợp lệ / hết hạn → coi như guest, trả về rỗng
    // Đây là expected behavior cho public pages như /ai-tools
    if (
      errorMessage.includes("Invalid token") ||
      errorMessage.includes("Unauthorized") ||
      errorMessage.includes("401") ||
      error?.response?.status === 401
    ) {
      if (process.env.NODE_ENV === "development") {
        // Silent fallback - user not authenticated
      }
      return [];
    }

    // Các lỗi khác (network, server errors) thì vẫn log trong development
    if (process.env.NODE_ENV === "development") {
      console.debug("Failed to fetch saved tools:", errorMessage);
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
    // SECURITY: This function requires authentication
    // Get token from cookies (dynamic import to avoid client bundling)
    const { getServerToken } = await import("@/lib/auth.server");
    const accessToken = await getServerToken();

    if (!accessToken) {
      return [];
    }

    const response = await httpServer.get<IApiResponse<Tool[]>>(
      "/tool-marketings/used",
      {
        params: {
          pageNo,
          pageSize,
        },
        __accessToken: accessToken,
      } as any
    );

    // Handle multiple response structures
    // Structure 1: { data: { tools: [...] } }
    // Structure 2: { data: { items: [...] } }
    // Structure 3: { data: [...] }
    // Structure 4: { tools: [...] }
    // Structure 5: response.data is array directly
    let tools: any[] = [];

    if (response?.data) {
      if (Array.isArray(response.data)) {
        tools = response.data;
      } else {
        const data = response.data as any;
        if (data.tools && Array.isArray(data.tools)) {
          tools = data.tools;
        } else if (data.items && Array.isArray(data.items)) {
          tools = data.items;
        }
      }
    } else if (Array.isArray(response)) {
      tools = response;
    }

    return Array.isArray(tools) ? tools.map(normalizeMarketingTool) : [];
  } catch (error: any) {
    const errorMessage = error?.message || "";
    const status = error?.response?.status;

    // Silent fail for auth errors (401, 403, 404, 400)
    if (
      status === 401 ||
      status === 403 ||
      status === 404 ||
      status === 400 ||
      errorMessage.includes("Invalid token") ||
      errorMessage.includes("Unauthorized") ||
      errorMessage.includes("401") ||
      errorMessage.includes("403") ||
      errorMessage.includes("404") ||
      errorMessage.includes("400") ||
      errorMessage.includes("Bad Request") ||
      errorMessage.includes("Not found")
    ) {
      return [];
    }

    // Only log actual errors in development
    if (process.env.NODE_ENV === "development") {
      console.debug("Failed to fetch used marketing tools:", errorMessage);
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
    // SECURITY: This function requires authentication
    // Get token from cookies (dynamic import to avoid client bundling)
    const { getServerToken } = await import("@/lib/auth.server");
    const accessToken = await getServerToken();

    if (!accessToken) {
      return [];
    }

    const response = await httpServer.get<IApiResponse<Tool[]>>(
      "/tool-marketings/saved",
      {
        params: {
          pageNo,
          pageSize,
        },
        __accessToken: accessToken,
      } as any
    );

    // Handle multiple response structures
    // Structure 1: { data: { tools: [...] } }
    // Structure 2: { data: { items: [...] } }
    // Structure 3: { data: [...] }
    // Structure 4: { tools: [...] }
    // Structure 5: response.data is array directly
    let tools: any[] = [];

    if (response?.data) {
      if (Array.isArray(response.data)) {
        tools = response.data;
      } else {
        const data = response.data as any;
        if (data.tools && Array.isArray(data.tools)) {
          tools = data.tools;
        } else if (data.items && Array.isArray(data.items)) {
          tools = data.items;
        }
      }
    } else if (Array.isArray(response)) {
      tools = response;
    }

    return Array.isArray(tools) ? tools.map(normalizeMarketingTool) : [];
  } catch (error: any) {
    const errorMessage = error?.message || "";
    const status = error?.response?.status;

    // Silent fail for auth errors (401, 403, 404, 400)
    if (
      status === 401 ||
      status === 403 ||
      status === 404 ||
      status === 400 ||
      errorMessage.includes("Invalid token") ||
      errorMessage.includes("Unauthorized") ||
      errorMessage.includes("401") ||
      errorMessage.includes("403") ||
      errorMessage.includes("404") ||
      errorMessage.includes("400") ||
      errorMessage.includes("Bad Request") ||
      errorMessage.includes("Not found")
    ) {
      return [];
    }

    // Only log actual errors in development
    if (process.env.NODE_ENV === "development") {
      console.debug("Failed to fetch saved marketing tools:", errorMessage);
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
    const response = await httpServer.get<IApiResponse<Price[]>>(
      "/tools/prices"
    );
    return response?.data || [];
  } catch (error) {
    console.error("Failed to fetch prices:", error);
    return [];
  }
}

/**
 * Get all audiences for filtering
 * @returns All available audiences
 */
export async function getAudiences(): Promise<Audience[]> {
  try {
    const response = await httpServer.get<IApiResponse<Audience[]>>(
      "/tools/audiences"
    );
    return response?.data || [];
  } catch (error) {
    console.error("Failed to fetch audiences:", error);
    return [];
  }
}
