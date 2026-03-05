"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Clock, MapPin, DollarSign, Smile, Target, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaTelegramPlane, FaDiscord } from "react-icons/fa";
import Link from "next/link";
import ApplyModal from "./ApplyModal";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BlurFade } from "@/components/ui/blur-fade";

interface JobCardProps {
  icon: React.ReactNode;
  title: string;
  interactionInfo: string;
  description: string;
  jobType: string;
  location: string;
  applications: string;
  onApply: () => void;
}

function JobCard({
  icon,
  title,
  interactionInfo,
  description,
  jobType,
  location,
  applications,
  onApply,
}: JobCardProps) {
  const t = useTranslations("Career");

  return (
    <div className="group bg-gradient-to-b from-[#1e293b] to-[rgba(30,41,59,0.5)] rounded-2xl p-5 sm:p-6 flex flex-col justify-between min-h-[260px] sm:min-h-[290px] border border-transparent transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:border-cyan-500/30 cursor-pointer touch-manipulation">
      <div className="flex flex-col gap-4 sm:gap-5 flex-1">
        {/* Header with Icon and Title */}
        <div className="flex gap-4 sm:gap-5 items-center">
          <div className="bg-gradient-to-b from-[#9ff3df] to-[#17eff7] border-2 border-white/12 rounded-lg size-10 sm:size-12 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:border-cyan-400/40 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            {icon}
          </div>
          <div className="flex flex-col flex-1">
            <h3 className="font-semibold text-base sm:text-lg leading-6 sm:leading-7 text-white">
              {title}
            </h3>
            <p className="font-normal text-xs sm:text-sm leading-5 text-[#535862]">
              {interactionInfo}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col">
          <p className="line-clamp-3 text-xs sm:text-sm leading-5 text-white mb-1">
            {description}
          </p>
          <button className="bg-clip-text bg-gradient-to-b from-[#06a8ac] to-[#19dde2] text-transparent text-sm sm:text-base leading-6 text-left transition-all duration-300 hover:from-cyan-300 hover:to-cyan-200 hover:translate-x-1 cursor-pointer touch-manipulation">
            {t("seeMore")}
          </button>
        </div>
      </div>

      {/* Job Details and Apply Button */}
      <div className="flex flex-col gap-2 sm:gap-2 mt-4">
        {/* Job Details */}
        <div className="flex gap-2 sm:gap-3 items-center flex-wrap">
          <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-300 border-cyan-500/30 text-xs">
            <Clock className="size-3 mr-1" />
            {jobType}
          </Badge>
          <Badge variant="outline" className="text-white/70 border-white/20 text-xs">
            <MapPin className="size-3 mr-1" />
            {location}
          </Badge>
          <Badge variant="outline" className="text-white/70 border-white/20 text-xs">
            <DollarSign className="size-3 mr-1" />
            {applications}
          </Badge>
        </div>

        {/* Apply Button */}
        <ShimmerButton
          onClick={onApply}
          shimmerColor="#00d3f2"
          background="linear-gradient(to bottom, #06a8ac, #19dde2)"
          borderRadius="12px"
          shimmerDuration="3s"
          className="px-3 py-2 shadow-[0px_6px_16px_0px_rgba(11,90,92,0.5)] hover:shadow-[0px_8px_20px_0px_rgba(11,90,92,0.7)] min-h-[44px]"
        >
          <span className="font-semibold text-xs sm:text-sm leading-5 text-[#0b5a5c]">
            {t("apply")}
          </span>
        </ShimmerButton>
      </div>
    </div>
  );
}

export default function CareerPage() {
  const t = useTranslations("Career");
  const locale = useLocale();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sample job data - in real app, this would come from API
  const jobs = [
    {
      icon: <Smile className="size-6 text-[#0b5a5c]" />,
      title: t("job1Title"),
      interactionInfo: t("job1Interaction"),
      description: t("job1Description"),
      jobType: t("fullTime"),
      location: t("onSite"),
      applications: "205",
    },
    {
      icon: <Target className="size-6 text-[#0b5a5c]" />,
      title: t("job2Title"),
      interactionInfo: t("job2Interaction"),
      description: t("job2Description"),
      jobType: t("fullTime"),
      location: t("onSite"),
      applications: "205",
    },
    {
      icon: <Phone className="size-6 text-[#0b5a5c]" />,
      title: t("job3Title"),
      interactionInfo: t("job3Interaction"),
      description: t("job3Description"),
      jobType: t("fullTime"),
      location: t("onSite"),
      applications: "205",
    },
    {
      icon: <Smile className="size-6 text-[#0b5a5c]" />,
      title: t("job1Title"),
      interactionInfo: t("job1Interaction"),
      description: t("job1Description"),
      jobType: t("fullTime"),
      location: t("onSite"),
      applications: "205",
    },
    {
      icon: <Target className="size-6 text-[#0b5a5c]" />,
      title: t("job2Title"),
      interactionInfo: t("job2Interaction"),
      description: t("job2Description"),
      jobType: t("fullTime"),
      location: t("onSite"),
      applications: "205",
    },
    {
      icon: <Phone className="size-6 text-[#0b5a5c]" />,
      title: t("job3Title"),
      interactionInfo: t("job3Interaction"),
      description: t("job3Description"),
      jobType: t("fullTime"),
      location: t("onSite"),
      applications: "205",
    },
  ];

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
          {/* Hero Section */}
          <section className="flex flex-col gap-6 sm:gap-8 mb-16 sm:mb-20 lg:mb-28">
            {/* Badge */}
            <p className="bg-clip-text bg-gradient-to-b from-[#9ff3df] to-[#17eff7] text-transparent font-semibold text-base sm:text-lg">
              {t("badge")}
            </p>

            {/* Title */}
            <h1 className="font-bold text-[28px] sm:text-[36px] lg:text-[56px] leading-[36px] sm:leading-[44px] lg:leading-[64px] text-white tracking-[-0.72px]">
              {t("title")}
            </h1>

            {/* Subtitle */}
            <p className="font-medium text-base sm:text-lg leading-7 sm:leading-8 text-white max-w-2xl">
              {t("subtitle")}
            </p>
          </section>

          {/* Job Listings Section */}
          <section className="mb-16 sm:mb-20 lg:mb-28">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {jobs.map((job, index) => (
                <BlurFade key={index} delay={index * 0.1} direction="up" inView>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div>
                        <JobCard
                          {...job}
                          onApply={() => {
                            setSelectedJob(job.title);
                            setIsModalOpen(true);
                          }}
                        />
                      </div>
                    </HoverCardTrigger>
                  <HoverCardContent className="w-80 bg-[#1e293b] border-white/10">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-white">{job.title}</h4>
                      <p className="text-sm text-white/70 line-clamp-3">
                        {job.description}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-300 text-xs">
                          {job.jobType}
                        </Badge>
                        <Badge variant="outline" className="text-white/70 text-xs">
                          {job.location}
                        </Badge>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                </BlurFade>
              ))}
            </div>
          </section>

          {/* Apply Modal */}
          <ApplyModal
            open={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedJob(null);
            }}
            jobTitle={selectedJob || ""}
          />

          {/* Social Section */}
          <section className="mb-16 sm:mb-20 lg:mb-28">
            <div className="flex flex-col gap-4 sm:gap-6">
              <h2 className="font-bold text-[28px] sm:text-[32px] lg:text-[34px] leading-[36px] sm:leading-[40px] lg:leading-[42px] text-white">
                {t("socialTitle")}
              </h2>
              <p className="font-normal text-base sm:text-lg leading-7 sm:leading-8 text-[#d5d7da] max-w-2xl">
                {t("socialDescription")}
              </p>
              <div className="flex flex-col gap-3">
                <p className="text-white text-sm sm:text-base font-medium">
                  {t("joinCommunity")}
                </p>
                <div className="flex items-center gap-4 sm:gap-6">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="https://t.me/+VqaLnSMBwYtiMmM1"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-cyan-400 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label="Telegram"
                        >
                          <FaTelegramPlane className="w-6 h-6" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Join our Telegram community</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="javascript:void(0)"
                          className="text-white hover:text-cyan-400 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label="Discord"
                        >
                          <FaDiscord className="w-6 h-6" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Join our Discord server</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="https://www.facebook.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/30 hover:text-white/50 transition-all duration-300 opacity-50 blur-[0.5px] hover:scale-110 active:scale-95 cursor-pointer touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label="Facebook"
                        >
                          <FaFacebook className="w-6 h-6" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Visit our Facebook page</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="https://www.instagram.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/30 hover:text-white/50 transition-all duration-300 opacity-50 blur-[0.5px] hover:scale-110 active:scale-95 cursor-pointer touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label="Instagram"
                        >
                          <FaInstagram className="w-6 h-6" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Follow us on Instagram</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="https://x.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/30 hover:text-white/50 transition-all duration-300 opacity-50 blur-[0.5px] hover:scale-110 active:scale-95 cursor-pointer touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label="X (Twitter)"
                        >
                          <FaTwitter className="w-6 h-6" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Follow us on X (Twitter)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

