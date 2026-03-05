/**
 * Normalize image URL for media/uploaded assets
 * Handles both full URLs and relative paths returned from the media service
 */
export function normalizeMediaUrl(
  url: string | null | undefined,
  fallback?: string
): string {
  if (!url) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error(
        "NEXT_PUBLIC_BACKEND_URL environment variable is required"
      );
    }
    return fallback || `${backendUrl}/default/placeholder.png`;
  }

  // Get backend origin for replacement
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL environment variable is required");
  }
  let backendOrigin: string;
  try {
    backendOrigin = new URL(apiUrl).origin;
  } catch {
    backendOrigin = apiUrl.replace(/\/+$/, "");
  }

  // Clean up URL first - remove any duplicate prefixes
  let cleanUrl = url.trim();

  // Handle cases like "/https://domain.com/path" where BE prepends a slash before full URL
  // Strip only the slash(es) that sit directly in front of an absolute URL scheme
  if (/^\/+https?:\/\//i.test(cleanUrl)) {
    cleanUrl = cleanUrl.replace(/^\/+/, "");
  }

  // Handle cases like https://hostA.com/https://hostB.com/path
  const dupOriginRegex = /^(https?:\/\/[^/]+)\/(https?:\/\/.+)$/;
  while (dupOriginRegex.test(cleanUrl)) {
    cleanUrl = cleanUrl.replace(dupOriginRegex, "$2");
  }

  // STEP 1: Handle duplicate URLs (e.g., http://localhost:3000/http://localhost:3000/image/...)
  // Extract the actual path from duplicate URLs
  if (cleanUrl.includes("http://") || cleanUrl.includes("https://")) {
    // Check if URL contains multiple http:// patterns (duplicate)
    const urlMatches = cleanUrl.match(/(https?:\/\/[^\s]+)/g);
    if (urlMatches && urlMatches.length > 1) {
      // Use the last URL (the actual one, not the duplicate prefix)
      const lastMatch = urlMatches[urlMatches.length - 1];
      if (lastMatch) {
        cleanUrl = lastMatch;
      }
    }
  }

  // STEP 2: If URL contains backend origin, preserve the original protocol (http/https) from the URL
  // This handles cases where backend API returns URLs with different origin than configured in env
  // Extract backend origin from env to compare (but preserve protocol from original URL)
  let backendOriginFromEnv: string;
  try {
    backendOriginFromEnv = new URL(apiUrl).origin;
  } catch {
    // If parsing fails, try to extract origin manually
    const match = apiUrl.match(/^(https?:\/\/[^/]+)/);
    backendOriginFromEnv = match?.[1] ?? apiUrl.replace(/\/+$/, "");
  }

  // Extract hostname and port from backend origin (without protocol)
  let backendHost: string;
  try {
    const backendUrlObj = new URL(backendOriginFromEnv);
    backendHost = `${backendUrlObj.hostname}${backendUrlObj.port ? `:${backendUrlObj.port}` : ''}`;
  } catch {
    const match = backendOriginFromEnv.match(/https?:\/\/([^/]+)/);
    backendHost = match?.[1] ?? backendOriginFromEnv.replace(/https?:\/\//, '');
  }

  // Check if URL contains a different origin than the one in env (e.g., hardcoded IP or localhost)
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    try {
      const urlObj = new URL(cleanUrl);
      const urlHost = `${urlObj.hostname}${urlObj.port ? `:${urlObj.port}` : ''}`;
      const urlProtocol = urlObj.protocol; // Keep original protocol (http: or https:)
      
      // If the URL host matches backend host but might have different protocol, preserve original protocol
      // If host is different, replace with backend host but keep original protocol
      if (urlHost === backendHost) {
        // Host matches, return URL as-is (preserve original protocol)
        // IMPORTANT: Ensure protocol is preserved (http:// not upgraded to https://)
        const finalUrl = cleanUrl;
        // Removed verbose logging - only log errors if needed
        return finalUrl;
      } else {
        // Host is different, replace host but keep original protocol
        // IMPORTANT: Preserve original protocol from URL, don't use backend protocol
        const normalized = `${urlProtocol}//${backendHost}${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
        // Removed verbose logging - only log errors if needed
        return normalized;
      }
    } catch {
      // If URL parsing fails, try regex replace for common patterns
      // Replace host but preserve protocol
      const originPattern = /(https?:\/\/)([^/]+)/;
      if (originPattern.test(cleanUrl)) {
        const match = cleanUrl.match(originPattern);
        if (match) {
          const protocol = match[1]; // Keep original protocol
          cleanUrl = cleanUrl.replace(originPattern, `${protocol}${backendHost}`);
          // Remove any double slashes (but keep ://)
          cleanUrl = cleanUrl.replace(/([^:]\/)\/+/g, "$1");
          return cleanUrl;
        }
      }
    }
  }

  // Helper to strip leading api prefixes (api/, api/v1/, /api/v1/, etc.)
function stripApiAndOrigin(rawPath: string) {
  let path = rawPath.trim();

  // Remove any duplicated origins like https://a.com/https://b.com/path
  const dupOriginRegex = /(https?:\/\/[^/]+)\/(https?:\/\/.+)/;
  while (dupOriginRegex.test(path)) {
    path = path.replace(dupOriginRegex, "$2");
  }

  // If path itself is an absolute URL, drop the origin and keep pathname
  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const parsed = new URL(path);
      path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      // ignore parse errors, continue below
    }
  }

  return path.replace(/^\/?api(\/v\d+)?\//, "/").replace(/^\/+/, "/");
}

  // STEP 3: If it's already a full URL (not localhost:3000 or localhost:9000), normalize its pathname
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    try {
      const parsed = new URL(cleanUrl);
      const normalizedPath = stripApiAndOrigin(
        `${parsed.pathname}${parsed.search}${parsed.hash}`
      );
      return `${parsed.origin}${normalizedPath}`;
    } catch {
      // fall through to relative handling below
    }
  }

  // STEP 4: If it's a relative path, prepend backend origin
  const cleanPath = stripApiAndOrigin(cleanUrl);
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    return cleanPath;
  }
  // Ensure no double slashes in final URL (but keep ://)
  const finalUrl = `${backendOrigin}/${cleanPath}`.replace(
    /([^:]\/)\/+/g,
    "$1"
  );
  return finalUrl;
}

/**
 * Normalize image URL for external APIs (non-media)
 * These APIs usually return full URLs already, so we mainly clean duplicates
 * and only fall back to media normalization when necessary.
 */
export function normalizeImageUrl(
  url: string | null | undefined,
  fallback?: string
): string {
  if (!url) {
    return fallback ? normalizeMediaUrl(fallback) : "";
  }

  let cleanUrl = url.trim();

  // Remove leading slashes before absolute URLs (e.g., /https://domain.com/img.png)
  if (/^\/+https?:\/\//i.test(cleanUrl)) {
    cleanUrl = cleanUrl.replace(/^\/+/, "");
  }

  const dupOriginRegex = /^(https?:\/\/[^/]+)\/(https?:\/\/.+)$/;
  while (dupOriginRegex.test(cleanUrl)) {
    cleanUrl = cleanUrl.replace(dupOriginRegex, "$2");
  }

  // If still not absolute, fall back to media normalization (will prepend backend origin)
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    return normalizeMediaUrl(cleanUrl);
  }

  return cleanUrl;
}

/**
 * Normalize avatar URL - specifically for user avatars
 * @param url - Avatar URL (can be full URL, relative path, or null/undefined)
 * @returns Normalized full URL or null if not provided
 */
export function normalizeAvatarUrl(
  url: string | null | undefined
): string | null {
  if (!url) return null;
  return normalizeMediaUrl(url);
}

/**
 * Get cover image URL for blog posts
 * @param coverImageId - Cover image ID or filename
 * @param fallback - Fallback image path (default: blog placeholder)
 * @returns Full URL to the cover image
 */
export function getCoverImageUrl(
  coverImageId?: string | null,
  fallback: string = "/default/blog-placeholder.png"
): string {
  if (!coverImageId) {
    return normalizeMediaUrl(fallback);
  }
  return normalizeMediaUrl(coverImageId);
}
