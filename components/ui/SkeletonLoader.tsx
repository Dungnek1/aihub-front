"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  variant?: "card" | "text" | "avatar" | "image" | "list";
  className?: string;
  count?: number;
}

export function SkeletonLoader({
  variant = "card",
  className,
  count = 1,
}: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case "card":
        return (
          <div className={cn("rounded-2xl border border-white/10 bg-[#0F1722] overflow-hidden", className)}>
            <Skeleton className="w-full h-48 bg-[#1e293b]" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-4 w-3/4 bg-[#1e293b]" />
              <Skeleton className="h-4 w-1/2 bg-[#1e293b]" />
              <Skeleton className="h-20 w-full bg-[#1e293b]" />
            </div>
          </div>
        );
      case "text":
        return (
          <div className={cn("space-y-2", className)}>
            <Skeleton className="h-4 w-full bg-[#1e293b]" />
            <Skeleton className="h-4 w-5/6 bg-[#1e293b]" />
            <Skeleton className="h-4 w-4/6 bg-[#1e293b]" />
          </div>
        );
      case "avatar":
        return (
          <div className={cn("flex items-center gap-3", className)}>
            <Skeleton className="h-12 w-12 rounded-full bg-[#1e293b]" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/2 bg-[#1e293b]" />
              <Skeleton className="h-3 w-1/3 bg-[#1e293b]" />
            </div>
          </div>
        );
      case "image":
        return (
          <Skeleton className={cn("w-full h-full bg-[#1e293b]", className)} />
        );
      case "list":
        return (
          <div className={cn("space-y-3", className)}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-16 w-16 rounded-lg bg-[#1e293b]" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4 bg-[#1e293b]" />
                  <Skeleton className="h-3 w-1/2 bg-[#1e293b]" />
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return <Skeleton className={cn("bg-[#1e293b]", className)} />;
    }
  };

  if (count > 1 && variant !== "list") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i}>{renderSkeleton()}</div>
        ))}
      </div>
    );
  }

  return renderSkeleton();
}

