import { LOCALES, type Locale } from "./locale";

export function pathWithLocale(locale: Locale, href: string): string {
  if (!href.startsWith("/")) return href;
  const segments = href.split("/").filter(Boolean);
  if (segments.length > 0 && (LOCALES as readonly string[]).includes(segments[0]!)) {
    return href;
  }
  return `/${locale}${href === "/" ? "" : href}`;
}