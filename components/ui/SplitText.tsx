"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import clsx from "clsx";

gsap.registerPlugin(useGSAP);

type SplitMode = "chars" | "words" | "lines";

type SplitSegment = {
  content: string;
  isSpace?: boolean;
  isBreak?: boolean;
  isBlock?: boolean;
};

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: SplitMode;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  textAlign?: "left" | "center" | "right";
  onLetterAnimationComplete?: () => void;
}

function buildSegments(text: string, splitType: SplitMode): SplitSegment[] {
  if (splitType === "words") {
    return text.split(/(\s+)/).map((segment) => ({
      content: segment === " " ? "\u00A0" : segment,
      isSpace: /^\s+$/.test(segment),
    }));
  }

  if (splitType === "lines") {
    const lines = text.split(/\n/);
    const segments: SplitSegment[] = [];
    lines.forEach((line, index) => {
      segments.push({ content: line, isBlock: true });
      if (index < lines.length - 1) {
        segments.push({ content: "", isBreak: true });
      }
    });
    return segments;
  }

  return Array.from(text).map((char) => ({
    content: char === " " ? "\u00A0" : char,
    isSpace: char === " ",
  }));
}

export default function SplitText({
  text,
  className,
  delay = 80,
  duration = 0.5,
  ease = "power3.out",
  splitType = "chars",
  from,
  to,
  threshold = 0.15,
  rootMargin = "-80px",
  textAlign,
  onLetterAnimationComplete,
}: SplitTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const hasAnimatedRef = useRef(false);

  const segments = useMemo(
    () => buildSegments(text, splitType),
    [text, splitType]
  );

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            const letters = node.querySelectorAll<HTMLElement>("[data-letter]");
            const ctx = gsap.context(() => {
              gsap.fromTo(
                letters,
                {
                  opacity: 0,
                  y: 24,
                  ...from,
                },
                {
                  opacity: 1,
                  y: 0,
                  duration,
                  ease,
                  stagger: Math.max(delay, 0) / 1000,
                  ...to,
                  onComplete: onLetterAnimationComplete,
                }
              );
            }, node);

            return () => ctx.revert();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [
    delay,
    duration,
    ease,
    from,
    onLetterAnimationComplete,
    rootMargin,
    threshold,
    to,
  ]);

  return (
    <span
      ref={containerRef}
      className={clsx("inline-block leading-tight", className)}
      style={{ textAlign }}
      aria-label={text}
    >
      {segments.map((segment, index) => {
        if (segment.isBreak) {
          return <br key={`split-break-${index}`} />;
        }

        return (
          <span
            key={`split-${index}`}
            data-letter
            className="inline-block will-change-transform"
            style={{
              display: segment.isBlock ? "block" : "inline-block",
              whiteSpace: segment.isSpace ? "pre" : undefined,
            }}
          >
            {segment.content}
          </span>
        );
      })}
    </span>
  );
}


