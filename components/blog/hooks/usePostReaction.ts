"use client";

import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { manageReaction, getMyReaction } from "@/services/client/blog.client";
import { logger } from "@/utils/logger";

type ReactionType = string;

interface UsePostReactionOptions {
  postId?: string;
  contentId?: string;
  initialReaction?: ReactionType | null;
  isAuthenticated: boolean;
  onRequireAuth?: () => void;
  loggerScope?: {
    module: string;
    component?: string;
  };
}

interface UsePostReactionReturn {
  selectedReaction: ReactionType | undefined;
  loadingReaction: boolean;
  handleReaction: (reactionType: ReactionType) => Promise<ReactionType | undefined>;
  setSelectedReaction: React.Dispatch<React.SetStateAction<ReactionType | undefined>>;
}

const FALLBACK_MATCHERS = ["reaction not found", "prisma.reaction.update"];
const DELETE_MISSING_MATCHER = "no reaction found to delete";

export function usePostReaction({
  postId,
  contentId,
  initialReaction,
  isAuthenticated,
  onRequireAuth,
  loggerScope,
}: UsePostReactionOptions): UsePostReactionReturn {
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | undefined>(
    initialReaction ?? undefined
  );
  const [loadingReaction, setLoadingReaction] = useState(false);
  const hasFetchedRef = React.useRef<string | undefined>(undefined);
  const isFetchingRef = React.useRef<boolean>(false);

  // Auto-fetch user's reaction immediately on mount if authenticated and no initial reaction provided
  // Use useLayoutEffect to fetch synchronously before paint, so reaction shows immediately
  useLayoutEffect(() => {
    const fetchUserReaction = async () => {
      // Only fetch if:
      // 1. User is authenticated
      // 2. We have a contentId
      // 3. No initial reaction was provided (undefined means not provided, null means explicitly no reaction)
      // 4. We haven't fetched for this contentId yet
      // 5. Not currently fetching
      if (
        isAuthenticated &&
        contentId &&
        initialReaction === undefined &&
        hasFetchedRef.current !== contentId &&
        !isFetchingRef.current
      ) {
        hasFetchedRef.current = contentId;
        isFetchingRef.current = true;
        try {
          // Fetch immediately without delay
          const reactionData = await getMyReaction(contentId);
          if (reactionData?.hasReacted && reactionData.reactionType) {
            setSelectedReaction(reactionData.reactionType);
          }
        } catch (error) {
          // Silently fail - user might not have reacted
          if (loggerScope) {
            logger.debug("Failed to fetch user reaction", {
              ...loggerScope,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        } finally {
          isFetchingRef.current = false;
        }
      }
    };

    // Fetch immediately, don't wait
    fetchUserReaction();
  }, [contentId, isAuthenticated, initialReaction, loggerScope]);

  useEffect(() => {
    setSelectedReaction(initialReaction ?? undefined);
  }, [initialReaction, postId]);

  const handleReaction = useCallback(
    async (reactionType: ReactionType) => {
      if (!postId) {
        if (loggerScope) {
          logger.error("Missing postId for reaction", loggerScope);
        }
        return selectedReaction;
      }

      if (!isAuthenticated) {
        onRequireAuth?.();
        return selectedReaction;
      }

      setLoadingReaction(true);

      try {
        if (!selectedReaction) {
          // Optimistically update UI
          setSelectedReaction(reactionType);
          await manageReaction(postId, reactionType, "POST");
          return reactionType;
        }

        if (selectedReaction === reactionType) {
          // Optimistically update UI
          setSelectedReaction(undefined);
          await manageReaction(postId, undefined, "DELETE");
          return undefined;
        }

        // Save previous reaction for potential revert
        const previousReaction = selectedReaction;
        // Optimistically update UI
        setSelectedReaction(reactionType);
        try {
          await manageReaction(postId, reactionType, "PUT");
        } catch (error) {
          if (
            error instanceof Error &&
            FALLBACK_MATCHERS.some((matcher) =>
              error.message?.toLowerCase().includes(matcher)
            )
          ) {
            await manageReaction(postId, reactionType, "POST");
          } else {
            // Revert on error
            setSelectedReaction(previousReaction);
            throw error;
          }
        }

        return reactionType;
      } catch (error) {
        // Handle "No reaction found to delete" error gracefully
        const errorMessage = error instanceof Error ? error.message?.toLowerCase() || "" : String(error).toLowerCase();
        
        if (errorMessage.includes(DELETE_MISSING_MATCHER) || errorMessage.includes("no reaction found")) {
          // Reaction không tồn tại, chỉ cần update state
          setSelectedReaction(undefined);
          return undefined;
        }

        if (loggerScope) {
          logger.error("Failed to handle reaction", {
            ...loggerScope,
            error: error instanceof Error ? error.message : "Unknown reaction error",
            reactionType,
          });
        }

        return selectedReaction;
      } finally {
        setLoadingReaction(false);
      }
    },
    [isAuthenticated, loggerScope, onRequireAuth, postId, selectedReaction]
  );

  return {
    selectedReaction,
    loadingReaction,
    handleReaction,
    setSelectedReaction,
  };
}

export default usePostReaction;

