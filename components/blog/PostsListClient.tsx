"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  FilePen,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import PostCard from "./PostCard";
import type { BlogPost, BlogCategory } from "@/services/client/blog.client";
import { getCoverImageUrl } from "@/utils/image.utils";
import { AnimatePresence, motion } from "framer-motion";

const tabs = [
  { key: "allPosts", icon: FileText },
  { key: "drafts", icon: FilePen },
  { key: "pending", icon: Clock },
  { key: "published", icon: CheckCircle },
  { key: "rejected", icon: XCircle },
] as const;

type Status = (typeof tabs)[number]["key"];

const POSTS_PER_PAGE = 6;

interface PostsListClientProps {
  initialPosts: BlogPost[];
}

export default function PostsListClient({
  initialPosts,
}: PostsListClientProps) {
  const t = useTranslations("Blog");
  const locale = useLocale();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Status>("allPosts");
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);

  // Convert API posts to component format
  const convertPosts = (apiPosts: BlogPost[]) => {
    return apiPosts.map((post) => {
      // Map API status to component expected status
      const statusMap: { [key: string]: string } = {
        DRAFT: "drafts",
        PENDING_REVIEW: "pending",
        PUBLISHED: "published",
        REJECTED: "rejected",
        REMOVED: "removed",
      };

      const thumbnailUrl = getCoverImageUrl(post.coverImageId);
      // Ensure category is a BlogCategory object
      const defaultCategory: BlogCategory = {
        id: "",
        name: "Uncategorized",
        slug: "uncategorized",
      };
      const category: BlogCategory =
        typeof post.category === "object" && post.category !== null
          ? post.category
          : defaultCategory;

      return {
        ...post,
        id: post.id,
        title: post.title || "Untitled",
        status: statusMap[post.status] || post.status.toLowerCase(),
        category,
        updatedAt:
          post.content?.updatedAt || post.updatedAt || new Date().toISOString(),
        thumbnail: thumbnailUrl,
        tags: post.content?.tags || [],
        coverImageId: post.coverImageId,
        content: post.content,
      };
    });
  };

  const convertedPosts = convertPosts(posts);

  const filteredPosts =
    activeTab === "allPosts"
      ? convertedPosts
      : convertedPosts.filter((p) => p.status === activeTab);

  // Calculate pagination
  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  // Reset to page 1 when tab changes
  const handleTabChange = (tab: Status) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

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

  const handleDeletePost = (postId: string) => {
    // Remove post from list
    setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
    
    // Reset to page 1 if current page becomes empty
    const remainingPosts = posts.filter((p) => p.id !== postId);
    const filteredRemaining = activeTab === "allPosts"
      ? remainingPosts
      : remainingPosts.filter((p) => {
          const statusMap: { [key: string]: string } = {
            DRAFT: "drafts",
            PENDING_REVIEW: "pending",
            PUBLISHED: "published",
            REJECTED: "rejected",
            REMOVED: "removed",
          };
          const status = statusMap[p.status] || p.status.toLowerCase();
          return status === activeTab;
        });
    
    const newTotalPages = Math.ceil(filteredRemaining.length / POSTS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0) {
      setCurrentPage(1);
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 md:gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(({ key, icon: Icon }) => {
          const count =
            key === "allPosts"
              ? convertedPosts.length
              : convertedPosts.filter((p) => p.status === key).length;

          return (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`flex items-center gap-2 md:gap-3 rounded-lg text-sm md:text-base font-medium transition-all duration-300 cursor-pointer flex-shrink-0 ${
                activeTab === key
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 px-4 md:px-5 py-2.5 md:py-3"
                  : "bg-gray-800/50 text-gray-400 hover:text-gray-300 border border-gray-700 hover:border-gray-600 px-3 md:px-4 py-2.5 md:py-3"
              }`}
            >
              <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />

              {/* Count always visible next to icon */}
              <span className="text-xs md:text-sm font-medium flex-shrink-0">
                ({count})
              </span>

              {/* Text always visible on desktop, only shows when active on mobile/tablet */}
              <span
                className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                  activeTab === key
                    ? "max-w-[200px] md:max-w-[300px] opacity-100"
                    : "max-w-0 opacity-0 lg:max-w-[300px] lg:opacity-100"
                }`}
              >
                {t(key)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Posts list */}
      <AnimatePresence mode="wait">
        {currentPosts.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-[#111827] rounded-2xl border border-gray-700 flex flex-col items-center justify-center py-20 text-gray-400"
          >
            <div className="text-cyan-400 text-5xl mb-3">📄</div>
            <p className="font-medium text-lg">{t("noPostsFound")}</p>
            <p className="text-gray-500 text-sm">{t("noPostsInSection")}</p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="space-y-4">
              {currentPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.05,
                    ease: "easeOut" 
                  }}
                >
                  <PostCard post={post} onDelete={handleDeletePost} />
                </motion.div>
              ))}
            </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10">
              <div className="text-sm text-gray-400">
                {t("showing")} <span className="text-white font-medium">{startIndex + 1}</span>-
                <span className="text-white font-medium">{Math.min(endIndex, totalPosts)}</span>{" "}
                {t("of")} <span className="text-white font-medium">{totalPosts}</span> {t("posts").toLowerCase()}
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
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      );
                    })
                    .map((page, index, array) => {
                      const prevPage = array[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;

                      return (
                        <div key={page} className="flex items-center">
                          {showEllipsis && (
                            <span className="px-2 text-gray-500 text-sm">...</span>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
