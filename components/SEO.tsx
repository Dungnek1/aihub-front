/**
 * SEO Component - Enhanced metadata management for social media sharing
 * Specifically optimized for Zalo, Facebook, Twitter, and other platforms
 */
import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  locale?: string;
  publishedTime?: string;
  modifiedTime?: string;
  siteName?: string;
  noIndex?: boolean;
}

export function generateSEOMetadata(props: SEOProps): Metadata {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihubvietnam.com';
  const OG_VERSION = process.env.NEXT_PUBLIC_OG_VERSION || 'v5-zalo-fix';
  
  const {
    title,
    description,
    keywords = [],
    author = 'AIHub Vietnam',
    image,
    url,
    type = 'website',
    locale = 'vi',
    publishedTime,
    modifiedTime,
    siteName = 'AIHub Vietnam',
    noIndex = false,
  } = props;

  // Generate multiple OG image URLs for better compatibility
  const defaultOgImage = `${SITE_URL}/og-image.png?v=${OG_VERSION}&t=${Date.now()}&cache=false`;
  const zaloOptimizedImage = `${SITE_URL}/og-image.png?v=${OG_VERSION}&platform=zalo&t=${Date.now()}&cache=no`;
  const customOgImage = image || defaultOgImage;

  // Ensure description is properly formatted for social media
  const cleanDescription = description
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 300);

  const finalUrl = url || `${SITE_URL}/${locale}`;
  const ogLocale = locale === 'en' ? 'en_US' : 'vi_VN';

  return {
    title: {
      default: title,
      template: '%s | AIHub Vietnam',
    },
    description: cleanDescription,
    keywords: [...keywords, 'AI Vietnam', 'Artificial Intelligence', 'AIHub'],
    authors: [{ name: author, url: SITE_URL }],
    creator: author,
    publisher: siteName,
    robots: noIndex 
      ? { index: false, follow: false }
      : { 
          index: true, 
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: {
      title,
      description: cleanDescription,
      url: finalUrl,
      siteName,
      type: type as any,
      locale: ogLocale,
      images: [
        {
          url: customOgImage,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/png',
        },
        // Add Zalo-specific optimized image
        {
          url: zaloOptimizedImage,
          width: 1200,
          height: 630,
          alt: `${title} - Zalo Optimized`,
          type: 'image/png',
        },
        // Add backup with different parameters
        {
          url: `${SITE_URL}/og-image.png?title=${encodeURIComponent(title)}&t=${Date.now()}`,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/png',
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(type === 'article' && {
        authors: [author],
        section: 'Technology',
        tags: keywords,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: cleanDescription,
      images: [customOgImage],
      creator: '@aihubvietnam',
      site: '@aihubvietnam',
    },
    alternates: {
      canonical: finalUrl,
      languages: {
        'vi': `${SITE_URL}/vi`,
        'en': `${SITE_URL}/en`,
      },
    },
    other: {
      // Zalo-specific meta tags
      'zalo:title': title,
      'zalo:description': cleanDescription,
      'zalo:image': zaloOptimizedImage,
      'za:title': title,
      'za:description': cleanDescription,
      'za:image': zaloOptimizedImage,
      // Additional meta tags for better compatibility
      'og:image:secure_url': customOgImage.replace('http:', 'https:'),
      'og:updated_time': modifiedTime || new Date().toISOString(),
      // Platform-specific optimizations
      'platform:zalo': 'optimized',
      'cache:control': 'no-cache-for-zalo',
    },
  };
}

/**
 * Generate JSON-LD structured data for better SEO
 */
export function generateStructuredData(props: SEOProps & { category?: string }) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihubvietnam.com';
  
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': props.type === 'article' ? 'Article' : 'WebSite',
    name: props.title,
    description: props.description,
    url: props.url || `${SITE_URL}/${props.locale || 'vi'}`,
    image: props.image || `${SITE_URL}/og-image.png`,
    publisher: {
      '@type': 'Organization',
      name: 'AIHub Vietnam',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/frame-83.png`,
      },
    },
  };

  if (props.type === 'article') {
    return {
      ...baseStructuredData,
      '@type': 'Article',
      headline: props.title,
      author: {
        '@type': 'Person',
        name: props.author || 'AIHub Vietnam',
      },
      datePublished: props.publishedTime,
      dateModified: props.modifiedTime || props.publishedTime,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': props.url,
      },
      ...(props.category && {
        articleSection: props.category,
      }),
    };
  }

  return baseStructuredData;
}

/**
 * Hook to get platform-specific SEO optimizations
 */
export function usePlatformSEO(userAgent?: string) {
  const platform = detectPlatform(userAgent);
  
  return {
    platform,
    isZalo: platform === 'zalo',
    isFacebook: platform === 'facebook',
    isTwitter: platform === 'twitter',
    isCrawler: platform !== 'unknown',
    cacheStrategy: platform === 'zalo' ? 'no-cache' : 'cache-ok',
  };
}

function detectPlatform(userAgent?: string): string {
  if (!userAgent) return 'unknown';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('zalo') || ua.includes('zalopc')) return 'zalo';
  if (ua.includes('facebookexternalhit')) return 'facebook';
  if (ua.includes('twitterbot')) return 'twitter';
  if (ua.includes('linkedinbot')) return 'linkedin';
  if (ua.includes('whatsapp')) return 'whatsapp';
  if (ua.includes('telegrambot')) return 'telegram';
  if (ua.includes('discordbot')) return 'discord';
  
  return 'unknown';
}

export default generateSEOMetadata;