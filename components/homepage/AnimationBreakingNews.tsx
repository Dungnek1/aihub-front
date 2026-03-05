"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

export default function AnimationBreakingNews({ items }: { items: string[] }) {
  const track = useMemo(() => [...items, ...items], [items]);
  // Use fixed default value to avoid hydration mismatch
  const [windowWidth, setWindowWidth] = useState(1024);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window === 'undefined') return;
    
    // Set initial width after mount
    setWindowWidth(window.innerWidth);
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Reset offset when resize
      offsetRef.current = 0;
      setOffset(0);
      phaseRef.current = "pause";
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Only calculate responsive values after mount to avoid hydration mismatch
  const isMobile = isMounted ? windowWidth < 640 : false;
  const isTablet = isMounted ? windowWidth >= 640 && windowWidth < 1024 : false;

  const WRAP_WIDTH = isMobile ? 340 : isTablet ? 640 : 980;
  const VISIBLE = isMobile ? 3 : isTablet ? 4 : 5;
  const SLOT = Math.floor(WRAP_WIDTH / VISIBLE);

  const MOVE_MS = 850;
  const PAUSE_MS = 1500;
  const BASE_SPEED = SLOT / MOVE_MS;
  const DECEL_WINDOW = 28;

  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);
  const phaseRef = useRef<"run" | "pause">("pause");

  useEffect(() => {
    if (typeof window === "undefined" || typeof performance === "undefined")
      return;

    const centerPx = WRAP_WIDTH / 2;
    const period = items.length * SLOT;

    phaseRef.current = "pause";

    let last = performance.now();
    let raf: number | null = null;
    let timer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      last = performance.now();
      phaseRef.current = "run";
    }, PAUSE_MS);

    const tick = (now: number) => {
      const dt = now - last;
      last = now;

      let off = offsetRef.current;
      if (phaseRef.current === "run") {
        const centerCoord = -off + centerPx;
        const kNext = Math.floor((centerCoord - SLOT / 2) / SLOT) + 1;
        const nextCenter = kNext * SLOT + SLOT / 2;
        const dist = nextCenter - centerCoord;

        let speed = BASE_SPEED;
        if (dist < DECEL_WINDOW) {
          const k = Math.max(0.15, dist / DECEL_WINDOW);
          speed = BASE_SPEED * k;
        }
        const delta = speed * dt;

        if (dist <= delta) {
          off = centerPx - nextCenter; // ghim giữa
          phaseRef.current = "pause";
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            last = performance.now();
            phaseRef.current = "run";
          }, PAUSE_MS);
        } else {
          off -= delta; // chạy tiếp sang trái
          if (off <= -period) off += period;
          else if (off > 0) off -= period;
        }
      }

      offsetRef.current = off;
      setOffset(off);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        last = performance.now();
      }
    };
    window.addEventListener("visibilitychange", onVisible);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
      window.removeEventListener("visibilitychange", onVisible);
    };
  }, [WRAP_WIDTH, SLOT, items.length, BASE_SPEED, PAUSE_MS, DECEL_WINDOW]);

  const trackStyle: React.CSSProperties = {
    transform: `translate3d(${offset}px,0,0)`,
    transition: "none",
    willChange: "transform",
    display: "grid",
    gridAutoFlow: "column",
    gridAutoColumns: `${SLOT}px`,
    alignItems: "center",
    textAlign: "center",
    height: "100%",
    textRendering: "geometricPrecision",
  };

  const centerPx = WRAP_WIDTH / 2;
  const GRADIENT_STYLE: React.CSSProperties = {
    backgroundImage:
      "linear-gradient(90deg, rgba(69,144,238,1) 0%, rgba(69,144,238,0.65) 42%, rgba(106,236,178,0.85) 58%, rgba(106,236,178,1) 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  };
  const BASE_STYLE: React.CSSProperties = {
    color: "#FFFFFFD9",
  } as React.CSSProperties;
  const spanBase: React.CSSProperties = {
    whiteSpace: "nowrap",
    fontSize: isMobile ? 15 : isTablet ? 21 : 26,
    letterSpacing: isMobile ? "0.01em" : "-0.02em",
    fontFamily:
      "var(--font-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    fontWeight: 700,
    fontFeatureSettings: '"kern" 1, "liga" 1',
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    padding: isMobile ? "0 8px" : "0",
    margin: isMobile ? "0 6px" : "0",
    width: "100%",
    overflow: "hidden",
  };

  const getSpanStyle = (i: number): React.CSSProperties => {
    const leftEdge = offset + i * SLOT;
    const wordCenter = leftEdge + SLOT / 2;
    const d = wordCenter - centerPx;
    const tint = d >= 0 && d <= SLOT / 2; // đang ở nửa bên phải của slot giữa
    return { ...spanBase, ...(tint ? GRADIENT_STYLE : BASE_STYLE) };
  };

  return (
    <>
      {/* Container riêng cho ellipse glow - không bị giới hạn bởi mask */}
      {isMounted && (
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: isMobile ? "400px" : "600px",
          height: isMobile ? "400px" : "600px",
          zIndex: 0,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          src="/Ellipse 1.png"
          alt=""
          width={400}
          height={400}
            priority
            loading="eager"
          style={{
            opacity: isMobile ? 0.5 : 0.6,
            mixBlendMode: "screen",
            width: "100%",
            height: "100%",
            maxWidth: isMobile ? "300px" : "400px",
            maxHeight: isMobile ? "300px" : "400px",
            objectFit: "contain",
          }}
          unoptimized
        />
      </div>
      )}

      <div
        className="relative mx-auto"
        style={{
          width: WRAP_WIDTH,
          height: isMobile ? 56 : 110,
          overflow: "visible",
          position: "relative",
          WebkitMaskImage: isMobile 
            ? "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 10%, black 25%, black 75%, rgba(0,0,0,0.3) 90%, transparent 100%)"
            : "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          maskImage: isMobile
            ? "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 10%, black 25%, black 75%, rgba(0,0,0,0.3) 90%, transparent 100%)"
            : "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <div style={trackStyle}>
          {track.map((w, i) => (
            <span 
              key={i} 
              style={getSpanStyle(i)}
            >
              {w}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
