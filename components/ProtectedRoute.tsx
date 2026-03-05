"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = "/auth/signin",
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Public paths that don't require auth
    const publicPaths = ["/auth/", "/", "/blog", "/news", "/ai-tools"];
    const isPublicPath = publicPaths.some((path) => pathname?.includes(path));

    if (isPublicPath && !requireAuth) {
      return;
    }

    // Redirect if auth required but not authenticated
    if (requireAuth && !isAuthenticated && !isPublicPath) {
      router.push(redirectTo);
    } else if (!requireAuth && isAuthenticated && pathname?.includes("/auth/")) {
      router.push("/");
    }
  }, [user, isLoading, isAuthenticated, requireAuth, redirectTo, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#10C0C5]"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireAuth={true}>{children}</ProtectedRoute>;
}

export function AuthPage({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireAuth={false}>{children}</ProtectedRoute>;
}

