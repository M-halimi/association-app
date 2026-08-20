import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Paperclip, PencilLine } from "lucide-react";
import { Role, TransactionStatus } from "@prisma/client";
import {
  requireAuth,
  getTransactionForAdmin,
  getTransactionForUser,
  getAssociation,
  toNumber,
} from "@/lib/data";
import { formatAmount, formatDate, formatDateTime } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/server";
import { getLocale } from "@/lib/i18n/server";
import { pathWithLocale } from "@/lib/i18n/path";
import { StatusBadge } from "@/components/shared/status-badge";
import { typeLabel } from "@/components/shared/transaction-type";
import { ApproveRejectButtons } from "@/components/transactions/approve-reject";
import { DeleteTransactionButton } from "@/components/transactions/delete-transaction";
import { LinkButton } from "@/components/shared/link-button";

export const dynamic = "force-dynamic";

export default async function TransactionDetailPage({
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
  const isPending = transaction.status === TransactionStatus.PENDING;
  const canEdit =
    isAdmin || (transaction.userId === user.id && isPending);
  const canDelete =
    isAdmin || (transaction.userId === user.id && isPending);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={pathWithLocale(locale, "/transactions")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t.transactions.backToList}
      </Link>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="text-sm text-muted-foreground">
              {t.transactions.transactionRef(transaction.reference)}
            </p>
            <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {formatAmount(toNumber(transaction.amount), settings.currency, locale)}
            </p>
          </div>
          <StatusBadge status={transaction.status} />
        </div>

        <dl className="grid gap-x-8 gap-y-4 p-5 sm:grid-cols-2">
          <Detail label={t.transactions.member} value={transaction.user.name} />
          <Detail label={t.transactions.type} value={typeLabel(transaction.type, t)} />
          <Detail label={t.transactions.reason} value={transaction.reason} span />
          {transaction.description ? (
            <Detail label={t.transactions.description} value={transaction.description} span />
          ) : null}
          <Detail
            label={t.transactions.date}
            value={formatDate(transaction.transactionDate, locale)}
          />
          <Detail
            label={t.transactions.created}
            value={formatDateTime(transaction.createdAt, locale)}
          />
          {transaction.attachmentUrl ? (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-muted-foreground">
                {t.transactions.attachment}
              </dt>
              <dd className="mt-1">
                <Link
                  href={transaction.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <Paperclip className="h-4 w-4" />
                  {t.transactions.viewAttachment}
                </Link>
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {isAdmin && isPending && (
          <ApproveRejectButtons transactionId={transaction.id} />
        )}
        {canEdit && (
          <LinkButton
            href={pathWithLocale(locale, `/transactions/${transaction.id}/edit`)}
            variant="outline"
            size="sm"
          >
            <PencilLine className="h-4 w-4" />
            {t.common.edit}
          </LinkButton>
        )}
        {canDelete && (
          <DeleteTransactionButton
            transactionId={transaction.id}
            reference={transaction.reference}
          />
        )}
      </div>

      {!isAdmin && !isPending && (
        <p className="mt-4 text-sm text-muted-foreground">
          {t.transactions.notEditablePrefix}{" "}
          {transaction.status === TransactionStatus.APPROVED
            ? t.transactions.notEditableApproved
            : t.transactions.notEditableRejected}
        </p>
      )}
    </div>
  );
}

function Detail({
  label,
  value,
  span,
}: {
  label: string;
  value: string;
  span?: boolean;
}) {
  return (
    <div className={span ? "sm:col-span-2" : ""}>
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
    </div>
  );
}