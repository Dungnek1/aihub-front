"use client";

import { useRef, useEffect, useState, ReactNode } from "react";

interface GlareHoverProps {
  children: ReactNode;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  transitionDuration?: number;
  playOnce?: boolean;
  className?: string;
}

export default function GlareHover({
  children,
  glareColor = "#ffffff",
  glareOpacity = 0.3,
  glareAngle = -30,
  glareSize = 300,
  transitionDuration = 800,
  playOnce = false,
  className = "",
}: GlareHoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: -glareSize, y: -glareSize });
  const [hasPlayed, setHasPlayed] = useState(false);
  const animationRef = useRef<number | null>(null);
  const currentPositionRef = useRef({ x: -glareSize, y: -glareSize });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const animateGlare = (
      fromX: number,
      fromY: number,
      toX: number,
      toY: number,
      onComplete?: () => void
    ) => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      setIsAnimating(true);
      setGlarePosition({ x: fromX, y: fromY });
      currentPositionRef.current = { x: fromX, y: fromY };

      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / transitionDuration, 1);

        const currentX = fromX + (toX - fromX) * progress;
        const currentY = fromY + (toY - fromY) * progress;

        setGlarePosition({ x: currentX, y: currentY });
        currentPositionRef.current = { x: currentX, y: currentY };

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          if (onComplete) onComplete();
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseEnter = () => {
      if (playOnce && hasPlayed) return;

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Start position (bottom-right) - từ dưới phải
      const startX = width + glareSize;
      const startY = height + glareSize;
      
      // End position (top-left) - lên trên trái
      const endX = -glareSize;
      const endY = -glareSize;

      if (playOnce) setHasPlayed(true);

      // Animate from bottom-right to top-left (từ dưới phải lên trên trái)
      animateGlare(startX, startY, endX, endY);
    };

    const handleMouseLeave = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Current position from ref
      const currentX = currentPositionRef.current.x;
      const currentY = currentPositionRef.current.y;

      // End position (bottom-right) - xuống dưới phải
      const endX = width + glareSize;
      const endY = height + glareSize;

      // Animate from current position to bottom-right (từ vị trí hiện tại xuống dưới phải)
      animateGlare(currentX, currentY, endX, endY, () => {
        setGlarePosition({ x: -glareSize, y: -glareSize });
        currentPositionRef.current = { x: -glareSize, y: -glareSize };
      });
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [playOnce, hasPlayed, transitionDuration, glareSize]);

  // Convert opacity to hex with alpha
  const glareColorWithAlpha = `${glareColor}${Math.round(glareOpacity * 255).toString(16).padStart(2, "0")}`;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ position: "relative" }}
    >
      {children}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-inherit"
        style={{
          background: `radial-gradient(circle ${glareSize}px at ${glarePosition.x}px ${glarePosition.y}px, ${glareColorWithAlpha} 0%, transparent 60%)`,
          opacity: isAnimating ? 1 : 0,
          transition: `opacity ${transitionDuration * 0.2}ms ease-out`,
          mixBlendMode: "lighten",
          borderRadius: "inherit",
          willChange: isAnimating ? "opacity, background" : "opacity",
        }}
      />
    </div>
  );
}

