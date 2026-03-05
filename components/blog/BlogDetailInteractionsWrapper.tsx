"use client";

import CardInteractions from "./CardInteractions";
import type { Content } from "@/services/client/blog.client";

interface BlogDetailInteractionsWrapperProps {
  content: Content;
  postId: string;
  postSlug: string;
}

export default function BlogDetailInteractionsWrapper({
  content,
  postId,
  postSlug,
}: BlogDetailInteractionsWrapperProps) {
  return (
    <>
      <style jsx global>{`
        /* Tăng kích thước icons và text cho blog detail page */
        .blog-detail-interactions-wrapper button[type="button"] svg {
          width: 24px !important;
          height: 24px !important;
        }
        .blog-detail-interactions-wrapper button[type="button"] span {
          font-size: 16px !important;
          font-weight: 600 !important;
        }
        .blog-detail-interactions-wrapper > div {
          gap: 16px !important;
        }
        .blog-detail-interactions-wrapper button[type="button"] {
          gap: 8px !important;
          padding: 10px 16px !important;
        }
        
        /* CHỈ ÁP DỤNG CHO MOBILE - Desktop giữ nguyên hoàn toàn */
        @media (max-width: 640px) {
          .blog-detail-interactions-wrapper
            button[type="button"]:not([disabled]) {
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 8px !important;
            padding: 10px 14px !important;
            background: rgba(255, 255, 255, 0.05) !important;
            margin: 0 !important;
          }
          .blog-detail-interactions-wrapper button[type="button"][disabled] {
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 8px !important;
            padding: 10px 14px !important;
            background: rgba(255, 255, 255, 0.05) !important;
            margin: 0 !important;
            opacity: 0.6 !important;
          }
          .blog-detail-interactions-wrapper > div {
            gap: 12px !important;
            overflow: visible !important;
          }
          .blog-detail-interactions-wrapper {
            overflow: visible !important;
            position: relative !important;
          }
          /* Picker không bị tràn - dịch qua phải để không bị cắt bởi viền mobile */
          .blog-detail-interactions-wrapper > div > div[class*="absolute"] {
            z-index: 50 !important;
            overflow: visible !important;
            left: auto !important;
            right: 0 !important;
            transform: translateX(0) translateY(calc(-100% - 16px)) !important;
          }
          /* Đảm bảo container có đủ không gian */
          .blog-detail-interactions-wrapper > div > div[class*="relative"] {
            overflow: visible !important;
          }
          .blog-detail-interactions-wrapper
            button[type="button"]:hover:not([disabled]) {
            border-color: rgba(255, 255, 255, 0.4) !important;
            background: rgba(255, 255, 255, 0.08) !important;
          }
        }
      `}</style>
      <div className="blog-detail-interactions-wrapper flex justify-start">
        <CardInteractions
          content={content}
          postId={postId}
          postSlug={postSlug}
          compact={false}
        />
      </div>
    </>
  );
}
