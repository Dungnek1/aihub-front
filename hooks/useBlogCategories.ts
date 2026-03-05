"use client";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { fetchBlogCategories } from "@/store/slices/blogSlice";
import { useEffect } from "react";

export function useBlogCategories() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, categoriesLoading, categoriesError } = useSelector(
    (state: RootState) => state.blog
  );

  useEffect(() => {
    // Fetch categories if not already loaded
    if (categories.length === 0 && !categoriesLoading) {
      dispatch(fetchBlogCategories());
    }
  }, [categories.length, categoriesLoading, dispatch]);

  return {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  };
}

export type { AppDispatch, RootState } from "@/store/store";
