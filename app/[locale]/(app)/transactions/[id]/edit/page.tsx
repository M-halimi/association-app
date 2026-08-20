import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Role, TransactionStatus } from "@prisma/client";
import {
  requireAuth,
  getTransactionForAdmin,
  getTransactionForUser,
  getAssociation,
  toNumber,
} from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { getLocale } from "@/lib/i18n/server";
import { pathWithLocale } from "@/lib/i18n/path";
import { PageHeader } from "@/components/shared/page-header";
import { TransactionForm } from "@/components/transactions/transaction-form";

export const dynamic = "force-dynamic";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const [settings, t, locale] = await Promise.all([
    getAssociation(),
    getDictionary(),
    getLocale(),
  ]);
  const { id } = await params;

  const transaction =
    user.role === Role.ADMIN
      ? await getTransactionForAdmin(id)
      : await getTransactionForUser(user.id, id);

  if (!transaction) {
    if (user.role === Role.ADMIN) notFound();
    redirect(pathWithLocale(locale, "/transactions"));
  }

  const isAdmin = user.role === Role.ADMIN;
  const isOwnPending =
    transaction.userId === user.id && transaction.status === TransactionStatus.PENDING;

  if (!isAdmin && !isOwnPending) {
    redirect(pathWithLocale(locale, `/transactions/${transaction.id}`));
  }

  return (
    <div>
      <Link
        href={pathWithLocale(locale, `/transactions/${transaction.id}`)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t.transactions.backToTransaction}
      </Link>
      <PageHeader
        title={t.transactions.editTitle(transaction.reference)}
        description={t.transactions.editDescription}
      />
      <TransactionForm
        mode="edit"
        currency={settings.currency}
        transaction={{
          id: transaction.id,
          amount: toNumber(transaction.amount),
          type: transaction.type,
          reason: transaction.reason,
          description: transaction.description,
          transactionDate: transaction.transactionDate,
          attachmentUrl: transaction.attachmentUrl,
        }}
      />
    </div>
  );
}