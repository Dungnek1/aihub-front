"use client";

import { useRef, ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealProps {
  children: ReactNode;
  baseOpacity?: number;
  enableBlur?: boolean;
  baseRotation?: number;
  blurStrength?: number;
  className?: string;
}

export default function ScrollReveal({
  children,
  baseOpacity = 0,
  enableBlur = true,
  baseRotation = 5,
  blurStrength = 10,
  className = "",
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    const element = containerRef.current;

    // Set initial state
    const initialProps: gsap.TweenVars = {
      opacity: baseOpacity,
      rotation: baseRotation,
    };

    if (enableBlur) {
      initialProps.filter = `blur(${blurStrength}px)`;
    }

    gsap.set(element, initialProps);

    // Create scroll trigger animation
    const scrollTrigger = ScrollTrigger.create({
      trigger: element,
      start: "top 80%",
      end: "bottom 20%",
      onEnter: () => {
        const animateProps: gsap.TweenVars = {
          opacity: 1,
          rotation: 0,
          duration: 1,
          ease: "power2.out",
        };

        if (enableBlur) {
          animateProps.filter = "blur(0px)";
        }

        gsap.to(element, animateProps);
      },
      onLeave: () => {
        const animateProps: gsap.TweenVars = {
          opacity: baseOpacity,
          rotation: -baseRotation,
          duration: 0.5,
          ease: "power2.in",
        };

        if (enableBlur) {
          animateProps.filter = `blur(${blurStrength}px)`;
        }

        gsap.to(element, animateProps);
      },
      onEnterBack: () => {
        const animateProps: gsap.TweenVars = {
          opacity: 1,
          rotation: 0,
          duration: 1,
          ease: "power2.out",
        };

        if (enableBlur) {
          animateProps.filter = "blur(0px)";
        }

        gsap.to(element, animateProps);
      },
      onLeaveBack: () => {
        const animateProps: gsap.TweenVars = {
          opacity: baseOpacity,
          rotation: baseRotation,
          duration: 0.5,
          ease: "power2.in",
        };

        if (enableBlur) {
          animateProps.filter = `blur(${blurStrength}px)`;
        }

        gsap.to(element, animateProps);
      },
    });

    return () => {
      scrollTrigger.kill();
    };
  }, [baseOpacity, enableBlur, baseRotation, blurStrength]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

