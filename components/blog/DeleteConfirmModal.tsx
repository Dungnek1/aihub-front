"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { X, AlertTriangle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isLoading?: boolean;
}

export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  isLoading = false,
}: DeleteConfirmModalProps) {
  const t = useTranslations("Blog");
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key and focus trap
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    // Focus first focusable element
    const firstFocusable = modalRef.current?.querySelector(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    firstFocusable?.focus();

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose, isLoading]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ARIA live region for screen readers */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {t("delete")}
          </div>

          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={!isLoading ? onClose : undefined}
            role="presentation"
          >
            {/* Modal */}
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-modal-title"
              aria-describedby="delete-modal-description"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-[#111827] border border-red-500/30 rounded-2xl p-6 w-full max-w-md shadow-[0_0_24px_rgba(239,68,68,0.3)]"
            >
              {/* Close button */}
              {!isLoading && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 hover:bg-gray-700/50 rounded-lg transition-colors"
                  aria-label={t("close") || "Close"}
                >
                  <X size={20} className="text-gray-400" />
                </button>
              )}

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <AlertTriangle className="text-red-400" size={32} />
                </div>
              </div>

              {/* Title */}
              <h2
                id="delete-modal-title"
                className="text-xl font-semibold text-white text-center mb-2"
              >
                {t("deletePost")}
              </h2>

              {/* Description */}
              <p
                id="delete-modal-description"
                className="text-gray-400 text-center mb-6"
              >
                {t("confirmDelete", { title }) || 
                  `Are you sure you want to delete "${title}"? This action cannot be undone.`}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("cancel") || "Cancel"}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t("deleting") || "Deleting..."}</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      <span>{t("delete")}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

