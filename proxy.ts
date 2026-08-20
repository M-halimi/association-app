import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { DEFAULT_LOCALE, isLocale, LOCALES } from "@/lib/i18n/locale";

function detectLocale(req: NextRequest): string {
  const cookie = req.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && isLocale(cookie)) return cookie;

  const acceptLanguage = req.headers.get("accept-language") ?? "";
  const preferred = acceptLanguage.split(",")[0]?.split("-")[0]?.toLowerCase();
  if (preferred && isLocale(preferred)) return preferred;

  return DEFAULT_LOCALE;
}

function splitLocalePath(pathname: string): {
  locale: string | null;
  rest: string;
} {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0]?.toLowerCase() ?? "";
  if (first && (LOCALES as readonly string[]).includes(first)) {
    return { locale: first, rest: pathname.slice(first.length + 1) || "/" };
  }
  return { locale: null, rest: pathname };
}

function withLocaleCookie(response: NextResponse, locale: string): NextResponse {
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export default auth(
  (req: NextRequest & { auth?: { user?: { role?: string } } | null }) => {
    const { nextUrl } = req;
    const isLoggedIn = Boolean(req.auth);
    const pathname = nextUrl.pathname;

    const { locale, rest } = splitLocalePath(pathname);

    if (!locale) {
      const localeToUse = detectLocale(req);
      const url = nextUrl.clone();
      url.pathname = `/${localeToUse}${pathname === "/" ? "" : pathname}`;
      return withLocaleCookie(NextResponse.redirect(url), localeToUse);
    }

    if (rest.startsWith("/login")) {
      if (isLoggedIn) {
        const url = nextUrl.clone();
        url.pathname = `/${locale}`;
        url.search = "";
        return withLocaleCookie(NextResponse.redirect(url), locale);
      }
      return withLocaleCookie(NextResponse.next(), locale);
    }

    if (!isLoggedIn) {
      const url = nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.search = "";
      url.searchParams.set(
        "callbackUrl",
        `/${locale}${rest === "/" ? "" : rest}`,
      );
      return withLocaleCookie(NextResponse.redirect(url), locale);
    }

    if (rest.startsWith("/admin") && req.auth?.user?.role !== "ADMIN") {
      const url = nextUrl.clone();
      url.pathname = `/${locale}`;
      url.search = "";
      return withLocaleCookie(NextResponse.redirect(url), locale);
    }

    return withLocaleCookie(NextResponse.next(), locale);
  },
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico)$).*)",
  ],
};