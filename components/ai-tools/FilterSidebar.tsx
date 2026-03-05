"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import type { Price, Audience } from "@/types/tool.types";

interface FilterSidebarProps {
  prices: Price[];
  audiences: Audience[];
  onFilterChange: (price?: string, audience?: string) => void;
  isLoading?: boolean;
}

const SidebarFilters = ({
  prices,
  audiences,
  onFilterChange,
  isLoading = false,
}: FilterSidebarProps) => {
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
    onFilterChange(updated || undefined, selectedAudience || undefined);
  };

  const handleAudienceChange = (audienceName: string) => {
    const updated = selectedAudience === audienceName ? null : audienceName;
    setSelectedAudience(updated);
    onFilterChange(selectedPrice || undefined, updated || undefined);
  };

  const handleResetFilters = () => {
    setSelectedPrice(null);
    setSelectedAudience(null);
    onFilterChange(undefined, undefined);
  };

  return (
    <div
      className="w-64 p-4 rounded-2xl text-gray-200 shadow-lg relative lg:w-52 xl:w-64 lg:p-3 xl:p-4"
      style={{
        background: "linear-gradient(168deg, #1D283A 0%, #1A1E29 100%)",
      }}
    >
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 rounded-2xl bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-xs text-gray-300">{t("filtering")}</span>
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-4 lg:text-base lg:mb-3 xl:text-lg xl:mb-4">{t("filters")}</h2>

      {/* Pricing Section */}
      <div className="border-t border-gray-600 pt-2">
        <button
          onClick={() => toggleSection("pricing")}
          className="flex justify-between items-center w-full py-2 text-left"
        >
          <span className="font-medium text-sm lg:text-xs xl:text-sm">{t("pricing")}</span>
          {openSections.pricing ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
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
              className="overflow-hidden pl-1 mt-1 flex flex-col gap-2"
            >
              {prices.map((price) => (
                <label
                  key={price.id}
                  className="flex items-center gap-2 text-sm cursor-pointer group lg:text-xs xl:text-sm"
                >
                  <div
                    onClick={() => handlePriceChange(price.name)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      selectedPrice === price.name
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-500 bg-transparent group-hover:border-gray-400"
                    }`}
                  >
                    {selectedPrice === price.name && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                  <span>{price.name}</span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Audience Section */}
      <div className="border-t border-gray-600 pt-2 mt-3">
        <button
          onClick={() => toggleSection("audience")}
          className="flex justify-between items-center w-full py-2 text-left"
        >
          <span className="font-medium text-sm lg:text-xs xl:text-sm">{t("audience")}</span>
          {openSections.audience ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
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
              className="overflow-hidden pl-1 mt-1 flex flex-col gap-2"
            >
              {audiences.map((audience) => (
                <label
                  key={audience.id}
                  className="flex items-center gap-2 text-sm cursor-pointer group lg:text-xs xl:text-sm"
                >
                  <div
                    onClick={() => handleAudienceChange(audience.name)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      selectedAudience === audience.name
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-500 bg-transparent group-hover:border-gray-400"
                    }`}
                  >
                    {selectedAudience === audience.name && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                  <span>{audience.name}</span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleResetFilters}
        disabled={isLoading}
        className="w-full mt-6 py-2 rounded-full bg-white cursor-pointer text-[#447FFE] text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed lg:mt-4 lg:py-1.5 lg:text-xs xl:mt-6 xl:py-2 xl:text-sm"
      >
        {t("resetFilters")}
      </button>
    </div>
  );
};

export default SidebarFilters;
