"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Theme } from "emoji-picker-react";
import { cn } from "@/utils";

// Dynamic import để giảm bundle size
const Picker = dynamic(
  () => import("emoji-picker-react"),
  { ssr: false }
);

interface EmojiPickerProps {
  onEmojiClick: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function EmojiPicker({
  onEmojiClick,
  isOpen,
  onClose,
  position = "top",
  className,
}: EmojiPickerProps) {
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");

  const handleEmojiClick = (emojiData: any) => {
    const emoji = emojiData.emoji;
    setSelectedEmoji(emoji);
    onEmojiClick(emoji);
  };

  const positionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          {/* Picker */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: position === "top" ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: position === "top" ? 10 : -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute z-50",
              positionClasses[position],
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0F1722] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              <Picker
                onEmojiClick={handleEmojiClick}
                theme={Theme.DARK}
                skinTonesDisabled
                previewConfig={{
                  showPreview: false,
                }}
                width={350}
                height={400}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

