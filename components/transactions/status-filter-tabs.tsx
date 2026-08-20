"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";

export function StatusFilterTabs({
  statuses,
  active,
  counts,
}: {
  statuses: { value: string; label: string }[];
  active: string;
  counts?: Record<string, number>;
}) {
  const { path } = useI18n();

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-card p-1">
      {statuses.map((status) => {
        const isActive = active === status.value;
        const count = counts?.[status.value];
        return (
          <Link
            key={status.value}
            href={
              status.value === "all"
                ? path("/transactions")
                : path(`/transactions?status=${status.value}`)
            }
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {status.label}
            {typeof count === "number" && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}