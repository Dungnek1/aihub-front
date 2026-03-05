"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { sanitizeHtml } from "@/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigation } from "@/contexts/NavigationContext";
import { getPostBySlug } from "@/services/client/blog.client";
import "@/styles/notifications.css";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  bellButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export default function NotificationDropdown({
  isOpen,
  onClose,
  bellButtonRef,
}: NotificationDropdownProps) {
  const t = useTranslations("Header");
  const tNotif = useTranslations("Notifications");
  const locale = useLocale();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { setIsNavigating } = useNavigation();
  const { notifications, unreadCount, loadingNotifications, onMarkAllRead } =
    useNotifications();
  const notificationRef = useRef<HTMLDivElement>(null);

  // Handle notification click - navigate to blog post
  const handleNotificationClick = useCallback(
    async (notification: {
      id: string;
      type?: string;
      html?: string;
      event?: {
        objectType: string;
        objectId: string;
        type?: string;
      };
    }) => {
      // Process notification click

      // ✅ Nếu không có event, thử parse từ HTML hoặc type
      if (!notification.event) {
        // Thử extract từ HTML nếu có
        if (notification.html) {
          const htmlDoc = new DOMParser().parseFromString(
            notification.html,
            "text/html"
          );

          // Tìm link đến tool
          const toolLink = htmlDoc.querySelector(
            'a[href*="/ai-tools"], a[href*="tool"]'
          );
          if (toolLink) {
            const href = toolLink.getAttribute("href") || "";
            const toolMatch =
              href.match(/tool[Id=]*([a-zA-Z0-9-]+)/i) ||
              href.match(/ai-tools[^"]*toolId=([^&"#]+)/);
            if (toolMatch && toolMatch[1]) {
              setIsNavigating(true);
              onClose();
              router.push(`/${locale}/ai-tools?toolId=${toolMatch[1]}`);
              return;
            }
          }

          // Tìm link đến blog
          const blogLink = htmlDoc.querySelector('a[href*="/blog/"]');
          if (blogLink) {
            const href = blogLink.getAttribute("href") || "";
            const match = href.match(/\/blog\/([^\/\?#]+)/);
            if (match && match[1]) {
              setIsNavigating(true);
              onClose();
              router.push(`/${locale}/blog/${match[1]}`);
              return;
            }
          }
        }

        // Nếu không parse được từ HTML, return
        return;
      }

      const { objectType, objectId } = notification.event;
      const notificationType =
        notification.type || notification.event.type || "";

      // Process notification based on type

      // Check if this is a comment notification
      const isCommentNotification =
        objectType === "comment" ||
        notificationType.toLowerCase().includes("comment");

      // Check if this is a reaction notification
      const isReactionNotification =
        objectType === "reaction" ||
        notificationType.toLowerCase().includes("reaction") ||
        notificationType.toLowerCase().includes("react");

      // ✅ Check if this is a tool rating notification - cải thiện logic
      const isToolRatingNotification =
        objectType === "tool" ||
        objectType === "rating" ||
        notificationType.toLowerCase() === "tool_rated" ||
        notificationType.toLowerCase().includes("tool") ||
        notificationType.toLowerCase().includes("rating") ||
        notificationType.toLowerCase().includes("rate");

      // If it's a tool rating notification, navigate to ai-tools page with toolId
      if (isToolRatingNotification && objectId) {
        try {
          setIsNavigating(true);
          onClose(); // Close dropdown before navigation

          // Navigate to ai-tools page with toolId as query parameter
          await router.push(`/${locale}/ai-tools?toolId=${objectId}`);

          // Wait for navigation and scroll to tool
          setTimeout(() => {
            const toolElement = document.getElementById(`tool-${objectId}`);
            if (toolElement) {
              toolElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              // Highlight the tool briefly
              toolElement.style.transition = "background-color 0.3s";
              toolElement.style.backgroundColor = "rgba(6, 182, 212, 0.1)";
              setTimeout(() => {
                toolElement.style.backgroundColor = "";
              }, 2000);
            } else {
              // If tool not found by ID, try to find by data-tool-id attribute
              const toolByAttr = document.querySelector(
                `[data-tool-id="${objectId}"]`
              );
              if (toolByAttr) {
                toolByAttr.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
                (toolByAttr as HTMLElement).style.transition =
                  "background-color 0.3s";
                (toolByAttr as HTMLElement).style.backgroundColor =
                  "rgba(6, 182, 212, 0.1)";
                setTimeout(() => {
                  (toolByAttr as HTMLElement).style.backgroundColor = "";
                }, 2000);
              }
            }
          }, 800);
        } catch (error) {
          // Fallback: just navigate to ai-tools page
          router.push(`/${locale}/ai-tools`);
        }
        return;
      }

      // If it's a comment notification, we need to get the post from the comment
      if (isCommentNotification && objectId) {
        try {
          setIsNavigating(true);
          onClose(); // Close dropdown before navigation

          // Try to extract post slug from notification HTML if available
          let postSlug: string | null = null;
          if (notification.html) {
            // Try to find blog post link in HTML
            const htmlDoc = new DOMParser().parseFromString(
              notification.html,
              "text/html"
            );
            const blogLink = htmlDoc.querySelector('a[href*="/blog/"]');
            if (blogLink) {
              const href = blogLink.getAttribute("href") || "";
              const match = href.match(/\/blog\/([^\/\?#]+)/);
              if (match && match[1]) {
                postSlug = match[1];
              }
            }
          }

          // If we found post slug from HTML, use it
          if (postSlug) {
            router.push(`/${locale}/blog/${postSlug}#comment-${objectId}`);

            // Wait for navigation and scroll to comment
            setTimeout(() => {
              const commentElement = document.getElementById(
                `comment-${objectId}`
              );
              if (commentElement) {
                commentElement.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
                // Highlight the comment briefly
                commentElement.style.transition = "background-color 0.3s";
                commentElement.style.backgroundColor = "rgba(6, 182, 212, 0.3)";
                setTimeout(() => {
                  commentElement.style.backgroundColor = "";
                }, 2000);
              } else {
                // If comment not found, scroll to comments section
                const commentsSection =
                  document.getElementById("comments-section");
                if (commentsSection) {
                  commentsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
              }
            }, 800);
            return;
          }

          // If no post slug found, try to use objectId as post slug (fallback)
          // This assumes objectId might be postId/slug in some cases
          router.push(`/${locale}/blog/${objectId}#comment-${objectId}`);

          // Wait for navigation and try to scroll to comment
          setTimeout(() => {
            const commentElement = document.getElementById(
              `comment-${objectId}`
            );
            if (commentElement) {
              commentElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              commentElement.style.transition = "background-color 0.3s";
              commentElement.style.backgroundColor = "rgba(6, 182, 212, 0.3)";
              setTimeout(() => {
                commentElement.style.backgroundColor = "";
              }, 2000);
            } else {
              // If comment not found, scroll to comments section
              const commentsSection =
                document.getElementById("comments-section");
              if (commentsSection) {
                commentsSection.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }
            }
          }, 800);
        } catch (error) {
          // Fallback: just navigate to post (assuming objectId is post slug)
          router.push(`/${locale}/blog/${objectId}`);
        }
        return;
      }

      // If it's a blog post notification (reaction or other), navigate to the post
      if (objectType === "post" && objectId) {
        try {
          setIsNavigating(true);
          onClose(); // Close dropdown before navigation

          // Try to fetch post by slug (objectId might be slug or ID)
          const post = await getPostBySlug(objectId);
          if (post?.slug) {
            router.push(`/${locale}/blog/${post.slug}`);
          } else {
            // If not found by slug, try using objectId as slug directly
            router.push(`/${locale}/blog/${objectId}`);
          }
        } catch (error) {
          // If fetch fails, try using objectId as slug directly
          router.push(`/${locale}/blog/${objectId}`);
        }
      }
    },
    [locale, router, onClose, setIsNavigating]
  );

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (!notificationRef.current) return;

      const path = event.composedPath() as Node[];

      // Nếu click nằm trong dropdown hoặc trong nút chuông thì bỏ qua
      if (
        path.includes(notificationRef.current) ||
        (bellButtonRef?.current && path.includes(bellButtonRef.current))
      ) {
        return;
      }

      onClose();
    },
    [onClose, bellButtonRef]
  );

  const handleScroll = useCallback(() => {
    if (!notificationRef.current) return;
    const panelRect = notificationRef.current.getBoundingClientRect();
    const isOffScreen =
      panelRect.bottom < 0 || panelRect.top > window.innerHeight;
    if (isOffScreen) {
      onClose();
    }
  }, [onClose]);

  // Lock body scroll when mouse is inside notification panel (but allow scroll inside panel)
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseEnter = () => {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      // Lock body scroll but allow scroll in panel
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      // Add padding to compensate for scrollbar to prevent layout shift
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    };

    const handleMouseLeave = () => {
      // Restore scroll position
      const scrollY = parseInt(document.body.style.top || "0") * -1;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      window.scrollTo(0, scrollY);
    };

    const panel = notificationRef.current;
    if (panel) {
      panel.addEventListener("mouseenter", handleMouseEnter);
      panel.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (panel) {
        panel.removeEventListener("mouseenter", handleMouseEnter);
        panel.removeEventListener("mouseleave", handleMouseLeave);
      }
      // Cleanup: restore body scroll when component unmounts
      const scrollY = parseInt(document.body.style.top || "0") * -1;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      if (scrollY > 0) {
        window.scrollTo(0, scrollY);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const listener = (event: MouseEvent) => {
      handleClickOutside(event);
    };

    // Dùng click, không dùng mousedown + capture nữa
    document.addEventListener("click", listener);
    window.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("click", listener);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen, handleClickOutside, handleScroll]);

  // ✅ Attach click handlers to notification items after render (backup method)
  useEffect(() => {
    if (!isOpen || notifications.length === 0) return;

    const attachClickHandlers = () => {
      const notificationItems = document.querySelectorAll(".notification-item");
      notificationItems.forEach((item, index) => {
        const notification = notifications[index];
        if (!notification) return;

        // Create a unique handler for this notification
        const clickHandler = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          handleNotificationClick(notification).catch(() => {
            // Silent fail - error already handled
          });
        };

        const mousedownHandler = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
        };

        // Remove any existing listeners first
        item.removeEventListener("click", clickHandler, true);
        item.removeEventListener("mousedown", mousedownHandler, true);

        // Attach new listeners
        item.addEventListener("click", clickHandler, true); // Use capture phase
        item.addEventListener("mousedown", mousedownHandler, true);

        // Store handlers for cleanup
        (item as any)._clickHandler = clickHandler;
        (item as any)._mousedownHandler = mousedownHandler;
      });
    };

    // Attach after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(attachClickHandlers, 100);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      const notificationItems = document.querySelectorAll(".notification-item");
      notificationItems.forEach((item) => {
        const clickHandler = (item as any)?._clickHandler;
        const mousedownHandler = (item as any)?._mousedownHandler;
        if (clickHandler) {
          item.removeEventListener("click", clickHandler, true);
        }
        if (mousedownHandler) {
          item.removeEventListener("mousedown", mousedownHandler, true);
        }
      });
    };
  }, [isOpen, notifications, handleNotificationClick]);

  // Handle avatar fallback and layout fixes
  useEffect(() => {
    if (!isOpen || notifications.length === 0) return;

    const handleImageError = (e: Event) => {
      const img = e.target as HTMLImageElement;
      if (!img || !img.parentElement) return;

      const altText = img.alt || "";
      const username = altText || "U";
      const initials =
        username.length >= 2
          ? username.substring(0, 2).toUpperCase()
          : username.toUpperCase();

      const fallback = document.createElement("div");
      fallback.className =
        "w-[50px] h-[50px] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 ring-2 ring-emerald-300/80 relative overflow-hidden";

      const textSpan = document.createElement("span");
      textSpan.className =
        "relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] text-white";
      textSpan.textContent = initials;
      fallback.appendChild(textSpan);

      fallback.style.marginRight = "10px";
      img.parentElement.replaceChild(fallback, img);
    };

    const fixLayout = () => {
      const notificationItems = document.querySelectorAll(
        ".notification-item > div"
      );
      notificationItems.forEach((div) => {
        const divElement = div as HTMLElement;
        divElement.style.setProperty("display", "flex", "important");
        divElement.style.setProperty("flex-direction", "row", "important");
        divElement.style.setProperty("flex-wrap", "nowrap", "important");
        divElement.style.setProperty("align-items", "center", "important");
        divElement.style.setProperty("gap", "12px", "important");
        divElement.style.setProperty("padding", "0", "important");
        divElement.style.setProperty("border", "none", "important");
        divElement.style.setProperty("border-radius", "0", "important");
        divElement.style.setProperty(
          "background-color",
          "transparent",
          "important"
        );
        divElement.style.setProperty("width", "100%", "important");

        const innerDivs = divElement.querySelectorAll("div");
        innerDivs.forEach((innerDiv) => {
          const innerDivElement = innerDiv as HTMLElement;
          const style = innerDivElement.getAttribute("style") || "";
          if (
            style.includes("flex-direction: column") ||
            style.includes("flex-direction:column")
          ) {
            innerDivElement.style.setProperty("display", "flex", "important");
            innerDivElement.style.setProperty(
              "flex-direction",
              "row",
              "important"
            );
            innerDivElement.style.setProperty(
              "flex-wrap",
              "nowrap",
              "important"
            );
            innerDivElement.style.setProperty(
              "align-items",
              "center",
              "important"
            );
            innerDivElement.style.setProperty("gap", "8px", "important");
            innerDivElement.style.setProperty("height", "auto", "important");
            innerDivElement.style.setProperty(
              "overflow",
              "visible",
              "important"
            );
            innerDivElement.style.setProperty("max-width", "none", "important");
          }
        });

        const firstChild = divElement.firstElementChild as HTMLElement;
        if (
          firstChild &&
          (firstChild.tagName === "IMG" ||
            firstChild.classList.contains("rounded-full") ||
            firstChild.style.width === "50px" ||
            firstChild.classList.contains("w-[50px]"))
        ) {
          firstChild.style.setProperty("margin-right", "0", "important");
          firstChild.style.setProperty("flex-shrink", "0", "important");
        }
      });
    };

    const observer = new MutationObserver(() => {
      fixLayout();
    });

    const timeoutId = setTimeout(() => {
      const notificationContainer =
        document.querySelector(".max-h-\\[400px\\]");
      if (notificationContainer) {
        observer.observe(notificationContainer, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["style"],
        });
      }

      fixLayout();
      setTimeout(() => fixLayout(), 50);
      setTimeout(() => fixLayout(), 150);
      setTimeout(() => fixLayout(), 300);

      const notificationItems = document.querySelectorAll(
        ".notification-item img"
      );
      notificationItems.forEach((img) => {
        const imgElement = img as HTMLImageElement;
        imgElement.addEventListener("error", handleImageError);
        if (!imgElement.complete || imgElement.naturalHeight === 0) {
          const errorEvent = new Event("error");
          Object.defineProperty(errorEvent, "target", {
            value: imgElement,
            enumerable: true,
          });
          handleImageError(errorEvent);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
      const notificationItems = document.querySelectorAll(
        ".notification-item img"
      );
      notificationItems.forEach((img) => {
        img.removeEventListener("error", handleImageError);
      });
    };
  }, [isOpen, notifications]);

  if (!isOpen) return null;

  return (
    <div
      ref={notificationRef}
      className="absolute top-[calc(100%+12px)] right-0 w-[450px] bg-[#0E1823] rounded-2xl border border-cyan-500/30 shadow-[0_8px_40px_rgba(0,229,255,0.3)] overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50 backdrop-blur-sm"
    >
      {!isAuthenticated ? (
        <div className="px-5 py-12 text-center">
          <Bell className="mx-auto mb-3 w-12 h-12 text-gray-600 opacity-50" />
          <p className="text-sm text-gray-400 mb-4 font-sans">
            {t("pleaseLoginToViewNotifications")}
          </p>
          <button
            onClick={() => {
              setTimeout(() => {
                router.push(`/${locale}/auth/signin`);
              }, 0);
            }}
            className="px-4 py-2 bg-linear-to-b from-[#00FFD1] to-[#00C8FF] text-[#0B5A5C] font-semibold rounded-lg hover:opacity-90 transition"
          >
            {t("signIn")}
          </button>
        </div>
      ) : (
        <>
          <div className="px-5 py-4 bg-linear-to-r from-[#0E1823] to-[#0B1620] border-b border-cyan-500/20">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-white">
                {tNotif("title")}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="text-xs text-gray-300 cursor-pointer hover:text-white underline-offset-2 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div
            className="max-h-[400px] overflow-y-auto overscroll-contain touch-pan-y bg-[#0E1823] notification-scrollbar"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(6, 182, 212, 0.5) transparent",
              touchAction: "pan-y",
              WebkitOverflowScrolling: "touch",
            }}
            onWheel={(e) => {
              // Allow wheel scroll inside panel
              e.stopPropagation();
            }}
            onTouchMove={(e) => {
              // Allow touch scroll inside panel
              e.stopPropagation();
            }}
          >
            <style
              dangerouslySetInnerHTML={{
                __html: `
                .notification-scrollbar::-webkit-scrollbar {
                  width: 8px;
                  height: 8px;
                }
                .notification-scrollbar::-webkit-scrollbar-track {
                  background: rgba(30, 41, 59, 0.3);
                  border-radius: 4px;
                }
                .notification-scrollbar::-webkit-scrollbar-thumb {
                  background: rgba(6, 182, 212, 0.5);
                  border-radius: 4px;
                  transition: background 0.2s;
                }
                .notification-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: rgba(6, 182, 212, 0.7);
                }
                .notification-item > div {
                  background-color: transparent !important;
                  border-color: transparent !important;
                  color: white !important;
                  display: flex !important;
                  flex-direction: row !important;
                  align-items: center !important;
                  white-space: nowrap !important;
                }
                .notification-item > div strong { color: white !important; }
                .notification-item > div > div { 
                  color: rgb(209, 213, 219) !important; 
                  white-space: nowrap !important;
                  overflow: visible !important;
                  text-overflow: ellipsis !important;
                  display: flex !important;
                  flex-direction: row !important;
                  align-items: center !important;
                  gap: 8px !important;
                  flex-wrap: nowrap !important;
                }
                .notification-item > div em { color: rgb(34, 211, 238) !important; }
                .notification-item img {
                  width: 50px !important;
                  height: 50px !important;
                  border-radius: 50% !important;
                  object-fit: cover !important;
                  flex-shrink: 0 !important;
                  margin-right: 10px !important;
                }
                .notification-item {
                  pointer-events: auto !important;
                  position: relative !important;
                  z-index: 1 !important;
                  cursor: pointer !important;
                }
                .notification-item * {
                  pointer-events: none !important;
                  cursor: pointer !important;
                }
                .notification-item > div {
                  pointer-events: none !important;
                  cursor: pointer !important;
                }
                .notification-item img {
                  pointer-events: none !important;
                  cursor: pointer !important;
                }
              `,
              }}
            />
            {loadingNotifications ? (
              <div className="px-5 py-6 text-center">
                <p className="text-sm text-gray-400">{tNotif("loading")}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Bell className="mx-auto mb-3 w-12 h-12 text-gray-600 opacity-50" />
                <p className="text-sm text-gray-400">
                  {tNotif("noNotifications")}
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNotificationClick(notification).catch(() => {
                      // Silent fail - error already handled
                    });
                  }}
                  style={{
                    pointerEvents: "auto",
                    position: "relative",
                    zIndex: 10,
                  }}
                  className="notification-item px-4 py-3 mx-2 my-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  {notification.html && notification.html.trim() ? (
                    <div
                      style={{
                        pointerEvents: "none",
                        userSelect: "none",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(notification.html, {
                          allowedTags: [
                            "div",
                            "span",
                            "strong",
                            "em",
                            "img",
                            "br",
                          ],
                          allowedAttributes: ["src", "alt", "class", "style"],
                        }),
                      }}
                    />
                  ) : (
                    <div className="flex flex-row items-center gap-3 w-full">
                      <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 ring-2 ring-emerald-300/80 relative overflow-hidden">
                        <span className="relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                          AD
                        </span>
                      </div>
                      <div className="flex flex-row items-center gap-2 text-white text-sm flex-1 min-w-0">
                        <strong className="text-base whitespace-nowrap">
                          System
                        </strong>
                        <span className="text-gray-400 whitespace-nowrap ">
                          {notification.type === "admin_action"
                            ? "Admin notification"
                            : `Notification: ${notification.type}`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-5 py-3 bg-linear-to-r from-[#0E1823] to-[#0B1620] border-t border-cyan-500/20">
              <button className="w-full text-sm font-medium text-center text-cyan-400 transition-colors cursor-pointer hover:text-cyan-300">
                {tNotif("viewAll")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
