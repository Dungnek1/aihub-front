"use client";

import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";

interface ScrollFadeProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}

export function ScrollFade({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: ScrollFadeProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const variants = {
    hidden: {
      opacity: 0,
      [direction === "up" || direction === "down" ? "y" : "x"]:
        direction === "up" || direction === "left" ? 20 : -20,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

