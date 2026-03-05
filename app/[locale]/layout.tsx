import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n/config';
import { ClientLayout } from './client-layout';
import { Metadata } from 'next';

export function generateStaticParams() {
  return locales.map((locale) => ({
    locale: locale,
  }));
}

// Generate metadata cho từng locale
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aihubvietnam.com";

  // Localized content
  const localizedContent = {
    vi: {
      title: "AIHub Vietnam - Nền tảng AI tiên tiến",
      description: "Khám phá tương lai của trí tuệ nhân tạo với AIHub Vietnam. Tin tức AI mới nhất, công cụ AI hàng đầu, và cộng đồng AI Việt Nam.",
      keywords: ["AI Vietnam", "Trí tuệ nhân tạo", "Công cụ AI", "Tin tức AI", "Machine Learning", "Deep Learning"] as string[],
    },
    en: {
      title: "AIHub Vietnam - Advanced AI Platform",
      description: "Discover the future of artificial intelligence with AIHub Vietnam. Latest AI news, top AI tools, and Vietnamese AI community.",
      keywords: ["AI Vietnam", "Artificial Intelligence", "AI Tools", "AI News", "Machine Learning", "Deep Learning"] as string[],
    },
  };

  const content = localizedContent[locale as keyof typeof localizedContent] || localizedContent.vi;

  // Use static OG image from public folder with cache busting
  const ogImageUrl = `${SITE_URL}/og-image.png?v=${process.env.NEXT_PUBLIC_OG_VERSION || 'v3'}&t=${Date.now()}&cache=false`;

  return {
    title: {
      default: content.title,
      template: `%s | AIHub Vietnam`,
    },
    description: content.description,
    keywords: content.keywords,
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }
       
      ],
      apple: [
        { url: "/favicon.png", sizes: "any", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
    },
    openGraph: {
      title: content.title,
      description: content.description,
      url: `${SITE_URL}/${locale}`,
      siteName: "AIHub Vietnam",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: content.title,
          type: "image/png",
        },
        // Backup image with different parameters
        {
          url: `${SITE_URL}/og-image.png?locale=${locale}&cache=no&t=${Date.now()}`,
          width: 1200,
          height: 630,
          alt: `AIHub Vietnam - ${locale.toUpperCase()}`,
          type: "image/png",
        },
      ],
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.description,
      images: [ogImageUrl],
      creator: "@aihubvietnam",
      site: "@aihubvietnam",
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        'vi': `${SITE_URL}/vi`,
        'en': `${SITE_URL}/en`,
      },
    },
    manifest: "/site.webmanifest",
  };
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let messages: Record<string, any>;
  try {
    messages = (await import(`@/lib/i18n/message/${locale}.json`)).default;
  } catch {
    notFound();
  }

  // Extract Footer texts
  const footerTexts = messages.Footer || {};

  return (
    <ClientLayout 
      locale={locale} 
      messages={messages}
      footerTexts={{
        description: footerTexts.description || "",
        explore: footerTexts.explore || "",
        latestNews: footerTexts.latestNews || "",
        research: footerTexts.research || "",
        aiTrends: footerTexts.aiTrends || "",
        caseStudies: footerTexts.caseStudies || "",
        resources: footerTexts.resources || "",
        documentation: footerTexts.documentation || "",
        tools: footerTexts.tools || "",
        tutorials: footerTexts.tutorials || "",
        company: footerTexts.company || "",
        about: footerTexts.about || "",
        contact: footerTexts.contact || "",
        careers: footerTexts.careers || "",
        privacyPolicy: footerTexts.privacyPolicy || "",
        copyright: footerTexts.copyright || "",
        termsOfService: footerTexts.termsOfService || "",
        joinCommunity: footerTexts.joinCommunity || "",
      }}
    >
      {children}
    </ClientLayout>
  );
}