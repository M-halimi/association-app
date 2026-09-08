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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPerson, updatePerson } from "@/lib/actions";
import { getPersonFormSchema, type PersonFormValues } from "@/lib/validations";
import { useI18n } from "@/lib/i18n/client";

export type PersonFormData = {
  id?: string;
  fullName: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  phone: string | null;
  email: string | null;
  address: string | null;
  membershipDate: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
};

function toDateString(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split("T")[0] ?? "";
}

export function PersonForm({
  mode,
  person,
  onSuccess,
}: {
  mode: "create" | "edit";
  person?: PersonFormData;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();

  const form = useForm<PersonFormValues>({
    resolver: zodResolver(getPersonFormSchema(t)),
    defaultValues: person
      ? {
          fullName: person.fullName,
          dateOfBirth: person.dateOfBirth ? toDateString(person.dateOfBirth) : "",
          gender: person.gender,
          phone: person.phone ?? "",
          email: person.email ?? "",
          address: person.address ?? "",
          membershipDate: person.membershipDate ? toDateString(person.membershipDate) : "",
          status: person.status,
        }
      : {
          fullName: "",
          dateOfBirth: "",
          gender: "MALE",
          phone: "",
          email: "",
          address: "",
          membershipDate: toDateString(new Date()),
          status: "ACTIVE",
        },
  });

  function onSubmit(values: PersonFormValues) {
    startTransition(async () => {
      const result =
        mode === "edit" && person?.id
          ? await updatePerson(person.id, values)
          : await createPerson(values);

      if (result.success) {
        toast.success(
          mode === "edit"
            ? t.people.updatedToast
            : t.people.createdToast,
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
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.people.fullName}</FormLabel>
              <FormControl>
                <Input placeholder={t.people.fullNamePlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.people.dateOfBirth}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.people.gender}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MALE">{t.people.male}</SelectItem>
                    <SelectItem value="FEMALE">{t.people.female}</SelectItem>
                    <SelectItem value="OTHER">{t.people.other}</SelectItem>
                    <SelectItem value="PREFER_NOT_TO_SAY">
                      {t.people.preferNotToSay}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.people.phone}</FormLabel>
                <FormControl>
                  <Input placeholder={t.people.phonePlaceholder} {...field} />
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
                <FormLabel>{t.people.email}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t.people.emailPlaceholder}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.people.address}</FormLabel>
              <FormControl>
                <Input placeholder={t.people.addressPlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="membershipDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.people.membershipDate}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.people.status}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ACTIVE">{t.common.active}</SelectItem>
                    <SelectItem value="INACTIVE">{t.common.inactive}</SelectItem>
                    <SelectItem value="SUSPENDED">{t.common.suspended}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
              t.people.addPerson
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
