import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";
import { generateSEOMetadata } from "@/components/SEO";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aihubvietnam.com";

// Enhanced metadata using SEO component
export const metadata: Metadata = {
  ...generateSEOMetadata({
    title: "AIHub Vietnam - Nền tảng AI tiên tiến",
    description: "Khám phá tương lai của trí tuệ nhân tạo với AIHub Vietnam. Tin tức AI mới nhất, công cụ AI hàng đầu, và cộng đồng AI Việt Nam.",
    keywords: [
      "AI Vietnam",
      "Trí tuệ nhân tạo",
      "Artificial Intelligence",
      "AI Tools",
      "Công cụ AI",
      "Machine Learning",
      "Deep Learning",
      "AI News",
      "Tin tức AI",
      "AIHub Vietnam"
    ],
    url: SITE_URL,
    type: "website",
    siteName: "AIHub Vietnam",
    locale: "vi",
  }),
  icons: {
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
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data for better SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "AIHub Vietnam",
              "description": "Khám phá tương lai của trí tuệ nhân tạo với AIHub Vietnam. Tin tức AI mới nhất, công cụ AI hàng đầu, và cộng đồng AI Việt Nam.",
              "url": SITE_URL,
              "potentialAction": {
                "@type": "SearchAction",
                "target": `${SITE_URL}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "AIHub Vietnam",
                "url": SITE_URL,
                "logo": {
                  "@type": "ImageObject",
                  "url": `${SITE_URL}/logo.jpeg`
                }
              }
            })
          }}
        />

        {/* Google Site Verification */}
        <meta name="google-site-verification" content="xsZJz7tdrQoF2Ty7NoEDd9N5P57TOHhS2K55prxlvc8" />

        {/* Platform-specific optimizations */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />

        {/* Preconnect to improve performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        
        {/* Favicon and Icons for better SEO and Google Search Results */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#0A0F18" />
        <meta name="theme-color" content="#0A0F18" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
