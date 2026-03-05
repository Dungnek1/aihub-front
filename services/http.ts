"use client";

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// KHÔNG dùng NEXT_PUBLIC_BACKEND_URL trực tiếp nữa
// Mọi request backend đều đi qua /api/proxy/*

const httpClient = axios.create({
  // baseURL để trống, mình sẽ gắn /api/proxy trong interceptor
  baseURL: "",
  timeout: 30000,
  withCredentials: true, // ✅ Quan trọng: gửi cookies kèm request
  headers: {
    "Content-Type": "application/json",
  },
});

// ⚙️ Request interceptor: chuyển hết sang /api/proxy/**
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const originalUrl = config.url || "";

    // 1. Không đụng vào Next.js API nội bộ (bắt đầu bằng /api/ nhưng không phải /api/v1/)
    //    Ví dụ: /api/auth/session, /api/auth/csrf, /api/auth/refresh...
    //    Nhưng /api/v1/... sẽ được proxy
    if (originalUrl.startsWith("/api/") && !originalUrl.startsWith("/api/v1/")) {
      return config;
    }

    // 2. Mọi URL khác (backend) đều proxy qua /api/proxy/*
    //    Ví dụ: /tools/used -> /api/proxy/tools/used
    //    Ví dụ: /api/v1/blog/posts/1 -> /api/proxy/api/v1/blog/posts/1
    const path = originalUrl.replace(/^\/+/, ""); // bỏ bớt dấu /
    config.url = `/api/proxy/${path}`;
    config.baseURL = ""; // dùng URL tương đối

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ⚙️ Response interceptor: đơn giản hoá, KHÔNG auto-refresh nữa
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {

    // Trả lỗi 401 ngay cho caller để xử lý (ví dụ: redirect login)
    if (error.response?.status === 401) {
      const data = error.response.data as any;
      const err: any = new Error(
        data?.message || data?.error || "Unauthorized"
      );
      err.status = 401;
      return Promise.reject(err);
    }

    // Các lỗi khác: gói message gọn lại
    const data = error.response?.data as any;
    const message =
      data?.message || data?.error || error.message || "Request failed";

    return Promise.reject(new Error(message));
  }
);

// Helper giống cũ
export default httpClient;

export const http = {
  get: <T>(url: string, config?: Record<string, unknown>) =>
    httpClient.get<T>(url, config).then((res) => res.data),
  post: <T>(url: string, data?: unknown, config?: Record<string, unknown>) =>
    httpClient.post<T>(url, data, config).then((res) => res.data),
  put: <T>(url: string, data?: unknown, config?: Record<string, unknown>) =>
    httpClient.put<T>(url, data, config).then((res) => res.data),
  delete: <T>(url: string, config?: Record<string, unknown>) =>
    httpClient.delete<T>(url, config).then((res) => res.data),
  patch: <T>(url: string, data?: unknown, config?: Record<string, unknown>) =>
    httpClient.patch<T>(url, data, config).then((res) => res.data),
};
