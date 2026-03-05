/**
 * Blog API types with discriminated unions
 */

// ReactionType discriminated union
export type ReactionType =
  | "LIKE"
  | "LOVE"
  | "HAHA"
  | "WOW"
  | "SAD"
  | "ANGRY"
  | "THUONGTHUONG";

export const REACTION_TYPES = {
  LIKE: "LIKE",
  LOVE: "LOVE",
  HAHA: "HAHA",
  WOW: "WOW",
  SAD: "SAD",
  ANGRY: "ANGRY",
  THUONGTHUONG: "THUONGTHUONG",
} as const satisfies Record<ReactionType, ReactionType>;

// PostStatus (ContentType) discriminated union
export type PostStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "REJECTED"
  | "REMOVED";

export const POST_STATUSES = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
  REMOVED: "REMOVED",
} as const satisfies Record<PostStatus, PostStatus>;

// Reaction response with discriminated union
export interface ReactionResponse {
  id: string;
  userId: string;
  refId: string;
  reactionType: ReactionType;
  createdAt: string;
}

// Post with status discriminated union
export interface PostWithStatus {
  id: string;
  status: PostStatus;
  // ... other post fields
}

// Type guards
export function isReactionType(value: string): value is ReactionType {
  return Object.values(REACTION_TYPES).includes(value as ReactionType);
}

export function isPostStatus(value: string): value is PostStatus {
  return Object.values(POST_STATUSES).includes(value as PostStatus);
}
