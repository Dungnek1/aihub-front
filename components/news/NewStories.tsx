"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import authorIcon from "@/public/icon/author.svg";
import clockIcon from "@/public/icon/clock-color.svg";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useNavigation } from "@/contexts/NavigationContext";
import { normalizeImageUrl } from "@/utils/image.utils";

type Story = {
  title: string;
  category: string;
  author: string;
  readTime: string;
  desc?: string;
  previewImg?: string; // ảnh dùng cho preview ở panel #1
  shortDetail?: string; // nội dung ngắn hiển thị khi hover (short detail)
  detail?: string; // nội dung dài cho trang detail (deprecated, dùng shortDetail)
  slug: string;
};

type Props = {
  stories: Story[];
  gapClass?: string;
  equalHeight?: boolean;
  previewHeight?: number; // nếu muốn khống chế chiều cao panel #1 từ ngoài
};

export default function NewStories({
  stories,
  gapClass = "gap-7 md:gap-9 xl:gap-[42px]",
  equalHeight = false,
  previewHeight = 180,
}: Props) {
  const stageRef = useRef<HTMLDivElement | null>(null);

  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const titleRefs = useRef<Array<HTMLHeadingElement | null>>([]);
  const locale = useLocale();
  const { setIsNavigating } = useNavigation();

  const [previewStyle, setPreviewStyle] = useState<React.CSSProperties>({});
  const previewStyleRef = useRef<React.CSSProperties>({});

  const [active, setActive] = useState<number | null>(null);

  const [activeId, setActiveId] = useState(0);

  const expandRef = useRef<HTMLDivElement | null>(null);
  const [expandStyle, setExpandStyle] = useState<React.CSSProperties>({});

  const lastHoverIdxRef = useRef<number | null>(null);
  
  // Lưu số dòng của mỗi title để điều chỉnh description
  const [titleLines, setTitleLines] = useState<number[]>([]);

  // Đo số dòng của title để điều chỉnh description (tổng không quá 3 dòng)
  useLayoutEffect(() => {
    if (typeof window === "undefined" || window.innerWidth < 1024) {
      return;
    }

    const updateTitleLines = () => {
      const lines: number[] = [];
      titleRefs.current.forEach((titleEl) => {
        if (!titleEl) {
          lines.push(1); // default 1 dòng
          return;
        }
        const computedStyle = window.getComputedStyle(titleEl);
        const lineHeight = parseFloat(computedStyle.lineHeight) || 32; // lg:text-xl lg:leading-[32px]
        const height = titleEl.offsetHeight;
        const lineCount = Math.round(height / lineHeight) || 1;
        lines.push(Math.min(lineCount, 1)); // Tối đa 1 dòng (desktop)
      });
      // Chỉ update nếu có thay đổi
      setTitleLines((prev) => {
        if (prev.length !== lines.length || prev.some((v, i) => v !== lines[i])) {
          return lines;
        }
        return prev;
      });
    };

    // Đợi DOM render xong
    const timeoutId = setTimeout(() => {
      updateTitleLines();
    }, 0);

    // Đo lại khi resize
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        updateTitleLines();
      }
    };
    
    // Sử dụng ResizeObserver để theo dõi thay đổi kích thước của title
    const resizeObserver = new ResizeObserver(() => {
      if (window.innerWidth >= 1024) {
        updateTitleLines();
      }
    });
    
    // Observe tất cả title elements (có thể chưa có ngay)
    const observeTitles = () => {
      titleRefs.current.forEach((el) => {
        if (el) resizeObserver.observe(el);
      });
    };
    
    // Observe ngay và observe lại sau một chút
    observeTitles();
    const observeTimeout = setTimeout(observeTitles, 100);
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(observeTimeout);
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [stories]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const p1 = cardRefs.current[0];
    if (!stage || !p1) return;

    const update = () => {
      const s = stage.getBoundingClientRect();
      const c = p1.getBoundingClientRect();
      const style = {
        position: "absolute" as const,
        left: c.left - s.left,
        top: c.top - s.top,
        width: c.width,
        height: c.height,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        overflow: "hidden" as const,
        zIndex: 40,
        pointerEvents: "none" as const,
      };
      const prev = previewStyleRef.current;
      if (
        prev.left !== style.left ||
        prev.top !== style.top ||
        prev.width !== style.width ||
        prev.height !== style.height
      ) {
        previewStyleRef.current = style;
        setPreviewStyle(style);
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(stage);
    ro.observe(p1);
    return () => ro.disconnect();
  }, []);

  // ===== LOGIC MỞ RỘNG (Short Detail Overlay) - CUỘN LÊN LIÊN TỤC (ROLL-UP) =====
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // Tìm card cuối cùng để tính toán vị trí overlay
    const lastCardIdx = cardRefs.current.length - 1;
    const lastCard = cardRefs.current[lastCardIdx];
    if (!lastCard) return;

    const s = stage.getBoundingClientRect();
    const rLast = lastCard.getBoundingClientRect();
    const lastCardBottomRelToStage = rLast.bottom - s.top;

    // --- LOGIC ĐÓNG HOÀN TOÀN (Khi active == null) ---
    if (active == null) {
      if (expandRef.current && expandRef.current.style.height !== "0px") {
        // 1. Animation đóng
        const t = setTimeout(() => {
          setExpandStyle((prev) => ({
            ...prev,
            top: lastCardBottomRelToStage,
            height: 0,
            opacity: 0,
            transition:
              "top 300ms cubic-bezier(.22,.61,.36,1), height 300ms cubic-bezier(.22,.61,.36,1), opacity 300ms",
          }));
        }, 50);
        // 2. Reset style sau khi animation đóng hoàn tất
        setTimeout(() => setExpandStyle({}), 350);
        return () => clearTimeout(t);
      }
      setExpandStyle({});
      return;
    }

    // --- LOGIC CUỘN LÊN (Luôn chạy lại khi active/activeId thay đổi) ---
    const p1 = cardRefs.current[0];
    const activeCard = cardRefs.current[active];
    const exp = expandRef.current;
    if (!p1 || !exp || !activeCard) return;

    // 1. Tính toán vị trí - sử dụng card đang active thay vì hardcode card thứ 3
    const r1 = p1.getBoundingClientRect();
    const rActive = activeCard.getBoundingClientRect();
    const finalTopStage = r1.bottom - s.top;
    const SEAM = 0; // loại bỏ khe hở giữa panel gốc và short detail panel
    const lastCardBottomStage = rLast.bottom - s.top;
    const finalHeight = Math.max(0, lastCardBottomStage - finalTopStage - SEAM);

    // 2. KHỞI TẠO (START: Tức thì nhảy về đáy card cuối cùng, KHÔNG animation)
    // Buộc React/Browser áp dụng trạng thái reset này ngay lập tức
    setExpandStyle({
      position: "absolute",
      left: rActive.left - s.left,
      width: rActive.width,
      height: 0,
      top: lastCardBottomRelToStage,
      transition: "none", // Tắt transition ở đây -> TẠO HIỆU ỨNG ẨN TỨC THÌ
      zIndex: 48,
      opacity: 0,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      overflow: "hidden",
      display: "block",
    });

    // 3. ANIMATION (END: Cuộn lên)
    // Dùng setTimeout/requestAnimationFrame để đảm bảo bước 2 đã được áp dụng
    requestAnimationFrame(() => {
      const t = setTimeout(() => {
        setExpandStyle({
          position: "absolute",
          left: rActive.left - s.left,
          width: rActive.width,
          top: finalTopStage + SEAM,
          height: finalHeight,
          zIndex: 48,
          // Kích hoạt transition cuộn lên
          transition:
            "top 450ms cubic-bezier(.22,.61,.36,1), height 450ms cubic-bezier(.22,.61,.36,1), opacity 300ms",
          opacity: 1,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          overflow: "hidden",
          display: "block",
        });
      }, 50);
      return () => clearTimeout(t);
    });

    return () => {};
  }, [active, activeId]); // Phụ thuộc vào active và activeId

  // ===== Hover handlers (Đã sửa) =====
  const onEnter = (idx: number) => {
    // Luôn kích hoạt lại animation nếu có sự thay đổi giữa các panel.
    if (active !== idx) {
      setActive(idx);
      setActiveId((prev) => prev + 1);
    }
  };
  const onContainerLeave = () => {
    setActive(null);
    setActiveId(0); // Reset ID để cho phép logic đóng chạy
  };

  // Hover theo vị trí chuột trên Stage (kể cả khi overlay đang che)
  const onStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) return;
    const s = stage.getBoundingClientRect();
    const y = e.clientY;
    // Tìm panel chứa trục Y của chuột
    const refs = cardRefs.current;
    let idxHit: number | null = null;
    for (let i = 0; i < refs.length; i++) {
      const el = refs[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (
        y >= r.top &&
        y <= r.bottom &&
        e.clientX >= r.left &&
        e.clientX <= r.right
      ) {
        idxHit = i;
        break;
      }
    }
    if (idxHit != null && idxHit !== active) {
      // Tránh spam setState nếu trùng lặp nhanh
      if (lastHoverIdxRef.current !== idxHit) {
        lastHoverIdxRef.current = idxHit;
        setActive(idxHit);
        setActiveId((prev) => prev + 1);
      }
    }
  };

  // Dữ liệu của Story đang active (Giữ nguyên)
  const activeStory = active != null ? stories[active] : null;
  const activeImg = activeStory?.previewImg
    ? normalizeImageUrl(activeStory.previewImg)
    : null;
  const activeTitle = activeStory?.title || "";

  // Dữ liệu cho Khung Mở Rộng (Giữ nguyên)
  const showing = activeStory;
  const showingData = showing
    ? {
        category: showing.category,
        title: showing.title,
        author: showing.author,
        readTime: showing.readTime,
        slug: showing.slug,
        body: (
          showing.shortDetail ??
          showing.detail ??
          showing.desc ??
          ""
        ).trim(),
      }
    : null;

  const aLines = showingData?.body.split("\n").filter(Boolean) || [];
  const aSubtitle = aLines[0] || showingData?.body || "";
  const aBodyText = aLines.length > 1 ? aLines.slice(1).join("\n") : "";

  return (
    <div
      ref={stageRef}
      onMouseLeave={onContainerLeave}
      onMouseMove={onStageMouseMove}
      className={`relative flex flex-col ${
        equalHeight ? "items-stretch h-full" : ""
      }`}
      style={{ position: "relative" }}
    >
      {/* Mobile & Tablet: Vertical List */}
      <div className="block lg:hidden">
        {stories.map((story, idx) => {
          const previewText = story.desc ?? "";
          const compactBodyRaw = (
            story.shortDetail ??
            story.detail ??
            story.desc ??
            ""
          ).trim();
          const compactLines = compactBodyRaw.split("\n").filter(Boolean);
          const compactSubtitle = compactLines[0] || "";
          const compactBody =
            compactLines.length > 1 ? compactLines.slice(1).join("\n") : "";

          return (
            <Link
              key={`mobile-${idx}`}
              href={`/${locale}/blog/${story.slug}?source=new-stories`}
              onClick={() => setIsNavigating(true)}
              className={
                idx < stories.length - 1 ? "mb-4 md:mb-6 block" : "block"
              }
            >
              <div className="rounded-lg border border-white/20 bg-gradient-to-b from-[#1B2333] to-[#131A26] shadow-lg hover:border-white/30 transition-all lg:mx-0 mx-4 sm:mx-6">
                {/* Inner padding wrapper: padding này luôn còn, dù bên ngoài có -mx-4 */}
                <div className="p-4 md:p-5 lg:p-6">
                  <div className="flex flex-row gap-2 sm:gap-3">
                    {/* Image - Left */}
                    <div className="relative w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[160px] md:h-[160px] flex-shrink-0 rounded-lg overflow-hidden m-0 p-0">
                      {story.previewImg ? (
                        <Image
                          src={normalizeImageUrl(story.previewImg)}
                          alt={story.title}
                          fill
                          unoptimized
                          priority={idx === 0}
                          loading={idx === 0 ? "eager" : "lazy"}
                          style={{
                            objectFit: "cover",
                            objectPosition: "center",
                          }}
                          className="!absolute !inset-0 !m-0 !p-0"
                        />
                      ) : null}
                    </div>

                    {/* Content - Right */}
                    <div className="flex-1 flex flex-col justify-between min-w-[200px] sm:min-w-[250px] overflow-hidden">
                      <div>
                        <h3 className="text-base md:text-lg font-semibold text-white mb-2 line-clamp-2 leading-relaxed tracking-wide">
                          {story.title}
                        </h3>
                        <p className="text-sm md:text-base leading-relaxed text-white/75 line-clamp-2 mb-3 tracking-wide">
                          {(
                            compactBody ||
                            compactSubtitle ||
                            previewText
                          ).trim()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs md:text-sm text-white/70 mt-4 w-full min-w-0 overflow-hidden">
                        <span className="flex items-center gap-2 min-w-0 flex-shrink">
                          <Image
                            src={authorIcon}
                            alt="author"
                            width={16}
                            height={16}
                            className="md:w-5 md:h-5 flex-shrink-0"
                          />
                          <span className="tracking-wide truncate">
                            {story.author}
                          </span>
                        </span>
                        {/* Cụm time: nằm trong cùng container div với author */}
                        <div className="flex items-center gap-2 shrink-0 whitespace-nowrap ml-2">
                          <Image
                            src={clockIcon}
                            alt="readTime"
                            width={16}
                            height={16}
                            className="md:w-5 md:h-5 flex-shrink-0"
                          />
                          <span className="text-sm opacity-80 whitespace-nowrap tracking-wide">
                            {story.readTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Desktop: Vertical List */}
      <div className={`hidden lg:flex lg:flex-col ${gapClass}`}>
        {/* OVERLAY ẢNH tại panel #1 - Ẩn trên mobile & tablet */}
        {activeImg && (
          <div
            style={{
              ...previewStyle,
              pointerEvents: "none",
            }}
            className="hidden lg:block opacity-0 data-[on=true]:opacity-100 transition-opacity duration-400 ease-out rounded-t-2xl overflow-hidden pt-0 mt-0"
            data-on={!!activeImg}
          >
            <Image
              src={activeImg}
              alt={activeTitle}
              fill
              unoptimized
              priority
              loading="eager"
              style={{ objectFit: "cover" }}
              className="rounded-t-2xl pt-0 mt-0"
            />
          </div>
        )}

        {/* KHUNG MỞ RỘNG (Short Detail Overlay) - Ẩn trên mobile & tablet */}
        {active != null && showingData && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: "none",
              zIndex: 48,
            }}
            className="hidden lg:block"
          >
            <Link
              href={`/${locale}/blog/${showingData.slug}?source=new-stories`}
              className="cursor-pointer"
              style={{ display: "block", height: "100%" }}
              onClick={() => setIsNavigating(true)}
            >
              <div
                ref={expandRef}
                className="
            absolute cursor-pointer
            rounded-b-2xl border border-white/10
            bg-gradient-to-b from-[#1B2333] to-[#131A26]
          "
                style={{
                  ...expandStyle,
                  pointerEvents: "auto",
                }}
              >
                <div className="px-5 pt-5 flex flex-col h-full pb-24">
                  {/* <span className="self-start inline-flex items-center rounded-md bg-white/10 border border-white/25 px-2 py-[2px] text-[11px] text-white/85 mb-4 truncate max-w-[200px]">
              {showingData.category}
            </span> */}
                  <h4 className="text-xl font-semibold text-white mb-4 leading-relaxed tracking-wide">
                    {showingData.title}
                  </h4>
                  {(aSubtitle || aBodyText) && (
                    <p className="text-base leading-relaxed text-white/85 mb-4 tracking-wide">
                      {aSubtitle
                        ? aSubtitle.split(" ").slice(0, 150).join(" ") +
                          (aSubtitle.split(" ").length > 150 ? "..." : "")
                        : ""}
                    </p>
                  )}

                  <div className="flex-1 min-h-0">
                    <div
                      className="overflow-hidden"
                      style={{
                        maxHeight: "calc(2rem * 10)",
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 10,
                        lineHeight: "2rem",
                        wordBreak: "break-word",
                      }}
                    >
                      {/* <span className="text-[13px] leading-7 text-white/75 whitespace-pre-wrap">
                  {(aBodyText || aSubtitle).trim()}
                  <span className="text-transparent"> …</span>
                </span> */}
                    </div>
                  </div>
                </div>

                <div
                  data-footer-cloned
                  className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-4 flex items-center justify-between text-white/75"
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src={authorIcon}
                      alt="author"
                      width={18}
                      height={18}
                    />
                    <span className="text-base tracking-wide">
                      {showingData.author}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-teal-300">
                    <span className="text-xl leading-none">↗</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* RENDER CÁC PANEL GỐC */}
        {stories.map((story, idx) => {
          const previewText = story.desc ?? "";
          const compactBodyRaw = (
            story.shortDetail ??
            story.detail ??
            story.desc ??
            ""
          ).trim();
          const compactLines = compactBodyRaw.split("\n").filter(Boolean);
          const compactSubtitle = compactLines[0] || "";
          const compactBody =
            compactLines.length > 1 ? compactLines.slice(1).join("\n") : "";

          const panelZIndex = active === idx ? 30 : 10;
          const cardRadiusClass =
            idx === 0 && active != null ? "rounded-t-2xl" : "rounded-2xl";

          return (
            <div
              key={idx}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              onMouseEnter={() => onEnter(idx)}
              className={`
              group relative w-full ${cardRadiusClass} border-none lg:border lg:border-white/20
              bg-transparent lg:bg-gradient-to-b lg:from-[#1B2333] lg:to-[#131A26]
              lg:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.45)] lg:hover:shadow-[0_16px_50px_-10px_rgba(0,0,0,0.6)]
              transition-all duration-300 lg:hover:bg-[#1A2232]/90 lg:hover:border-white/30
              overflow-hidden cursor-pointer
              
              flex flex-row gap-3 sm:gap-5 p-1 sm:p-0 lg:block
              ${equalHeight ? "lg:flex lg:flex-col lg:h-full" : ""}
            `}
              style={{
                zIndex: panelZIndex,
                position: "relative",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
              }}
            >
              {/* Responsive Image - Chung cho mobile & tablet */}
              <div className="relative w-[120px] h-[120px] sm:w-[200px] sm:h-[200px] lg:hidden flex-shrink-0 rounded-lg overflow-hidden m-0 p-0">
                {story.previewImg ? (
                  <Image
                    src={normalizeImageUrl(story.previewImg)}
                    alt={story.title}
                    fill
                    unoptimized
                    priority={idx === 0}
                    loading={idx === 0 ? "eager" : "lazy"}
                    style={{ objectFit: "cover", objectPosition: "center" }}
                    className="!absolute !inset-0 !m-0 !p-0"
                  />
                ) : null}
              </div>

              <div
                className={`flex-1 flex flex-col justify-between sm:px-0 sm:py-0 lg:px-5 lg:pt-4 lg:pb-12 ${
                  equalHeight ? "lg:flex lg:flex-col lg:flex-1" : ""
                } relative overflow-hidden`}
              >
                <div
                  data-compact
                  className="flex flex-col sm:justify-between sm:h-full"
                >
                  <div>
                    {/* Category Badge - Chỉ hiển thị từ tablet trở lên */}
                    <span className="hidden sm:inline-flex h-7 items-center rounded-md bg-white/10 border border-white/25 px-3 text-xs sm:text-sm text-white/85 mb-4 tracking-wide">
                      {story.category}
                    </span>

                    {/* Title - Responsive font size */}
                    <h3
                      ref={(el) => {
                        titleRefs.current[idx] = el;
                      }}
                      className="text-base leading-[20px] sm:text-lg sm:leading-[28px] sm:font-semibold lg:mt-5 lg:text-xl lg:leading-[32px] text-white lg:leading-relaxed sm:mb-3 lg:mb-0 tracking-wide line-clamp-2 lg:line-clamp-1"
                    >
                      {story.title}
                    </h3>

                    {/* Description - Mobile */}
                    <p className="sm:hidden text-xs leading-[18px] text-white/75 mt-2 mb-3 line-clamp-2 tracking-wide">
                      {(compactBody || compactSubtitle || previewText).trim()}
                    </p>

                    {/* Description - Tablet */}
                    <p className="hidden sm:block lg:hidden text-sm leading-[22px] text-white/75 mb-4 line-clamp-3 tracking-wide">
                      {(compactBody || compactSubtitle || previewText).trim()}
                    </p>

                    {/* Description - Desktop */}
                    <div className="hidden lg:block mt-4 text-base leading-7 text-white/75 tracking-wide">
                      <div
                        className="overflow-hidden"
                        style={{
                          maxHeight: `calc(1.75rem * ${Math.max(1, 3 - 1)})`, // Title luôn 1 dòng trên desktop
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: Math.max(1, 3 - 1), // Title luôn 1 dòng trên desktop
                          lineHeight: "1.75rem",
                          wordBreak: "break-word",
                        }}
                      >
                        <span className="whitespace-pre-wrap">
                          {(
                            compactBody ||
                            compactSubtitle ||
                            previewText
                          ).trim()}
                          <span className="text-transparent"> …</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer - Mobile & Tablet (inline) */}
                  <div className="flex lg:hidden justify-between items-center gap-3 sm:gap-4 text-white/75 text-xs sm:text-sm leading-relaxed px-4 md:px-5 w-full min-w-0 overflow-hidden">
                    <span className="flex items-center gap-2 tracking-wide min-w-0 flex-shrink">
                      <Image
                        src={authorIcon}
                        alt="author"
                        width={16}
                        height={16}
                        className="sm:w-5 sm:h-5 flex-shrink-0"
                      />
                      <span className="truncate">{story.author}</span>
                    </span>
                    <span className="flex items-center gap-2 whitespace-nowrap tracking-wide shrink-0">
                      <Image
                        src={clockIcon}
                        alt="readTime"
                        width={16}
                        height={16}
                        className="sm:w-5 sm:h-5 flex-shrink-0"
                      />
                      <span className="whitespace-nowrap">
                        {story.readTime}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Footer - Desktop (absolute) */}
                <div
                  data-footer
                  className="hidden lg:flex absolute bottom-0 left-0 right-0 px-5 lg:px-6 pb-5 pt-4 items-center justify-between text-white/75"
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src={authorIcon}
                      alt="author"
                      width={18}
                      height={18}
                    />
                    <span className="text-base tracking-wide">
                      {story.author}
                    </span>
                  </div>
                  {/* RIGHT: bỏ w-[100px], bỏ absolute + inset-0 */}
                  <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
                    <Image
                      src={clockIcon}
                      alt="readTime"
                      width={18}
                      height={18}
                    />
                    <span className="text-base tracking-wide whitespace-nowrap">
                      {story.readTime}
                    </span>
                    {/* Arrow giữ animation bằng transform/opacity */}
                    <span className="text-teal-300 opacity-0 translate-x-0 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:-translate-x-1 text-lg leading-none">
                      ↗
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
