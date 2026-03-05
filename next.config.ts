import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

// Suppress deprecation warning for url.parse() caused by next-auth
if (typeof process !== 'undefined') {
  const originalEmit = process.emit;
  // @ts-expect-error - process.emit types are incompatible
  process.emit = function (name, data, ...args) {
    if (
      name === 'warning' &&
      typeof data === 'object' &&
      data &&
      (data as any).name === 'DeprecationWarning' &&
      (data as any).message?.includes('url.parse()')
    ) {
      return false;
    }
    return originalEmit.apply(process, [name, data, ...args] as any);
  };
}

const nextConfig: NextConfig = {
  // Performance optimizations
  poweredByHeader: false,
  compress: true,

  // Image optimization
  images: {
    unoptimized: true,
    remotePatterns: (() => {
      const patterns: Array<{
        protocol: 'http' | 'https';
        hostname: string;
        port?: string;
        pathname: string;
      }> = [
          {
            protocol: 'https',
            hostname: 'lh3.googleusercontent.com',
            port: '',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'images.unsplash.com',
            port: '',
            pathname: '/**',
          },
        ];

      // Add backend URL from environment variable
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (backendUrl) {
        try {
          const url = new URL(backendUrl);
          patterns.push({
            protocol: url.protocol.replace(':', '') as 'http' | 'https',
            hostname: url.hostname,
            port: url.port || '',
            pathname: '/**',
          });
        } catch (e) {
          // If URL parsing fails, try to extract hostname and port manually
          const match = backendUrl.match(/^(https?):\/\/([^/:]+)(?::(\d+))?/);
          if (match) {
            const protocol = (match[1] || 'https') as 'http' | 'https';
            const hostname = match[2];

            if (!hostname) {
              return patterns;
            }

            patterns.push({
              protocol,
              hostname,
              port: match[3] || '',
              pathname: '/**',
            });
          }
        }
      }

      return patterns;
    })(),
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Production optimizations
  reactStrictMode: true,

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-navigation-menu',
    ],
    // Disable RSC prefetching in development to avoid SSL errors
    ...(process.env.NODE_ENV === 'development' && {
      serverActions: {
        bodySizeLimit: '2mb',
      },
    }),
  },

  // Output standalone for Docker
  output: 'standalone',

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk for shared components
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }
    return config;
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/bg-auth.mp4',
        headers: [
          {
            key: 'Content-Type',
            value: 'video/mp4',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
        ],
      },
      {
        // Prevent aggressive caching of OG image for all social crawlers
        source: '/og-image.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Cloudflare-CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Vary',
            value: 'User-Agent, Accept-Encoding',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
      {
        // Special headers for root page to help social media crawlers (especially Zalo)
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=120',
          },
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Vary',
            value: 'User-Agent, Accept-Language, Accept-Encoding',
          },
        ],
      },
      {
        // Optimized headers for all pages with Zalo-specific considerations
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Content Security Policy to prevent XSS attacks
            // Allows inline styles and scripts from same origin, but blocks eval() and unsafe-inline scripts
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://cdnjs.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              // Allow http:// for local development (192.168.x.x, localhost, 127.0.0.1)
              // CSP doesn't support complex wildcards, so we need to be more permissive in dev
              ...(process.env.NODE_ENV === 'development'
                ? [`img-src 'self' data: https: http: blob:`]
                : [`img-src 'self' data: https: blob:`]
              ),
              ...(process.env.NODE_ENV === 'development'
                ? ["connect-src 'self' https://api-dashboard.aihubvietnam.com https://noti.aihubvietnam.com wss://noti.aihubvietnam.com https://www.google-analytics.com http://*:* https://*:*"]
                : ["connect-src 'self' https://api-dashboard.aihubvietnam.com https://noti.aihubvietnam.com wss://noti.aihubvietnam.com https://www.google-analytics.com"]
              ),
              "frame-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              // Only upgrade insecure requests in production, not in development
              ...(process.env.NODE_ENV === 'production' ? ["upgrade-insecure-requests"] : []),
            ].join('; '),
          },
          {
            key: 'Vary',
            value: 'User-Agent, Accept-Language',
          },
        ],
      },
      {
        // Optimized caching for icons and static assets
        source: '/icon/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // API routes should not be cached by social crawlers
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },

  // Ensure static files from public directory are served
  trailingSlash: false,

  async rewrites() {
    return [
      {
        source: '/bg-auth.mp4',
        destination: '/bg-auth.mp4',
      },
      // Ensure locale-prefixed paths still resolve the static video
      {
        source: '/:locale/bg-auth.mp4',
        destination: '/bg-auth.mp4',
      },
      // Sitemap rewrite
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap.xml',
      },
    ];
  },

  // Robots.txt configuration
  async redirects() {
    return [
      // Redirect old URLs if needed
    ];
  },
};

export default withNextIntl(nextConfig);
