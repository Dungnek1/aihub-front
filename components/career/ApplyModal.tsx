"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogPortal,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Info, Upload, XIcon } from "lucide-react";
import { cn } from "@/utils";

interface ApplyModalProps {
  open: boolean;
  onClose: () => void;
  jobTitle: string;
}

export default function ApplyModal({
  open,
  onClose,
  jobTitle,
}: ApplyModalProps) {
  const t = useTranslations("Career");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    cv: null as File | null,
    portfolio: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, cv: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log("Form submitted:", formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogPortal>
        <DialogPrimitive.Overlay
          className={cn(
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border shadow-lg duration-200 sm:max-w-md",
            "bg-gradient-to-b from-[#1e293b] to-[#1e293b] border-[rgba(54,65,83,0.8)] p-6"
          )}
        >
          <DialogHeader>
            <div className="flex gap-2 items-center mb-6">
              <Info className="size-6 text-[#00d3f2]" />
              <DialogTitle className="font-medium text-base leading-6 text-white">
                {t("modalTitle")}
              </DialogTitle>
            </div>
          </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-1 items-start">
                <label className="font-medium text-base leading-6 text-white">
                  {t("fullName")}
                </label>
                <span className="font-normal text-sm leading-5 text-[#f04438]">
                  *
                </span>
              </div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder={t("enterInformation")}
                required
                className="bg-[rgba(11,14,24,0.5)] border border-[rgba(54,65,83,0.5)] rounded-lg h-11 px-3 py-2 text-base leading-6 text-white placeholder:text-[#717680] focus:outline-none focus:border-[#00d3f2] transition-colors"
              />
            </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-1 items-start">
              <label className="font-medium text-base leading-6 text-white">
                {t("email")}
              </label>
              <span className="font-normal text-sm leading-5 text-[#f04438]">
                *
              </span>
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t("enterInformation")}
              required
              className="bg-[rgba(11,14,24,0.5)] border border-[rgba(54,65,83,0.5)] rounded-lg h-11 px-3 py-2 text-base leading-6 text-white placeholder:text-[#717680] focus:outline-none focus:border-[#00d3f2] transition-colors"
            />
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-1 items-start">
              <label className="font-medium text-base leading-6 text-white">
                {t("phoneNumber")}
              </label>
              <span className="font-normal text-sm leading-5 text-[#f04438]">
                *
              </span>
            </div>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder={t("enterInformation")}
              required
              className="bg-[rgba(11,14,24,0.5)] border border-[rgba(54,65,83,0.5)] rounded-lg h-11 px-3 py-2 text-base leading-6 text-white placeholder:text-[#717680] focus:outline-none focus:border-[#00d3f2] transition-colors"
            />
          </div>

          {/* Upload CV */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-1 items-start">
              <label className="font-medium text-base leading-6 text-white">
                {t("uploadCV")}
              </label>
              <span className="font-normal text-sm leading-5 text-[#f04438]">
                *
              </span>
            </div>
            <div className="relative">
              <input
                type="file"
                name="cv"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                required
                className="hidden"
                id="cv-upload"
              />
              <label
                htmlFor="cv-upload"
                className="bg-[rgba(11,14,24,0.5)] border border-[rgba(54,65,83,0.5)] rounded-lg h-11 px-3 py-2 flex items-center justify-between cursor-pointer hover:border-[#00d3f2] transition-colors"
              >
                <span className="text-base leading-6 text-[#717680]">
                  {formData.cv ? formData.cv.name : t("enterInformation")}
                </span>
                <Upload className="size-5 text-[#717680]" />
              </label>
            </div>
          </div>

          {/* Portfolio Link */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-base leading-6 text-white">
              {t("linkPortfolio")}
            </label>
            <input
              type="url"
              name="portfolio"
              value={formData.portfolio}
              onChange={handleInputChange}
              placeholder={t("enterInformation")}
              className="bg-[rgba(11,14,24,0.5)] border border-[rgba(54,65,83,0.5)] rounded-lg h-11 px-3 py-2 text-base leading-6 text-white placeholder:text-[#717680] focus:outline-none focus:border-[#00d3f2] transition-colors"
            />
          </div>

          </div>

          {/* Submit Button */}
          <div className="flex flex-col gap-2.5 items-end justify-center">
            <button
              type="submit"
              className="bg-gradient-to-b from-[#06a8ac] to-[#19dde2] rounded-xl px-4 py-2.5 shadow-[0px_4px_12px_0px_rgba(21,93,252,0.5)] hover:opacity-90 transition-opacity w-full"
            >
              <span className="font-semibold text-base leading-6 text-[#0b5a5c]">
                {t("send")}
              </span>
            </button>
          </div>
        </form>
          <DialogPrimitive.Close
            className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
          >
            <XIcon className="size-4 text-white" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

