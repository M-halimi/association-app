import { Suspense } from "react";
import { getAssociation } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const [association, t] = await Promise.all([
    getAssociation(),
    getDictionary(),
  ]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <div className="grid w-full max-w-3xl overflow-hidden rounded-lg border border-border bg-card shadow-sm lg:grid-cols-2">
        <div className="hidden flex-col justify-between bg-sidebar p-8 text-sidebar-foreground lg:flex">
          <div className="flex min-w-0 items-center gap-3">
            {association.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={association.logoUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-md object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sidebar-foreground/10 text-lg font-semibold">
                {association.name.charAt(0)}
              </div>
            )}
            <span className="min-w-0 truncate text-lg font-semibold">{association.name}</span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold leading-tight">
              {t.auth.tagline}
            </h2>
            <p className="mt-3 text-sm text-sidebar-foreground/75">
              {t.auth.subtitle}
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6 flex min-w-0 items-center gap-3 lg:hidden">
            {association.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={association.logoUrl}
                alt=""
                className="h-8 w-8 shrink-0 rounded-md object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                {association.name.charAt(0)}
              </div>
            )}
            <span className="min-w-0 truncate text-sm font-semibold">{association.name}</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t.auth.signIn}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t.auth.enterCredentials}
          </p>

          <Suspense
            fallback={
              <div className="mt-6 space-y-4">
                <div className="h-9 animate-pulse rounded-md bg-muted" />
                <div className="h-9 animate-pulse rounded-md bg-muted" />
                <div className="h-9 animate-pulse rounded-md bg-muted" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {t.auth.internalSystem} · {association.name}
          </p>
        </div>
      </div>
    </div>
  );
}