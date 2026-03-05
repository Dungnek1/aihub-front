"use client";

import React, { useCallback, useMemo, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { UserRound, Settings, Shield, LogOut, ChevronDown, ChevronUp } from "lucide-react";

type TabKey = "information" | "settings" | "security";

const TABS: { key: TabKey; label: string; icon: ReactNode }[] = [
    {
        key: "information",
        label: "information",
        icon: <UserRound className="w-4 h-4" />,
    },
    {
        key: "settings",
        label: "settings",
        icon: <Settings className="w-4 h-4" />,
    },
    { key: "security", label: "security", icon: <Shield className="w-4 h-4" /> },
];

interface ProfileTabsProps {
    readonly currentTab: TabKey | null;
    readonly onTabChange: (tab: TabKey | null) => void;
    readonly isMobile?: boolean;
    readonly contentRenderer?: ReactNode;
}

export default function ProfileTabs({
    currentTab,
    onTabChange,
    isMobile = false,
    contentRenderer,
}: ProfileTabsProps) {
    const locale = useLocale();
    const t = useTranslations("Profile");

    const onSignOut = useCallback(
        async () => {
            try {
                // Clear session first
                const { signOut } = await import("next-auth/react");
                await signOut({ redirect: false });
                
                // Clear any stored data (but keep remember credentials if user wants to remember login)
                try {
                    // Don't remove auth.remember and auth.remember.credentials - let user keep their remembered username/email
                    localStorage.removeItem("continueAsGuest");
                    sessionStorage.removeItem("nextauth.callbackUrl");
                    sessionStorage.removeItem("__Secure-nextauth.callbackUrl");
                } catch {
                    // ignore storage errors
                }
                
                // Use replace instead of href to avoid history entry
                window.location.replace(`/${locale}/auth/signin`);
            } catch (error) {
                console.error("Logout error:", error);
                // Fallback: still redirect without history
                window.location.replace(`/${locale}/auth/signin`);
            }
        },
        [locale]
    );

    const handleTabClick = useCallback((key: TabKey) => {
        // Nếu click vào tab đang mở thì đóng nó
        if (currentTab === key && isMobile) {
            onTabChange(null);
            return;
        }
        onTabChange(key);
    }, [currentTab, onTabChange, isMobile]);

    // Mobile Accordion View
    if (isMobile) {
        return (
            <div className="space-y-0">
                {TABS.map(({ key, label, icon }) => {
                    const isOpen = currentTab === key;
                    
                    return (
                        <div key={key} className="border-b border-white/10 overflow-hidden">
                            <button
                                onClick={() => handleTabClick(key)}
                                className={`flex items-center justify-between w-full px-4 py-4 transition-all duration-300 ${
                                    isOpen 
                                        ? "bg-[#00E5FF]/10 text-[#00E5FF]" 
                                        : "bg-[#0A1628] text-gray-300 hover:bg-[#17202F]"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {icon}
                                    <span className="text-sm font-medium">{t(label)}</span>
                                </div>
                                {isOpen ? (
                                    <ChevronUp className="w-4 h-4 text-[#00E5FF] transition-transform duration-300" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-300" />
                                )}
                            </button>
                            
                            <div 
                                className={`bg-[#0A1628] border-t overflow-hidden transition-all duration-300 ease-in-out ${
                                    isOpen 
                                        ? "max-h-[2000px] opacity-100 border-[#00E5FF]/20" 
                                        : "max-h-0 opacity-0 border-transparent"
                                }`}
                            >
                                <div className={`px-4 transition-all duration-300 ${isOpen ? "py-6 opacity-100" : "py-0 opacity-0"}`}>
                                    {contentRenderer}
                                </div>
                            </div>
                        </div>
                    );
                })}

                <button
                    onClick={onSignOut}
                    className="flex items-center justify-between w-full px-4 py-4 bg-[#0A1628] text-gray-300 hover:text-red-400 hover:bg-[#17202F] transition-all duration-200 border-b border-white/10"
                >
                    <div className="flex items-center gap-3">
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">{t("signOut")}</span>
                    </div>
                </button>
            </div>
        );
    }

    // Desktop Sidebar View
    const tabButtons = useMemo(
        () =>
            TABS.map(({ key, label, icon }) => {
                const active = currentTab === key;
                const baseClasses =
                    "flex items-center gap-3 h-10 px-4 w-full rounded-xl border transition-all duration-200";
                const inactiveClasses =
                    "bg-[#17202F] border-white/10 text-gray-300 hover:text-[#00E5FF] hover:border-[#00E5FF]/50 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]";
                const activeClasses =
                    "text-[#00E5FF] border-[#00E5FF]/60 bg-[#00E5FF]/10 shadow-[0_0_20px_rgba(0,229,255,0.5)]";

                return (
                    <button
                        key={key}
                        onClick={() => onTabChange(key)}
                        className={`${baseClasses} ${active ? activeClasses : inactiveClasses} cursor-pointer`}
                    >
                        {icon}
                        <span className="text-sm font-medium">{t(label)}</span>
                    </button>
                );
            }),
        [currentTab, onTabChange, t]
    );

    return (
        <aside className="space-y-4 w-[200px]">
            {tabButtons}

            <button
                onClick={onSignOut}
                className="flex items-center gap-3 h-10 px-4 w-full rounded-xl border transition-all duration-200 bg-[#17202F] border-white/10 text-gray-300 hover:text-red-400 hover:border-red-400/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] cursor-pointer"
            >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">{t("signOut")}</span>
            </button>
        </aside>
    );
}
