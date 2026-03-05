"use client";

import { useEffect, useRef } from "react";
import twemoji from "twemoji";

interface EmojiReactionProps {
  emoji: string;
  size?: number;
  className?: string;
}

/**
 * EmojiReaction component renders emoji using Twemoji (Twitter Emoji)
 * for consistent, beautiful emoji display across all platforms
 */
export default function EmojiReaction({
  emoji,
  size = 24,
  className = "",
}: EmojiReactionProps) {
  const emojiRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (emojiRef.current) {
      // Parse emoji and convert to Twemoji using CDN
      twemoji.parse(emojiRef.current, {
        folder: "svg",
        ext: ".svg",
        base: "https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/",
        size: `${size}x${size}`,
      });
    }
  }, [emoji, size]);

  return (
    <span
      ref={emojiRef}
      className={`inline-flex items-center justify-center transition-transform duration-200 ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, fontSize: `${size}px` }}
    >
      {emoji}
    </span>
  );
}
