"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createMember, updateMember } from "@/lib/actions";
import { getMemberFormSchema, type MemberFormValues } from "@/lib/validations";
import { useI18n } from "@/lib/i18n/client";

export type MemberFormData = {
  id?: string;
  name: string;
  email: string;
  phone: string | null;
};

export function MemberForm({
  mode,
  member,
  onSuccess,
}: {
  mode: "create" | "edit";
  member?: MemberFormData;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(getMemberFormSchema(t)),
    defaultValues: member
      ? {
          name: member.name,
          email: member.email,
          phone: member.phone ?? "",
          password: "",
        }
      : {
          name: "",
          email: "",
          phone: "",
          password: "",
        },
  });

  function onSubmit(values: MemberFormValues) {
    startTransition(async () => {
      const result =
        mode === "edit" && member?.id
          ? await updateMember(member.id, values)
          : await createMember(values);

      if (result.success) {
        toast.success(
          mode === "edit"
            ? t.members.updatedToast
            : t.members.createdToast,
        );
        onSuccess?.();
        router.refresh();
      } else {
        toast.error(result.error ?? t.errors.somethingWentWrong);
      }
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.members.fullName}</FormLabel>
              <FormControl>
                <Input placeholder={t.members.fullNamePlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.auth.email}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t.members.emailPlaceholder}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.members.phone}</FormLabel>
              <FormControl>
                <Input placeholder={t.members.phonePlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {mode === "edit" ? t.members.newPassword : t.members.password}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t.members.passwordPlaceholder}
                  {...field}
                />
              </FormControl>
              {mode === "edit" ? (
                <FormDescription>{t.members.passwordHint}</FormDescription>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.common.saving}
              </>
            ) : mode === "edit" ? (
              t.common.saveChanges
            ) : (
              t.members.addMember
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}