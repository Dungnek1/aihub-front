/**
 * Enhanced OG Image Generator for dynamic social sharing
 * Specifically optimized for Zalo, Facebook, Twitter, and other platforms
 */

export interface OGImageOptions {
  title: string;
  description?: string;
  image?: string;
  author?: string;
  publishedAt?: string;
  platform?: string;
  locale?: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihubvietnam.com';
const OG_VERSION = process.env.NEXT_PUBLIC_OG_VERSION || 'v5-zalo-fix';

/**
 * Generate platform-optimized OG image URL
 * Includes cache busting and platform-specific optimizations
 */
export function generateOGImageURL(options: OGImageOptions): string {
  const platform = options.platform || 'generic';
  const timestamp = Date.now();
  
  // If there's already a cover image, use it directly with optimization
  if (options.image) {
    // Ensure it's a full URL
    if (options.image.startsWith('http')) {
      // Add cache busting for social media platforms
      const separator = options.image.includes('?') ? '&' : '?';
      return `${options.image}${separator}v=${OG_VERSION}&platform=${platform}&t=${timestamp}`;
    }
    // If it's just an ID, construct the full URL
    if (options.image.includes('/')) {
      return `${process.env.NEXT_PUBLIC_API_URL}/${options.image}?v=${OG_VERSION}&platform=${platform}&t=${timestamp}`;
    }
  }

  // For Zalo, use static OG image to ensure reliability
  if (platform === 'zalo') {
    return `${SITE_URL}/og-image.png?v=${OG_VERSION}&platform=zalo&t=${timestamp}&cache=false&zalo=1`;
  }

  // Try to generate OG image using dynamic route, with fallback
  try {
    const params = new URLSearchParams({
      title: options.title || 'AIHub Vietnam',
      description: options.description || 'Khám phá tương lai của trí tuệ nhân tạo',
      author: options.author || 'AIHub Community',
      platform: platform,
      v: OG_VERSION,
      t: timestamp.toString(),
    });

    // Return dynamic API URL with fallback
    return `${SITE_URL}/api/og?${params.toString()}`;
  } catch (error) {
    console.warn('Failed to generate dynamic OG URL, using fallback:', error);
    // Fallback to static image with cache busting
    return `${SITE_URL}/og-image.png?v=${OG_VERSION}&platform=${platform}&t=${timestamp}&fallback=true`;
  }
}

/**
 * Enhanced text extraction from HTML content
 * Optimized for social media descriptions with better formatting
 */
export function extractTextFromHTML(html: string, maxLength: number = 300): string {
  if (!html) return '';

  // Remove HTML tags and clean up text more thoroughly
  const plainText = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags
    .replace(/<[^>]*>/g, ' ') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  // Ensure the text ends at a word boundary for better readability
  if (plainText.length > maxLength) {
    const truncated = plainText.substring(0, maxLength - 3);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > maxLength * 0.8) {
      return truncated.substring(0, lastSpaceIndex) + '...';
    }
    
    return truncated + '...';
  }

  return plainText;
}

/**
 * Generate comprehensive OG metadata for blog posts with platform optimization
 */
export function generateBlogPostOGMetadata(post: {
  title: string;
  slug: string;
  bodyHtml?: string;
  coverImageId?: string;
  description?: string;
  category?: { name: string };
  createdAt?: string;
  updatedAt?: string;
}, platform?: string, locale?: string) {
  const description = post.description || extractTextFromHTML(post.bodyHtml || '');
  const timestamp = Date.now();
  
  // Generate multiple image options for better compatibility
  const images = [];
  
  // 1. Static OG image (most reliable for Zalo)
  const staticOgImage = `${SITE_URL}/og-image.png?v=${OG_VERSION}&platform=${platform || 'generic'}&t=${timestamp}&cache=false`;
  images.push({
    url: staticOgImage,
    width: 1200,
    height: 630,
    alt: `${post.title} - AIHub Vietnam`,
    type: 'image/png',
  });

  // 2. Cover image if available
  if (post.coverImageId) {
    const coverImage = `${process.env.NEXT_PUBLIC_API_URL}/${post.coverImageId}?v=${OG_VERSION}&platform=${platform || 'generic'}&t=${timestamp}`;
    images.push({
      url: coverImage,
      width: 1200,
      height: 630,
      alt: post.title,
      type: 'image/jpeg',
    });
  }

  // 3. Dynamic OG image as backup
  if (platform !== 'zalo') { // Skip dynamic for Zalo to avoid issues
    const dynamicOgImage = generateOGImageURL({
      title: post.title,
      description,
      author: post.category?.name || 'AIHub Community',
      platform,
      locale,
    });
    images.push({
      url: dynamicOgImage,
      width: 1200,
      height: 630,
      alt: `${post.title} - Dynamic`,
      type: 'image/png',
    });
  }

  return {
    title: post.title,
    description,
    images,
    url: `${SITE_URL}/${locale || 'vi'}/blog/${post.slug}`,
    type: 'article',
    publishedTime: post.createdAt,
    modifiedTime: post.updatedAt || post.createdAt,
    authors: [post.category?.name || 'AIHub Community'],
    section: 'Technology',
    tags: ['AI', 'Technology', 'Blog'],
    locale: locale === 'en' ? 'en_US' : 'vi_VN',
  };
}

/**
 * Generate enhanced OG metadata for pages with platform optimization
 */
export function generatePageOGMetadata(page: {
  title: string;
  description: string;
  path: string;
  image?: string;
}, platform?: string, locale?: string) {
  const timestamp = Date.now();
  
  const images = [];
  
  // 1. Static OG image (primary)
  const staticOgImage = `${SITE_URL}/og-image.png?v=${OG_VERSION}&platform=${platform || 'generic'}&page=true&t=${timestamp}&cache=false`;
  images.push({
    url: staticOgImage,
    width: 1200,
    height: 630,
    alt: `${page.title} - AIHub Vietnam`,
    type: 'image/png',
  });

  // 2. Custom image if provided
  if (page.image) {
    let customImage = page.image;
    if (!customImage.startsWith('http')) {
      customImage = `${SITE_URL}${customImage}`;
    }
    customImage += `?v=${OG_VERSION}&platform=${platform || 'generic'}&t=${timestamp}`;
    
    images.push({
      url: customImage,
      width: 1200,
      height: 630,
      alt: page.title,
      type: 'image/png',
    });
  }

  // 3. Dynamic OG image for non-Zalo platforms
  if (platform !== 'zalo') {
    const dynamicImage = generateOGImageURL({
      title: page.title,
      description: page.description,
      platform,
      locale,
    });
    images.push({
      url: dynamicImage,
      width: 1200,
      height: 630,
      alt: `${page.title} - Generated`,
      type: 'image/png',
    });
  }

  return {
    title: page.title,
    description: page.description,
    images,
    url: `${SITE_URL}${page.path}`,
    type: 'website',
    locale: locale === 'en' ? 'en_US' : 'vi_VN',
  };
}

/**
 * Get platform-specific cache control settings
 */
export function getPlatformCacheControl(platform?: string): string {
  switch (platform) {
    case 'zalo':
      return 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0';
    case 'facebook':
    case 'twitter':
      return 'public, max-age=300, s-maxage=300';
    default:
      return 'public, max-age=600, s-maxage=600';
  }
}

/**
 * Detect platform from User-Agent string
 */
export function detectSocialPlatform(userAgent?: string): string {
  if (!userAgent) return 'generic';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('zalo') || ua.includes('zalopc')) return 'zalo';
  if (ua.includes('facebookexternalhit')) return 'facebook';
  if (ua.includes('twitterbot')) return 'twitter';
  if (ua.includes('linkedinbot')) return 'linkedin';
  if (ua.includes('whatsapp')) return 'whatsapp';
  if (ua.includes('telegrambot')) return 'telegram';
  if (ua.includes('discordbot')) return 'discord';
  
  return 'generic';
}
