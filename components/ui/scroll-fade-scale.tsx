"use client";

import { useRef, ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollFadeScaleProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  scaleFrom?: number;
  className?: string;
}

export default function ScrollFadeScale({
  children,
  duration = 0.8,
  delay = 0,
  scaleFrom = 0.8,
  className = "",
}: ScrollFadeScaleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasRevealedRef = useRef(false);

  useGSAP(() => {
    if (!containerRef.current) return;

    const element = containerRef.current;

    // Set initial state
    gsap.set(element, {
      opacity: 0,
      scale: scaleFrom,
    });

    // Create scroll trigger animation
    const scrollTrigger = ScrollTrigger.create({
      trigger: element,
      start: "top 85%",
      onEnter: () => {
        if (!hasRevealedRef.current) {
          hasRevealedRef.current = true;
          gsap.to(element, {
            opacity: 1,
            scale: 1,
            duration: duration,
            delay: delay,
            ease: "power2.out",
          });
        }
      },
      onEnterBack: () => {
        if (!hasRevealedRef.current) {
          hasRevealedRef.current = true;
          gsap.to(element, {
            opacity: 1,
            scale: 1,
            duration: duration,
            delay: delay,
            ease: "power2.out",
          });
        } else {
          // If already revealed, ensure it stays visible
          gsap.set(element, {
            opacity: 1,
            scale: 1,
          });
        }
      },
      // No onLeave/onLeaveBack - element stays visible after reveal
    });

    return () => {
      scrollTrigger.kill();
    };
  }, [duration, delay, scaleFrom]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

