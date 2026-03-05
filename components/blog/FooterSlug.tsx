"use client";

import { Send } from "lucide-react";
import BlogCard from "./BlogCard";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  filterBlogPosts,
  getBlogComments,
  createBlogComment,
} from "@/services/client/blog-actions.client";
import type { BlogPost, BlogComment } from "@/services/client/blog.client";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { formatTimeAgo } from "@/utils/formatTime";
import { useTranslations } from "next-intl";
import Avatar from "@/components/ui/Avatar";

// Format time ago helper function

const FooterSlug = ({
  category,
  authorId,
  refId,
  title,
  tags,
}: {
  category?: string;
  authorId?: string;
  refId?: string;
  title?: string;
  tags?: string;
}) => {
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingCreateComment, setLoadingCreateComment] = useState(false);

  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Blog");

  // Scroll to comments section or specific comment if hash is present in URL
  useEffect(() => {
    const hash = window.location.hash;
    
    if (hash === '#comments-section') {
      const commentsSection = document.getElementById('comments-section');
      if (commentsSection) {
        setTimeout(() => {
          commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Focus vào textarea sau khi scroll xong
          setTimeout(() => {
            const textarea = document.getElementById('comment-textarea') as HTMLTextAreaElement;
            if (textarea) {
              textarea.focus();
            }
          }, 500);
        }, 100);
      }
    } else if (hash.startsWith('#comment-')) {
      // Extract comment ID from hash (e.g., #comment-123 -> 123)
      const commentId = hash.replace('#comment-', '');
      
      // Wait for comments to load, then scroll to the specific comment
      const scrollToComment = () => {
        const commentElement = document.getElementById(`comment-${commentId}`);
        if (commentElement) {
          commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight the comment briefly
          commentElement.style.transition = "background-color 0.3s";
          commentElement.style.backgroundColor = "rgba(6, 182, 212, 0.3)";
          setTimeout(() => {
            commentElement.style.backgroundColor = "";
          }, 2000);
          return true;
        }
        return false;
      };

      // Try immediately
      if (scrollToComment()) {
        return;
      }

      // If comment not found, wait a bit and try again (comments might still be loading)
      const timeoutId = setTimeout(() => {
        if (!scrollToComment()) {
          // If still not found, scroll to comments section as fallback
          const commentsSection = document.getElementById('comments-section');
          if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [comments]); // Re-run when comments are loaded

  // Fetch related posts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const result = await filterBlogPosts({
          category,
          userId: authorId,
          title: title,
          tagName: tags || undefined,
          take: 3,
        });

        setPosts(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    // previously we only triggered when `category` or `authorId` changed.
    // include `title` and `tags` so filtering by those values also fetches posts.
    if (category || authorId || title || tags) {
      fetchPosts();
    }
  }, [category, authorId, title, tags]);

  // Fetch comments - only if user is logged in or refId exists
  useEffect(() => {
    const fetchComments = async () => {
      if (!refId) return;

      // Only fetch comments if logged in
      if (!user?.userId) {
        setComments([]);
        return;
      }

      setLoadingComments(true);
      try {
        const result = await getBlogComments(
          refId,
          0, // pageNo
          5 // pageSize
        );
        setComments(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Error fetching comments:", error);
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [refId, user?.userId]);

  // Handle post comment
  const handlePostComment = async () => {
    if (!content.trim() || !refId) {
      toast.error(t("pleaseEnterComment"));
      return;
    }

    if (!user?.userId) {
      toast.error("Bạn phải đăng nhập để bình luận");
      setTimeout(() => {
        router.push(`/${locale}/auth/signin`);
      }, 0);
      return;
    }

    setLoadingCreateComment(true);
    try {
      const newComment = await createBlogComment({
        refId,
        bodyHtml: content,
        userId: user.userId,
      });

      if (newComment) {
        setComments([newComment, ...comments]);
        setContent("");
        toast.success(t("commentPostedSuccess"));
        router.refresh();
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error(t("commentPostFailed"));
    } finally {
      setLoadingCreateComment(false);
    }
  };

  return (
    <div className="max-w-6xl xl:max-w-[1248px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Comment Section */}
      <div
        id="comments-section"
        style={{ background: "rgba(30, 41, 59, 0.30)" }}
        className="p-6 rounded-xl mt-[1px] relative"
      >
        <h2 className="text-[#D1D5DC] mb-3">{t("comment")}</h2>
        <textarea
          id="comment-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (user?.userId && content.trim()) {
                handlePostComment();
              } else if (!user?.userId) {
                setTimeout(() => {
                  router.push(`/${locale}/auth/signin`);
                }, 0);
              }
            }
          }}
          placeholder={t("shareYourThoughts")}
          className="w-full p-3 rounded-lg bg-slate-800 text-white placeholder-gray-400 border border-slate-700 focus:border-cyan-500 focus:outline-none resize-none"
          rows={4}
        />
        <div className="flex justify-end mt-6">
          <button
            onClick={() => {
              if (!user?.userId) {
                setTimeout(() => {
                  router.push(`/${locale}/auth/signin`);
                }, 0);
                return;
              }
              handlePostComment();
            }}
            disabled={!!loadingCreateComment && !!user?.userId}
            className="flex items-end gap-2 px-5 py-2 bg-gradient-to-b from-cyan-500 to-cyan-400 rounded-lg text-black font-medium hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
          >
            <Send size={16} />{" "}
            {loadingCreateComment ? t("posting") : t("postComment")}
          </button>
        </div>
      </div>

      {/* Comments Display */}
      <div
        className="p-6 rounded-xl mt-5"
        style={{ background: "rgba(30, 41, 59, 0.30)" }}
      >
        {loadingComments ? (
          <p className="text-gray-400">{t("loadingComments")}</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-400">{t("noCommentsYet")}</p>
        ) : (
          comments.map((cmt) => (
            <div
              key={cmt.id}
              id={`comment-${cmt.id}`}
              style={{ backgroundColor: "rgba(11, 14, 24, 0.50)" }}
              className="flex items-center gap-3 mb-2 p-2 rounded-lg scroll-mt-20"
            >
              <Avatar
                src={cmt?.user?.avatarUrl}
                alt={cmt?.user?.username || "User"}
                size="sm"
              />
              <div className="flex-1">
                <div className="flex items-center gap-[10px]">
                  <p className="text-[#17EFF7]">
                    {cmt?.user?.username || t("anonymous")}
                  </p>
                  <p className="text-gray-400 text-xs">
                    • {formatTimeAgo(cmt.createdAt)}
                  </p>
                </div>
                <div className="text-[#D5D7DA] text-sm mt-1">{cmt?.body}</div>
              </div>
            </div>
          ))
        )}
      </div>
 {/* Related Posts */}
 <div className="mt-8">
   <h2 className="px-4 md:px-6 text-[28px] md:text-[36px] text-white font-bold mb-3">
     {t("relatedPosts")}
   </h2>

   {loading && <p className="px-4 md:px-6 text-gray-400">{t("loadingRelatedPosts")}</p>}
   {posts.length === 0 && !loading && (
     <p className="px-4 md:px-6 text-gray-400">{t("noRelatedPostsFound")}</p>
   )}

  {/* MOBILE: 1 hàng cuộn ngang + snap */}
  <div className="md:hidden -mx-4">
    <div
      className="
        flex gap-4 overflow-x-auto pb-4 px-4
        snap-x snap-mandatory scroll-pl-4 scroll-pr-4
        [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
      "
    >
      {posts.map((post) => (
        <div key={post.id} className="snap-start w-[300px] shrink-0">
          <BlogCard
            post={post}
            locale={locale}
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
    </div>
  </div>

  {/* TABLET/DESKTOP: Grid 2 cột, card stretch cùng chiều cao */}
  <div className="hidden md:grid grid-cols-2 gap-6 auto-rows-[1fr] items-stretch px-4 md:px-6">
    {posts.map((post) => (
      <div key={post.id} className="h-full">
        {/* nếu BlogCard chưa tự stretch, bọc thêm div để đảm bảo full height */}
        <div className="h-full">
          <BlogCard
            post={post}
            locale={locale}
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
      </div>
    ))}
  </div>
</div>


    </div>
  );
};

export default FooterSlug;
