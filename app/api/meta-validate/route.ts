import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';

/**
 * Meta Validation API - Enhanced for Zalo and other social media crawlers
 * GET: Validate single URL with specific user agent
 * POST: Test URL against multiple crawlers
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const platform = searchParams.get('platform') || 'facebook';
  const direct = searchParams.get('direct') === 'true';
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  // If direct=true, serve clean HTML for social crawlers
  if (direct) {
    try {
      const html = await generateDirectMetaHTML(url, platform);
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': platform === 'zalo' 
            ? 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0'
            : 'public, max-age=300, s-maxage=300',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Robots-Tag': 'noindex, nofollow',
          'X-Platform-Optimized': platform,
          'Vary': 'User-Agent',
        },
      });
    } catch (error) {
      console.error('Direct meta generation error:', error);
      return NextResponse.json({ error: 'Failed to generate direct meta' }, { status: 500 });
    }
  }

  try {
    // Choose user agent based on platform
    const userAgents = {
      facebook: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      twitter: 'Twitterbot/1.0',
      zalo: 'ZaloPC-win32',
      whatsapp: 'WhatsApp/2.0',
      linkedin: 'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com/)',
      telegram: 'TelegramBot (like TwitterBot)',
      discord: 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
    };

    const userAgent = userAgents[platform as keyof typeof userAgents] || userAgents.facebook;

    // Fetch the page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ 
        error: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        platform
      }, { status: 400 });
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract comprehensive metadata
    const metadata: Record<string, string> = {};
    const metaTags = document.querySelectorAll('meta');
    
    metaTags.forEach((tag) => {
      const property = tag.getAttribute('property') || tag.getAttribute('name');
      const content = tag.getAttribute('content');
      if (property && content) {
        metadata[property] = content;
      }
    });

    // Extract title and other key elements
    const title = document.querySelector('title')?.textContent || '';
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
    
    // Extract specific OG tags for easier access
    const ogData = {
      title: metadata['og:title'] || title,
      description: metadata['og:description'] || metadata['description'] || '',
      image: metadata['og:image'] || '',
      url: metadata['og:url'] || canonical || url,
      type: metadata['og:type'] || 'website',
      siteName: metadata['og:site_name'] || '',
    };

    // Response headers analysis
    const responseHeaders = Object.fromEntries(response.headers.entries());

    return NextResponse.json({
      url,
      platform,
      userAgent,
      status: response.status,
      redirected: response.redirected,
      finalUrl: response.url,
      title,
      canonical,
      ogData,
      allMetadata: metadata,
      headers: responseHeaders,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      url,
      platform,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, userAgent = 'facebookexternalhit/1.1' } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Test with different user agents to simulate various crawlers
    const crawlers = [
      { name: 'Facebook', agent: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)' },
      { name: 'Twitter', agent: 'Twitterbot/1.0' },
      { name: 'LinkedIn', agent: 'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com/)' },
      { name: 'Zalo', agent: 'ZaloPC-win32' },
      { name: 'WhatsApp', agent: 'WhatsApp/2.0' },
      { name: 'Telegram', agent: 'TelegramBot (like TwitterBot)' },
      { name: 'Discord', agent: 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)' },
    ];

    const results = await Promise.all(
      crawlers.map(async ({ name, agent }) => {
        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': agent,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Cache-Control': 'no-cache',
              'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
            },
          });

          const html = await response.text();
          const dom = new JSDOM(html);
          const document = dom.window.document;

          const metadata: Record<string, string> = {};
          const metaTags = document.querySelectorAll('meta');
          
          metaTags.forEach((tag) => {
            const property = tag.getAttribute('property') || tag.getAttribute('name');
            const content = tag.getAttribute('content');
            if (property && content) {
              metadata[property] = content;
            }
          });

          const ogData = {
            title: metadata['og:title'] || document.querySelector('title')?.textContent || '',
            description: metadata['og:description'] || metadata['description'] || '',
            image: metadata['og:image'] || '',
            url: metadata['og:url'] || url,
            type: metadata['og:type'] || 'website',
            siteName: metadata['og:site_name'] || '',
          };

          return {
            crawler: name,
            userAgent: agent,
            status: response.status,
            redirected: response.redirected,
            finalUrl: response.url,
            title: document.querySelector('title')?.textContent || '',
            ogData,
            allMetadata: metadata,
            headers: Object.fromEntries(response.headers.entries()),
          };
        } catch (error) {
          return {
            crawler: name,
            userAgent: agent,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    return NextResponse.json({
      originalUrl: url,
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => !r.error).length,
        failed: results.filter(r => r.error).length,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * Generate clean HTML for direct crawler access
 */
async function generateDirectMetaHTML(url: string, platform: string): Promise<string> {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihubvietnam.com';
  const OG_VERSION = process.env.NEXT_PUBLIC_OG_VERSION || 'v5-zalo-fix';
  
  // Parse URL to extract information
  const targetUrl = new URL(url);
  const pathParts = targetUrl.pathname.split('/').filter(Boolean);
  const locale = pathParts[0] || 'vi';
  const slug = pathParts[pathParts.length - 1];
  
  // Default metadata
  let metadata: any = {
    title: 'AIHub Vietnam - Nền tảng AI tiên tiến',
    description: 'Khám phá tương lai của trí tuệ nhân tạo với AIHub Vietnam. Tin tức AI mới nhất, công cụ AI hàng đầu, và cộng đồng AI Việt Nam.',
    image: `${SITE_URL}/og-image.png?v=${OG_VERSION}&platform=${platform}&t=${Date.now()}`,
    url: url,
    type: 'website',
    siteName: 'AIHub Vietnam',
    author: 'AIHub Vietnam',
    locale: locale === 'en' ? 'en_US' : 'vi_VN',
  };

  // Check if this is a blog post
  if (pathParts.includes('blog') && slug && slug !== 'blog') {
    try {
      // Dynamic import to avoid server-side issues
      const { getPostBySlug } = await import('@/services/server/blog.server');
      const post = await getPostBySlug(slug);
      
      if (post) {
        // Extract plain text description
        const plainDescription = post.bodyHtml 
          ? post.bodyHtml.replace(/<[^>]*>/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim()
                          .substring(0, 300) + '...'
          : post.category?.description || metadata.description;

        metadata = {
          ...metadata,
          title: `${post.title} | AIHub Vietnam`,
          description: plainDescription,
          type: 'article',
          author: post.content?.author?.name || 'AIHub Community',
          publishedTime: post.createdAt,
          modifiedTime: post.updatedAt || post.createdAt,
        };
      }
    } catch (error) {
      console.warn('Failed to load blog post for direct meta:', error);
    }
  }

  const isZalo = platform === 'zalo';
  const timestamp = Date.now();
  
  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <!-- Basic Meta -->
    <title>${metadata.title}</title>
    <meta name="description" content="${metadata.description}">
    <meta name="author" content="${metadata.author}">
    <meta name="robots" content="noindex, nofollow">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${metadata.title}">
    <meta property="og:description" content="${metadata.description}">
    <meta property="og:image" content="${metadata.image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:type" content="image/png">
    <meta property="og:url" content="${metadata.url}">
    <meta property="og:type" content="${metadata.type}">
    <meta property="og:site_name" content="${metadata.siteName}">
    <meta property="og:locale" content="${metadata.locale}">
    ${(metadata as any).publishedTime ? `<meta property="article:published_time" content="${(metadata as any).publishedTime}">` : ''}
    ${(metadata as any).modifiedTime ? `<meta property="article:modified_time" content="${(metadata as any).modifiedTime}">` : ''}
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${metadata.title}">
    <meta name="twitter:description" content="${metadata.description}">
    <meta name="twitter:image" content="${metadata.image}">
    <meta name="twitter:site" content="@aihubvietnam">
    <meta name="twitter:creator" content="@aihubvietnam">
    
    <!-- Zalo-specific optimizations -->
    ${isZalo ? `
    <meta name="zalo:title" content="${metadata.title}">
    <meta name="zalo:description" content="${metadata.description}">
    <meta name="zalo:image" content="${metadata.image}">
    <meta property="za:title" content="${metadata.title}">
    <meta property="za:description" content="${metadata.description}">
    <meta property="za:image" content="${metadata.image}">
    ` : ''}
    
    <!-- Cache busting for social crawlers -->
    <meta name="cache-control" content="no-cache">
    <meta name="pragma" content="no-cache">
    <meta name="expires" content="0">
    
    <!-- Platform identification -->
    <meta name="platform-validator" content="${platform}">
    <meta name="generated-at" content="${timestamp}">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${metadata.url}">
    
    <!-- Prevent indexing of this validator page -->
    <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
</head>
<body>
    <h1>${metadata.title}</h1>
    <p>${metadata.description}</p>
    <p>Platform: ${platform} | Generated: ${new Date(timestamp).toISOString()}</p>
    
    <!-- Hidden content for better crawler understanding -->
    <div style="display: none;">
        <img src="${metadata.image}" alt="${metadata.title}">
        <span class="author">${metadata.author}</span>
        ${(metadata as any).publishedTime ? `<time datetime="${(metadata as any).publishedTime}">Published</time>` : ''}
    </div>
    
    <!-- Redirect to actual page after 3 seconds -->
    <script>
        setTimeout(function() {
            window.location.href = '${metadata.url}';
        }, 3000);
    </script>
</body>
</html>`;
}