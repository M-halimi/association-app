import { Plus, ReceiptText } from "lucide-react";
import { TransactionStatus } from "@prisma/client";
import { requireAuth, getAllTransactions, getTransactionsForUser, getAssociation } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { PageHeader } from "@/components/shared/page-header";
import { LinkButton } from "@/components/shared/link-button";
import { EmptyState } from "@/components/shared/empty-state";
import { TransactionTable } from "@/components/shared/transaction-table";
import { ApproveRejectButtons } from "@/components/transactions/approve-reject";
import { StatusFilterTabs } from "@/components/transactions/status-filter-tabs";

export const dynamic = "force-dynamic";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireAuth();
  const [settings, t] = await Promise.all([getAssociation(), getDictionary()]);
  const { status } = await searchParams;

  const isAdmin = user.role === "ADMIN";
  const all = isAdmin
    ? await getAllTransactions()
    : await getTransactionsForUser(user.id);

  const filtered =
    status && status !== "all"
      ? all.filter((t) => t.status === status)
      : all;

  const statuses = [
    { value: "all", label: t.common.all },
    { value: "PENDING", label: t.status.PENDING },
    { value: "APPROVED", label: t.status.APPROVED },
    { value: "REJECTED", label: t.status.REJECTED },
  ];

  return (
    <div>
      <PageHeader
        title={t.transactions.title}
        description={
          isAdmin
            ? t.transactions.adminDescription
            : t.transactions.memberDescription
        }
        action={
          <LinkButton href="/transactions/new">
            <Plus className="h-4 w-4" />
            {t.transactions.add}
          </LinkButton>
        }
      />

      <StatusFilterTabs
        statuses={statuses}
        active={status ?? "all"}
        counts={{
          all: all.length,
          PENDING: all.filter((t) => t.status === TransactionStatus.PENDING).length,
          APPROVED: all.filter((t) => t.status === TransactionStatus.APPROVED).length,
          REJECTED: all.filter((t) => t.status === TransactionStatus.REJECTED).length,
        }}
      />

      <div className="mt-4">
        {all.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title={t.transactions.noTransactions}
            description={t.transactions.noTransactionsDescription}
            action={
              <LinkButton href="/transactions/new">
                <Plus className="h-4 w-4" />
                {t.transactions.add}
              </LinkButton>
            }
          />
        ) : (
          <TransactionTable
            transactions={filtered}
            currency={settings.currency}
            renderActions={
              isAdmin
                ? (transaction) =>
                    transaction.status === TransactionStatus.PENDING ? (
                      <ApproveRejectButtons transactionId={transaction.id} />
                    ) : null
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}