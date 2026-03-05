"use client";

import React from "react";
import { cn } from "@/lib/utils";
// Heroicons - dùng outline cho đẹp hơn và có thể fill màu
import { 
  HandThumbUpIcon, 
  HeartIcon, 
  FaceSmileIcon, 
  SparklesIcon, 
  FaceFrownIcon, 
  FireIcon 
} from "@heroicons/react/24/outline";

type IconLibrary = "heroicons";
type ReactionType = "LIKE" | "LOVE" | "HAHA" | "WOW" | "SAD" | "ANGRY";

interface ReactionIconProps {
  type: ReactionType;
  library?: IconLibrary;
  size?: number;
  className?: string;
  filled?: boolean;
}

const reactionIcons = {
  heroicons: {
    LIKE: HandThumbUpIcon,
    LOVE: HeartIcon,
    HAHA: FaceSmileIcon,
    WOW: SparklesIcon,
    SAD: FaceFrownIcon,
    ANGRY: FireIcon,
  },
};

const reactionColors = {
  LIKE: "text-blue-400 fill-blue-400",
  LOVE: "text-pink-400 fill-pink-400",
  HAHA: "text-yellow-400 fill-yellow-400",
  WOW: "text-purple-400 fill-purple-400",
  SAD: "text-blue-300 fill-blue-300",
  ANGRY: "text-red-400 fill-red-400",
};

export const ReactionIcon: React.FC<ReactionIconProps> = ({
  type,
  library = "heroicons",
  size = 24,
  className,
  filled = true,
}) => {
  const IconComponent = reactionIcons[library][type];
  const colorClass = reactionColors[type];

  if (!IconComponent) {
    return null;
  }

  // Dùng outline với fill để đẹp hơn
  return (
    <IconComponent
      className={cn(
        "flex-shrink-0 transition-all duration-300",
        filled ? colorClass : colorClass.replace("fill-", "fill-transparent"),
        className
      )}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        strokeWidth: filled ? 2.5 : 2,
      }}
    />
  );
};

