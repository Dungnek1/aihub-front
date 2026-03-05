import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihubvietnam.com';

/**
 * Robots.txt - Metadata Route
 * Specifies crawl rules for search engines and social media crawlers
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/admin', '/api/', '/_next/', '/private'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'facebookexternalhit',
        allow: ['/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'Twitterbot',
        allow: ['/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'LinkedInBot',
        allow: ['/'],
        crawlDelay: 1,
      },
      {
        // Zalo and other social media crawlers
        userAgent: 'ZaloPC-win32',
        allow: ['/'],
        crawlDelay: 1,
      },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/api/sitemap.xml`,
    ],
  };
}
