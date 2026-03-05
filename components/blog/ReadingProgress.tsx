"use client";

import { useEffect, useState } from "react";

import { incrementView } from "@/services/client/blog.client";
import { revalidateBlogViewAction } from "@/services/server/blog-actions.server";

interface ReadingProgressProps {
  postId?: string;
}

export default function ReadingProgress({ postId }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollableHeight = documentHeight - windowHeight;
      const progressPercent = scrollableHeight > 0
        ? (scrollTop / scrollableHeight) * 100
        : 0;

      const currentProgress = Math.min(100, Math.max(0, progressPercent));
      setProgress(currentProgress);

      // Trigger view increment when user scrolls near the end (e.g., > 75%)
      if (postId && !hasViewed && currentProgress > 75) {
        incrementView(postId).then(() => {
          // Revalidate home page and blog list to update view count
          revalidateBlogViewAction();
        });
        setHasViewed(true);
      }
    };

    window.addEventListener("scroll", updateProgress);
    updateProgress();

    return () => window.removeEventListener("scroll", updateProgress);
  }, [postId, hasViewed]);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-50">
      <div
        className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

