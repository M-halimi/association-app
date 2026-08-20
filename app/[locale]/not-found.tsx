import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { pathWithLocale } from "@/lib/i18n/path";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NotFoundPage() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
          <FileQuestion className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
          {t.error.notFoundTitle}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.error.notFoundMessage}
        </p>
        <Button asChild className="mt-6">
          <Link href={pathWithLocale(locale, "/")}>{t.error.goHome}</Link>
        </Button>
      </div>
    </div>
  );
}