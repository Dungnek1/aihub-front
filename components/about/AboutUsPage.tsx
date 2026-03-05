"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { BlurFade } from "@/components/ui/blur-fade";
import { AnimatedStat } from "@/components/ui/AnimatedStat";

export default function AboutUsPage() {
  const t = useTranslations("AboutUs");
  const locale = useLocale();

  return (
    <div className="relative bg-[#0A0F18] font-sans overflow-hidden text-white">
      <div
        className="mx-auto px-4 sm:px-6 xl:px-0"
        style={{
          maxWidth: "1440px",
          width: "100%",
        }}
      >
        <main className="pt-0 pb-16 lg:pb-20 text-gray-100">
          {/* About Us Section */}
          <section className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-stretch mb-16 sm:mb-20 lg:mb-28">
            {/* Left Column - Text Content */}
            <div className="flex flex-col gap-8 w-full lg:w-1/2 self-stretch">
              {/* Badge */}
              <p className="bg-clip-text bg-gradient-to-b from-[#9ff3df] to-[#17eff7] text-transparent font-semibold text-base sm:text-lg">
                {t("badge")}
              </p>

              {/* Title */}
              <h1 className="font-bold text-[28px] sm:text-[36px] lg:text-[56px] leading-[36px] sm:leading-[44px] lg:leading-[64px] text-white tracking-[-0.72px]">
                {t("title")}
              </h1>

              {/* Content */}
              <div className="flex flex-col gap-4 sm:gap-5">
                <p className="font-medium text-base sm:text-lg leading-7 sm:leading-8 text-white">
                  {t("intro")}
                </p>

                <p className="font-medium text-base sm:text-lg leading-7 sm:leading-8 text-white">
                  {t("provideTitle")}
                </p>

                {/* Bullet Points */}
                <div className="flex gap-2 items-start pl-3">
                  <div className="h-7 w-2 flex-shrink-0 mt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#9ff3df] to-[#17eff7] mt-2" />
                  </div>
                  <p className="font-medium text-base sm:text-lg leading-7 sm:leading-8 text-white flex-1">
                    {t("bullet1")}
                  </p>
                </div>

                <div className="flex gap-2 items-start pl-3">
                  <div className="h-7 w-2 flex-shrink-0 mt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#9ff3df] to-[#17eff7] mt-2" />
                  </div>
                  <p className="font-medium text-base sm:text-lg leading-7 sm:leading-8 text-white flex-1">
                    {t("bullet2")}
                  </p>
                </div>

                <div className="flex gap-2 items-start pl-3">
                  <div className="h-7 w-2 flex-shrink-0 mt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#9ff3df] to-[#17eff7] mt-2" />
                  </div>
                  <p className="font-medium text-base sm:text-lg leading-7 sm:leading-8 text-white flex-1">
                    {t("bullet3")}
                  </p>
                </div>

                <p className="font-medium text-base sm:text-lg leading-7 sm:leading-8 text-white">
                  {t("mission")}
                </p>
              </div>
            </div>

            {/* Right Column - Image */}
              <div className="w-full lg:w-1/2 relative rounded-2xl border border-[rgba(54,65,83,0.5)] bg-[rgba(30,41,59,0.3)] overflow-hidden self-stretch min-h-[300px] sm:min-h-[400px] lg:min-h-[600px] transition-all duration-500 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] cursor-pointer group">
                <Image
                  src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=800&fit=crop&q=80"
                  alt={t("imageAltMain")}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E18]/80 via-transparent to-transparent transition-opacity duration-500 group-hover:opacity-70" />
              </div>
          </section>

          {/* Stats Section */}
          <section className="flex flex-col gap-12 sm:gap-16 lg:gap-20 mb-16 sm:mb-20 lg:mb-28">
            {/* Title */}
            <div className="flex flex-col gap-2 sm:gap-3 items-center text-center">
              <p className="font-bold text-[24px] sm:text-[28px] lg:text-[42px] leading-[32px] sm:leading-[36px] lg:leading-[50px] text-white">
                {t("statsTitle1")}
              </p>
              <p className="font-bold text-[24px] sm:text-[28px] lg:text-[42px] leading-[32px] sm:leading-[36px] lg:leading-[50px] text-white">
                <span>{t("statsTitle2")}</span>
                <span className="bg-clip-text bg-gradient-to-b from-[#9ff3df] to-[#17eff7] text-transparent">
                  {" "}
                  {t("statsTitle2Highlight")}
                </span>
                <span> {t("statsTitle2End")}</span>
              </p>
              <p className="font-bold text-[24px] sm:text-[28px] lg:text-[42px] leading-[32px] sm:leading-[36px] lg:leading-[50px] text-white text-center">
                <span>{t("statsTitle3")}</span>
                <span className="bg-clip-text bg-gradient-to-b from-[#9ff3df] to-[#17eff7] text-transparent">
                  {" "}
                  {t("statsTitle3Highlight")}
                </span>
                <span> {t("statsTitle3End")}</span>
              </p>
            </div>

            {/* Divider */}
            <Separator className="bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Stats Numbers */}
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-8 sm:gap-10 lg:gap-16 max-w-[753px] mx-auto">
              {[1, 2, 3].map((num) => {
                const numberStr = t(`stat${num}Number`);
                const number = parseInt(numberStr.replace(/[^0-9]/g, "")) || 0;
                const suffix = numberStr.replace(/[0-9]/g, "");
                return (
                  <BlurFade key={num} delay={num * 0.15} direction="up" inView>
                    <AnimatedStat
                      number={number}
                      label={t(`stat${num}Label`)}
                      suffix={suffix}
                      duration={2.5}
                    />
                  </BlurFade>
                );
              })}
            </div>

            {/* Divider */}
            <Separator className="bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </section>

          {/* Mission & Vision Section */}
          <section className="flex flex-col gap-6 sm:gap-8">
            {/* Mission Row */}
            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-stretch">
              {/* Mission Card */}
              <div className="bg-gradient-to-b from-[#1e293b] to-[rgba(30,41,59,0.5)] rounded-2xl p-6 sm:p-8 w-full lg:w-1/2 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:border hover:border-cyan-500/20">
                <h2 className="font-bold text-[28px] sm:text-[32px] lg:text-[34px] leading-[36px] sm:leading-[40px] lg:leading-[42px] text-white mb-6 sm:mb-8">
                  {t("missionTitle")}
                </h2>
                <div className="flex flex-col gap-4 sm:gap-5">
                  <p className="font-normal text-base sm:text-lg leading-7 sm:leading-8 text-[#d5d7da]">
                    {t("missionIntro")}
                  </p>

                  {/* Mission Bullets */}
                  <div className="flex gap-2 items-start pl-3">
                    <div className="h-7 w-2 flex-shrink-0 mt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#9ff3df] to-[#17eff7] mt-2" />
                    </div>
                    <p className="font-normal text-base sm:text-lg leading-7 sm:leading-8 text-[#d5d7da] flex-1">
                      <span className="font-bold text-white">
                        {t("missionBullet1Bold")}
                      </span>
                      {t("missionBullet1Text")}
                    </p>
                  </div>

                  <div className="flex gap-2 items-start pl-3">
                    <div className="h-7 w-2 flex-shrink-0 mt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#9ff3df] to-[#17eff7] mt-2" />
                    </div>
                    <p className="font-normal text-base sm:text-lg leading-7 sm:leading-8 text-[#d5d7da] flex-1">
                      <span className="font-bold text-white">
                        {t("missionBullet2Bold")}
                      </span>
                      {t("missionBullet2Text")}
                    </p>
                  </div>

                  <div className="flex gap-2 items-start pl-3">
                    <div className="h-7 w-2 flex-shrink-0 mt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#9ff3df] to-[#17eff7] mt-2" />
                    </div>
                    <p className="font-normal text-base sm:text-lg leading-7 sm:leading-8 text-[#d5d7da] flex-1">
                      <span className="font-bold text-white">
                        {t("missionBullet3Bold")}
                      </span>
                      {t("missionBullet3Text")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mission Image */}
              <div className="w-full lg:w-1/2 relative rounded-2xl border border-[rgba(54,65,83,0.5)] bg-[rgba(30,41,59,0.3)] overflow-hidden self-stretch min-h-[250px] sm:min-h-[300px] lg:min-h-[414px] transition-all duration-500 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] cursor-pointer group">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&q=80"
                  alt={t("imageAltMission")}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E18]/80 via-transparent to-transparent transition-opacity duration-500 group-hover:opacity-70" />
              </div>
            </div>

            {/* Vision Row */}
            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-stretch">
              {/* Vision Image */}
              <div className="w-full lg:w-1/2 relative rounded-2xl border border-[rgba(54,65,83,0.5)] bg-[rgba(30,41,59,0.3)] overflow-hidden self-stretch min-h-[250px] sm:min-h-[300px] lg:min-h-[414px] transition-all duration-500 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] cursor-pointer group">
                <Image
                  src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop&q=80"
                  alt={t("imageAltVision")}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E18]/80 via-transparent to-transparent transition-opacity duration-500 group-hover:opacity-70" />
              </div>

              {/* Vision Card */}
              <div className="bg-gradient-to-b from-[#1e293b] to-[rgba(30,41,59,0.5)] rounded-2xl p-6 sm:p-8 w-full lg:w-1/2 min-h-[250px] sm:min-h-[300px] lg:min-h-[414px] flex flex-col self-stretch transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:border hover:border-cyan-500/20">
                <h2 className="font-bold text-[28px] sm:text-[32px] lg:text-[34px] leading-[36px] sm:leading-[40px] lg:leading-[42px] text-white mb-6 sm:mb-8">
                  {t("visionTitle")}
                </h2>
                <div className="flex flex-col gap-4 sm:gap-5 flex-1">
                  <p className="font-normal text-base sm:text-lg leading-7 sm:leading-8 text-[#d5d7da]">
                    {t("visionParagraph1")}
                  </p>
                  <p className="font-normal text-base sm:text-lg leading-7 sm:leading-8 text-[#d5d7da]">
                    {t("visionParagraph2")}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

