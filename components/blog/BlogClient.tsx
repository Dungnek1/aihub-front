"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Grid, List, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchBlogCategories } from "@/store/slices/blogSlice";
import BlogCard from "./BlogCard";
import { Select } from "antd";
import { BlogPost } from "@/services/client/blog.client";
import { filterPosts } from "@/services/client/blog.client";
import "@/styles/blog-category-select.css";
import type { AppSession } from "@/types/session";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedList } from "@/components/ui/animated-list";

interface BlogClientProps {
  initialPosts: BlogPost[];
  session?: AppSession;
}

export default function BlogClient({ initialPosts, session }: BlogClientProps) {
  const t = useTranslations("Blog");
  const locale = useLocale();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { categories, categoriesLoading } = useSelector(
    (state: RootState) => state.blog
  );

  // Ensure initialPosts is always an array
  const safeInitialPosts = Array.isArray(initialPosts) ? initialPosts : [];

  const [posts, setPosts] = useState<BlogPost[]>(safeInitialPosts);
  const [search, setSearch] = useState<string>("");

  const [category, setCategory] = useState<string | null>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPosts, setTotalPosts] = useState<number>(safeInitialPosts.length);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const prevViewModeRef = useRef<"grid" | "list">(viewMode);

  // Track previous category to detect changes
  const prevCategoryRef = useRef<string | null>(category);
  const prevSearchRef = useRef<string>(search);

  useEffect(() => {
    setMounted(true);
    // Initialize refs with initial values
    prevCategoryRef.current = category;
    prevSearchRef.current = search;
  }, []);

  const postsPerPage = 9;

  useEffect(() => {
    if (categories.length === 0 && !categoriesLoading) {
      dispatch(fetchBlogCategories());
    }
  }, [dispatch, categories.length, categoriesLoading]);

  // Reset category if it's invalid after categories load
  useEffect(() => {
    if (!categoriesLoading && categories.length > 0 && category) {
      const categoryExists =
        category === "all" || categories.some((cat) => cat.slug === category);
      if (!categoryExists) {
        setCategory(null);
      }
    }
  }, [categories, categoriesLoading, category]);

  // Fetch filtered posts when filters change
  useEffect(() => {
    // Skip initial render if nothing has changed
    if (!mounted) return;

    const isCategoryChange = prevCategoryRef.current !== category;
    const isSearchChange = prevSearchRef.current !== search;

    // Skip if nothing has changed (only initial mount)
    if (!isCategoryChange && !isSearchChange) {
      return;
    }

    const fetchFiltered = async () => {
      setLoading(true);
      try {
        const filteredPosts = await filterPosts({
          title: search.trim() || undefined,
          category: category || undefined,
          skip: 0,
          take: 1000, // Fetch more posts for client-side pagination
        });

        // Ensure filteredPosts is always an array
        const safeFilteredPosts = Array.isArray(filteredPosts)
          ? filteredPosts
          : [];
        setPosts(safeFilteredPosts);
        setTotalPosts(safeFilteredPosts.length);
        setCurrentPage(1); // Reset to first page when filters change
      } catch (err) {
        console.error("❌ Error fetching posts:", err);
        setPosts([]);
        setTotalPosts(0);
      } finally {
        setLoading(false);
      }
    };

    // No delay for category change or when search is cleared (immediate reload)
    // Delay only when typing new search text to avoid too many requests
    const isSearchCleared =
      prevSearchRef.current &&
      prevSearchRef.current.trim() !== "" &&
      (!search || search.trim() === "");
    const delay = isCategoryChange || isSearchCleared ? 0 : 400;

    const timeout = setTimeout(() => {
      fetchFiltered();
      // Update refs after fetching
      prevCategoryRef.current = category;
      prevSearchRef.current = search;
    }, delay);

    return () => clearTimeout(timeout);
  }, [search, category, mounted]);

  // Calculate pagination
  // Ensure posts is always an array before using slice
  const safePosts = Array.isArray(posts) ? posts : [];
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = safePosts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    if (mode === viewMode) return; // Don't change if already in that mode
    setViewMode(mode);
  };

  // Create unique key for posts container to trigger fade animation
  const postsKey = `${viewMode}-${search}-${category}-${currentPage}`;

  return (
    <div id="blog-content" className="w-full">
      {/* Search + Filter Container - Hidden on mobile */}
      <div className="hidden sm:block bg-[#111623] rounded-md p-4 mb-8 transition-all duration-300">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-2/3">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111418] border border-gray-700 rounded-md pl-9 pr-4 py-2.5 h-[40px] text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!mounted ? (
              <div
                className="bg-[#111418] border border-cyan-500 rounded-sm px-4 h-[40px] text-gray-400 text-sm flex items-center"
                style={{
                  width: "100%",
                  minWidth: "192px",
                }}
              >
                {t("chooseCategory")}
              </div>
            ) : (
              <Select
                placeholder={t("chooseCategory")}
                value={category || undefined}
                onChange={(value) => {
                  // Immediately update category to trigger reload
                  const newCategory = value || null;
                  setCategory(newCategory);
                  // Scroll to top when category changes
                  if (window.scrollY > 0) {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                allowClear
                loading={categoriesLoading}
                className="blog-category-select blog-category-select-no-arrow"
                classNames={{
                  popup: {
                    root: "blog-category-select-dropdown",
                  },
                }}
                style={{
                  width: "100%",
                  minWidth: "192px",
                  height: "40px",
                }}
                popupMatchSelectWidth={false}
                options={
                  categoriesLoading
                    ? []
                    : [
                        {
                          label: t("allCategories"),
                          value: "all",
                        },
                        ...categories.map((cat) => ({
                          label: cat.name,
                          value: cat.slug,
                        })),
                      ]
                }
              />
            )}

            <div className="bg-[#111418] rounded-md p-1 flex items-center gap-1 flex-shrink-0 transition-all duration-300 relative">
              {/* Active indicator - slides left/right */}
              <div
                className={`absolute top-1 bottom-1 rounded-sm bg-gradient-to-br from-cyan-500 to-cyan-600 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform ${
                  viewMode === "grid"
                    ? "left-1 w-[40px]"
                    : "left-[48px] w-[40px]"
                }`}
              />

              {/* Grid Button */}
              <button
                onClick={() => handleViewModeChange("grid")}
                className={`relative z-10 rounded-sm p-2.5 h-[40px] w-[40px] flex items-center justify-center transition-all duration-500 ease-in-out cursor-pointer ${
                  viewMode === "grid"
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* 3x3 Grid of dots */}
                  <circle
                    cx="5"
                    cy="5"
                    r="1.5"
                    fill={viewMode === "grid" ? "#0B5A5C" : "#9CA3AF"}
                  />
                  <circle
                    cx="10"
                    cy="5"
                    r="1.5"
                    fill={viewMode === "grid" ? "#0B5A5C" : "#9CA3AF"}
                  />
                  <circle
                    cx="15"
                    cy="5"
                    r="1.5"
                    fill={viewMode === "grid" ? "#0B5A5C" : "#9CA3AF"}
                  />
                  <circle
                    cx="5"
                    cy="10"
                    r="1.5"
                    fill={viewMode === "grid" ? "#0B5A5C" : "#9CA3AF"}
                  />
                  <circle
                    cx="10"
                    cy="10"
                    r="1.5"
                    fill={viewMode === "grid" ? "#0B5A5C" : "#9CA3AF"}
                  />
                  <circle
                    cx="15"
                    cy="10"
                    r="1.5"
                    fill={viewMode === "grid" ? "#0B5A5C" : "#9CA3AF"}
                  />
                  <circle
                    cx="5"
                    cy="15"
                    r="1.5"
                    fill={viewMode === "grid" ? "#0B5A5C" : "#9CA3AF"}
                  />
                  <circle
                    cx="10"
                    cy="15"
                    r="1.5"
                    fill={viewMode === "grid" ? "#0B5A5C" : "#9CA3AF"}
                  />
                  <circle
                    cx="15"
                    cy="15"
                    r="1.5"
                    fill={viewMode === "grid" ? "#0B5A5C" : "#9CA3AF"}
                  />
                </svg>
              </button>

              {/* Hamburger Menu Button */}
              <button
                onClick={() => handleViewModeChange("list")}
                className={`relative z-10 rounded-sm p-2.5 h-[40px] w-[40px] flex items-center justify-center transition-all duration-500 ease-in-out cursor-pointer ${
                  viewMode === "list"
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* 3 horizontal lines */}
                  <line
                    x1="4"
                    y1="6"
                    x2="16"
                    y2="6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="4"
                    y1="10"
                    x2="16"
                    y2="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="4"
                    y1="14"
                    x2="16"
                    y2="14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div>
        {/* Pagination info - Hidden on mobile */}
        <p className="hidden sm:block text-gray-400 text-sm mb-3">
          {loading
            ? "Loading..."
            : `${t("showing")} ${startIndex + 1}-${Math.min(
                endIndex,
                totalPosts
              )} ${t("of")} ${totalPosts} ${t("posts").toLowerCase()}`}
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">{t("loading") || "Loading..."}</div>
          </div>
        ) : currentPosts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400 text-center">
              <p className="text-lg mb-2">{t("noPostsFound")}</p>
              <p className="text-sm">
                {search || category
                  ? locale === "vi"
                    ? "Thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn"
                    : "Try adjusting your search or filters"
                  : locale === "vi"
                  ? "Hiện chưa có bài viết nào"
                  : "No posts available"}
              </p>
            </div>
          </div>
        ) : viewMode === "list" ? (
          <AnimatedList
            className="grid gap-6 sm:gap-6 md:gap-8 grid-cols-1"
            delay={350}
          >
            {currentPosts.map((post, index) => (
              <div key={post.id}>
                <BlogCard
                  post={post}
                  viewMode={viewMode}
                  locale={locale}
                  priority={index < 3}
                  texts={{
                    unknownAuthor: t("unknownAuthor"),
                    views: t("views"),
                    likes: t("likes"),
                    comments: t("comments"),
                    shares: t("shares"),
                    readMore: t("readMore"),
                  }}
                />
              </div>
            ))}
          </AnimatedList>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={postsKey}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: {
                  duration: 0.2,
                  ease: "easeInOut",
                },
                layout: {
                  duration: 0.4,
                  ease: [0.43, 0.13, 0.23, 0.96] as [
                    number,
                    number,
                    number,
                    number
                  ],
                },
              }}
              className="grid gap-6 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch"
            >
              {currentPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    opacity: {
                      duration: 0.3,
                      ease: "easeOut",
                      delay: index * 0.05,
                    },
                    layout: {
                      duration: 0.4,
                      ease: [0.43, 0.13, 0.23, 0.96] as [
                        number,
                        number,
                        number,
                        number
                      ],
                    },
                  }}
                >
                  <BlogCard
                    post={post}
                    viewMode={viewMode}
                    locale={locale}
                    priority={index < 3}
                    texts={{
                      unknownAuthor: t("unknownAuthor"),
                      views: t("views"),
                      likes: t("likes"),
                      comments: t("comments"),
                      shares: t("shares"),
                      readMore: t("readMore"),
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="text-sm text-gray-400">
              {t("showing")}{" "}
              <span className="text-white font-medium">{startIndex + 1}</span>-
              <span className="text-white font-medium">
                {Math.min(endIndex, totalPosts)}
              </span>{" "}
              {t("of")}{" "}
              <span className="text-white font-medium">{totalPosts}</span>{" "}
              {t("posts").toLowerCase()}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentPage === 1
                    ? "bg-[#1E293B]/50 text-gray-500 cursor-not-allowed border border-white/5"
                    : "bg-[#1E293B] text-cyan-400 hover:bg-[#243B55] hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/50 hover:shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                }`}
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
                <span>{t("previous")}</span>
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and pages around current
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    );
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there's a gap
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <div key={page} className="flex items-center">
                        {showEllipsis && (
                          <span className="px-2 text-gray-500 text-sm">
                            ...
                          </span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`min-w-[40px] h-10 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            currentPage === page
                              ? "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-[0_4px_12px_rgba(6,182,212,0.4)] border border-cyan-400/50 scale-105"
                              : "bg-[#1E293B] text-gray-300 hover:bg-[#243B55] hover:text-white border border-white/10 hover:border-cyan-500/30"
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentPage === totalPages
                    ? "bg-[#1E293B]/50 text-gray-500 cursor-not-allowed border border-white/5"
                    : "bg-[#1E293B] text-cyan-400 hover:bg-[#243B55] hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/50 hover:shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                }`}
              >
                <span>{t("next")}</span>
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
