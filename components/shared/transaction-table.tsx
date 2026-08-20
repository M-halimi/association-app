import Link from "next/link";
import { Decimal } from "@prisma/client/runtime/library";
import {
  TransactionStatus,
  TransactionType,
} from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { TypeBadge } from "@/components/shared/type-badge";
import { formatAmount, formatDate } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/server";
import { getLocale } from "@/lib/i18n/server";
import { pathWithLocale } from "@/lib/i18n/path";

export type TransactionRow = {
  id: string;
  reference: string;
  amount: Decimal | number;
  type: TransactionType;
  reason: string;
  status: TransactionStatus;
  transactionDate: Date;
  user: { name: string };
};

export async function TransactionTable({
  transactions,
  currency,
  showMember = true,
  renderActions,
}: {
  transactions: TransactionRow[];
  currency: string;
  showMember?: boolean;
  renderActions?: (transaction: TransactionRow) => React.ReactNode;
}) {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const hasActions = Boolean(renderActions);

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card py-10 text-center text-sm text-muted-foreground">
        {t.transactions.noResults}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table className="min-w-[620px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {showMember && <TableHead>{t.transactions.member}</TableHead>}
            <TableHead>{t.transactions.type}</TableHead>
            <TableHead className="text-end">{t.transactions.amount}</TableHead>
            <TableHead>{t.transactions.reason}</TableHead>
            <TableHead>{t.transactions.status}</TableHead>
            <TableHead>{t.transactions.date}</TableHead>
            {hasActions && <TableHead className="w-40">{t.transactions.actions}</TableHead>}
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              {showMember && (
                <TableCell className="whitespace-normal break-words font-medium text-foreground">
                  {transaction.user.name}
                </TableCell>
              )}
              <TableCell>
                <TypeBadge type={transaction.type} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-end font-medium tabular-nums text-foreground">
                {formatAmount(Number(transaction.amount), currency, locale)}
              </TableCell>
              <TableCell className="max-w-52 truncate whitespace-nowrap text-muted-foreground">
                {transaction.reason}
              </TableCell>
              <TableCell>
                <StatusBadge status={transaction.status} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatDate(transaction.transactionDate, locale)}
              </TableCell>
              {hasActions && (
                <TableCell>
                  {renderActions?.(transaction) ?? null}
                </TableCell>
              )}
              <TableCell className="whitespace-nowrap text-end">
                <Link
                  href={pathWithLocale(locale, `/transactions/${transaction.id}`)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {t.common.view}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}