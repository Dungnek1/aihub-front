"use client";

import { useEffect } from "react";

export default function TextHighlight() {
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const selectedText = selection.toString().trim();

      if (selectedText.length > 0) {
        // Create highlight effect
        const highlight = document.createElement("div");
        highlight.className = "fixed z-50 pointer-events-none";
        highlight.style.cssText = `
          background: rgba(6, 182, 212, 0.2);
          border: 2px solid rgba(6, 182, 212, 0.5);
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 12px;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        highlight.textContent = `${selectedText.length} characters selected`;
        
        const rect = range.getBoundingClientRect();
        highlight.style.left = `${rect.left + window.scrollX}px`;
        highlight.style.top = `${rect.top + window.scrollY - 30}px`;
        
        document.body.appendChild(highlight);
        
        setTimeout(() => {
          highlight.remove();
        }, 2000);
      }
    };

    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, []);

  return null;
}

