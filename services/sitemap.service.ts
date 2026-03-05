/**
 * Sitemap Service
 * Handles dynamic sitemap updates and revalidation
 */

import { revalidatePath } from 'next/cache';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihubvietnam.com';

/**
 * Trigger sitemap revalidation after blog post changes
 * Should be called after create/update/delete operations
 */
export async function revalidateSitemap() {
  try {
    // Revalidate the sitemap route
    revalidatePath('/api/sitemap.xml', 'layout');
    
    console.log('✅ Sitemap revalidated successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to revalidate sitemap:', error);
    return false;
  }
}

/**
 * Manually trigger sitemap regeneration
 * Can be called from API routes or server actions
 */
export async function generateSitemap() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/sitemap.xml`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Sitemap generation failed: ${response.status}`);
    }

    console.log('✅ Sitemap generated successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to generate sitemap:', error);
    return false;
  }
}

/**
 * Add blog post URL to sitemap
 * Returns the formatted sitemap entry
 */
export function formatBlogPostForSitemap(post: {
  slug: string;
  updatedAt?: string;
  createdAt?: string;
}) {
  const lastmod = post.updatedAt
    ? new Date(post.updatedAt).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  return `  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
}

/**
 * Check if sitemap cache is still valid
 * Returns true if cache should be invalidated
 */
export function shouldInvalidateSitemapCache(): boolean {
  // This could check if it's been more than 1 hour since last update
  const lastUpdate = process.env.LAST_SITEMAP_UPDATE;
  if (!lastUpdate) return true;

  const now = Date.now();
  const lastTime = parseInt(lastUpdate);
  const oneHourInMs = 60 * 60 * 1000;

  return now - lastTime > oneHourInMs;
}
