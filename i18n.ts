import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { locales, type Locale, defaultLocale } from "./lib/i18n/config";

export default getRequestConfig(async ({ locale }) => {
  const safeLocale = locale || defaultLocale;

  if (!locales.includes(safeLocale as Locale)) notFound();

  try {
    const messages = (await import(`./lib/i18n/message/${safeLocale}.json`)).default;

    return {
      messages,
      locale: safeLocale,
      timeZone: "UTC",
      onError(error) {
        const code = (error as { code?: string })?.code;
        if (code === "MISSING_MESSAGE") {
          return;
        }
        if (process.env.NODE_ENV === "development") {
          console.debug("[i18n] Translation error:", error);
        }
      },
      getMessageFallback({ namespace, key, error }) {
        const path = [namespace, key].filter((part) => part != null).join(".");
        const code = (error as { code?: string })?.code;
        const message = error?.message;

        if (code === "MISSING_MESSAGE" || message?.includes("SOURCE_LANG")) {
          if (namespace === "Header") {
            if (key === "about") {
              return safeLocale === "vi" ? "Ve chung toi" : "About Us";
            }
            if (key === "contact") {
              return safeLocale === "vi" ? "Lien he" : "Contact";
            }
            if (key === "careers") {
              return safeLocale === "vi" ? "Tuyen dung" : "Careers";
            }
            if (key === "privacy") {
              return safeLocale === "vi" ? "Chinh sach bao mat" : "Privacy Policy";
            }
          }
          return key;
        }

        return path;
      },
    };
  } catch (error) {
    if (safeLocale !== defaultLocale) {
      try {
        const defaultMessages = (await import(`./lib/i18n/message/${defaultLocale}.json`)).default;
        return {
          messages: defaultMessages,
          locale: defaultLocale,
          timeZone: "UTC",
        };
      } catch {
        notFound();
      }
    }
    notFound();
  }
});
