"use client";

import { usePathname } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import BlogTabs from "@/components/blog/BlogTabs";
import { motion } from "framer-motion";

export default function BlogBreadcrumbWithTabs() {
  const pathname = usePathname();
  const cleanPath = pathname.replace(/^\/[a-z]{2}(?=\/)/, "");

  // Only show on blog sub-pages (not on /blog main page)
  const isBlogSubPage = cleanPath.startsWith("/blog/") && cleanPath !== "/blog";

  if (!isBlogSubPage) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="w-full"
    >
      <div
        className="mx-auto px-4 sm:px-6 xl:px-0"
        style={{
          maxWidth: "1440px",
          width: "100%",
        }}
      >
        <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6 pt-4">
          <div className="flex-1">
            <Breadcrumb />
          </div>
          <motion.div 
            layoutId="blog-tabs-wrapper"
            className="hidden sm:flex"
            transition={{
              layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
            }}
          >
            <BlogTabs />
          </motion.div>
        </div>
        
        {/* Divider line */}
        <div className="border-t border-cyan-500/30 mb-4"></div>
      </div>
    </motion.div>
  );
}

