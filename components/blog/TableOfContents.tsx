"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { List, X } from "lucide-react";

interface Heading {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    theme?: "dark" | "light";
}

export default function TableOfContents({ theme = "dark" }: TableOfContentsProps = {}) {
    const [headings, setHeadings] = useState<Heading[]>([]);
    const [activeId, setActiveId] = useState<string>("");
    const [isOpen, setIsOpen] = useState(false);

    // Calculate responsive height based on number of headings
    const maxHeight = Math.min(450, Math.max(60, headings.length * 45 + 60));

    // Theme styles
    const themeStyles = theme === "light" ? {
        toggleBg: "bg-white",
        toggleText: "text-cyan-600",
        toggleBorder: "border-gray-300",
        toggleHoverBg: "hover:bg-gray-50",
        toggleHoverBorder: "hover:border-gray-400",
        drawerBg: "bg-white",
        drawerBorder: "border-gray-200",
        headerText: "text-gray-900",
        cardBg: "bg-white",
        cardBorder: "border-gray-200",
        cardShadow: "shadow-lg",
        itemText: "text-gray-700",
        itemHoverText: "hover:text-gray-900",
        itemHoverBg: "hover:bg-gray-100",
        itemHoverBorder: "hover:border-gray-400",
        activeText: "text-cyan-600",
        activeBorder: "border-cyan-600",
        activeBg: "bg-cyan-50",
        closeButton: "text-gray-600 hover:text-gray-900",
    } : {
        toggleBg: "bg-[#1C2333]",
        toggleText: "text-cyan-400",
        toggleBorder: "border-cyan-400/30",
        toggleHoverBg: "hover:bg-[#243447]",
        toggleHoverBorder: "hover:border-cyan-400/50",
        drawerBg: "bg-[#0F172A]",
        drawerBorder: "border-white/10",
        headerText: "text-white",
        cardBg: "bg-[#1C2333]",
        cardBorder: "border-white/10",
        cardShadow: "shadow-[0_15px_35px_rgba(2,6,23,0.45)]",
        itemText: "text-gray-400",
        itemHoverText: "hover:text-gray-200",
        itemHoverBg: "hover:bg-white/5",
        itemHoverBorder: "hover:border-gray-600",
        activeText: "text-cyan-400",
        activeBorder: "border-cyan-400",
        activeBg: "bg-cyan-400/10",
        closeButton: "text-gray-400 hover:text-white",
    };

    useEffect(() => {
        // Find all headings and add IDs if missing
        const elements = Array.from(
            document.querySelectorAll(".prose h1, .prose h2, .prose h3")
        );

        const items: Heading[] = elements
            .map((elem, index) => {
                // Generate ID if not exists
                if (!elem.id) {
                    const text = elem.textContent || "";
                    const slug = text
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/đ/g, "d")
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "");
                    elem.id = slug || `heading-${index}`;
                }

                return {
                    id: elem.id,
                    text: elem.textContent || "",
                    level: parseInt(elem.tagName.substring(1)),
                };
            })
            .filter((item) => item.id && item.text);

        setHeadings(items);

        // Setup Intersection Observer for better scroll spy
        const observerOptions = {
            rootMargin: "-80px 0px -60% 0px",
            threshold: 0.1,
        };

        let currentActiveId = "";

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    currentActiveId = entry.target.id;
                    setActiveId(currentActiveId);
                }
            });
        }, observerOptions);

        elements.forEach((elem) => observer.observe(elem));

        // Fallback: Check scroll position on scroll
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 120;

            for (let i = elements.length - 1; i >= 0; i--) {
                const element = elements[i] as HTMLElement;
                if (element.offsetTop <= scrollPosition) {
                    if (currentActiveId !== element.id) {
                        currentActiveId = element.id;
                        setActiveId(currentActiveId);
                    }
                    break;
                }
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleClick = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offsetTop = element.offsetTop - 100;
            window.scrollTo({
                top: offsetTop,
                behavior: "smooth",
            });
            setActiveId(id);
            setIsOpen(false);
        }
    };

    if (headings.length === 0) return null;

    return (
        <>
            {/* Mobile/Tablet Toggle Button - Left side */}
            <button
                onClick={() => setIsOpen(true)}
                className={`xl:hidden fixed left-4 top-32 z-40 p-3 ${themeStyles.toggleBg} ${themeStyles.toggleText} rounded-lg shadow-lg backdrop-blur-sm border ${themeStyles.toggleBorder} ${themeStyles.toggleHoverBg} ${themeStyles.toggleHoverBorder} transition-all`}
                aria-label="Mục lục"
            >
                <List className="w-5 h-5" />
            </button>

            {/* Mobile/Tablet Drawer Overlay */}
            {isOpen && (
                <div
                    className="xl:hidden fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile/Tablet Drawer - Slide from LEFT */}
            <div
                className={cn(
                    `xl:hidden fixed inset-y-0 left-0 z-50 w-[75%] max-w-[280px] ${themeStyles.drawerBg} border-r ${themeStyles.drawerBorder} p-4 transform transition-transform duration-300 ease-in-out shadow-2xl`,
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Mobile Header */}
                <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-sm font-bold ${themeStyles.headerText}`}>NỘI DUNG</h3>
                    <button
                        onClick={() => setIsOpen(false)}
                        className={`${themeStyles.closeButton} transition-colors`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Mobile List */}
                <nav className="overflow-y-auto max-h-[calc(100vh-80px)] custom-scrollbar pr-2">
                    <ul className="space-y-0.5">
                        {headings.map((heading) => (
                            <li
                                key={heading.id}
                                style={{ marginLeft: `${(heading.level - 1) * 0.5}rem` }}
                            >
                                <button
                                    onClick={() => handleClick(heading.id)}
                                    className={cn(
                                        "text-left text-sm transition-all duration-200 block w-full py-1.5 px-2.5 rounded-lg border-l-2",
                                        activeId === heading.id
                                            ? `${themeStyles.activeText} ${themeStyles.activeBorder} ${themeStyles.activeBg} font-medium`
                                            : `${themeStyles.itemText} border-transparent ${themeStyles.itemHoverText} ${themeStyles.itemHoverBg} ${themeStyles.itemHoverBorder}`
                                    )}
                                >
                                    <span className="line-clamp-2 leading-tight">{heading.text}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Desktop Content - Fixed Left Sidebar */}
            <div className="hidden xl:block fixed top-36 left-4 z-[100] w-[260px]" style={{ height: `${maxHeight}px` }}>
                <div className={`${themeStyles.cardBg} border ${themeStyles.cardBorder} rounded-2xl p-3 ${themeStyles.cardShadow} h-full flex flex-col`}>
                    <h3 className={`text-sm font-semibold ${themeStyles.headerText} mb-2 px-1`}>NỘI DUNG</h3>
                    <nav
                        className="overflow-y-auto flex-1 pr-1 toc-scroll"
                        onWheel={(e) => {
                            const target = e.currentTarget;
                            const atTop = target.scrollTop === 0;
                            const atBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 1;

                            if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
                                e.stopPropagation();
                            }
                        }}
                    >
                        <ul className="space-y-0.5">
                            {headings.map((heading) => (
                                <li
                                    key={heading.id}
                                    style={{ marginLeft: `${(heading.level - 1) * 0.5}rem` }}
                                >
                                    <button
                                        onClick={() => handleClick(heading.id)}
                                        className={cn(
                                            "text-left text-sm transition-all duration-200 block w-full py-1.5 px-2.5 rounded-lg border-l-2",
                                            activeId === heading.id
                                                ? `${themeStyles.activeText} ${themeStyles.activeBorder} ${themeStyles.activeBg} font-medium shadow-sm`
                                                : `${themeStyles.itemText} border-transparent ${themeStyles.itemHoverText} ${themeStyles.itemHoverBg} ${themeStyles.itemHoverBorder}`
                                        )}
                                    >
                                        <span className="line-clamp-2 leading-tight">{heading.text}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Custom Scrollbar Styles */}
                    <style jsx>{`
            .toc-scroll::-webkit-scrollbar {
              width: 5px;
            }

            .toc-scroll::-webkit-scrollbar-track {
              background: transparent;
              border-radius: 10px;
            }

            .toc-scroll::-webkit-scrollbar-thumb {
              background: rgba(6, 182, 212, 0.3);
              border-radius: 10px;
              transition: background 0.2s ease;
            }

            .toc-scroll:hover::-webkit-scrollbar-thumb {
              background: rgba(6, 182, 212, 0.6);
            }

            .toc-scroll::-webkit-scrollbar-thumb:hover {
              background: rgba(6, 182, 212, 0.8);
            }

            /* Firefox */
            .toc-scroll {
              scrollbar-color: rgba(6, 182, 212, 0.3) transparent;
            }

            .toc-scroll:hover {
              scrollbar-color: rgba(6, 182, 212, 0.6) transparent;
            }
          `}</style>
                </div>
            </div>
        </>
    );
}