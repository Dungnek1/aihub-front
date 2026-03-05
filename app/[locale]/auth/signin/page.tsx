"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { AnimatePresence } from "framer-motion";
import LoadingOverlay from "@/components/LoadingOverlay";
import LogoAuth from "@/components/auth/LogoAuth";
import { useAuth } from "@/contexts/AuthContext";
import { LoginCredentials } from "@/services/client/auth.client";

function SignInContent() {
  const t = useTranslations("Auth.signIn");
  const [showPw, setShowPw] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRememberChecked, setIsRememberChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    usernameOrEmail?: string;
    password?: string;
  }>({});
  const [touched, setTouched] = useState<{
    usernameOrEmail?: boolean;
    password?: boolean;
  }>({});
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  // Load Remember Me credentials on mount - only load username/email (NOT password for security)
  useEffect(() => {
    try {
      const remember = localStorage.getItem("auth.remember");
      // Only load if remember is explicitly "true" and credentials exist
      if (remember === "true") {
        const raw = localStorage.getItem("auth.remember.credentials");
        if (raw) {
          try {
            const creds = JSON.parse(raw) as {
              usernameOrEmail?: string;
            };
            // Only fill username/email if we have valid credentials
            // Password is NOT saved for security reasons
            if (creds.usernameOrEmail) {
              setUsernameOrEmail(creds.usernameOrEmail);
              setPassword(""); // Always clear password - user must enter it
              setIsRememberChecked(true);
              return; // Exit early if successfully loaded
            }
          } catch {
            // If parsing fails, clear localStorage
            localStorage.removeItem("auth.remember");
            localStorage.removeItem("auth.remember.credentials");
          }
        } else {
          // If remember is true but no credentials, clear it
          localStorage.removeItem("auth.remember");
        }
      }
      // If we reach here, there's no valid remember data
      // Clear form fields to prevent browser autocomplete
      setUsernameOrEmail("");
      setPassword("");
      setIsRememberChecked(false);
    } catch {
      // ignore read errors
      setUsernameOrEmail("");
      setPassword("");
      setIsRememberChecked(false);
    }
  }, []);

  // Auto-fill username/email
  useEffect(() => {
    const prefill =
      searchParams.get("prefill") ||
      searchParams.get("email") ||
      searchParams.get("username");
    if (prefill) setUsernameOrEmail(decodeURIComponent(prefill));
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: { usernameOrEmail?: string; password?: string } = {};

    if (!usernameOrEmail) {
      newErrors.usernameOrEmail = t("usernameOrEmailRequired");
    } else if (
      usernameOrEmail.includes("@") &&
      !/\S+@\S+\.\S+/.test(usernameOrEmail)
    ) {
      // Validate as email
      newErrors.usernameOrEmail = t("emailRequired");
    } else if (!usernameOrEmail.includes("@") && usernameOrEmail.length < 3) {
      // Validate as username (minimum 3 characters)
      newErrors.usernameOrEmail = t("usernameMinLength");
    }

    if (!password) {
      newErrors.password = t("passwordRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateField = (field: string, value: string) => {
    if (!touched[field as keyof typeof touched]) return;

    const newErrors = { ...errors };
    if (field === "usernameOrEmail") {
      if (!value) {
        newErrors.usernameOrEmail = t("usernameOrEmailRequired");
      } else if (value.includes("@") && !/\S+@\S+\.\S+/.test(value)) {
        newErrors.usernameOrEmail = t("emailRequired");
      } else if (!value.includes("@") && value.length < 3) {
        newErrors.usernameOrEmail = t("usernameMinLength");
      } else {
        delete newErrors.usernameOrEmail;
      }
    }

    if (field === "password") {
      if (value) {
        delete newErrors.password;
      } else {
        newErrors.password = t("passwordRequired");
      }
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const credentials: LoginCredentials = {
        usernameOrEmail,
        password,
      };
      
      await login(credentials);

      // Handle Remember Me persistence - only save username/email (NOT password for security)
      try {
        if (isRememberChecked) {
          localStorage.setItem("auth.remember", "true");
          localStorage.setItem(
            "auth.remember.credentials",
            JSON.stringify({ usernameOrEmail }) // Only save username/email, not password
          );
        } else {
          localStorage.removeItem("auth.remember");
          localStorage.removeItem("auth.remember.credentials");
        }
      } catch {
        // ignore storage errors
      }
      // Redirect to home page
      router.push(`/${locale}`);
    } catch (error: any) {
      console.error("Sign in error:", error);
      setErrors({ password: error.message || t("invalidCredentials") });
    } finally {
      setIsLoading(false);
    }
  };

  // When user toggles Remember Me off, clear stored credentials
  useEffect(() => {
    try {
      if (!isRememberChecked) {
        // Clear localStorage immediately
        localStorage.removeItem("auth.remember");
        localStorage.removeItem("auth.remember.credentials");
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRememberChecked]);

  const handleGoogleSignIn = async () => {
    // TODO: Implement Google sign in if needed
    setIsLoading(true);
    try {
      // await signIn("google", { callbackUrl: `/${locale}` });
      console.log("Google sign in not implemented yet");
    } catch (error) {
      console.error("Google sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <LoadingOverlay message={t("signingIn")} />
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex justify-center items-start px-4 pt-30 sm:pt-16 pb-8 min-h-screen">
        {/* Desktop: Card component - giữ nguyên */}
        <Card className="relative w-full max-w-[480px] rounded-[20px] border border-white/10 bg-[#0E5188]/4 backdrop-blur-md shadow-[0_6px_25px_-8px_rgba(0,0,0,0.0001)] hidden sm:block">
          <div className="absolute top-0 left-0 right-0 h-40 bg-linear-to-b from-[#0E5188]/0.0000001 to-transparent rounded-t-[20px] pointer-events-none" />
          <CardContent className="relative p-8">
            {/* Logo - Hidden on mobile */}
            <div className="hidden sm:block mx-auto mb-6">
              <LogoAuth />
            </div>
            <h1 className="text-xl font-semibold text-center text-white">
              {t("title")}
            </h1>
            <p className="mb-8 text-sm text-center text-white/80">
              {t("subtitle")}
            </p>
            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
              autoComplete={isRememberChecked ? "on" : "off"}
            >
              <div>
                <label
                  htmlFor="usernameOrEmail-desktop"
                  className="block mb-1 text-xs font-medium text-white/90"
                >
                  {t("emailLabel")}
                </label>
                <div
                  className={cn(
                    "flex h-11 items-center gap-2 rounded-xl border px-3",
                    errors.usernameOrEmail
                      ? "border-red-500 bg-red-500/10"
                      : "border-white/15 bg-black/40"
                  )}
                >
                  <Mail className="w-4 h-4 text-white/80 flex-shrink-0" />
                  <Input
                    id="usernameOrEmail-desktop"
                    type="text"
                    name="usernameOrEmail"
                    autoComplete={isRememberChecked ? "username email" : "off"}
                    value={usernameOrEmail}
                    onChange={(e) => {
                      setUsernameOrEmail(e.target.value);
                      setTouched((prev) => ({
                        ...prev,
                        usernameOrEmail: true,
                      }));
                      validateField("usernameOrEmail", e.target.value);
                    }}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, usernameOrEmail: true }))
                    }
                    placeholder={t("emailPlaceholder")}
                    className="flex-1 p-0 h-full m-0 text-white bg-transparent border-0 placeholder:text-white/60 focus-visible:ring-0 focus-visible:outline-none"
                  />
                </div>
                {errors.usernameOrEmail && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.usernameOrEmail}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="password-desktop"
                  className="block mb-1 text-xs font-medium text-white/90"
                >
                  {t("passwordLabel")}
                </label>
                <div
                  className={cn(
                    "flex h-11 items-center gap-2 rounded-xl border px-3",
                    errors.password
                      ? "border-red-500 bg-red-500/10"
                      : "border-white/15 bg-black/40"
                  )}
                >
                  <Lock className="w-4 h-4 text-white/80 flex-shrink-0" />
                  <Input
                    id="password-desktop"
                    type={showPw ? "text" : "password"}
                    name="password"
                    autoComplete={
                      isRememberChecked ? "current-password" : "new-password"
                    }
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setTouched((prev) => ({ ...prev, password: true }));
                      validateField("password", e.target.value);
                    }}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, password: true }))
                    }
                    placeholder={t("passwordPlaceholder")}
                    className="flex-1 p-0 h-full m-0 text-white bg-transparent border-0 placeholder:text-white/60 focus-visible:ring-0 focus-visible:outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Toggle password"
                    onClick={() => setShowPw((s) => !s)}
                    className="inline-flex justify-center items-center p-1 flex-shrink-0 rounded-md cursor-pointer text-white/70 hover:opacity-90"
                  >
                    {showPw ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>
              {/* Remember/Forgot */}
              <div className="flex justify-between items-center mt-6 mb-6 text-xs">
                <label className="flex gap-3 items-center cursor-pointer text-white/85 group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isRememberChecked}
                      onChange={(e) => setIsRememberChecked(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`h-4 w-4 rounded border transition-all duration-300 ${
                        isRememberChecked
                          ? "border-[#10C0C5] bg-[#10C0C5] shadow-lg shadow-[#10C0C5]/25"
                          : "border-white/50 bg-transparent group-hover:border-[#10C0C5] group-hover:bg-[#10C0C5]/10"
                      }`}
                    >
                      <div
                        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                          isRememberChecked
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
                        }`}
                      >
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`transition-colors duration-200 ${
                      isRememberChecked
                        ? "text-white"
                        : "group-hover:text-white"
                    }`}
                  >
                    {t("rememberMe")}
                  </span>
                </label>
                <Link
                  href={`/${locale}/auth/forgot-password`}
                  className="text-cyan-200 underline transition-colors underline-offset-4 hover:text-cyan-100"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              {/* Actions */}
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className={cn(
                  "mb-3 h-12 w-full rounded-xl cursor-pointer",
                  "bg-[#10C0C5] text-white text-[15px] font-semibold",
                  "transition-all duration-200",
                  "hover:bg-white hover:text-black hover:shadow-lg",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? t("signingIn") : t("signInButton")}
              </Button>
            </form>
            {/* Divider */}
            <div className="flex gap-4 items-center my-3 text-xs text-white/70">
              <div className="flex-1 h-px bg-white/30" />
              <span>{t("continueWith")}</span>
              <div className="flex-1 h-px bg-white/30" />
            </div>
            {/* Google */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="
               mt-3 mb-3 flex w-full items-center justify-center gap-3
               rounded-xl border border-white/20 bg-transparent
               px-5 py-[18px] text-white/90 cursor-pointer
               transition-all duration-300
               hover:bg-white/80 hover:text-[#111]
               disabled:opacity-50 disabled:cursor-not-allowed
             "
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-[15px] font-medium">
                {isLoading ? t("signingIn") : t("continueGoogle")}
              </span>
            </button>
            {/* Continue as Guest */}
            <button
              onClick={() => {
                try {
                  localStorage.setItem("continueAsGuest", "true");
                  if (typeof window !== "undefined") {
                    const url = new URL(window.location.href);
                    url.searchParams.delete("callbackUrl");
                    url.searchParams.delete("error");
                    window.history.replaceState({}, "", url.toString());
                  }
                } catch {}
                router.replace(`/${locale}`);
              }}
              disabled={isLoading}
              className="
               mb-8 flex w-full items-center justify-center gap-3
               rounded-xl border border-white/10 bg-transparent
               px-5 py-[18px] text-white/70 cursor-pointer
               transition-all duration-300
               hover:border-white/30 hover:bg-white/10 hover:text-white
               disabled:opacity-50 disabled:cursor-not-allowed
             "
            >
              <span className="text-[15px] font-medium">
                {t("continueAsGuest")}
              </span>
            </button>
            {/* Sign up */}
            <p className="text-xs text-center text-white/80">
              {t("noAccount")}{" "}
              <Link
                href={`/${locale}/auth/signup`}
                className="text-cyan-200 underline transition-colors underline-offset-4 hover:text-cyan-100"
              >
                {t("signUp")}
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Mobile: Layout với spacing chính xác - ONLY MOBILE */}
        <div className="relative w-full max-w-[480px] sm:hidden">
          {/* Logo Section - spacing rất lớn để cách xa form */}
          <div className="flex justify-center mb-8">
            <LogoAuth />
          </div>

          {/* Welcome Section - spacing lớn hơn */}
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-center text-white mb-1">
              {t("title")}
            </h1>
            <p className="text-sm text-center text-white/80 leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-[10px]"
            autoComplete={isRememberChecked ? "on" : "off"}
          >
            {/* Email Field - padding left/right 14px */}
            <div>
              <label
                htmlFor="usernameOrEmail-mobile"
                className="block mb-1 text-xs font-medium text-white/90"
              >
                {t("emailLabel")}
              </label>
              <div
                className={cn(
                  "flex h-11 items-center gap-2 rounded-xl border px-[14px]",
                  errors.usernameOrEmail
                    ? "border-red-500 bg-red-500/10"
                    : "border-white/15 bg-black/40"
                )}
              >
                <Mail className="w-4 h-4 text-white/80 flex-shrink-0" />
                <Input
                  id="usernameOrEmail-mobile"
                  type="text"
                  name="usernameOrEmail"
                  autoComplete={isRememberChecked ? "username email" : "off"}
                  value={usernameOrEmail}
                  onChange={(e) => {
                    setUsernameOrEmail(e.target.value);
                    setTouched((prev) => ({
                      ...prev,
                      usernameOrEmail: true,
                    }));
                    validateField("usernameOrEmail", e.target.value);
                  }}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, usernameOrEmail: true }))
                  }
                  placeholder={t("emailPlaceholder")}
                  className="flex-1 p-0 h-full m-0 text-white bg-transparent border-0 placeholder:text-white/60 focus-visible:ring-0 focus-visible:outline-none"
                />
              </div>
              {errors.usernameOrEmail && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.usernameOrEmail}
                </p>
              )}
            </div>

            {/* Password Field - padding left/right 14px, spacing 10px above */}
            <div>
              <label
                htmlFor="password-mobile"
                className="block mb-1 text-xs font-medium text-white/90"
              >
                {t("passwordLabel")}
              </label>
              <div
                className={cn(
                  "flex h-11 items-center gap-2 rounded-xl border px-[14px]",
                  errors.password
                    ? "border-red-500 bg-red-500/10"
                    : "border-white/15 bg-black/40"
                )}
              >
                <Lock className="w-4 h-4 text-white/80 flex-shrink-0" />
                <Input
                  id="password-mobile"
                  type={showPw ? "text" : "password"}
                  name="password"
                  autoComplete={
                    isRememberChecked ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setTouched((prev) => ({ ...prev, password: true }));
                    validateField("password", e.target.value);
                  }}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, password: true }))
                  }
                  placeholder={t("passwordPlaceholder")}
                  className="flex-1 p-0 h-full m-0 text-white bg-transparent border-0 placeholder:text-white/60 focus-visible:ring-0 focus-visible:outline-none"
                />
                <button
                  type="button"
                  aria-label="Toggle password"
                  onClick={() => setShowPw((s) => !s)}
                  className="inline-flex justify-center items-center p-1 flex-shrink-0 rounded-md cursor-pointer text-white/70 hover:opacity-90"
                >
                  {showPw ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Remember/Forgot - spacing 12px above and below */}
            <div className="flex justify-between items-center pt-3 pb-3 text-xs">
              <label className="flex gap-3 items-center cursor-pointer text-white/85 group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isRememberChecked}
                    onChange={(e) => setIsRememberChecked(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`h-4 w-4 rounded border transition-all duration-300 ${
                      isRememberChecked
                        ? "border-[#10C0C5] bg-[#10C0C5] shadow-lg shadow-[#10C0C5]/25"
                        : "border-white/50 bg-transparent group-hover:border-[#10C0C5] group-hover:bg-[#10C0C5]/10"
                    }`}
                  >
                    <div
                      className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                        isRememberChecked
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
                      }`}
                    >
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <span
                  className={`transition-colors duration-200 ${
                    isRememberChecked ? "text-white" : "group-hover:text-white"
                  }`}
                >
                  {t("rememberMe")}
                </span>
              </label>
              <Link
                href={`/${locale}/auth/forgot-password`}
                className="text-cyan-200 underline transition-colors underline-offset-4 hover:text-cyan-100"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            {/* Sign In Button - padding left/right 18px, spacing-lg (24px) above and below */}
            <div className="pt-6 pb-6">
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className={cn(
                  "h-12 w-full rounded-xl cursor-pointer px-[18px]",
                  "bg-linear-to-b from-[#00FFD1] to-[#00C8FF] text-[#0B5A5C] text-[15px] font-semibold",
                  "transition-all duration-200",
                  "hover:bg-white hover:text-black hover:shadow-lg",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? t("signingIn") : t("signInButton")}
              </Button>
            </div>
          </form>

          {/* Separator - spacing 16px above */}
          <div className="flex gap-4 items-center pt-4 text-xs text-white/70">
            <div className="flex-1 h-px bg-white/30" />
            <span>{t("continueWith")}</span>
            <div className="flex-1 h-px bg-white/30" />
          </div>

          {/* Google Button - spacing 16px above */}
          <div className="pt-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="
               flex w-full items-center justify-center gap-3
               rounded-xl border border-white/20 bg-transparent
               px-5 py-[18px] text-white/90 cursor-pointer
               transition-all duration-300
               hover:bg-white/80 hover:text-[#111]
               disabled:opacity-50 disabled:cursor-not-allowed
             "
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-[15px] font-medium">
                {isLoading ? t("signingIn") : t("continueGoogle")}
              </span>
            </button>
          </div>

          {/* Continue as Guest - spacing 16px above */}
          <div className="pt-4">
            <button
              onClick={() => {
                try {
                  localStorage.setItem("continueAsGuest", "true");
                  if (typeof window !== "undefined") {
                    const url = new URL(window.location.href);
                    url.searchParams.delete("callbackUrl");
                    url.searchParams.delete("error");
                    window.history.replaceState({}, "", url.toString());
                  }
                } catch {}
                router.replace(`/${locale}`);
              }}
              disabled={isLoading}
              className="
               flex w-full items-center justify-center gap-3
               rounded-xl border border-white/10 bg-transparent
               px-5 py-[18px] text-white/70 cursor-pointer
               transition-all duration-300
               hover:border-white/30 hover:bg-white/10 hover:text-white
               disabled:opacity-50 disabled:cursor-not-allowed
             "
            >
              <span className="text-[15px] font-medium">
                {t("continueAsGuest")}
              </span>
            </button>
          </div>

          {/* Sign Up Link - spacing 8px between text and link, bottom spacing 46.22px */}
          <div className="pt-4 pb-[46.22px]">
            <p className="text-xs text-center text-white/80">
              {t("noAccount")}{" "}
              <Link
                href={`/${locale}/auth/signup`}
                className="text-cyan-200 underline transition-colors underline-offset-4 hover:text-cyan-100 ml-2"
              >
                {t("signUp")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-8 h-8 rounded-full border-b-2 border-cyan-400 animate-spin"></div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
