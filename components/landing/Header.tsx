"use client";

import React, { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";

export default function Header() {
    const locale = useLocale();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [activeIndicatorStyle, setActiveIndicatorStyle] = useState({
        left: "0px",
        width: "0px",
    });

    const navTabRefsDesktop = useRef<(HTMLLIElement | null)[]>([]);
    const navTabRefsTablet = useRef<(HTMLLIElement | null)[]>([]);

    const navItems = [
        { label: "Trang chủ", href: "/landing" },
        { label: "Giới thiệu", href: "/landing/introduction" },
        { label: "Sản phẩm & Dịch vụ", href: "/landing/products" },
        { label: "Liên hệ", href: "/landing/contact" },
        { label: "Tin tức", href: "/landing/news" },
    ];

    useEffect(() => {
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
        checkDesktop();
        window.addEventListener("resize", checkDesktop);
        return () => window.removeEventListener("resize", checkDesktop);
    }, []);

    // Sync active tab with pathname
    useEffect(() => {
        const currentPath = pathname || "";
        // Remove locale prefix if present
        const pathWithoutLocale = currentPath.replace(`/${locale}`, "") || "/";

        // Find matching index
        const index = navItems.findIndex(item => {
            if (item.href === "/landing") {
                return pathWithoutLocale === "/landing" || pathWithoutLocale === "/landing/";
            }
            return pathWithoutLocale.startsWith(item.href);
        });

        if (index !== -1) {
            setActiveTabIndex(index);
        }
    }, [pathname, locale]);

    useEffect(() => {
        const updateIndicator = () => {
            const refs = isDesktop ? navTabRefsDesktop : navTabRefsTablet;
            const activeTab = refs.current[activeTabIndex];

            if (activeTab?.parentElement) {
                const parentRect = activeTab.parentElement.getBoundingClientRect();
                const tabRect = activeTab.getBoundingClientRect();

                setActiveIndicatorStyle({
                    left: `${tabRect.left - parentRect.left}px`,
                    width: `${tabRect.width}px`,
                });
            }
        };

        updateIndicator();
        window.addEventListener("resize", updateIndicator);
        return () => window.removeEventListener("resize", updateIndicator);
    }, [activeTabIndex, isDesktop]);

    useEffect(() => {
        if (isMobileMenuOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = "100%";

            return () => {
                document.body.style.position = "";
                document.body.style.top = "";
                document.body.style.width = "";
                window.scrollTo(0, scrollY);
            };
        }
    }, [isMobileMenuOpen]);

    const handleNavClick = (index: number) => {
        // Only close mobile menu, let useEffect handle active state
        setIsMobileMenuOpen(false);
    };

    const Logo = ({ className }: { className: string }) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="158"
            height="36"
            viewBox="0 0 158 36"
            fill="none"
            className={className}
        >
            <path
                d="M62.978 24.8386H59.4653L63.1252 14.1903C63.2799 13.7337 63.5523 13.3508 63.95 13.0194C64.3477 12.6954 64.7895 12.526 65.2829 12.526H74.0387V24.8312H70.7175V20.7884H64.3771L62.978 24.8312V24.8386ZM65.4891 17.6219H70.7175V15.6925H66.4906C66.3801 15.6925 66.2697 15.7588 66.1666 15.8987C66.0635 16.0386 66.0119 16.1417 65.9972 16.2227L65.4891 17.6219Z"
                fill="#000000"
            />
            <path
                d="M84.348 15.6999H81.5939V21.6648H84.348V24.8386H75.5112V21.6648H78.2654V15.6999H75.5112V12.5261H84.348V15.6999Z"
                fill="#000000"
            />
            <path
                d="M101.227 24.8387V20.2362H94.5843V24.8387H91.2632V12.5334H94.5843V17.0623H101.227V12.5334H104.548V24.8387H101.227Z"
                fill="#000000"
            />
            <path
                d="M115.991 12.5261H119.313V21.6427C119.313 22.0182 119.209 22.4012 119.011 22.7767C118.812 23.1523 118.554 23.491 118.237 23.793C117.921 24.0949 117.575 24.3453 117.192 24.5367C116.809 24.7282 116.433 24.8313 116.065 24.8313H109.268C108.9 24.8313 108.532 24.7355 108.141 24.5367C107.751 24.3379 107.405 24.0949 107.096 23.793C106.786 23.491 106.521 23.1523 106.322 22.7767C106.124 22.4012 106.021 22.0182 106.021 21.6427V12.5261H109.342V20.9799C109.342 21.083 109.371 21.1714 109.437 21.2597C109.496 21.3481 109.577 21.4218 109.673 21.4733C109.769 21.5322 109.865 21.5764 109.968 21.6059C110.071 21.6353 110.159 21.65 110.247 21.65H115.078C115.167 21.65 115.262 21.6353 115.358 21.6059C115.461 21.5764 115.557 21.5322 115.653 21.4733C115.748 21.4144 115.829 21.3408 115.888 21.2597C115.955 21.1714 115.984 21.0756 115.984 20.9799V12.5261H115.991Z"
                fill="#000000"
            />
            <path
                d="M134.077 21.6427C134.077 22.0182 133.974 22.4012 133.775 22.7767C133.576 23.1523 133.319 23.491 133.002 23.793C132.685 24.0949 132.339 24.3453 131.956 24.5367C131.573 24.7282 131.198 24.8313 130.83 24.8313H120.785V12.5261H130.83C131.198 12.5261 131.566 12.6218 131.956 12.8206C132.339 13.0121 132.693 13.2625 133.002 13.5644C133.319 13.8663 133.576 14.205 133.775 14.5806C133.974 14.9562 134.077 15.3391 134.077 15.7147V17.0328C134.077 17.2243 134.033 17.3937 133.952 17.5557C133.871 17.7103 133.768 17.8576 133.643 17.9975C133.517 18.1374 133.378 18.2626 133.23 18.3731C133.076 18.4835 132.943 18.5866 132.818 18.675C133.068 18.8517 133.311 19.0653 133.554 19.3157C133.79 19.566 133.967 19.8974 134.085 20.3172V21.6353L134.077 21.6427ZM124.88 17.0549H129.88C130.056 17.0549 130.248 16.996 130.447 16.8782C130.646 16.7604 130.749 16.591 130.749 16.3774C130.749 16.2743 130.719 16.186 130.653 16.0976C130.594 16.0092 130.513 15.9356 130.417 15.884C130.322 15.8251 130.226 15.7809 130.123 15.7515C130.02 15.722 129.924 15.7073 129.843 15.7073H124.106V21.6721H129.843C129.931 21.6721 130.027 21.65 130.123 21.6132C130.226 21.5764 130.322 21.5249 130.417 21.4586C130.513 21.3997 130.594 21.3187 130.653 21.2303C130.719 21.1419 130.749 21.0462 130.749 20.9505C130.749 20.7369 130.646 20.5602 130.447 20.4276C130.248 20.2951 130.056 20.2288 129.88 20.2288H124.88V17.0549Z"
                fill="#000000"
            />
            <path
                d="M23.5 30.1848L27.101 20.619C27.7048 19.0137 29.2366 17.9533 30.9524 17.9533H38.1764L33.2647 5H40.2531C41.9689 5 43.5006 6.06041 44.1044 7.66576L47.9705 17.9606H42.3813C39.8922 17.9606 37.6609 19.485 36.7552 21.7973L33.4708 30.1848H23.5074H23.5Z"
                fill="url(#paint0_linear)"
            />
            <path
                d="M49.3991 21.9077H44.2959C41.9909 21.9077 40.4003 24.2126 41.2177 26.3629L42.6684 30.1848H52.4036L49.4065 21.9077H49.3991Z"
                fill="url(#paint1_linear)"
            />
            <defs>
                <linearGradient
                    id="paint0_linear"
                    x1="33.4856"
                    y1="30.936"
                    x2="41.4166"
                    y2="6.74526"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#47C2FF" />
                    <stop offset="1" stopColor="#00E5FF" />
                </linearGradient>
                <linearGradient
                    id="paint1_linear"
                    x1="46.702"
                    y1="21.9077"
                    x2="46.702"
                    y2="30.1848"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#9FF3DF" />
                    <stop offset="1" stopColor="#17EFF7" />
                </linearGradient>
            </defs>
        </svg>
    );

    const NavList = ({
        refs,
        layoutId,
        size = "default"
    }: {
        refs: React.MutableRefObject<(HTMLLIElement | null)[]>;
        layoutId: string;
        size?: "default" | "small";
    }) => (
        <ul className={`relative flex items-center gap-1 ${size === "small" ? "h-10 px-2" : "h-10 px-1"} rounded-full bg-gray-50`}>
            {activeTabIndex >= 0 && (
                <motion.div
                    layoutId={layoutId}
                    className="absolute inset-y-1 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 shadow-md z-0"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    style={activeIndicatorStyle}
                />
            )}

            {navItems.map((item, idx) => (
                <li
                    key={idx}
                    ref={(el) => {
                        refs.current[idx] = el;
                    }}
                    className={`relative ${size === "small" ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm"} rounded-full font-medium transition-all duration-300 cursor-pointer whitespace-nowrap ${activeTabIndex === idx ? "text-white z-10" : "text-gray-700 hover:text-gray-900"
                        }`}
                    onClick={() => handleNavClick(idx)}
                >
                    <Link href={`/${locale}${item.href}`} prefetch={true} className="block w-full h-full">
                        {item.label}
                    </Link>
                </li>
            ))}
        </ul>
    );

    return (
        <header className="w-full bg-transparent z-50 absolute top-0 left-0 right-0 fixed">
            <div className="px-4 sm:px-8 w-full">
                {/* Desktop Layout (>= 1024px) */}
                <div className="hidden lg:flex items-center justify-between h-[70px]">
                    <Link href="/" className="flex items-center shrink-0">
                        <Logo className="h-8 w-auto" />
                    </Link>

                    <nav className="absolute left-1/2 transform -translate-x-1/2">
                        <NavList refs={navTabRefsDesktop} layoutId="activeTab" />
                    </nav>

                    <div className="flex items-center shrink-0">
                        <Link href={`/${locale}/landing/contact`} onClick={() => handleNavClick(3)}>
                            <button className="h-10 px-6 rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-cyan-400/40 hover:brightness-105 transition-all duration-300 transform hover:-translate-y-0.5">
                                Tư vấn miễn phí
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Tablet Layout (640px - 1023px) */}
                <div className="hidden sm:flex lg:hidden items-center justify-between h-[70px]">
                    <Link href="/" className="flex items-center shrink-0">
                        <Logo className="h-7 w-auto" />
                    </Link>

                    <div className="flex items-center gap-3 shrink-0">
                        <Link href={`/${locale}/landing/contact`} onClick={() => handleNavClick(3)}>
                            <button className="h-9 px-4 rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-cyan-400/40 transition-all">
                                Tư vấn miễn phí
                            </button>
                        </Link>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6 text-gray-700" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-700" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Layout (< 640px) */}
                <div className="flex sm:hidden items-center justify-between h-[70px]">
                    <Link href="/" className="flex items-center shrink-0">
                        <Logo className="h-6 w-auto" />
                    </Link>

                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6 text-gray-700" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-700" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile & Tablet Menu */}
            <div
                className={`lg:hidden fixed left-0 right-0 bg-white shadow-2xl z-40 transition-all duration-300 ease-out overflow-y-auto ${isMobileMenuOpen
                    ? "top-[70px] max-h-[calc(100vh-70px)] opacity-100"
                    : "top-0 max-h-0 opacity-0 pointer-events-none"
                    }`}
            >
                <div className="pb-6">
                    <div className="px-4 py-4 border-b border-gray-200">
                        {navItems.map((item, idx) => (
                            <Link
                                key={idx}
                                href={`/${locale}${item.href}`}
                                prefetch={true}
                                onClick={() => handleNavClick(idx)}
                                className={`block w-full text-left px-4 py-3 mb-2 rounded-lg font-medium transition-all ${activeTabIndex === idx
                                    ? "bg-cyan-50 text-cyan-600"
                                    : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className="px-4 py-4 sm:hidden">
                        <Link href={`/${locale}/landing/contact`} onClick={() => handleNavClick(3)}>
                            <button className="w-full h-10 rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-400/40 transition-all">
                                Tư vấn miễn phí
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}