"use client";

import type { MouseEventHandler, ReactNode } from "react";
import Link from "next/link";
import { useNavigation } from "@/contexts/NavigationContext";

interface NavigationLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export default function NavigationLink({ href, children, className, onClick }: NavigationLinkProps) {
  const { setIsNavigating, isNavigating } = useNavigation();

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }
    setIsNavigating(true);
  };

  return (
    <Link 
      href={href} 
      className={className} 
      onClick={handleClick}
      prefetch={!isNavigating} // Disable prefetching when navigating to avoid SSL errors
    >
      {children}
    </Link>
  );
}

