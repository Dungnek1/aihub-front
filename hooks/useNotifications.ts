"use client";

import { useNotificationContext } from "@/contexts/NotificationContext";

export function useNotifications() {
  const context = useNotificationContext();
  return context;
}
