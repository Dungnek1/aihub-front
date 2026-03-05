/**
 * HTML Sanitization Utilities
 * Helper functions for sanitizing HTML content before rendering
 * Uses DOMPurify for robust XSS protection
 */

import DOMPurify from "isomorphic-dompurify";
import { normalizeMediaUrl } from "./image.utils";

/**
 * Slugify text for heading IDs
 */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Split accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}


/**
 * Default allowed tags for blog/news content
 * Safe HTML tags that preserve formatting while preventing XSS
 */
const DEFAULT_ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "strike",
  "a",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "code",
  "pre",
  "img",
  "div",
  "span",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
  "figure", // For image containers with captions
  "figcaption", // For image captions
];

/**
 * Default allowed attributes
 */
const DEFAULT_ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "class",
  "style",
  "width",
  "height",
  "data-caption", // Allow data-caption for image captions
];

/**
 * Sanitize HTML content using DOMPurify
 * Removes potentially dangerous HTML/scripts while preserving safe formatting
 *
 * @param html - HTML string to sanitize
 * @param options - Optional DOMPurify configuration
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(
  html: string | null | undefined,
  options?: {
    allowedTags?: string[];
    allowedAttributes?: string[];
    strict?: boolean; // If true, use stricter sanitization
  }
): string {
  if (!html) return "";

  // Configure DOMPurify with safe defaults
  const config: DOMPurify.Config = {
    ALLOWED_TAGS: options?.allowedTags || DEFAULT_ALLOWED_TAGS,
    ALLOWED_ATTR: options?.allowedAttributes || DEFAULT_ALLOWED_ATTR,
    // Prevent XSS attacks
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus"],
    // Sanitize URLs to prevent javascript: and data: attacks
    ALLOW_DATA_ATTR: false,
    // Keep relative URLs safe
    ALLOW_UNKNOWN_PROTOCOLS: false,
    // Return DOM nodes instead of string for better performance (we'll convert back)
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
  };

  // Stricter mode for user-generated content (blog posts)
  if (options?.strict) {
    config.ALLOWED_TAGS = [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "strike",
      "a",
      "ul",
      "ol",
      "li",
      "h1", // Allow h1 headings
      "h2", // Allow h2 headings
      "h3", // Allow h3 headings
      "h4", // Allow h4 headings
      "h5", // Allow h5 headings
      "h6", // Allow h6 headings
      "blockquote",
      "code",
      "pre",
      "img", // Allow images in blog posts
      "figure", // Allow figure for image containers
      "figcaption", // Allow figcaption for image captions
      "div", // Allow div for structure
      "span", // Allow span for inline styling
      "table", // Allow table
      "thead", // Allow table header group
      "tbody", // Allow table body group
      "tr", // Allow table row
      "td", // Allow table cell
      "th", // Allow table header cell
      "colgroup", // Allow colgroup
      "col", // Allow col
    ];
    config.ALLOWED_ATTR = [
      "href",
      "target",
      "rel",
      "src", // Allow src attribute for images
      "alt", // Allow alt text for images
      "title", // Allow title for images
      "width", // Allow width for images
      "height", // Allow height for images
      "class", // Allow class for styling
      "style", // Allow style (will be sanitized by DOMPurify)
      "data-caption", // Allow data-caption for image captions
      "id", // Allow id for headings
    ];
  }

  try {
    // Sanitize using DOMPurify
    const sanitized = DOMPurify.sanitize(html, config);
    return sanitized;
  } catch (error) {
    // Fallback to basic sanitization if DOMPurify fails
    console.error("DOMPurify sanitization failed, using fallback:", error);
    return stripHtmlTags(html); // Return plain text as fallback
  }
}

/**
 * Sanitize HTML for blog posts (user-generated content)
 * Uses stricter sanitization rules and normalizes image URLs
 *
 * @param html - HTML string from blog post
 * @returns Sanitized HTML string with normalized image URLs
 */
export function sanitizeBlogHtml(html: string | null | undefined): string {
  if (!html) return "";

  // Debug: Log input HTML info
  const imgCountBefore = (html.match(/<img/gi) || []).length;
  const h1CountBefore = (html.match(/<h1/gi) || []).length;
  const h2CountBefore = (html.match(/<h2/gi) || []).length;
  const ulCountBefore = (html.match(/<ul/gi) || []).length;
  const olCountBefore = (html.match(/<ol/gi) || []).length;
  const liCountBefore = (html.match(/<li/gi) || []).length;
  if (typeof window === "undefined") {
    // Server-side logging
    console.log(`[sanitizeBlogHtml] Input - length: ${html.length}, images: ${imgCountBefore}, h1: ${h1CountBefore}, h2: ${h2CountBefore}, ul: ${ulCountBefore}, ol: ${olCountBefore}, li: ${liCountBefore}`);
  }

  // First sanitize the HTML
  let sanitized = sanitizeHtml(html, { strict: true });

  // Debug: Log after sanitization
  const imgCountAfter = (sanitized.match(/<img/gi) || []).length;
  const h1CountAfter = (sanitized.match(/<h1/gi) || []).length;
  const h2CountAfter = (sanitized.match(/<h2/gi) || []).length;
  const ulCountAfter = (sanitized.match(/<ul/gi) || []).length;
  const olCountAfter = (sanitized.match(/<ol/gi) || []).length;
  const liCountAfter = (sanitized.match(/<li/gi) || []).length;
  if (typeof window === "undefined") {
    console.log(`[sanitizeBlogHtml] After sanitize - images: ${imgCountAfter}, h1: ${h1CountAfter}, h2: ${h2CountAfter}, ul: ${ulCountAfter}, ol: ${olCountAfter}, li: ${liCountAfter}`);
    if (imgCountBefore !== imgCountAfter) {
      console.warn(`[sanitizeBlogHtml] ⚠️ Image count changed: ${imgCountBefore} -> ${imgCountAfter}`);
    }
    if (h1CountBefore !== h1CountAfter) {
      console.warn(`[sanitizeBlogHtml] ⚠️ H1 count changed: ${h1CountBefore} -> ${h1CountAfter}`);
    }
    if (h2CountBefore !== h2CountAfter) {
      console.warn(`[sanitizeBlogHtml] ⚠️ H2 count changed: ${h2CountBefore} -> ${h2CountAfter}`);
    }
    if (ulCountBefore !== ulCountAfter) {
      console.warn(`[sanitizeBlogHtml] ⚠️ UL count changed: ${ulCountBefore} -> ${ulCountAfter}`);
    }
    if (olCountBefore !== olCountAfter) {
      console.warn(`[sanitizeBlogHtml] ⚠️ OL count changed: ${olCountBefore} -> ${olCountAfter}`);
    }
    if (liCountBefore !== liCountAfter) {
      console.warn(`[sanitizeBlogHtml] ⚠️ LI count changed: ${liCountBefore} -> ${liCountAfter}`);
    }
  }

  // Debug: Log after sanitize
  const imgCountAfterSanitize = (sanitized.match(/<img/gi) || []).length;
  if (typeof window === "undefined") {
    console.log(`[sanitizeBlogHtml] After sanitize - length: ${sanitized.length}, images: ${imgCountAfterSanitize}`);
    if (imgCountBefore !== imgCountAfterSanitize) {
      console.warn(`[sanitizeBlogHtml] ⚠️ Image count changed during sanitize: ${imgCountBefore} -> ${imgCountAfterSanitize}`);
    }
  }

  // Normalize image URLs in the HTML content (works on both server and client)
  // This handles cases where images have localhost:9000 or other hardcoded URLs
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.warn("NEXT_PUBLIC_BACKEND_URL is not set. Image URLs might not be normalized.");
      return sanitized;
    }

    let backendOrigin: string;
    try {
      backendOrigin = new URL(backendUrl).origin;
    } catch {
      backendOrigin = backendUrl.replace(/\/+$/, "");
    }

    // Use improved regex to find and replace img src attributes (works on server-side)
    // Pattern: <img ... src="..." ...> or <img ... src='...' ...>
    // This handles src attribute in any position within the img tag
    sanitized = sanitized.replace(
      /<img\s+([^>]*?)\ssrc=["']([^"']+)["']([^>]*?)>/gi,
      (match, before, src, after) => {
        try {
          // Check if it's already a full URL (http:// or https://)
          const isFullUrl = /^https?:\/\//i.test(src);

          let normalizedSrc = src;

          if (isFullUrl) {
            // If it's a full URL, only replace localhost URLs with configured backend URL
            // Keep other full URLs (external URLs) as-is
            if (/localhost:\d+/i.test(src)) {
              // Replace localhost:port with backend origin
              try {
                const urlObj = new URL(src);
                normalizedSrc = `${backendOrigin}${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
              } catch {
                // If URL parsing fails, use normalizeMediaUrl as fallback
                normalizedSrc = normalizeMediaUrl(src);
              }
            }
            // If it's a full URL but not localhost, keep it as-is (external URL)
          } else {
            // If it's a short-link (relative path), normalize it with base URL
            normalizedSrc = normalizeMediaUrl(src);
          }

          // Reconstruct img tag with normalized src, preserving all attributes (alt, width, height, style, data-caption, etc.)
          // Note: before and after contain all other attributes, so we preserve them
          return `<img ${before} src="${normalizedSrc}" ${after}>`;
        } catch (error) {
          // If normalization fails, return original match
          console.warn("Failed to normalize image URL:", src, error);
          return match;
        }
      }
    );

    // Also handle edge cases where src might be without quotes or in different format
    sanitized = sanitized.replace(
      /<img\s+([^>]*?)\ssrc=([^\s>]+)([^>]*?)>/gi,
      (match, before, src, after) => {
        // Only process if src doesn't already have quotes (already processed above)
        if (!src.startsWith('"') && !src.startsWith("'")) {
          try {
            const isFullUrl = /^https?:\/\//i.test(src);
            let normalizedSrc = src;

            if (isFullUrl && /localhost:\d+/i.test(src)) {
              try {
                const urlObj = new URL(src);
                normalizedSrc = `${backendOrigin}${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
              } catch {
                normalizedSrc = normalizeMediaUrl(src);
              }
            } else if (!isFullUrl) {
              normalizedSrc = normalizeMediaUrl(src);
            }

            return `<img ${before} src="${normalizedSrc}" ${after}>`;
          } catch (error) {
            console.warn("Failed to normalize image URL (no quotes):", src, error);
            return match;
          }
        }
        return match;
      }
    );

    // Remove inline font-family styles from editor to ensure web font is used
    // Pattern: style="...font-family:...;..." or style='...font-family:...;...'
    sanitized = sanitized.replace(
      /style=["']([^"']*font-family[^"']*)["']/gi,
      (match, styleContent) => {
        // Remove font-family from style attribute
        const newStyle = styleContent.replace(/font-family\s*:[^;]+;?/gi, "").trim();
        // Remove leading/trailing semicolons and spaces
        const cleanedStyle = newStyle.replace(/^[;\s]+|[;\s]+$/g, "");
        if (cleanedStyle) {
          return `style="${cleanedStyle}"`;
        }
        // If style is empty after removing font-family, remove the style attribute entirely
        return "";
      }
    );

    // Also handle style attributes that might be empty after font-family removal
    sanitized = sanitized.replace(/\s+style=["']\s*["']/gi, "");

    // Convert images with data-caption OR title attribute to figure/figcaption structure
    // Supports both React Quill (data-caption) and TipTap (title) formats
    sanitized = sanitized.replace(
      /<img\s+([^>]*?)>/gi,
      (match, attrs) => {
        // Check for caption in data-caption (React Quill) or title (TipTap) attributes
        const hasDataCaption = attrs.match(/data-caption=["']([^"']+)["']/i);
        const hasTitle = attrs.match(/title=["']([^"']+)["']/i);
        const hasAlt = attrs.match(/alt=["']([^"']+)["']/i);
        const hasAlign = attrs.match(/data-align=["']([^"']+)["']/i);

        // Get caption from either data-caption or title
        const caption = hasDataCaption ? hasDataCaption[1] : (hasTitle ? hasTitle[1] : null);
        const align = hasAlign ? hasAlign[1] : 'center';

        // If has caption, wrap in figure with figcaption
        if (caption) {
          // Remove data-caption and title from attributes (we'll show caption in figcaption)
          let attrsWithoutCaption = attrs
            .replace(/\s+data-caption=["'][^"']+["']/gi, '')
            .replace(/\s+title=["'][^"']+["']/gi, '')
            .trim();

          // Ensure alt is preserved
          if (hasAlt) {
            attrsWithoutCaption = attrsWithoutCaption.replace(/\s+alt=["'][^"']+["']/gi, '');
            attrsWithoutCaption = `${attrsWithoutCaption} alt="${hasAlt[1]}"`.trim();
          }

          // Wrap in figure with figcaption (use image-wrapper class for TipTap compatibility)
          return `<figure class="image-wrapper image-align-${align}"><img ${attrsWithoutCaption}><figcaption class="image-caption">${caption}</figcaption></figure>`;
        }

        // If has alt but no caption, optionally show alt as caption for better accessibility
        // This helps users see the alt text even if there's no explicit caption
        if (hasAlt && hasAlt[1]) {
          const altText = hasAlt[1];
          // Only show alt as caption if it's meaningful (not empty, not just filename)
          // Check if alt looks like a description (more than 10 chars, not just a filename)
          if (altText.length > 10 && !altText.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            // Wrap in figure with alt as caption for better accessibility
            return `<figure class="image-wrapper image-align-${align}"><img ${attrs}><figcaption class="image-caption">${altText}</figcaption></figure>`;
          }
        }
        return match;
      }
    );

    // Also handle images that might be inside paragraphs - extract them to figure if they have caption
    // This handles cases like <p><img data-caption="..."></p>
    sanitized = sanitized.replace(
      /<p[^>]*>([^<]*<img[^>]*data-caption=["'][^"']+["'][^>]*>[^<]*)<\/p>/gi,
      (match, content) => {
        // Extract the img tag and wrap it properly
        const imgMatch = content.match(/<img\s+([^>]*?)>/i);
        if (imgMatch) {
          const attrs = imgMatch[1];
          const captionMatch = attrs.match(/data-caption=["']([^"']+)["']/i);
          if (captionMatch) {
            const caption = captionMatch[1];
            let attrsWithoutCaption = attrs.replace(/\s+data-caption=["'][^"']+["']/gi, '').trim();
            return `<figure class="image-container"><img ${attrsWithoutCaption}><figcaption class="image-caption">${caption}</figcaption></figure>`;
          }
        }
        return match;
      }
    );

    // Inject IDs into headings (h1, h2, h3) for Table of Contents
    sanitized = sanitized.replace(/<(h[1-3])([^>]*)>(.*?)<\/\1>/gi, (match, tag, attrs, content) => {
      // If already has id, keep it
      if (attrs.match(/id=["'][^"']*["']/i)) return match;

      // Strip HTML tags from content to get pure text for slug
      const text = content.replace(/<[^>]+>/g, '').trim();
      if (!text) return match;

      const id = slugify(text);
      return `<${tag}${attrs} id="${id}">${content}</${tag}>`;
    });

    // Debug: Log final result
    const imgCountFinal = (sanitized.match(/<img/gi) || []).length;
    if (typeof window === "undefined") {
      console.log(`[sanitizeBlogHtml] Final - length: ${sanitized.length}, images: ${imgCountFinal}`);
      if (imgCountBefore !== imgCountFinal) {
        console.warn(`[sanitizeBlogHtml] ⚠️ Final image count differs from input: ${imgCountBefore} -> ${imgCountFinal}`);
      }
    }

    // Process on client-side if available (for additional DOM manipulation if needed)
    if (typeof window !== "undefined") {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = sanitized;

      // Additional client-side processing if needed (e.g., for complex cases)
      // For now, we rely on regex-based normalization above

      return tempDiv.innerHTML;
    }
  } catch (error) {
    // If normalization fails, return sanitized HTML as-is
    console.warn("Failed to normalize image URLs in blog HTML:", error);
  }

  return sanitized;
}

/**
 * Sanitize HTML for news posts (admin content)
 * Uses standard sanitization rules
 *
 * @param html - HTML string from news post
 * @returns Sanitized HTML string
 */
export function sanitizeNewsHtml(html: string | null | undefined): string {
  return sanitizeHtml(html, { strict: false });
}

/**
 * Strip HTML tags and return plain text
 * @param html - HTML string
 * @returns Plain text without HTML tags
 */
export function stripHtmlTags(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").trim();
}

/**
 * Truncate HTML content while preserving tags
 * @param html - HTML string
 * @param maxLength - Maximum character length
 * @param suffix - Suffix to add if truncated (default: "...")
 * @returns Truncated HTML string
 */
export function truncateHtml(
  html: string | null | undefined,
  maxLength: number,
  suffix: string = "..."
): string {
  if (!html) return "";

  const plainText = stripHtmlTags(html);
  if (plainText.length <= maxLength) return html;

  // Simple truncation - in production, consider using a library that preserves HTML structure
  return html.substring(0, maxLength) + suffix;
}
