"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserSavedTools } from "@/services/client/tools.client";
import { toggleSaveTool } from "@/services/client/tools-actions.client";

interface SavedToolsContextValue {
  savedToolIds: Set<string>;
  isToolSaved: (toolId: string) => boolean;
  toggleSave: (toolId: string) => Promise<boolean>;
  refreshSavedTools: () => Promise<void>;
  isLoading: boolean;
}

const SavedToolsContext = createContext<SavedToolsContextValue | undefined>(undefined);

export function SavedToolsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [savedToolIds, setSavedToolIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // ✅ Memoize userId to stabilize dependency
  const userId = useMemo(
    () => user?.userId || null,
    [user?.userId]
  );

  // Fetch saved tools khi user đăng nhập
  const fetchSavedTools = useCallback(async () => {
    if (!userId || isLoading || hasFetched) return;

    setIsLoading(true);
    try {
      const savedTools = await getUserSavedTools(0, 1000); // Lấy tất cả saved tools
      const ids = new Set(savedTools.map((tool) => tool.id));
      setSavedToolIds(ids);
      setHasFetched(true);
    } catch (error) {
      // Silent fail - không log error nếu user chưa đăng nhập hoặc 401
      if (process.env.NODE_ENV === "development") {
        console.debug("[SavedToolsContext] Failed to fetch saved tools:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, isLoading, hasFetched]);

  // Fetch saved tools khi session thay đổi
  useEffect(() => {
    if (userId && !hasFetched) {
      fetchSavedTools();
    } else if (!userId) {
      // Reset khi logout
      setSavedToolIds(new Set());
      setHasFetched(false);
    }
  }, [userId, hasFetched, fetchSavedTools]);

  // Check if tool is saved
  const isToolSaved = useCallback(
    (toolId: string) => {
      return savedToolIds.has(toolId);
    },
    [savedToolIds]
  );

  // Toggle save tool
  const toggleSave = useCallback(
    async (toolId: string): Promise<boolean> => {
      if (!userId) return false;

      try {
        const response = await toggleSaveTool(toolId);
        if (!response) return false;

        // Update state based on API response
        const isNowSaved =
          response.action === "saved" ||
          (response.action === undefined && response.tool !== undefined);

        setSavedToolIds((prev) => {
          const next = new Set(prev);
          if (isNowSaved) {
            next.add(toolId);
          } else {
            next.delete(toolId);
          }
          return next;
        });

        return isNowSaved;
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[SavedToolsContext] Toggle save error:", error);
        }
        return false;
      }
    },
    [userId]
  );

  // Refresh saved tools
  const refreshSavedTools = useCallback(async () => {
    setHasFetched(false);
    await fetchSavedTools();
  }, [fetchSavedTools]);

  return (
    <SavedToolsContext.Provider
      value={{
        savedToolIds,
        isToolSaved,
        toggleSave,
        refreshSavedTools,
        isLoading,
      }}
    >
      {children}
    </SavedToolsContext.Provider>
  );
}

export function useSavedTools() {
  const context = useContext(SavedToolsContext);
  if (context === undefined) {
    throw new Error("useSavedTools must be used within a SavedToolsProvider");
  }
  return context;
}

