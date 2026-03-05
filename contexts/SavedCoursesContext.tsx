"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserSavedCourses } from "@/services/client/courses.client";
import { toggleSaveCourse } from "@/services/client/courses-actions.client";

interface SavedCoursesContextValue {
  savedCourseIds: Set<string>;
  isCourseSaved: (courseId: string) => boolean;
  toggleSave: (courseId: string) => Promise<boolean | undefined>;
  refreshSavedCourses: () => Promise<void>;
  isLoading: boolean;
}

const SavedCoursesContext = createContext<SavedCoursesContextValue | undefined>(undefined);

export function SavedCoursesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [savedCourseIds, setSavedCourseIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // ✅ Memoize userId to stabilize dependency
  const userId = useMemo(
    () => user?.userId || null,
    [user?.userId]
  );

  // Fetch saved courses khi user đăng nhập
  const fetchSavedCourses = useCallback(async () => {
    if (!userId || isLoading || hasFetched) return;

    setIsLoading(true);
    try {
      const savedCourses = await getUserSavedCourses(0, 1000); // Lấy tất cả saved courses
      const ids = new Set(savedCourses.map((course) => course.id));
      setSavedCourseIds(ids);
      setHasFetched(true);
    } catch (error) {
      // Silent fail - không log error nếu user chưa đăng nhập hoặc 401
      if (process.env.NODE_ENV === "development") {
        console.debug("[SavedCoursesContext] Failed to fetch saved courses:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, isLoading, hasFetched]);

  // Fetch saved courses khi session thay đổi
  useEffect(() => {
    if (userId && !hasFetched) {
      fetchSavedCourses();
    } else if (!userId) {
      // Reset khi logout
      setSavedCourseIds(new Set());
      setHasFetched(false);
    }
  }, [userId, hasFetched, fetchSavedCourses]);

  // Check if course is saved
  const isCourseSaved = useCallback(
    (courseId: string) => {
      return savedCourseIds.has(courseId);
    },
    [savedCourseIds]
  );

  // Toggle save course
  const toggleSave = useCallback(
    async (courseId: string): Promise<boolean | undefined> => {
      if (!userId) return false;

      try {
        const response = await toggleSaveCourse(courseId);
        if (!response) {
          // If response is null, it might be a 400 error (silent fail)
          // Return undefined to indicate API error (not success/failure)
          return undefined as any;
        }

        // Update state based on API response
        const isNowSaved = response.isSaved !== false;

        setSavedCourseIds((prev) => {
          const next = new Set(prev);
          if (isNowSaved) {
            next.add(courseId);
          } else {
            next.delete(courseId);
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
          errorMessage.includes("Course not found") ||
          errorMessage.includes("Bad Request")
        ) {
          // Silent fail - return undefined to indicate API error
          return undefined as any;
        }
        
        if (process.env.NODE_ENV === "development") {
          console.error("[SavedCoursesContext] Toggle save error:", error);
        }
        return false;
      }
    },
    [userId]
  );

  // Refresh saved courses - force fetch even if hasFetched is true
  const refreshSavedCourses = useCallback(async () => {
    setHasFetched(false);
    setIsLoading(false); // Reset loading state
    // Force fetch by temporarily bypassing hasFetched check
    try {
      const savedCourses = await getUserSavedCourses(0, 1000);
      const ids = new Set(savedCourses.map((course) => course.id));
      setSavedCourseIds(ids);
      setHasFetched(true);
    } catch (error) {
      // Silent fail - không log error nếu user chưa đăng nhập hoặc 401
      if (process.env.NODE_ENV === "development") {
        console.debug("[SavedCoursesContext] Failed to refresh saved courses:", error);
      }
    }
  }, []);

  return (
    <SavedCoursesContext.Provider
      value={{
        savedCourseIds,
        isCourseSaved,
        toggleSave,
        refreshSavedCourses,
        isLoading,
      }}
    >
      {children}
    </SavedCoursesContext.Provider>
  );
}

export function useSavedCourses() {
  const context = useContext(SavedCoursesContext);
  if (context === undefined) {
    throw new Error("useSavedCourses must be used within a SavedCoursesProvider");
  }
  return context;
}

