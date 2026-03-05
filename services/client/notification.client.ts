import { http } from "../http";
import type { IApiResponse } from "@/types/api.types";
import { logger } from "@/utils/logger";

export interface NotificationEvent {
  id: string;
  type: string;
  actorId: string;
  objectType: string;
  objectId: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  html: string;
  createdAt: string;
  isRead: boolean;
  isSeen: boolean;
  event: NotificationEvent;
  title?: string;
  message?: string;
}

/**
 * Get unread notifications for the current user
 * @returns Array of unread notifications
 */
export async function getUnreadNotifications(): Promise<NotificationItem[]> {
  try {
    const response = await http.get<IApiResponse<NotificationItem[]>>("notifications/unread");
    
    // Backend response structure: { timestamp, message, data: NotificationItem[] }
    // http.get() returns res.data from axios, so response is already the backend response body
    if (!response) {
      return [];
    }

    // Check if response has data property with array
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }

    // Fallback: check if response itself is array
    if (Array.isArray(response)) {
      return response;
    }

    // Log in development if structure is unexpected
    if (process.env.NODE_ENV === "development") {
      logger.warn("Unexpected response structure for getUnreadNotifications", {
        response: JSON.stringify(response).substring(0, 200),
      });
    }
    
    return [];
  } catch (error: any) {
    // If error is marked as silent (grace period) or expected, don't log it
    if (error?._silent || error?._expected) {
      return [];
    }
    
    // Handle different error types gracefully
    const errorMessage = error?.message || "";
    const status = error?.status || error?.response?.status;
    
    // 404, 401, 403 and other expected errors should return empty array silently
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
      errorMessage.includes("Token") ||
      errorMessage.includes("Request failed with status code 404") ||
      errorMessage.includes("Request failed with status code 401");
    
    if (isExpectedError) {
      // Silent fail - expected error (user not authenticated or no notifications)
      return [];
    }
    
    // Only log actual errors (network issues, server errors, etc.) in development
    if (process.env.NODE_ENV === "development") {
      logger.error("Failed to fetch unread notifications:", error);
    }
    return [];
  }
}

/**
 * Mark all notifications as read for the current user
 * @returns Success status
 */
export async function markAllNotificationsRead(): Promise<boolean> {
  try {
    const response = await http.put<IApiResponse<{ success: boolean }>>("notifications/read-all", {});
    return response.data?.success || false;
  } catch (error) {
    logger.error("Failed to mark all notifications as read:", error);
    return false;
  }
}

export const notificationClient = {
  getUnread: getUnreadNotifications,
  markAllRead: markAllNotificationsRead,
};
