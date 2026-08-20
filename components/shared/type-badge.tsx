import { TransactionType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { typeLabel } from "@/components/shared/transaction-type";
import { getDictionary } from "@/lib/i18n/server";

export async function TypeBadge({ type }: { type: TransactionType }) {
  const t = await getDictionary();
  return <Badge variant="outline">{typeLabel(type, t)}</Badge>;
}