"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { logger } from "@/utils/logger";
import httpClient from "@/services/http";

interface CreateCommentInput {
    refId: string;
    bodyHtml: string;
    parentCommentId?: string;
    userId: string;
}

export const useCreateComment = () => {
    const { user, isAuthenticated } = useAuth();
    const [loadingCreateComment, setLoadingCreateComment] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const createComment = async (input: CreateCommentInput) => {
        if (!isAuthenticated || !user) {
            setError("Bạn cần đăng nhập để bình luận.");
            return;
        }

        setLoadingCreateComment(true);
        setError(null);
        setSuccess(false);

        try {
            // Use httpClient which automatically handles authentication via /api/auth/token
            // This uses dynamic URL from NEXT_PUBLIC_BACKEND_URL environment variable
            const response = await httpClient.post(
                "/blog/comment/create",
                input
            );

            setSuccess(true);
            return response.data;
        } catch (err) {
            logger.error("Error creating comment:", err);
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoadingCreateComment(false);
        }
    };

    return { createComment, loadingCreateComment, error, success };
};
