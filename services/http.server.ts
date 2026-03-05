/**
 * HTTP Server Client
 * Server-side only HTTP client using axios
 * Dùng cho SSR và API routes
 */

import axios, { AxiosError, AxiosHeaders } from "axios";
import type { NextRequest } from "next/server";

const serverBaseURL = process.env.NEXT_PUBLIC_BACKEND_URL!;

if (!serverBaseURL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL environment variable is required");
}

const httpServerClient = axios.create({
  baseURL: serverBaseURL,
  timeout: 60000, // Tăng timeout từ 30s lên 60s để tránh timeout khi API chậm
  headers: { "Content-Type": "application/json" },
});

httpServerClient.interceptors.request.use((config) => {
  const accessToken = (config as any).__accessToken as string | undefined;
  if (accessToken) {
    if (config.headers) {
      const headers = config.headers as AxiosHeaders & {
        [key: string]: any;
      };
      if (typeof headers.set === "function") {
        headers.set("Authorization", `Bearer ${accessToken}`);
      } else {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }
    } else {
      config.headers = new AxiosHeaders({
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      });
    }
    delete (config as any).__accessToken;
  }
  return config;
});

// Response interceptor: Xử lý lỗi và refresh token
httpServerClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    // Giữ nguyên error gốc nếu là timeout để có thể xử lý riêng
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw error;
    }

    // Xử lý 401/403 - thử refresh token và retry
    const originalRequest = error.config as any;
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Dynamic import để tránh circular dependency
        const { getServerToken, refreshServerToken } = await import("@/lib/auth.server");
        const currentToken = await getServerToken();
        
        if (currentToken) {
          // Thử refresh token
          const newToken = await refreshServerToken();
          
          if (newToken && originalRequest) {
            // Retry request với token mới
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            } else {
              originalRequest.headers = {
                Authorization: `Bearer ${newToken}`,
              };
            }
            return httpServerClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Nếu refresh thất bại, throw error gốc
        console.error("Failed to refresh token:", refreshError);
      }
    }
    
    const errorMessage = error.response?.data
      ? (error.response.data as any).message || error.message
      : error.message || "Response failed";
    throw new Error(errorMessage);
  }
);

export default httpServerClient;

/**
 * Get authenticated HTTP client với token từ cookies
 * 
 * IMPORTANT: Only use this in Server Components or Server Actions
 */
export async function getAuthenticatedHttpClient(
  req?: NextRequest | Request
) {
  let accessToken: string | undefined;

  // Get token from cookies (dynamic import to avoid client bundling)
  try {
    const { getServerToken } = await import("@/lib/auth.server");
    const token = await getServerToken();
    accessToken = token || undefined;
  } catch (error) {
    
    accessToken = undefined;
  }

  const addAuthHeader = (config: any) => {
    if (accessToken) {
      return {
        ...config,
        headers: {
          ...(config.headers || {}),
          Authorization: `Bearer ${accessToken}`,
        },
      };
    }
    return config;
  };

  return {
    get: <T>(url: string, config: any = {}) =>
      httpServerClient.get<T>(url, addAuthHeader(config)).then((res) => res.data),

    post: <T>(url: string, data?: any, config: any = {}) =>
      httpServerClient.post<T>(url, data, addAuthHeader(config)).then((res) => res.data),

    put: <T>(url: string, data?: any, config: any = {}) =>
      httpServerClient.put<T>(url, data, addAuthHeader(config)).then((res) => res.data),

    delete: <T>(url: string, config: any = {}) =>
      httpServerClient.delete<T>(url, addAuthHeader(config)).then((res) => res.data),

    patch: <T>(url: string, data?: any, config: any = {}) =>
      httpServerClient.patch<T>(url, data, addAuthHeader(config)).then((res) => res.data),
  };
}

// Helper functions cho unauthenticated requests
export const httpServer = {
  get: <T>(url: string, config?: Record<string, unknown>) =>
    httpServerClient.get<T>(url, config).then((res) => res.data),

  post: <T>(url: string, data?: unknown, config?: Record<string, unknown>) =>
    httpServerClient.post<T>(url, data, config).then((res) => res.data),

  put: <T>(url: string, data?: unknown, config?: Record<string, unknown>) =>
    httpServerClient.put<T>(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config?: Record<string, unknown>) =>
    httpServerClient.delete<T>(url, config).then((res) => res.data),

  patch: <T>(url: string, data?: unknown, config?: Record<string, unknown>) =>
    httpServerClient.patch<T>(url, data, config).then((res) => res.data),
};
