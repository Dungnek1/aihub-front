"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AnimatePresence } from "framer-motion";
import LoadingOverlay from "@/components/LoadingOverlay";
import Link from "next/link";
import { resetPassword } from "@/services/client/auth.client";
import { cn } from "@/utils";
import { useToast } from "@/components/ui/Toast";

function ResetPasswordContent() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Pages.resetPassword");
  const toast = useToast();

  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [touched, setTouched] = useState<{
    newPassword?: boolean;
    confirmPassword?: boolean;
  }>({});

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setResetToken(tokenParam);
    } else {
      router.push(`/${locale}/auth/forgot-password`);
    }
  }, [searchParams, router, locale]);

  const validateForm = () => {
    const newErrors: {
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!newPassword) {
      newErrors.newPassword = t("passwordRequired");
    } else if (newPassword.length < 8 || newPassword.length > 50) {
      newErrors.newPassword = t("passwordLength") || "Mật khẩu phải từ 8-50 ký tự";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t("passwordRequired");
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t("passwordsNotMatch");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateField = (field: string, value: string) => {
    if (touched[field as keyof typeof touched]) {
      const newErrors = { ...errors };

      if (field === "newPassword") {
        if (!value) {
          newErrors.newPassword = t("passwordRequired");
        } else if (value.length < 8 || value.length > 50) {
          newErrors.newPassword = t("passwordLength") || "Mật khẩu phải từ 8-50 ký tự";
        } else {
          delete newErrors.newPassword;
        }
      }

      if (field === "confirmPassword") {
        if (!value) {
          newErrors.confirmPassword = t("passwordRequired");
        } else if (newPassword !== value) {
          newErrors.confirmPassword = t("passwordsNotMatch");
        } else {
          delete newErrors.confirmPassword;
        }
      }

      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !resetToken || !isTermsChecked) return;

    setIsLoading(true);
    setErrors({});
    try {
      const response = await resetPassword({
        token: resetToken,
        newPassword,
      });
      
      // Check if response is successful
      if (response?.success !== false) {
        toast.success(t("successMessage") || "Mật khẩu đã được đặt lại thành công!");
        setIsSuccess(true);
        setTimeout(() => {
          router.push(`/${locale}/auth/signin`);
        }, 2000);
      } else {
        throw new Error(response?.message || t("errorOccurred") || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("errorOccurred") ||
        "Không thể đặt lại mật khẩu. Vui lòng thử lại sau.";
      
      setErrors({ newPassword: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex justify-center items-start px-4 sm:px-6 md:px-8 pt-20 sm:pt-16 md:pt-20 pb-8 min-h-screen">
        <div className="relative w-full max-w-[496px] rounded-xl sm:rounded-2xl border border-[rgba(0,211,242,0.5)] bg-transparent backdrop-blur-[12.5px] shadow-[0_6px_25px_-8px_rgba(0,0,0,0.0001)] p-5 sm:p-6 md:p-7">
          <div className="flex flex-col gap-4 sm:gap-5 items-center">
            {/* Logo Icon with Glow */}
            <div className="flex flex-col gap-2 items-center w-full">
              <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[0.769px] border-[#00d3f2]">
                <div className="absolute bg-[rgba(0,211,242,0.5)] blur-[37.846px] filter left-0 rounded-full w-[65px] h-[65px] sm:w-[82.308px] sm:h-[82.308px] top-[calc(50%+0.38px)] translate-y-[-50%]" />
                <div className="absolute bg-[rgba(11,14,24,0.5)] left-1/2 rounded-full shadow-[0px_4.615px_12.308px_0px_rgba(0,184,219,0.5)] w-[44px] h-[44px] sm:w-[55.385px] sm:h-[55.385px] top-1/2 translate-x-[-50%] translate-y-[-50%] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/frame-83.png"
                    alt="AI Hub"
                    className="w-5 h-5 sm:w-6 sm:h-6"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 items-center text-center w-full">
                <h1 className="bg-clip-text bg-gradient-to-b from-[#9ff3df] to-[#17eff7] font-medium text-sm sm:text-base leading-5 sm:leading-6 min-w-full text-center px-2" style={{ WebkitTextFillColor: "transparent" }}>
                  {t("successTitle")}
                </h1>
                <p className="font-normal leading-4 sm:leading-5 text-white text-xs sm:text-sm px-2">
                  {t("successMessage")}
                </p>
              </div>
            </div>
            <Link
              href={`/${locale}/auth/signin`}
              className="flex gap-1 sm:gap-1.5 items-center justify-center px-3 py-2 rounded-lg sm:rounded-xl shadow-[0px_6px_16px_0px_rgba(11,90,92,0.5)] w-full transition-all hover:opacity-90"
            >
              <span className="font-semibold leading-4 sm:leading-5 text-[#00d3f2] text-xs sm:text-sm">
                {t('goToLogin')}
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!resetToken) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <LoadingOverlay message={t("resetting") || "Đang đặt lại..."} />
          </div>
        )}
      </AnimatePresence>

      <div className="flex justify-center items-start px-4 sm:px-6 md:px-8 pt-20 sm:pt-16 md:pt-20 pb-8 min-h-screen">
        <div className="relative w-full max-w-[496px] rounded-2xl border border-[rgba(0,211,242,0.5)] bg-transparent backdrop-blur-[12.5px] shadow-[0_6px_25px_-8px_rgba(0,0,0,0.0001)] hidden sm:block p-6 md:p-7">
          <div className="flex flex-col gap-4 md:gap-5 items-center">
            {/* Logo Icon with Glow */}
            <div className="flex flex-col gap-2 items-center w-full">
              <div className="relative shrink-0 w-20 h-20 rounded-full border-[0.769px] border-[#00d3f2]">
                <div className="absolute bg-[rgba(0,211,242,0.5)] blur-[37.846px] filter left-0 rounded-full w-[82.308px] h-[82.308px] top-[calc(50%+0.38px)] translate-y-[-50%]" />
                <div className="absolute bg-[rgba(11,14,24,0.5)] left-1/2 rounded-full shadow-[0px_4.615px_12.308px_0px_rgba(0,184,219,0.5)] w-[55.385px] h-[55.385px] top-1/2 translate-x-[-50%] translate-y-[-50%] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/frame-83.png"
                    alt="AI Hub"
                    className="w-6 h-6"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 items-center text-center w-full">
                <h1 className="bg-clip-text bg-gradient-to-b from-[#9ff3df] to-[#17eff7] font-medium text-sm sm:text-base leading-5 sm:leading-6 min-w-full text-center px-2" style={{ WebkitTextFillColor: "transparent" }}>
                  {t("title")}
                </h1>
                <p className="font-normal leading-4 sm:leading-5 text-white text-xs sm:text-sm px-2">
                  {t("subtitle")}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:gap-4 items-center w-full">
              <div className="flex flex-col gap-2 items-start w-full">
                <div className="flex gap-[2px] items-start w-full">
                  <label
                    htmlFor="newPassword-desktop"
                    className="font-medium leading-5 sm:leading-6 text-white text-sm sm:text-base"
                  >
                    {t("newPasswordLabel")}
                  </label>
                  <span className="font-normal leading-4 sm:leading-5 text-[#f04438] text-xs sm:text-sm">*</span>
                </div>
                <div
                  className={cn(
                    "flex h-10 sm:h-11 items-center gap-2 sm:gap-[6px] rounded-lg sm:rounded-[10px] border px-3 py-2 w-full",
                    errors.newPassword
                      ? "border-red-500 bg-red-500/10"
                      : "border-[rgba(54,65,83,0.5)] bg-[rgba(11,14,24,0.5)]"
                  )}
                >
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#717680] flex-shrink-0" />
                  <Input
                    id="newPassword-desktop"
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setTouched((prev) => ({ ...prev, newPassword: true }));
                      // Clear error when user starts typing
                      if (errors.newPassword) {
                        setErrors((prev) => ({ ...prev, newPassword: undefined }));
                      }
                      validateField("newPassword", e.target.value);
                    }}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, newPassword: true }))
                    }
                    placeholder={t("newPasswordPlaceholder")}
                    className="flex-1 h-full border-0 bg-transparent p-0 text-white placeholder:text-[#717680] focus-visible:ring-0 text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="inline-flex justify-center items-center flex-shrink-0 cursor-pointer"
                  >
                    {showNewPw ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-[#717680]" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-[#717680]" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>
                )}
              </div>

              <div className="flex flex-col gap-2 items-start w-full">
                <div className="flex gap-[2px] items-start w-full">
                  <label
                    htmlFor="confirmPassword-desktop"
                    className="font-medium leading-5 sm:leading-6 text-white text-sm sm:text-base"
                  >
                    {t("confirmPasswordLabel")}
                  </label>
                  <span className="font-normal leading-4 sm:leading-5 text-[#f04438] text-xs sm:text-sm">*</span>
                </div>
                <div
                  className={cn(
                    "flex h-10 sm:h-11 items-center gap-2 sm:gap-[6px] rounded-lg sm:rounded-[10px] border px-3 py-2 w-full",
                    errors.confirmPassword
                      ? "border-red-500 bg-red-500/10"
                      : "border-[rgba(54,65,83,0.5)] bg-[rgba(11,14,24,0.5)]"
                  )}
                >
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#717680] flex-shrink-0" />
                  <Input
                    id="confirmPassword-desktop"
                    type={showConfirmPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setTouched((prev) => ({ ...prev, confirmPassword: true }));
                      // Clear error when user starts typing
                      if (errors.confirmPassword) {
                        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                      }
                      validateField("confirmPassword", e.target.value);
                    }}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, confirmPassword: true }))
                    }
                    placeholder={t("confirmPasswordPlaceholder")}
                    className="flex-1 h-full border-0 bg-transparent p-0 text-white placeholder:text-[#717680] focus-visible:ring-0 text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="inline-flex justify-center items-center flex-shrink-0 cursor-pointer"
                  >
                    {showConfirmPw ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-[#717680]" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-[#717680]" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex gap-1.5 sm:gap-2 items-center w-full flex-wrap">
                <div className="flex gap-1.5 sm:gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => setIsTermsChecked(!isTermsChecked)}
                    className="relative shrink-0 w-5 h-5 sm:w-6 sm:h-6 cursor-pointer flex items-center justify-center"
                  >
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-all ${
                      isTermsChecked 
                        ? "border-[#00d3f2] bg-[#00d3f2]" 
                        : "border-white/30 bg-transparent"
                    }`}>
                      {isTermsChecked && (
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                  <p className="font-normal leading-4 sm:leading-5 text-[#d5d7da] text-xs sm:text-sm">
                    I agree to the
                  </p>
                </div>
                <Link href="#" className="font-semibold leading-4 sm:leading-5 text-[#00d3f2] text-xs sm:text-sm underline hover:opacity-80 transition-opacity">
                  Terms
                </Link>
                <p className="font-normal leading-4 sm:leading-5 text-[#d5d7da] text-xs sm:text-sm">
                  and
                </p>
                <Link href="#" className="font-semibold leading-4 sm:leading-5 text-[#00d3f2] text-xs sm:text-sm underline hover:opacity-80 transition-opacity">
                  Privacy Policy
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading || !newPassword || !confirmPassword || !isTermsChecked}
                className="bg-gradient-to-b from-[#06a8ac] to-[#19dde2] border border-[#06a8ac] rounded-lg sm:rounded-xl w-full px-4 sm:px-[18px] py-2.5 sm:py-3 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span className="font-semibold leading-5 sm:leading-6 text-[#0b5a5c] text-sm sm:text-base">
                  {isLoading ? t("resetting") || "Đang đặt lại..." : t("resetButton")}
                </span>
              </button>

              <Link
                href={`/${locale}/auth/signin`}
                className="flex gap-1 sm:gap-1.5 items-center justify-center px-3 py-2 rounded-lg sm:rounded-xl shadow-[0px_6px_16px_0px_rgba(11,90,92,0.5)] w-full transition-all hover:opacity-90"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#00d3f2]" />
                <span className="font-semibold leading-4 sm:leading-5 text-[#00d3f2] text-xs sm:text-sm">
                  {t("backToLogin")}
                </span>
              </Link>
            </form>
          </div>
        </div>

        {/* Mobile: Layout */}
        <div className="relative w-full max-w-[496px] sm:hidden">
          <div className="rounded-xl sm:rounded-2xl border border-[rgba(0,211,242,0.5)] bg-transparent backdrop-blur-[12.5px] p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:gap-5 items-center">
              {/* Logo Icon with Glow */}
              <div className="flex flex-col gap-2 items-center w-full">
                <div className="relative shrink-0 w-20 h-20 rounded-full border-[0.769px] border-[#00d3f2]">
                  <div className="absolute bg-[rgba(0,211,242,0.5)] blur-[37.846px] filter left-0 rounded-full w-[82.308px] h-[82.308px] top-[calc(50%+0.38px)] translate-y-[-50%]" />
                  <div className="absolute bg-[rgba(11,14,24,0.5)] left-1/2 rounded-full shadow-[0px_4.615px_12.308px_0px_rgba(0,184,219,0.5)] w-[55.385px] h-[55.385px] top-1/2 translate-x-[-50%] translate-y-[-50%] flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/frame-83.png"
                      alt="AI Hub"
                      className="w-6 h-6"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-center text-center w-full">
                  <h1 className="bg-clip-text bg-gradient-to-b from-[#9ff3df] to-[#17eff7] font-medium text-sm sm:text-base leading-5 sm:leading-6 min-w-full text-center px-2" style={{ WebkitTextFillColor: "transparent" }}>
                    {t("title")}
                  </h1>
                  <p className="font-normal leading-4 sm:leading-5 text-white text-xs sm:text-sm px-2">
                    {t("subtitle")}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4 items-center w-full">
                <div className="flex flex-col gap-2 items-start w-full">
                  <div className="flex gap-[2px] items-start w-full">
                    <label
                      htmlFor="newPassword-mobile"
                      className="font-medium leading-5 sm:leading-6 text-white text-sm sm:text-base"
                    >
                      {t("newPasswordLabel")}
                    </label>
                    <span className="font-normal leading-4 sm:leading-5 text-[#f04438] text-xs sm:text-sm">*</span>
                  </div>
                  <div
                    className={cn(
                      "flex h-10 sm:h-11 items-center gap-2 sm:gap-[6px] rounded-lg sm:rounded-[10px] border px-3 py-2 w-full",
                      errors.newPassword
                        ? "border-red-500 bg-red-500/10"
                        : "border-[rgba(54,65,83,0.5)] bg-[rgba(11,14,24,0.5)]"
                    )}
                  >
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#717680] flex-shrink-0" />
                    <Input
                      id="newPassword-mobile"
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setTouched((prev) => ({ ...prev, newPassword: true }));
                        // Clear error when user starts typing
                        if (errors.newPassword) {
                          setErrors((prev) => ({ ...prev, newPassword: undefined }));
                        }
                        validateField("newPassword", e.target.value);
                      }}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, newPassword: true }))
                      }
                      placeholder={t("newPasswordPlaceholder")}
                      className="flex-1 h-full border-0 bg-transparent p-0 text-white placeholder:text-[#717680] focus-visible:ring-0 text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="inline-flex justify-center items-center flex-shrink-0 cursor-pointer"
                    >
                      {showNewPw ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-[#717680]" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-[#717680]" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 items-start w-full">
                  <div className="flex gap-[2px] items-start w-full">
                    <label
                      htmlFor="confirmPassword-mobile"
                      className="font-medium leading-5 sm:leading-6 text-white text-sm sm:text-base"
                    >
                      {t("confirmPasswordLabel")}
                    </label>
                    <span className="font-normal leading-4 sm:leading-5 text-[#f04438] text-xs sm:text-sm">*</span>
                  </div>
                  <div
                    className={cn(
                      "flex h-10 sm:h-11 items-center gap-2 sm:gap-[6px] rounded-lg sm:rounded-[10px] border px-3 py-2 w-full",
                      errors.confirmPassword
                        ? "border-red-500 bg-red-500/10"
                        : "border-[rgba(54,65,83,0.5)] bg-[rgba(11,14,24,0.5)]"
                    )}
                  >
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#717680] flex-shrink-0" />
                    <Input
                      id="confirmPassword-mobile"
                      type={showConfirmPw ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setTouched((prev) => ({ ...prev, confirmPassword: true }));
                        // Clear error when user starts typing
                        if (errors.confirmPassword) {
                          setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                        }
                        validateField("confirmPassword", e.target.value);
                      }}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, confirmPassword: true }))
                      }
                      placeholder={t("confirmPasswordPlaceholder")}
                      className="flex-1 h-full border-0 bg-transparent p-0 text-white placeholder:text-[#717680] focus-visible:ring-0 text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="inline-flex justify-center items-center flex-shrink-0 cursor-pointer"
                    >
                      {showConfirmPw ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-[#717680]" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-[#717680]" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="flex gap-1.5 sm:gap-2 items-center w-full flex-wrap">
                  <div className="flex gap-1.5 sm:gap-2 items-center">
                    <button
                      type="button"
                      onClick={() => setIsTermsChecked(!isTermsChecked)}
                      className="relative shrink-0 w-5 h-5 sm:w-6 sm:h-6 cursor-pointer flex items-center justify-center"
                    >
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-all ${
                        isTermsChecked 
                          ? "border-[#00d3f2] bg-[#00d3f2]" 
                          : "border-white/30 bg-transparent"
                      }`}>
                        {isTermsChecked && (
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                    <p className="font-normal leading-4 sm:leading-5 text-[#d5d7da] text-xs sm:text-sm">
                      I agree to the
                    </p>
                  </div>
                  <Link href="#" className="font-semibold leading-4 sm:leading-5 text-[#00d3f2] text-xs sm:text-sm underline hover:opacity-80 transition-opacity">
                    Terms
                  </Link>
                  <p className="font-normal leading-4 sm:leading-5 text-[#d5d7da] text-xs sm:text-sm">
                    and
                  </p>
                  <Link href="#" className="font-semibold leading-4 sm:leading-5 text-[#00d3f2] text-xs sm:text-sm underline hover:opacity-80 transition-opacity">
                    Privacy Policy
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !newPassword || !confirmPassword || !isTermsChecked}
                  className="bg-gradient-to-b from-[#06a8ac] to-[#19dde2] border border-[#06a8ac] rounded-lg sm:rounded-xl w-full px-4 sm:px-[18px] py-2.5 sm:py-3 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span className="font-semibold leading-5 sm:leading-6 text-[#0b5a5c] text-sm sm:text-base">
                    {isLoading ? t("resetting") || "Đang đặt lại..." : t("resetButton")}
                  </span>
                </button>

                <Link
                  href={`/${locale}/auth/signin`}
                  className="flex gap-1 sm:gap-1.5 items-center justify-center px-3 py-2 rounded-lg sm:rounded-xl shadow-[0px_6px_16px_0px_rgba(11,90,92,0.5)] w-full transition-all hover:opacity-90"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#00d3f2]" />
                  <span className="font-semibold leading-4 sm:leading-5 text-[#00d3f2] text-xs sm:text-sm">
                    {t("backToLogin")}
                  </span>
                </Link>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

