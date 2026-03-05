"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { forgotPassword } from "@/services/client/auth.client";
import { AnimatePresence } from "framer-motion";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useToast } from "@/components/ui/Toast";

type Step = "email" | "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
  }>({});
  const [touched, setTouched] = useState<{
    email?: boolean;
  }>({});
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('Pages.forgotPassword');
  const toast = useToast();

  const validateEmail = () => {
    const newErrors: { email?: string } = {};

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('emailRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateField = (field: string, value: string) => {
    if (touched[field as keyof typeof touched]) {
      const newErrors = { ...errors };

      if (field === "email") {
        if (!value) {
          newErrors.email = t('emailRequired');
        } else if (/\S+@\S+\.\S+/.test(value)) {
          delete newErrors.email;
        } else {
          newErrors.email = t('emailRequired');
        }
      }

      setErrors(newErrors);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setIsLoading(true);
    setErrors({});
    try {
      const response = await forgotPassword({ email, locale });
      
      // Check if response is successful
      if (response?.success !== false) {
        toast.success(t('successMessage') || "Email đã được gửi thành công!");
        setStep("success");
      } else {
        throw new Error(response?.message || t('errorOccurred') || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        t('errorOccurred') || 
        "Không thể gửi email. Vui lòng thử lại sau.";
      
      setErrors({ email: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (step) {
      case "email":
        return t('title');
      case "success":
        return t('successTitle');
      default:
        return t('title');
    }
  };

  const getDescription = () => {
    switch (step) {
      case "email":
        return t('subtitle');
      case "success":
        return t('successMessage');
      default:
        return t('subtitle');
    }
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <LoadingOverlay message={t('sending')} />
          </div>
        )}
      </AnimatePresence>
      <div className="flex min-h-screen items-start justify-center px-4 sm:px-6 md:px-8 pt-20 sm:pt-16 md:pt-20 pb-8">
        {/* Desktop: Card component */}
        <div className="relative w-full max-w-[496px] rounded-2xl border border-[rgba(0,211,242,0.5)] bg-transparent backdrop-blur-[12.5px] shadow-[0_6px_25px_-8px_rgba(0,0,0,0.0001)] hidden sm:block p-6 md:p-7">
          <div className="flex flex-col gap-7 md:gap-9 items-start">
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
                <h1 className="bg-clip-text bg-gradient-to-b from-[#9ff3df] to-[#17eff7] font-medium text-sm sm:text-base leading-5 sm:leading-6 min-w-full text-center" style={{ WebkitTextFillColor: "transparent" }}>
                  {getTitle()}
                </h1>
                <p className="font-normal leading-4 sm:leading-5 text-white text-xs sm:text-sm px-2">
                  {getDescription()}
                </p>
              </div>
            </div>

            {/* Form Section */}
            <div className="flex flex-col gap-3 md:gap-4 items-start w-full">
              {/* EMAIL FORM */}
              {step === "email" && (
                <form onSubmit={handleEmailSubmit} className="w-full space-y-4">
                  <div className="flex flex-col gap-2 items-start w-full">
                    <div className="flex gap-[2px] items-start w-full">
                      <label htmlFor="email" className="font-medium leading-5 sm:leading-6 text-white text-sm sm:text-base">
                        {t('emailLabel')}
                      </label>
                      <span className="font-normal leading-4 sm:leading-5 text-[#f04438] text-xs sm:text-sm">*</span>
                    </div>
                    <div
                      className={`flex h-10 sm:h-11 items-center gap-2 sm:gap-[6px] rounded-lg sm:rounded-[10px] border px-3 py-2 w-full ${
                        errors.email
                          ? "border-red-500 bg-red-500/10"
                          : "border-[rgba(54,65,83,0.5)] bg-[rgba(11,14,24,0.5)]"
                      }`}
                    >
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#717680] flex-shrink-0" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setTouched((prev) => ({ ...prev, email: true }));
                          // Clear error when user starts typing
                          if (errors.email) {
                            setErrors({});
                          }
                          validateField("email", e.target.value);
                        }}
                        onBlur={() =>
                          setTouched((prev) => ({ ...prev, email: true }))
                        }
                        placeholder={t('emailPlaceholder')}
                        className="flex-1 h-full border-0 bg-transparent p-0 text-white placeholder:text-[#717680] focus-visible:ring-0 text-sm sm:text-base"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                    )}
                  </div>
                </form>
              )}

              {/* Email Step Button */}
              {step === "email" && (
                <button
                  type="button"
                  onClick={handleEmailSubmit}
                  disabled={isLoading}
                  className="bg-gradient-to-b from-[#06a8ac] to-[#19dde2] border border-[#06a8ac] rounded-lg sm:rounded-xl w-full px-4 sm:px-[18px] py-2.5 sm:py-3 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span className="font-semibold leading-5 sm:leading-6 text-[#0b5a5c] text-sm sm:text-base">
                    {isLoading ? "Đang gửi..." : t('sendResetLinkButton')}
                  </span>
                </button>
              )}

              {/* Success Step */}
              {step === "success" && (
                <div className="w-full text-center">
                  <div className="flex items-center justify-center gap-2 text-green-400 text-sm mb-4">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Email verified successfully!
                  </div>
                  <p className="text-white/70 text-sm">
                    {t('redirecting')}
                  </p>
                </div>
              )}

              {/* Back to Login Button */}
              {step === "email" && (
                <Link
                  href={`/${locale}/auth/signin`}
                  className="flex gap-1 sm:gap-1.5 items-center justify-center px-3 py-2 rounded-lg sm:rounded-xl shadow-[0px_6px_16px_0px_rgba(11,90,92,0.5)] w-full transition-all hover:opacity-90"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#00d3f2]" />
                  <span className="font-semibold leading-4 sm:leading-5 text-[#00d3f2] text-xs sm:text-sm">
                    {t('backToLogin')}
                  </span>
                </Link>
              )}

              {step === "success" && (
                <Link
                  href={`/${locale}/auth/signin`}
                  className="flex gap-1 sm:gap-1.5 items-center justify-center px-3 py-2 rounded-lg sm:rounded-xl shadow-[0px_6px_16px_0px_rgba(11,90,92,0.5)] w-full transition-all hover:opacity-90"
                >
                  <span className="font-semibold leading-4 sm:leading-5 text-[#00d3f2] text-xs sm:text-sm">
                    {t('goToSignIn')}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile: Layout */}
        <div className="relative w-full max-w-[496px] sm:hidden">
          <div className="rounded-xl sm:rounded-2xl border border-[rgba(0,211,242,0.5)] bg-transparent backdrop-blur-[12.5px] p-5 sm:p-6">
            <div className="flex flex-col gap-6 sm:gap-9 items-start">
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
                    {getTitle()}
                  </h1>
                  <p className="font-normal leading-4 sm:leading-5 text-white text-xs sm:text-sm px-2">
                    {getDescription()}
                  </p>
                </div>
              </div>

              {/* Form Section */}
              <div className="flex flex-col gap-3 sm:gap-4 items-start w-full">
                {step === "email" && (
                  <form onSubmit={handleEmailSubmit} className="w-full space-y-4">
                    <div className="flex flex-col gap-2 items-start w-full">
                      <div className="flex gap-[2px] items-start w-full">
                        <label htmlFor="email-mobile" className="font-medium leading-5 sm:leading-6 text-white text-sm sm:text-base">
                          {t('emailLabel')}
                        </label>
                        <span className="font-normal leading-4 sm:leading-5 text-[#f04438] text-xs sm:text-sm">*</span>
                      </div>
                      <div
                        className={`flex h-10 sm:h-11 items-center gap-2 sm:gap-[6px] rounded-lg sm:rounded-[10px] border px-3 py-2 w-full ${
                          errors.email
                            ? "border-red-500 bg-red-500/10"
                            : "border-[rgba(54,65,83,0.5)] bg-[rgba(11,14,24,0.5)]"
                        }`}
                      >
                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#717680] flex-shrink-0" />
                        <Input
                          id="email-mobile"
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setTouched((prev) => ({ ...prev, email: true }));
                            // Clear error when user starts typing
                            if (errors.email) {
                              setErrors({});
                            }
                            validateField("email", e.target.value);
                          }}
                          onBlur={() =>
                            setTouched((prev) => ({ ...prev, email: true }))
                          }
                          placeholder={t('emailPlaceholder')}
                          className="flex-1 h-full border-0 bg-transparent p-0 text-white placeholder:text-[#717680] focus-visible:ring-0 text-sm sm:text-base"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                      )}
                    </div>
                  </form>
                )}

                {step === "email" && (
                  <button
                    type="button"
                    onClick={handleEmailSubmit}
                    disabled={isLoading}
                    className="bg-gradient-to-b from-[#06a8ac] to-[#19dde2] border border-[#06a8ac] rounded-lg sm:rounded-xl w-full px-4 sm:px-[18px] py-2.5 sm:py-3 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="font-semibold leading-5 sm:leading-6 text-[#0b5a5c] text-sm sm:text-base">
                      {isLoading ? "Đang gửi..." : t('sendResetLinkButton')}
                    </span>
                  </button>
                )}

                {step === "success" && (
                  <div className="w-full text-center">
                    <div className="flex items-center justify-center gap-2 text-green-400 text-sm mb-4">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Email verified successfully!
                    </div>
                    <p className="text-white/70 text-sm">
                      {t('redirecting')}
                    </p>
                  </div>
                )}

                {step === "email" && (
                  <Link
                    href={`/${locale}/auth/signin`}
                    className="flex gap-1 sm:gap-1.5 items-center justify-center px-3 py-2 rounded-lg sm:rounded-xl shadow-[0px_6px_16px_0px_rgba(11,90,92,0.5)] w-full transition-all hover:opacity-90"
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#00d3f2]" />
                    <span className="font-semibold leading-4 sm:leading-5 text-[#00d3f2] text-xs sm:text-sm">
                      {t('backToLogin')}
                    </span>
                  </Link>
                )}

                {step === "success" && (
                  <Link
                    href={`/${locale}/auth/signin`}
                    className="flex gap-1 sm:gap-1.5 items-center justify-center px-3 py-2 rounded-lg sm:rounded-xl shadow-[0px_6px_16px_0px_rgba(11,90,92,0.5)] w-full transition-all hover:opacity-90"
                  >
                    <span className="font-semibold leading-4 sm:leading-5 text-[#00d3f2] text-xs sm:text-sm">
                      {t('goToSignIn')}
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
