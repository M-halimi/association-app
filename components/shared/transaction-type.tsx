import { TransactionType } from "@prisma/client";
import type { Dict } from "@/lib/i18n/translations";

export function typeLabel(type: TransactionType, t: Dict): string {
  return t.types[type];
}