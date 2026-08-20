import type { Metadata } from "next";
import { Cairo, Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { Toaster } from "@/components/ui/sonner";
import { getAssociation } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { isLocale, localeDir } from "@/lib/i18n/locale";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin", "arabic"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [association, t] = await Promise.all([getAssociation(), getDictionary()]);
  return {
    title: {
      default: `${association.name} · ${t.meta.management}`,
      template: `%s · ${association.name}`,
    },
    description: association.description ?? t.meta.description,
  };
}

export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await locale();
  if (!isLocale(lang)) notFound();

  return (
    <html
      lang={lang}
      dir={localeDir(lang)}
      className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <Toaster
          position={lang === "ar" ? "top-left" : "top-right"}
          richColors
        />
      </body>
    </html>
  );
}