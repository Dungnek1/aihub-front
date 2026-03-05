"use client";

import Avatar from "@/components/ui/Avatar";
import Link from "next/link";

interface AuthorBioProps {
  author: {
    name: string;
    avatarUrl?: string | null;
    userId?: string;
  };
  locale: string;
}

export default function AuthorBio({ author, locale }: AuthorBioProps) {
  if (!author) return null;

  return (
    <div className="mt-12 pt-8 border-t border-white/10">
      <div className="flex items-start gap-4">
        <Avatar
          src={author.avatarUrl || undefined}
          alt={author.name}
          size="md"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">
              {author.name}
            </h3>
            {author.userId && (
              <Link
                href={`/${locale}/profile/${author.userId}`}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Xem profile →
              </Link>
            )}
          </div>
          <p className="text-white/70 text-sm">
            Tác giả của bài viết này. Khám phá thêm các bài viết khác từ tác giả.
          </p>
        </div>
      </div>
    </div>
  );
}

