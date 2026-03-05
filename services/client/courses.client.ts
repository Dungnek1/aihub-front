/**
 * Courses Service Client
 * Client-side API calls for courses operations
 */

import { http } from "@/services/http";
import type { IApiResponse } from "@/types/api.types";
import type { Tool } from "@/types/tool.types";

interface CoursesResponse {
  items: Tool[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Normalize course data from API response
 * Courses may have different structure than regular tools
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

  // Handle price - courses may have price object with name/id
  const price =
    typeof raw.price === "string"
      ? raw.price
      : raw.price?.name || raw.price?.id || "FREE";

  // Handle coverImageLink - courses use coverImageLink
  const logoUrl = raw.coverImageLink || raw.thumbnail || raw.logoUrl || "";

  // Handle ratings - courses may have ratings array or direct fields
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
 * Get featured courses (client-side)
 * @param limit - Number of featured courses to return (default: 4)
 * @returns Featured courses
 */
export async function getFeaturedCourses(limit: number = 4): Promise<Tool[]> {
  try {
    const response = await http.get<IApiResponse<Tool[]> | { data?: unknown }>(
      `/courses/featured?limit=${limit}`
    );

    const payload = (response as { data?: any }).data ?? response;

    // Handle different response structures
    if (Array.isArray(payload)) {
      return payload.map(normalizeCourse);
    } else if (payload?.data && Array.isArray(payload.data)) {
      return payload.data.map(normalizeCourse);
    }

    return [];
  } catch (error: any) {
    console.error("[Courses Client] Failed to fetch featured courses:", error);
    return [];
  }
}

/**
 * Get course by ID (client-side)
 * @param id - Course ID
 * @returns Course details
 */
export async function getCourseById(id: string): Promise<Tool | null> {
  try {
    const response = await http.get<IApiResponse<Tool> | { data?: unknown }>(
      `/courses/${id}`
    );

    const payload = (response as { data?: any }).data ?? response;

    // Handle different response structures
    if (payload) {
      if ((payload as any).id) {
        return normalizeCourse(payload);
      } else if ((payload as any).data && (payload as any).data.id) {
        return normalizeCourse((payload as any).data);
      }
    }

    return null;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      console.warn(`[Courses Client] Course with ID ${id} not found`);
    } else {
      console.error("[Courses Client] Failed to fetch course by ID:", error);
    }
    return null;
  }
}

/**
 * Get all courses with pagination (client-side)
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

    const response = await http.get<IApiResponse<CoursesResponse> | { data?: unknown }>(
      `/courses?${queryParams.toString()}`
    );

    const payload = (response as { data?: any }).data ?? response;

    // Handle different response structures
    if (payload) {
      if (Array.isArray(payload)) {
        return {
          items: payload.map(normalizeCourse),
          total: payload.length,
          page: params.page || 1,
          limit: params.limit || params.take || 10,
        };
      } else if (payload.items && Array.isArray(payload.items)) {
        return {
          items: payload.items.map(normalizeCourse),
          total: payload.total || payload.items.length,
          page: payload.page || params.page || 1,
          limit: payload.limit || params.limit || params.take || 10,
        };
      } else if (payload.data && payload.data.items) {
        return {
          items: payload.data.items.map(normalizeCourse),
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
    console.error("[Courses Client] Failed to fetch courses:", error);
    return {
      items: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || params.take || 10,
    };
  }
}

interface RateCoursePayload {
  rating: number;
  feedback?: string;
  comment?: string;
  contentQuality?: number;
  instructorQuality?: number;
  learningOutcome?: number;
  materialsQuality?: number;
}

interface RateCourseResponse {
  avgRating: number;
  ratingsCount: number;
  message?: string;
}

/**
 * Rate a course
 * @param courseId - Course ID
 * @param payload - Rating data
 * @returns Updated rating stats
 */
export async function rateCourse(
  courseId: string,
  payload: RateCoursePayload
): Promise<RateCourseResponse | null> {
  try {
    const response = await http.post<IApiResponse<RateCourseResponse> | { data?: unknown }>(
      `/courses/${courseId}/rate`,
      payload
    );

    const payloadData = (response as { data?: any }).data ?? response;

    // Handle different response structures
    if (payloadData) {
      if ((payloadData as any).avgRating !== undefined) {
        return payloadData as RateCourseResponse;
      } else if ((payloadData as any).data && (payloadData as any).data.avgRating !== undefined) {
        return (payloadData as any).data as RateCourseResponse;
      }
    }

    return null;
  } catch (error: any) {
    if (error?.response?.status === 400) {
      throw new Error("User already rated this course");
    }
    console.error("[Courses Client] Failed to rate course:", error);
    throw error;
  }
}

interface CourseRatingItem {
  rating?: number;
}

export interface CourseRatingsStatsResponse {
  avgRating?: number;
  totalRatings?: number;
  total?: number;
  ratingDistribution?: Record<string | number, number>;
  percentages?: Record<string | number, number>;
  items?: CourseRatingItem[];
}

/**
 * Get course ratings and normalize them into statistics
 */
export async function getCourseRatings(
  courseId: string,
  params: { skip?: number; take?: number } = {}
): Promise<CourseRatingsStatsResponse | null> {
  try {
    const response = await http.get<IApiResponse<any>>(
      `/courses/${courseId}/ratings`,
      {
        params,
      }
    );

    const data = response?.data;
    if (!data) return null;

    const normalizeDistribution = (
      source: Record<string | number, number> | undefined,
      totalRatings: number
    ) => {
      const distribution = {
        oneStar: 0,
        twoStars: 0,
        threeStars: 0,
        fourStars: 0,
        fiveStars: 0,
      };

      if (source) {
        distribution.oneStar = source[1] ?? source["1"] ?? 0;
        distribution.twoStars = source[2] ?? source["2"] ?? 0;
        distribution.threeStars = source[3] ?? source["3"] ?? 0;
        distribution.fourStars = source[4] ?? source["4"] ?? 0;
        distribution.fiveStars = source[5] ?? source["5"] ?? 0;
      }

      const percentages = {
        oneStar: totalRatings ? (distribution.oneStar / totalRatings) * 100 : 0,
        twoStars: totalRatings ? (distribution.twoStars / totalRatings) * 100 : 0,
        threeStars: totalRatings ? (distribution.threeStars / totalRatings) * 100 : 0,
        fourStars: totalRatings ? (distribution.fourStars / totalRatings) * 100 : 0,
        fiveStars: totalRatings ? (distribution.fiveStars / totalRatings) * 100 : 0,
      };

      return { distribution, percentages };
    };

    // Case 1: API already returns aggregated stats
    if (
      data.avgRating !== undefined &&
      (data.ratingDistribution || data.percentages)
    ) {
      const distributionValues = Object.values(
        data.ratingDistribution ?? {}
      ) as number[];
      const totalRatings =
        data.totalRatings ??
        data.total ??
        distributionValues.reduce((sum, count) => sum + count, 0);

      const { distribution, percentages } = normalizeDistribution(
        data.ratingDistribution,
        totalRatings
      );

      return {
        avgRating: data.avgRating,
        totalRatings,
        ratingDistribution: {
          1: distribution.oneStar,
          2: distribution.twoStars,
          3: distribution.threeStars,
          4: distribution.fourStars,
          5: distribution.fiveStars,
        },
        percentages: {
          1: percentages.oneStar,
          2: percentages.twoStars,
          3: percentages.threeStars,
          4: percentages.fourStars,
          5: percentages.fiveStars,
        },
      };
    }

    // Case 2: API returns list of rating items
    const items =
      data.items ||
      data.data?.items ||
      (Array.isArray(data) ? data : null);

    if (Array.isArray(items) && items.length > 0) {
      const counts = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };
      let totalRatings = 0;
      let sum = 0;

      items.forEach((item: CourseRatingItem) => {
        const rating = Math.round(Number(item.rating || 0));
        if (rating >= 1 && rating <= 5) {
          counts[rating as 1 | 2 | 3 | 4 | 5] += 1;
          totalRatings += 1;
          sum += rating;
        }
      });

      const avgRating = totalRatings ? sum / totalRatings : 0;

      return {
        avgRating,
        totalRatings,
        ratingDistribution: counts,
        percentages: {
          1: totalRatings ? (counts[1] / totalRatings) * 100 : 0,
          2: totalRatings ? (counts[2] / totalRatings) * 100 : 0,
          3: totalRatings ? (counts[3] / totalRatings) * 100 : 0,
          4: totalRatings ? (counts[4] / totalRatings) * 100 : 0,
          5: totalRatings ? (counts[5] / totalRatings) * 100 : 0,
        },
        items,
      };
    }

    return null;
  } catch (error: any) {
    console.error("[Courses Client] Failed to fetch course ratings:", error);
    return null;
  }
}

interface UserCoursesResponse {
  tools?: Tool[];
  courses?: Tool[];
  items?: Tool[];
  data?: {
    tools?: Tool[];
    courses?: Tool[];
    items?: Tool[];
  };
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
    const response = await http.get<UserCoursesResponse>("/courses/used", {
      params: {
        pageNo,
        pageSize,
      },
    });

    if (!response) {
      return [];
    }

    // Check if response has error message (from proxy 401 response)
    if (response && typeof response === 'object' && 'message' in response && !('data' in response) && !('tools' in response) && !('courses' in response)) {
      return [];
    }

    // Check if response is UserCoursesResponse structure
    if (response.data && typeof response.data === 'object') {
      const courses = (response.data as any).courses || (response.data as any).tools || (response.data as any).items;
      if (Array.isArray(courses)) {
        return courses.map(normalizeCourse);
      }
    }

    // Check for direct courses/tools/items array
    const courses = (response as any).courses || (response as any).tools || (response as any).items;
    if (Array.isArray(courses)) {
      return courses.map(normalizeCourse);
    }

    // Fallback: check if response.data is array directly
    if (Array.isArray(response.data)) {
      return response.data.map(normalizeCourse);
    }

    // Fallback: check if response itself is array
    if (Array.isArray(response)) {
      return response.map(normalizeCourse);
    }

    return [];
  } catch (error: any) {
    const errorMessage = error?.message || "";
    const status = error?.status || error?.response?.status;
    const isAuthError = 
      status === 400 ||
      status === 401 ||
      status === 404 ||
      status === 403 ||
      errorMessage.includes("400") ||
      errorMessage.includes("401") ||
      errorMessage.includes("404") ||
      errorMessage.includes("403") ||
      errorMessage.includes("Bad Request") ||
      errorMessage.includes("Course not found") ||
      errorMessage.includes("Invalid token") ||
      errorMessage.includes("Unauthorized") ||
      errorMessage.includes("Token") ||
      errorMessage.includes("Not found");
    
    if (isAuthError) {
      // Silent fail - endpoint may not be ready or user not authenticated
      return [];
    }
    
    if (process.env.NODE_ENV === "development") {
      console.error("[Courses Client] Failed to fetch used courses:", error);
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
    const response = await http.get<UserCoursesResponse>("/courses/saved", {
      params: {
        pageNo,
        pageSize,
      },
    });

    if (!response) {
      return [];
    }

    // Check if response has error message (from proxy 401 response)
    if (response && typeof response === 'object' && 'message' in response && !('data' in response) && !('tools' in response) && !('courses' in response)) {
      return [];
    }

    // Check if response is UserCoursesResponse structure
    if (response.data && typeof response.data === 'object') {
      const courses = (response.data as any).courses || (response.data as any).tools || (response.data as any).items;
      if (Array.isArray(courses)) {
        return courses.map(normalizeCourse);
      }
    }

    // Check for direct courses/tools/items array
    const courses = (response as any).courses || (response as any).tools || (response as any).items;
    if (Array.isArray(courses)) {
      return courses.map(normalizeCourse);
    }

    // Fallback: check if response.data is array directly
    if (Array.isArray(response.data)) {
      return response.data.map(normalizeCourse);
    }

    // Fallback: check if response itself is array
    if (Array.isArray(response)) {
      return response.map(normalizeCourse);
    }

    return [];
  } catch (error: any) {
    const errorMessage = error?.message || "";
    const status = error?.status || error?.response?.status;
    const isAuthError = 
      status === 400 ||
      status === 401 ||
      status === 404 ||
      status === 403 ||
      errorMessage.includes("400") ||
      errorMessage.includes("401") ||
      errorMessage.includes("404") ||
      errorMessage.includes("403") ||
      errorMessage.includes("Bad Request") ||
      errorMessage.includes("Course not found") ||
      errorMessage.includes("Invalid token") ||
      errorMessage.includes("Unauthorized") ||
      errorMessage.includes("Token") ||
      errorMessage.includes("Not found");
    
    if (isAuthError) {
      // Silent fail - endpoint may not be ready or user not authenticated
      return [];
    }
    
    if (process.env.NODE_ENV === "development") {
      console.error("[Courses Client] Failed to fetch saved courses:", error);
    }
    return [];
  }
}

