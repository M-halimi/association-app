import { locale } from "next/root-params";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./locale";
import { translations, type Dict } from "./translations";

export async function getLocale(): Promise<Locale> {
  const lang = await locale();
  return isLocale(lang) ? lang : DEFAULT_LOCALE;
}

export async function getDictionary(): Promise<Dict> {
  const lang = await getLocale();
  return translations[lang];
}