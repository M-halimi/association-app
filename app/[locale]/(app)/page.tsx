import { FileCheck2, HandCoins, Hourglass, Users } from "lucide-react";
import { Role, TransactionStatus, TransactionType } from "@prisma/client";
import { requireAuth, getDashboardStats, toNumber } from "@/lib/data";
import { formatAmount } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/server";
import { getLocale } from "@/lib/i18n/server";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { TransactionTable } from "@/components/shared/transaction-table";
import { typeLabel } from "@/components/shared/transaction-type";
import { LinkButton } from "@/components/shared/link-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireAuth();
  const [stats, t, locale] = await Promise.all([
    getDashboardStats(user),
    getDictionary(),
    getLocale(),
  ]);
  const currency = stats.settings.currency;

  const firstName = user.name.split(" ")[0] || user.name;
  const isAdmin = user.role === Role.ADMIN;

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t.dashboard.goodMorning
      : hour < 18
        ? t.dashboard.goodAfternoon
        : t.dashboard.goodEvening;

  const cards = isAdmin
    ? [
        {
          label: t.dashboard.totalContributions,
          value: formatAmount(stats.contributions, currency, locale),
          icon: HandCoins,
          hint: t.dashboard.approvedHint,
        },
        {
          label: t.dashboard.members,
          value: String(stats.memberCount),
          icon: Users,
          hint: t.dashboard.activeMembersHint,
        },
        {
          label: t.dashboard.approvedTransactions,
          value: String(stats.approvedCount),
          icon: FileCheck2,
          hint: t.dashboard.allApprovedHint,
        },
        {
          label: t.dashboard.pendingTransactions,
          value: String(stats.pendingCount),
          icon: Hourglass,
          hint: t.dashboard.awaitingHint,
        },
      ]
    : [
        {
          label: t.dashboard.myContributions,
          value: formatAmount(stats.contributions, currency, locale),
          icon: HandCoins,
          hint: t.dashboard.approvedHint,
        },
        {
          label: t.dashboard.approved,
          value: String(stats.approvedCount),
          icon: FileCheck2,
          hint: t.dashboard.approvedHintShort,
        },
        {
          label: t.dashboard.pending,
          value: String(stats.pendingCount),
          icon: Hourglass,
          hint: t.dashboard.awaitingHint,
        },
        {
          label: t.dashboard.currentBalance,
          value: formatAmount(stats.balance, currency, locale),
          icon: Users,
          hint: t.dashboard.balanceHint,
        },
      ];

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${firstName}`}
        description={t.dashboard.overview}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">
            {t.dashboard.recentTransactions}
          </h2>
          <LinkButton href="/transactions" variant="outline" size="sm">
            {t.dashboard.viewAll}
          </LinkButton>
        </div>
        <TransactionTable
          transactions={stats.recentTransactions}
          currency={currency}
        />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <ContributionOverview
          totals={stats.typeTotals}
          balance={stats.balance}
          expenses={stats.expenses}
          contributions={stats.contributions}
          currency={currency}
          isAdmin={isAdmin}
          t={t}
          locale={locale}
        />
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground">
            {t.dashboard.gettingStarted}
          </h3>
          <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
            {isAdmin ? (
              <>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {t.dashboard.adminStep1}
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {t.dashboard.adminStep2}
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {t.dashboard.adminStep3}
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {t.dashboard.memberStep1}
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {t.dashboard.memberStep2}
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {t.dashboard.memberStep3}
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ContributionOverview({
  totals,
  balance,
  expenses,
  contributions,
  currency,
  isAdmin,
  t,
  locale,
}: {
  totals: { type: TransactionType; status: TransactionStatus; _sum: { amount: number | null } }[] | null;
  balance: number;
  expenses: number;
  contributions: number;
  currency: string;
  isAdmin: boolean;
  t: Awaited<ReturnType<typeof getDictionary>>;
  locale: Awaited<ReturnType<typeof getLocale>>;
}) {
  const inTypes: TransactionType[] = [
    TransactionType.CONTRIBUTION,
    TransactionType.INVESTMENT,
  ];
  const overview =
    totals && isAdmin
      ? inTypes
          .map((type) => ({
            type,
            amount:
              totals
                .filter((t) => t.type === type)
                .reduce((sum, t) => sum + toNumber(t._sum.amount ?? 0), 0) || 0,
          }))
          .filter((row) => row.amount !== 0)
      : [];

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground">
        {t.dashboard.contributionOverview}
      </h3>
      <dl className="mt-4 space-y-3 text-sm">
        {isAdmin && overview.length > 0
          ? overview.map((row) => (
              <div
                key={row.type}
                className="flex items-center justify-between gap-2"
              >
                <dt className="text-muted-foreground">{typeLabel(row.type, t)}s</dt>
                <dd className="font-medium tabular-nums text-foreground">
                  {formatAmount(row.amount, currency, locale)}
                </dd>
              </div>
            ))
          : null}
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">{t.common.approvedIn}</dt>
          <dd className="font-medium tabular-nums text-foreground">
            {formatAmount(contributions, currency, locale)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">{t.common.approvedExpenses}</dt>
          <dd className="font-medium tabular-nums text-foreground">
            - {formatAmount(expenses, currency, locale)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
          <dt className="font-medium text-foreground">{t.common.currentBalance}</dt>
          <dd className="font-semibold tabular-nums text-primary">
            {formatAmount(balance, currency, locale)}
          </dd>
        </div>
      </dl>
    </div>
  );
}