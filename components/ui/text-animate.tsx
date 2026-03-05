"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface TextAnimateProps {
  children: string;
  animation?: "blurInUp" | "fadeIn" | "slideIn" | "slideUp";
  by?: "character" | "word" | "line";
  once?: boolean;
  className?: string;
  delay?: number;
}

export function TextAnimate({
  children,
  animation = "blurInUp",
  by = "character",
  once = true,
  className = "",
  delay = 0,
}: TextAnimateProps) {
  const [isVisible, setIsVisible] = useState(!once);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!once) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [once]);

  const splitText = () => {
    if (by === "character") {
      return children.split("");
    } else if (by === "word") {
      return children.split(" ");
    } else {
      return children.split("\n");
    }
  };

  const getAnimationVariants = () => {
    switch (animation) {
      case "blurInUp":
        return {
          hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
          visible: { opacity: 1, filter: "blur(0px)", y: 0 },
        };
      case "slideUp":
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        };
      case "fadeIn":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        };
      case "slideIn":
        return {
          hidden: { opacity: 0, x: -20 },
          visible: { opacity: 1, x: 0 },
        };
      default:
        return {
          hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
          visible: { opacity: 1, filter: "blur(0px)", y: 0 },
        };
    }
  };

  const variants = getAnimationVariants();
  const items = splitText();

  return (
    <span ref={ref} className={className} style={{ display: "inline-block" }}>
      {items.map((item, index) => {
        const isSpace = by === "word" && item === "";
        const content = by === "word" && !isSpace ? item + " " : item;
        
        return (
          <motion.span
            key={index}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={variants}
            transition={{
              duration: 0.5,
              delay: delay + index * 0.03,
              ease: "easeOut",
            }}
            style={{ 
              display: "inline-block",
              whiteSpace: by === "word" ? "pre" : "normal"
            }}
          >
            {content}
          </motion.span>
        );
      })}
    </span>
  );
}

