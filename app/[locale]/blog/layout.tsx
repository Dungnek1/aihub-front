"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import BlogTabs from "@/components/blog/BlogTabs";
import { motion, AnimatePresence } from "framer-motion";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations("Blog");
  const cleanPath = pathname.replace(/^\/[a-z]{2}(?=\/)/, "");
  const isBlogMainPage = cleanPath === "/blog";

  return (
    <div className="min-h-screen bg-[#0A0F18] text-white flex flex-col items-center">
      {/* AI Blog Header Section - show on Community Posts page only */}
      <AnimatePresence mode="wait">
        {cleanPath === "/blog" && (
          <motion.section
            key="blog-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full"
          >
          <div
              className="mx-auto px-4 sm:px-6 lg:px-0"
            style={{
              maxWidth: "1440px",
              width: "100%",
            }}
          >
              {/* AI Blog Title and Tagline */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
                className="flex flex-col items-center text-center mb-6 pt-6"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
                  className="flex items-center gap-2 mb-2"
                >
                  <motion.span
                    className="text-4xl"
                    animate={{
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    📝
                  </motion.span>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white">
                    {t("aiBlogTitle")}
                  </h1>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, delay: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className="text-sm sm:text-base text-white/70"
                >
                  {t("aiBlogTagline")}
                </motion.p>
              </motion.div>

              {/* Tabs in the center */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="flex justify-center mb-6"
              >
                <motion.div
                  layoutId="blog-tabs-wrapper"
                  transition={{
                    layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
                  }}
                >
                  <BlogTabs />
                </motion.div>
              </motion.div>

              {/* Divider line with animation */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="border-t border-cyan-500/30 mb-6 origin-left"
              />

              {/* Community Blog Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mb-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <motion.span
                    role="img"
                    aria-label="globe"
                    className="flex-shrink-0"
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                🌍
                  </motion.span>
                  <h3 className="text-white text-2xl font-semibold">
                    {t("title")}
            </h3>
                </div>
                <p className="text-sm sm:text-base text-white/70">
              {t("description")}
            </p>
              </motion.div>
          </div>
          </motion.section>
      )}
      </AnimatePresence>

      {/* Content - fade in independently, doesn't block header animation */}
      <motion.main
        key={cleanPath}
        initial={!isBlogMainPage ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        exit={!isBlogMainPage ? { opacity: 0, y: -20 } : undefined}
        transition={{ 
          duration: 0.5,
          delay: !isBlogMainPage ? 0.1 : 0,
          ease: [0.4, 0, 0.2, 1] // Smooth cubic-bezier
        }}
        className="w-full pb-10"
      >
        {children}
      </motion.main>
    </div>
  );
}

