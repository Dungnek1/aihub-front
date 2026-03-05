/**
 * Courses Actions Client
 * Client-side API calls for courses actions (use, save)
 */

import { http } from "@/services/http";
import type { IApiResponse } from "@/types/api.types";
import { logger } from "@/utils/logger";

export interface SaveCourseResponse {
    success: boolean;
    isSaved?: boolean;
}

/**
 * Save or unsave a course
 * @param courseId - Course ID to save/unsave
 * @returns Save response
 */
export async function toggleSaveCourse(courseId: string): Promise<SaveCourseResponse | null> {
    try {
        const response = await http.post<IApiResponse<SaveCourseResponse>>("/courses/save", {
            courseId,
        });

        // Debug logging
        if (process.env.NODE_ENV === "development") {
            console.log("[toggleSaveCourse] Response:", JSON.stringify(response, null, 2));
        }

        // Handle multiple response structures
        // Structure 1: { data: { success: true, isSaved: true } }
        // Structure 2: { success: true, isSaved: true }
        // Structure 3: { data: { id: "...", userId: "..." } } - save success with id
        // Structure 4: response is the data directly
        if (response) {
            // If response has data property
            if (response.data && typeof response.data === 'object') {
                const data = response.data as any;
                // Check if it's IApiResponse structure with nested data
                if ('success' in data || 'isSaved' in data) {
                    return data as SaveCourseResponse;
                }
                // If data has id and userId, it's a successful save response
                if (data.id && data.userId) {
                    return { success: true, isSaved: true } as SaveCourseResponse;
                }
                // If data.data exists, use that
                if (data.data) {
                    return data.data;
                }
            }
            // If response itself has success/isSaved, return it
            if ('success' in response || 'isSaved' in response) {
                return response as SaveCourseResponse;
            }
            // If response has id and userId directly, it's a successful save
            if ((response as any).id && (response as any).userId) {
                return { success: true, isSaved: true } as SaveCourseResponse;
            }
        }

        // If response is null or empty, log warning
        if (process.env.NODE_ENV === "development") {
            console.warn("[toggleSaveCourse] Response is null or empty:", response);
        }

        return null;
    } catch (error: any) {
        const status = error?.response?.status || error?.status;
        const errorMessage = error?.message || "";
        
        // Silent fail for 400, 401, 403, 404 (expected errors)
        if (
            status === 400 ||
            status === 401 ||
            status === 403 ||
            status === 404 ||
            errorMessage.includes("not found") ||
            errorMessage.includes("Course not found") ||
            errorMessage.includes("Bad Request")
        ) {
            // Silent fail - endpoint may not be ready or course doesn't exist
            return null;
        }
        
        // Log full error details only for unexpected errors
        if (process.env.NODE_ENV === "development") {
            console.error("[toggleSaveCourse] Error details:", {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status,
                statusText: error?.response?.statusText,
            });
        }
        logger.error("Failed to toggle save course:", error);
        throw error;
    }
}

export interface UseCourseResponse {
    success: boolean;
}

/**
 * Mark course as used
 * @param courseId - Course ID to mark as used
 * @returns Use response
 */
export async function markCourseAsUsed(courseId: string): Promise<UseCourseResponse | null> {
    try {
        const response = await http.post<IApiResponse<UseCourseResponse>>("/courses/use", {
            courseId,
        });

        return response?.data || null;
    } catch (error) {
        logger.error("Failed to mark course as used:", error);
        throw error;
    }
}

