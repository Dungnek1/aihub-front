"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { AnimatePresence } from "framer-motion";
import LoadingOverlay from "@/components/LoadingOverlay";
import { logger } from "@/utils/logger";
import { normalizeAvatarUrl } from "@/utils/image.utils";

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  username?: string;
  avatarUrl?: string | null; // PATH từ BE: "image/alice/avatar-10-....png"
}

interface ProfileHeaderProps {
  readonly userProfile: UserProfile | null;
  readonly isLoading: boolean;
  readonly isUploadingAvatar: boolean;
  readonly onAvatarChange?: (newAvatarPath: string) => void;
  readonly onUserProfileUpdate?: (profile: UserProfile) => void;
  readonly onProfileUpdated?: () => void;
  readonly stats?: {
    usedToolsCount?: number;
    savedToolsCount?: number;
    blogPostsCount?: number;
  };
}

// Helper initials
const getInitials = (name?: string): string => {
  if (!name) return "U";
  const words = name.trim().split(" ").filter(Boolean);
  if (words.length === 0) return "U";
  if (words.length === 1) return words[0]!.substring(0, 2).toUpperCase();
  return (words[0]![0] + (words.at(-1)?.[0] || "")).toUpperCase();
};

export default function ProfileHeader({
  userProfile,
  isLoading,
  isUploadingAvatar,
  onAvatarChange,
  onUserProfileUpdate,
  onProfileUpdated,
  stats,
}: ProfileHeaderProps) {
  const t = useTranslations("Profile");
  const { data: session, update: updateSession } = useSession();
  const fileRef = useRef<HTMLInputElement | null>(null);

  // State local để render: LUÔN là full URL
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() =>
    normalizeAvatarUrl(userProfile?.avatarUrl || null)
  );

  // Sync khi profile đổi (khi reload / getProfile lại)
  useEffect(() => {
    setAvatarUrl(normalizeAvatarUrl(userProfile?.avatarUrl || null));
  }, [userProfile?.avatarUrl]);

  const onPickAvatar = useCallback(() => fileRef.current?.click(), []);

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        e.target.value = "";
        return;
      }

      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Chỉ chấp nhận file ảnh (PNG, JPEG, JPG, GIF, WEBP)");
        e.target.value = "";
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("Kích thước file quá lớn. Tối đa 5MB");
        e.target.value = "";
        return;
      }

      try {
        const { uploadImage, updateProfile } = await import(
          "@/services/client"
        );

        // Upload file lên BE qua proxy
        const folderType =
          userProfile?.username ||
          userProfile?.email ||
          userProfile?.name ||
          "user";
        console.log("[ProfileHeader] Uploading avatar with folderType:", folderType);
        const uploadData = await uploadImage({
          file,
          type: "avatar",
          folderType,
          useRawFilename: true,
        });

        // BE (swagger) trả filename: "image/alice/avatar-10-....png"
        const avatarPath: string | undefined =
          uploadData?.data?.filename || uploadData?.data?.url;

        if (!avatarPath) {
          throw new Error("Backend did not return image filename/url");
        }

        // Cập nhật profile trong BE/DB → lưu PATH
        await updateProfile({
          name: userProfile?.name || "",
          email: userProfile?.email,
          phone: userProfile?.phone || "",
          avatarUrl: avatarPath,
        });

        // Build URL để hiển thị
        const finalUrl = normalizeAvatarUrl(avatarPath);
        setAvatarUrl(finalUrl); // 👉 chỉ đổi 1 lần sang URL thật

        // Cập nhật state profile ở parent
        if (userProfile) {
          onUserProfileUpdate?.({
            ...userProfile,
            avatarUrl: avatarPath, // vẫn là path
          });
        }

        // Notify parent
        onAvatarChange?.(avatarPath);
        onProfileUpdated?.();

        // Update session NextAuth (nếu bạn có dùng avatar ở Header)
        if (updateSession && session?.user) {
          await updateSession({
            ...session,
            user: {
              ...(session.user as any),
              avatarUrl: avatarPath,
            },
          });
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        logger.error("Avatar upload error", {
          module: "ProfileHeader",
          function: "onFileChange",
          error: errorMessage,
        });

        // Quay về avatar cũ
        setAvatarUrl(normalizeAvatarUrl(userProfile?.avatarUrl || null));

        alert(
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại."
        );
      } finally {
        e.target.value = "";
      }
    },
    [
      userProfile,
      onAvatarChange,
      onUserProfileUpdate,
      onProfileUpdated,
      session,
      updateSession,
    ]
  );

  return (
    <>
      <AnimatePresence>
        {isUploadingAvatar && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <LoadingOverlay message={t("uploadingAvatar")} />
          </div>
        )}
      </AnimatePresence>

      <Card className="relative rounded-2xl border-[1.5px] border-[#00E5FF]/50 bg-[#17202F] shadow-[0_8px_40px_rgba(0,229,255,0.45)] p-0 transition-all duration-300">
        <CardContent className="relative p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-center">
            {/* Avatar + name */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center w-full sm:w-auto">
              <div className="relative">
                {isLoading && (
                  <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-full ring-1 animate-pulse bg-linear-to-br from-gray-700/50 to-gray-800/50 ring-white/10" />
                )}

                {!isLoading && avatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="object-cover w-20 h-20 sm:w-16 sm:h-16 rounded-full ring-1 ring-white/10"
                    onError={() => {
                      // Không set null nữa để tránh vòng lặp load
                      console.warn("Avatar image failed to load:", avatarUrl);
                    }}
                  />
                )}

                {!isLoading && !avatarUrl && (
                  <div className="h-20 w-20 sm:h-16 sm:w-16 rounded-full bg-[radial-gradient(circle_at_30%_30%,#1e293b,transparent_60%),linear-gradient(#0F172A,#0B1220)] ring-1 ring-white/10 flex items-center justify-center text-white/80 text-xl sm:text-lg font-semibold">
                    {getInitials(userProfile?.name)}
                  </div>
                )}

                {/* Nút đổi avatar */}
                {!isLoading && (
                  <button
                    onClick={onPickAvatar}
                    className="absolute -right-1 -bottom-1 flex h-7 w-7 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#17202F] ring-1 ring-white/20 hover:bg-[#00E5FF]/20 hover:ring-[#00E5FF]/60 transition-all duration-200 hover:scale-110 group"
                    title={t("changeAvatar")}
                  >
                    <Camera className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-white/80 group-hover:text-[#00E5FF] transition-colors duration-200" />
                  </button>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex-1 text-center sm:text-left">
                {isLoading ? (
                  <>
                    <div className="mb-2 w-40 h-6 rounded animate-pulse bg-linear-to-r from-gray-700/50 to-gray-800/50 mx-auto sm:mx-0" />
                    <div className="w-56 h-4 rounded animate-pulse bg-linear-to-r from-gray-700/50 to-gray-800/50 mx-auto sm:mx-0" />
                  </>
                ) : (
                  <>
                    <div className="text-lg sm:text-lg font-semibold text-white">
                      {userProfile?.name || t("noName")}
                    </div>
                    <div className="text-sm text-white/70">
                      {userProfile?.email || t("noEmail")}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex gap-4 items-center">
              <div className="flex flex-col items-center justify-center px-4 py-2 rounded-lg border border-green-400/20 bg-green-400/5 min-w-[100px]">
                <span className="text-lg font-semibold text-green-400">
                  {stats?.usedToolsCount ?? 0}
                </span>
                <span className="text-base font-medium text-gray-400">
                  {t("stats.toolsUsed")}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center px-4 py-2 rounded-lg border border-yellow-400/20 bg-yellow-400/5 min-w-[100px]">
                <span className="text-lg font-semibold text-yellow-400">
                  {stats?.savedToolsCount ?? 0}
                </span>
                <span className="text-base font-medium text-gray-400">
                  {t("stats.toolsSaved")}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center px-4 py-2 rounded-lg border border-cyan-400/20 bg-cyan-400/5 min-w-[100px]">
                <span className="text-lg font-semibold text-cyan-400">
                  {stats?.blogPostsCount ?? 0}
                </span>
                <span className="text-base font-medium text-gray-400">
                  {t("stats.blogPosts")}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
