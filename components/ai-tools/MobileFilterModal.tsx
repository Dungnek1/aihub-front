"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, ChevronUp, ChevronDown, Check } from "lucide-react";
import type { Price, Audience } from "@/types/tool.types";

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  prices: Price[];
  audiences: Audience[];
  onApplyFilter: (price?: string, audience?: string) => void;
  isLoading?: boolean;
}

export default function MobileFilterModal({
  isOpen,
  onClose,
  prices,
  audiences,
  onApplyFilter,
  isLoading = false,
}: MobileFilterModalProps) {
  const t = useTranslations("AITools");
  const [openSections, setOpenSections] = useState({
    pricing: true,
    audience: true,
  });

  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null);

  const toggleSection = (section: "pricing" | "audience") => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePriceChange = (priceName: string) => {
    const updated = selectedPrice === priceName ? null : priceName;
    setSelectedPrice(updated);
  };

  const handleAudienceChange = (audienceName: string) => {
    const updated = selectedAudience === audienceName ? null : audienceName;
    setSelectedAudience(updated);
  };

  const handleResetFilters = () => {
    setSelectedPrice(null);
    setSelectedAudience(null);
    onApplyFilter(undefined, undefined);
  };

  const handleApplyFilter = () => {
    onApplyFilter(selectedPrice || undefined, selectedAudience || undefined);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-50 sm:hidden"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 w-full h-full bg-[#0b0d11] z-50 sm:hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-[#0b0d11] px-4 py-4 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <h2 className="text-white text-lg font-semibold">
                  {t("filters")}
                </h2>
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetFilters}
                  className="text-white hover:text-gray-300 transition-colors"
                  aria-label={t("resetFilters")}
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-300 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y px-4 py-6 space-y-6 pb-24">
              {/* Loading Spinner */}
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                </div>
              )}

              {/* Pricing Section */}
              <div>
                <button
                  onClick={() => toggleSection("pricing")}
                  className="flex justify-between items-center w-full py-3 text-left"
                >
                  <span className="text-white font-medium text-base">
                    {t("pricing")}
                  </span>
                  {openSections.pricing ? (
                    <ChevronUp className="w-5 h-5 text-white" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {openSections.pricing && (
                    <motion.div
                      key="pricing"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden mt-2 space-y-3"
                    >
                      {prices.map((price) => (
                        <label
                          key={price.id}
                          className="flex items-center gap-3 text-white cursor-pointer group"
                        >
                          <div
                            onClick={() => handlePriceChange(price.name)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              selectedPrice === price.name
                                ? "border-white bg-white"
                                : "border-white bg-transparent group-hover:border-gray-300"
                            }`}
                          >
                            {selectedPrice === price.name && (
                              <Check size={14} className="text-[#1A1A2E]" />
                            )}
                          </div>
                          <span className="text-sm">{price.name}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-700" />

              {/* Audience Section */}
              <div>
                <button
                  onClick={() => toggleSection("audience")}
                  className="flex justify-between items-center w-full py-3 text-left"
                >
                  <span className="text-white font-medium text-base">
                    {t("audience")}
                  </span>
                  {openSections.audience ? (
                    <ChevronUp className="w-5 h-5 text-white" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {openSections.audience && (
                    <motion.div
                      key="audience"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden mt-2 space-y-3"
                    >
                      {audiences.map((audience) => (
                        <label
                          key={audience.id}
                          className="flex items-center gap-3 text-white cursor-pointer group"
                        >
                          <div
                            onClick={() => handleAudienceChange(audience.name)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              selectedAudience === audience.name
                                ? "border-white bg-white"
                                : "border-white bg-transparent group-hover:border-gray-300"
                            }`}
                          >
                            {selectedAudience === audience.name && (
                              <Check size={14} className="text-[#1A1A2E]" />
                            )}
                          </div>
                          <span className="text-sm">{audience.name}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Apply Button - Fixed at bottom */}
            <div className="flex-shrink-0 bg-[#0b0d11] px-4 py-4 border-t border-gray-700 sm:hidden">
              <button
                onClick={handleApplyFilter}
                disabled={isLoading}
                className="w-full py-3 rounded-lg text-white font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(90deg, #00C6FF 0%, #0072FF 100%)",
                }}
              >
                {t("applyFilter") || "Apply Filter"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

