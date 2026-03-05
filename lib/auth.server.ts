/**
 * Server-side Auth Utilities
 * Get user info from JWT token in cookies
 *
 * NOTE: These functions use dynamic imports to avoid client-side bundling
 */

import { authOptions } from "./auth.config";
import { User } from "./auth";

/**
 * Get user from token on server-side
 * Returns null if no valid token
 *
 * IMPORTANT: Only call this in Server Components or Server Actions
 */
export async function getServerUser(): Promise<User | null> {
  try {
    const { getServerSession } = await import("next-auth");
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return null;
    }

    return {
      userId: (session.user as any)?.id || "",
      username: (session.user as any)?.username || "",
      email: session.user.email || "",
      name: session.user.name || "",
      phone: (session.user as any)?.phone,
      avatarUrl: (session.user as any)?.avatarUrl,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get access token from session
 * Uses getServerSession to get accessToken from session (cleaner approach)
 *
 * IMPORTANT: Only call this in Server Components or Server Actions
 */
export async function getServerToken(): Promise<string | null> {
  try {
    const { getServerSession } = await import("next-auth");
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log("[getServerToken] No session");
      return null;
    }

    const accessToken = (session as any).accessToken;
    console.log(
      "[getServerToken] session.accessToken:",
      accessToken ? "exists" : "missing"
    );

    return accessToken ?? null;
  } catch (error) {
    console.error("getServerToken error:", error);
    return null;
  }
}

/**
 * Refresh access token on server-side
 * Calls the refresh API directly and returns the new token
 *
 * IMPORTANT: Only call this in Server Components or Server Actions
 */
export async function refreshServerToken(): Promise<string | null> {
  try {
    const { getServerSession } = await import("next-auth");
    const session = await getServerSession(authOptions);

    if (!session) {
      return null;
    }

    // Get refresh token from session (stored in JWT)
    const { getToken } = await import("next-auth/jwt");
    const cookies = await import("next/headers");
    const cookieStore = await cookies.cookies();

    // Get JWT token to access refreshToken
    const token = await getToken({
      req: {
        headers: {
          cookie: cookieStore.toString(),
        },
      } as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !(token as any).refreshToken) {
      return null;
    }

    const refreshToken = (token as any).refreshToken as string;
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!BACKEND_URL) {
      return null;
    }

    // Call refresh API
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;
    const refreshUrl = baseUrl.includes("/api/v1")
      ? `${baseUrl}/auth/refresh`
      : `${baseUrl}/api/v1/auth/refresh`;

    const response = await fetch(refreshUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const refreshData = data?.data || data;

    if (!refreshData?.accessToken) {
      return null;
    }

    // Return new access token
    return refreshData.accessToken;
  } catch (error) {
    console.error("refreshServerToken error:", error);
    return null;
  }
}
