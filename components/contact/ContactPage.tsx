"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Mail,
  MessageCircle,
  MapPin,
  Phone,
  Facebook,
  Instagram,
  Linkedin,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Ripple } from "@/components/ui/ripple";
import { BlurFade } from "@/components/ui/blur-fade";
import { submitContactRequest } from "@/services/client/support.client";
import SplitText from "@/components/ui/SplitText";
import ScrollFadeScale from "@/components/ui/scroll-fade-scale";
import ScrollReveal from "@/components/ui/scroll-reveal";

const contactTiles = [
  { icon: MessageCircle, key: "sales", href: "mailto:sales@aihuhub.com" },
  { icon: Mail, key: "support", href: "mailto:support@aihuhub.com" },
  { icon: MapPin, key: "visit", href: "https://maps.google.com" },
  { icon: Phone, key: "call", href: "tel:+1555000000" },
];

const socialLinks = [
  { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
];


export default function ContactPage() {
  const t = useTranslations("ContactPage");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Form validation errors
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  }>({});

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = t("form.errors.nameRequired");
    }

    // Email is optional, but if provided, must be valid
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("form.errors.emailInvalid");
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t("form.errors.phoneRequired");
    }

    if (!formData.message.trim()) {
      newErrors.message = t("form.errors.messageRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitMessage("");

    try {
      const requestData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
        source: "HOME" as const,
      };

      await submitContactRequest(requestData);

      setSubmitStatus("success");
      setSubmitMessage(t("form.successMessage"));

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
      setErrors({});

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
        setSubmitMessage("");
      }, 5000);
    } catch (error: any) {
      setSubmitStatus("error");
      setSubmitMessage(error?.message || t("form.errorMessage"));
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="bg-[#0A0F18] text-white min-h-screen">
      <div
        className="mx-auto px-4 sm:px-6 xl:px-0"
        style={{ maxWidth: "1440px" }}
      >
        <main className="pt-0 pb-10 lg:pb-12 space-y-9">
          <div>
            <h1 className="text-xl sm:text-[28px] md:text-[32px] font-bold tracking-tight">
              {t("title")}
            </h1>
            <p className="text-white/70 text-base sm:text-lg mt-2 max-w-2xl">
              {t("subtitle")}
            </p>
          </div>

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <TooltipProvider>
              {contactTiles.map(({ icon: Icon, key, href }, index) => (
                <BlurFade key={key} delay={index * 0.1} direction="up" inView>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={href}
                        className="group relative rounded-2xl border border-white/[0.08] bg-[radial-gradient(circle_at_top,_rgba(88,230,255,0.12),_rgba(9,13,26,0.9))] p-5 flex flex-col gap-4 shadow-[0_25px_45px_rgba(3,7,18,0.7)] cursor-pointer transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_25px_45px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-[0.98] touch-manipulation overflow-hidden"
                      >
                        <Ripple
                          mainCircleSize={100}
                          numCircles={4}
                          className="opacity-30"
                        />
                        <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-300 transition-all duration-300 group-hover:bg-cyan-500/20 group-hover:border-cyan-400 group-hover:scale-110">
                          <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-base transition-colors duration-300 group-hover:text-cyan-100">
                            {t(`${key}.title`)}
                          </p>
                          <p className="text-sm text-white/60 mt-1 transition-colors duration-300 group-hover:text-white/70">
                            {t(`${key}.desc`)}
                          </p>
                        </div>
                        <span className="mt-auto text-cyan-300 text-sm font-medium transition-all duration-300 group-hover:text-cyan-200 group-hover:translate-x-1">
                          {t(`${key}.action`)}
                        </span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to {t(`${key}.action`)}</p>
                    </TooltipContent>
                  </Tooltip>
                </BlurFade>
              ))}
            </TooltipProvider>
          </section>

          <section className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-[#0f172a]/90 to-[#060b18]/90 p-6 sm:p-8 shadow-[0_35px_65px_rgba(3,7,18,0.75)] flex flex-col justify-between">
              <div className="space-y-2">
                <SplitText
                  text={t("cta.badge")}
                  className="text-cyan-300 text-sm font-semibold uppercase tracking-[0.3em] block"
                  delay={50}
                  duration={0.5}
                  splitType="chars"
                />
                <SplitText
                  text={t("cta.title")}
                  className="text-3xl font-semibold mt-2 block"
                  delay={70}
                  duration={0.6}
                  splitType="chars"
                />
                <SplitText
                  text={t("cta.desc")}
                  className="text-white/70 mt-3 text-base block"
                  delay={90}
                  duration={0.6}
                  splitType="words"
                />
              </div>
              <div className="text-base text-cyan-300 mt-8 flex flex-wrap items-center gap-2">
                <SplitText
                  text={t("cta.emailPrefix")}
                  className="text-base text-cyan-300 block"
                  delay={80}
                  duration={0.5}
                  splitType="words"
                />
                <Link
                  href="mailto:hi@aihuhub.com"
                  className="text-white underline hover:text-cyan-200 transition-colors duration-300 cursor-pointer touch-manipulation"
                >
                  {t("cta.email")}
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/[0.08] bg-[#050b16]/90 p-6 sm:p-7 shadow-[0_35px_65px_rgba(3,7,18,0.75)]">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label
                    htmlFor="name"
                    className="text-sm text-white/70 mb-1"
                  >
                    {t("form.name")} *
                  </Label>
                  <input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                      if (errors.name) {
                        setErrors((prev) => ({ ...prev, name: undefined }));
                      }
                    }}
                    className={`w-full bg-[#030912] border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 hover:border-white/20 cursor-text touch-manipulation ${errors.name
                      ? "border-red-500/50 focus:ring-red-400/50 focus:border-red-400/50"
                      : "border-white/10"
                      }`}
                    placeholder={t("form.namePlaceholder")}
                    type="text"
                    required
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="text-sm text-white/70 mb-1"
                  >
                    {t("form.email")}
                  </Label>
                  <input
                    id="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }));
                      if (errors.email) {
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                    className={`w-full bg-[#030912] border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 hover:border-white/20 cursor-text touch-manipulation ${errors.email
                      ? "border-red-500/50 focus:ring-red-400/50 focus:border-red-400/50"
                      : "border-white/10"
                      }`}
                    placeholder={t("form.emailPlaceholder")}
                    type="email"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="phone"
                    className="text-sm text-white/70 mb-1"
                  >
                    {t("form.phone")} *
                  </Label>
                  <input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }));
                      if (errors.phone) {
                        setErrors((prev) => ({ ...prev, phone: undefined }));
                      }
                    }}
                    className={`w-full bg-[#030912] border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 hover:border-white/20 cursor-text touch-manipulation ${errors.phone
                      ? "border-red-500/50 focus:ring-red-400/50 focus:border-red-400/50"
                      : "border-white/10"
                      }`}
                    placeholder={t("form.phonePlaceholder")}
                    type="tel"
                    required
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="message"
                    className="text-sm text-white/70 mb-1"
                  >
                    {t("form.message")} *
                  </Label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }));
                      if (errors.message) {
                        setErrors((prev) => ({ ...prev, message: undefined }));
                      }
                    }}
                    rows={4}
                    className={`w-full bg-[#030912] border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 hover:border-white/20 cursor-text touch-manipulation resize-y ${errors.message
                      ? "border-red-500/50 focus:ring-red-400/50 focus:border-red-400/50"
                      : "border-white/10"
                      }`}
                    placeholder={t("form.messagePlaceholder")}
                    required
                  />
                  {errors.message && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Success/Error Message */}
                {submitStatus === "success" && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">
                      {submitMessage || t("form.successMessage")}
                    </p>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">
                      {submitMessage || t("form.errorMessage")}
                    </p>
                  </div>
                )}

                <ShimmerButton
                  type="submit"
                  disabled={isSubmitting}
                  shimmerColor="#00d3f2"
                  background="linear-gradient(to right, #06b6d4, #22d3ee)"
                  borderRadius="12px"
                  shimmerDuration="3s"
                  className="w-full h-11 font-semibold flex items-center justify-center gap-2 text-[#0B5A5C] group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>
                    {isSubmitting
                      ? t("form.submitting") || "Đang gửi..."
                      : t("form.submit")}
                  </span>
                  {!isSubmitting && (
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  )}
                </ShimmerButton>
              </form>
            </div>
          </section>

          <ScrollReveal
            baseOpacity={0}
            enableBlur={true}
            baseRotation={5}
            blurStrength={10}
          >
            <section className="text-center py-12 sm:py-16 mb-16 sm:mb-20">
              <div className="space-y-6 max-w-2xl mx-auto">
                <div>
                  <SplitText
                    text={t("social.title")}
                    className="text-white font-semibold text-2xl sm:text-3xl tracking-tight block"
                    delay={70}
                    duration={0.6}
                    splitType="chars"
                    textAlign="center"
                  />
                </div>
                <div>
                  <SplitText
                    text={t("social.subtitle")}
                    className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto block"
                    delay={90}
                    duration={0.6}
                    splitType="words"
                    textAlign="center"
                  />
                </div>
                <TooltipProvider>
                  <div className="flex flex-wrap justify-center gap-4 mt-6">
                    {socialLinks.map((social) => (
                      <Tooltip key={social.label}>
                        <TooltipTrigger asChild>
                          <Link
                            href={social.href}
                            target="_blank"
                            className="group flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/15 bg-white/5 text-white/80 hover:text-white hover:border-cyan-400/40 hover:bg-cyan-400/10 active:scale-[0.97] transition-all duration-300 cursor-pointer touch-manipulation min-h-[44px]"
                          >
                            <social.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                            <span className="text-sm font-medium">
                              {social.label}
                            </span>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Visit our {social.label} page</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TooltipProvider>
              </div>
            </section>
          </ScrollReveal>

          <section className="text-center py-12 sm:py-16 mt-16 sm:mt-20">
            <div className="space-y-6 max-w-4xl mx-auto">
              <ScrollFadeScale
                duration={0.6}
                delay={0}
                scaleFrom={0.9}
                className="whitespace-nowrap"
              >
                <span className="text-sm sm:text-base font-medium text-cyan-300 uppercase tracking-[0.35em] block mb-2">
                  {t("trial.badge")}
                </span>
              </ScrollFadeScale>
              <ScrollFadeScale
                duration={0.7}
                delay={0.1}
                scaleFrom={0.85}
                className="whitespace-nowrap"
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight block">
                  {t("trial.title")}
                </h2>
              </ScrollFadeScale>
              <ScrollFadeScale duration={0.8} delay={0.2} scaleFrom={0.9}>
                <p className="text-white/70 text-base sm:text-lg max-w-3xl mx-auto block">
                  {t("trial.description")}
                </p>
              </ScrollFadeScale>
              <ScrollFadeScale duration={0.8} delay={0.3} scaleFrom={0.9}>
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <button className="h-12 px-8 rounded-full border border-white/20 bg-white/5 text-white/90 hover:border-cyan-400/40 hover:text-white hover:bg-cyan-400/10 active:scale-[0.98] transition-all duration-300 cursor-pointer touch-manipulation min-w-[160px] text-base font-medium">
                    {t("trial.learnMore")}
                  </button>
                  <ShimmerButton
                    shimmerColor="#00d3f2"
                    background="linear-gradient(to right, #06b6d4, #22d3ee)"
                    borderRadius="999px"
                    shimmerDuration="3s"
                    className="h-12 px-8 font-semibold text-[#0B5A5C] min-w-[160px] text-base"
                  >
                    {t("trial.getStarted")}
                  </ShimmerButton>
                </div>
              </ScrollFadeScale>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
