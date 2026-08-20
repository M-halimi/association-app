import { Role, UserStatus } from "@prisma/client";
import {
  requireAuth,
  getDashboardStats,
  getSettings,
  getUserProfile,
} from "@/lib/data";
import { formatAmount, formatMonthYear } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/server";
import { getLocale } from "@/lib/i18n/server";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { TransactionTable } from "@/components/shared/transaction-table";
import { Badge } from "@/components/ui/badge";
import { FileCheck2, HandCoins, Hourglass, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireAuth();
  const [settings, profile, stats, t, locale] = await Promise.all([
    getSettings(),
    getUserProfile(user.id),
    getDashboardStats(user),
    getDictionary(),
    getLocale(),
  ]);

  if (!profile) return null;
  const isMember = user.role === Role.MEMBER;

  return (
    <div>
      <PageHeader
        title={t.profile.title}
        description={t.profile.description}
      />

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-md bg-primary/10 text-xl font-semibold text-primary">
            {user.name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase())
              .join("")}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-lg font-semibold text-foreground">
                {user.name}
              </h2>
              <Badge variant={user.role === Role.ADMIN ? "default" : "secondary"}>
                {user.role === Role.ADMIN
                  ? t.common.administrator
                  : t.common.member}
              </Badge>
              <Badge
                variant={profile.status === UserStatus.ACTIVE ? "success" : "secondary"}
              >
                {profile.status === UserStatus.ACTIVE
                  ? t.common.active
                  : t.common.inactive}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile.email}
              {profile.phone ? ` · ${profile.phone}` : ""}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t.profile.memberSince(formatMonthYear(profile.createdAt, locale))}
            </p>
          </div>
        </div>
      </div>

      {isMember && (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={t.profile.myContributions}
              value={formatAmount(stats.contributions, settings.currency, locale)}
              icon={HandCoins}
              hint={t.profile.approvedHint}
            />
            <StatCard
              label={t.profile.approved}
              value={String(stats.approvedCount)}
              icon={FileCheck2}
              hint={t.profile.approvedHintShort}
            />
            <StatCard
              label={t.profile.pending}
              value={String(stats.pendingCount)}
              icon={Hourglass}
              hint={t.profile.awaitingHint}
            />
            <StatCard
              label={t.profile.currentBalance}
              value={formatAmount(stats.balance, settings.currency, locale)}
              icon={Wallet}
              hint={t.profile.balanceHint}
            />
          </div>

          <div className="mt-8">
            <PageHeader title={t.profile.myTransactions} />
            <TransactionTable
              transactions={stats.recentTransactions}
              currency={settings.currency}
            />
          </div>
        </>
      )}
    </div>
  );
}