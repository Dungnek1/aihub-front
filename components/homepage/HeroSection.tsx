"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "next-intl";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { TextAnimate } from "@/components/ui/text-animate";
import { useState } from "react";
import { subscribeToNewsletter } from "@/services/client/support.client";

type HeroTexts = {
  title: string;
  subtitle: string;
  emailPlaceholder: string;
  signInButton?: string;
  newsletterAgreement: string;
  welcomeBack?: string;
  exploreDescription?: string;
};

export default function HeroSection({ texts }: { texts: HeroTexts }) {
  const { isAuthenticated } = useAuth();
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async () => {
    // Reset states
    setError("");
    setSubscriptionSuccess(false);

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      await subscribeToNewsletter({
        email: email.trim(),
        source: "HOME"
      });

      setSubscriptionSuccess(true);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <section className="pt-8 lg:pt-10">
      <div className="grid grid-cols-1 items-stretch md:grid-cols-2 gap-y-6 sm:gap-y-8 md:gap-x-[32px]">
        {/* Image Section */}
        <div className="relative h-full order-1 lg:order-1">
          <div className="relative w-full h-full min-h-[200px] max-h-[400px] lg:min-h-[400px] lg:max-h-none overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,229,255,0.15)]">
            <div className="absolute inset-0">
              <Image
                src="/panel1.png"
                alt="AI Hub Hero"
                fill
                unoptimized
                priority
                loading="eager"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
          {/* Blur glow effect below image */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-cyan-400/40 blur-3xl rounded-full pointer-events-none" />
        </div>

        {/* Content Section */}
        <div className="order-2 lg:order-2 flex flex-col justify-center">
          {/* Title - Responsive */}
          <h2 className="mb-2 sm:mb-3 lg:mb-3 text-xl sm:text-2xl lg:text-4xl xl:text-5xl font-extrabold leading-tight max-w-[650px]">
            <TextAnimate animation="slideUp" by="word" once>
              {texts.title}
            </TextAnimate>
          </h2>

          {!isAuthenticated ? (
            <div className="w-full max-w-[510px]">
              <p className="text-white text-sm sm:text-base lg:text-xl xl:text-2xl leading-relaxed mb-3 sm:mb-4 lg:mb-4">
                <TextAnimate animation="slideUp" by="word" once delay={0.2}>
                  {texts.subtitle}
                </TextAnimate>
              </p>
              <div className="space-y-3 sm:space-y-4 w-full">
                {/* Email Input - Mobile Responsive */}
                <div className="flex flex-col sm:flex-row items-stretch w-full gap-2 sm:gap-0">
                  <div className="relative flex-1">
                    <svg
                      className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 -translate-y-1/2"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="m5 7 7 5 7-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                      placeholder={texts.emailPlaceholder}
                      disabled={isSubmitting}
                      className="w-full h-10 sm:h-11 lg:h-12 text-sm sm:text-base rounded-lg sm:rounded-l-lg sm:rounded-r-none bg-[#0F1722] border border-white/20 text-gray-200 placeholder:text-gray-400 pl-10 pr-4 outline-none focus:border-cyan-400 disabled:opacity-50"
                    />
                  </div>
                  <ShimmerButton
                    onClick={handleSubscribe}
                    disabled={isSubmitting}
                    shimmerColor="#00d3f2"
                    background="linear-gradient(to bottom, #00FFD1, #00C8FF)"
                    borderRadius="8px"
                    shimmerDuration="3s"
                    className="inline-flex items-center justify-center h-10 sm:h-11 lg:h-12 px-4 sm:px-6 text-sm sm:text-base sm:-ml-px sm:rounded-l-none sm:rounded-r-lg whitespace-nowrap text-[#0B5A5C] font-semibold shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Subscribing..." : texts.signInButton}
                  </ShimmerButton>
                </div>

                {/* Success Message */}
                {subscriptionSuccess && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                    ✓ Successfully subscribed! Check your email for confirmation.
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Checkbox Agreement */}
                <label className="flex gap-2 sm:gap-3 items-start text-xs sm:text-sm lg:text-base leading-relaxed text-white/80 cursor-pointer select-none w-full">
                  <input type="checkbox" className="sr-only peer" />
                  <span
                    className="relative inline-block h-[16px] w-[16px] sm:h-[18px] sm:w-[18px] shrink-0 rounded-[4px] border border-white/50 bg-transparent transition-colors duration-150 mt-0.5
                      peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/40
                      peer-checked:bg-cyan-400 peer-checked:border-cyan-400
                      after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:h-[9px] after:w-[6px] after:rotate-45 after:border-b-2 after:border-r-2 after:border-[#0B5A5C] after:opacity-0
                      peer-checked:after:opacity-100"
                    aria-hidden="true"
                  />
                  <span className="leading-relaxed flex-1">
                    {texts.newsletterAgreement}
                  </span>
                </label>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[650px]">
              <div className="relative group">
                {/* Enhanced Animated Background Glow - Multi-layer */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" />
                <div className="absolute -inset-2 bg-gradient-to-r from-red-500/20 via-pink-500/20 to-cyan-500/20 rounded-2xl blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-700" />

                {/* Main Card - Enhanced Glassmorphism */}
                <div className="relative bg-[#0B0E18] backdrop-blur-2xl border border-white/10 rounded-2xl p-3 sm:p-4 lg:p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] overflow-hidden group transition-all duration-500 hover:border-white/20 hover:shadow-[0_8px_32px_0_rgba(255,0,0,0.3)]">
                  {/* Animated Mesh Gradient Overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,0,0,0.15),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,255,255,0.15),transparent_50%)]" />
                  </div>

                  {/* Enhanced Floating Particles */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-3 left-3 w-2 h-2 bg-cyan-400 rounded-full animate-pulse opacity-70" />
                    <div className="absolute top-6 right-6 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse opacity-50" style={{ animationDelay: '300ms' }} />
                    <div className="absolute bottom-4 left-8 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-60" style={{ animationDelay: '700ms' }} />
                    <div className="absolute bottom-8 right-3 w-2 h-2 bg-red-300 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1000ms' }} />
                    <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-pink-400 rounded-full animate-pulse opacity-30" style={{ animationDelay: '500ms' }} />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Header with Logo */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 lg:mb-4">
                      <div className="relative">
                        <div className="relative w-auto h-8 sm:h-9 lg:h-12 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105">
                          <svg
                            width="158"
                            height="36"
                            viewBox="0 0 158 36"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-full w-auto"
                          >
                            <path
                              d="M62.9782 24.8386H59.4656L63.1255 14.1903C63.2801 13.7337 63.5526 13.3508 63.9502 13.0194C64.3479 12.6954 64.7897 12.526 65.2831 12.526H74.0389V24.8312H70.7177V20.7884H64.3774L62.9782 24.8312V24.8386ZM65.4893 17.6219H70.7177V15.6925H66.4908C66.3804 15.6925 66.2699 15.7588 66.1668 15.8987C66.0637 16.0386 66.0122 16.1417 65.9974 16.2227L65.4893 17.6219Z"
                              fill="white"
                            />
                            <path
                              d="M84.3483 15.6999H81.5941V21.6648H84.3483V24.8386H75.5115V21.6648H78.2656V15.6999H75.5115V12.5261H84.3483V15.6999Z"
                              fill="white"
                            />
                            <path
                              d="M101.227 24.8387V20.2362H94.5843V24.8387H91.2632V12.5334H94.5843V17.0623H101.227V12.5334H104.548V24.8387H101.227Z"
                              fill="white"
                            />
                            <path
                              d="M115.992 12.5261H119.313V21.6427C119.313 22.0182 119.21 22.4012 119.011 22.7767C118.812 23.1523 118.554 23.491 118.238 23.793C117.921 24.0949 117.575 24.3453 117.192 24.5367C116.809 24.7282 116.433 24.8313 116.065 24.8313H109.268C108.9 24.8313 108.532 24.7355 108.142 24.5367C107.751 24.3379 107.405 24.0949 107.096 23.793C106.787 23.491 106.522 23.1523 106.323 22.7767C106.124 22.4012 106.021 22.0182 106.021 21.6427V12.5261H109.342V20.9799C109.342 21.083 109.371 21.1714 109.438 21.2597C109.497 21.3481 109.578 21.4218 109.673 21.4733C109.769 21.5322 109.865 21.5764 109.968 21.6059C110.071 21.6353 110.159 21.65 110.248 21.65H115.078C115.167 21.65 115.263 21.6353 115.358 21.6059C115.461 21.5764 115.557 21.5322 115.653 21.4733C115.749 21.4144 115.83 21.3408 115.888 21.2597C115.955 21.1714 115.984 21.0756 115.984 20.9799V12.5261H115.992Z"
                              fill="white"
                            />
                            <path
                              d="M134.077 21.6427C134.077 22.0182 133.974 22.4012 133.775 22.7767C133.577 23.1523 133.319 23.491 133.002 23.793C132.686 24.0949 132.339 24.3453 131.957 24.5367C131.574 24.7282 131.198 24.8313 130.83 24.8313H120.785V12.5261H130.83C131.198 12.5261 131.566 12.6218 131.957 12.8206C132.339 13.0121 132.693 13.2625 133.002 13.5644C133.319 13.8663 133.577 14.205 133.775 14.5806C133.974 14.9562 134.077 15.3391 134.077 15.7147V17.0328C134.077 17.2243 134.033 17.3937 133.952 17.5557C133.871 17.7103 133.768 17.8576 133.643 17.9975C133.518 18.1374 133.378 18.2626 133.231 18.3731C133.076 18.4835 132.943 18.5866 132.818 18.675C133.069 18.8517 133.312 19.0653 133.555 19.3157C133.79 19.566 133.967 19.8974 134.085 20.3172V21.6353L134.077 21.6427ZM124.88 17.0549H129.88C130.057 17.0549 130.248 16.996 130.447 16.8782C130.646 16.7604 130.749 16.591 130.749 16.3774C130.749 16.2743 130.719 16.186 130.653 16.0976C130.594 16.0092 130.513 15.9356 130.417 15.884C130.322 15.8251 130.226 15.7809 130.123 15.7515C130.02 15.722 129.924 15.7073 129.843 15.7073H124.107V21.6721H129.843C129.931 21.6721 130.027 21.65 130.123 21.6132C130.226 21.5764 130.322 21.5249 130.417 21.4586C130.513 21.3997 130.594 21.3187 130.653 21.2303C130.719 21.1419 130.749 21.0462 130.749 20.9505C130.749 20.7369 130.646 20.5602 130.447 20.4276C130.248 20.2951 130.057 20.2288 129.88 20.2288H124.88V17.0549Z"
                              fill="white"
                            />
                            <path
                              d="M23.5 30.1848L27.101 20.619C27.7048 19.0137 29.2366 17.9533 30.9524 17.9533H38.1764L33.2647 5H40.2531C41.9689 5 43.5006 6.06041 44.1044 7.66576L47.9705 17.9606H42.3813C39.8922 17.9606 37.6609 19.485 36.7552 21.7973L33.4708 30.1848H23.5074H23.5Z"
                              fill="url(#paint0_linear_13608_3013)"
                            />
                            <path
                              d="M49.3994 21.9077H44.2961C41.9912 21.9077 40.4006 24.2126 41.218 26.3629L42.6687 30.1848H52.4039L49.4067 21.9077H49.3994Z"
                              fill="url(#paint1_linear_13608_3013)"
                            />
                            <defs>
                              <linearGradient
                                id="paint0_linear_13608_3013"
                                x1="33.4856"
                                y1="30.936"
                                x2="41.4166"
                                y2="6.74526"
                                gradientUnits="userSpaceOnUse"
                              >
                                <stop stopColor="#47C2FF" />
                                <stop offset="1" stopColor="#00E5FF" />
                              </linearGradient>
                              <linearGradient
                                id="paint1_linear_13608_3013"
                                x1="46.7023"
                                y1="21.9077"
                                x2="46.7023"
                                y2="30.1848"
                                gradientUnits="userSpaceOnUse"
                              >
                                <stop stopColor="#9FF3DF" />
                                <stop offset="1" stopColor="#17EFF7" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                        {texts.welcomeBack || "Welcome Back!"}
                      </h3>
                    </div>

                    <p className="text-gray-300 mb-3 sm:mb-4 lg:mb-5 text-xs sm:text-sm lg:text-sm leading-relaxed font-light">
                      {texts.exploreDescription || "Explore AI tools, read insights, and stay updated."}
                    </p>

                    {/* Action Buttons Grid - Responsive */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:gap-3">
                      <Link
                        href={`/${locale}/ai-tools`}
                        className="group/card relative overflow-hidden bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-xl p-2.5 sm:p-3 lg:p-4 border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_24px_rgba(6,182,212,0.5)] h-16 sm:h-18 lg:h-24 flex items-center justify-center"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover/card:from-cyan-500/25 group-hover/card:to-blue-500/25 transition-all duration-300" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15),transparent_70%)] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                        <div className="relative z-10 text-center">
                          <div className="mb-1 sm:mb-1.5 lg:mb-2 group-hover/card:animate-bounce transition-transform duration-300">
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="mx-auto sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                            >
                              <path
                                d="M12 2L2 7L12 12L22 7L12 2Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-cyan-400"
                              />
                              <path
                                d="M2 17L12 22L22 17"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-cyan-400"
                              />
                              <path
                                d="M2 12L12 17L22 12"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-cyan-400"
                              />
                            </svg>
                          </div>
                          <div className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-white uppercase tracking-wider">
                            AI Tools
                          </div>
                        </div>
                      </Link>

                      <Link
                        href={`/${locale}/blog`}
                        className="group/card relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl p-2.5 sm:p-3 lg:p-4 border border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_24px_rgba(168,85,247,0.5)] h-16 sm:h-18 lg:h-24 flex items-center justify-center"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover/card:from-purple-500/25 group-hover/card:to-pink-500/25 transition-all duration-300" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15),transparent_70%)] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                        <div className="relative z-10 text-center">
                          <div className="mb-1 sm:mb-1.5 lg:mb-2 group-hover/card:animate-bounce transition-transform duration-300" style={{ animationDelay: '150ms' }}>
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="mx-auto sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                            >
                              <path
                                d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-purple-400"
                              />
                              <path
                                d="M6.5 2H20V20H6.5A2.5 2.5 0 0 1 4 17.5V4.5A2.5 2.5 0 0 1 6.5 2Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-purple-400"
                              />
                            </svg>
                          </div>
                          <div className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-white uppercase tracking-wider">
                            Blog
                          </div>
                        </div>
                      </Link>

                      <Link
                        href={`/${locale}/news`}
                        className="group/card relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-blue-500/30 hover:border-blue-400/60 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_24px_rgba(59,130,246,0.5)] h-16 sm:h-18 lg:h-24 flex items-center justify-center"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover/card:from-blue-500/25 group-hover/card:to-cyan-500/25 transition-all duration-300" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_70%)] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                        <div className="relative z-10 text-center">
                          <div className="mb-1.5 sm:mb-2 group-hover/card:animate-bounce transition-transform duration-300 delay-300">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="mx-auto sm:w-6 sm:h-6"
                            >
                              <path
                                d="M4 22H20"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-blue-400"
                              />
                              <path
                                d="M5 6H19C20.1 6 21 6.9 21 8V14C21 15.1 20.1 16 19 16H5C3.9 16 3 15.1 3 14V8C3 6.9 3.9 6 5 6Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-blue-400"
                              />
                              <path
                                d="M8 10H16"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-blue-400"
                              />
                            </svg>
                          </div>
                          <div className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">
                            News
                          </div>
                        </div>
                      </Link>

                      <Link
                        href={`/${locale}/profile`}
                        className="group/card relative overflow-hidden bg-gradient-to-br from-emerald-600/8 via-teal-600/8 to-emerald-600/8 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-emerald-600/25 hover:border-emerald-500/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_24px_rgba(16,185,129,0.4)] h-16 sm:h-18 lg:h-24 flex items-center justify-center"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/0 to-teal-600/0 group-hover/card:from-emerald-600/20 group-hover/card:to-teal-600/20 transition-all duration-300" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,150,105,0.12),transparent_70%)] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                        <div className="relative z-10 text-center">
                          <div className="mb-1.5 sm:mb-2 group-hover/card:animate-bounce transition-transform duration-300 delay-500">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="mx-auto sm:w-6 sm:h-6"
                            >
                              <path
                                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-emerald-400"
                              />
                              <circle
                                cx="12"
                                cy="7"
                                r="4"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-emerald-400"
                              />
                            </svg>
                          </div>
                          <div className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">
                            Profile
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}