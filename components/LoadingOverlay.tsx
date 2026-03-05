"use client";

import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface LoadingOverlayProps {
  message?: string;
  type?: "clip" | "pulse" | "scale" | "bar" | "beat" | "hash" | "ring" | "sync" | "custom";
}

export default function LoadingOverlay({
  message = "Loading...",
  type = "custom",
}: LoadingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <LoadingSpinner type={type} size={48} message={message} />
      </motion.div>
    </motion.div>
  );
}
