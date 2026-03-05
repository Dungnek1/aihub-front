"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatePresence } from "framer-motion";
import LoadingOverlay from "@/components/LoadingOverlay";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import Infor from "@/app/[locale]/profile/account-my-information";
import SettingsPanel from "@/app/[locale]/profile/account-my-settings";
import SecurityPanel from "@/app/[locale]/profile/account-my-security";
import { logger } from "@/utils/logger";

type TabKey = "information" | "settings" | "security";

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  username?: string;
  avatarUrl?: string | null;
}

interface ProfilePageContentProps {
  readonly sessionUser: {
    name?: string;
    email?: string;
    image?: string;
  } | null;
}

export default function ProfilePageContent({
  sessionUser,
}: ProfilePageContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Profile");
  const { user: authUser, refreshAuth } = useAuth();

  const tab: TabKey | null = (searchParams.get("tab") as TabKey) ?? null;

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    if (sessionUser) {
      return {
        name: sessionUser.name || "",
        email: sessionUser.email || "",
        phone: "",
        username: "",
        avatarUrl: sessionUser.image || null,
      };
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [hasFetchedProfile, setHasFetchedProfile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState<{
    usedToolsCount: number;
    savedToolsCount: number;
    blogPostsCount: number;
  }>({
    usedToolsCount: 0,
    savedToolsCount: 0,
    blogPostsCount: 0,
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ✅ Memoize sessionUser để tránh re-render không cần thiết
  const memoizedSessionUser = useMemo(() => {
    if (sessionUser) {
      return sessionUser;
    }

    if (authUser) {
      return {
        name: authUser.name || authUser.username || "",
        email: authUser.email || "",
        image: authUser.avatarUrl || undefined,
      };
    }

    return null;
  }, [
    sessionUser?.name,
    sessionUser?.email,
    sessionUser?.image,
    authUser?.name,
    authUser?.email,
    authUser?.avatarUrl,
    authUser?.username,
  ]);

  // Fetch profile from API on mount to ensure we have latest data
  useEffect(() => {
    const fetchProfile = async () => {
      // Only fetch if we haven't fetched yet and we have session
      if (hasFetchedProfile || !memoizedSessionUser) return;

      // ✅ Giảm delay từ 2s xuống 500ms - đủ để JWT token ready
      // Token thường ready ngay sau khi component mount
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check again after delay in case component unmounted
      if (hasFetchedProfile || !memoizedSessionUser) return;

      try {
        setIsLoading(true);
        const { getProfile } = await import("@/services/client");
        const profileResponse = await getProfile();

        // API response structure: { message, data: { userId, username, email, name, phone, avatarUrl, ... } }
        // Some APIs don't have 'success' field, so check for 'data' instead
        if (profileResponse.data) {
          const apiAvatarUrl = profileResponse.data.avatarUrl || null;

          const newUserProfile = {
            name: profileResponse.data.name || "",
            email: profileResponse.data.email || "",
            phone: profileResponse.data.phone || "",
            username: profileResponse.data.username || "",
            avatarUrl: apiAvatarUrl,
          };

          setUserProfile(newUserProfile);
          setHasFetchedProfile(true);
        } else {
          logger.warn("API response missing data", {
            module: "ProfilePageContent",
            function: "fetchProfile",
            profileResponse,
          });
          // Mark as fetched even if no data to avoid retry
          setHasFetchedProfile(true);
        }
      } catch (error: unknown) {
        const errorObj = error as any;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        const isAuthError =
          errorMessage.includes("Invalid token") ||
          errorMessage.includes("Unauthorized") ||
          errorMessage.includes("401") ||
          errorObj?.response?.status === 401;

        // 🔐 Trường hợp: lỗi auth nhưng VẪN có sessionUser → không redirect, dùng session làm fallback
        if (isAuthError && memoizedSessionUser) {
          if (
            process.env.NODE_ENV === "development" &&
            !errorObj?._silent &&
            !errorMessage.includes("grace period")
          ) {
            logger.warn(
              "[ProfilePageContent] fetchProfile() auth error but sessionUser exists, using session fallback",
              {
                module: "ProfilePageContent",
                function: "fetchProfile",
                error: errorMessage,
              }
            );
          }
          setHasFetchedProfile(true);
          return;
        }

        // ❌ Chỉ redirect khi THẬT SỰ không có session (session = null)
        // Không redirect khi chỉ có lỗi auth nhưng vẫn có session
        // Để tránh logout user khi có lỗi tạm thời (network, server error, v.v.)
        // ✅ QUAN TRỌNG: Không tự động redirect - để AuthGuard xử lý
        // AuthGuard sẽ chỉ redirect khi session thật sự null
        if (isAuthError && !memoizedSessionUser) {
          // ✅ Không redirect ngay - có thể là lỗi tạm thời
          // Chỉ log và dùng session data nếu có
          // AuthGuard sẽ xử lý redirect nếu thật sự không có session
          if (
            process.env.NODE_ENV === "development" &&
            !errorObj?._silent &&
            !errorMessage.includes("grace period")
          ) {
            logger.warn(
              "[ProfilePageContent] Auth error but not redirecting - letting AuthGuard handle",
              {
              module: "ProfilePageContent",
              function: "fetchProfile",
              error: errorMessage,
              }
            );
          }
          setHasFetchedProfile(true);
          return;
        }

        // Các lỗi khác (network, server, v.v.) chỉ log (dev) và giữ UI chạy bằng session
        if (
          process.env.NODE_ENV === "development" &&
          !errorObj?._silent &&
          !errorMessage.includes("grace period")
        ) {
          logger.error("Failed to fetch profile", {
            module: "ProfilePageContent",
            function: "fetchProfile",
            error: errorMessage,
          });
        }

        // Dù lỗi gì đi nữa, vẫn mark là đã fetch để tránh loop, và dùng session làm fallback
        setHasFetchedProfile(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // ✅ Chỉ update userProfile từ sessionUser khi chưa fetch từ API
  // Tránh override data đã fetch từ API
  useEffect(() => {
    // Chỉ update nếu chưa fetch từ API và có sessionUser
    if (hasFetchedProfile || !memoizedSessionUser) return;

    setUserProfile((prev) => ({
      name: memoizedSessionUser.name || "",
      email: memoizedSessionUser.email || "",
          phone: prev?.phone || "",
          username: prev?.username || "",
      avatarUrl: memoizedSessionUser.image || null,
    }));
  }, [memoizedSessionUser, hasFetchedProfile]);

  const setTab = useCallback(
    (next: TabKey | null) => {
      const sp = new URLSearchParams(searchParams);
      if (next === null) {
        sp.delete("tab");
      } else {
        sp.set("tab", next);
      }
      router.replace(`${pathname}?${sp.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const onProfileUpdated = useCallback(async () => {
    // Fetch latest profile from API to ensure we have the updated avatar
    try {
      setIsLoading(true);
      const { getProfile } = await import("@/services/client");
      const profileResponse = await getProfile();

      // API response structure: { message, data: { userId, username, email, name, phone, avatarUrl, ... } }
      if (profileResponse.data) {
        const apiAvatarUrl = profileResponse.data.avatarUrl || null;

        setUserProfile({
          name: profileResponse.data.name || "",
          email: profileResponse.data.email || "",
          phone: profileResponse.data.phone || "",
          username: profileResponse.data.username || "",
          avatarUrl: apiAvatarUrl,
        });
        setHasFetchedProfile(true);
      }

      // Also refresh auth to update user
      await refreshAuth();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error("Failed to refresh profile", {
        module: "ProfilePageContent",
        function: "onProfileUpdated",
        error: errorMessage,
      });
      // Still try to refresh auth even if profile fetch fails
      try {
        await refreshAuth();
      } catch (authError: unknown) {
        const authErrorMessage =
          authError instanceof Error
            ? authError.message
            : "Unknown error";
        logger.error("Failed to refresh auth", {
          module: "ProfilePageContent",
          function: "onProfileUpdated",
          error: authErrorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [refreshAuth]);

  // ✅ Memoize userId to stabilize dependency
  const userId = useMemo(
    () => authUser?.userId || (sessionUser as any)?.userId || null,
    [authUser?.userId, (sessionUser as any)?.userId]
  );

  // Fetch stats when session is available
  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return; // Wait for userId

      try {
        const [
          { getUserUsedTools, getUserSavedTools },
          { filterPosts },
        ] = await Promise.all([
          import("@/services/client/tools.client"),
          import("@/services/client/blog.client"),
        ]);

        // Fetch all stats in parallel
        const [usedTools, savedTools, blogPosts] = await Promise.all([
          getUserUsedTools(0, 1000).catch(() => []),
          getUserSavedTools(0, 1000).catch(() => []),
          // Get user's blog posts by filtering with userId
          filterPosts({
            userId: userId,
            skip: 0,
            take: 1000,
          }).catch(() => []),
        ]);

        setStats({
          usedToolsCount: Array.isArray(usedTools) ? usedTools.length : 0,
          savedToolsCount: Array.isArray(savedTools) ? savedTools.length : 0,
          blogPostsCount: Array.isArray(blogPosts) ? blogPosts.length : 0,
        });
      } catch (error) {
        // Silent fail - stats are optional
        if (process.env.NODE_ENV === "development") {
          console.debug("[ProfilePageContent] Failed to fetch stats:", error);
        }
      }
    };

    fetchStats();
  }, [userId]);

  const Content = useMemo(() => {
    if (!userProfile) return null;

    const activeTab = tab || "information";
    switch (activeTab) {
      case "settings":
        return <SettingsPanel userProfile={userProfile} />;
      case "security":
        return (
          <SecurityPanel
            userProfile={userProfile}
            onProfileUpdated={onProfileUpdated}
          />
        );
      case "information":
      default:
        return (
          <Infor
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            onProfileUpdated={onProfileUpdated}
          />
        );
    }
  }, [tab, userProfile, onProfileUpdated]);

  return (
    <>
      <AnimatePresence>
        {(isLoading || isUploadingAvatar) && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <LoadingOverlay
              message={
                isUploadingAvatar
                  ? t("uploadingAvatar")
                  : t("loadingProfile")
              }
            />
          </div>
        )}
      </AnimatePresence>

      <div className="w-full bg-[#0A0F18] text-white -mt-4 sm:-mt-6">
        <div className="min-h-[calc(100vh-102px-320px)] w-full pt-4 sm:pt-6 pb-15">
          <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 xl:px-0">
            <ProfileHeader
              userProfile={userProfile}
              isLoading={isLoading}
              isUploadingAvatar={isUploadingAvatar}
              onUserProfileUpdate={setUserProfile}
              onProfileUpdated={onProfileUpdated}
              stats={stats}
            />

            {/* Desktop Layout: Sidebar + Content */}
            {!isMobile && (
              <div className="flex gap-9 mt-15">
                <ProfileTabs
                  currentTab={tab || "information"}
                  onTabChange={setTab}
                />

                {/* Divider line */}
                <div className="w-px bg-white" />

                <section className="min-h-[560px] flex-1">
                  {Content}
                </section>
              </div>
            )}

            {/* Mobile Layout: Accordion Style */}
            {isMobile && (
              <div className="mt-8 space-y-0">
                <ProfileTabs
                  currentTab={tab}
                  onTabChange={setTab}
                  isMobile={true}
                  contentRenderer={Content}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
