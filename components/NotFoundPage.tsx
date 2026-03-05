"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Home } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function NotFoundPage() {
  const t = useTranslations("NotFound");
  const locale = useLocale();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Build absolute URL to avoid locale prefix like /en/bg-auth.mp4
    if (typeof window !== "undefined") {
      const url = new URL("/bg-auth.mp4", window.location.origin);
      setVideoSrc(url.toString());
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.currentTime >= video.duration - 0.2) {
        video.currentTime = 0;
        video.play().catch(() => {
          // Video play failed, silently retry
        });
      }
    };

    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(() => {
        // Video replay failed, silently retry
      });
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [mounted, videoLoaded]);

  return (
    <div className="relative isolate min-h-[calc(100vh-102px)] flex flex-col bg-[#0A0F18] font-sans overflow-hidden text-white">
      {/* Video Background */}
      {mounted && !videoError && videoSrc && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          className={`pointer-events-none fixed inset-0 w-full h-full object-cover -z-10 ${
            videoLoaded ? "opacity-100" : "opacity-0"
          } transition-opacity duration-700`}
          style={{
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
            transform: "translate3d(0, 0, 0)",
            willChange: "transform",
          }}
          onLoadedData={() => {
            setVideoLoaded(true);
            videoRef.current?.play().catch(() => {});
          }}
          onCanPlayThrough={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Overlay for better text readability */}
      <div className="pointer-events-none fixed inset-0 bg-black/50 -z-10" />

      {/* Background Network Pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-20 z-0">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="grid-404"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="20" r="1.5" fill="#00E5FF" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-404)" />
          {/* Network lines - static positions */}
          <g stroke="#00E5FF" strokeWidth="0.5" opacity="0.3">
            {[
              [100, 200, 400, 300],
              [300, 150, 500, 250],
              [500, 400, 700, 200],
              [700, 300, 900, 500],
              [900, 200, 1100, 400],
              [200, 500, 400, 700],
              [400, 600, 600, 800],
              [600, 500, 800, 700],
              [800, 600, 1000, 800],
              [1000, 500, 1200, 700],
            ].map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
            ))}
          </g>
        </svg>
      </div>

      {/* Content - flex-1 để chiếm không gian còn lại */}
      <main className="relative z-10 flex-1 flex items-center justify-center text-center px-4 py-20">
        <div className="flex flex-col items-center justify-center">
          {/* 404 Number */}
          <div className="relative mb-6">
            <h1 className="text-[120px] md:text-[160px] lg:text-[200px] font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-green-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(0,229,255,0.5)]">
              404
            </h1>
            {/* Star inside the second 4 */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-3 h-3 bg-cyan-400 rounded-full blur-sm opacity-80" />
            </div>
          </div>

          {/* Page Not Found Text */}
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            {t("pageNotFound")}
          </h2>

          {/* Message */}
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-md">
            {t("message")}
          </p>

          {/* Back to Home Button */}
          <Link
            href={`/${locale}`}
            className="group flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-b from-[#00FFD1] to-[#00C8FF] text-[#0B5A5C] font-semibold hover:shadow-lg hover:shadow-cyan-400/40 hover:brightness-105 hover:saturate-110 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            <span className="group-hover:drop-shadow-[0_0_6px_rgba(11,90,92,0.9)] transition-all duration-300">
              {t("backToHome")}
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
