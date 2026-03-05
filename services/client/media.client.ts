/**
 * Media Client (Frontend)
 * Client-side functions to call backend API directly
 */

import type { IApiResponse } from "@/types/api.types";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
if (!API_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL environment variable is required");
}

// Types
export interface UploadImageData {
  file: File;
  type?: "avatar" | "blog" | "general";
  folderType?: string;
  useRawFilename?: boolean;
}

export interface UploadImageResponse {
  success: boolean;
  data: {
    url: string;
    filename: string;
    size: number;
    mimetype: string;
  };
  message: string;
}

/**
 * Get access token from server-side API endpoint
 * SECURITY: This prevents tokens from being exposed in session object
 */
async function getAccessToken(): Promise<string | null> {
  try {
    // SECURITY: Get accessToken from server-side API endpoint
    // This prevents tokens from being exposed in session object or network tab
    const tokenResponse = await fetch("/api/auth/token", {
      method: "GET",
      credentials: "include", // Include httpOnly cookies
    });

    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      return tokenData?.accessToken || null;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Upload image file
 */
export async function uploadImage(
  data: UploadImageData
): Promise<UploadImageResponse> {
  // SECURITY: Use httpClient which proxies through server-side
  // This prevents tokens from being exposed in Network tab
  // Determine folder-type priority: payload override -> username -> name -> email -> user
  const userStr =
    typeof window !== "undefined"
      ? localStorage.getItem("auth_user")
      : null;
  const storedUser = userStr ? JSON.parse(userStr) : null;

  const folderType =
    data.folderType ||
    storedUser?.username ||
    storedUser?.name ||
    storedUser?.email ||
    "user";

  const formData = new FormData();
  formData.append('file', data.file);

  if (data.type) {
    formData.append('type', data.type);
  }

  try {
    const http = (await import('@/services/http')).default;

    // Use httpClient with FormData - proxy will handle it
    const response = await http.post<
      IApiResponse<{
        filename: string;
        size: number;
        mimeType: string;
        mimetype: string;
      }>
    >("/media/upload/image", formData, {
      headers: {
        "folder-type": folderType,
        "Content-Type": "multipart/form-data",
      },
    });

    // Backend response structure: { timestamp, message, data: { id, filename, originalName, mimeType, size, ... } }
    const imageData = response.data?.data || response.data;

    if (!imageData) {
      throw new Error('Invalid response: missing data field');
    }

    // Backend returns filename like "image/<folder>/file.png"
    const filename = imageData.filename;

    if (!filename) {
      throw new Error('Invalid response: missing filename field');
    }

    // Return raw path so callers can decide how to normalize/show it
    return {
      success: true,
      data: {
        filename: filename,
        url: filename,
        size: imageData.size || 0,
        mimetype: imageData.mimeType || imageData.mimetype || 'image/jpeg',
      },
      message: response.data?.message || 'Image uploaded successfully',
    };
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to upload image');
  }
}

// Export as object for backward compatibility
export const mediaClient = {
  uploadImage,
};

