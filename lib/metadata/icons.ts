/**
 * Shared favicon/icons configuration for all pages
 * Ensures consistent favicon across the entire application
 */

export const defaultIcons = {
  icon: [
    { url: "/favicon.ico", sizes: "any" },
    { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    { url: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
  ],
  apple: [
    { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  ],
  shortcut: "/favicon.ico",
};

