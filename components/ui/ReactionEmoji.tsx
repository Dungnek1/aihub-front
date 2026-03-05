"use client";

import React from "react";
import { cn } from "@/lib/utils";

type ReactionType = "LIKE" | "LOVE" | "HAHA" | "WOW" | "SAD" | "ANGRY";

interface ReactionEmojiProps {
  type: ReactionType;
  size?: number;
  className?: string;
  animated?: boolean;
}

const reactionEmojis: Record<ReactionType, string> = {
  LIKE: "👍",
  LOVE: "❤️",
  HAHA: "😂",
  WOW: "😮",
  SAD: "😢",
  ANGRY: "😠",
};

const reactionColors = {
  LIKE: "text-blue-400",
  LOVE: "text-pink-400",
  HAHA: "text-yellow-400",
  WOW: "text-purple-400",
  SAD: "text-blue-300",
  ANGRY: "text-red-400",
};

export const ReactionEmoji: React.FC<ReactionEmojiProps> = ({
  type,
  size = 24,
  className,
  animated = false,
}) => {
  const emoji = reactionEmojis[type];
  const colorClass = reactionColors[type];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center transition-all duration-300",
        animated && "hover:scale-110 active:scale-95",
        colorClass,
        className
      )}
      style={{
        fontSize: `${size}px`,
        lineHeight: 1,
        filter: animated ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" : "none",
      }}
      role="img"
      aria-label={type}
    >
      {emoji}
    </span>
  );
};

