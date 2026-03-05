import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getCategories } from "@/services/client/blog.client";

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface BlogState {
  categories: BlogCategory[];
  categoriesLoading: boolean;
  categoriesError: string | null;
}

const initialState: BlogState = {
  categories: [],
  categoriesLoading: false,
  categoriesError: null,
};

/**
 * Async thunk to fetch blog categories
 */
export const fetchBlogCategories = createAsyncThunk(
  "blog/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCategories();
      return Array.isArray(response) ? response : [];
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch categories"
      );
    }
  }
);

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    setCategoriesFromCache: (state, action: PayloadAction<BlogCategory[]>) => {
      state.categories = action.payload;
    },
    clearCategories: (state) => {
      state.categories = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchBlogCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.categoriesLoading = false;
        state.categoriesError = null;
      })
      .addCase(fetchBlogCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload as string;
      });
  },
});

export const { setCategoriesFromCache, clearCategories } = blogSlice.actions;
export default blogSlice.reducer;
