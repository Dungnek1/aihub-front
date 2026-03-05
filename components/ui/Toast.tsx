"use client";

import { createContext, useContext, ReactNode, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Toast {
    id: string;
    message: string;
    type: "success" | "error" | "info";
    duration?: number;
}

interface ToastContextType {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback(
        (message: string, type: Toast["type"], duration = 3000) => {
            const id = Math.random().toString(36).substr(2, 9);
            const toast: Toast = { id, message, type, duration };

            setToasts((prev) => [...prev, toast]);

            if (duration > 0) {
                setTimeout(() => removeToast(id), duration);
            }

            return id;
        },
        [removeToast]
    );

    const value: ToastContextType = {
        success: (message, duration) => addToast(message, "success", duration),
        error: (message, duration) => addToast(message, "error", duration),
        info: (message, duration) => addToast(message, "info", duration),
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextType {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}

function ToastContainer({
    toasts,
    onRemove,
}: {
    toasts: Toast[];
    onRemove: (id: string) => void;
}) {
    return (
        <div className="fixed top-4 right-4 z-[999] pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="mb-2 pointer-events-auto"
                    >
                        <div
                            className={`px-6 py-3 rounded-lg text-white font-medium flex items-center gap-3 shadow-lg ${toast.type === "success"
                                    ? "bg-green-500"
                                    : toast.type === "error"
                                        ? "bg-red-500"
                                        : "bg-blue-500"
                                }`}
                        >
                            <span>
                                {toast.type === "success" && "✓"}
                                {toast.type === "error" && "✕"}
                                {toast.type === "info" && "ℹ"}
                            </span>
                            <span>{toast.message}</span>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
