"use client";

import { useState, useEffect } from "react";

interface TextTypeProps {
  text: string | string[];
  typingSpeed?: number;
  pauseDuration?: number;
  showCursor?: boolean;
  cursorCharacter?: string;
  className?: string;
  onComplete?: () => void;
}

export default function TextType({
  text,
  typingSpeed = 75,
  pauseDuration = 1500,
  showCursor = true,
  cursorCharacter = "|",
  className = "",
  onComplete,
}: TextTypeProps) {
  const texts = Array.isArray(text) ? text : [text];
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showCursorState, setShowCursorState] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let cursorIntervalId: NodeJS.Timeout;

    const currentText = texts[currentTextIndex] ?? "";
    let currentIndex = 0;

    const typeText = () => {
      if (currentIndex < currentText.length) {
        setDisplayedText(currentText.slice(0, currentIndex + 1));
        currentIndex++;
        timeoutId = setTimeout(typeText, typingSpeed);
      } else {
        // Finished typing current text
        setIsTyping(false);
        timeoutId = setTimeout(() => {
          // Start erasing or move to next text
          if (currentTextIndex < texts.length - 1) {
            // Move to next text
            setCurrentTextIndex((prev) => prev + 1);
            setDisplayedText("");
            setIsTyping(true);
          } else {
            // All texts completed
            if (onComplete) {
              onComplete();
            }
            // Loop back to first text
            setCurrentTextIndex(0);
            setDisplayedText("");
            setIsTyping(true);
          }
        }, pauseDuration);
      }
    };

    // Start typing
    typeText();

    // Cursor blinking effect
    cursorIntervalId = setInterval(() => {
      setShowCursorState((prev) => !prev);
    }, 530);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (cursorIntervalId) clearInterval(cursorIntervalId);
    };
  }, [currentTextIndex, texts, typingSpeed, pauseDuration, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && showCursorState && (
        <span className="animate-pulse">{cursorCharacter}</span>
      )}
    </span>
  );
}

