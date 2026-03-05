"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserSavedMarketingTools } from "@/services/client/tools.client";
import { toggleSaveMarketingTool } from "@/services/client/marketing-tools-actions.client";

interface SavedMarketingToolsContextValue {
  savedMarketingToolIds: Set<string>;
  isMarketingToolSaved: (toolId: string) => boolean;
  toggleSave: (toolId: string) => Promise<boolean | undefined>;
  refreshSavedMarketingTools: () => Promise<void>;
  isLoading: boolean;
}

const SavedMarketingToolsContext = createContext<SavedMarketingToolsContextValue | undefined>(undefined);

export function SavedMarketingToolsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [savedMarketingToolIds, setSavedMarketingToolIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // ✅ Memoize userId to stabilize dependency
  const userId = useMemo(
    () => user?.userId || null,
    [user?.userId]
  );

  // Fetch saved marketing tools khi user đăng nhập
  const fetchSavedMarketingTools = useCallback(async () => {
    if (!userId || isLoading || hasFetched) return;

    setIsLoading(true);
    try {
      const savedTools = await getUserSavedMarketingTools(0, 1000); // Lấy tất cả saved marketing tools
      const ids = new Set(savedTools.map((tool) => tool.id));
      setSavedMarketingToolIds(ids);
      setHasFetched(true);
    } catch (error) {
      // Silent fail - không log error nếu user chưa đăng nhập hoặc 401
      if (process.env.NODE_ENV === "development") {
        console.debug("[SavedMarketingToolsContext] Failed to fetch saved marketing tools:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, isLoading, hasFetched]);

  // Fetch saved marketing tools khi session thay đổi
  useEffect(() => {
    if (userId && !hasFetched) {
      fetchSavedMarketingTools();
    } else if (!userId) {
      // Reset khi logout
      setSavedMarketingToolIds(new Set());
      setHasFetched(false);
    }
  }, [userId, hasFetched, fetchSavedMarketingTools]);

  // Check if marketing tool is saved
  const isMarketingToolSaved = useCallback(
    (toolId: string) => {
      return savedMarketingToolIds.has(toolId);
    },
    [savedMarketingToolIds]
  );

  // Toggle save marketing tool
  const toggleSave = useCallback(
    async (toolId: string): Promise<boolean | undefined> => {
      if (!userId) return false;

      try {
        const response = await toggleSaveMarketingTool(toolId);
        if (!response) {
          // If response is null, it might be a 400 error (silent fail)
          // Return undefined to indicate API error (not success/failure)
          return undefined as any;
        }

        // Update state based on API response
        const isNowSaved = response.isSaved !== false;

        setSavedMarketingToolIds((prev) => {
          const next = new Set(prev);
          if (isNowSaved) {
            next.add(toolId);
          } else {
            next.delete(toolId);
          }
          return next;
        });

        return isNowSaved;
      } catch (error: any) {
        const status = error?.response?.status || error?.status;
        const errorMessage = error?.message || "";
        
        // Silent fail for 400, 401, 403, 404 - return undefined
        if (
          status === 400 ||
          status === 401 ||
          status === 403 ||
          status === 404 ||
          errorMessage.includes("not found") ||
          errorMessage.includes("Tool not found") ||
          errorMessage.includes("Bad Request")
        ) {
          // Silent fail - return undefined to indicate API error
          return undefined as any;
        }
        
        if (process.env.NODE_ENV === "development") {
          console.error("[SavedMarketingToolsContext] Toggle save error:", error);
        }
        return false;
      }
    },
    [userId]
  );

  // Refresh saved marketing tools - force fetch even if hasFetched is true
  const refreshSavedMarketingTools = useCallback(async () => {
    setHasFetched(false);
    setIsLoading(false); // Reset loading state
    // Force fetch by temporarily bypassing hasFetched check
    try {
      const savedTools = await getUserSavedMarketingTools(0, 1000);
      const ids = new Set(savedTools.map((tool) => tool.id));
      setSavedMarketingToolIds(ids);
      setHasFetched(true);
    } catch (error) {
      // Silent fail - không log error nếu user chưa đăng nhập hoặc 401
      if (process.env.NODE_ENV === "development") {
        console.debug("[SavedMarketingToolsContext] Failed to refresh saved marketing tools:", error);
      }
    }
  }, []);

  return (
    <SavedMarketingToolsContext.Provider
      value={{
        savedMarketingToolIds,
        isMarketingToolSaved,
        toggleSave,
        refreshSavedMarketingTools,
        isLoading,
      }}
    >
      {children}
    </SavedMarketingToolsContext.Provider>
  );
}

export function useSavedMarketingTools() {
  const context = useContext(SavedMarketingToolsContext);
  if (context === undefined) {
    throw new Error("useSavedMarketingTools must be used within a SavedMarketingToolsProvider");
  }
  return context;
}

