import { ComponentType } from "react";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[13px] font-medium text-muted-foreground">
          {label}
        </p>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/10">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 truncate text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-[1.75rem]">
        {value}
      </p>
      {hint && <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}