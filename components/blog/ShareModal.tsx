"use client";

import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import { X, Copy, Square, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  FaFacebook,
  FaWhatsapp,
  FaSnapchatGhost,
  FaTelegramPlane,
  FaLinkedin,
} from "react-icons/fa";
import { motion } from "framer-motion";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  postSlug?: string; // Optional post slug to share specific post URL
}

export default function ShareModal({
  open,
  onClose,
  postSlug,
}: ShareModalProps) {
  const t = useTranslations("Blog");
  const locale =
    typeof window !== "undefined"
      ? window.location.pathname.split("/")[1]
      : "en";
  const [copied, setCopied] = useState(false);

  const stopEvent = (event: SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const nativeEvent = event.nativeEvent as Event & {
      stopImmediatePropagation?: () => void;
    };
    nativeEvent.stopImmediatePropagation?.();
  };

  // If postSlug is provided, use the blog post URL; otherwise use current page URL
  const shareUrl = postSlug
    ? `${typeof window !== "undefined"
      ? window.location.origin
      : "https://aihub.com"
    }/${locale}/blog/${postSlug}`
    : typeof window !== "undefined"
      ? window.location.href
      : "https://aihub.com";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleFacebookShare = async (event: SyntheticEvent) => {
    stopEvent(event);
    // Copy link to clipboard first
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
    // Then open Facebook sharer
    const targetWindow =
      typeof window !== "undefined" ? window : undefined;
    targetWindow?.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const socialLinks = [
    {
      name: "Facebook",
      icon: FaFacebook,
      color: "#1877F2",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,
      isFacebook: true, // Special flag for Facebook
    },
    {
      name: "Whatsapp",
      icon: FaWhatsapp,
      color: "#25D366",
      url: `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Snapchat",
      icon: FaSnapchatGhost,
      color: "#FFFC00",
      url: `https://www.snapchat.com/add?name=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Telegram",
      icon: FaTelegramPlane,
      color: "#0088cc",
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Linkedin",
      icon: FaLinkedin,
      color: "#0A66C2",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl
      )}`,
    },
  ];

  // Focus trap and accessibility
  useEffect(() => {
    if (!open) return;

    const modal = document.querySelector('[role="dialog"]') as HTMLElement;
    const firstFocusable = modal?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    const focusableElements = modal?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    const lastFocusable = focusableElements?.[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    firstFocusable?.focus();
    document.addEventListener("keydown", handleTab);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleTab);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  return (
    <>
      {/* ARIA live region for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {open && t("share", { defaultMessage: "Share" })}
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md"
          onClick={(event) => {
            stopEvent(event);
            onClose();
          }}
          onMouseDown={stopEvent}
          onMouseUp={stopEvent}
          onPointerDown={stopEvent}
          onPointerUp={stopEvent}
          onTouchStart={stopEvent}
          onTouchEnd={stopEvent}
          role="presentation"
        >
          {/* Modal */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
            aria-describedby="share-modal-description"
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            onMouseUp={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            onPointerUp={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            onTouchEnd={(event) => event.stopPropagation()}
            className="relative w-full max-w-[460px] rounded-lg border border-cyan-400/50 bg-[#1a1f2e] px-6 py-6 text-gray-100 shadow-[0_0_30px_rgba(34,211,238,0.3)]"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClose();
              }}
              className="
    group absolute top-2 right-2 z-50
    flex items-center justify-center
    w-10 h-10 rounded-xl bg-gray-800/50 text-white
    hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/50
    transition-transform duration-150 cursor-pointer
    before:content-[''] before:absolute before:inset-[-8px] before:rounded-[14px] before:bg-transparent
  "
            >
              <X
                size={18}
                className="pointer-events-none transition-transform duration-150 group-hover:rotate-90"
              />
            </button>

            <div className="relative z-10">
              {/* Title */}
              <h2
                id="share-modal-title"
                className="text-center text-2xl font-bold text-white mb-2"
              >
                {t("shareWithFriends", {
                  defaultMessage: "Share with Friends",
                })}
              </h2>
              {/* Subtitle */}
              <p
                id="share-modal-description"
                className="text-center text-sm text-white/70 mb-6"
              >
                {t("shareTagline", {
                  defaultMessage:
                    "Every day something new, spreading knowledge makes you better",
                })}
              </p>

              {/* Share link */}
              <div className="mb-6 w-full text-left">
                <label className="mb-2 block text-sm font-medium text-white">
                  {t("shareLink", { defaultMessage: "Share you link" })}
                </label>
                <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-3">
                  <input
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-transparent text-gray-900 outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center justify-center cursor-pointer text-gray-600 hover:text-gray-900 transition-colors"
                    title={copied ? t("copied", { defaultMessage: "Copied!" }) : t("copy", { defaultMessage: "Copy link" })}
                  >
                    {copied ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <div className="relative w-4 h-4">
                        <Square
                          size={16}
                          className="absolute top-0 left-0 stroke-current"
                          strokeWidth={1.5}
                          fill="none"
                        />
                        <Square
                          size={16}
                          className="absolute top-1 left-1 stroke-current"
                          strokeWidth={1.5}
                          fill="currentColor"
                        />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Share to */}
              <div className="mb-4 text-left text-sm font-medium text-white">
                {t("shareTo", { defaultMessage: "Share to" })}
              </div>
              <style jsx global>{`
                .social-icon-button {
                  background-color: var(--social-color) !important;
                }
              `}</style>
              <div className="flex justify-center gap-4">
                {socialLinks.map(({ name, icon: Icon, color, url, isFacebook }) => {
                  // Special styling for each icon to make them clearer
                  const isSnapchat = name === "Snapchat";
                  const isWhatsApp = name === "Whatsapp";

                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={(event) => {
                        if (isFacebook) {
                          handleFacebookShare(event);
                        } else {
                          stopEvent(event);
                          const targetWindow =
                            typeof window !== "undefined" ? window : undefined;
                          targetWindow?.open(
                            url,
                            "_blank",
                            "noopener,noreferrer"
                          );
                        }
                      }}
                      onMouseDown={stopEvent}
                      onMouseUp={stopEvent}
                      onPointerDown={stopEvent}
                      onPointerUp={stopEvent}
                      onTouchStart={stopEvent}
                      onTouchEnd={stopEvent}
                      onKeyDown={stopEvent}
                      onKeyUp={stopEvent}
                      className={`social-icon-button flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 hover:shadow-lg cursor-pointer focus:outline-none ${isSnapchat ? "border-2 border-black/30 shadow-lg" : ""
                        }`}
                      style={
                        {
                          backgroundColor: color,
                          "--social-color": color,
                        } as React.CSSProperties & { "--social-color": string }
                      }
                      title={name}
                    >
                      <Icon
                        size={22}
                        className="text-white"
                        style={{
                          filter: isSnapchat
                            ? "drop-shadow(0 0 1px rgba(0,0,0,0.8))"
                            : isWhatsApp
                              ? "drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
                              : "drop-shadow(0 1px 2px rgba(0,0,0,0.15))",
                          stroke: isSnapchat ? "black" : "none",
                          strokeWidth: isSnapchat ? "0.5px" : "0",
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
