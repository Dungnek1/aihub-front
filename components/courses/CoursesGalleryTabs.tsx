"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import CourseFeaturedCard from "./CourseFeaturedCard";
import { Tool } from "@/types/tool.types";
import {
  getUserUsedCourses,
  getUserSavedCourses,
} from "@/services/client/courses.client";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { Star, ExternalLink, MoreVertical, BookOpen } from "lucide-react";
import { normalizeMediaUrl } from "@/utils/image.utils";
import { AnimatePresence, motion } from "framer-motion";

interface CoursesGalleryTabsProps {
  usedCourses?: Tool[];
  savedCourses?: Tool[];
  user?: any;
}

export default function CoursesGalleryTabs({
  usedCourses: initialUsedCourses = [],
  savedCourses: initialSavedCourses = [],
  user: initialUser,
}: CoursesGalleryTabsProps) {
  const t = useTranslations("AITools");
  const locale = useLocale();
  const { user } = useAuth();
  const currentUser = user || initialUser;

  const [activeTab, setActiveTab] = useState<"used" | "saved">("used");
  const [usedCourses, setUsedCourses] = useState<Tool[]>(initialUsedCourses);
  const [savedCourses, setSavedCourses] = useState<Tool[]>(initialSavedCourses);
  const [loading, setLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const hasFetchedCoursesRef = useRef(false);
  const fetchingRef = useRef(false);

  const userId = useMemo(
    () => currentUser?.userId || null,
    [currentUser?.userId]
  );

  useEffect(() => {
    if (!userId) {
      hasFetchedCoursesRef.current = false;
      fetchingRef.current = false;
      setUsedCourses([]);
      setSavedCourses([]);
      return;
    }

    if (userId && !hasFetchedCoursesRef.current && !fetchingRef.current) {
      fetchingRef.current = true;
      
      const timeoutId = setTimeout(async () => {
        if (!userId || hasFetchedCoursesRef.current) {
          fetchingRef.current = false;
          return;
        }

        setLoading(true);
        try {
          const [usedCoursesData, savedCoursesData] = await Promise.all([
            getUserUsedCourses(),
            getUserSavedCourses(),
          ]);
          setUsedCourses(usedCoursesData);
          setSavedCourses(savedCoursesData);
          hasFetchedCoursesRef.current = true;
        } catch (error: any) {
          if (!error?._silent && error?.response?.status !== 401) {
            if (process.env.NODE_ENV === "development") {
              console.error("Failed to fetch courses:", error);
            }
          }
          hasFetchedCoursesRef.current = false;
        } finally {
          setLoading(false);
          fetchingRef.current = false;
        }
      }, 500);

      return () => {
        clearTimeout(timeoutId);
        fetchingRef.current = false;
      };
    }
  }, [userId]);

  const handleRemoveCourse = useCallback(
    (courseId: string, context: "used" | "saved") => {
      if (context === "used") {
        setUsedCourses((prev) => prev.filter((course) => course.id !== courseId));
      } else {
        setSavedCourses((prev) => prev.filter((course) => course.id !== courseId));
      }
    },
    []
  );

  const currentCourses = useMemo(
    () => (activeTab === "used" ? usedCourses : savedCourses),
    [activeTab, usedCourses, savedCourses]
  );

  const translations = useMemo(
    () => ({
      usedCourses: t("usedCourses") || "Đã Dùng",
      savedCourses: t("savedCourses") || "Đã Lưu",
      usedCoursesTitle: t("usedCoursesTitle") || "Khóa Học Đã Dùng",
      savedCoursesTitle: t("savedCoursesTitle") || "Khóa Học Đã Lưu",
      noUsedCourses: t("noUsedCourses") || "Chưa có khóa học đã dùng",
      noSavedCourses: t("noSavedCourses") || "Chưa có khóa học đã lưu",
    }),
    [t]
  );

  const handleImageError = useCallback(
    (courseId: string) => {
      setImageErrors((prev) => ({ ...prev, [courseId]: true }));
    },
    []
  );

  const renderMobileCourseList = useCallback(
    (courses: Tool[], title: string) => (
      <div className="mb-6">
        <h3 className="text-white font-semibold text-base mb-3 px-1">{title}</h3>
        {courses.length > 0 ? (
          <div className="space-y-2">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-900/30 border border-gray-700/50 w-full"
              >
                {(!course.logoUrl || imageErrors[course.id]) ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
                  </div>
                ) : (
                  <Image
                    src={normalizeMediaUrl(course.logoUrl)}
                    alt={course.name}
                    width={64}
                    height={64}
                    className="rounded-lg w-16 h-16 sm:w-20 sm:h-20 object-cover flex-shrink-0"
                    style={{ objectFit: "cover" }}
                    onError={() => handleImageError(course.id)}
                  />
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {course.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star
                        size={12}
                        className="fill-yellow-400 text-yellow-400"
                      />
                      <span className="text-xs text-white font-medium">
                        {Number(course.avgRating).toFixed(1)}
                      </span>
                    </div>
                    {course.price && (
                      <span className="px-1.5 py-0.5 rounded text-badge-xs bg-emerald-600/30 text-emerald-300 border border-emerald-400/30">
                        {(() => {
                          const priceKey = course.price.toLowerCase();
                          const validKeys = ["paid", "trial", "subscription", "free"];
                          if (validKeys.includes(priceKey)) {
                            return t(priceKey as "paid" | "trial" | "subscription" | "free");
                          }
                          return course.price;
                        })()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button className="p-1.5 sm:p-2 rounded-lg border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10 transition">
                    <ExternalLink size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <button className="p-1.5 sm:p-2 text-gray-400 hover:text-white transition">
                    <MoreVertical size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm text-center py-6 px-1">
            {title.includes("Used") || title.includes("Đã Dùng")
              ? translations.noUsedCourses
              : translations.noSavedCourses}
          </div>
        )}
      </div>
    ),
    [translations, imageErrors, handleImageError, t]
  );

  return (
    <div className="mt-4 sm:mt-2 relative">
      {/* Temporarily hidden used and saved tabs */}
      {false && <div className="hidden sm:block">
        <div
          className={`flex gap-6 items-center border-b border-gray-700 mb-6 relative ${
            !currentUser ? "opacity-50 blur-[1px] pointer-events-none" : ""
          }`}
        >
          <button
            onClick={() => setActiveTab("used")}
            disabled={loading || !currentUser}
            className={`relative cursor-pointer pb-2 text-sm font-semibold transition-all duration-300 ease-out ${
              activeTab === "used"
                ? "text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {translations.usedCourses}
            {activeTab === "used" && (
              <motion.div
                layoutId="coursesGalleryActiveTab"
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#56E3E1] rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            disabled={loading || !currentUser}
            className={`relative cursor-pointer pb-2 text-sm font-semibold transition-all duration-300 ease-out ${
              activeTab === "saved"
                ? "text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {translations.savedCourses}
            {activeTab === "saved" && (
              <motion.div
                layoutId="coursesGalleryActiveTab"
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#56E3E1] rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#56E3E1]"></div>
          </div>
        )}

        {!loading && currentUser && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {currentCourses.length > 0 ? (
                currentCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.05,
                      ease: "easeOut" 
                    }}
                  >
                    <CourseFeaturedCard tool={course} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="col-span-full text-center py-8 text-gray-500"
                >
                  {activeTab === "used"
                    ? translations.noUsedCourses
                    : translations.noSavedCourses}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>}

      {/* Temporarily hidden used and saved sections */}
      {false && !loading && currentUser && (
        <div className="sm:hidden">
          {renderMobileCourseList(usedCourses, translations.usedCoursesTitle)}
          {renderMobileCourseList(savedCourses, translations.savedCoursesTitle)}
        </div>
      )}
    </div>
  );
}

