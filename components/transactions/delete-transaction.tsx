"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteTransaction } from "@/lib/actions";
import { useI18n } from "@/lib/i18n/client";

export function DeleteTransactionButton({
  transactionId,
  reference,
}: {
  transactionId: string;
  reference: string;
}) {
  const router = useRouter();
  const { t, path } = useI18n();
  const [isPending, startTransition] = useTransition();

  function handle() {
    startTransition(async () => {
      const result = await deleteTransaction(transactionId);
      if (result.success) {
        toast.success(t.transactions.deletedToast);
        router.push(path("/transactions"));
        router.refresh();
      } else {
        toast.error(result.error ?? t.errors.somethingWentWrong);
      }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive">
          <Trash2 className="h-4 w-4" />
          {t.common.delete}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.transactions.deleteTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.transactions.deleteDescription(reference)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              handle();
            }}
          >
            {isPending ? t.common.deleting : t.common.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}