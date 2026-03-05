"use client";

import type {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  SyntheticEvent,
} from "react";
import { useEffect, useRef, useState } from "react";
import { Share2, MessageCircle, Eye, ThumbsUp } from "lucide-react";
import { ReactionPicker } from "@/components/ui/ReactionPicker";
import { ReactionEmoji } from "@/components/ui/ReactionEmoji";
import dynamic from "next/dynamic";
import { useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import type { Content } from "@/services/client/blog.client";
import usePostReaction from "./hooks/usePostReaction";

const ShareModal = dynamic(() => import("./ShareModal"), {
  ssr: false,
  loading: () => null,
});

interface CardInteractionsProps {
  content: Content;
  postId: string;
  postSlug?: string;
  alignPickerToCard?: boolean;
  compact?: boolean;
  className?: string;
  initialReaction?: string | null;
  onView?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  onReact?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  onComment?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  onShare?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
}

export default function CardInteractions({
  content,
  postId,
  postSlug,
  alignPickerToCard = false,
  compact = false,
  className,
  initialReaction,
  onView,
  onReact,
  onComment,
  onShare,
}: CardInteractionsProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  const [openShareModal, setOpenShareModal] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerPosition, setPickerPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  const {
    selectedReaction,
    loadingReaction,
    handleReaction: handlePostReaction,
  } = usePostReaction({
    postId,
    contentId: content?.id,
    initialReaction: initialReaction,
    isAuthenticated: isAuthenticated && !!user?.userId,
    onRequireAuth: () => {
      router.push(`/${locale}/auth/signin`);
    },
    loggerScope: { module: "CardInteractions" },
  });

  // Local reaction count state for immediate UI update
  const [reactionCount, setReactionCount] = useState(content?.reactionsCount ?? 0);

  // Sync reaction count with content prop changes
  useEffect(() => {
    setReactionCount(content?.reactionsCount ?? 0);
  }, [content?.reactionsCount]);

  const reactions = [
    { type: "LIKE", icon: "heroicons", label: "Liked" },
    { type: "LOVE", icon: "heroicons", label: "Loved" },
    { type: "HAHA", icon: "heroicons", label: "Laughed" },
    { type: "WOW", icon: "heroicons", label: "Surprised" },
    { type: "SAD", icon: "heroicons", label: "Sad" },
    { type: "ANGRY", icon: "heroicons", label: "Angry" },
  ];

  useEffect(() => {
    const onClickOutside = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (pickerRef.current && !pickerRef.current.contains(target)) {
        setIsPickerOpen(false);
      }
    };

    if (isPickerOpen) {
      document.addEventListener("mousedown", onClickOutside);
    }
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isPickerOpen]);

  const cancelPickerClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const schedulePickerClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    // Tăng delay để user có thời gian di chuột vào picker
    closeTimer.current = window.setTimeout(() => setIsPickerOpen(false), 300);
  };

  const openPickerWithDelay = () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    // Hủy close timer nếu đang có
    cancelPickerClose();
    hoverTimer.current = window.setTimeout(() => {
      const targetButton = buttonRef.current;

      if (targetButton) {
        if (alignPickerToCard) {
          // Tính toán vị trí relative to button's parent container
          const container = targetButton.closest(
            '[id^="action-buttons-container"]'
          );
          if (container) {
            const containerRect = container.getBoundingClientRect();
            const buttonRect = targetButton.getBoundingClientRect();
            // Tính toán relative to container - căn giữa theo button
            const relativeLeft = buttonRect.left - containerRect.left + buttonRect.width / 2;
            const relativeTop = buttonRect.top - containerRect.top;
            setPickerPosition({
              left: relativeLeft,
              top: relativeTop,
            });
          } else {
            // Fallback: tính toán relative to button's parent
            const parent = targetButton.parentElement;
            if (parent) {
              const parentRect = parent.getBoundingClientRect();
              const buttonRect = targetButton.getBoundingClientRect();
              const relativeLeft = buttonRect.left - parentRect.left + buttonRect.width / 2;
              const relativeTop = buttonRect.top - parentRect.top;
              setPickerPosition({
                left: relativeLeft,
                top: relativeTop,
              });
            } else {
              setPickerPosition(null);
            }
          }
        } else {
          setPickerPosition(null);
        }
      } else {
        setPickerPosition(null);
      }

      setIsPickerOpen(true);
    }, 100); // Giảm delay để mở nhanh hơn
  };

  const handleCommentsClick = () => {
    if (!postSlug) return;

    const currentPath = window.location.pathname;
    const blogDetailPath = `/${locale}/blog/${postSlug}`;

    if (currentPath === blogDetailPath) {
      const commentsSection = document.getElementById("comments-section");
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => {
          const textarea = document.getElementById(
            "comment-textarea"
          ) as HTMLTextAreaElement | null;
          textarea?.focus();
        }, 500);
      }
      return;
    }

    router.push(`${blogDetailPath}#comments-section`);
    setTimeout(() => {
      const textarea = document.getElementById(
        "comment-textarea"
      ) as HTMLTextAreaElement | null;
      textarea?.focus();
    }, 1000);
  };

  const stopEvent = (event: SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const nativeEvent = event.nativeEvent as Event & {
      stopImmediatePropagation?: () => void;
    };
    nativeEvent.stopImmediatePropagation?.();
  };

  const navigateToDetail = () => {
    if (!postSlug) return;
    router.push(`/${locale}/blog/${postSlug}`);
  };

  const handleShareClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    stopEvent(event);
    if (onShare) {
      onShare(event);
      return;
    }
    setOpenShareModal(true);
  };

  const handleCommentClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    stopEvent(event);
    if (onComment) {
      onComment(event);
      return;
    }
    handleCommentsClick();
  };

  const handleReactClick = async (
    event: ReactMouseEvent<HTMLButtonElement>
  ) => {
    stopEvent(event);
    // Prevent navigation when clicking reaction button
    event.stopPropagation();
    if (onReact) {
      onReact(event);
      return;
    }

    const previousReaction = selectedReaction;
    const result = await handlePostReaction(selectedReaction ?? "LIKE");

    // Update reaction count based on state change
    if (!previousReaction && result) {
      // Added new reaction: increment count
      setReactionCount(prev => prev + 1);
    } else if (previousReaction && !result) {
      // Removed reaction: decrement count
      setReactionCount(prev => Math.max(0, prev - 1));
    }
    // If changed reaction type (previousReaction && result && previousReaction !== result), count stays same

    setIsPickerOpen(false);
  };

  const handleViewClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    stopEvent(event);
    if (onView) {
      onView(event);
      return;
    }
    navigateToDetail();
  };

  const pickerInlineStyle: CSSProperties | undefined = pickerPosition && alignPickerToCard
    ? {
      position: "absolute",
      left: `${pickerPosition.left}px`,
      top: `${pickerPosition.top}px`,
      transform: "translate(-50%, calc(-100% - 16px))",
    }
    : undefined;

  const wrapperClass =
    className ??
    `relative flex flex-wrap items-center justify-center ${compact ? "gap-2 text-xs sm:gap-3 sm:text-sm" : "gap-4 text-sm"
    } text-white/85 tracking-wide`;

  const finalWrapperClass = alignPickerToCard
    ? `${wrapperClass} relative`
    : wrapperClass;

  return (
    <>
      <div className={finalWrapperClass} onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={handleViewClick}
          onMouseDown={stopEvent}
          onMouseUp={stopEvent}
          className="flex items-center gap-1.5 sm:gap-2 text-white/80 hover:text-cyan-200 transition-colors cursor-pointer"
        >
          <Eye size={compact ? 20 : 22} strokeWidth={1.7} className="sm:w-5 sm:h-5" />
          <span className="font-semibold text-xs sm:text-sm">{content?.viewsCount ?? 0}</span>
        </button>

        <div className="relative flex items-center">
          <button
            ref={buttonRef}
            type="button"
            onClick={handleReactClick}
            onMouseDown={stopEvent}
            onMouseUp={stopEvent}
            onMouseEnter={openPickerWithDelay}
            onMouseLeave={schedulePickerClose}
            disabled={loadingReaction}
            className={`flex items-center gap-1.5 sm:gap-2 text-white/80 hover:text-cyan-200 transition-colors cursor-pointer ${selectedReaction ? "text-cyan-200" : ""
              }`}
          >
            {selectedReaction ? (
              <ReactionEmoji
                type={selectedReaction as any}
                size={compact ? 22 : 24}
                animated={true}
                className="sm:w-6 sm:h-6"
              />
            ) : (
              <ThumbsUp size={compact ? 20 : 22} strokeWidth={1.7} className="sm:w-5 sm:h-5 text-white/80" />
            )}
            <span className="font-semibold text-xs sm:text-sm">
              {reactionCount}
            </span>
          </button>

          {isPickerOpen && (
            <div
              ref={alignPickerToCard ? pickerRef : undefined}
              style={alignPickerToCard ? pickerInlineStyle : undefined}
              className={alignPickerToCard ? "absolute z-[9999] pointer-events-auto" : "relative z-[9999] pointer-events-auto"}
              onMouseEnter={cancelPickerClose}
              onMouseLeave={schedulePickerClose}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <ReactionPicker
                reactions={reactions}
                isOpen={isPickerOpen}
                onSelect={async (type) => {
                  const previousReaction = selectedReaction;
                  const result = await handlePostReaction(type);

                  // Update reaction count based on state change
                  if (!previousReaction && result) {
                    // Added new reaction: increment count
                    setReactionCount(prev => prev + 1);
                  } else if (previousReaction && !result) {
                    // Removed reaction: decrement count
                    setReactionCount(prev => Math.max(0, prev - 1));
                  }
                  // If changed reaction type, count stays same

                  setIsPickerOpen(false);
                }}
                onClose={schedulePickerClose}
                position="top"
                align="center"
                selectedReaction={selectedReaction || undefined}
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleCommentClick}
          onMouseDown={stopEvent}
          onMouseUp={stopEvent}
          className="flex items-center gap-1.5 sm:gap-2 text-white/80 hover:text-cyan-200 transition-colors cursor-pointer"
        >
          <MessageCircle size={compact ? 20 : 22} strokeWidth={1.7} className="sm:w-5 sm:h-5" />
          <span className="font-semibold text-xs sm:text-sm">
            {content?.commentsCount ?? 0}
          </span>
        </button>

        <button
          type="button"
          onClick={handleShareClick}
          onMouseDown={stopEvent}
          onMouseUp={stopEvent}
          onPointerDown={stopEvent}
          onPointerUp={stopEvent}
          onTouchStart={stopEvent}
          onTouchEnd={stopEvent}
          onKeyDown={stopEvent}
          onKeyUp={stopEvent}
          className="flex items-center gap-1.5 sm:gap-2 text-white/80 hover:text-cyan-200 transition-colors cursor-pointer"
        >
          <Share2 size={compact ? 20 : 22} strokeWidth={1.7} className="sm:w-5 sm:h-5" />
          <span className="font-semibold text-xs sm:text-sm">
            {content?.sharesCount ?? 0}
          </span>
        </button>
      </div>

      {!onShare && postSlug && (
        <ShareModal
          open={openShareModal}
          onClose={() => setOpenShareModal(false)}
          postSlug={postSlug}
        />
      )}
    </>
  );
}
