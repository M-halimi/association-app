"use client";

import { useState } from "react";
import { PencilLine, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MemberForm, MemberFormData } from "@/components/members/member-form";
import { useI18n } from "@/lib/i18n/client";

export function AddMemberButton() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4" />
          {t.members.add}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.members.addTitle}</DialogTitle>
          <DialogDescription>{t.members.addDescription}</DialogDescription>
        </DialogHeader>
        <MemberForm
          mode="create"
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export function EditMemberButton({ member }: { member: MemberFormData }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <PencilLine className="h-4 w-4" />
          {t.common.edit}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.members.editTitle}</DialogTitle>
          <DialogDescription>{t.members.editDescription}</DialogDescription>
        </DialogHeader>
        <MemberForm
          mode="edit"
          member={member}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}