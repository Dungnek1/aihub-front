"use client";

import React, { useMemo, useState, useRef, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

import {
  Search,
  Bell,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Star,
} from "lucide-react";

import Link from "next/link";
import { useNavigation } from "@/contexts/NavigationContext";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import { sanitizeHtml } from "@/utils";
import { motion } from "framer-motion";
import NavigationLink from "@/components/NavigationLink";
import MobileMenuFeaturedContent, {
  prefetchMobileMenuContent,
} from "@/components/header/MobileMenuFeaturedContent";
import { getNewsDataClient } from "@/services/client/news.client";
import Image from "next/image";
import { normalizeImageUrl, normalizeAvatarUrl } from "@/utils/image.utils";
import { getPostBySlug } from "@/services/client/blog.client";

// Helper: detect breakpoint
function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = () => setMatches(m.matches);
    onChange();
    m.addEventListener?.("change", onChange);
    return () => m.removeEventListener?.("change", onChange);
  }, [query]);
  return matches;
}

export default function Header() {
  const t = useTranslations("Header");
  const tNotif = useTranslations("Notifications");
  const locale = useLocale();
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileNotificationExpanded, setIsMobileNotificationExpanded] =
    useState(false);
  const [activeTab, setActiveTab] = useState("news");
  const [isMobileToolsSubmenuOpen, setIsMobileToolsSubmenuOpen] = useState(false);
  const [prefetchingTab, setPrefetchingTab] = useState<string | null>(null);
  const { isNavigating, setIsNavigating } = useNavigation();
  const bellButtonRef = useRef<HTMLButtonElement>(null);
  const { unreadCount, notifications, loadingNotifications, onMarkAllRead } =
    useNotifications();
  const [userAvatarError, setUserAvatarError] = useState(false);
  const userAvatarUrl = React.useMemo(() => {
    if (!user?.avatarUrl) return null;
    try {
      return normalizeAvatarUrl(user.avatarUrl);
    } catch {
      return user.avatarUrl;
    }
  }, [user?.avatarUrl]);

  // Featured news image for mobile header
  const [featuredNewsImage, setFeaturedNewsImage] = useState<string | null>(
    null
  );

  React.useEffect(() => {
    const fetchFeaturedNewsImage = async () => {
      try {
        // Fetch featured news from API (/blog/admin/posts?limit=4)
        // First post is featured news
        const newsData = await getNewsDataClient();

        // Only get image from featured news (first post from API)
        if (newsData?.featuredNews?.image) {
          // Skip fallback images
          const fallbackImages = [
            "/google-news.png",
            "/quantum-ai.png",
            "/ai-ethics.png",
            "/neural-interfaces.png",
          ];

          const isFallback = fallbackImages.some((fallback) =>
            newsData.featuredNews.image.includes(fallback)
          );

          // Only set image if it's not a fallback and exists
          if (!isFallback && newsData.featuredNews.image) {
            // Normalize URL: replace localhost:3000 with backend URL from NEXT_PUBLIC_BACKEND_URL
            const imageUrl = normalizeImageUrl(newsData.featuredNews.image);
            setFeaturedNewsImage(imageUrl);
          }
        }
      } catch (error) {
        // Silent fail - use default image
      }
    };

    fetchFeaturedNewsImage();
  }, []);

  // Refs for navigation tabs to calculate active indicator position
  // Tách ref riêng cho desktop và tablet để tránh conflict
  const navTabRefsDesktop = useRef<(HTMLLIElement | null)[]>([]);
  const navTabRefsTablet = useRef<(HTMLLIElement | null)[]>([]);
  const isDesktop = useMediaQuery("(min-width: 1080px)");

  const [pendingTabIndex, setPendingTabIndex] = useState<number | null>(null);
  const [activeIndicatorStyle, setActiveIndicatorStyle] = useState<{
    left?: string;
    width?: string;
  }>({});
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const toolsTriggerRef = useRef<HTMLAnchorElement | null>(null);
  const toolsMenuRef = useRef<HTMLDivElement | null>(null);
  const toolsItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [toolsFocusedIndex, setToolsFocusedIndex] = useState<number>(-1);
  const toolsHoverCloseTimeout = useRef<number | null>(null);
  const [toolsHoverIndex, setToolsHoverIndex] = useState<number>(-1);

  // Close tools dropdown on outside click or Escape
  React.useEffect(() => {
    if (!isToolsDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (
        toolsMenuRef.current &&
        !toolsMenuRef.current.contains(target) &&
        toolsTriggerRef.current &&
        !toolsTriggerRef.current.contains(target as Node)
      ) {
        setIsToolsDropdownOpen(false);
        setToolsFocusedIndex(-1);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsToolsDropdownOpen(false);
        setToolsFocusedIndex(-1);
        toolsTriggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isToolsDropdownOpen]);

  const openToolsMenu = React.useCallback(() => {
    setIsToolsDropdownOpen(true);
    setToolsFocusedIndex(0);
    // Focus first item after open
    setTimeout(() => {
      toolsItemRefs.current[0]?.focus();
    }, 0);
  }, []);

  const closeToolsMenu = React.useCallback(() => {
    setIsToolsDropdownOpen(false);
    setToolsFocusedIndex(-1);
  }, []);

  const scheduleToolsMenuClose = React.useCallback(() => {
    if (toolsHoverCloseTimeout.current) {
      window.clearTimeout(toolsHoverCloseTimeout.current);
    }
    toolsHoverCloseTimeout.current = window.setTimeout(() => {
      setIsToolsDropdownOpen(false);
      setToolsFocusedIndex(-1);
    }, 150);
  }, []);

  const cancelToolsMenuClose = React.useCallback(() => {
    if (toolsHoverCloseTimeout.current) {
      window.clearTimeout(toolsHoverCloseTimeout.current);
      toolsHoverCloseTimeout.current = null;
    }
  }, []);

  const handleNavigation = () => {
    setIsNavigating(true);
    setIsMobileMenuOpen(false);
  };

  React.useEffect(() => {
    if (!pathname.includes("/news") && searchValue) {
      const timer = setTimeout(() => {
        setSearchValue("");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchValue]);

  // Note: Navigation loading is handled by client-layout.tsx
  // Don't auto-hide loading here to avoid conflicts

  // Scroll to section when hash is present in URL after navigation
  React.useEffect(() => {
    if (typeof window !== "undefined" && !isNavigating) {
      const hash = window.location.hash;
      if (hash) {
        const sectionId = hash.substring(1); // Remove #
        setTimeout(() => {
          const section = document.getElementById(sectionId);
          if (section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 400); // Delay to ensure page is rendered
      }
    }
  }, [pathname, isNavigating]);

  // Prefetch all content when mobile menu opens
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      // Prefetch all 3 tabs in parallel to avoid render delay when switching tabs
      Promise.all([
        prefetchMobileMenuContent("news"),
        prefetchMobileMenuContent("tools"),
        prefetchMobileMenuContent("blog"),
      ]).catch((error) => {
        // Silent fail - prefetch is optional
      });
    }
  }, [isMobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Lock body scroll
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        // Restore body scroll
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isMobileMenuOpen]);

  const profileHref = useMemo(
    () => `/${locale}/profile?tab=information`,
    [locale]
  );

  const homeHref = useMemo(() => `/${locale}`, [locale]);
  const newsHref = useMemo(() => `/${locale}/news`, [locale]);
  const aiToolsHref = useMemo(() => `/${locale}/ai-tools`, [locale]);
  const blogHref = useMemo(() => `/${locale}/blog`, [locale]);
  const portfolioHref = useMemo(() => `/${locale}/landing`, [locale]);
  const contactHref = useMemo(() => `/${locale}/contact`, [locale]);
  const comingSoonHref = useMemo(() => `/${locale}/coming-soon`, [locale]);

  // Prefetch critical routes on hover
  const handlePrefetch = React.useCallback((href: string) => {
    router.prefetch(href);
  }, [router]);

  const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;
  const isNewsPage = pathname.startsWith(`/${locale}/news`);
  const isAiToolsPage = pathname.startsWith(`/${locale}/ai-tools`);
  const isBlogPage = pathname.startsWith(`/${locale}/blog`);
  const isPortfolioPage = pathname.startsWith(`/${locale}/landing`);
  const isContactPage = pathname.startsWith(`/${locale}/contact`);
  const isProfilePage = pathname.startsWith(`/${locale}/profile`);

  const tAITools = useTranslations("AITools");
  const toolsMenuItems = useMemo(
    () => [
      { label: tAITools("dropdown.topRated"), href: `${aiToolsHref}#top-rated` },
      { label: tAITools("dropdown.community"), href: comingSoonHref },
      { label: tAITools("dropdown.marketing"), href: `${aiToolsHref}#marketing` },
      { label: tAITools("dropdown.courses"), href: `${aiToolsHref}#courses` },
    ],
    [aiToolsHref, comingSoonHref, locale, tAITools]
  );

  // Get active tab index for smooth indicator animation
  const getActiveTabIndex = () => {
    if (isHomePage) return 0;
    if (isNewsPage) return 1;
    if (isAiToolsPage) return 2;
    if (isBlogPage) return 3;
    if (isContactPage) return 4;
    if (isPortfolioPage) return 5;
    return -1;
  };

  const activeTabIndex = getActiveTabIndex();
  // Always prioritize pendingTabIndex when it's set (user clicked a tab)
  // This prevents indicator from jumping back to current tab during navigation
  // Only use activeTabIndex when there's no pending navigation
  const visualTabIndex = pendingTabIndex !== null ? pendingTabIndex : activeTabIndex;

  // Update active indicator position when activeTabIndex or refs change
  React.useEffect(() => {
    if (visualTabIndex < 0) {
      setActiveIndicatorStyle({});
      return;
    }

    // Chọn đúng ref array dựa trên breakpoint
    const currentRefs = isDesktop ? navTabRefsDesktop : navTabRefsTablet;
    let resizeHandler: any;

    const updatePosition = (retry = 0) => {
      const activeTab = currentRefs.current[visualTabIndex];
      if (!activeTab) {
        if (retry < 10) {
          setTimeout(() => updatePosition(retry + 1), 100);
        } else {
          // Silent fail - tab ref not found
        }
        return;
      }

      const parent = activeTab.parentElement;
      if (!parent) {
        if (retry < 10) {
          setTimeout(() => updatePosition(retry + 1), 100);
        }
        return;
      }

      const parentRect = parent.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();

      if (tabRect.width > 0 && tabRect.height > 0) {
        setActiveIndicatorStyle({
          left: `${tabRect.left - parentRect.left}px`,
          width: `${tabRect.width}px`,
        });
      } else if (retry < 10) {
        setTimeout(() => updatePosition(retry + 1), 100);
      }
    };

    const rafId = requestAnimationFrame(updatePosition);
    const t1 = setTimeout(updatePosition, 100);
    const t2 = setTimeout(updatePosition, 300);
    const t3 = setTimeout(updatePosition, 500);

    resizeHandler = () => updatePosition(0);
    window.addEventListener("resize", resizeHandler);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("resize", resizeHandler);
    };
  }, [visualTabIndex, pathname, isDesktop]);

  // Force update position when component mounts or layout changes
  React.useEffect(() => {
    if (visualTabIndex >= 0) {
      // Chọn đúng ref array dựa trên breakpoint
      const currentRefs = isDesktop ? navTabRefsDesktop : navTabRefsTablet;
      // Use a longer delay to ensure DOM is fully rendered
      const timeoutId = setTimeout(() => {
        const activeTab = currentRefs.current[visualTabIndex];
        if (activeTab) {
          const parent = activeTab.parentElement;
          if (parent) {
            const parentRect = parent.getBoundingClientRect();
            const tabRect = activeTab.getBoundingClientRect();
            if (tabRect.width > 0 && tabRect.height > 0) {
              setActiveIndicatorStyle({
                left: `${tabRect.left - parentRect.left}px`,
                width: `${tabRect.width}px`,
              });
            }
          }
        }
      }, 600);
      return () => clearTimeout(timeoutId);
    }
  }, [visualTabIndex, isDesktop]);
  React.useEffect(() => {
    if (!isNavigating && pendingTabIndex !== null) {

      const timeoutId = setTimeout(() => {
        if (pendingTabIndex === activeTabIndex) {

          setPendingTabIndex(null);
        }
        // Nếu chưa khớp, giữ nguyên pendingTabIndex để indicator đứng tại tab mới
      }, 500); // Longer delay to ensure everything is settled

      return () => clearTimeout(timeoutId);
    }
  }, [isNavigating, pendingTabIndex, activeTabIndex]);

  // Reset pending tab when pathname changes and matches the pending tab
  // This is a secondary check to ensure pendingTabIndex is reset when navigation completes
  React.useEffect(() => {
    // Only reset if we have a pendingTabIndex and navigation is not in progress
    if (pendingTabIndex === null || isNavigating) {
      return;
    }

    // If pathname changed and matches the pending tab, reset after delay
    // This ensures indicator animation completes before resetting
    if (pendingTabIndex === activeTabIndex) {
      const timeoutId = setTimeout(() => {
        setPendingTabIndex(null);
      }, 400); // Delay to ensure smooth animation

      return () => clearTimeout(timeoutId);
    }
  }, [pathname, isNavigating, pendingTabIndex, activeTabIndex]);

  // Update activeTab based on current pathname
  React.useEffect(() => {
    if (isNewsPage) {
      setActiveTab("news");
    } else if (isAiToolsPage) {
      setActiveTab("tools");
    } else if (isBlogPage) {
      setActiveTab("blog");
    } else if (isPortfolioPage) {
      setActiveTab("portfolio");
    } else if (isHomePage) {
      // Reset to news tab when on home page, but don't show active indicator
      setActiveTab("news");
    }
  }, [pathname, isNewsPage, isAiToolsPage, isBlogPage, isHomePage]);

  React.useEffect(() => {
    setUserAvatarError(false);
  }, [userAvatarUrl]);

  // Avatar component with fallback
  const NotificationAvatar = React.memo(
    ({ src, alt }: { src?: string; alt?: string }) => {
      const [showFallback, setShowFallback] = useState(false);
      const username = alt || "U";
      const initials =
        username.length >= 2
          ? username.substring(0, 2).toUpperCase()
          : username.toUpperCase();

      if (showFallback || !src) {
        return (
          <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 ring-2 ring-emerald-300/80 relative overflow-hidden mr-[10px]">
            <span className="relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] text-white">
              {initials}
            </span>
          </div>
        );
      }

      return (
        <img
          src={src}
          alt={alt}
          className="w-[50px] h-[50px] rounded-full object-cover flex-shrink-0 mr-[10px]"
          onError={() => setShowFallback(true)}
        />
      );
    }
  );
  NotificationAvatar.displayName = "NotificationAvatar";

  // Parse notification HTML to extract avatar and content
  const safeNormalizeAvatar = (url?: string | null) => {
    if (!url) return undefined;
    try {
      return normalizeImageUrl(url);
    } catch {
      return url || undefined;
    }
  };

  const parseNotificationHtml = (html: string) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    const img = tempDiv.querySelector("img");
    let avatarSrc: string | undefined;
    let avatarAlt: string | undefined;
    let contentHtml = html;

    if (img) {
      avatarSrc = safeNormalizeAvatar(img.getAttribute("src"));
      avatarAlt = img.getAttribute("alt") || undefined;
      // Remove img tag from HTML
      img.remove();
      contentHtml = tempDiv.innerHTML;
    }

    const textContainer = tempDiv.cloneNode(true) as HTMLDivElement;
    textContainer.querySelectorAll("br").forEach((br) => {
      br.replaceWith("\n");
    });
    const rawText = textContainer.textContent || "";
    const segments = rawText
      .split(/\n+/)
      .map((segment) => segment.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    return { avatarSrc, avatarAlt, contentHtml, segments };
  };

  const formatNotificationSegments = (segments?: string[]) => {
    if (!segments || segments.length === 0) {
      return { headline: "", detailLines: [] as string[] };
    }

    const headlineParts: string[] = [];
    const detailLines: string[] = [];
    let movedToDetail = false;

    segments.forEach((segment) => {
      const clean = segment.trim();
      if (!clean) return;
      const startsWithStar = clean.startsWith("⭐");
      if (!movedToDetail && !startsWithStar) {
        headlineParts.push(clean);
      } else {
        movedToDetail = true;
        detailLines.push(clean);
      }
    });

    if (headlineParts.length === 0 && detailLines.length > 0) {
      headlineParts.push(detailLines.shift()!);
    }

    return {
      headline: headlineParts.join(" "),
      detailLines,
    };
  };

  // Memoize notification items with parsed avatar and content
  const memoizedNotifications = React.useMemo(() => {
    return notifications.map((notification) => {
      const sanitizedHtml = sanitizeHtml(notification.html, {
        allowedTags: ["div", "span", "strong", "em", "img", "br"],
        allowedAttributes: ["src", "alt", "class"],
      });

      const { avatarSrc, avatarAlt, contentHtml, segments } =
        parseNotificationHtml(sanitizedHtml);

      return {
        ...notification,
        avatarSrc,
        avatarAlt,
        contentHtml,
        segments,
      };
    });
  }, [notifications]);

  // Handle notification click - navigate to appropriate page
  const handleNotificationClick = React.useCallback(
    async (notification: {
      id: string;
      type?: string;
      html?: string;
      event?: {
        objectType: string;
        objectId: string;
        type?: string;
      };
    }) => {
      // Process notification click

      // ✅ Nếu không có event, thử parse từ HTML hoặc type
      if (!notification.event) {
        // Thử extract từ HTML nếu có
        if (notification.html) {
          const htmlDoc = new DOMParser().parseFromString(notification.html, 'text/html');

          // Tìm link đến tool
          const toolLink = htmlDoc.querySelector('a[href*="/ai-tools"], a[href*="tool"]');
          if (toolLink) {
            const href = toolLink.getAttribute('href') || '';
            const toolMatch = href.match(/tool[Id=]*([a-zA-Z0-9-]+)/i) || href.match(/ai-tools[^"]*toolId=([^&"#]+)/);
            if (toolMatch && toolMatch[1]) {
              setIsNavigating(true);
              setIsMobileMenuOpen(false);
              router.push(`/${locale}/ai-tools?toolId=${toolMatch[1]}`);
              return;
            }
          }

          // Tìm link đến blog
          const blogLink = htmlDoc.querySelector('a[href*="/blog/"]');
          if (blogLink) {
            const href = blogLink.getAttribute('href') || '';
            const match = href.match(/\/blog\/([^\/\?#]+)/);
            if (match && match[1]) {
              setIsNavigating(true);
              setIsMobileMenuOpen(false);
              router.push(`/${locale}/blog/${match[1]}`);
              return;
            }
          }
        }

        // Nếu không parse được từ HTML, return
        return;
      }

      const { objectType, objectId } = notification.event;
      const notificationType = notification.type || notification.event.type || "";

      // Process notification based on type

      // Check if this is a comment notification
      const isCommentNotification =
        objectType === "comment" ||
        notificationType.toLowerCase().includes("comment");

      // Check if this is a reaction notification
      const isReactionNotification =
        objectType === "reaction" ||
        notificationType.toLowerCase().includes("reaction") ||
        notificationType.toLowerCase().includes("react");

      // ✅ Check if this is a tool rating notification - cải thiện logic
      const isToolRatingNotification =
        objectType === "tool" ||
        objectType === "rating" ||
        notificationType.toLowerCase() === "tool_rated" ||
        notificationType.toLowerCase().includes("tool") ||
        notificationType.toLowerCase().includes("rating") ||
        notificationType.toLowerCase().includes("rate");

      // If it's a tool rating notification, navigate to ai-tools page with toolId
      if (isToolRatingNotification && objectId) {
        try {
          setIsNavigating(true);
          setIsMobileMenuOpen(false); // Close mobile menu before navigation

          // Navigate to ai-tools page with toolId as query parameter
          await router.push(`/${locale}/ai-tools?toolId=${objectId}`);

          // Wait for navigation and scroll to tool
          setTimeout(() => {
            const toolElement = document.getElementById(`tool-${objectId}`);
            if (toolElement) {
              toolElement.scrollIntoView({ behavior: "smooth", block: "center" });
              // Highlight the tool briefly
              toolElement.style.transition = "background-color 0.3s";
              toolElement.style.backgroundColor = "rgba(6, 182, 212, 0.1)";
              setTimeout(() => {
                toolElement.style.backgroundColor = "";
              }, 2000);
            } else {
              // If tool not found by ID, try to find by data-tool-id attribute
              const toolByAttr = document.querySelector(`[data-tool-id="${objectId}"]`);
              if (toolByAttr) {
                toolByAttr.scrollIntoView({ behavior: "smooth", block: "center" });
                (toolByAttr as HTMLElement).style.transition = "background-color 0.3s";
                (toolByAttr as HTMLElement).style.backgroundColor = "rgba(6, 182, 212, 0.1)";
                setTimeout(() => {
                  (toolByAttr as HTMLElement).style.backgroundColor = "";
                }, 2000);
              }
            }
          }, 800);
        } catch (error) {
          // Fallback: just navigate to ai-tools page
          router.push(`/${locale}/ai-tools`);
        }
        return;
      }

      // If it's a comment notification, we need to get the post from the comment
      if (isCommentNotification && objectId) {
        try {
          setIsNavigating(true);
          setIsMobileMenuOpen(false); // Close mobile menu before navigation

          // Try to extract post slug from notification HTML if available
          let postSlug: string | null = null;
          if (notification.html) {
            // Try to find blog post link in HTML
            const htmlDoc = new DOMParser().parseFromString(notification.html, 'text/html');
            const blogLink = htmlDoc.querySelector('a[href*="/blog/"]');
            if (blogLink) {
              const href = blogLink.getAttribute('href') || '';
              const match = href.match(/\/blog\/([^\/\?#]+)/);
              if (match && match[1]) {
                postSlug = match[1];
              }
            }
          }

          // If we found post slug from HTML, use it
          if (postSlug) {
            router.push(`/${locale}/blog/${postSlug}#comment-${objectId}`);

            // Wait for navigation and scroll to comment
            setTimeout(() => {
              const commentElement = document.getElementById(`comment-${objectId}`);
              if (commentElement) {
                commentElement.scrollIntoView({ behavior: "smooth", block: "center" });
                // Highlight the comment briefly
                commentElement.style.transition = "background-color 0.3s";
                commentElement.style.backgroundColor = "rgba(6, 182, 212, 0.3)";
                setTimeout(() => {
                  commentElement.style.backgroundColor = "";
                }, 2000);
              } else {
                // If comment not found, scroll to comments section
                const commentsSection = document.getElementById("comments-section");
                if (commentsSection) {
                  commentsSection.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }
            }, 800);
            return;
          }

          // If no post slug found, try to use objectId as post slug (fallback)
          router.push(`/${locale}/blog/${objectId}#comment-${objectId}`);

          // Wait for navigation and try to scroll to comment
          setTimeout(() => {
            const commentElement = document.getElementById(`comment-${objectId}`);
            if (commentElement) {
              commentElement.scrollIntoView({ behavior: "smooth", block: "center" });
              commentElement.style.transition = "background-color 0.3s";
              commentElement.style.backgroundColor = "rgba(6, 182, 212, 0.3)";
              setTimeout(() => {
                commentElement.style.backgroundColor = "";
              }, 2000);
            } else {
              // If comment not found, scroll to comments section
              const commentsSection = document.getElementById("comments-section");
              if (commentsSection) {
                commentsSection.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }
          }, 800);
        } catch (error) {
          // Fallback: just navigate to post (assuming objectId is post slug)
          router.push(`/${locale}/blog/${objectId}`);
        }
        return;
      }

      // If it's a blog post notification (reaction or other), navigate to the post
      if (objectType === "post" && objectId) {
        try {
          setIsNavigating(true);
          setIsMobileMenuOpen(false); // Close mobile menu before navigation

          // Try to fetch post by slug (objectId might be slug or ID)
          const post = await getPostBySlug(objectId);
          if (post?.slug) {
            router.push(`/${locale}/blog/${post.slug}`);
          } else {
            // If not found by slug, try using objectId as slug directly
            router.push(`/${locale}/blog/${objectId}`);
          }
        } catch (error) {
          // If fetch fails, try using objectId as slug directly
          router.push(`/${locale}/blog/${objectId}`);
        }
        return;
      }
    },
    [locale, router, setIsNavigating]
  );

  type MenuItem = {
    label: string;
    href: string;
    icon?: string;
    scrollId?: string;
    target?: string;
  };

  const menuSections: Record<"news" | "tools" | "blog" | "portfolio" | "contact", MenuItem[]> =
    useMemo(
      () => ({
        news: [
          {
            label: t("menuItems.featuredNews"),
            href: `/${locale}/news#featured-news`,
            scrollId: "featured-news",
          },
          {
            label: t("menuItems.newStories"),
            href: `/${locale}/news#new-stories`,
            scrollId: "new-stories",
          },
          {
            label: t("menuItems.featuredStories"),
            href: `/${locale}/news#featured-stories`,
            scrollId: "featured-stories",
          },
        ],
        tools: [
          {
            label: t("menuItems.beginner"),
            href: `/${locale}/ai-tools#beginner`,
            scrollId: "beginner",
          },
          {
            label: t("menuItems.developer"),
            href: `/${locale}/ai-tools#developer`,
            scrollId: "developer",
          },
          {
            label: t("menuItems.designer"),
            href: `/${locale}/ai-tools#designer`,
            scrollId: "designer",
          },
          {
            label: t("menuItems.marketing"),
            href: `/${locale}/ai-tools#marketing`,
            scrollId: "marketing",
          },
          {
            label: t("menuItems.creator"),
            href: `/${locale}/ai-tools#creator`,
            scrollId: "creator",
          },
        ],
        blog: [
          {
            label: t("menuItems.community"),
            href: `/${locale}/blog#blog-content`,
            icon: "/icon/users-03.svg",
            scrollId: "blog-content",
          },
          {
            label: t("menuItems.writeBlog"),
            href: `/${locale}/blog/write`,
            icon: "/icon/pencil-line.svg",
          },
          {
            label: t("menuItems.myPost"),
            href: `/${locale}/blog/my-post`,
            icon: "/icon/file-05.svg",
          },
          {
            label: t("menuItems.activityLog"),
            href: `/${locale}/blog/activity-log`,
            icon: "/icon/zap-fast.svg",
          },
        ],
        portfolio: [
          {
            label: t("portfolio"),
            href: portfolioHref,
            target: "_blank",
          },
        ],
        contact: [
          {
            label: t("contact"),
            href: contactHref,
          },
          {
            label: "Support Center",
            href: `${contactHref}#support`,
            scrollId: "support",
          },
          {
            label: "Partnerships",
            href: `${contactHref}#partnership`,
            scrollId: "partnership",
          },
        ],
      }),
      [t, locale, contactHref]
    );

  const getNavItemStyle = React.useCallback((isActive: boolean) => {
    const className = `relative px-3 py-1 rounded-full font-semibold transition-all duration-300 cursor-pointer ${isActive
      ? "text-[#0B5A5C] z-10"
      : "font-medium text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:shadow-lg hover:shadow-cyan-500/20"
      }`;

    // No inline style for active tab - indicator handles the background
    const style = {};

    return { className, style };
  }, []);

  return (
    <header className="w-full h-[70px] sm:h-[102px] bg-[#05070B] backdrop-blur-sm z-50">
      <div className="px-4 sm:px-8 w-full h-full">
        {/* Desktop Layout (>= 10240px) */}
        <div className="hidden lg:flex items-center h-full">
          <div className="flex items-center shrink-0">
            <Link
              href={homeHref}
              className="flex items-center transition-all duration-300 cursor-pointer group"
              onClick={(e) => {
                // Prevent navigation and loading if already on home page
                if (isHomePage) {
                  e.preventDefault();
                  return;
                }
                handleNavigation();
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon/logo.svg"
                alt="AI HUB"
                className="h-8 w-auto transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(159,243,223,0.6)] group-hover:brightness-110"
                style={{ imageRendering: "auto" }}
              />
            </Link>
          </div>

          <div className="w-[27px] shrink-0" />

          <nav className="shrink-0">
            <ul className="relative flex items-center gap-1 h-10 px-1 rounded-full bg-[#1c2230]/80 backdrop-blur">
              {/* Active indicator with smooth animation */}
              {visualTabIndex >= 0 &&
                activeIndicatorStyle.left &&
                activeIndicatorStyle.width && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-y-1 rounded-full bg-gradient-to-b from-[#9FF3DF] to-[#17EFF7] shadow-[0_4px_8px_0_rgba(83,234,253,0.50)] z-0"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                    style={activeIndicatorStyle}
                  />
                )}

              <li
                ref={(el) => {
                  navTabRefsDesktop.current[0] = el;
                }}
                className={getNavItemStyle(visualTabIndex === 0).className}
                style={getNavItemStyle(visualTabIndex === 0).style}
              >
                <Link
                  href={homeHref}
                  prefetch={true}
                  className="relative z-10 block cursor-pointer text-base sm:text-lg -mx-2 -my-1 px-3 py-2 whitespace-nowrap"
                  onClick={(e) => {
                    // Prevent navigation and loading if already on home page
                    if (isHomePage) {
                      e.preventDefault();
                      return;
                    }
                    setPendingTabIndex(0);
                    handleNavigation();
                  }}
                >
                  {t("home")}
                </Link>
              </li>
              {/* <li
                ref={(el) => {
                  navTabRefsDesktop.current[1] = el;
                }}
                className={getNavItemStyle(visualTabIndex === 1).className}
                style={getNavItemStyle(visualTabIndex === 1).style}
              >
                <Link
                  href={newsHref}
                  prefetch={true}
                  className="relative z-10 block cursor-pointer text-base sm:text-lg -mx-2 -my-1 px-3 py-2 whitespace-nowrap"
                  onMouseEnter={() => handlePrefetch(newsHref)}
                  onClick={(e) => {
                    // Prevent navigation and loading if already on news page
                    if (isNewsPage) {
                      e.preventDefault();
                      return;
                    }
                    setPendingTabIndex(1);
                    handleNavigation();
                  }}
                >
                  {t("news")}
                </Link>
              </li> */}
              <li
                ref={(el) => {
                  navTabRefsDesktop.current[2] = el;
                }}
                className={`${getNavItemStyle(visualTabIndex === 2).className} group relative`}
                style={getNavItemStyle(visualTabIndex === 2).style}
                onMouseEnter={() => {
                  // Only show dropdown on hover for tablet and desktop (sm and above, >= 640px)
                  // Hide hover on mobile only (< 640px)
                  if (window.innerWidth >= 640) {
                    cancelToolsMenuClose();
                    setIsToolsDropdownOpen(true);
                  }
                }}
                onMouseLeave={() => {
                  // Only hide dropdown on hover for tablet and desktop (sm and above, >= 640px)
                  // Hide hover on mobile only (< 640px)
                  if (window.innerWidth >= 640) {
                    scheduleToolsMenuClose();
                  }
                }}
              >
                {isToolsDropdownOpen && (
                  <div
                    className="absolute left-0 right-0 top-full h-2 z-40"
                    onMouseEnter={cancelToolsMenuClose}
                    onMouseLeave={scheduleToolsMenuClose}
                  />
                )}
                <Link
                  ref={toolsTriggerRef}
                  href={aiToolsHref}
                  prefetch={true}
                  className="relative z-10 block cursor-pointer text-base sm:text-lg -mx-2 -my-1 px-3 py-2 whitespace-nowrap"
                  onClick={(e) => {
                    // Prevent navigation and loading if already on AI tools page
                    if (isAiToolsPage) {
                      e.preventDefault();
                      return;
                    }
                    setPendingTabIndex(2);
                    handleNavigation();
                  }}
                  onKeyDown={(e) => {
                    // Open dropdown with ArrowDown, Enter, or Space
                    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (!isToolsDropdownOpen) {
                        openToolsMenu();
                      } else {
                        setToolsFocusedIndex((prev) => {
                          const next = prev < 0 ? 0 : Math.min(prev + 1, toolsMenuItems.length - 1);
                          toolsItemRefs.current[next]?.focus();
                          return next;
                        });
                      }
                    }
                    // Close with Escape is handled globally
                  }}
                  aria-haspopup="menu"
                  aria-expanded={isToolsDropdownOpen}
                  aria-controls="ai-tools-menu"
                >
                  {t("aiTools")}
                </Link>
                {/* Tools Dropdown (Tablet and Desktop - hidden on mobile only) */}
                {isToolsDropdownOpen && (
                  <div
                    ref={toolsMenuRef}
                    id="ai-tools-menu"
                    className="hidden sm:block absolute left-0 top-full mt-2 bg-[#0f1420]/95 backdrop-blur-md text-white rounded-lg border border-[#9ff3df]/60 shadow-[0_10px_30px_rgba(0,0,0,0.35)] px-2.5 py-2 z-50 w-64 origin-top animate-in fade-in-0 zoom-in-95"
                    role="menu"
                    aria-label="AI Tools menu"
                    onMouseEnter={cancelToolsMenuClose}
                    onMouseLeave={scheduleToolsMenuClose}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setToolsFocusedIndex((prev) => {
                          const next = Math.min(prev + 1, toolsMenuItems.length - 1);
                          toolsItemRefs.current[next]?.focus();
                          return next;
                        });
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setToolsFocusedIndex((prev) => {
                          const next = Math.max((prev < 0 ? 1 : prev) - 1, 0);
                          toolsItemRefs.current[next]?.focus();
                          return next;
                        });
                      } else if (e.key === "Home") {
                        e.preventDefault();
                        setToolsFocusedIndex(0);
                        toolsItemRefs.current[0]?.focus();
                      } else if (e.key === "End") {
                        e.preventDefault();
                        const last = toolsMenuItems.length - 1;
                        setToolsFocusedIndex(last);
                        toolsItemRefs.current[last]?.focus();
                      } else if (e.key === "Tab") {
                        // Close on tabbing away
                        closeToolsMenu();
                      }
                    }}
                  >
                    {toolsMenuItems.map((item, idx) => (
                      <Link
                        key={item.href}
                        ref={(el) => {
                          toolsItemRefs.current[idx] = el;
                        }}
                        href={item.href}
                        role="menuitem"
                        tabIndex={0}
                        className="relative flex items-center justify-between px-3 py-2 rounded-md text-sm text-white/90 hover:text-white hover:bg-white/5 focus:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 transition-colors"
                        onMouseEnter={() => setToolsHoverIndex(idx)}
                        onMouseLeave={() => setToolsHoverIndex(-1)}
                        onFocus={() => setToolsHoverIndex(idx)}
                        onBlur={() => setToolsHoverIndex(-1)}
                        onClick={(e) => {
                          const hashIndex = item.href.indexOf("#");
                          if (hashIndex > -1) {
                            const basePath = item.href.substring(0, hashIndex);
                            const targetId = item.href.substring(hashIndex + 1);
                            const currentBase = `/${locale}/ai-tools`;
                            // Only prevent navigation if we're on the exact ai-tools page (not sub-pages)
                            // If on sub-page like /ai-tools/courses, always navigate to main page first
                            const isExactAiToolsPage = pathname === currentBase || pathname === `${currentBase}/`;
                            if (isExactAiToolsPage) {
                              e.preventDefault();
                              closeToolsMenu();
                              setTimeout(() => {
                                const el = document.getElementById(targetId);
                                if (el) {
                                  const rect = el.getBoundingClientRect();
                                  const offset = window.innerWidth >= 640 ? 102 : 70;
                                  const top = window.scrollY + rect.top - offset - 8;
                                  window.scrollTo({ top, behavior: "smooth" });
                                } else {
                                  window.location.hash = `#${targetId}`;
                                }
                              }, 50);
                              return;
                            }
                            // If on sub-page, navigate to main page first, then scroll to section
                            // Let the link navigate normally, it will go to /ai-tools#targetId
                          }
                          closeToolsMenu();
                          handleNavigation();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            closeToolsMenu();
                          }
                        }}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none absolute left-1 top-1 bottom-1 w-1 rounded-full bg-gradient-to-b from-[#9FF3DF] to-[#17EFF7] transition-opacity duration-150 ${toolsHoverIndex === idx || toolsFocusedIndex === idx ? "opacity-100" : "opacity-0"}`}
                        />
                        <span>{item.label}</span>
                        <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/70" />
                      </Link>
                    ))}
                  </div>
                )}
              </li>
              <li
                ref={(el) => {
                  navTabRefsDesktop.current[3] = el;
                }}
                className={getNavItemStyle(visualTabIndex === 3).className}
                style={getNavItemStyle(visualTabIndex === 3).style}
              >
                <Link
                  href={blogHref}
                  prefetch={true}
                  className="relative z-10 block cursor-pointer text-base sm:text-lg -mx-2 -my-1 px-3 py-2 whitespace-nowrap"
                  onClick={(e) => {
                    // Prevent navigation and loading if already on blog page
                    if (isBlogPage) {
                      e.preventDefault();
                      return;
                    }
                    setPendingTabIndex(3);
                    handleNavigation();
                  }}
                >
                  {t("blog")}
                </Link>
              </li>
              <li
                ref={(el) => {
                  navTabRefsDesktop.current[4] = el;
                }}
                className={getNavItemStyle(visualTabIndex === 4).className}
                style={getNavItemStyle(visualTabIndex === 4).style}
              >
                <Link
                  href={contactHref}
                  className="relative z-10 block cursor-pointer text-base sm:text-lg -mx-2 -my-1 px-3 py-2 whitespace-nowrap"
                  onClick={(e) => {
                    if (isContactPage) {
                      e.preventDefault();
                      return;
                    }
                    setPendingTabIndex(4);
                    handleNavigation();
                  }}
                >
                  {t("contact")}
                </Link>
              </li>
              <li
                ref={(el) => {
                  navTabRefsDesktop.current[5] = el;
                }}
                className={getNavItemStyle(visualTabIndex === 5).className}
                style={getNavItemStyle(visualTabIndex === 5).style}
              >
                <Link
                  href={portfolioHref}
                  target="_blank"
                  className="relative z-10 block cursor-pointer text-base sm:text-lg -mx-2 -my-1 px-3 py-2 whitespace-nowrap"
                >
                  {t("portfolio")}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="w-[27px] shrink-0" />

          <div className="flex-1">
            <div className="group flex items-center gap-2 h-10 px-3 rounded-xl bg-linear-to-b from-[#1c2431] to-[#11151d] border border-transparent hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 cursor-text">
              <Search className="w-5 h-5 text-gray-400 transition-colors duration-300 group-hover:text-cyan-400" />
              <input
                type="search"
                name="header-search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={t("searchPlaceholder")}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                role="searchbox"
                aria-label="Search"
                className="w-full bg-transparent text-gray-300 text-sm outline-none placeholder-[#D5D7DA] group-hover:placeholder-gray-400 focus:text-white transition-colors duration-300"
              />
            </div>
          </div>

          <div className="w-[27px] shrink-0" />

          <div className="flex gap-3 items-center shrink-0">
            <Suspense fallback={null}>
              <LanguageSwitcher />
            </Suspense>

            {/* Notification */}
            <div className="relative z-100">
              <button
                ref={bellButtonRef}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Toggle notification dropdown - close if already open
                  setIsNotificationOpen((prev) => !prev);
                }}
                className={`group w-10 h-10 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer -mx-1 -my-1 px-1 py-1 ${isNotificationOpen
                  ? "bg-linear-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-500/50 shadow-lg shadow-cyan-500/30"
                  : "bg-[#11151d] hover:bg-linear-to-br hover:from-cyan-500/20 hover:to-blue-500/20 hover:shadow-lg hover:shadow-cyan-500/20 border border-transparent hover:border-cyan-500/30"
                  }`}
              >
                <Bell
                  className={`w-5 h-5 transition-all duration-300 ${isNotificationOpen
                    ? "text-cyan-300 drop-shadow-[0_0_4px_rgba(0,255,255,0.5)]"
                    : "text-gray-200 group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_4px_rgba(0,255,255,0.5)]"
                    }`}
                />
              </button>
              {unreadCount > 0 && isAuthenticated && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-badge-xs font-bold text-white shadow-lg bg-linear-to-br from-red-500 to-red-600">
                  {unreadCount}
                </span>
              )}
              <NotificationDropdown
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                bellButtonRef={bellButtonRef}
              />
            </div>

            {/* Profile */}
            {isAuthenticated ? (
              <Link
                href={profileHref}
                onClick={(e) => {
                  if (isProfilePage) {
                    e.preventDefault();
                    return;
                  }
                  handleNavigation();
                }}
                className="group w-10 h-10 rounded-xl bg-[#11151d] hover:bg-linear-to-br hover:from-cyan-500/20 hover:to-blue-500/20 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 flex items-center justify-center border border-transparent hover:border-cyan-500/30 cursor-pointer"
              >
                <User className="w-5 h-5 text-gray-200 group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_4px_rgba(0,255,255,0.5)] transition-all duration-300" />
              </Link>
            ) : (
              <Link
                href={`/${locale}/auth/signin`}
                className="group w-10 h-10 rounded-xl bg-[#11151d] hover:bg-linear-to-br hover:from-cyan-500/20 hover:to-blue-500/20 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 flex items-center justify-center border border-transparent hover:border-cyan-500/30 cursor-pointer"
                title="Profile"
              >
                <User className="w-5 h-5 text-gray-200 group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_4px_rgba(0,255,255,0.5)] transition-all duration-300" />
              </Link>
            )}

            {/* Sign In */}
            {!isAuthenticated && (
              <Link
                href={`/${locale}/auth/signin`}
                className="group h-10 px-4 rounded-xl bg-linear-to-b from-[#00FFD1] to-[#00C8FF] text-[#0B5A5C] font-semibold hover:shadow-lg hover:shadow-cyan-400/40 hover:brightness-105 hover:saturate-110 transition-all duration-300 flex items-center justify-center cursor-pointer transform hover:-translate-y-0.5"
              >
                <span className="group-hover:drop-shadow-[0_0_6px_rgba(11,90,92,0.9)] transition-all duration-300">
                  {t("signIn")}
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Tablet Layout (640px - 1023px) */}
        <div className="hidden sm:flex lg:hidden items-center justify-between h-full">
          {/* Logo */}
          <Link
            href={homeHref}
            className="flex items-center transition-all duration-300 cursor-pointer group"
            onClick={(e) => {
              // Prevent navigation and loading if already on home page
              if (isHomePage) {
                e.preventDefault();
                return;
              }
              handleNavigation();
            }}
          >
            <img
              src="/icon/logo.svg"
              alt="AI HUB"
              className="h-6 w-auto"
              style={{ imageRendering: "auto" }}
            />
          </Link>

          {/* Navigation Pills */}
          <nav className="flex justify-center flex-1 max-w-[75%] mx-auto shrink-0 px-1">
            <ul className="relative flex items-center justify-center gap-1 h-10 px-3 rounded-full bg-[#1c2230]/80 backdrop-blur w-full max-w-[530px]">
              {visualTabIndex >= 0 &&
                activeIndicatorStyle.left &&
                activeIndicatorStyle.width && (
                  <motion.div
                    layoutId="activeTabTablet"
                    className="absolute inset-y-1 rounded-full bg-gradient-to-b from-[#9FF3DF] to-[#17EFF7] shadow-[0_4px_8px_0_rgba(83,234,253,0.50)] z-0"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                    style={activeIndicatorStyle}
                  />
                )}

              <li
                ref={(el) => {
                  navTabRefsTablet.current[0] = el;
                }}
                className={getNavItemStyle(visualTabIndex === 0).className}
              >
                <Link
                  href={homeHref}
                  className="relative z-10 block cursor-pointer text-base sm:text-lg -mx-2 -my-1 px-3 py-2 whitespace-nowrap"
                  onClick={(e) => {
                    if (isHomePage) {
                      e.preventDefault();
                      return;
                    }
                    setPendingTabIndex(0);
                    handleNavigation();
                  }}
                >
                  {t("home")}
                </Link>
              </li>
              <li
                ref={(el) => {
                  navTabRefsTablet.current[1] = el;
                }}
                className={getNavItemStyle(visualTabIndex === 1).className}
              >
                <Link
                  href={newsHref}
                  prefetch={true}
                  className="relative z-10 block cursor-pointer text-base sm:text-lg -mx-2 -my-1 px-3 py-2 whitespace-nowrap"
                  onClick={(e) => {
                    if (isNewsPage) {
                      e.preventDefault();
                      return;
                    }
                    setPendingTabIndex(1);
                    handleNavigation();
                  }}
                >
                  {t("news")}
                </Link>
              </li>
              <li
                ref={(el) => {
                  navTabRefsTablet.current[2] = el;
                }}
                className={getNavItemStyle(visualTabIndex === 2).className}
              >
                <Link
                  href={aiToolsHref}
                  className="relative z-10 block cursor-pointer text-base sm:text-lg -mx-2 -my-1 px-3 py-2 whitespace-nowrap"
                  onClick={(e) => {
                    if (isAiToolsPage) {
                      e.preventDefault();
                      return;
                    }
                    setPendingTabIndex(2);
                    handleNavigation();
                  }}
                >
                  {t("aiTools")}
                </Link>
              </li>
              <li
                ref={(el) => {
                  navTabRefsTablet.current[3] = el;
                }}
                className={getNavItemStyle(visualTabIndex === 3).className}
              >
                <Link
                  href={blogHref}
                  className="relative z-10 block cursor-pointer text-base sm:text-lg -mx-2 -my-1 px-3 py-2 whitespace-nowrap"
                  onClick={(e) => {
                    if (isBlogPage) {
                      e.preventDefault();
                      return;
                    }
                    setPendingTabIndex(3);
                    handleNavigation();
                  }}
                >
                  {t("blog")}
                </Link>
              </li>
              <li
                ref={(el) => {
                  navTabRefsTablet.current[4] = el;
                }}
                className={getNavItemStyle(visualTabIndex === 4).className}
              >
                <Link
                  href={contactHref}
                  className="relative z-10 block cursor-pointer text-base sm:text-lg -mx-2 -my-1 px-3 py-2 whitespace-nowrap"
                  onClick={(e) => {
                    if (isContactPage) {
                      e.preventDefault();
                      return;
                    }
                    setPendingTabIndex(4);
                    handleNavigation();
                  }}
                >
                  {t("contact")}
                </Link>
              </li>
              <li
                ref={(el) => {
                  navTabRefsTablet.current[5] = el;
                }}
                className={getNavItemStyle(visualTabIndex === 5).className}
              >
                <Link
                  href={portfolioHref}
                  target="_blank"
                  className="relative z-10 block cursor-pointer text-base sm:text-lg -mx-2 -my-1 px-3 py-2 whitespace-nowrap"
                >
                  {t("portfolio")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Right Actions */}
          <div className="flex gap-2 items-center shrink-0 relative">
            {/* Search Icon - Always visible */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="group w-12 h-12 rounded-full bg-[#11151d] hover:bg-linear-to-br hover:from-cyan-500/20 hover:to-blue-500/20 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 flex items-center justify-center border border-transparent hover:border-cyan-500/30 cursor-pointer"
            >
              <Search className="w-5 h-5 text-gray-200 group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_6px_rgba(0,255,255,0.5)] transition-all duration-300" />
            </button>

            {isAuthenticated ? (
              <>
                <LanguageSwitcher />
                <div className="relative z-100">
                  <button
                    ref={bellButtonRef}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsNotificationOpen((prev) => !prev);
                    }}
                    className={`group w-10 h-10 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer -mx-1 -my-1 px-1 py-1 ${isNotificationOpen
                      ? "bg-linear-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-500/50 shadow-lg shadow-cyan-500/30"
                      : "bg-[#11151d] hover:bg-linear-to-br hover:from-cyan-500/20 hover:to-blue-500/20 hover:shadow-lg hover:shadow-cyan-500/20 border border-transparent hover:border-cyan-500/30"
                      }`}
                  >
                    <Bell
                      className={`w-5 h-5 transition-all duration-300 ${isNotificationOpen
                        ? "text-cyan-300 drop-shadow-[0_0_4px_rgba(0,255,255,0.5)]"
                        : "text-gray-200 group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_4px_rgba(0,255,255,0.5)]"
                        }`}
                    />
                  </button>
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-badge-xs font-bold text-white shadow-lg bg-linear-to-br from-red-500 to-red-600">
                      {unreadCount}
                    </span>
                  )}
                  <NotificationDropdown
                    isOpen={isNotificationOpen}
                    onClose={() => setIsNotificationOpen(false)}
                    bellButtonRef={bellButtonRef}
                  />
                </div>

                {/* Profile */}
                <Link
                  href={profileHref}
                  onClick={(e) => {
                    if (isProfilePage) {
                      e.preventDefault();
                      return;
                    }
                    handleNavigation();
                  }}
                  className="group w-10 h-10 rounded-xl bg-[#11151d] hover:bg-linear-to-br hover:from-cyan-500/20 hover:to-blue-500/20 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 flex items-center justify-center border border-transparent hover:border-cyan-500/30 cursor-pointer"
                >
                  <User className="w-5 h-5 text-gray-200 group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_4px_rgba(0,255,255,0.5)] transition-all duration-300" />
                </Link>
              </>
            ) : (
              /* Before Login - Only Sign In button */
              <Link
                href={`/${locale}/auth/signin`}
                className="group h-10 px-4 rounded-xl bg-linear-to-b from-[#00FFD1] to-[#00C8FF] text-[#0B5A5C] font-semibold hover:shadow-lg hover:shadow-cyan-400/40 hover:brightness-105 hover:saturate-110 transition-all duration-300 flex items-center justify-center cursor-pointer transform hover:-translate-y-0.5"
              >
                <span className="group-hover:drop-shadow-[0_0_6px_rgba(11,90,92,0.9)] transition-all duration-300 text-sm">
                  {t("signIn")}
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile and Tablet Search Bar */}
        {isMobileSearchOpen && (
          <div className="hidden sm:flex lg:hidden absolute left-0 right-0 top-[102px] bg-[#05070B] px-4 sm:px-6 py-3 border-t border-cyan-500/20 z-40 animate-in slide-in-from-top-2 duration-200">
            <div className="group flex items-center gap-2 h-10 px-3 rounded-xl bg-linear-to-b from-[#1c2431] to-[#11151d] border border-cyan-500/30 w-full">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={t("searchPlaceholder")}
                autoComplete="off"
                className="w-full bg-transparent text-gray-300 text-sm outline-none placeholder-[#D5D7DA]"
              />
            </div>
          </div>
        )}

        {/* Mobile Layout (< 640px) */}
        <div className="flex sm:hidden items-center justify-between h-full">
          {/* Logo with Featured News Image Background */}
          <Link
            href={homeHref}
            className="flex items-center relative"
            onClick={(e) => {
              // Prevent navigation and loading if already on home page
              if (isHomePage) {
                e.preventDefault();
                return;
              }
              handleNavigation();
            }}
          >
            {featuredNewsImage && (
              <div className="absolute -left-2 -top-2 w-10 h-10 rounded-lg overflow-hidden opacity-20 blur-sm">
                <Image
                  src={featuredNewsImage}
                  alt="Featured News"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            )}
            <img
              src="/icon/logo.svg"
              alt="AI HUB"
              className="h-6 w-auto relative z-10"
              style={{ imageRendering: "auto" }}
            />
          </Link>

          {/* Right Side Icons */}
          <div className="flex items-center gap-3">
            {/* Search Icon */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="w-10 h-10 flex items-center justify-center text-white"
            >
              <Search className="w-6 h-6" />
            </button>

            {/* Hamburger Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 flex items-center justify-center text-white"
            >
              {isMobileMenuOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <Menu className="w-7 h-7" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isMobileSearchOpen && (
          <div className="sm:hidden absolute left-0 right-0 top-[70px] bg-[#05070B] px-4 py-3 border-t border-cyan-500/20 z-40 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-linear-to-b from-[#1c2431] to-[#11151d] border border-cyan-500/30">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={t("searchPlaceholder")}
                autoComplete="off"
                className="w-full bg-transparent text-gray-300 text-sm outline-none placeholder-[#D5D7DA]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sliding Menu - FROM TOP */}
      <div
        className={`sm:hidden fixed left-0 right-0 bg-[#0a0e1a] shadow-2xl z-40 transition-all duration-300 ease-out overflow-y-auto mobile-menu-scroll ${isMobileMenuOpen
          ? "top-[70px] max-h-[calc(100vh-70px)] opacity-100"
          : "top-0 max-h-0 opacity-0 pointer-events-none"
          }`}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(34, 211, 238, 0.3) rgba(10, 14, 26, 0.8)",
          overscrollBehavior: "contain",
          touchAction: "pan-y",
        }}
        onTouchMove={(e) => {
          // Prevent scroll propagation to body when scrolling menu
          e.stopPropagation();
        }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .mobile-menu-scroll::-webkit-scrollbar {
                width: 6px;
              }
              .mobile-menu-scroll::-webkit-scrollbar-track {
                background: rgba(10, 14, 26, 0.8);
                border-radius: 10px;
              }
              .mobile-menu-scroll::-webkit-scrollbar-thumb {
                background: rgba(34, 211, 238, 0.3);
                border-radius: 10px;
                border: 1px solid rgba(10, 14, 26, 0.5);
              }
              .mobile-menu-scroll::-webkit-scrollbar-thumb:hover {
                background: rgba(34, 211, 238, 0.5);
              }
            `,
          }}
        />
        <div className="pb-6">
          {/* User Profile Section */}
          <div className="border-b border-cyan-500/20">
            {isAuthenticated ? (
              <div className="px-4 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center overflow-hidden">
                    {!userAvatarError && userAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={userAvatarUrl || undefined}
                        alt={user?.name || "User Avatar"}
                        className="w-full h-full object-cover"
                        onError={() => setUserAvatarError(true)}
                      />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">
                      {user?.name || t("user")}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    href={profileHref}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (!isProfilePage) {
                        handleNavigation();
                      }
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="px-4 py-4">
                <p className="text-gray-300 text-sm mb-3">
                  {t("welcomeMessage")}{" "}
                  <span className="text-cyan-400 font-semibold">
                    {t("time")}
                  </span>
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/${locale}/auth/signup`}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleNavigation();
                    }}
                    className="flex-1 h-9 rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-500 text-[#0B5A5C] font-semibold text-sm hover:brightness-110 transition-all flex items-center justify-center"
                  >
                    {t("signUp")}
                  </Link>
                  <Link
                    href={`/${locale}/auth/signin`}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleNavigation();
                    }}
                    className="flex-1 h-9 rounded-lg border border-cyan-500/50 text-cyan-400 font-semibold text-sm hover:bg-cyan-500/10 transition-all flex items-center justify-center"
                  >
                    {t("signIn")}
                  </Link>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="flex border-b border-cyan-500/20">
              {[
                { key: "news", label: t("news"), href: newsHref, active: isNewsPage },
                { key: "tools", label: t("aiTools"), href: aiToolsHref, active: isAiToolsPage },
                { key: "blog", label: t("blog"), href: blogHref, active: isBlogPage },
                { key: "contact", label: t("contact"), href: contactHref, active: isContactPage },
                { key: "portfolio", label: t("portfolio"), href: portfolioHref, active: isPortfolioPage },
              ].map((item) => (
                <button
                  key={item.key}
                  onMouseEnter={() => {
                    if (item.key !== "contact" && activeTab !== item.key && item.key !== "portfolio") {
                      prefetchMobileMenuContent(item.key as "news" | "tools" | "blog");
                    }
                  }}
                  onClick={(e) => {
                    setActiveTab(item.key);
                    setIsMobileToolsSubmenuOpen(false);
                    // Don't close menu for portfolio as it's non-interactive/placeholder
                    if (item.key === "portfolio") {
                      e.preventDefault();
                      return;
                    }
                    setIsMobileMenuOpen(false);

                    if (!item.active && item.key !== "portfolio") { // Modified condition
                      router.push(item.href);
                      handleNavigation();
                    }
                  }}
                  className={`flex-1 py-3 text-base sm:text-lg font-medium transition-colors relative ${activeTab === item.key && !isHomePage
                    ? "text-cyan-400"
                    : "text-gray-400"
                    }`}
                >
                  {item.label}
                  {activeTab === item.key && !isHomePage && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Content Panel */}
          <div className="px-4 py-4">
            <MobileMenuFeaturedContent
              activeTab={activeTab as "news" | "tools" | "blog" | "contact" | "portfolio"}
            />

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (activeTab === "news") {
                  router.push(newsHref);
                } else if (activeTab === "tools") {
                  router.push(aiToolsHref);
                } else if (activeTab === "blog") {
                  router.push(blogHref);
                } else if (activeTab === "portfolio") {
                  // Portfolio is currently non-interactive
                  // router.push(portfolioHref);
                } else if (activeTab === "contact") {
                  router.push(contactHref);
                }
                handleNavigation();
              }}
              className="w-full mt-3 h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-[#0B5A5C] font-semibold hover:brightness-110 transition-all"
            >
              {activeTab === "news" && t("exploreNews")}
              {activeTab === "tools" && t("exploreAITools")}
              {activeTab === "blog" && t("exploreBlog")}
              {activeTab === "portfolio" && t("explorePortfolio")}
              {activeTab === "contact" && "CONTACT US"}
            </button>
          </div>

          {/* AI Tools Dropdown Menu (Mobile) - Only show when tools tab is active */}
          {activeTab === "tools" && (
            <div className="px-4 pb-4">
              <div className="mb-3">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2 px-2">
                  {t("aiTools")}
                </p>
                {toolsMenuItems.map((item, idx) => {
                  const handleSubmenuClick = (e: React.MouseEvent) => {
                    setIsMobileMenuOpen(false);

                    const hashIndex = item.href.indexOf("#");
                    if (hashIndex > -1) {
                      const basePath = item.href.substring(0, hashIndex);
                      const targetId = item.href.substring(hashIndex + 1);
                      const currentBase = `/${locale}/ai-tools`;
                      const isExactAiToolsPage = pathname === currentBase || pathname === `${currentBase}/`;

                      if (isExactAiToolsPage) {
                        e.preventDefault();
                        setTimeout(() => {
                          const el = document.getElementById(targetId);
                          if (el) {
                            const rect = el.getBoundingClientRect();
                            const offset = 70;
                            const top = window.scrollY + rect.top - offset - 8;
                            window.scrollTo({ top, behavior: "smooth" });
                          }
                        }, 100);
                      } else {
                        handleNavigation();
                        setTimeout(() => {
                          const el = document.getElementById(targetId);
                          if (el) {
                            const rect = el.getBoundingClientRect();
                            const offset = 70;
                            const top = window.scrollY + rect.top - offset - 8;
                            window.scrollTo({ top, behavior: "smooth" });
                          }
                        }, 500);
                      }
                    } else {
                      handleNavigation();
                    }
                  };

                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={handleSubmenuClick}
                      className="w-full flex items-center justify-between px-4 py-3 mb-2 rounded-xl bg-[#1a2332]/50 hover:bg-cyan-500/10 text-gray-300 hover:text-white transition-all group"
                    >
                      <span className="text-sm font-medium">{item.label}</span>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="px-4">
            {menuSections[activeTab as keyof typeof menuSections].map(
              (item, index) => {
                const handleMenuClick = (e: React.MouseEvent) => {
                  setIsMobileMenuOpen(false);
                  if (item.target === "_blank") return;

                  if (item.scrollId) {
                    const hashIndex = item.href.indexOf("#");
                    const targetPath =
                      hashIndex >= 0
                        ? item.href.substring(0, hashIndex)
                        : item.href;
                    // Only match exact page, not sub-pages
                    // For ai-tools, only match /ai-tools, not /ai-tools/courses
                    const isExactTargetPage = pathname === targetPath || pathname === `${targetPath}/`;

                    if (isExactTargetPage) {
                      // Already on the exact page, just scroll
                      e.preventDefault();
                      setTimeout(() => {
                        const section = document.getElementById(item.scrollId!);
                        if (section) {
                          section.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }
                      }, 100);
                    } else {
                      // Navigate to page (or from sub-page to main page), scroll will happen via hash in URL
                      handleNavigation();
                      // Scroll after navigation completes
                      setTimeout(() => {
                        const section = document.getElementById(item.scrollId!);
                        if (section) {
                          section.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }
                      }, 500);
                    }
                  } else {
                    // No scrollId - direct navigation to new page
                    handleNavigation();
                  }
                };

                return (
                  <Link
                    key={index}
                    href={item.href}
                    target={item.target}
                    onClick={handleMenuClick}
                    className="w-full flex items-center justify-between px-4 py-3 mb-2 rounded-xl bg-[#1a2332]/50 hover:bg-cyan-500/10 text-gray-300 hover:text-white transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.icon}
                          alt=""
                          aria-hidden="true"
                          className="w-5 h-5 flex-shrink-0 opacity-80 transition-opacity group-hover:opacity-100"
                        />
                      )}
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                  </Link>
                );
              }
            )}
          </div>

          {/* Notifications Section */}
          {isAuthenticated && (
            <div className="px-4 mt-4">
              <button
                onClick={() =>
                  setIsMobileNotificationExpanded(!isMobileNotificationExpanded)
                }
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5" />
                  <span className="font-medium text-sm">{tNotif("title")}</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${isMobileNotificationExpanded ? "rotate-180" : ""
                    }`}
                />
              </button>

              {isMobileNotificationExpanded && (
                <div className="mt-2 bg-[#0E1823] rounded-xl border border-cyan-500/30 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  {unreadCount > 0 && (
                    <div className="px-4 py-2 bg-linear-to-r from-[#0E1823] to-[#0B1620] border-b border-cyan-500/20 flex justify-end">
                      <button
                        onClick={onMarkAllRead}
                        className="text-xs text-gray-300 cursor-pointer hover:text-white underline-offset-2 hover:underline"
                      >
                        {tNotif("markAllRead")}
                      </button>
                    </div>
                  )}

                  <div className="max-h-[200px] overflow-y-auto custom-scroll">
                    <style
                      dangerouslySetInnerHTML={{
                        __html: `
                        .custom-scroll {
                          scrollbar-width: thin;
                          scrollbar-color: rgba(34, 211, 238, 0.8) rgba(4, 7, 13, 0.9);
                        }
                        .custom-scroll::-webkit-scrollbar {
                          width: 6px;
                        }
                        .custom-scroll::-webkit-scrollbar-track {
                          background: rgba(4, 7, 13, 0.9);
                          border-radius: 999px;
                        }
                        .custom-scroll::-webkit-scrollbar-thumb {
                          background: linear-gradient(180deg, rgba(0, 255, 209, 0.9), rgba(0, 200, 255, 0.9));
                          border-radius: 999px;
                        }
                        .custom-scroll::-webkit-scrollbar-thumb:hover {
                          background: linear-gradient(180deg, rgba(0, 255, 209, 1), rgba(0, 200, 255, 1));
                        }
                        .mobile-notification-item {
                          display: flex !important;
                          align-items: flex-start !important;
                          gap: 12px !important;
                          width: 100% !important;
                          box-sizing: border-box !important;
                          padding: 12px 18px !important;
                        }
                        .mobile-notification-item__content {
                          flex: 1 1 auto !important;
                          min-width: 0 !important;
                          display: flex !important;
                          flex-direction: column !important;
                          gap: 4px !important;
                          color: white !important; 
                        }
                        .mobile-notification-item__headline {
                          font-size: 15px !important;
                          font-weight: 600 !important;
                          white-space: nowrap !important;
                          overflow: hidden !important;
                          text-overflow: ellipsis !important;
                          margin: 0 !important;
                        }
                        .mobile-notification-item__detail {
                          font-size: 13px !important;
                          color: rgb(209, 213, 219) !important; 
                          white-space: nowrap !important;
                          overflow: hidden !important;
                          text-overflow: ellipsis !important;
                          margin: 0 !important;
                        }
                        .mobile-notification-item em {
                          color: rgb(34, 211, 238) !important; 
                          font-style: normal !important;
                        }
                      `,
                      }}
                    />
                    {loadingNotifications ? (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm text-gray-400">
                          {tNotif("loading")}
                        </p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell className="mx-auto mb-2 w-10 h-10 text-gray-600 opacity-50" />
                        <p className="text-sm text-gray-400">
                          {tNotif("noNotifications")}
                        </p>
                      </div>
                    ) : (
                      memoizedNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleNotificationClick(notification).catch(() => {
                              // Silent fail - error already handled
                            });
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          style={{
                            pointerEvents: 'auto',
                            position: 'relative',
                            zIndex: 10,
                          }}
                          className="mobile-notification-item border-b border-white/5 hover:bg-cyan-500/5 transition-colors cursor-pointer"
                        >
                          <NotificationAvatar
                            src={notification.avatarSrc}
                            alt={notification.avatarAlt}
                          />
                          <div
                            className="flex-1 min-w-0"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            {(() => {
                              const { headline, detailLines } =
                                formatNotificationSegments(notification.segments);

                              if (headline || detailLines.length > 0) {
                                return (
                                  <div className="mobile-notification-item__content">
                                    {headline && (
                                      <p className="mobile-notification-item__headline">
                                        {headline}
                                      </p>
                                    )}
                                    {detailLines.length > 0 && (
                                      <p className="mobile-notification-item__detail">
                                        {detailLines.join(" • ")}
                                      </p>
                                    )}
                                  </div>
                                );
                              }

                              return (
                                <div
                                  className="mobile-notification-item__content"
                                  dangerouslySetInnerHTML={{
                                    __html: sanitizeHtml(notification.contentHtml, {
                                      allowedTags: ["p", "br", "strong", "em", "a", "span", "img"],
                                      allowedAttributes: ["href", "target", "rel", "src", "alt", "class", "style"],
                                    }),
                                  }}
                                />
                              );
                            })()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="px-4 py-2 bg-linear-to-r from-[#0E1823] to-[#0B1620] border-t border-cyan-500/20">
                      <button className="w-full text-sm font-medium text-center text-cyan-400 transition-colors cursor-pointer hover:text-cyan-300">
                        {tNotif("viewAll")}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Language Switcher */}
          <div className="px-4 mt-3">
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#1c2230]/80">
              <span className="text-gray-400 text-sm font-medium">
                {t("language")}
              </span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
