/**
 * User Client (Frontend)
 * Client-side functions to call backend API directly
 */

import type { IApiResponse } from "@/types/api.types";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
if (!API_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL environment variable is required");
}

// Types
export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  username?: string;
  avatarUrl?: string | null;
}

export interface UpdateProfileData {
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileResponse {
  success: boolean;
  data: UserProfile;
  message: string;
}

/**
 * Get access token - DEPRECATED
 * SECURITY: Tokens are now handled by server-side proxy
 * This function is kept for backward compatibility but should not be used
 * All API calls should go through httpClient which uses proxy
 */
async function getAccessToken(): Promise<string | null> {
  // SECURITY: Do not fetch token directly
  // All API calls should use httpClient which proxies through server-side
  // This prevents tokens from being exposed in Network tab
  return null;
}

/**
 * Get user profile
 */
export async function getProfile(): Promise<ProfileResponse> {
  // SECURITY: Use httpClient which proxies through server-side
  // This prevents tokens from being exposed in Network tab
  try {
    const http = (await import('@/services/http')).default;

    const response = await http.get<IApiResponse<UserProfile>>('/auth/profile');

    // Ensure response has the expected structure
    // API returns: { message, data: { userId, username, email, name, phone, avatarUrl, ... } }
    // We need to return: { success: boolean, data: UserProfile, message: string }
    return {
      success: true,
      data: response.data?.data || response.data || response,
      message: response.data?.message || 'Profile retrieved successfully',
    };
  } catch (error: any) {
    // If error is marked as silent (grace period), preserve the _silent flag
    // and throw error with _silent flag so caller can handle it appropriately
    if (error?._silent) {
      // Preserve the _silent flag in the error
      const silentError: any = new Error('Profile fetch skipped (grace period)');
      silentError._silent = true;
      silentError.response = error?.response;
      throw silentError;
    }

    if (error?.response?.status === 401) {
      // Don't logout immediately - let the http interceptor handle it
      // This prevents premature logout during grace period
      // Preserve any _silent flag from the original error
      const authError: any = new Error(error?.response?.data?.message || error?.response?.data?.error || 'Invalid token. Please sign in again.');
      authError._silent = error?._silent || false;
      authError.response = error?.response;
      throw authError;
    }

    // Preserve _silent flag for other errors too
    const generalError: any = new Error(error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to fetch profile');
    generalError._silent = error?._silent || false;
    generalError.response = error?.response;
    throw generalError;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(data: UpdateProfileData): Promise<ProfileResponse> {
  // SECURITY: Use httpClient which proxies through server-side
  // This prevents tokens from being exposed in Network tab
  try {
    const http = (await import('@/services/http')).default;

    const response = await http.put<IApiResponse<UserProfile>>('/auth/profile', data);

    return {
      success: true,
      data: response.data?.data || response.data || response,
      message: response.data?.message || 'Profile updated successfully',
    };
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to update profile');
  }
}

/**
 * Change user password
 */
export async function changePassword(data: ChangePasswordData): Promise<{ success: boolean; message: string }> {
  // SECURITY: Use httpClient which proxies through server-side
  // This prevents tokens from being exposed in Network tab
  try {
    const http = (await import('@/services/http')).default;

    const response = await http.put<IApiResponse<{ success?: boolean; message?: string }>>('/auth/change-password', data);

    // Backend response structure: { message, data: { success, message } } or { success, message }
    const responseData = response.data?.data || response.data;

    return {
      success: responseData?.success ?? (response.data?.message ? true : true),
      message: responseData?.message || response.data?.message || 'Password changed successfully',
    };
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to change password');
  }
}

// Export as object for backward compatibility
export const userClient = {
  getProfile,
  updateProfile,
  changePassword,
};

