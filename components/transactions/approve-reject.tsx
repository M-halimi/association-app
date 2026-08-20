"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setTransactionStatus } from "@/lib/actions";
import { useI18n } from "@/lib/i18n/client";

export function ApproveRejectButtons({
  transactionId,
}: {
  transactionId: string;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();

  function handle(status: "APPROVED" | "REJECTED") {
    startTransition(async () => {
      const result = await setTransactionStatus(transactionId, status);
      if (result.success) {
        toast.success(
          status === "APPROVED"
            ? t.transactions.approvedToast
            : t.transactions.rejectedToast,
        );
        router.refresh();
      } else {
        toast.error(result.error ?? t.errors.somethingWentWrong);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        disabled={isPending}
        onClick={() => handle("APPROVED")}
      >
        <Check className="h-4 w-4" />
        {t.transactions.approve}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => handle("REJECTED")}
      >
        <X className="h-4 w-4" />
        {t.transactions.reject}
      </Button>
    </div>
  );
}