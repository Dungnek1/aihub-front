import { Metadata } from "next";
import { redirect } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aihubvietnam.com";
const OG_VERSION = process.env.NEXT_PUBLIC_OG_VERSION || "v5-zalo-fix";

// Static metadata for root page - critical for social media crawlers
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
    "Tin tức AI"
  ],
  authors: [{ name: "AIHub Vietnam", url: SITE_URL }],
  creator: "AIHub Vietnam",
  publisher: "AIHub Vietnam",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "AIHub Vietnam",
    title: "AIHub Vietnam - Nền tảng AI tiên tiến",
    description: "Khám phá tương lai của trí tuệ nhân tạo với AIHub Vietnam. Tin tức AI mới nhất, công cụ AI hàng đầu, và cộng đồng AI Việt Nam.",
    url: SITE_URL,
    locale: "vi_VN",
    alternateLocale: ["en_US"],
    images: [
      {
        url: `${SITE_URL}/og-image.png?v=${OG_VERSION}&zalo=true&t=${Date.now()}`,
        width: 1200,
        height: 630,
        alt: "AIHub Vietnam - Nền tảng AI tiên tiến",
        type: "image/png",
      },
      // Multiple fallback images with different cache-busting
      {
        url: `${SITE_URL}/og-image.png?cache=no&t=${Date.now()}`,
        width: 1200,
        height: 630,
        alt: "AIHub Vietnam",
        type: "image/png",
      },
      {
        url: `${SITE_URL}/og-image.png?zalo=${Date.now()}`,
        width: 1200,
        height: 630,
        alt: "AIHub Vietnam - AI Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@aihubvietnam",
    creator: "@aihubvietnam",
    title: "AIHub Vietnam - Nền tảng AI tiên tiến",
    description: "Khám phá tương lai của trí tuệ nhân tạo với AIHub Vietnam. Tin tức AI mới nhất, công cụ AI hàng đầu, và cộng đồng AI Việt Nam.",
    images: [`${SITE_URL}/og-image.png?v=${OG_VERSION}&zalo=true&t=${Date.now()}`],
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'vi': `${SITE_URL}/vi`,
      'en': `${SITE_URL}/en`,
      'x-default': SITE_URL,
    },
  },
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

// Root page component - redirects to default locale after metadata is served
export default function RootPage() {
  // This redirect happens on client/server after metadata is already processed by crawlers
  redirect('/vi');
}