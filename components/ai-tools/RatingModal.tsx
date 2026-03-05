"use client";

import Image from "next/image";
import { normalizeMediaUrl } from "@/utils/image.utils";
import { normalizeImageUrl } from "@/utils/image.utils";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/Toast";
import { rateTool } from "@/services/client/tools.client";
import { Tool } from "@/types/tool.types";

interface RatingModalProps {
    open: boolean;
    onClose: () => void;
    start: number;
    tool: Tool;
    onRatingSuccess?: () => void;
    onRatingUpdate?: (avgRating: number, ratingsCount: number) => void;
}

export default function RatingModal({
    open,
    onClose,
    tool,
    start,
    onRatingSuccess,
    onRatingUpdate,
}: RatingModalProps) {
    const t = useTranslations("RatingModal");
    const toast = useToast();
    const [selectedRating, setSelectedRating] = useState<number>(start);
    const [loading, setLoading] = useState(false);

    // Update selectedRating when start prop changes
    useEffect(() => {
        if (open && start > 0) {
            setSelectedRating(start + 1);
        }
    }, [start, open]);

    // Focus trap and accessibility
    useEffect(() => {
        if (!open) return;

        const modal = document.querySelector('[role="dialog"]') as HTMLElement;
        const firstFocusable = modal?.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        const focusableElements = modal?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;
        const lastFocusable = focusableElements?.[focusableElements.length - 1];

        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== "Tab") return;
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable?.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable?.focus();
                }
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        firstFocusable?.focus();
        document.addEventListener("keydown", handleTab);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleTab);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [open, onClose]);

    if (!open) return null;

    const handleRate = async () => {
        if (selectedRating === 0) {
            toast.error(t("selectStars"));
            return;
        }

        setLoading(true);

        try {
            const response = await rateTool(tool.id, selectedRating);
            // Update UI immediately with new rating data
            if (response && response.avgRating !== undefined && response.ratingsCount !== undefined) {
                onRatingUpdate?.(response.avgRating, response.ratingsCount);
            }
            // Success feedback
            toast.success(t("success"));
            onRatingSuccess?.();
            // Reset and close modal
            setSelectedRating(0);
            onClose();
        } catch (err) {
            toast.error(t("error"));
            console.error("Rating error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* ARIA live region for screen readers */}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
                {open && t("question")}
            </div>

        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                onClick={onClose}
                    role="presentation"
            >
                <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="rating-modal-title"
                        aria-describedby="rating-modal-description"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.4 }}
                    className="bg-[#181D27] text-white rounded-2xl p-6 w-[400px] border border-light-green shadow-[0_0_16px_rgba(23,239,247,0.3)]"
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 hover:bg-gray-700 rounded-lg transition"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>

                    {/* Header - Tool Info */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border border-light-green">
                                <Image
                                    src={normalizeMediaUrl(tool.logoUrl)}
                                alt={tool.name}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                                style={{ objectFit: "cover" }}
                            />
                        </div>
                        <h2 id="rating-modal-title" className="text-xl font-semibold">{tool.name}</h2>
                        <p id="rating-modal-description" className="text-gray-400 text-sm text-center mt-1">
                            {tool.description}
                        </p>
                    </div>

                    {/* Rating Section */}
                    <div className="mb-6 text-center">
                        <p className="text-gray-300 mb-4 font-medium">
                            {t("question")}
                        </p>

                        {/* Stars Selection */}
                        <div className="flex justify-center gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setSelectedRating(star)}
                                    className="p-2 rounded-lg transition hover:bg-gray-700/50"
                                >
                                    <Star
                                        size={32}
                                        className={
                                            star <= selectedRating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-500 hover:text-yellow-300"
                                        }
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Selected rating display */}
                        {selectedRating > 0 && (
                            <p className="text-lg font-semibold text-yellow-400">
                                {selectedRating} {t("stars")}
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-2 rounded-lg border border-gray-500 text-gray-300 font-semibold hover:bg-gray-700/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t("cancel")}
                        </button>
                        <button
                            onClick={handleRate}
                            disabled={loading || selectedRating === 0}
                            className="flex-1 py-2 rounded-lg bg-[#17EFF7] text-gray-900 font-semibold hover:bg-[#17EFF7]/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t("sending") : t("confirm")}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
        </>
    );
}
