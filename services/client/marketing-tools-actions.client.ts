/**
 * Marketing Tools Actions Client
 * Client-side API calls for marketing tools actions (use, save)
 */

import { http } from "@/services/http";
import type { IApiResponse } from "@/types/api.types";
import { logger } from "@/utils/logger";

export interface SaveMarketingToolResponse {
    success: boolean;
    isSaved?: boolean;
}

/**
 * Save or unsave a marketing tool
 * @param toolMarketingId - Marketing tool ID to save/unsave
 * @returns Save response
 */
export async function toggleSaveMarketingTool(toolMarketingId: string): Promise<SaveMarketingToolResponse | null> {
    try {
        const response = await http.post<IApiResponse<SaveMarketingToolResponse>>("/tool-marketings/save", {
            toolMarketingId,
        });

        // Debug logging
        if (process.env.NODE_ENV === "development") {
            console.log("[toggleSaveMarketingTool] Response:", JSON.stringify(response, null, 2));
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
                    return data as SaveMarketingToolResponse;
                }
                // If data has id and userId, it's a successful save response
                if (data.id && data.userId) {
                    return { success: true, isSaved: true } as SaveMarketingToolResponse;
                }
                // If data.data exists, use that
                if (data.data) {
                    return data.data;
                }
            }
            // If response itself has success/isSaved, return it
            if ('success' in response || 'isSaved' in response) {
                return response as SaveMarketingToolResponse;
            }
            // If response has id and userId directly, it's a successful save
            if ((response as any).id && (response as any).userId) {
                return { success: true, isSaved: true } as SaveMarketingToolResponse;
            }
        }

        // Fallback to response.data if exists
        return response?.data || null;
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
            errorMessage.includes("Tool not found") ||
            errorMessage.includes("Bad Request")
        ) {
            // Silent fail - endpoint may not be ready or tool doesn't exist
            return null;
        }
        
        // Log full error details only for unexpected errors
        if (process.env.NODE_ENV === "development") {
            console.error("[toggleSaveMarketingTool] Error details:", {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status,
                statusText: error?.response?.statusText,
            });
        }
        logger.error("Failed to toggle save marketing tool:", error);
        throw error;
    }
}

export interface UseMarketingToolResponse {
    success: boolean;
}

/**
 * Mark marketing tool as used
 * @param toolMarketingId - Marketing tool ID to mark as used
 * @returns Use response
 */
export async function markMarketingToolAsUsed(toolMarketingId: string): Promise<UseMarketingToolResponse | null> {
    try {
        const response = await http.post<IApiResponse<UseMarketingToolResponse>>("/tool-marketings/use", {
            toolMarketingId,
        });

        return response?.data || null;
    } catch (error) {
        logger.error("Failed to mark marketing tool as used:", error);
        throw error;
    }
}

