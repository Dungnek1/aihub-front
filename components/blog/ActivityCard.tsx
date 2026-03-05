"use client";

import { Eye, Heart, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function ActivityCard({ activity }: { activity: any }) {
  const t = useTranslations("Blog");
  return (
    <div className="flex flex-col sm:flex-row gap-4 bg-[#111827] rounded-2xl border border-gray-700 p-4 hover:border-cyan-600 transition">
      {/* Image Section */}
      <div className="flex-shrink-0 w-full sm:w-48 h-48">
        <Image
          src={activity.image}
          alt={activity.title}
          className="rounded-2xl object-cover w-full h-full"
          width={192}
          height={192}
        />
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col justify-between gap-3">
        {/* Header & Description */}
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mb-2">
            <span className="text-cyan-400 font-medium">{activity.tag}</span>
            <span>•</span>
            <span>{activity.timeAgo}</span>
          </div>

          <h3 className="text-gray-100 font-semibold text-base sm:text-lg mb-2">
            {activity.title}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2 sm:line-clamp-none">
            {activity.description}
          </p>
        </div>

        {/* Reaction & Stats Section */}
        <div className="flex flex-col gap-3">
          {/* Reaction Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs inline-block w-fit ${
              activity.reaction === "Sparkle"
                ? "bg-cyan-900/50 text-cyan-300"
                : activity.reaction === "Fire"
                ? "bg-orange-900/50 text-orange-300"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            🔥 {t("youReactedWith")} {activity.reaction}
          </span>

          {/* Stats & Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            {/* Stats */}
            <div className="flex gap-3 sm:gap-4 items-center text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Eye size={16} className="text-gray-400" />
                <span className="text-xs sm:text-sm">12.500</span>
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare size={16} className="text-gray-400" />
                <span className="text-xs sm:text-sm">520</span>
              </span>
              <span className="flex items-center gap-1">
                <Heart size={16} className="text-gray-400" />
                <span className="text-xs sm:text-sm">300</span>
              </span>
            </div>

            {/* View Post Button */}
            <button className="bg-[linear-gradient(180deg,#06A8AC_0%,#19DDE2_100%)] hover:bg-cyan-700 text-black text-sm font-medium px-4 py-2 rounded-lg shadow cursor-pointer w-full sm:w-auto transition-colors">
              {t("viewPost")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}