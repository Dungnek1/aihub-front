"use client";

import React, { useTransition, Suspense } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { locales } from "@/lib/i18n/config";

function LanguageSwitcherContent() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return;

    startTransition(() => {
      // With next-intl, usePathname() should return pathname WITHOUT locale prefix
      // But to be safe, we'll ensure we construct the correct path
      let cleanPathname = pathname;

      // If pathname starts with current locale, remove it
      if (pathname.startsWith(`/${locale}`)) {
        cleanPathname = pathname.slice(`/${locale}`.length) || '/';
      }

      // Ensure cleanPathname starts with /
      if (!cleanPathname.startsWith('/')) {
        cleanPathname = `/${cleanPathname}`;
      }

      const newPath = `/${newLocale}${cleanPathname}`;
      const queryString = searchParams.toString();
      const fullPath = queryString ? `${newPath}?${queryString}` : newPath;
      router.push(fullPath);
    });
  };

  return (
    <div className="flex gap-1">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          disabled={isPending}
          className={`
            px-2 py-1 rounded text-sm cursor-pointer
            transition-all duration-300 ease-in-out
            disabled:opacity-50 disabled:cursor-not-allowed
            ${locale === loc
              ? "bg-linear-to-b from-light-green to-primary-cyan text-[#0B5A5C] font-medium shadow-sm"
              : "text-gray-300 hover:text-white hover:bg-white/10"
            }
            ${isPending ? 'animate-pulse' : ''}
          `}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function LanguageSwitcherFallback() {
  return (
    <div className="flex gap-1">
      {locales.map((loc) => (
        <button
          key={loc}
          disabled
          className="px-2 py-1 rounded text-sm opacity-50 text-gray-300"
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function LanguageSwitcher() {
  return (
    <Suspense fallback={<LanguageSwitcherFallback />}>
      <LanguageSwitcherContent />
    </Suspense>
  );
}

export default React.memo(LanguageSwitcher);
