import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@/lib/i18n/config";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent') || '';
  
  // Detect social media crawlers (including Zalo)
  const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|skypeuri|zaloapp|zalopc|discordbot|slackbot|googlebot|bingbot|yandexbot|baidubot/i.test(userAgent);
  
  // Allow root page to serve metadata without redirect for social media crawlers
  if (pathname === '/') {
    if (isCrawler) {
      // For Zalo specifically, ensure no cache and proper headers
      const response = NextResponse.next();
      
      if (/zalo/i.test(userAgent)) {
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        response.headers.set('Surrogate-Control', 'no-store');
        response.headers.set('X-Platform-Detection', 'zalo');
      }
      
      response.headers.set('X-Robots-Tag', 'noindex, follow');
      response.headers.set('X-Crawler-Detected', 'true');
      
      return response;
    }
  }

  // Special handling for crawlers accessing specific pages
  if (isCrawler) {
    const response = NextResponse.next();
    
    // Add crawler-specific headers
    if (/zalo/i.test(userAgent)) {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      response.headers.set('X-Platform-Detection', 'zalo');
    } else {
      response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    }
    
    response.headers.set('X-Crawler-Detected', 'true');
    response.headers.set('X-Robots-Tag', 'index, follow');
    response.headers.set('Vary', 'User-Agent');
    
    // Let crawlers access the page directly, apply intl middleware for proper routing
    return intlMiddleware(request);
  }
  
  // For all other requests (human users), use default intl middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|mp4|mov|avi|pdf|zip|json|xml|txt|css|js|woff|woff2|ttf|eot)|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)",
  ],
};
