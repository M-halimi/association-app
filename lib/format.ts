import type { Locale } from "@/lib/i18n/locale";

function intlLocale(locale: Locale | string): string {
  return locale === "ar" ? "ar-MA" : locale === "fr" ? "fr" : "en-GB";
}

function numberLocale(locale: Locale | string): string {
  return locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-FR" : "en-US";
}

export function currencySymbol(currency: string): string {
  const code = currency.toUpperCase();
  if (code === "MAD") return "DH";
  if (code === "USD") return "$";
  if (code === "EUR") return "€";
  if (code === "GBP") return "£";
  return code;
}

export function formatAmount(
  value: number,
  currency = "MAD",
  locale: Locale | string = "en",
): string {
  return `${new Intl.NumberFormat(numberLocale(locale), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)} ${currencySymbol(currency)}`;
}

export function formatNumber(value: number, locale: Locale | string = "en"): string {
  return new Intl.NumberFormat(numberLocale(locale)).format(value);
}

export function formatDate(date: Date | string, locale: Locale | string = "en"): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string, locale: Locale | string = "en"): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatMonthYear(date: Date | string, locale: Locale | string = "en"): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}