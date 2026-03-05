"use client";

import Image from "next/image";
import leftIcon from "@/public/icon/arrow-left-news.svg";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  fallbackHref: string;
  className?: string;
  iconSize?: number;
}

export function BackButton({
  fallbackHref,
  className,
  iconSize = 20,
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white w-15 h-15 rounded-full shadow-md transition z-10",
        className
      )}
      aria-label="Go back"
    >
      <Image alt="back" src={leftIcon} width={iconSize} height={iconSize} />
    </button>
  );
}

