"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Mail, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LogoAuth from "@/components/auth/LogoAuth";
import { AnimatePresence } from "framer-motion";
import LoadingOverlay from "@/components/LoadingOverlay";
import Link from "next/link";
import { http } from "@/services/http";
import { cn } from "@/utils";

type VerifyEmailResponse = {
  success?: boolean;
  message?: string;
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-10 text-white/80">Loading...</div>}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}

function VerifyEmailPageContent() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Auth");

  const [code, setCode] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  // Get userId and email from URL params or sessionStorage
  useEffect(() => {
    const urlUserId = searchParams.get("userId");
    const urlEmail = searchParams.get("email");

    const storedUserId = typeof window !== "undefined" ? sessionStorage.getItem("verify_userId") : null;
    const storedEmail = typeof window !== "undefined" ? sessionStorage.getItem("verify_email") : null;

    if (urlUserId) {
      setUserId(urlUserId);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("verify_userId", urlUserId);
      }
    } else if (storedUserId) {
      setUserId(storedUserId);
    }

    if (urlEmail) {
      setEmail(urlEmail);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("verify_email", urlEmail);
      }
    } else if (storedEmail) {
      setEmail(storedEmail);
    }

    // If no userId, redirect to signup
    if (!urlUserId && !storedUserId) {
      router.push(`/${locale}/auth/signup`);
    }
  }, [searchParams, router, locale]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
    setError("");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setError("User ID không hợp lệ. Vui lòng đăng ký lại.");
      return;
    }

    if (code.length !== 6) {
      setError("Vui lòng nhập đầy đủ 6 chữ số");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await http.post<VerifyEmailResponse>("/auth/verify-email", {
        userId,
        code,
      });

      // Backend response structure: { timestamp, message, data: { success, message } }
      const isSuccess = (response as any)?.data?.success || response?.success;

      if (isSuccess) {
        setIsVerified(true);
        // Clear session storage
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("verify_userId");
          sessionStorage.removeItem("verify_email");
        }
        // Redirect to signin after 2 seconds
        setTimeout(() => {
          router.push(`/${locale}/auth/signin?verified=true`);
        }, 2000);
      } else {
        const errorMsg = (response as any)?.data?.message || response?.message || "Mã xác thực không chính xác";
        setError(errorMsg);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Xác thực thất bại";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!userId || countdown > 0) return;

    setIsResending(true);
    setError("");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL not configured');
      }

      // Use axios for better consistency and header handling
      const axios = (await import('axios')).default;

      const response = await axios.post(
        `${backendUrl}/auth/resend-verification`,
        { userId }
      );

      const result = response.data;

      // Backend response structure: { timestamp, message, data: { success, message } }
      const isSuccess = result?.data?.success || result?.success;

      if (isSuccess) {
        setCountdown(300); // 5 minutes
        setError("");
      } else {
        setError(result?.data?.message || result?.message || "Không thể gửi lại mã xác thực");
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Gửi lại mã thất bại";
      setError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="flex justify-center items-start px-4 sm:px-6 md:px-8 pt-20 sm:pt-16 md:pt-20 pb-8 min-h-screen">
        <Card className="relative w-full max-w-[480px] rounded-xl sm:rounded-[20px] border border-white/10 bg-[#0E5188]/4 backdrop-blur-md shadow-[0_6px_25px_-8px_rgba(0,0,0,0.0001)]">
          <div className="absolute top-0 left-0 right-0 h-32 sm:h-40 bg-linear-to-b from-[#0E5188]/0.0000001 to-transparent rounded-t-xl sm:rounded-t-[20px] pointer-events-none" />
          <CardContent className="relative p-6 sm:p-8">
            <div className="text-center">
              <div className="hidden sm:block mx-auto mb-4 sm:mb-6">
                <LogoAuth />
              </div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-green-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">
                Xác thực thành công!
              </h2>
              <p className="text-xs sm:text-sm text-white/80 mb-4 sm:mb-6 px-2">
                Email của bạn đã được xác thực. Đang chuyển đến trang đăng nhập...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <LoadingOverlay message="Đang xác thực..." />
          </div>
        )}
      </AnimatePresence>

      {/* Desktop: Card component */}
      <div className="flex justify-center items-start px-4 sm:px-6 md:px-8 pt-20 sm:pt-16 md:pt-20 pb-8 min-h-screen">
        <Card className="relative w-full max-w-[480px] rounded-xl sm:rounded-[20px] border border-white/10 bg-[#0E5188]/4 backdrop-blur-md shadow-[0_6px_25px_-8px_rgba(0,0,0,0.0001)] hidden sm:block">
          <div className="absolute top-0 left-0 right-0 h-32 sm:h-40 bg-linear-to-b from-[#0E5188]/0.0000001 to-transparent rounded-t-xl sm:rounded-t-[20px] pointer-events-none" />
          <CardContent className="relative p-6 sm:p-8">
            {/* Logo */}
            <div className="hidden sm:block mx-auto mb-4 sm:mb-6">
              <LogoAuth />
            </div>

            <h1 className="text-lg sm:text-xl font-semibold text-center text-white mb-2">
              Xác thực Email
            </h1>
            <p className="mb-6 sm:mb-8 text-xs sm:text-sm text-center text-white/80 px-2">
              Chúng tôi đã gửi mã xác thực 6 chữ số đến email{" "}
              <span className="text-[#10C0C5] font-medium">
                {email || "của bạn"}
              </span>
            </p>

            <form onSubmit={handleVerify} className="space-y-4 sm:space-y-5">
              <div>
                <label
                  htmlFor="code-desktop"
                  className="block mb-1 text-xs font-medium text-white/90"
                >
                  Mã xác thực
                </label>
                <div
                  className={cn(
                    "flex h-10 sm:h-11 items-center gap-2 rounded-lg sm:rounded-xl border px-3",
                    error
                      ? "border-red-500 bg-red-500/10"
                      : "border-white/15 bg-black/40"
                  )}
                >
                  <Mail className="w-4 h-4 text-white/80 flex-shrink-0" />
                  <Input
                    id="code-desktop"
                    type="text"
                    value={code}
                    onChange={handleCodeChange}
                    placeholder="000000"
                    maxLength={6}
                    disabled={isLoading}
                    className="flex-1 p-0 h-full m-0 text-white bg-transparent border-0 placeholder:text-white/60 focus-visible:ring-0 focus-visible:outline-none text-center text-lg sm:text-xl tracking-widest font-mono"
                  />
                </div>
                {error && (
                  <p className="mt-1 text-xs text-red-500">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-10 sm:h-11 bg-[#10C0C5] hover:bg-[#0ea5a9] text-white font-medium text-sm sm:text-base rounded-lg sm:rounded-xl transition-colors"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? "Đang xác thực..." : "Xác thực"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || countdown > 0}
                  className="text-[#10C0C5] hover:text-[#0ea5a9] text-xs disabled:text-white/40 disabled:cursor-not-allowed flex items-center gap-2 mx-auto transition-colors"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`}
                  />
                  {countdown > 0
                    ? `Gửi lại sau ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}`
                    : "Gửi lại mã xác thực"}
                </button>
              </div>

              <div className="text-center pt-2">
                <Link
                  href={`/${locale}/auth/signup`}
                  className="text-white/60 hover:text-[#10C0C5] text-xs flex items-center gap-2 justify-center transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại đăng ký
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Mobile: Layout */}
        <div className="relative w-full max-w-[480px] sm:hidden">
          {/* Logo Section */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <LogoAuth />
          </div>

          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-lg sm:text-xl font-semibold text-center text-white mb-1">
              Xác thực Email
            </h1>
            <p className="text-xs sm:text-sm text-center text-white/80 leading-relaxed px-2">
              Chúng tôi đã gửi mã xác thực 6 chữ số đến email{" "}
              <span className="text-[#10C0C5] font-medium">
                {email || "của bạn"}
              </span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-4 sm:space-y-5">
            <div>
              <label
                htmlFor="code-mobile"
                className="block mb-1 text-xs font-medium text-white/90"
              >
                Mã xác thực
              </label>
              <div
                className={cn(
                  "flex h-10 sm:h-11 items-center gap-2 rounded-lg sm:rounded-xl border px-3",
                  error
                    ? "border-red-500 bg-red-500/10"
                    : "border-white/15 bg-black/40"
                )}
              >
                <Mail className="w-4 h-4 text-white/80 flex-shrink-0" />
                <Input
                  id="code-mobile"
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="000000"
                  maxLength={6}
                  disabled={isLoading}
                  className="flex-1 p-0 h-full m-0 text-white bg-transparent border-0 placeholder:text-white/60 focus-visible:ring-0 focus-visible:outline-none text-center text-lg sm:text-xl tracking-widest font-mono"
                />
              </div>
              {error && (
                <p className="mt-1 text-xs text-red-500">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-10 sm:h-11 bg-[#10C0C5] hover:bg-[#0ea5a9] text-white font-medium text-sm sm:text-base rounded-lg sm:rounded-xl transition-colors"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? "Đang xác thực..." : "Xác thực"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || countdown > 0}
                className="text-[#10C0C5] hover:text-[#0ea5a9] text-xs disabled:text-white/40 disabled:cursor-not-allowed flex items-center gap-2 mx-auto transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`}
                />
                {countdown > 0
                  ? `Gửi lại sau ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}`
                  : "Gửi lại mã xác thực"}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link
                href={`/${locale}/auth/signup`}
                className="text-white/60 hover:text-[#10C0C5] text-xs flex items-center gap-2 justify-center transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại đăng ký
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

