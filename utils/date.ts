export function formatDateByLocale(date: string | number | Date, locale: string): string {
  try {
    const d = new Date(date);
    const code = locale === "vi" ? "vi-VN" : "en-US";
    return d.toLocaleDateString(code, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

