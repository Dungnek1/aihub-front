"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, MessageSquare, Share2 } from "lucide-react";
import ActivityCard from "./ActivityCard";
import { AnimatePresence, motion } from "framer-motion";

export default function ActivityListClient({
  initialActivities,
}: {
  initialActivities: any[];
}) {
  const t = useTranslations("Blog");
  const tabs = [
    { key: "reacted", icon: Sparkles },
    { key: "commented", icon: MessageSquare },
    { key: "shared", icon: Share2 },
  ] as const;
  
  type TabType = typeof tabs[number]["key"];
  const [activeTab, setActiveTab] = useState<TabType>("reacted");

  const filtered =
    activeTab === "reacted"
      ? initialActivities.filter((a) => a.type === "reacted")
      : activeTab === "commented"
      ? initialActivities.filter((a) => a.type === "commented")
      : initialActivities.filter((a) => a.type === "shared");

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {tabs.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
              activeTab === key
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 px-4 py-2.5"
                : "bg-gray-800/50 text-gray-400 hover:text-gray-300 border border-gray-700 hover:border-gray-600 p-2.5 lg:px-4 lg:py-2.5"
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
              activeTab === key 
                ? "max-w-[200px] opacity-100" 
                : "max-w-0 opacity-0 lg:max-w-[200px] lg:opacity-100"
            }`}>
              {t(key)}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-[#111827] rounded-2xl border border-gray-700 flex flex-col items-center justify-center py-20 text-gray-400"
          >
            <div className="text-cyan-400 text-5xl mb-3">📄</div>
            <p className="font-medium text-lg">{t("noPostsFound")}</p>
            <p className="text-gray-500 text-sm">{t("noPostsInActivity")}</p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="space-y-4"
          >
            {filtered.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.05,
                  ease: "easeOut" 
                }}
              >
                <ActivityCard activity={activity} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}