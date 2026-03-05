"use client";

import React from "react";
import Image from "next/image";
import { normalizeAvatarUrl } from "@/utils/image.utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: AvatarSize;
  className?: string;
  fallback?: string; // Custom fallback text, defaults to initials from alt
  onError?: () => void;
  onLoad?: () => void;
}

const sizeMap: Record<AvatarSize, { container: string; text: string }> = {
  xs: {
    container: "w-6 h-6",
    text: "text-xs",
  },
  sm: {
    container: "w-8 h-8",
    text: "text-xs",
  },
  md: {
    container: "w-12 h-12",
    text: "text-sm",
  },
  lg: {
    container: "w-16 h-16",
    text: "text-lg",
  },
  xl: {
    container: "w-[50px] h-[50px]",
    text: "text-sm",
  },
};

/**
 * Get initials from name/alt text
 */
const getInitials = (text: string): string => {
  if (!text) return "U";
  const words = text
    .trim()
    .split(" ")
    .filter((w) => w.length > 0);
  if (words.length === 0) return "U";
  if (words.length === 1) {
    return text.substring(0, 2).toUpperCase();
  }
  const firstChar = words[0]?.[0] || "";
  const lastChar = words[words.length - 1]?.[0] || "";
  return (firstChar + lastChar).toUpperCase();
};

/**
 * Shared Avatar component with Emerald Glow fallback
 * Handles image loading errors gracefully and displays initials fallback
 */
export default function Avatar({
  src,
  alt,
  size = "md",
  className = "",
  fallback,
  onError,
  onLoad,
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const normalizedSrc = React.useMemo(() => normalizeAvatarUrl(src), [src]);
  const sizeClasses = sizeMap[size];
  const displayText = fallback || getInitials(alt);

  // Reset error state when src changes
  React.useEffect(() => {
    setImageError(false);
  }, [src]);

  // Show fallback if no src, error occurred, or src is null
  if (!normalizedSrc || imageError) {
    return (
      <div
        className={`${sizeClasses.container} rounded-full flex items-center justify-center text-white ${sizeClasses.text} font-bold bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 ring-2 ring-emerald-300/80 relative overflow-hidden ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
        <span className="relative z-10 drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]">
          {displayText}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses.container} rounded-full overflow-hidden ${className}`}
    >
      <Image
        src={normalizedSrc}
        alt={alt}
        width={
          size === "xs"
            ? 24
            : size === "sm"
            ? 32
            : size === "md"
            ? 48
            : size === "lg"
            ? 64
            : 50
        }
        height={
          size === "xs"
            ? 24
            : size === "sm"
            ? 32
            : size === "md"
            ? 48
            : size === "lg"
            ? 64
            : 50
        }
        className="object-cover w-full h-full"
        onError={(e) => {
          setImageError(true);
          onError?.();
          // Hide image element
          e.currentTarget.style.display = "none";
        }}
        onLoad={() => {
          setImageError(false);
          onLoad?.();
        }}
      />
    </div>
  );
}
