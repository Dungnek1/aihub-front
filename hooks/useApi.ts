import { http } from "@/services/http";
import { useState } from "react";

export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);

  const makeRequest = async <T>(
    requestFn: () => Promise<T>,
    showLoading = true
  ): Promise<T | null> => {
    if (showLoading) setIsLoading(true);
    
    try {
      const result = await requestFn();
      return result;
    } catch (error) {
      console.error("API request failed:", error);
      return null;
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  return {
    session: null,
    isLoading,
    isAuthenticated: false,
    isUnauthenticated: true,
    api: {
      get: <T>(url: string, config?: Record<string, unknown>) =>
        makeRequest(() => http.get<T>(url, config)),
      post: <T>(url: string, data?: Record<string, unknown>, config?: Record<string, unknown>) =>
        makeRequest(() => http.post<T>(url, data, config)),
      put: <T>(url: string, data?: Record<string, unknown>, config?: Record<string, unknown>) =>
        makeRequest(() => http.put<T>(url, data, config)),
      delete: <T>(url: string, config?: Record<string, unknown>) =>
        makeRequest(() => http.delete<T>(url, config)),
      patch: <T>(url: string, data?: Record<string, unknown>, config?: Record<string, unknown>) =>
        makeRequest(() => http.patch<T>(url, data, config)),
    },
  };
};
