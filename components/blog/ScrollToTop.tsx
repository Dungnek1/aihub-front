"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    let ticking = false;

    const toggleVisibility = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const shouldShow = window.scrollY > 400;
          
          // Only update state if it's different to avoid unnecessary re-renders
          if (shouldShow !== isVisibleRef.current) {
            // Clear any pending timeout
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }

            // Add a small delay when hiding to prevent flickering
            if (!shouldShow) {
              timeoutRef.current = setTimeout(() => {
                setIsVisible(false);
                isVisibleRef.current = false;
              }, 100);
            } else {
              setIsVisible(true);
              isVisibleRef.current = true;
            }
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    // Check initial state
    toggleVisibility();

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 p-3 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all duration-300 cursor-pointer touch-manipulation"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

