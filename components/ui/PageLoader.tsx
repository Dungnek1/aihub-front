"use client";

import { useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

interface PageLoaderProps {
  isLoading: boolean;
}

export function PageLoader({ isLoading }: PageLoaderProps) {
  useEffect(() => {
    if (isLoading) {
      NProgress.start();
    } else {
      NProgress.done();
    }

    return () => {
      NProgress.done();
    };
  }, [isLoading]);

  return null;
}

// Setup NProgress styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    #nprogress {
      pointer-events: none;
    }
    #nprogress .bar {
      background: #06b6d4;
      position: fixed;
      z-index: 9999;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
    }
    #nprogress .peg {
      display: block;
      position: absolute;
      right: 0px;
      width: 100px;
      height: 100%;
      box-shadow: 0 0 10px #06b6d4, 0 0 5px #06b6d4;
      opacity: 1;
      transform: rotate(3deg) translate(0px, -4px);
    }
    #nprogress .spinner {
      display: block;
      position: fixed;
      z-index: 9999;
      top: 15px;
      right: 15px;
    }
    #nprogress .spinner-icon {
      width: 18px;
      height: 18px;
      box-sizing: border-box;
      border: solid 2px transparent;
      border-top-color: #06b6d4;
      border-left-color: #06b6d4;
      border-radius: 50%;
      animation: nprogress-spinner 400ms linear infinite;
    }
    @keyframes nprogress-spinner {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

