import { NextResponse } from 'next/server';
import httpServerClient from '@/services/http.server';
import { IApiResponse } from '@/types/api.types';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  updatedAt?: string;
  createdAt?: string;
  status?: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihubvietnam.com';
const LOCALES = ['vi', 'en'];

/**
 * Generate dynamic sitemap.xml with all pages
 */
export async function GET() {
  try {
    // Fetch all published blog posts
    let allPosts: BlogPost[] = [];
    let skip = 0;
    const take = 1000;
    let hasMore = true;

    while (hasMore) {
      // Default to PUBLISHED status for community blog posts
      const status = 'PUBLISHED';
      const response = await httpServerClient.get<IApiResponse<BlogPost[]>>(
        `/blog/filter?status=${status}&skip=${skip}&take=${take}`
      );

      const posts = Array.isArray(response?.data?.data) 
        ? response.data.data 
        : Array.isArray(response?.data) 
        ? response.data 
        : [];
      if (posts.length === 0) {
        hasMore = false;
      } else {
        allPosts = [...allPosts, ...posts];
        skip += take;
      }
    }

    // Filter only published posts
    const publishedPosts = allPosts.filter((post) => post.status === 'PUBLISHED' || !post.status);

    // Generate sitemap entries
    let sitemapContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemapContent += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    sitemapContent += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

    // Add homepage for each locale
    LOCALES.forEach((locale) => {
      sitemapContent += `  <url>\n`;
      sitemapContent += `    <loc>${SITE_URL}/${locale}</loc>\n`;
      sitemapContent += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      sitemapContent += `    <changefreq>daily</changefreq>\n`;
      sitemapContent += `    <priority>1.0</priority>\n`;
      sitemapContent += `  </url>\n`;
    });

    // Add blog pages for each locale
    LOCALES.forEach((locale) => {
      sitemapContent += `  <url>\n`;
      sitemapContent += `    <loc>${SITE_URL}/${locale}/blog</loc>\n`;
      sitemapContent += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      sitemapContent += `    <changefreq>daily</changefreq>\n`;
      sitemapContent += `    <priority>0.8</priority>\n`;
      sitemapContent += `  </url>\n`;
    });

    // Add individual blog posts for each locale
    publishedPosts.forEach((post) => {
      LOCALES.forEach((locale) => {
        const lastmod = post.updatedAt 
          ? new Date(post.updatedAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        sitemapContent += `  <url>\n`;
        sitemapContent += `    <loc>${SITE_URL}/${locale}/blog/${post.slug}</loc>\n`;
        sitemapContent += `    <lastmod>${lastmod}</lastmod>\n`;
        sitemapContent += `    <changefreq>weekly</changefreq>\n`;
        sitemapContent += `    <priority>0.7</priority>\n`;
        sitemapContent += `  </url>\n`;
      });
    });

    // Add other static pages
    const staticPages = [
      { path: '/ai-tools', priority: 0.9, changefreq: 'weekly' },
      { path: '/news', priority: 0.8, changefreq: 'daily' },
      { path: '/profile', priority: 0.6, changefreq: 'monthly' },
    ];

    staticPages.forEach((page) => {
      LOCALES.forEach((locale) => {
        sitemapContent += `  <url>\n`;
        sitemapContent += `    <loc>${SITE_URL}/${locale}${page.path}</loc>\n`;
        sitemapContent += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
        sitemapContent += `    <changefreq>${page.changefreq}</changefreq>\n`;
        sitemapContent += `    <priority>${page.priority}</priority>\n`;
        sitemapContent += `  </url>\n`;
      });
    });

    sitemapContent += '</urlset>';

    return new NextResponse(sitemapContent, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Failed to generate sitemap:', error);

    // Return a minimal sitemap on error
    const minimalSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/vi</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/en</loc>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new NextResponse(minimalSitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes on error
      },
      status: 200,
    });
  }
}
