import { Banknote, BriefcaseBusiness, HandCoins, Hourglass, TrendingDown } from "lucide-react";
import { requireAdmin, getReportData, toNumber, ReportFilters } from "@/lib/data";
import { formatAmount, formatDate } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/server";
import { getLocale } from "@/lib/i18n/server";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { TransactionTable } from "@/components/shared/transaction-table";
import { ReportFilters as ReportFiltersClient, CsvRow } from "@/components/reports/report-filters";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<ReportFilters>;
}) {
  await requireAdmin();
  const filters = await searchParams;
  const data = await getReportData(filters);
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const { settings } = data;

  const csvRows: CsvRow[] = data.transactions.map((transaction) => ({
    reference: transaction.reference,
    member: transaction.user.name,
    type: transaction.type,
    amount: toNumber(transaction.amount),
    reason: transaction.reason,
    status: transaction.status,
    date: formatDate(transaction.transactionDate, locale),
  }));

  return (
    <div>
      <PageHeader
        title={t.reports.title}
        description={t.reports.description}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label={t.reports.totalMoney}
          value={formatAmount(data.totals.totalMoney, settings.currency, locale)}
          icon={Banknote}
          hint={t.reports.totalMoneyHint}
        />
        <StatCard
          label={t.reports.totalContributions}
          value={formatAmount(data.totals.totalContributions, settings.currency, locale)}
          icon={HandCoins}
          hint={t.reports.approvedCountHint(data.totals.approvedCount)}
        />
        <StatCard
          label={t.reports.totalInvestments}
          value={formatAmount(data.totals.totalInvestments, settings.currency, locale)}
          icon={BriefcaseBusiness}
        />
        <StatCard
          label={t.reports.totalExpenses}
          value={formatAmount(data.totals.totalExpenses, settings.currency, locale)}
          icon={TrendingDown}
        />
        <StatCard
          label={t.reports.pendingAmount}
          value={formatAmount(data.totals.pendingAmount, settings.currency, locale)}
          icon={Hourglass}
          hint={t.reports.pendingCountHint(data.totals.pendingCount)}
        />
      </div>

      <div className="mt-6">
        <ReportFiltersClient
          from={filters.from}
          to={filters.to}
          memberId={filters.memberId}
          type={filters.type}
          status={filters.status}
          members={data.members}
          csvRows={csvRows}
        />
      </div>

      <div className="mt-6">
        <TransactionTable
          transactions={data.transactions}
          currency={settings.currency}
        />
      </div>
    </div>
  );
}