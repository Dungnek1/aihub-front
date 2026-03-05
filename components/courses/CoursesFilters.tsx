"use client";
import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Search } from "lucide-react";

type Props = {
  onChange?: (filters: {
    tab: "featured" | "following";
    q: string;
    level: string;
    price: string;
  }) => void;
};

export default function CoursesFilters({ onChange }: Props) {
  const t = useTranslations("AITools");
  const [tab, setTab] = React.useState<"featured" | "following">("featured");
  const [q, setQ] = React.useState("");
  const [level, setLevel] = React.useState("");
  const [price, setPrice] = React.useState("");

  React.useEffect(() => {
    onChange?.({ tab, q, level, price });
  }, [tab, q, level, price, onChange]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab("featured")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            tab === "featured"
              ? "bg-gradient-to-b from-[#9FF3DF] to-[#17EFF7] text-[#0B5A5C]"
              : "text-gray-300 hover:text-white hover:bg-white/5"
          }`}
        >
          Featured
        </button>
        <button
          onClick={() => setTab("following")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            tab === "following"
              ? "bg-gradient-to-b from-[#9FF3DF] to-[#17EFF7] text-[#0B5A5C]"
              : "text-gray-300 hover:text-white hover:bg-white/5"
          }`}
        >
          Following
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-linear-to-b from-[#1c2431] to-[#11151d] border border-cyan-500/20">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search course..."
              className="w-full bg-transparent text-gray-200 text-sm outline-none placeholder-gray-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:col-span-2">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[#0E1624] border border-white/10 text-sm text-gray-200 outline-none focus:border-cyan-400/50"
          >
            <option value="">{/* empty shows placeholder */}Level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="all">All levels</option>
          </select>

          <select
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[#0E1624] border border-white/10 text-sm text-gray-200 outline-none focus:border-cyan-400/50"
          >
            <option value="">Price</option>
            <option value="FREE">Free</option>
            <option value="TRIAL">Trial</option>
            <option value="PAID">Paid</option>
            <option value="SUBSCRIPTION">Subscription</option>
          </select>
        </div>
      </div>
    </div>
  );
}


