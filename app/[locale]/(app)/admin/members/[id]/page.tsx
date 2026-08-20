import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { UserStatus } from "@prisma/client";
import { requireAdmin, getMemberProfile, getAssociation } from "@/lib/data";
import { formatAmount, formatMonthYear } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/server";
import { getLocale } from "@/lib/i18n/server";
import { pathWithLocale } from "@/lib/i18n/path";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { TransactionTable } from "@/components/shared/transaction-table";
import { Badge } from "@/components/ui/badge";
import { FileCheck2, HandCoins, Hourglass, ReceiptText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const [settings, t, locale] = await Promise.all([
    getAssociation(),
    getDictionary(),
    getLocale(),
  ]);
  const { id } = await params;
  const member = await getMemberProfile(id);

  if (!member) notFound();

  return (
    <div>
      <Link
        href={pathWithLocale(locale, "/admin/members")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t.members.back}
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-lg font-semibold text-primary">
            {member.name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase())
              .join("")}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-foreground">
                {member.name}
              </h1>
              <Badge
                variant={member.status === UserStatus.ACTIVE ? "success" : "secondary"}
              >
                {member.status === UserStatus.ACTIVE
                  ? t.common.active
                  : t.common.inactive}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {member.email}
              {member.phone ? ` · ${member.phone}` : ""} ·{" "}
              {t.members.profile.joinedOn(formatMonthYear(member.createdAt, locale))}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t.members.profile.totalContributions}
          value={formatAmount(member.totalContribution, settings.currency, locale)}
          icon={HandCoins}
          hint={t.members.profile.approvedHint}
        />
        <StatCard
          label={t.members.profile.approved}
          value={formatAmount(member.approvedAmount, settings.currency, locale)}
          icon={FileCheck2}
          hint={t.members.profile.approvedCountHint(member.approvedCount)}
        />
        <StatCard
          label={t.members.profile.pending}
          value={formatAmount(member.pendingAmount, settings.currency, locale)}
          icon={Hourglass}
          hint={t.members.profile.pendingCountHint(member.pendingCount)}
        />
        <StatCard
          label={t.members.profile.transactions}
          value={String(member.transactionCount)}
          icon={ReceiptText}
          hint={t.members.transactionCount}
        />
      </div>

      <div className="mt-8">
        <PageHeader title={t.members.profile.history} />
        <TransactionTable
          transactions={member.transactions}
          currency={settings.currency}
          showMember={false}
        />
      </div>
    </div>
  );
}