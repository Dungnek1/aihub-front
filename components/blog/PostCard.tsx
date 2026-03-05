"use client";

import type { BlogPost, BlogCategory } from "@/services/client/blog.client";
import { Eye, Edit, Share2, Trash2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useNavigation } from "@/contexts/NavigationContext";
import { getCoverImageUrl } from "@/utils/image.utils";
import { deletePost } from "@/services/client/blog.client";

const ShareModal = dynamic(() => import("./ShareModal"), {
  ssr: false,
  loading: () => null,
});

const DeleteConfirmModal = dynamic(() => import("./DeleteConfirmModal"), {
  ssr: false,
  loading: () => null,
});

// Type that allows category to be either string or BlogCategory object
type PostCardProps = Omit<BlogPost, "category"> & {
  category: BlogCategory | string;
};

interface PostCardComponentProps {
  post: PostCardProps;
  onDelete?: (postId: string) => void;
}

export default function PostCard({ post, onDelete }: PostCardComponentProps) {
  const t = useTranslations("Blog");
  const locale = useLocale();
  const router = useRouter();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { setIsNavigating } = useNavigation();

  const handleView = () => {
    setIsNavigating(true);
    router.push(`/${locale}/blog/${post.slug}`);
  };

  const handleEdit = () => {
    setIsNavigating(true);
    router.push(`/${locale}/blog/edit/${post.slug}`);
  };

  const handleShare = () => {
    setShareModalOpen(true);
  };

  const handleDelete = () => {
    if (!post.id) return;
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!post.id) return;

    setIsDeleting(true);
    try {
      const success = await deletePost(post.id);
      if (success) {
        setDeleteModalOpen(false);
        // Call onDelete callback to remove from parent list
        if (onDelete) {
          onDelete(post.id);
        } else {
          // Fallback: reload page if no callback
          router.refresh();
        }
      } else {
        // Error will be handled by catch block
        throw new Error(t("deleteFailed") || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      // Keep modal open to show error, user can close manually
    } finally {
      setIsDeleting(false);
    }
  };

  const statusColor =
    post.status === "published"
      ? "bg-green-900/40 text-green-400"
      : post.status === "draft"
      ? "bg-gray-700/50 text-gray-300"
      : post.status === "pending"
      ? "bg-yellow-900/40 text-yellow-400"
      : "bg-red-900/40 text-red-400";

  const thumbnailUrl = getCoverImageUrl(post.coverImageId);

  return (
    <div className="bg-[#111827] border border-gray-700 rounded-xl p-4 md:p-5 lg:p-4 hover:border-cyan-700 transition">
      {/* Tablet Layout (640px - 1024px) */}
      <div className="hidden sm:flex lg:hidden items-center gap-4">
        {/* Left - Image */}
        <div className="flex-shrink-0">
          <Image
            src={thumbnailUrl}
            alt={post.title || "Post"}
            width={128}
            height={128}
            className="w-32 h-32 object-cover rounded-lg border border-gray-700"
            unoptimized
            onError={(e) => {
              e.currentTarget.src = getCoverImageUrl(null);
            }}
          />
        </div>

        {/* Middle - Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="font-semibold text-white text-lg mb-2">{post.title || "Untitled"}</h3>
          
          {/* Status Tags */}
          <div className="flex flex-wrap gap-2 mb-2">
            <span className={`text-sm px-3 py-1 rounded-full ${statusColor}`}>
              {t(post.status === "drafts" ? "draft" : post.status)}
            </span>
            <span className="text-sm bg-cyan-900/40 border border-cyan-700 text-cyan-400 px-3 py-1 rounded-full">
              {typeof post.category === "string"
                ? post.category
                : post.category?.name || "Uncategorized"}
            </span>
          </div>

          {/* Last Edited */}
          <p className="text-sm text-gray-500 mb-2">
            {t("lastEdited")}{" "}
            {post.updatedAt
              ? new Date(post.updatedAt).toISOString().split("T")[0]
              : "N/A"}
          </p>

          {/* Hashtags */}
          {post.content?.tags && post.content.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.content.tags.slice(0, 3).map((tag: any, index: number) => (
                <span
                  key={tag.id || index}
                  className="text-sm bg-gray-800/50 border border-gray-700 text-gray-400 px-3 py-1 rounded-full"
                >
                  #{typeof tag === "string" ? tag : tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right - Action Buttons (Horizontal) */}
        <div className="flex gap-2 flex-shrink-0 self-center">
          <button 
            onClick={handleView}
            className="p-2.5 bg-cyan-900/40 text-cyan-400 rounded-lg hover:bg-cyan-800 transition cursor-pointer"
          >
            <Eye size={18} />
          </button>
          <button 
            onClick={handleEdit}
            className="p-2.5 bg-blue-900/40 text-blue-400 rounded-lg hover:bg-blue-800 transition cursor-pointer"
          >
            <Edit size={18} />
          </button>
          <button 
            onClick={handleShare}
            className="p-2.5 bg-purple-900/40 text-purple-400 rounded-lg hover:bg-purple-800 transition cursor-pointer"
          >
            <Share2 size={18} />
          </button>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className={`p-2.5 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-800 transition ${
              isDeleting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            title={t("delete") || "Delete"}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Desktop Layout (>=1024px) */}
      <div className="hidden lg:flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          <Image
            src={thumbnailUrl}
            alt={post.title || "Post"}
            width={64}
            height={64}
            className="w-16 h-16 object-cover rounded-lg border border-gray-700"
            unoptimized
            onError={(e) => {
              e.currentTarget.src = getCoverImageUrl(null);
            }}
          />
          <div>
            <h3 className="font-medium text-white">{post.title || "Untitled"}</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}>
                {t(post.status === "drafts" ? "draft" : post.status)}
              </span>
              <span className="text-xs bg-cyan-900/40 border border-cyan-700 text-cyan-400 px-2 py-0.5 rounded-full">
                {typeof post.category === "string"
                  ? post.category
                  : post.category?.name || "Uncategorized"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t("lastEdited")}{" "}
              {post.updatedAt
                ? new Date(post.updatedAt).toISOString().split("T")[0]
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button 
            onClick={handleView}
            className="flex items-center gap-1 px-3 py-1 bg-cyan-900/40 text-cyan-400 rounded-lg text-sm hover:bg-cyan-800 transition cursor-pointer"
          >
            <Eye size={14} /> 
            <span>{t("view")}</span>
          </button>
          <button 
            onClick={handleEdit}
            className="flex items-center gap-1 px-3 py-1 bg-blue-900/40 text-blue-400 rounded-lg text-sm hover:bg-blue-800 transition cursor-pointer"
          >
            <Edit size={14} /> 
            <span>{t("edit")}</span>
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center gap-1 px-3 py-1 bg-purple-900/40 text-purple-400 rounded-lg text-sm hover:bg-purple-800 transition cursor-pointer"
          >
            <Share2 size={14} /> 
            <span>{t("sharePost")}</span>
          </button>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className={`p-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-800 transition ${
              isDeleting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            title={t("delete") || "Delete"}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Mobile (<640px) */}
      <div className="sm:hidden">
        {/* Image */}
        <Image
          src={thumbnailUrl}
          alt={post.title || "Post"}
          width={400}
          height={200}
          className="w-full h-48 object-cover rounded-lg border border-gray-700 mb-3"
          unoptimized
          onError={(e) => {
            e.currentTarget.src = getCoverImageUrl(null);
          }}
        />

        {/* Content */}
        <div className="mb-3">
          <h3 className="font-medium text-white text-base mb-2">
            {post.title || "Untitled"}
          </h3>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}>
              {t(post.status === "drafts" ? "draft" : post.status)}
            </span>
            <span className="text-xs bg-cyan-900/40 border border-cyan-700 text-cyan-400 px-2 py-0.5 rounded-full">
              {typeof post.category === "string"
                ? post.category
                : post.category?.name || "Uncategorized"}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {t("lastEdited")}{" "}
            {post.updatedAt
              ? new Date(post.updatedAt).toISOString().split("T")[0]
              : "N/A"}
          </p>
        </div>

        {/* Actions - Full Width Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={handleView}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-cyan-900/40 text-cyan-400 rounded-lg text-sm hover:bg-cyan-800 transition cursor-pointer"
          >
            <Eye size={14} /> <span className="hidden sm:inline">{t("view")}</span>
          </button>
          <button 
            onClick={handleEdit}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-900/40 text-blue-400 rounded-lg text-sm hover:bg-blue-800 transition cursor-pointer"
          >
            <Edit size={14} /> <span className="hidden sm:inline">{t("edit")}</span>
          </button>
          <button 
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-900/40 text-purple-400 rounded-lg text-sm hover:bg-purple-800 transition cursor-pointer"
          >
            <Share2 size={14} /> <span className="hidden sm:inline">{t("sharePost")}</span>
          </button>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className={`p-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-800 transition ${
              isDeleting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            title={t("delete") || "Delete"}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        postSlug={post.slug}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={post.title || "Untitled"}
        isLoading={isDeleting}
      />
    </div>
  );
}