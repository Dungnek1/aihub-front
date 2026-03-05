"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getCategories } from "@/services/client/blog.client";

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

export type BlogContextValue = {
  // Categories
  categories: BlogCategory[];
  categoriesLoading: boolean;
  reloadCategories: () => Promise<void>;
};

const BlogContext = createContext<BlogContextValue | null>(null);

const STORAGE_KEY = "aihub:blog:state";

export default function BlogProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<BlogCategory[]>(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.categories || [];
      }
      return [];
    } catch {
      return [];
    }
  });
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const res = await getCategories();
      const data = Array.isArray(res) ? res : [];
      setCategories(data as BlogCategory[]);
      // Save to localStorage
      try {
        const state = { categories: data };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        // ignore storage errors
      }
    } catch (error) {
      console.error("Failed to load blog categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    // If no cached categories, fetch from API once
    if (categories.length === 0) {
      loadCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: BlogContextValue = {
    categories,
    categoriesLoading,
    reloadCategories: loadCategories,
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
}

export function useBlogContext() {
  const ctx = useContext(BlogContext);
  if (!ctx) throw new Error("useBlogContext must be used within BlogProvider");
  return ctx;
}
