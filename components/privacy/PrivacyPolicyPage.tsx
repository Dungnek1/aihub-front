"use client";

import { useTranslations, useLocale } from "next-intl";
import { Play } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { BlurFade } from "@/components/ui/blur-fade";

export default function PrivacyPolicyPage() {
  const t = useTranslations("PrivacyPolicy");
  const locale = useLocale();

  return (
    <div className="relative bg-[#0B0E18] font-sans overflow-hidden text-white">
      <div
        className="mx-auto px-4 sm:px-6 xl:px-0"
        style={{
          maxWidth: "1440px",
          width: "100%",
        }}
      >
        <main className="pt-0 pb-20 lg:pb-28 text-gray-100">
          {/* Header Section */}
          <section className="mb-12 sm:mb-16 lg:mb-20">
            <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10">
              {/* Badge */}
              <p className="bg-clip-text bg-gradient-to-b from-[#9ff3df] to-[#17eff7] text-transparent font-medium text-base sm:text-lg lg:text-xl">
                {t("badge")}
              </p>

              {/* Title */}
              <h1 className="font-semibold text-[28px] sm:text-[36px] lg:text-[48px] leading-[36px] sm:leading-[44px] lg:leading-[60px] text-white tracking-[-0.96px]">
                {t("title")}
              </h1>

              {/* Description */}
              <p className="font-normal text-base sm:text-lg lg:text-[22px] leading-[24px] sm:leading-[28px] lg:leading-[36px] text-[#d5d7da]">
                {t("description")}
              </p>
            </div>
          </section>

          {/* Divider */}
          <Separator className="bg-gradient-to-r from-transparent via-white/20 to-transparent mb-12 sm:mb-16 lg:mb-20" />

          {/* First Content Section */}
          <section className="mb-12 sm:mb-16 lg:mb-20">
            <div className="flex flex-col gap-4 sm:gap-6">
              <p className="font-normal text-base sm:text-lg lg:text-[22px] leading-[24px] sm:leading-[28px] lg:leading-[36px] text-[#d5d7da]">
                {t("intro")}
              </p>

              {/* Bullet Points */}
              <div className="flex flex-col gap-3 sm:gap-4 pl-3 sm:pl-4">
                <div className="flex gap-3 sm:gap-4 items-start">
                  <div className="h-6 w-2 flex-shrink-0 mt-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#9ff3df] to-[#17eff7]" />
                  </div>
                  <p className="font-normal text-base sm:text-lg lg:text-[22px] leading-[24px] sm:leading-[28px] lg:leading-[36px] text-[#d5d7da] flex-1">
                    {t("bullet1")}
                  </p>
                </div>
                <div className="flex gap-3 sm:gap-4 items-start">
                  <div className="h-6 w-2 flex-shrink-0 mt-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#9ff3df] to-[#17eff7]" />
                  </div>
                  <p className="font-normal text-base sm:text-lg lg:text-[22px] leading-[24px] sm:leading-[28px] lg:leading-[36px] text-[#d5d7da] flex-1">
                    {t("bullet2")}
                  </p>
                </div>
                <div className="flex gap-3 sm:gap-4 items-start">
                  <div className="h-6 w-2 flex-shrink-0 mt-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#9ff3df] to-[#17eff7]" />
                  </div>
                  <p className="font-normal text-base sm:text-lg lg:text-[22px] leading-[24px] sm:leading-[28px] lg:leading-[36px] text-[#d5d7da] flex-1">
                    {t("bullet3")}
                  </p>
                </div>
              </div>

              {/* Privacy Management Text */}
              <p className="font-normal text-base sm:text-lg lg:text-[22px] leading-[24px] sm:leading-[28px] lg:leading-[36px] text-[#d5d7da] mt-2">
                {t("privacyManagement")}
              </p>
            </div>
          </section>

          {/* Video Placeholder */}
          <section className="mb-12 sm:mb-16 lg:mb-20">
            <BlurFade delay={0.3} direction="up" inView>
              <div className="relative w-full max-w-[721px] h-[200px] sm:h-[300px] lg:h-[406px] mx-auto group">
                <div className="absolute inset-0 bg-[rgba(30,41,59,0.3)] border-[0.8px] border-[rgba(54,65,83,0.5)] rounded-2xl transition-all duration-300 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-[rgba(0,184,219,0.2)] rounded-full size-16 sm:size-20 flex items-center justify-center hover:bg-[rgba(0,184,219,0.3)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer touch-manipulation min-w-[64px] min-h-[64px] sm:min-w-[80px] sm:min-h-[80px]">
                    <Play className="size-6 sm:size-8 text-[#00d3f2] transition-transform duration-300 group-hover:scale-110" fill="#00d3f2" />
                  </div>
                </div>
              </div>
            </BlurFade>
          </section>

          {/* Second Content Section */}
          <section className="mb-12 sm:mb-16 lg:mb-20">
            <div className="flex flex-col gap-4 sm:gap-6">
              <h2 className="font-bold text-[28px] sm:text-[32px] lg:text-[40px] leading-[36px] sm:leading-[40px] lg:leading-[48px] text-white tracking-[-0.72px] mb-2">
                {t("section2Title")}
              </h2>

              <p className="font-normal text-base sm:text-lg lg:text-[22px] leading-[24px] sm:leading-[28px] lg:leading-[36px] text-[#d5d7da]">
                {t("section2Intro")}
              </p>

              {/* Bullet Points */}
              <div className="flex flex-col gap-3 sm:gap-4 pl-3 sm:pl-4">
                <div className="flex gap-3 sm:gap-4 items-start">
                  <div className="h-6 w-2 flex-shrink-0 mt-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#9ff3df] to-[#17eff7]" />
                  </div>
                  <p className="font-normal text-base sm:text-lg lg:text-[22px] leading-[24px] sm:leading-[28px] lg:leading-[36px] text-[#d5d7da] flex-1">
                    {t("section2Bullet1")}
                  </p>
                </div>
                <div className="flex gap-3 sm:gap-4 items-start">
                  <div className="h-6 w-2 flex-shrink-0 mt-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#9ff3df] to-[#17eff7]" />
                  </div>
                  <p className="font-normal text-base sm:text-lg lg:text-[22px] leading-[24px] sm:leading-[28px] lg:leading-[36px] text-[#d5d7da] flex-1">
                    {t("section2Bullet2")}
                  </p>
                </div>
                <div className="flex gap-3 sm:gap-4 items-start">
                  <div className="h-6 w-2 flex-shrink-0 mt-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#9ff3df] to-[#17eff7]" />
                  </div>
                  <p className="font-normal text-base sm:text-lg lg:text-[22px] leading-[24px] sm:leading-[28px] lg:leading-[36px] text-[#d5d7da] flex-1">
                    {t("section2Bullet3")}
                  </p>
                </div>
              </div>

              {/* Privacy Management Text */}
              <p className="font-normal text-base sm:text-lg lg:text-[22px] leading-[24px] sm:leading-[28px] lg:leading-[36px] text-[#d5d7da] mt-2">
                {t("section2PrivacyManagement")}
              </p>
            </div>
          </section>

          {/* Third Content Section */}
          <section className="mb-12 sm:mb-16 lg:mb-20">
            <div className="flex flex-col gap-4 sm:gap-6">
              <h2 className="font-bold text-[28px] sm:text-[32px] lg:text-[40px] leading-[36px] sm:leading-[40px] lg:leading-[48px] text-white tracking-[-0.72px] mb-2">
                {t("section3Title")}
              </h2>

              <p className="font-normal text-base sm:text-lg lg:text-[22px] leading-[24px] sm:leading-[28px] lg:leading-[36px] text-[#d5d7da]">
                {t("section3Intro")}
              </p>

              {/* Bullet Points */}
              <div className="flex flex-col gap-3 sm:gap-4 pl-3 sm:pl-4">
                <div className="flex gap-3 sm:gap-4 items-start">
                  <div className="h-6 w-2 flex-shrink-0 mt-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#9ff3df] to-[#17eff7]" />
                  </div>
                  <p className="font-normal text-base sm:text-lg lg:text-[22px] leading-[24px] sm:leading-[28px] lg:leading-[36px] text-[#d5d7da] flex-1">
                    {t("section3Bullet1")}
                  </p>
                </div>
                <div className="flex gap-3 sm:gap-4 items-start">
                  <div className="h-6 w-2 flex-shrink-0 mt-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#9ff3df] to-[#17eff7]" />
                  </div>
                  <p className="font-normal text-base sm:text-lg lg:text-[22px] leading-[24px] sm:leading-[28px] lg:leading-[36px] text-[#d5d7da] flex-1">
                    {t("section3Bullet2")}
                  </p>
                </div>
                <div className="flex gap-3 sm:gap-4 items-start">
                  <div className="h-6 w-2 flex-shrink-0 mt-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#9ff3df] to-[#17eff7]" />
                  </div>
                  <p className="font-normal text-base sm:text-lg lg:text-[22px] leading-[24px] sm:leading-[28px] lg:leading-[36px] text-[#d5d7da] flex-1">
                    {t("section3Bullet3")}
                  </p>
                </div>
              </div>

              {/* Privacy Management Text */}
              <p className="font-normal text-base sm:text-lg lg:text-[22px] leading-[24px] sm:leading-[28px] lg:leading-[36px] text-[#d5d7da] mt-2">
                {t("section3PrivacyManagement")}
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

