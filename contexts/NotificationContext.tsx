"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUnreadNotifications, markAllNotificationsRead } from "@/services";
import { processNotificationHtml, logger } from "@/utils";

interface NotificationEvent {
    id: string;
    type: string;
    actorId: string;
    objectType: string;
    objectId: string;
}

interface Notification {
    id: string;
    type: string;
    html: string;
    createdAt: string;
    isRead: boolean;
    isSeen: boolean;
    event?: NotificationEvent;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loadingNotifications: boolean;
    onMarkAllRead: () => Promise<void>;
    refetch: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoading: authLoading } = useAuth();
    const [apiUnread, setApiUnread] = useState<Notification[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    const fetchUnreadNotifications = async () => {
        // Don't fetch if auth is loading or user is not authenticated
        if (authLoading || !user?.userId) {
            setApiUnread([]);
            return;
        }

        try {
            setLoadingNotifications(true);
            const res = await getUnreadNotifications();
            const notificationsArray = Array.isArray(res) ? res : [];
            setApiUnread(notificationsArray);

            // Debug logging
            logger.log("📥 Raw API Notifications:", {
                module: "NotificationContext",
                function: "fetchUnreadNotifications",
                total: notificationsArray.length,
                notifications: notificationsArray.map((n) => ({
                    id: n.id,
                    type: n.type,
                    isRead: n.isRead,
                    isSeen: n.isSeen,
                    html: n.html?.substring(0, 100) + "...",
                })),
            });
        } catch (error: any) {
            // If error is marked as silent (grace period), don't log it
            if (!error?._silent) {
                logger.error(
                    "Failed to fetch notifications:",
                    { module: "NotificationContext", function: "fetchUnreadNotifications" },
                    error
                );
            }
            setApiUnread([]);
        } finally {
            setLoadingNotifications(false);
        }
    };

    // ✅ Memoize userId to stabilize dependency
    const userId = useMemo(
        () => user?.userId || null,
        [user?.userId]
    );

    useEffect(() => {
        // Only fetch notifications if user is authenticated and has userId
        if (!authLoading && userId) {
            // Add a delay to ensure JWT token is saved to cookies after login
            // This prevents race condition where notifications are called before token is ready
            const timeoutId = setTimeout(() => {
                fetchUnreadNotifications();
            }, 2000); // 2 seconds delay to ensure token is saved and accessible

            return () => clearTimeout(timeoutId);
        } else {
            // Clear notifications if user is not authenticated
            setApiUnread([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, authLoading]);

    const notifications = useMemo(() =>
        apiUnread.length > 0
            ? apiUnread
                .filter((n) => !n.isRead) // Only show unread notifications
                .map((n) => ({
                    id: n.id,
                    type: n.type,
                    html: n.html ? processNotificationHtml(n.html) : n.html,
                    createdAt: n.createdAt,
                    isRead: n.isRead,
                    isSeen: n.isSeen,
                    event: n.event,
                }))
            : [],
        [apiUnread]);

    const unreadCount = useMemo(() => apiUnread.filter((n) => !n.isRead).length, [apiUnread]);

    const onMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setApiUnread([]);
        } catch (error) {
            logger.error(
                "Failed to mark all notifications as read:",
                { module: "NotificationContext", function: "onMarkAllRead" },
                error
            );
        }
    };

    // Debug logging
    useEffect(() => {
        if (apiUnread.length > 0) {
            logger.log("🔔 Badge Count:", {
                module: "NotificationContext",
                function: "useEffect[unreadCount]",
                unreadCount,
                totalNotifications: apiUnread.length,
                displayedNotifications: notifications.length,
            });
        }
    }, [unreadCount, apiUnread.length, notifications.length]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loadingNotifications,
                onMarkAllRead,
                refetch: fetchUnreadNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotificationContext() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotificationContext must be used within a NotificationProvider");
    }
    return context;
}
