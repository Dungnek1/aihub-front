"use client";

import { useRef, ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollFloatProps {
  children: ReactNode;
  animationDuration?: number;
  ease?: string;
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
  className?: string;
}

export default function ScrollFloat({
  children,
  animationDuration = 1,
  ease = "back.inOut(2)",
  scrollStart = "center bottom+=50%",
  scrollEnd = "bottom bottom-=40%",
  stagger = 0.03,
  className = "",
}: ScrollFloatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasRevealedRef = useRef(false);

  useGSAP(() => {
    if (!containerRef.current) return;

    const element = containerRef.current;

    // GSAP can parse ease strings like "back.inOut(2)" directly
    // No need to manually parse

    // Set initial state
    gsap.set(element, {
      y: 100,
      opacity: 0,
    });

    // Create scroll trigger animation
    // Once revealed, element stays visible (no onLeave/onLeaveBack)
    const scrollTrigger = ScrollTrigger.create({
      trigger: element,
      start: scrollStart,
      end: scrollEnd,
      onEnter: () => {
        if (!hasRevealedRef.current) {
          hasRevealedRef.current = true;
          gsap.to(element, {
            y: 0,
            opacity: 1,
            duration: animationDuration,
            ease: ease as any,
          });
        }
      },
      onEnterBack: () => {
        // If scrolling back up and element hasn't been revealed yet
        if (!hasRevealedRef.current) {
          hasRevealedRef.current = true;
          gsap.to(element, {
            y: 0,
            opacity: 1,
            duration: animationDuration,
            ease: ease as any,
          });
        } else {
          // If already revealed, ensure it stays visible
          gsap.set(element, {
            y: 0,
            opacity: 1,
          });
        }
      },
      // Removed onLeave and onLeaveBack to keep element visible after reveal
    });

    return () => {
      scrollTrigger.kill();
    };
  }, [animationDuration, ease, scrollStart, scrollEnd, stagger]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
