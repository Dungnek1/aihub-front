"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Camera,
  Check,
  X,
  Phone,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LogoAuth from "@/components/auth/LogoAuth";
import { AnimatePresence } from "framer-motion";
import LoadingOverlay from "@/components/LoadingOverlay";

// Password Requirements Component
function PasswordRequirements({ password, isVisible }: Readonly<{ password: string; isVisible: boolean }>) {
  if (!isVisible) return null;

  const requirements = [
    {
      test: password.length >= 8 && password.length <= 20,
      text: "Password must be between 8 and 20 characters"
    },
    {
      test: /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password),
      text: "Include numbers, uppercase letters, lowercase letters"
    },
    {
      test: /[!@#$^*()_]/.test(password),
      text: "Include at least one special character !@#$^*()_"
    }
  ];

  return (
    <div className="mt-2 space-y-1">
      {requirements.map((req) => (
        <div key={req.text} className={`flex items-center gap-2 text-xs ${req.test ? "text-green-400" : "text-red-400"}`}>
          {req.test ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          {req.text}
        </div>
      ))}
    </div>
  );
}

// Form Input Component
function FormInput({
  id,
  label,
  type,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  icon: Icon,
  showPassword,
  onTogglePassword,
  showRequirements = false,
  name,
  autoComplete
}: Readonly<{
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  error?: string;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  showRequirements?: boolean;
  name?: string;
  autoComplete?: string;
}>) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-white/90">
        {label}
      </label>
      <div className={`flex h-11 items-center gap-2 rounded-xl border px-[14px] sm:px-3 ${error ? "border-red-500 bg-red-500/10" : "border-white/15 bg-black/40"}`}>
        <Icon className="h-4 w-4 text-white/80 flex-shrink-0" />
        <Input
          id={id}
          type={type}
          name={name}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className="flex-1 p-0 h-full m-0 text-white bg-transparent border-0 placeholder:text-white/60 focus-visible:ring-0 focus-visible:outline-none"
        />
        {onTogglePassword && (
          <button
            type="button"
            aria-label={`Toggle ${label.toLowerCase()}`}
            onClick={onTogglePassword}
            className="flex-shrink-0 inline-flex items-center justify-center rounded-md p-1 text-white/70 hover:opacity-90 cursor-pointer"
          >
            {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        )}
      </div>
      {showRequirements && <PasswordRequirements password={value} isVisible={true} />}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Validation hook
function useValidation(t: (key: string) => string) {
  const validateForm = (formData: { username: string; fullName: string; email: string; password: string; confirmPassword: string; phone?: string }) => {
    const errors: { username?: string; fullName?: string; email?: string; password?: string; confirmPassword?: string; phone?: string } = {};

    if (!formData.username) {
      errors.username = t('usernameRequired');
    } else if (formData.username.length < 3) {
      errors.username = t('usernameMinLength');
    }

    if (!formData.fullName) {
      errors.fullName = t('fullNameRequired');
    }

    if (!formData.email) {
      errors.email = t('emailRequired');
    } else if (/\S+@\S+\.\S+/.test(formData.email)) {
      delete errors.email;
    } else {
      errors.email = t('emailRequired');
    }

    if (!formData.password) {
      errors.password = t('passwordRequired');
    } else if (formData.password.length < 8 || formData.password.length > 20) {
      errors.password = t('passwordLength');
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = t('passwordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('passwordMatch');
    }

    // Vietnamese phone validation: accepts 03x, 05x, 07x, 08x, 09x formats
    if (formData.phone && !/^(\+84|84|0)?[35789]\d{8}$/.test(formData.phone.replaceAll(/[\s-()]/g, ''))) {
      errors.phone = t('phoneInvalid');
    }

    return errors;
  };

  const validateSingleField = (field: string, value: string, password?: string) => {
    const validators = {
      username: () => {
        if (!value) return t('usernameRequired');
        return value.length >= 3 ? undefined : t('usernameMinLength');
      },
      fullName: () => value ? undefined : t('fullNameRequired'),
      email: () => {
        if (!value) return t('emailRequired');
        return /\S+@\S+\.\S+/.test(value) ? undefined : t('emailRequired');
      },
      password: () => {
        if (!value) return t('passwordRequired');
        return value.length >= 8 && value.length <= 20 ? undefined : t('passwordLength');
      },
      confirmPassword: () => {
        if (!value) return t('passwordRequired');
        return password === value ? undefined : t('passwordMatch');
      },
      phone: () => {
        if (!value) return undefined; // Phone is optional
        // Vietnamese phone validation: accepts 03x, 05x, 07x, 08x, 09x formats
        return /^(\+84|84|0)?[35789]\d{8}$/.test(value.replaceAll(/[\s-()]/g, '')) ? undefined : t('phoneInvalid');
      }
    };

    return validators[field as keyof typeof validators]?.() || undefined;
  };

  const validateField = (field: string, value: string, touched: Record<string, boolean>, errors: Record<string, string>, password?: string) => {
    if (!touched[field]) return errors;

    const newErrors = { ...errors };
    const fieldError = validateSingleField(field, value, password);

    if (fieldError) {
      newErrors[field] = fieldError;
    } else {
      delete newErrors[field];
    }

    return newErrors;
  };

  return { validateForm, validateField };
}

export default function SignUpPage() {
  const t = useTranslations('Auth.signUp');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    phone?: string;
  }>({});
  const [touched, setTouched] = useState<{
    username?: boolean;
    fullName?: boolean;
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
    phone?: boolean;
  }>({});
  const locale = useLocale();
  const router = useRouter();
  const { validateForm, validateField } = useValidation(t);
  const { register } = useAuth();

  // Avatar upload states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure signup form is always empty when opened
  useEffect(() => {
    setUsername("");
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setPhone("");
    setIsTermsChecked(false);
    setAvatarFile(null);
    setAvatarPreviewUrl(null);
    setUploadedAvatarUrl(null);
    setAvatarUploadError(null);
  }, []);

  // Cleanup blob URL when component unmounts or avatar changes
  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  // Avatar upload handler
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setAvatarUploadError(t('invalidImageFormat'));
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setAvatarUploadError(t('fileTooLarge'));
      return;
    }

    // Clear previous errors
    setAvatarUploadError(null);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreviewUrl(previewUrl);

    // Upload immediately
    setIsUploadingAvatar(true);
    try {
      // Use uploadPublicImage from media service
      const { uploadPublicImage } = await import('@/services/server/media.service');

      const response = await uploadPublicImage({
        file,
        type: 'avatar',
        folderType: 'user',
      });

      // Extract URL from response
      const imageData = response.data || response;
      const uploadedUrl = imageData?.filename || imageData?.url;

      if (!uploadedUrl) {
        throw new Error('No URL returned from upload');
      }

      // Store the uploaded URL
      setUploadedAvatarUrl(uploadedUrl);
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      setAvatarUploadError(t('avatarUploadError'));
      // Clear preview if upload failed
      setAvatarFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setAvatarPreviewUrl(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors = validateForm({ username, fullName, email, password, confirmPassword, phone });
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0 || !isTermsChecked) return;

    setIsLoading(true);
    debugger;
    try {
      const result = await register({
        username,
        email,
        password,
        name: fullName,
        phone: phone || undefined,
        avatarUrl: uploadedAvatarUrl || undefined,
      });

      // Backend response structure: { timestamp, message, data: { user: { userId } } }
      const userId = result?.data?.user?.userId;


      if (userId) {
        sessionStorage.setItem("verify_userId", userId);
        sessionStorage.setItem("verify_email", email);
        // Redirect to verify email page
        router.push(`/${locale}/auth/verify-email?userId=${userId}&email=${encodeURIComponent(email)}`);
      } else {
        // Fallback: redirect to verify page anyway
        router.push(`/${locale}/auth/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage = error instanceof Error ? error.message : t('errorOccurred');
      setErrors({ email: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

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
            <LoadingOverlay message={t('creatingAccount')} />
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen items-start justify-center px-4 pt-30 sm:pt-16 pb-8">
        {/* Desktop: Card component - giữ nguyên */}
        <Card className="relative w-full max-w-[480px] rounded-[20px] border border-white/10 bg-[#0E5188]/4 backdrop-blur-md shadow-[0_6px_25px_-8px_rgba(0,0,0,0.0001)] hidden sm:block">
          <div className="absolute top-0 left-0 right-0 h-40 bg-linear-to-b from-[#0E5188]/0.0000001 to-transparent rounded-t-[20px] pointer-events-none" />
          <CardContent className="relative p-8">
            {/* Logo - Hidden on mobile */}
            <div className="hidden sm:block mx-auto mb-6">
              <LogoAuth />
            </div>

            <h1 className="text-center text-xl font-semibold text-white">
              {t('title')}
            </h1>
            <p className="mb-6 text-center text-sm text-white/80">
              {t('subtitle')}
            </p>

            {/* Avatar */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700 ring-2 ring-[#10C0C5] overflow-hidden">
                {avatarPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreviewUrl}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-white/60" />
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="flex h-10 items-center gap-2 rounded-lg border border-[#10C0C5] bg-transparent px-4 text-[#10C0C5] hover:bg-[#10C0C5] hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingAvatar ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm font-medium">{t('uploadingAvatar')}</span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      <span className="text-sm font-medium">{t('uploadAvatar')}</span>
                    </>
                  )}
                </button>
                {avatarUploadError && (
                  <p className="mt-1 text-xs text-red-500">{avatarUploadError}</p>
                )}
              </div>
            </div>
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-5" autoComplete="off">
              <FormInput
                id="username"
                label={t('usernameLabel')}
                type="text"
                name="new-username"
                autoComplete="off"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setTouched((prev) => ({ ...prev, username: true }));
                  const newErrors = validateField("username", e.target.value, touched, errors);
                  setErrors(newErrors);
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, username: true }))}
                error={errors.username}
                placeholder={t('usernamePlaceholder')}
                icon={User}
              />

              <FormInput
                id="fullName"
                label={t('fullNameLabel')}
                type="text"
                name="new-fullname"
                autoComplete="off"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setTouched((prev) => ({ ...prev, fullName: true }));
                  const newErrors = validateField("fullName", e.target.value, touched, errors);
                  setErrors(newErrors);
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
                error={errors.fullName}
                placeholder={t('fullNamePlaceholder')}
                icon={User}
              />

              <FormInput
                id="email"
                label={t('emailLabel')}
                type="email"
                name="new-email"
                autoComplete="off"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setTouched((prev) => ({ ...prev, email: true }));
                  const newErrors = validateField("email", e.target.value, touched, errors);
                  setErrors(newErrors);
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                error={errors.email}
                placeholder={t('emailPlaceholder')}
                icon={Mail}
              />

              <FormInput
                id="password"
                label={t('passwordLabel')}
                type={showPw ? "text" : "password"}
                name="new-password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setTouched((prev) => ({ ...prev, password: true }));
                  const newErrors = validateField("password", e.target.value, touched, errors);
                  setErrors(newErrors);
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                error={errors.password}
                placeholder={t('passwordPlaceholder')}
                icon={Lock}
                showPassword={showPw}
                onTogglePassword={() => setShowPw((s) => !s)}
                showRequirements={touched.password}
              />

              <FormInput
                id="confirmPassword"
                label={t('confirmPasswordLabel')}
                type={showConfirmPw ? "text" : "password"}
                name="new-password-confirm"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setTouched((prev) => ({ ...prev, confirmPassword: true }));
                  const newErrors = validateField("confirmPassword", e.target.value, touched, errors, password);
                  setErrors(newErrors);
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
                error={errors.confirmPassword}
                placeholder={t('confirmPasswordPlaceholder')}
                icon={Lock}
                showPassword={showConfirmPw}
                onTogglePassword={() => setShowConfirmPw((s) => !s)}
              />

              <FormInput
                id="phone"
                label={t('phoneLabel')}
                type="tel"
                name="new-phone"
                autoComplete="off"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setTouched((prev) => ({ ...prev, phone: true }));
                  const newErrors = validateField("phone", e.target.value, touched, errors);
                  setErrors(newErrors);
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                error={errors.phone}
                placeholder={t('phonePlaceholder')}
                icon={Phone}
              />
              {/* Terms */}
              <div className="mt-6 mb-6 flex items-center justify-between text-xs">
                <label className="flex items-center gap-3 text-white/85 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isTermsChecked}
                      onChange={(e) => setIsTermsChecked(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`h-4 w-4 rounded border transition-all duration-300 ${isTermsChecked
                        ? "border-[#10C0C5] bg-[#10C0C5] shadow-lg shadow-[#10C0C5]/25"
                        : "border-white/50 bg-transparent group-hover:border-[#10C0C5] group-hover:bg-[#10C0C5]/10"
                        }`}
                    >
                      <div
                        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isTermsChecked
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
                          }`}
                      >
                        <svg
                          className="h-3 w-3 text-white"
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
                    className={`transition-colors duration-200 ${isTermsChecked ? "text-white" : "group-hover:text-white"
                      }`}
                  >
                    {t('agreeTerms')}{" "}
                    <Link
                      href="#"
                      className="text-[#10C0C5] underline underline-offset-4 hover:text-[#10C0C5]/80 transition-colors duration-200"
                    >
                      {t('terms')}
                    </Link>{" "}
                    {t('and')}{" "}
                    <Link
                      href="#"
                      className="text-[#10C0C5] underline underline-offset-4 hover:text-[#10C0C5]/80 transition-colors duration-200"
                    >
                      {t('privacyPolicy')}
                    </Link>
                  </span>
                </label>
              </div>
              {/* Actions */}
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className="
                  mb-3 h-12 w-full rounded-xl cursor-pointer
                  bg-[#10C0C5]
                  text-white text-[15px] font-semibold
                  transition-all duration-200
                  hover:bg-white hover:text-black hover:shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {isLoading ? t('creatingAccount') : t('signUpButton')}
              </Button>
            </form>
            {/* Divider */}
            <div className="my-3 flex items-center gap-4 text-xs text-white/70">
              <div className="h-px flex-1 bg-white/30" />
              <span>{t('continueWith')}</span>
              <div className="h-px flex-1 bg-white/30" />
            </div>
            {/* Google */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="
                 mt-3 mb-8 flex w-full items-center justify-center gap-3
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
                {isLoading ? t('signingUp') : t('continueGoogle')}
              </span>
            </button>
            {/* Switch */}
            <p className="text-center text-xs text-white/80">
              {t('hasAccount')}{" "}
              <Link
                href={`/${locale}/auth/signin`}
                className="text-cyan-200 underline underline-offset-4 transition-colors hover:text-cyan-100"
              >
                {t('signIn')}
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Mobile: Layout với spacing chính xác - ONLY MOBILE */}
        <div className="relative w-full max-w-[480px] sm:hidden">
          {/* Logo Section - spacing lớn để cách xa form */}
          <div className="flex justify-center mb-8">
            <LogoAuth />
          </div>

          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-center text-xl font-semibold text-white">
              {t('title')}
            </h1>
            <p className="mb-6 text-center text-sm text-white/80">
              {t('subtitle')}
            </p>
          </div>

          {/* Avatar */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700 ring-2 ring-[#10C0C5] overflow-hidden">
              {avatarPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreviewUrl}
                  alt="Avatar preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-white/60" />
              )}
            </div>
            <div className="flex-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="flex h-10 items-center gap-2 rounded-lg border border-[#10C0C5] bg-transparent px-4 text-[#10C0C5] hover:bg-[#10C0C5] hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingAvatar ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span className="text-sm font-medium">{t('uploadingAvatar')}</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('uploadAvatar')}</span>
                  </>
                )}
              </button>
              {avatarUploadError && (
                <p className="mt-1 text-xs text-red-500">{avatarUploadError}</p>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-[10px]" autoComplete="off">
            <FormInput
              id="username-mobile"
              label={t('usernameLabel')}
              type="text"
              name="new-username"
              autoComplete="off"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setTouched((prev) => ({ ...prev, username: true }));
                const newErrors = validateField("username", e.target.value, touched, errors);
                setErrors(newErrors);
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, username: true }))}
              error={errors.username}
              placeholder={t('usernamePlaceholder')}
              icon={User}
            />

            <FormInput
              id="fullName-mobile"
              label={t('fullNameLabel')}
              type="text"
              name="new-fullname"
              autoComplete="off"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setTouched((prev) => ({ ...prev, fullName: true }));
                const newErrors = validateField("fullName", e.target.value, touched, errors);
                setErrors(newErrors);
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
              error={errors.fullName}
              placeholder={t('fullNamePlaceholder')}
              icon={User}
            />

            <FormInput
              id="email-mobile"
              label={t('emailLabel')}
              type="email"
              name="new-email"
              autoComplete="off"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setTouched((prev) => ({ ...prev, email: true }));
                const newErrors = validateField("email", e.target.value, touched, errors);
                setErrors(newErrors);
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              error={errors.email}
              placeholder={t('emailPlaceholder')}
              icon={Mail}
            />

            <FormInput
              id="password-mobile"
              label={t('passwordLabel')}
              type={showPw ? "text" : "password"}
              name="new-password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setTouched((prev) => ({ ...prev, password: true }));
                const newErrors = validateField("password", e.target.value, touched, errors);
                setErrors(newErrors);
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              error={errors.password}
              placeholder={t('passwordPlaceholder')}
              icon={Lock}
              showPassword={showPw}
              onTogglePassword={() => setShowPw((s) => !s)}
              showRequirements={touched.password}
            />

            <FormInput
              id="confirmPassword-mobile"
              label={t('confirmPasswordLabel')}
              type={showConfirmPw ? "text" : "password"}
              name="new-password-confirm"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setTouched((prev) => ({ ...prev, confirmPassword: true }));
                const newErrors = validateField("confirmPassword", e.target.value, touched, errors, password);
                setErrors(newErrors);
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
              error={errors.confirmPassword}
              placeholder={t('confirmPasswordPlaceholder')}
              icon={Lock}
              showPassword={showConfirmPw}
              onTogglePassword={() => setShowConfirmPw((s) => !s)}
            />

            <FormInput
              id="phone-mobile"
              label={t('phoneLabel')}
              type="tel"
              name="new-phone"
              autoComplete="off"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setTouched((prev) => ({ ...prev, phone: true }));
                const newErrors = validateField("phone", e.target.value, touched, errors);
                setErrors(newErrors);
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
              error={errors.phone}
              placeholder={t('phonePlaceholder')}
              icon={Phone}
            />

            {/* Terms */}
            <div className="mt-6 mb-6 flex items-center justify-between text-xs">
              <label className="flex items-center gap-3 text-white/85 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isTermsChecked}
                    onChange={(e) => setIsTermsChecked(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`h-4 w-4 rounded border transition-all duration-300 ${isTermsChecked
                      ? "border-[#10C0C5] bg-[#10C0C5] shadow-lg shadow-[#10C0C5]/25"
                      : "border-white/50 bg-transparent group-hover:border-[#10C0C5] group-hover:bg-[#10C0C5]/10"
                      }`}
                  >
                    <div
                      className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isTermsChecked
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
                        }`}
                    >
                      <svg
                        className="h-3 w-3 text-white"
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
                  className={`transition-colors duration-200 ${isTermsChecked ? "text-white" : "group-hover:text-white"
                    }`}
                >
                  {t('agreeTerms')}{" "}
                  <Link
                    href="#"
                    className="text-[#10C0C5] underline underline-offset-4 hover:text-[#10C0C5]/80 transition-colors duration-200"
                  >
                    {t('terms')}
                  </Link>{" "}
                  {t('and')}{" "}
                  <Link
                    href="#"
                    className="text-[#10C0C5] underline underline-offset-4 hover:text-[#10C0C5]/80 transition-colors duration-200"
                  >
                    {t('privacyPolicy')}
                  </Link>
                </span>
              </label>
            </div>

            {/* Sign Up Button */}
            <div className="pt-6 pb-6">
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className="
                  h-12 w-full rounded-xl cursor-pointer px-[18px]
                  bg-linear-to-b from-[#00FFD1] to-[#00C8FF] text-[#0B5A5C] text-[15px] font-semibold
                  transition-all duration-200
                  hover:bg-white hover:text-black hover:shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {isLoading ? t('creatingAccount') : t('signUpButton')}
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 pt-4 text-xs text-white/70">
            <div className="h-px flex-1 bg-white/30" />
            <span>{t('continueWith')}</span>
            <div className="h-px flex-1 bg-white/30" />
          </div>

          {/* Google */}
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
                {isLoading ? t('signingUp') : t('continueGoogle')}
              </span>
            </button>
          </div>

          {/* Switch */}
          <div className="pt-4 pb-[46.22px]">
            <p className="text-center text-xs text-white/80">
              {t('hasAccount')}{" "}
              <Link
                href={`/${locale}/auth/signin`}
                className="text-cyan-200 underline underline-offset-4 transition-colors hover:text-cyan-100 ml-2"
              >
                {t('signIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
