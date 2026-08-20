"use client";

import { useParams } from "next/navigation";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./locale";
import { pathWithLocale } from "./path";
import { translations, type Dict } from "./translations";

export function useI18n(): {
  locale: Locale;
  t: Dict;
  path: (href: string) => string;
} {
  const params = useParams<{ locale?: string }>();
  const raw = params?.locale;
  const locale: Locale =
    typeof raw === "string" && isLocale(raw) ? raw : DEFAULT_LOCALE;
  return {
    locale,
    t: translations[locale],
    path: (href: string) => pathWithLocale(locale, href),
  };
}