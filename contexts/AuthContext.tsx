"use client";

import React, { createContext, useContext, useCallback } from "react";
import { useSession, signIn, signOut, SessionProvider } from "next-auth/react";
import { User, saveUser, getUser } from "@/lib/auth";
import { register as registerApi } from "@/services/client/auth.client";
import { LoginCredentials, RegisterData, RegisterResponse } from "@/services/client/auth.client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // Refetch session every 5 minutes to trigger refresh check
      refetchOnWindowFocus={true} // Refetch when window gains focus
    >
      <AuthContextInner>{children}</AuthContextInner>
    </SessionProvider>
  );
}

function AuthContextInner({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const retryCountRef = React.useRef(0);
  const logoutTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Auto-refresh check: kiểm tra và refresh token định kỳ
  // Refresh token trong background, không trigger navigation
  React.useEffect(() => {
    if (status !== "authenticated" || !session) return;

    const accessToken = (session as any)?.accessToken;
    const expiresAt = (session as any)?.accessTokenExpires;

    if (!accessToken || !expiresAt) return;

    const checkAndRefresh = async () => {
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      const refreshBufferMs = 5 * 60 * 1000; // 5 phút

      // Nếu token sắp hết hạn hoặc đã hết hạn, trigger refresh
      if (timeUntilExpiry <= refreshBufferMs) {
        try {
          // update() sẽ trigger jwt callback để refresh token
          // Không trigger navigation vì đây là background refresh
          await update({ revalidate: true });
        } catch (error) {
          console.error("[AuthContext] Auto-refresh failed:", error);
        }
      }
    };

    // Check ngay lập tức
    checkAndRefresh();

    // Check mỗi 1 phút
    const interval = 60 * 1000;
    refreshIntervalRef.current = setInterval(checkAndRefresh, interval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [session, status, update]);

  React.useEffect(() => {
    // Chỉ logout khi có error VÀ không còn accessToken hoặc token đã hết hạn hoàn toàn
    // Điều này cho phép hệ thống retry refresh trước khi logout
    if ((session as any)?.error === "RefreshAccessTokenError") {
      const accessToken = (session as any)?.accessToken;
      const expiresAt = (session as any)?.accessTokenExpires;
      const hasValidToken = accessToken && expiresAt && Date.now() < expiresAt;

      // Nếu vẫn còn token valid, reset retry count và không logout
      // Logic trong auth.config.ts sẽ tự động clear error khi token còn valid
      if (hasValidToken) {
        retryCountRef.current = 0;
        if (logoutTimeoutRef.current) {
          clearTimeout(logoutTimeoutRef.current);
          logoutTimeoutRef.current = null;
        }
        // Thử update session để clear error
        update().catch(() => {
          // Ignore errors
        });
        return;
      }

      // Chỉ logout nếu token thực sự không còn valid
      // Và chỉ sau khi retry nhiều lần thất bại (mỗi lần cách nhau 30s từ auth.config.ts)
      if (!hasValidToken) {
        retryCountRef.current += 1;

        // Clear timeout cũ nếu có
        if (logoutTimeoutRef.current) {
          clearTimeout(logoutTimeoutRef.current);
        }

        // Chỉ logout sau 5 lần retry thất bại (mỗi lần cách nhau 30s)
        // Tức là sau khoảng 2.5 phút mới logout
        if (retryCountRef.current >= 5) {
          logoutTimeoutRef.current = setTimeout(() => {
            signOut({ redirect: true, callbackUrl: "/auth/signin" });
          }, 1000);
        } else {
          // Thử refresh lại sau một chút
          setTimeout(() => {
            update().catch(() => {
              // Ignore errors, let retry logic handle it
            });
          }, 1000);
        }

        return () => {
          if (logoutTimeoutRef.current) {
            clearTimeout(logoutTimeoutRef.current);
          }
        };
      }
    } else {
      // Reset retry count khi không có error
      retryCountRef.current = 0;
      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current);
        logoutTimeoutRef.current = null;
      }
    }
  }, [session, update]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await signIn("credentials", {
      usernameOrEmail: credentials.usernameOrEmail,
      password: credentials.password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(
        result.error === "CredentialsSignin" ? "Invalid credentials" : result.error
      );
    }

    await update();
  }, [update]);

  const register = useCallback(async (data: RegisterData) => {
    // Keep existing register flow but return API result so callers can use response data
    const result = await registerApi(data);

    // Remove auto-login to allow email verification flow
    // The signup page will handle redirection to verify-email

    return result;
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/" });
    } catch (error) {
      console.error("Logout error:", error);
      await signOut({ redirect: true, callbackUrl: "/" });
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      await update();
    } catch (error) {
      console.error("Failed to refresh auth:", error);
    }
  }, [update]);

  const rawSessionUser = session?.user;

  const nextAuthUser = rawSessionUser
    ? ({
      ...(rawSessionUser as object),
    } as (typeof rawSessionUser & {
      id?: string | null;
      userId?: string | null;
      username?: string | null;
      avatarUrl?: string | null;
      phone?: string | null;
    }))
    : undefined;

  // Convert NextAuth session user sang User type
  const user: User | null = nextAuthUser
    ? {
      userId: nextAuthUser.userId || nextAuthUser.id || "",
      email: nextAuthUser.email || "",
      name: nextAuthUser.name || "",
      username: nextAuthUser.username || "",
      avatarUrl: nextAuthUser.avatarUrl || nextAuthUser.image || undefined,
      phone: nextAuthUser.phone || undefined,
      createdAt: new Date().toISOString(),
    }
    : null;

  // Cache user vào localStorage để tăng performance (chỉ cache, không phải token)
  React.useEffect(() => {
    if (user) {
      saveUser(user);
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading: status === "loading",
    isAuthenticated: !!session,
    login,
    register,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
