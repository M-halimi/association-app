import { en, type Dict } from "./en";
import { fr } from "./fr";
import { ar } from "./ar";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./locale";

export const translations: Record<Locale, Dict> = { en, fr, ar };

export { en, fr, ar };
export type { Dict };

export function dictForLocale(locale: string): Dict {
  return isLocale(locale) ? translations[locale] : translations[DEFAULT_LOCALE];
}