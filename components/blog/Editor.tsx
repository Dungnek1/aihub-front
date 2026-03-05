"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { useEffect, useState, useMemo } from "react";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function Editor({
  value,
  onChange,
}: {
  value: string;
  onChange: (content: string) => void;
}) {
  const [hljsLoaded, setHljsLoaded] = useState(false);
  const [hljsReady, setHljsReady] = useState(false);

  useEffect(() => {
    // Check if hljs is already loaded
    if (typeof window !== "undefined" && (window as any).hljs) {
      setHljsLoaded(true);
      setHljsReady(true);
      return;
    }

    // Load highlight.js
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js";
    script.async = true;
    script.onload = () => {
      // Wait a bit to ensure hljs is fully initialized
      setTimeout(() => {
        if (typeof window !== "undefined" && (window as any).hljs) {
          setHljsLoaded(true);
          setHljsReady(true);
        } else {
          console.warn("highlight.js loaded but not available on window");
      setHljsLoaded(true);
          setHljsReady(false);
        }
      }, 100);
    };
    script.onerror = () => {
      // If highlight.js fails to load, still allow editor to render without syntax highlighting
      console.warn("Failed to load highlight.js, continuing without syntax highlighting");
      setHljsLoaded(true);
      setHljsReady(false);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script if component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      /* Quill Dark Theme */
      .ql-toolbar {
        background-color: #1a1f2e !important;
        border: 1px solid #334155 !important;
        border-top-left-radius: 0.75rem;
        border-top-right-radius: 0.75rem;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        -webkit-overflow-scrolling: touch;
      }
      
      /* Mobile: Toolbar scrollable */
      @media (max-width: 640px) {
        .ql-toolbar {
          display: flex !important;
          flex-wrap: nowrap !important;
          white-space: nowrap !important;
          padding: 8px !important;
        }
        
        .ql-toolbar .ql-formats {
          display: inline-flex !important;
          align-items: center !important;
          margin-right: 4px !important;
          flex-shrink: 0 !important;
        }
        
        /* Hide font picker on mobile - too wide */
        .ql-toolbar .ql-font {
          display: none !important;
        }
        
        /* Hide size picker on mobile - too wide */
        .ql-toolbar .ql-size {
          display: none !important;
        }
        
        /* Make buttons smaller on mobile */
        .ql-toolbar button,
        .ql-toolbar .ql-picker {
          padding: 4px !important;
          width: 28px !important;
          height: 28px !important;
        }
        
        .ql-toolbar .ql-picker-label {
          padding: 4px 6px !important;
          font-size: 12px !important;
        }
        
        /* Color pickers - make them smaller */
        .ql-toolbar .ql-color,
        .ql-toolbar .ql-background {
          width: auto !important;
        }
      }
      
      .ql-container {
        background-color: #0f172a !important;
        border: 1px solid #334155 !important;
        border-bottom-left-radius: 0.75rem;
        border-bottom-right-radius: 0.75rem;
        min-height: 400px;
      }
      
      /* Mobile: Container responsive */
      @media (max-width: 640px) {
        .ql-container {
          min-height: 300px !important;
        }
        
        .ql-editor {
          padding: 12px !important;
          font-size: 16px !important; /* Prevent zoom on iOS */
        }
      }
      
      .ql-editor {
        color: #e5e7eb !important;
        font-size: 14px;
      }
      
      .ql-editor.ql-blank::before {
        color: #6b7280 !important;
      }
      
      .ql-snow .ql-stroke {
        stroke: #d1d5db !important;
      }
      
      .ql-snow .ql-fill {
        fill: #d1d5db !important;
      }
      
      .ql-snow .ql-picker-label {
        color: #d1d5db !important;
      }
      
      .ql-toolbar.ql-snow .ql-picker-option {
        color: #0b0d11 !important;
      }
      
      .ql-toolbar.ql-snow .ql-picker-option:checked,
      .ql-toolbar.ql-snow .ql-picker-option:hover,
      .ql-toolbar.ql-snow .ql-picker-item:checked,
      .ql-toolbar.ql-snow .ql-picker-item:hover,
      .ql-toolbar.ql-snow .ql-picker-label:hover {
        color: #06b6d4 !important;
      }
      
      .ql-snow .ql-stroke.ql-fill {
        fill: #d1d5db !important;
      }
      
      .ql-picker {
        color: #d1d5db !important;
      }
      
      .ql-toolbar.ql-snow button:hover,
      .ql-toolbar.ql-snow button:focus,
      .ql-toolbar.ql-snow button.ql-active,
      .ql-toolbar.ql-snow .ql-picker-label:hover,
      .ql-toolbar.ql-snow .ql-picker-item:hover,
      .ql-toolbar.ql-snow .ql-picker-item.ql-selected {
        color: #06b6d4 !important;
      }
      
      .ql-toolbar.ql-snow button:hover .ql-stroke,
      .ql-toolbar.ql-snow button:focus .ql-stroke,
      .ql-toolbar.ql-snow button.ql-active .ql-stroke,
      .ql-toolbar.ql-snow .ql-picker-label:hover .ql-stroke,
      .ql-toolbar.ql-snow .ql-picker-item:hover .ql-stroke,
      .ql-toolbar.ql-snow .ql-picker-item.ql-selected .ql-stroke {
        stroke: #06b6d4 !important;
      }
      
      .ql-toolbar.ql-snow button:hover .ql-fill,
      .ql-toolbar.ql-snow button:focus .ql-fill,
      .ql-toolbar.ql-snow button.ql-active .ql-fill,
      .ql-toolbar.ql-snow .ql-picker-label:hover .ql-fill,
      .ql-toolbar.ql-snow .ql-picker-item:hover .ql-fill,
      .ql-toolbar.ql-snow .ql-picker-item.ql-selected .ql-fill {
        fill: #06b6d4 !important;
      }
      
      /* Editor content dark theme */
      .ql-editor p, .ql-editor h1, .ql-editor h2, .ql-editor h3,
      .ql-editor h4, .ql-editor h5, .ql-editor h6 {
        color: #e5e7eb !important;
      }
      
      .ql-editor a {
        color: #06b6d4 !important;
      }
      
      .ql-editor pre {
        background-color: #020617 !important;
        color: #e2e8f0 !important;
        border: 1px solid #334155 !important;
        border-radius: 0.375rem;
        padding: 12px 16px !important;
        overflow-x: auto !important;
      }
      
      .ql-editor code {
        background-color: #1a1f2e !important;
        color: #06b6d4 !important;
        padding: 2px 4px;
        border-radius: 3px;
      }
      
      .ql-editor pre code {
        background-color: transparent !important;
        color: #e2e8f0 !important;
      }
      
      .ql-editor blockquote {
        border-left-color: #06b6d4 !important;
        color: #9ca3af !important;
      }
      
      .ql-editor ul, .ql-editor ol {
        color: #e5e7eb;
      }
      
      .ql-editor li {
        color: #e5e7eb;
      }
      
      .ql-snow a {
        color: #06b6d4 !important;
      }

      .ql-toolbar.ql-snow .ql-stroke {
        stroke: #d1d5db;
      }

      .ql-toolbar.ql-snow .ql-fill, .ql-toolbar.ql-snow .ql-stroke.ql-fill {
        fill: #d1d5db;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const modules = useMemo(() => {
    // Check if mobile
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    
    const baseModules: any = {
      toolbar: isMobile
        ? [
            // Mobile: Simplified toolbar without font and size pickers
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [
              { list: "ordered" },
              { list: "bullet" },
              { indent: "-1" },
              { indent: "+1" },
            ],
            [{ align: [] }],
            ["blockquote", "code-block"],
            ["link", "image"],
            ["clean"],
          ]
        : [
            // Desktop: Full toolbar
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      [{ align: [] }],
      ["blockquote", "code-block"],
      ["link", "image", "video"],
      ["clean"],
    ],
    };

    // Only add syntax module if highlight.js is ready
    if (hljsReady && typeof window !== "undefined" && (window as any).hljs) {
      baseModules.syntax = {
          highlight: (text: string) => {
            try {
            const hljs = (window as any).hljs;
            if (hljs && hljs.highlightAuto) {
              return hljs.highlightAuto(text).value;
              }
              return text;
            } catch (error) {
            console.warn("Syntax highlighting error:", error);
              return text;
            }
          },
      };
        }

    return baseModules;
  }, [hljsReady]);

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "script",
    "list",
    "indent",
    "align",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
  ];

  // Don't render ReactQuill until we've attempted to load highlight.js
  // (either successfully or failed, but we need to know the state)
  if (!hljsLoaded) {
    return (
      <div className="rounded-xl overflow-hidden bg-[#0f172a] border border-[#334155] min-h-[400px] flex items-center justify-center">
        <div className="text-gray-400">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder="Write your blog content here..."
      />
    </div>
  );
}
