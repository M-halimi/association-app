import { TransactionStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { getDictionary } from "@/lib/i18n/server";

export async function StatusBadge({ status }: { status: TransactionStatus }) {
  const t = await getDictionary();

  switch (status) {
    case TransactionStatus.APPROVED:
      return <Badge variant="success">{t.status.APPROVED}</Badge>;
    case TransactionStatus.PENDING:
      return <Badge variant="warning">{t.status.PENDING}</Badge>;
    case TransactionStatus.REJECTED:
      return <Badge variant="destructive">{t.status.REJECTED}</Badge>;
  }
}