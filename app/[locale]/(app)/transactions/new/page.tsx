import { requireAuth, getAssociation } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { PageHeader } from "@/components/shared/page-header";
import { TransactionForm } from "@/components/transactions/transaction-form";

export const dynamic = "force-dynamic";

export default async function NewTransactionPage() {
  await requireAuth();
  const [settings, t] = await Promise.all([getAssociation(), getDictionary()]);

  return (
    <div>
      <PageHeader
        title={t.nav.addTransaction}
        description={t.transactions.addDescription}
      />
      <TransactionForm mode="create" currency={settings.currency} />
    </div>
  );
}