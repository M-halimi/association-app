"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserRoundCheck, UserRoundX } from "lucide-react";
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
import { setMemberStatus } from "@/lib/actions";
import { useI18n } from "@/lib/i18n/client";

export function MemberStatusButton({
  memberId,
  memberName,
  isActive,
}: {
  memberId: string;
  memberName: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();

  function handle() {
    startTransition(async () => {
      const result = await setMemberStatus(
        memberId,
        isActive ? "INACTIVE" : "ACTIVE",
      );
      if (result.success) {
        toast.success(
          isActive
            ? t.members.deactivatedToast
            : t.members.reactivatedToast,
        );
        router.refresh();
      } else {
        toast.error(result.error ?? t.errors.somethingWentWrong);
      }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={isActive ? "text-destructive" : "text-foreground"}
        >
          {isActive ? (
            <>
              <UserRoundX className="h-4 w-4" />
              {t.members.deactivate}
            </>
          ) : (
            <>
              <UserRoundCheck className="h-4 w-4" />
              {t.members.activate}
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActive ? t.members.deactivateTitle : t.members.reactivateTitle}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActive
              ? t.members.deactivateDescription(memberName)
              : t.members.reactivateDescription(memberName)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              handle();
            }}
          >
            {isPending
              ? t.common.saving
              : isActive
                ? t.members.deactivate
                : t.members.activate}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}