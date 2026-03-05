"use client";

import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Pencil, Save } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import LoadingOverlay from "@/components/LoadingOverlay";
import { normalizeAvatarUrl } from "@/utils/image.utils";

function AvatarPreview({ file }: Readonly<{ file: File | null }>) {
  const url = useMemo(() => {
    if (!file) return null;

    try {
      return URL.createObjectURL(file);
    } catch (err) {
      console.error("❌ [AvatarPreview] Failed to create blob URL:", err);
      return null;
    }
  }, [file]);

  useEffect(() => {
    if (!url) return;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [url]);

  if (!file || !url) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="avatar preview"
      className="h-16 w-16 rounded-full object-cover ring-1 ring-white/10"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}

const FIELDS = [
  { id: "name", label: "name", editable: true },
  { id: "email", label: "accountEmail", editable: false },
  { id: "phone", label: "phoneNumber", editable: true },
] as const;

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  username?: string;
  avatarUrl?: string | null;
}

interface Props {
  readonly userProfile: UserProfile | null;
  readonly setUserProfile: (profile: UserProfile) => void;
  readonly onProfileUpdated?: () => void;
}

export default function AccountMyInformation({
  userProfile,
  setUserProfile,
  onProfileUpdated,
}: Props) {
  const t = useTranslations("Profile");

  const [formData, setFormData] = useState(() => {
    const savedPhone =
      globalThis.window === undefined
        ? null
        : sessionStorage.getItem("user_phone_backup");
    return {
      name: userProfile?.name || "",
      email: userProfile?.email || "",
      phone: userProfile?.phone || savedPhone || "",
    };
  });
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>(
    {}
  );
  // Normalize avatarUrl when initializing state
  const getNormalizedAvatarUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    return normalizeAvatarUrl(url);
  };

  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    getNormalizedAvatarUrl(userProfile?.avatarUrl)
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  React.useEffect(() => {
    if (!userProfile) {
      return;
    }

    const isEditing = Object.values(editingFields).some(Boolean);
    if (isEditing) {
      return;
    }

    const savedPhone =
      globalThis.window === undefined
        ? null
        : sessionStorage.getItem("user_phone_backup");
    const phoneNumber = userProfile.phone || savedPhone || formData.phone || "";

    const newFormData = {
      name: userProfile.name || "",
      email: userProfile.email || "",
      phone: phoneNumber,
    };

    setFormData(newFormData);

    // Always update avatarUrl when userProfile.avatarUrl changes
    if (userProfile.avatarUrl !== avatarUrl) {
      setAvatarError(false); // Reset error when we get new avatarUrl
      const normalizedUrl = getNormalizedAvatarUrl(userProfile.avatarUrl);
      setAvatarUrl(normalizedUrl);
    }
  }, [userProfile, avatarUrl, editingFields, formData.phone]);

  React.useEffect(() => {
    const isEditing = Object.values(editingFields).some(Boolean);

    if (
      !isEditing &&
      userProfile?.phone &&
      userProfile.phone !== formData.phone
    ) {
      setFormData((prev) => ({
        ...prev,
        phone: userProfile.phone || "",
      }));

      // SECURITY: Sử dụng sessionStorage thay vì localStorage (tự động xóa khi đóng tab)
      if (userProfile.phone) {
        try {
          sessionStorage.setItem("user_phone_backup", userProfile.phone);
        } catch {
          // ignore storage errors
        }
      }
    }
  }, [userProfile?.phone, formData.phone, editingFields]);

  React.useEffect(() => {
    // This effect specifically handles avatarUrl updates from userProfile
    // It runs independently to ensure avatarUrl is always synced
    if (userProfile?.avatarUrl !== undefined) {
      const normalizedUrl = getNormalizedAvatarUrl(userProfile.avatarUrl);
      if (normalizedUrl !== avatarUrl) {
        setAvatarError(false); // Reset error when we get new avatarUrl
        setAvatarUrl(normalizedUrl);
      } else if (avatarError) {
        // If avatarUrl matches but we have an error, reset the error to retry
        setAvatarError(false);
      }
    }
  }, [userProfile?.avatarUrl, avatarUrl, avatarError]); // Only depend on avatarUrl, not the whole userProfile

  const handleAvatarClick = useCallback(() => fileRef.current?.click(), []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      // start avatar upload

      const file = e.target.files?.[0];
      // file selected

      if (!file) {
        // no file
        return;
      }

      // Client-side validation
      // validate type & size

      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Chỉ chấp nhận file ảnh (PNG, JPEG, JPG, GIF, WEBP)");
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert("Kích thước file quá lớn. Tối đa 5MB");
        return;
      }

      setSelectedFile(file);

      try {
        setIsUploadingAvatar(true);

        const formData = new FormData();
        formData.append("file", file);

        const { uploadImage } = await import("@/services/client");
        const folderType =
          userProfile?.username ||
          userProfile?.email ||
          userProfile?.name ||
          "user";
        console.log("[AccountMyInformation] Uploading avatar with folderType:", folderType);
        const uploadData = await uploadImage({
          file,
          type: "avatar",
          folderType,
          useRawFilename: true,
        });

        const newAvatarUrl =
          uploadData.data.filename || uploadData.data.url;

        if (!newAvatarUrl) {
          throw new Error("Backend did not return image URL");
        }

        const { updateProfile } = await import("@/services/client");
        if (!userProfile) return;
        const profileData = await updateProfile({
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone || "",
          avatarUrl: newAvatarUrl,
        });

        // If we get here, update was successful (updateProfile throws on error)
        setSelectedFile(null);
        const normalizedNewUrl = getNormalizedAvatarUrl(newAvatarUrl);
        setAvatarUrl(normalizedNewUrl);
        setAvatarError(false);

        setUserProfile({
          ...userProfile,
          avatarUrl: newAvatarUrl,
        });

        // Notify parent to refresh session
        onProfileUpdated?.();

        // Clear any previous errors
        setTimeout(() => setAvatarError(false), 100);
        setTimeout(() => setAvatarUrl(newAvatarUrl), 200);
      } catch (error) {
        // swallow noisy logs

        if (error instanceof Error && error.name === "AbortError") {
          alert(
            "Quá thời gian chờ. Vui lòng kiểm tra kết nối mạng và thử lại."
          );
        } else {
          alert("Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.");
        }

        setSelectedFile(null);
      } finally {
        // finished
        setIsUploadingAvatar(false);

        e.target.value = "";
      }
    },
    [
      setSelectedFile,
      setAvatarUrl,
      setUserProfile,
      setIsUploadingAvatar,
      userProfile,
    ]
  );

  const handleInputChange = useCallback(
    (field: keyof typeof formData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const toggleEdit = useCallback((field: string) => {
    setEditingFields((prev) => {
      const isNowEditing = !prev[field];

      if (isNowEditing) {
        setTimeout(() => {
          inputRefs.current[field]?.focus();
        }, 0);
      }

      return { ...prev, [field]: isNowEditing };
    });
  }, []);

  // Validation - Vietnamese phone numbers
  const phoneInvalid = useMemo(
    () =>
      formData.phone &&
      !/^(\+84|84|0)?[35789]\d{8}$/.test(
        formData.phone.replaceAll(/[\s-()]/g, "")
      ),
    [formData.phone]
  );

  const shouldDisable = phoneInvalid;
  const fieldData = useMemo(
    () =>
      FIELDS.map((field) => ({
        ...field,
        value: formData[field.id],
      })),
    [formData]
  );

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);

      // Call API to update profile (match backend API spec)
      const { updateProfile } = await import("@/services/client");
      const responseData = await updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        avatarUrl: avatarUrl || undefined,
      });

      if (responseData.success && userProfile) {
        const backendData = responseData.data;

        // SECURITY: Sử dụng sessionStorage thay vì localStorage
        if (formData.phone) {
          try {
            sessionStorage.setItem("user_phone_backup", formData.phone);
          } catch {
            // ignore storage errors
          }
        }

        if (backendData?.phone) {
          try {
            sessionStorage.setItem("user_phone_backup", backendData.phone);
          } catch {
            // ignore storage errors
          }
        }

        const updatedProfile = {
          ...userProfile,
          ...backendData,
          name: backendData?.name || formData.name,
          phone: backendData?.phone || formData.phone,
          avatarUrl: avatarUrl || userProfile.avatarUrl,
        };

        setUserProfile(updatedProfile);
        setEditingFields({});

        if (onProfileUpdated) {
          onProfileUpdated();
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi cập nhật hồ sơ";
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [
    formData,
    userProfile,
    setUserProfile,
    avatarUrl,
    isSaving,
    onProfileUpdated,
  ]);
  if (!userProfile) {
    return (
      <div className="space-y-6 pb-9">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {(isSaving || isUploadingAvatar) && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <LoadingOverlay
              message={
                isUploadingAvatar ? "Uploading avatar..." : "Saving changes..."
              }
            />
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-6 pb-9">
        {/* Avatar */}
        <div>
          <h3 className="text-white text-lg font-medium mb-4">{t("avatar")}</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              {selectedFile && <AvatarPreview file={selectedFile} />}
              {!selectedFile && avatarUrl && !avatarError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={avatarUrl} // Add key to force re-render when avatarUrl changes
                  src={avatarUrl}
                  alt="avatar"
                  className="h-16 w-16 rounded-full object-cover ring-1 ring-white/10"
                  onError={() => {
                    setAvatarError(true);
                  }}
                  onLoad={() => {
                    setAvatarError(false);
                  }}
                />
              ) : null}
              {!selectedFile && (!avatarUrl || avatarError) && (
                <div className="relative h-16 w-16 rounded-full flex items-center justify-center text-white text-lg font-bold bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 ring-2 ring-emerald-300/80 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent"></div>
                  <span className="relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]">
                    {userProfile.name
                      ? userProfile.name.substring(0, 2).toUpperCase()
                      : "U"}
                  </span>
                </div>
              )}

              {/* Loading overlay */}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div>
              <Button
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                variant="outline"
                className="h-10 px-4 font-medium text-[#00E5FF] border-[1.5px] border-cyan-300/50 bg-cyan-500/20 hover:bg-cyan-500/25 disabled:opacity-60 cursor-pointer"
              >
                {isUploadingAvatar ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
                    <span className="animate-pulse">Đang tải lên...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    {t("changeAvatar")}
                  </>
                )}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-6">
          {fieldData.map(({ id, label, value, editable }) => {
            const isEditing = editingFields[id];
            const canEdit = editable && isEditing;

            return (
              <div key={id}>
                <label
                  htmlFor={id}
                  className="text-sm text-gray-400 mb-2 block"
                >
                  {t(label)}
                </label>
                <div className="relative group rounded-xl">
                  <Input
                    id={id}
                    ref={(el) => {
                      inputRefs.current[id] = el;
                    }}
                    value={value}
                    readOnly={!canEdit}
                    autoComplete="off"
                    onChange={
                      canEdit
                        ? (e) =>
                            handleInputChange(
                              id as keyof typeof formData,
                              e.target.value
                            )
                        : undefined
                    }
                    className="relative h-12 pr-10 text-white bg-transparent! hover:bg-[#1c2230]/30 focus:bg-[#1c2230]/30 border-[rgba(54,65,83,0.8)] rounded-xl focus:outline-none focus:ring-0 transition-colors duration-200 disabled:bg-transparent! disabled:text-white disabled:opacity-100 disabled:hover:bg-transparent!"
                    disabled={!canEdit}
                  />
                  {editable && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleEdit(id);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#00E5FF]/20 rounded transition-all duration-200 hover:scale-110 z-10 group cursor-pointer"
                    >
                      <Pencil className="w-4 h-4 text-white/70 group-hover:text-[#00E5FF] transition-colors duration-200" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Save button */}
        <div className="flex justify-end items-center pt-6">
          <Button
            onClick={handleSave}
            disabled={shouldDisable || isSaving}
            size="lg"
            className="bg-[#00C8FF] hover:bg-[#00B8E6] hover:text-black text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="animate-pulse">Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t("saveChanges")}
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
