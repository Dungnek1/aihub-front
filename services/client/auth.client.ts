/**
 * Auth Client Service
 * Client-side authentication API calls
 */

import { IApiResponse, ILoginResponse } from "@/types/api.types";
import { http } from "../http";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
if (!API_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL environment variable is required");
}

// Types
export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterData {
  username: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatarUrl?: string;
}

export interface RegisterResponse {
  timestamp?: string;
  message: string;
  data?: {
    user?: {
      userId?: string;
      username?: string;
      email?: string;
      name?: string;
      phone?: string;
      avatarUrl?: string;
    };
    userId?: string;
    email?: string;
  };
}

export interface ForgotPasswordData {
  email: string;
  locale?: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface VerifyEmailData {
  userId: string;
  code: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    userId: string;
    username: string;
    email: string;
    name: string;
    phone?: string;
    avatarUrl?: string;
    createdAt: string;
  };
}

/**
 * Login with credentials
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    // http.post returns response.data (already unwrapped by axios)
    // So response = { timestamp, message, data: { accessToken, refreshToken, user } }
    const response = await http.post<IApiResponse<ILoginResponse>>(
      "/auth/user/login",
      {
        usernameOrEmail: credentials.usernameOrEmail,
        password: credentials.password,
      }
    );

    // http.post returns response.data (unwrapped by axios)
    // But proxy route returns NextResponse.json(responseData), so response should be the data directly

    // Handle different response structures
    let loginData: ILoginResponse | null = null;
    const apiResponse = response as IApiResponse<ILoginResponse>;

    // Case 1: Standard structure { timestamp, message, data: {...} }
    if (apiResponse?.data && apiResponse.data.accessToken) {
      loginData = apiResponse.data;
    }
    // Case 2: Direct structure { accessToken, refreshToken, user }
    else if ((response as any).accessToken) {
      loginData = response as any as ILoginResponse;
    }
    // Case 3: Response is wrapped in another data field
    else if ((response as any).data && (response as any).data.accessToken) {
      loginData = (response as any).data;
    }
    // Case 4: Check if response has status (Axios response object - shouldn't happen but handle it)
    else if ((response as any).status && (response as any).data) {
      const axiosResponse = response as any;
      if (axiosResponse.data?.data) {
        loginData = axiosResponse.data.data;
      } else if (axiosResponse.data?.accessToken) {
        loginData = axiosResponse.data;
      }
    }

    if (loginData) {
      const { accessToken, refreshToken, user } = loginData;

      // Validate user object exists
      if (!user) {
        throw new Error("User data not found in response");
      }

      // Handle userId field (check for typo "userld" as well)
      const userId = user.userId || (user as any).userld || (user as any).id;
      if (!userId) {
        throw new Error("User ID not found in response");
      }

      return {
        accessToken,
        refreshToken,
        user: {
          userId,
          username: user.username || "",
          email: user.email || "",
          name: user.name || "",
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt || new Date().toISOString(),
        },
      };
    }

    // If we get here, response structure is unexpected
    throw new Error((apiResponse as any)?.message || (response as any)?.message || "Login failed");
  } catch (error: any) {
    // Don't log sensitive error details
    const errorMessage = error?.response?.data?.message || error?.message || "Login failed";
    throw new Error(errorMessage);
  }
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<RegisterResponse> {
  const requestBody: RegisterData = {
    username: data.username,
    name: data.name,
    email: data.email,
    password: data.password,
  };

  // Only include optional fields if provided
  if (data.phone) {
    requestBody.phone = data.phone;
  }
  if (data.avatarUrl) {
    requestBody.avatarUrl = data.avatarUrl;
  }

  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.error || "Registration failed");
  }

  return result;
}

/**
 * Send forgot password email
 */
export async function forgotPassword(data: ForgotPasswordData): Promise<{ success: boolean; message: string }> {
  const { http } = await import("@/services/http");
  try {
    const result = await http.post<{ success: boolean; message: string }>(
      "/auth/forgot-password",
      data
    );
    return result;
  } catch (error: any) {
    throw new Error(error?.message || "Failed to send reset email");
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(data: ResetPasswordData): Promise<{ success: boolean; message: string }> {
  const { http } = await import("@/services/http");
  try {
    const result = await http.post<{ success: boolean; message: string }>(
      "/auth/reset-password",
      data
    );
    return result;
  } catch (error: any) {
    throw new Error(error?.message || "Failed to reset password");
  }
}

/**
 * Verify email with OTP code
 */
export async function verifyEmail(data: VerifyEmailData): Promise<{ success: boolean; message: string; token?: string }> {
  const { http } = await import("@/services/http");
  try {
    const result = await http.post<{ success: boolean; message: string; token?: string }>(
      "/auth/verify-email",
      data
    );
    return result;
  } catch (error: any) {
    throw new Error(error?.message || "Email verification failed");
  }
}

/**
 * Refresh access token
 */
export async function refreshTokenApi(refreshToken: string): Promise<LoginResponse> {
  try {
    // http.post returns response.data (already unwrapped by axios)
    // So response = { timestamp, message, data: { accessToken, refreshToken, user } }
    const response = await http.post<IApiResponse<ILoginResponse>>(
      "/auth/refresh",
      { refreshToken }
    );

    // Response structure: { timestamp, message, data: { accessToken, refreshToken, user } }
    // http.post already returns response.data, so response = { timestamp, message, data: {...} }
    const apiResponse = response as IApiResponse<ILoginResponse>;

    if (apiResponse?.data) {
      const { accessToken, refreshToken: newRefreshToken, user } = apiResponse.data;

      // Validate user object exists
      if (!user) {
        throw new Error("User data not found in response");
      }

      // Handle userId field (check for typo "userld" as well)
      const userId = user.userId || (user as any).userld || (user as any).id;
      if (!userId) {
        throw new Error("User ID not found in response");
      }

      return {
        accessToken,
        refreshToken: newRefreshToken || refreshToken,
        user: {
          userId,
          username: user.username || "",
          email: user.email || "",
          name: user.name || "",
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt || new Date().toISOString(),
        },
      };
    }

    throw new Error(apiResponse?.message || "Token refresh failed");
  } catch (error: any) {
    // Don't log sensitive error details
    const errorMessage = error?.response?.data?.message || error?.message || "Token refresh failed";
    throw new Error(errorMessage);
  }
}

/**
 * Logout user
 */
export async function logout(refreshToken?: string): Promise<void> {
  if (refreshToken) {
    try {
      await http.post("/auth/logout", { refreshToken });
    } catch (error) {
      // Ignore logout errors on backend
      console.error("Backend logout failed:", error);
    }
  }
}

