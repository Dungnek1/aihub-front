/**
 * Tool Actions - Client Side
 * Handle POST requests for rating and saving tools
 */

import { http } from "@/services/http";
import type { IApiResponse } from "@/types/api.types";
import { logger } from "@/utils/logger";
import type { RateToolResponse } from "./tools.client";

/**
 * Rate a tool
 * @param toolId - Tool ID to rate
 * @param stars - Rating stars (0-5)
 * @returns Rating response
 */
export async function rateTool(toolId: string, stars: number): Promise<RateToolResponse | null> {
    try {
        const response = await http.post<IApiResponse<RateToolResponse>>("/tools/rate", {
            toolId,
            stars,
        });

        return response?.data || null;
    } catch (error) {
        logger.error("Failed to rate tool:", error);
        throw error;
    }
}

export interface SaveToolResponse {
    action?: "saved" | "unsaved";
    message?: string;
    tool?: unknown; // Prisma object when saving
    [key: string]: unknown; // Allow other properties
}

/**
 * Toggle save status of a tool
 * @param toolId - Tool ID to save/unsave
 * @returns Save response
 */
export async function toggleSaveTool(toolId: string): Promise<SaveToolResponse | null> {
    try {
        const response = await http.post<IApiResponse<SaveToolResponse>>("/tools/save", {
            toolId,
        });

        return response?.data || null;
    } catch (error) {
        logger.error("Failed to save tool:", error);
        throw error;
    }
}

export interface UseToolResponse {
    success: boolean;
}

/**
 * Mark tool as used
 * @param toolId - Tool ID to mark as used
 * @returns Use response
 */
export async function markToolAsUsed(toolId: string): Promise<UseToolResponse | null> {
    try {
        const response = await http.post<IApiResponse<UseToolResponse>>("/tools/use", {
            toolId,
        });

        return response?.data || null;
    } catch (error) {
        logger.error("Failed to mark tool as used:", error);
        throw error;
    }
}

export interface RemoveToolResponse {
    success: boolean;
}

/**
 * Remove tool from used list
 * @param toolId - Tool ID to remove from used list
 * @returns Remove response
 */
export async function removeToolUsage(toolId: string): Promise<RemoveToolResponse | null> {
    try {
        const response = await http.delete<IApiResponse<RemoveToolResponse>>(`/tools/usage/${toolId}`);

        return response?.data || null;
    } catch (error) {
        logger.error("Failed to remove tool usage:", error);
        throw error;
    }
}

/**
 * Remove tool from saved list
 * @param toolId - Tool ID to remove from saved list
 * @returns Remove response
 */
export async function removeSavedTool(toolId: string): Promise<RemoveToolResponse | null> {
    try {
        const response = await http.delete<IApiResponse<RemoveToolResponse>>(`/tools/saved/${toolId}`);

        return response?.data || null;
    } catch (error) {
        logger.error("Failed to remove saved tool:", error);
        throw error;
    }
}
