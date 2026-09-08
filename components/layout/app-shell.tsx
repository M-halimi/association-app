"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  BarChart3,
  ChevronRight,
  CircleUserRound,
  Contact,
  FilePlus2,
  Languages,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { useI18n } from "@/lib/i18n/client";
import { LOCALES } from "@/lib/i18n/locale";
import type { Dict } from "@/lib/i18n/translations";

type NavItem = {
  labelKey: keyof Dict["nav"];
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

function navItems(role: string): (NavItem | "divider")[] {
  const items: (NavItem | "divider")[] = [
    {
      labelKey: "dashboard",
      href: "/",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      labelKey: "transactions",
      href: "/transactions",
      icon: ArrowLeftRight,
    },
    {
      labelKey: "addTransaction",
      href: "/transactions/new",
      icon: FilePlus2,
    },
  ];

  if (role === "ADMIN") {
    items.push(
      "divider",
      { labelKey: "members", href: "/admin/members", icon: Users },
      { labelKey: "people", href: "/admin/association-members", icon: Contact },
      { labelKey: "reports", href: "/admin/reports", icon: BarChart3 },
      { labelKey: "settings", href: "/admin/settings", icon: Settings },
    );
  }

  items.push("divider", {
    labelKey: "profile",
    href: "/profile",
    icon: CircleUserRound,
  });

  return items;
}

function pageTitleKey(pathname: string): keyof Dict["nav"] {
  if (pathname === "/") return "dashboard";
  if (pathname === "/transactions") return "transactions";
  if (pathname === "/transactions/new") return "addTransaction";
  if (pathname.endsWith("/edit")) return "editTransaction";
  if (pathname.startsWith("/transactions/")) return "transaction";
  if (pathname === "/admin/members") return "members";
  if (pathname.startsWith("/admin/members/")) return "memberProfile";
  if (pathname === "/admin/association-members") return "people";
  if (pathname.startsWith("/admin/association-members/")) return "personProfile";
  if (pathname === "/admin/reports") return "reports";
  if (pathname === "/admin/settings") return "settings";
  if (pathname === "/profile") return "profile";
  return "dashboard";
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function Logo({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl: string | null;
}) {
  return (
    <Link href="/" className="flex min-w-0 flex-1 items-center gap-2.5">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          className="h-8 w-8 shrink-0 rounded-md object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
          {initials(name) || "A"}
        </div>
      )}
      <span className="min-w-0 truncate text-[15px] font-semibold text-sidebar-foreground">
        {name}
      </span>
    </Link>
  );
}

function NavLinks({
  role,
  t,
  path,
  onNavigate,
}: {
  role: string;
  t: Dict;
  path: (href: string) => string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = navItems(role);

  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {items.map((item, index) => {
        if (item === "divider") {
          return (
            <div
              key={`divider-${index}`}
              className="my-2 h-px bg-sidebar-border"
            />
          );
        }
        const href = path(item.href);
        const active = item.exact
          ? pathname === href
          : pathname.startsWith(href);
        return (
          <Link
            key={item.href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground [&_svg]:text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {t.nav[item.labelKey]}
          </Link>
        );
      })}
    </nav>
  );
}

function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const rest = pathname.replace(new RegExp(`^/${locale}`), "") || "/";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Languages className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t.languages.label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LOCALES.map((lang) => (
          <DropdownMenuItem key={lang} asChild>
            <Link
              href={pathWithLocale(lang, rest)}
              className={cn(
                locale === lang && "font-semibold text-primary",
              )}
            >
              {t.languages[lang]}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function pathWithLocale(locale: string, href: string): string {
  const segments = href.split("/").filter(Boolean);
  if (segments.length > 0 && (LOCALES as readonly string[]).includes(segments[0]!)) {
    return href;
  }
  return `/${locale}${href === "/" ? "" : href}`;
}

function UserMenu({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const { t, path } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto justify-start gap-2.5 px-2 py-1.5"
        >
          <Avatar className="h-7 w-7 rounded-md">
            <AvatarFallback className="rounded-md bg-primary/10 text-xs font-semibold text-primary">
              {initials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 flex-col items-start sm:flex">
            <span className="max-w-[140px] truncate text-sm font-medium text-foreground">
              {userName}
            </span>
            <span className="max-w-[140px] truncate text-xs text-muted-foreground">
              {userEmail}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t.common.account}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={path("/profile")}>{t.common.profile}</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={async () => {
            await signOut({ redirectTo: "/login" });
          }}
        >
          <LogOut className="h-4 w-4" />
          {t.common.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({
  associationName,
  logoUrl,
  userName,
  userEmail,
  userRole,
  children,
}: {
  associationName: string;
  logoUrl: string | null;
  userName: string;
  userEmail: string;
  userRole: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { locale, t, path } = useI18n();
  const pathname = usePathname();
  const rest = pathname.replace(new RegExp(`^/${locale}`), "") || "/";

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-60 flex-col border-e border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-14 items-center border-b border-sidebar-border px-5">
          <Logo name={associationName} logoUrl={logoUrl} />
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <NavLinks role={userRole} t={t} path={path} />
        </div>
        <div className="border-t border-sidebar-border p-4">
          <p className="truncate text-xs text-sidebar-foreground/60">
            {associationName}
          </p>
          <p className="mt-0.5 text-[11px] text-sidebar-foreground/40">
            {t.common.internalSystem}
          </p>
        </div>
      </aside>

      {/* Main column */}
      <div className="lg:ps-60">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-card px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side={locale === "ar" ? "right" : "left"}
                className="w-64 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
              >
                <div className="flex h-14 items-center border-b border-sidebar-border px-5">
                  <Logo name={associationName} logoUrl={logoUrl} />
                </div>
                <div className="flex h-[calc(100%-3.5rem-4.5rem)] flex-col overflow-y-auto py-4">
                  <NavLinks
                    role={userRole}
                    t={t}
                    path={path}
                    onNavigate={() => setMobileOpen(false)}
                  />
                </div>
                <div className="border-t border-sidebar-border p-4">
                  <p className="truncate text-xs text-sidebar-foreground/60">
                    {associationName}
                  </p>
                  <p className="mt-0.5 text-[11px] text-sidebar-foreground/40">
                    {t.common.internalSystem}
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex min-w-0 items-center gap-1.5 text-sm">
            <span className="hidden max-w-[200px] truncate text-muted-foreground sm:inline">
              {associationName}
            </span>
            <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground rtl:rotate-180 sm:block" />
            <span className="truncate font-medium text-foreground">
              {t.nav[pageTitleKey(rest)]}
            </span>
          </div>

          <div className="ms-auto flex items-center gap-1">
            <LanguageSwitcher />
            <UserMenu userName={userName} userEmail={userEmail} />
          </div>
        </header>

        {/* Main content */}
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}