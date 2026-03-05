"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";
import { motion, AnimatePresence } from "framer-motion";

export default function BlogTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Blog");
  const tHeader = useTranslations("Header");
  const { isAuthenticated } = useAuth();
  const { setIsNavigating } = useNavigation();
  const cleanPath = pathname.replace(/^\/[a-z]{2}(?=\/)/, "");

  const handleNavigation = () => {
    setIsNavigating(true);
  };

  const allTabs = [
    {
      href: "/blog",
      label: t("Community Posts"),
      iconSrc: "/icon/users-03.svg",
      requireAuth: false,
    },
    {
      href: "/blog/write",
      label: t("writeBlog"),
      iconSrc: "/icon/pencil-line.svg",
      requireAuth: true,
    },
    {
      href: "/blog/my-post",
      label: t("myPosts"),
      iconSrc: "/icon/file-05.svg",
      requireAuth: true,
    },
    {
      href: "/blog/activity-log",
      label: t("activityLog"),
      iconSrc: "/icon/zap-fast.svg",
      requireAuth: true,
    },
  ];

  const buildLocalizedHref = (href: string) => {
    const normalized = href.startsWith('/') ? href : `/${href}`;
    return `/${locale}${normalized}`;
  };

  const handleTabClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    requiresAuth: boolean
  ) => {
    if (requiresAuth && !isAuthenticated) {
      event.preventDefault();
      router.push(`/${locale}/auth/signin?redirect=${encodeURIComponent(href)}`);
      return;
    }

    handleNavigation();
  };

  const isBlogMainPage = cleanPath === "/blog";

  return (
    <motion.div
      className="flex gap-2 flex-wrap items-center"
      layout
      layoutId="blog-tabs"
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 28,
        mass: 0.9,
      }}
    >
      <AnimatePresence mode="popLayout">
        {allTabs
          .filter((tab) => !tab.requireAuth || isAuthenticated)
          .map((tab, index) => {
            const active = cleanPath === tab.href;
            const localizedHref = buildLocalizedHref(tab.href);
            const requiresAuth = tab.requireAuth && !isAuthenticated;
            return (
              <motion.div
                key={tab.href}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 28,
                  delay: index * 0.02,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={localizedHref}
                  onClick={(event) =>
                    handleTabClick(event, localizedHref, requiresAuth)
                  }
                  aria-disabled={requiresAuth && !isAuthenticated}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 relative overflow-hidden
                    ${
                      active
                        ? "bg-cyan-600/20 text-cyan-400 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.6)]"
                        : `border-gray-700 ${
                            requiresAuth
                              ? "text-gray-500 cursor-not-allowed"
                              : "text-gray-300 hover:border-cyan-600 hover:text-cyan-400 hover:shadow-[0_0_8px_rgba(34,211,238,0.3)]"
                          }`
                    }`}
                >
                  {/* Glow effect for active tab */}
                  {active && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-cyan-400/30 to-cyan-500/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                  <Image
                    src={tab.iconSrc}
                    alt=""
                    aria-hidden="true"
                    width={16}
                    height={16}
                    className={`relative z-10 transition-all duration-300 ${
                      active
                        ? "opacity-100 scale-110"
                        : "opacity-80 group-hover:opacity-100 group-hover:scale-110"
                    }`}
                  />
                  <span className="relative z-10 flex items-center gap-1 whitespace-nowrap">
                    {tab.label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
      </AnimatePresence>
    </motion.div>
  );
}

