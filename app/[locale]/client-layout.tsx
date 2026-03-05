"use client";

import { NextIntlClientProvider } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import type { FooterTexts } from "@/types/ui.types";
import { useNavigation } from "@/contexts/NavigationContext";
import Lenis from "lenis";
import { Toaster } from "react-hot-toast";
import { PageLoader } from "@/components/ui/PageLoader";
import ScrollToTop from "@/components/blog/ScrollToTop";
import { NotificationProvider } from "@/contexts/NotificationContext";

interface ClientLayoutProps {
  children: React.ReactNode;
  locale: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: Record<string, any>;
  footerTexts: FooterTexts;
}

export function ClientLayout({
  children,
  locale,
  messages,
  footerTexts,
}: Readonly<ClientLayoutProps>) {
  const pathname = usePathname();
  const { isNavigating, setIsNavigating } = useNavigation();
  const mainRef = useRef<HTMLElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // Setup Lenis smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      syncTouch: false,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Detect when content has fully loaded
  useEffect(() => {
    // Cleanup previous observers when pathname changes
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isNavigating) {
      return;
    }

    let isContentReady = false;
    const MAX_WAIT_TIME = 5000; // Maximum 5 seconds wait time
    const MIN_WAIT_TIME = 500; // Increased minimum wait time for better UX

    const checkContentReady = () => {
      if (isContentReady) return;

      const main = mainRef.current;
      if (!main) return;

      // Use requestAnimationFrame to batch DOM reads and avoid layout thrashing
      requestAnimationFrame(() => {
        if (isContentReady) return;

        // Check if main content has meaningful content
        const textContent = main.textContent;
        const hasTextContent = textContent && textContent.trim().length > 50;
        if (!hasTextContent) return;

        // Limit image check to first 10 images to avoid performance issues
        const images = Array.from(main.querySelectorAll('img')).slice(0, 10) as HTMLImageElement[];

        // Check if all images are loaded (simplified check)
        const allImagesLoaded = images.length === 0 ||
          images.every(img => img.complete || img.naturalWidth > 0);

        if (!allImagesLoaded) return;

        // Check if there are async loading elements with data-loading attribute
        const loadingElements = main.querySelectorAll('[data-loading="true"]');
        const hasLoadingElements = loadingElements.length > 0;

        if (hasLoadingElements) return;

        // Check for common loading indicators (exclude overlay and navigation loading)
        const loadingSpinners = Array.from(main.querySelectorAll('.animate-spin, [role="progressbar"]')).slice(0, 5).filter(
          el => {
            const isOverlay = el.closest('[class*="loading-overlay"]') ||
              el.closest('main > div[class*="absolute"]') ||
              el.closest('[class*="backdrop-blur"]');
            return !isOverlay;
          }
        );
        const hasLoadingSpinners = loadingSpinners.length > 0;

        // Content is ready if all checks pass
        if (!hasLoadingSpinners) {
          isContentReady = true;
          clearAllTimers();
          // Wait minimum time for smooth transition and to ensure overlay is visible
          setTimeout(() => {
            if (isContentReady) { // Double check to avoid race condition
              setIsNavigating(false);
            }
          }, MIN_WAIT_TIME);
        }
      });
    };

    const clearAllTimers = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };

    // Start checking after a delay to ensure overlay is visible and content has time to render
    // Increased delay to ensure users see the loading state
    const initialDelay = setTimeout(() => {
      checkContentReady();

      // Set up MutationObserver to watch for DOM changes
      // Throttle the callback to avoid performance issues
      let lastCheckTime = 0;
      const THROTTLE_MS = 200; // Only check every 200ms to reduce overhead

      const throttledCheckContentReady = () => {
        const now = Date.now();
        if (now - lastCheckTime < THROTTLE_MS) {
          return;
        }
        lastCheckTime = now;
        checkContentReady();
      };

      if (mainRef.current) {
        observerRef.current = new MutationObserver(throttledCheckContentReady);
        // Only observe direct children and specific attributes to reduce overhead
        observerRef.current.observe(mainRef.current, {
          childList: true,
          subtree: false, // Only observe direct children, not entire subtree
          attributes: true,
          attributeFilter: ['data-loading'], // Only watch data-loading attribute
        });
      }

      // Check periodically for image loading (reduced frequency)
      intervalRef.current = setInterval(() => {
        checkContentReady();
      }, 300); // Increased from 100ms to 300ms to reduce overhead

      // Set maximum wait time timeout
      timeoutRef.current = setTimeout(() => {
        clearAllTimers();
        isContentReady = true;
        setIsNavigating(false);
      }, MAX_WAIT_TIME);
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(initialDelay);
      clearAllTimers();
    };
  }, [pathname, isNavigating, setIsNavigating]);

  const isAuthPage = pathname?.includes("/auth/");
  const isLandingPage = pathname?.includes("/landing");
  const isNewsPage = pathname?.includes("/news") && !pathname?.includes("/news/");
  const isBlogPage = pathname?.includes("/blog");
  // Check if on blog sub-pages (write, my-post, activity-log) - exclude blog detail pages
  const pathWithoutLocale = pathname?.replace(/^\/[a-z]{2}(?=\/)/, "") || "";
  const isBlogSubPage = pathWithoutLocale.startsWith("/blog/") &&
    (pathWithoutLocale === "/blog/write" ||
      pathWithoutLocale === "/blog/my-post" ||
      pathWithoutLocale === "/blog/activity-log");
  const isAboutPage = pathname?.includes("/about");
  const isAiToolsPage = pathname?.includes("/ai-tools");
  const isContactPage = pathname?.includes("/contact");
  const isCareerPage = pathname?.includes("/careers");
  const isPrivacyPage = pathname?.includes("/privacy");
  const isProfilePage = pathname?.includes("/profile");
  const isStandardLayoutPage = isNewsPage || isBlogPage || isAiToolsPage || isContactPage || isCareerPage || isPrivacyPage || isProfilePage;

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <NotificationProvider>
        {isAuthPage || isLandingPage ? (
          <>{children}</>

        ) : (
          <div className="flex flex-col min-h-screen bg-dark-bg">
            <Header />
            <main ref={mainRef} className="flex-1 relative">
              {isStandardLayoutPage && !isBlogSubPage && !isAboutPage && !isCareerPage && !isPrivacyPage ? (
                <Breadcrumb />
              ) : !isBlogSubPage && !isAboutPage && !isCareerPage && !isPrivacyPage ? (
                <div className="w-full max-w-7xl mx-auto pt-4 sm:pt-6 px-4 sm:px-8">
                  <Breadcrumb />
                </div>
              ) : null}
              {children}
            </main>
            <Footer locale={locale} texts={footerTexts} />
          </div>
        )}
        <PageLoader isLoading={isNavigating && !isBlogPage} />
        <ScrollToTop />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1e293b",
              color: "#fff",
              border: "1px solid rgba(6, 182, 212, 0.3)",
              borderRadius: "12px",
              padding: "12px 16px",
            },
            success: {
              iconTheme: {
                primary: "#06b6d4",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </NotificationProvider>
    </NextIntlClientProvider>
  );
}
