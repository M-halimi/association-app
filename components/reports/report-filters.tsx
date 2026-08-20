"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/client";

export type CsvRow = {
  reference: string;
  member: string;
  type: string;
  amount: number;
  reason: string;
  status: string;
  date: string;
};

export function ReportFilters({
  from,
  to,
  memberId,
  type,
  status,
  members,
  csvRows,
}: {
  from?: string;
  to?: string;
  memberId?: string;
  type?: string;
  status?: string;
  members: { id: string; name: string }[];
  csvRows: CsvRow[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();

  const update = useCallback(
    (patch: Record<string, string | undefined>) => {
      const params = new URLSearchParams();
      const next = {
        from: patch.from ?? from,
        to: patch.to ?? to,
        memberId: patch.memberId ?? memberId,
        type: patch.type ?? type,
        status: patch.status ?? status,
      };
      for (const [key, value] of Object.entries(next)) {
        if (value && value !== "all") params.set(key, value);
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, from, to, memberId, type, status],
  );

  function exportCsv() {
    const header = [
      t.reports.title,
      t.members.name,
      t.transactions.type,
      t.transactions.amount,
      t.transactions.reason,
      t.transactions.status,
      t.transactions.date,
    ];
    const escape = (value: string | number) => {
      const str = String(value);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const lines = [
      header.join(","),
      ...csvRows.map((row) =>
        [
          escape(row.reference),
          escape(row.member),
          escape(row.type),
          escape(row.amount),
          escape(row.reason),
          escape(row.status),
          escape(row.date),
        ].join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `association-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const hasFilters = Boolean(from || to || (memberId && memberId !== "all") || (type && type !== "all") || (status && status !== "all"));

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="grid gap-3 lg:grid-cols-5">
        <div className="min-w-0">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            {t.reports.from}
          </label>
          <Input
            type="date"
            value={from ?? ""}
            onChange={(e) => update({ from: e.target.value || undefined })}
          />
        </div>
        <div className="min-w-0">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            {t.reports.to}
          </label>
          <Input
            type="date"
            value={to ?? ""}
            onChange={(e) => update({ to: e.target.value || undefined })}
          />
        </div>
        <div className="min-w-0">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            {t.reports.member}
          </label>
          <Select
            value={memberId ?? "all"}
            onValueChange={(value) =>
              update({ memberId: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.reports.allMembers}</SelectItem>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-0">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            {t.reports.type}
          </label>
          <Select
            value={type ?? "all"}
            onValueChange={(value) =>
              update({ type: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.reports.allTypes}</SelectItem>
              <SelectItem value="CONTRIBUTION">{t.types.CONTRIBUTION}</SelectItem>
              <SelectItem value="INVESTMENT">{t.types.INVESTMENT}</SelectItem>
              <SelectItem value="EXPENSE">{t.types.EXPENSE}</SelectItem>
              <SelectItem value="OTHER">{t.types.OTHER}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-0">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            {t.reports.status}
          </label>
          <Select
            value={status ?? "all"}
            onValueChange={(value) =>
              update({ status: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.reports.allStatuses}</SelectItem>
              <SelectItem value="PENDING">{t.status.PENDING}</SelectItem>
              <SelectItem value="APPROVED">{t.status.APPROVED}</SelectItem>
              <SelectItem value="REJECTED">{t.status.REJECTED}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          disabled={!hasFilters}
          onClick={() => router.push(pathname)}
        >
          <RotateCcw className="h-4 w-4" />
          {t.reports.resetFilters}
        </Button>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="h-4 w-4" />
          {t.reports.exportCsv}
        </Button>
      </div>
    </div>
  );
}