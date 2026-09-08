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
import { PersonForm, type PersonFormData } from "@/components/people/people-form";
import { useI18n } from "@/lib/i18n/client";

export function AddPersonButton() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4" />
          {t.people.add}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.people.addTitle}</DialogTitle>
          <DialogDescription>{t.people.addDescription}</DialogDescription>
        </DialogHeader>
        <PersonForm
          mode="create"
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export function EditPersonButton({ person }: { person: PersonFormData }) {
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
          <DialogTitle>{t.people.editTitle}</DialogTitle>
          <DialogDescription>{t.people.editDescription}</DialogDescription>
        </DialogHeader>
        <PersonForm
          mode="edit"
          person={person}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
