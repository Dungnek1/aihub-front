/**
 * Courses Service Server
 * Server-side API calls for courses operations
 */

import { httpServer } from "@/services/http.server";
import { IApiResponse } from "@/types";
import type { Tool } from "@/types/tool.types";

interface CoursesResponse {
  items: Tool[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Get featured courses
 * @param limit - Number of featured courses to return (default: 4)
 * @returns Featured courses
 */
function normalizeCourse(raw: any): Tool {
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
    description: raw.shortDesc || raw.description || "",
    name: raw.title || raw.name || "",
    logoUrl: raw.coverImageLink || raw.thumbnail || raw.logoUrl || "",
  } as Tool;
}

export async function getFeaturedCourses(limit: number = 4): Promise<Tool[]> {
  try {
    const response = await httpServer.get<IApiResponse<Tool[]>>(
      `/courses/featured?limit=${limit}`
    );

    // Debug logging
    if (process.env.NODE_ENV === "development") {
      console.log("[getFeaturedCourses] Raw response:", {
        responseType: typeof response,
        isArray: Array.isArray(response),
        hasData: !!(response as any)?.data,
        responseKeys: response && typeof response === "object" ? Object.keys(response) : [],
        responseData: (response as any)?.data,
      });
    }

    // Handle different response structures
    let courses: any[] = [];
    
    if (Array.isArray(response)) {
      courses = response;
    } else if (response && typeof response === "object") {
      // Check for nested data structure
      if ((response as any).data) {
        if (Array.isArray((response as any).data)) {
          courses = (response as any).data;
        } else if ((response as any).data?.data && Array.isArray((response as any).data.data)) {
          courses = (response as any).data.data;
        } else if ((response as any).data?.items && Array.isArray((response as any).data.items)) {
          courses = (response as any).data.items;
        }
      } else if ((response as any).items && Array.isArray((response as any).items)) {
        courses = (response as any).items;
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[getFeaturedCourses] Extracted courses:", {
        count: courses.length,
        courses: courses.map(c => ({ id: c?.id, title: c?.title || c?.name })),
      });
    }

    return courses.map(normalizeCourse);
  } catch (error: any) {
    const errorMessage = error?.message || "Unknown error";
    const statusCode = error?.response?.status || error?.status || "N/A";

    if (statusCode === 503 || errorMessage.includes("did not respond")) {
      console.warn(
        "[Courses Service] Course Service not responding. Please check if the service is running."
      );
    } else if (statusCode === 404) {
      console.warn(
        "[Courses Service] Featured courses endpoint not found (404). API may not be available yet."
      );
    } else {
      console.error("[Courses Service] Failed to fetch featured courses:", {
        errorMessage,
        statusCode,
        error: error,
        response: error?.response?.data,
      });
    }

    return [];
  }
}

/**
 * Get all courses with pagination
 * @param params - Pagination parameters
 * @returns Courses with pagination info
 */
export async function getCourses(params: {
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
    if (params.limit !== undefined) queryParams.set("limit", String(params.limit));
    if (params.skip !== undefined) queryParams.set("skip", String(params.skip));
    if (params.take !== undefined) queryParams.set("take", String(params.take));
    if (params.status) queryParams.set("status", params.status);
    if (params.isFeatured !== undefined) queryParams.set("isFeatured", String(params.isFeatured));

    const response = await httpServer.get<IApiResponse<CoursesResponse>>(
      `/courses?${queryParams.toString()}`
    );

    // Debug logging
    if (process.env.NODE_ENV === "development") {
      console.log("[getCourses] Raw response:", {
        responseType: typeof response,
        isArray: Array.isArray(response),
        hasData: !!(response as any)?.data,
        responseKeys: response && typeof response === "object" ? Object.keys(response) : [],
      });
    }

    // Handle different response structures
    let items: any[] = [];
    let total = 0;
    let page = params.page || 1;
    let limit = params.limit || params.take || 10;

    if (Array.isArray(response)) {
      items = response;
      total = response.length;
    } else if (response && typeof response === "object") {
      // Check for nested data structure
      if ((response as any).data) {
        if (Array.isArray((response as any).data)) {
          items = (response as any).data;
          total = items.length;
        } else if ((response as any).data?.items && Array.isArray((response as any).data.items)) {
          items = (response as any).data.items;
          total = (response as any).data.total || items.length;
          page = (response as any).data.page || page;
          limit = (response as any).data.limit || limit;
        } else if ((response as any).data?.data && Array.isArray((response as any).data.data)) {
          items = (response as any).data.data;
          total = (response as any).data.total || items.length;
          page = (response as any).data.page || page;
          limit = (response as any).data.limit || limit;
        }
      } else if ((response as any).items && Array.isArray((response as any).items)) {
        items = (response as any).items;
        total = (response as any).total || items.length;
        page = (response as any).page || page;
        limit = (response as any).limit || limit;
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[getCourses] Extracted data:", {
        itemsCount: items.length,
        total,
        page,
        limit,
        sampleItems: items.slice(0, 2).map(c => ({ id: c?.id, title: c?.title || c?.name })),
      });
    }

    return {
      items: items.map(normalizeCourse),
      total,
      page,
      limit,
    };
  } catch (error: any) {
    const errorMessage = error?.message || "Unknown error";
    const statusCode = error?.response?.status || error?.status || "N/A";

    if (statusCode === 503 || errorMessage.includes("did not respond")) {
      console.warn(
        "[Courses Service] Course Service not responding. Please check if the service is running."
      );
    } else if (statusCode === 404) {
      console.warn(
        "[Courses Service] Courses endpoint not found (404). API may not be available yet."
      );
    } else {
      console.error("[Courses Service] Failed to fetch courses:", {
        errorMessage,
        statusCode,
        error: error,
        response: error?.response?.data,
      });
    }

    return {
      items: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || params.take || 10,
    };
  }
}

/**
 * Get user's used courses (requires authentication)
 * @param pageNo - Page number (default: 0)
 * @param pageSize - Page size (default: 10)
 * @returns User's used courses
 */
export async function getUserUsedCourses(
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

    const response = await httpServer.get<IApiResponse<Tool[]> | { data?: unknown }>("/courses/used", {
      params: {
        pageNo,
        pageSize,
      },
      __accessToken: accessToken,
    } as any);

    const payload = (response as { data?: any }).data ?? response;

    // Handle multiple response structures
    let courses: any[] = [];
    
    if (payload) {
      if (Array.isArray(payload)) {
        courses = payload;
      } else if (payload.courses && Array.isArray(payload.courses)) {
        courses = payload.courses;
      } else if (payload.tools && Array.isArray(payload.tools)) {
        courses = payload.tools;
      } else if (payload.items && Array.isArray(payload.items)) {
        courses = payload.items;
      }
    } else if (Array.isArray(response as any)) {
      courses = response as any;
    }

    return Array.isArray(courses) ? courses.map(normalizeCourse) : [];
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
      console.debug("Failed to fetch used courses:", errorMessage);
    }
    return [];
  }
}

/**
 * Get user's saved courses (requires authentication)
 * @param pageNo - Page number (default: 0)
 * @param pageSize - Page size (default: 10)
 * @returns User's saved courses
 */
export async function getUserSavedCourses(
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

    const response = await httpServer.get<IApiResponse<Tool[]> | { data?: unknown }>("/courses/saved", {
      params: {
        pageNo,
        pageSize,
      },
      __accessToken: accessToken,
    } as any);

    const payload = (response as { data?: any }).data ?? response;

    // Handle multiple response structures
    let courses: any[] = [];
    
    if (payload) {
      if (Array.isArray(payload)) {
        courses = payload;
      } else if (payload.courses && Array.isArray(payload.courses)) {
        courses = payload.courses;
      } else if (payload.tools && Array.isArray(payload.tools)) {
        courses = payload.tools;
      } else if (payload.items && Array.isArray(payload.items)) {
        courses = payload.items;
      }
    } else if (Array.isArray(response as any)) {
      courses = response as any;
    }

    return Array.isArray(courses) ? courses.map(normalizeCourse) : [];
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
      console.debug("Failed to fetch saved courses:", errorMessage);
    }
    return [];
  }
}

