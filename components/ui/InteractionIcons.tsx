"use client";

import { cn } from "@/lib/utils";
// Heroicons
import {
  EyeIcon as HeroEye,
  HandThumbUpIcon as HeroThumbsUp,
  ChatBubbleLeftIcon as HeroComment,
  ArrowUpTrayIcon as HeroShare,
} from "@heroicons/react/24/outline";
// Tabler Icons
import {
  IconEye as TablerEye,
  IconThumbUp as TablerThumbsUp,
  IconMessageCircle as TablerComment,
  IconShare as TablerShare,
} from "@tabler/icons-react";
// Phosphor Icons
import {
  Eye as PhosphorEye,
  ThumbsUp as PhosphorThumbsUp,
  ChatCircle as PhosphorComment,
  Share as PhosphorShare,
} from "phosphor-react";
// Lucide (current)
import {
  Eye as LucideEye,
  ThumbsUp as LucideThumbsUp,
  MessageCircle as LucideComment,
  Share2 as LucideShare,
} from "lucide-react";

type IconLibrary = "heroicons" | "tabler" | "phosphor" | "lucide";

interface InteractionIconsProps {
  library?: IconLibrary;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

// Heroicons Components
export function HeroEyeIcon({ size = 20, className, ...props }: InteractionIconsProps) {
  return <HeroEye className={cn("text-current", className)} width={size} height={size} {...props} />;
}

export function HeroThumbsUpIcon({ size = 20, className, ...props }: InteractionIconsProps) {
  return <HeroThumbsUp className={cn("text-current", className)} width={size} height={size} {...props} />;
}

export function HeroCommentIcon({ size = 20, className, ...props }: InteractionIconsProps) {
  return <HeroComment className={cn("text-current", className)} width={size} height={size} {...props} />;
}

export function HeroShareIcon({ size = 20, className, ...props }: InteractionIconsProps) {
  return <HeroShare className={cn("text-current", className)} width={size} height={size} {...props} />;
}

// Tabler Icons Components
export function TablerEyeIcon({ size = 20, className, strokeWidth = 1.5, ...props }: InteractionIconsProps) {
  return <TablerEye className={cn("text-current", className)} size={size} strokeWidth={strokeWidth} {...props} />;
}

export function TablerThumbsUpIcon({ size = 20, className, strokeWidth = 1.5, ...props }: InteractionIconsProps) {
  return <TablerThumbsUp className={cn("text-current", className)} size={size} strokeWidth={strokeWidth} {...props} />;
}

export function TablerCommentIcon({ size = 20, className, strokeWidth = 1.5, ...props }: InteractionIconsProps) {
  return <TablerComment className={cn("text-current", className)} size={size} strokeWidth={strokeWidth} {...props} />;
}

export function TablerShareIcon({ size = 20, className, strokeWidth = 1.5, ...props }: InteractionIconsProps) {
  return <TablerShare className={cn("text-current", className)} size={size} strokeWidth={strokeWidth} {...props} />;
}

// Phosphor Icons Components
export function PhosphorEyeIcon({ size = 20, className, weight = "regular", ...props }: InteractionIconsProps & { weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone" }) {
  return <PhosphorEye className={cn("text-current", className)} size={size} weight={weight} {...props} />;
}

export function PhosphorThumbsUpIcon({ size = 20, className, weight = "regular", ...props }: InteractionIconsProps & { weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone" }) {
  return <PhosphorThumbsUp className={cn("text-current", className)} size={size} weight={weight} {...props} />;
}

export function PhosphorCommentIcon({ size = 20, className, weight = "regular", ...props }: InteractionIconsProps & { weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone" }) {
  return <PhosphorComment className={cn("text-current", className)} size={size} weight={weight} {...props} />;
}

export function PhosphorShareIcon({ size = 20, className, weight = "regular", ...props }: InteractionIconsProps & { weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone" }) {
  return <PhosphorShare className={cn("text-current", className)} size={size} weight={weight} {...props} />;
}

// Lucide Icons Components (current)
export function LucideEyeIcon({ size = 20, className, strokeWidth = 1.7, ...props }: InteractionIconsProps) {
  return <LucideEye className={cn("text-current", className)} size={size} strokeWidth={strokeWidth} {...props} />;
}

export function LucideThumbsUpIcon({ size = 20, className, strokeWidth = 1.7, ...props }: InteractionIconsProps) {
  return <LucideThumbsUp className={cn("text-current", className)} size={size} strokeWidth={strokeWidth} {...props} />;
}

export function LucideCommentIcon({ size = 20, className, strokeWidth = 1.7, ...props }: InteractionIconsProps) {
  return <LucideComment className={cn("text-current", className)} size={size} strokeWidth={strokeWidth} {...props} />;
}

export function LucideShareIcon({ size = 20, className, strokeWidth = 1.7, ...props }: InteractionIconsProps) {
  return <LucideShare className={cn("text-current", className)} size={size} strokeWidth={strokeWidth} {...props} />;
}

// Unified Components with library selection
export function InteractionIcon({
  type,
  library = "tabler",
  size = 20,
  className,
  strokeWidth,
  ...props
}: {
  type: "eye" | "thumbsUp" | "comment" | "share";
  library?: IconLibrary;
  size?: number;
  className?: string;
  strokeWidth?: number;
} & InteractionIconsProps) {
  const iconProps = { size, className, strokeWidth, ...props };

  switch (library) {
    case "heroicons":
      switch (type) {
        case "eye":
          return <HeroEyeIcon {...iconProps} />;
        case "thumbsUp":
          return <HeroThumbsUpIcon {...iconProps} />;
        case "comment":
          return <HeroCommentIcon {...iconProps} />;
        case "share":
          return <HeroShareIcon {...iconProps} />;
      }
      break;
    case "tabler":
      switch (type) {
        case "eye":
          return <TablerEyeIcon {...iconProps} />;
        case "thumbsUp":
          return <TablerThumbsUpIcon {...iconProps} />;
        case "comment":
          return <TablerCommentIcon {...iconProps} />;
        case "share":
          return <TablerShareIcon {...iconProps} />;
      }
      break;
    case "phosphor":
      switch (type) {
        case "eye":
          return <PhosphorEyeIcon {...iconProps} />;
        case "thumbsUp":
          return <PhosphorThumbsUpIcon {...iconProps} />;
        case "comment":
          return <PhosphorCommentIcon {...iconProps} />;
        case "share":
          return <PhosphorShareIcon {...iconProps} />;
      }
      break;
    case "lucide":
    default:
      switch (type) {
        case "eye":
          return <LucideEyeIcon {...iconProps} />;
        case "thumbsUp":
          return <LucideThumbsUpIcon {...iconProps} />;
        case "comment":
          return <LucideCommentIcon {...iconProps} />;
        case "share":
          return <LucideShareIcon {...iconProps} />;
      }
  }
}

