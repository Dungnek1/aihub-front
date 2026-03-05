"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Save, Send, Pencil, Eye, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Editor from "./Editor";
import tip from "@/public/icon/tip.svg";
import Image from "next/image";
import { Select } from "antd";
import {
  createPost,
  updatePost,
  getCategories,
  getPostBySlug,
  BlogCategory,
  BlogPost,
} from "@/services/client/blog.client";
import "@/styles/blog-category-select.css";
import { sanitizeBlogHtml } from "@/utils/sanitize.utils";
import type { AppSession } from "@/types/session";
import Avatar from "@/components/ui/Avatar";
import BlogDetailInteractionsWrapper from "./BlogDetailInteractionsWrapper";
import { formatTimeAgo } from "@/utils/formatTime";

interface WriteClientProps {
  session?: AppSession;
  initialPost?: BlogPost | null;
}

export default function WriteClient({
  session,
  initialPost,
}: WriteClientProps) {
  const isEditMode = !!initialPost;
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Blog");
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [imageName, setImageName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load initial post data when in edit mode
  useEffect(() => {
    if (initialPost) {
      setTitle(initialPost.title || "");
      setCategoryId(initialPost.categoryId || "");
      setContent(initialPost.bodyHtml || "");

      // Load tags from post
      if (
        initialPost.content?.tags &&
        Array.isArray(initialPost.content.tags)
      ) {
        const tagNames = initialPost.content.tags
          .map((tag: any) => (typeof tag === "string" ? tag : tag.name))
          .filter(Boolean);
        setTags(tagNames);
      }
    }
  }, [initialPost]);

  // Prevent page scroll when scrolling inside dropdown
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleWheel = (e: WheelEvent) => {
      // Find dropdown element
      const dropdown = document.querySelector(
        ".blog-category-select-dropdown.write-post-dropdown"
      ) as HTMLElement;

      if (!dropdown) return;

      // Check if event target is inside dropdown
      const target = e.target as HTMLElement;
      if (!dropdown.contains(target)) return;

      // Find the scrollable container inside dropdown
      const scrollContainer = dropdown.querySelector(
        ".rc-virtual-list-holder"
      ) as HTMLElement;

      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        const isAtTop = scrollTop <= 1;
        const isAtBottom = scrollTop >= scrollHeight - clientHeight - 1;

        // If we can scroll in the dropdown, prevent page scroll
        if (!(isAtTop && e.deltaY < 0) && !(isAtBottom && e.deltaY > 0)) {
          e.preventDefault();
          e.stopImmediatePropagation();
          // Manually scroll the dropdown
          scrollContainer.scrollTop += e.deltaY;
          return false;
        }
        // At boundaries, still prevent to avoid page scroll
        if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return false;
        }
      } else {
        // If dropdown exists but no scroll container, prevent page scroll
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const dropdown = document.querySelector(
        ".blog-category-select-dropdown.write-post-dropdown"
      ) as HTMLElement;
      if (!dropdown) return;

      const target = e.target as HTMLElement;
      if (dropdown.contains(target)) {
        e.stopPropagation();
      }
    };

    // Use capture phase to catch events early and prevent default
    document.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    });
    document.addEventListener("touchmove", handleTouchMove, {
      passive: false,
      capture: true,
    });

    return () => {
      document.removeEventListener("wheel", handleWheel, {
        capture: true,
      } as EventListenerOptions);
      document.removeEventListener("touchmove", handleTouchMove, {
        capture: true,
      } as EventListenerOptions);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    // Only load categories if user is logged in
    if (!session?.user) {
      return;
    }

    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const cats = await getCategories();
        const sanitizedCategories = (cats || [])
          .filter((cat) => {
            if (!cat) return false;
            const name = typeof cat.name === "string" ? cat.name.trim() : "";
            return name && name.toLowerCase() !== "string";
          })
          .map((cat) => ({
            ...cat,
            name: (cat.name || "").trim(),
          }));
        setCategories(sanitizedCategories);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, [session]);

  // Reset category if it's invalid after categories load
  useEffect(() => {
    if (!categoriesLoading && categories.length > 0 && categoryId) {
      const categoryExists = categories.some((cat) => cat.id === categoryId);
      if (!categoryExists) {
        setCategoryId("");
      }
    }
  }, [categories, categoriesLoading, categoryId]);

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput) && tags.length < 5) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
      setImageName(e.target.files[0].name);
    }
  };

  const handleSubmitForReview = () => {
    // Validate before switching to preview
    if (!title.trim()) {
      setMessage({ type: "error", text: t("titleRequired") });
      setActiveTab("write");
      return;
    }

    if (!content.trim() || content === "<p><br></p>") {
      setMessage({ type: "error", text: t("contentRequired") });
      setActiveTab("write");
      return;
    }

    // Clear any previous messages and switch to preview
    setMessage(null);
    setActiveTab("preview");
  };

  const handlePostBlog = async () => {
    // Prevent double submission
    if (isSubmittingRef.current || isLoading) {
      return;
    }

    if (!initialPost?.id && isEditMode) {
      setMessage({
        type: "error",
        text: t("postNotFound") || "Post not found",
      });
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    setMessage(null);

    try {
      let result: BlogPost | null = null;

      if (isEditMode && initialPost?.id) {
        // Update existing post
        result = await updatePost(initialPost.id, {
          title,
          bodyHtml: content,
          categoryId,
          slug: initialPost.slug, // Keep existing slug
        });

        if (result && result.slug) {
          setMessage({
            type: "success",
            text: t("blogUpdatedSuccess") || t("blogPostedSuccess"),
          });
          // Redirect to blog detail page
          const slug = result.slug;
          setTimeout(() => {
            router.push(`/${locale}/blog/${slug}`);
          }, 1000);
        } else if (initialPost?.slug) {
          // Fallback to initial post slug if result doesn't have slug
          setMessage({
            type: "success",
            text: t("blogUpdatedSuccess") || t("blogPostedSuccess"),
          });
          setTimeout(() => {
            router.push(`/${locale}/blog/${initialPost.slug}`);
          }, 1000);
        }
      } else {
        // Create new post
        result = await createPost({
          title,
          bodyHtml: content,
          categoryId,
          tagIds: tags,
          file: imageFile || undefined,
          coverImageType: imageFile ? "image" : undefined,
        });

        if (result && result.slug) {
          setMessage({ type: "success", text: t("blogPostedSuccess") });
          // Redirect to blog detail page
          const slug = result.slug;
          setTimeout(() => {
            router.push(`/${locale}/blog/${slug}`);
          }, 1000);
        }
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: isEditMode
          ? t("blogUpdateFailed") || t("blogPostFailed")
          : t("blogPostFailed"),
      });
      console.error(error);
      isSubmittingRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  // Create mock content for preview
  const mockContent = {
    id: "preview",
    author: {
      userId: session?.user?.userId || "",
      name: session?.user?.name || "You",
      avatarUrl: session?.user?.image || null,
    },
    createdAt: new Date().toISOString(),
    tags: tags.length > 0 ? [{ id: "preview", name: tags[0] }] : [],
    reactionsCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    viewsCount: 0,
  };

  // Create preview image URL if image file exists
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewImageUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewImageUrl(null);
    }
  }, [imageFile]);

  return (
    <div className="w-full">
      {/* Title Section */}
      <div className="flex flex-col gap-4 mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight flex items-center gap-2 sm:gap-3">
          <Pencil
            size={24}
            className="sm:w-6 sm:h-6 md:w-7 md:h-7 flex-shrink-0"
          />
          <span>{isEditMode ? t("editPost") : t("writePost")}</span>
        </h1>
        <span className="text-sm sm:text-base text-gray-400">
          {isEditMode
            ? t("editPostSubtitle") || t("writePostSubtitle")
            : t("writePostSubtitle")}
        </span>
      </div>

      {/* Write/Preview Buttons */}
      <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8">
        <button
          onClick={() => setActiveTab("write")}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 sm:px-5 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 cursor-pointer touch-manipulation min-h-[44px] ${
            activeTab === "write"
              ? "bg-white text-black border border-transparent shadow-md"
              : "bg-transparent text-white border border-gray-700 hover:border-gray-600 hover:bg-white/5"
          }`}
        >
          <Pencil
            size={18}
            className={`sm:w-5 sm:h-5 flex-shrink-0 ${
              activeTab === "write" ? "text-black" : "text-white"
            }`}
          />
          <span>{t("write")}</span>
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 sm:px-5 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 cursor-pointer touch-manipulation min-h-[44px] ${
            activeTab === "preview"
              ? "bg-white text-black border border-transparent shadow-md"
              : "bg-transparent text-white border border-gray-700 hover:border-gray-600 hover:bg-white/5"
          }`}
        >
          <Eye
            size={18}
            className={`sm:w-5 sm:h-5 flex-shrink-0 ${
              activeTab === "preview" ? "text-black" : "text-white"
            }`}
          />
          <span>{t("preview")}</span>
        </button>
      </div>

      {message && activeTab === "write" && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-900/20 border border-green-700 text-green-400"
              : "bg-red-900/20 border border-red-700 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {activeTab === "write" && (
        <div className="bg-[#111827] border border-gray-700 rounded-2xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 md:space-y-6">
          <div>
            <label className="block text-sm sm:text-base mb-2 sm:mb-3 text-gray-300 font-medium">
              {t("blogTitle")} *
            </label>
            <input
              type="text"
              placeholder={t("enterTitle")}
              className="w-full bg-[#0f172a] border border-gray-700 rounded-lg p-3 sm:p-4 text-sm sm:text-base text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all cursor-text touch-manipulation min-h-[44px]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <div>
              <label className="block text-sm sm:text-base mb-2 sm:mb-3 text-gray-300 font-medium">
                {t("category")} *
              </label>
              {!mounted ? (
                <div
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-lg p-3 text-sm text-gray-400"
                  style={{
                    height: "42px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {t("chooseCategory")}
                </div>
              ) : (
                <Select
                  placeholder={
                    categoriesLoading ? t("loading") : t("chooseCategory")
                  }
                  value={categoryId || undefined}
                  onChange={(value) => setCategoryId(value || "")}
                  onOpenChange={(open) => setDropdownOpen(open)}
                  disabled={categoriesLoading}
                  loading={categoriesLoading}
                  placement="bottomLeft"
                  dropdownAlign={{
                    points: ["tl", "bl"],
                    overflow: { adjustX: false, adjustY: false },
                  }}
                  popupMatchSelectWidth
                  getPopupContainer={(triggerNode) =>
                    triggerNode.parentElement || document.body
                  }
                  className="blog-category-select write-post-select"
                  classNames={{
                    popup: {
                      root: "blog-category-select-dropdown write-post-dropdown",
                    },
                  }}
                  style={{
                    width: "100%",
                  }}
                  options={categories.map((cat) => ({
                    label: cat.name,
                    value: cat.id,
                  }))}
                />
              )}
            </div>

            <div>
              <label className="block text-sm sm:text-base mb-2 sm:mb-3 text-gray-300 font-medium">
                {t("tagsMax5")}
              </label>
              <div className="flex gap-2 sm:gap-3">
                <input
                  type="text"
                  placeholder={t("addTag")}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="flex-1 bg-[#0f172a] border border-gray-700 rounded-lg text-sm sm:text-base text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all cursor-text touch-manipulation tag-input-write-post"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-[#0D3747] rounded-lg text-sm sm:text-base hover:bg-cyan-900 text-[#07859D] cursor-pointer touch-manipulation transition-all duration-200 active:scale-95 tag-button-write-post"
                >
                  {t("add")}
                </button>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-cyan-900/40 border border-cyan-700 text-cyan-400 px-2 py-1 rounded-full flex items-center gap-1 cursor-pointer hover:bg-cyan-900/60 transition"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-cyan-400 hover:text-cyan-200 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm sm:text-base mb-2 sm:mb-3 text-gray-300 font-medium">
              {t("addImage")}
            </label>
            <div className="flex items-center gap-2 sm:gap-3">
              <input
                type="text"
                placeholder={t("uploadImage")}
                readOnly
                value={imageName}
                className="flex-1 bg-[#0f172a] border border-gray-700 rounded-lg p-3 sm:p-4 text-sm sm:text-base text-gray-300 outline-none cursor-default touch-manipulation min-h-[44px]"
              />
              <button
                type="button"
                onClick={handleImageButtonClick}
                className="p-3 sm:p-4 bg-[#0D3747] border border-gray-700 rounded-lg text-cyan-400 hover:bg-cyan-900 transition-all duration-200 cursor-pointer touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
              >
                <Upload size={18} className="sm:w-5 sm:h-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm sm:text-base mb-2 sm:mb-3 text-gray-300 font-medium">
              {t("content")} *
            </label>
            <Editor value={content} onChange={setContent} />
          </div>

          <div className="text-sm sm:text-base text-gray-400 border-t border-gray-700 pt-4 sm:pt-5 md:pt-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <Image
                alt="tip"
                src={tip}
                width={20}
                height={20}
                className="sm:w-6 sm:h-6 flex-shrink-0"
              />
              <p className="text-[#0FB6BB] font-medium">{t("writingTips")}</p>
            </div>
            <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-gray-400">
              <li>{t("tip1")}</li>
              <li>{t("tip2")}</li>
              <li>{t("tip3")}</li>
              <li>{t("tip4")}</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-700">
            <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-gray-300 font-medium transition-all duration-200 cursor-pointer touch-manipulation min-h-[44px] active:scale-95">
              <Save size={18} className="sm:w-5 sm:h-5" />
              <span>{t("saveAsDraft")}</span>
            </button>
            <button
              onClick={handleSubmitForReview}
              className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#14CFD3] hover:bg-cyan-500 rounded-lg text-[#0B5A5C] font-medium transition-all duration-200 shadow-[0_4px_12px_0_rgba(21,93,252,0.5)] cursor-pointer touch-manipulation min-h-[44px] active:scale-95"
            >
              <Send size={18} className="sm:w-5 sm:h-5" />
              <span>{t("submitForReview")}</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === "preview" && (
        <article className="space-y-4 sm:space-y-6">
          {/* Author Info & Tag */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-white">
              <Avatar
                src={session?.user?.image || undefined}
                alt={session?.user?.name || "You"}
                size="sm"
              />
              <div>
                <p className="font-medium text-sm sm:text-base">
                  {session?.user?.name || "You"}
                </p>
                <p className="text-gray-400 text-xs">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            {/* Tag - chỉ hiển thị nếu có tag */}
            {tags.length > 0 && (
              <span className="inline-block px-3 py-1.5 rounded-lg border border-cyan-400/50 bg-cyan-400/10 text-cyan-400 text-sm font-medium flex-shrink-0">
                #{tags[0]}
              </span>
            )}
          </div>

          {/* Title - chỉ hiển thị nếu có title */}
          {title.trim() && (
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 text-white">
              {title}
            </h1>
          )}

          {/* Cover Image - chỉ hiển thị nếu có image */}
          {previewImageUrl && (
            <div className="mb-4 sm:mb-6">
              <img
                src={previewImageUrl}
                alt={title || "Preview"}
                className="object-cover w-full rounded-lg"
              />
            </div>
          )}

          {/* Content - chỉ hiển thị nếu có content */}
          {content && content !== "<p><br></p>" ? (
            <div
              className="prose prose-invert max-w-none leading-relaxed text-white mb-4
                [&_*]:!font-inherit [&_p]:!font-inherit [&_div]:!font-inherit [&_span]:!font-inherit [&_h1]:!font-inherit [&_h2]:!font-inherit [&_h3]:!font-inherit"
              style={{
                fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
              dangerouslySetInnerHTML={{
                __html: sanitizeBlogHtml(content),
              }}
            />
          ) : (
            <div className="text-center text-gray-500 py-8 sm:py-12 text-sm sm:text-base">
              {t("contentPreview") || "Your blog content will appear here..."}
            </div>
          )}

          {/* Engagement Metrics - chỉ hiển thị sau khi đã post, không hiển thị trong preview */}
          {/* Engagement metrics sẽ được hiển thị trên blog detail page sau khi post */}

          {/* Bottom Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-700">
            <button
              onClick={() => setActiveTab("write")}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-700/50 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-gray-300 font-medium transition-all duration-200 cursor-pointer touch-manipulation min-h-[44px] active:scale-95"
            >
              <Save size={18} className="sm:w-5 sm:h-5" />
              <span>{t("backToEdit")}</span>
            </button>
            <button
              onClick={handlePostBlog}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-cyan-400 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-black font-medium transition-all duration-200 cursor-pointer touch-manipulation min-h-[44px] active:scale-95 shadow-[0_4px_12px_0_rgba(6,182,212,0.3)]"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="sm:w-5 sm:h-5 animate-spin" />
                  <span>{t("posting")}</span>
                </>
              ) : (
                <>
                  <Send size={18} className="sm:w-5 sm:h-5" />
                  <span>{t("postBlog")}</span>
                </>
              )}
            </button>
          </div>
        </article>
      )}
    </div>
  );
}
