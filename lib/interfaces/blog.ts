export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  bodyHtml: string;
  authorId: string;
  categoryId?: string;
  coverImageId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  tags?: Array<{
    id: string;
    name: string;
  }>;
  reactions?: Array<{
    id: string;
    userId: string;
    reactionType: string;
  }>;
  commentsCount?: number;
  sharesCount?: number;
  // Legacy fields for backward compatibility
  tag?: string;
  description?: string;
  image?: string;
  views?: number;
  comments?: number;
  likes?: number;
  timeAgo?: string;
}
