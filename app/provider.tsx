"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import ReduxProvider from "@/store/ReduxProvider";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { SavedToolsProvider } from "@/contexts/SavedToolsContext";
import { SavedCoursesProvider } from "@/contexts/SavedCoursesContext";
import { SavedMarketingToolsProvider } from "@/contexts/SavedMarketingToolsContext";
import { AuthProvider } from "@/contexts/AuthContext";

export function Providers({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <ReduxProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <ToastProvider>
                    <AuthProvider>
                        <NavigationProvider>
                            <SavedToolsProvider>
                                <SavedCoursesProvider>
                                    <SavedMarketingToolsProvider>
                                        {children}
                                    </SavedMarketingToolsProvider>
                                </SavedCoursesProvider>
                            </SavedToolsProvider>
                        </NavigationProvider>
                    </AuthProvider>
                </ToastProvider>
            </ThemeProvider>
        </ReduxProvider>
    );
}