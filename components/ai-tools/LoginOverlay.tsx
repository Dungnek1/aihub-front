"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

interface LoginOverlayProps {
  text: string;
}

export default function LoginOverlay({ text }: LoginOverlayProps) {
  const router = useRouter();
  const locale = useLocale();

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer hover:opacity-90 transition-opacity"
      onClick={() => {
        setTimeout(() => {
          router.push(`/${locale}/auth/signin`);
        }, 0);
      }}
    >
      <p className="text-white text-2xl font-bold font-sans tracking-wide whitespace-nowrap">
        {text}
      </p>
    </div>
  );
}

