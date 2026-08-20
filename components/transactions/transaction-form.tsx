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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTransaction, updateTransaction } from "@/lib/actions";
import { getTransactionFormSchema, type TransactionFormValues } from "@/lib/validations";
import { typeLabel } from "@/components/shared/transaction-type";
import { useI18n } from "@/lib/i18n/client";

const types = ["CONTRIBUTION", "INVESTMENT", "EXPENSE", "OTHER"] as const;

function toDateInputValue(date: Date | string): string {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export function TransactionForm({
  mode,
  currency,
  transaction,
}: {
  mode: "create" | "edit";
  currency: string;
  transaction?: {
    id: string;
    amount: number;
    type: string;
    reason: string;
    description: string | null;
    transactionDate: Date;
    attachmentUrl: string | null;
  };
}) {
  const router = useRouter();
  const { t, path } = useI18n();
  const [isPending, startTransition] = useTransition();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(getTransactionFormSchema(t)),
    defaultValues: transaction
      ? {
          amount: String(transaction.amount),
          type: transaction.type as TransactionFormValues["type"],
          reason: transaction.reason,
          description: transaction.description ?? "",
          date: toDateInputValue(transaction.transactionDate),
          attachmentUrl: transaction.attachmentUrl ?? "",
        }
      : {
          amount: "",
          type: undefined,
          reason: "",
          description: "",
          date: new Date().toISOString().slice(0, 10),
          attachmentUrl: "",
        },
  });

  function onSubmit(values: TransactionFormValues) {
    startTransition(async () => {
      const result =
        mode === "edit" && transaction
          ? await updateTransaction(transaction.id, values)
          : await createTransaction(values);

      if (result.success) {
        toast.success(
          mode === "edit"
            ? t.transactions.updatedToast
            : t.transactions.createdToast,
        );
        router.push(path("/transactions"));
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
        className="max-w-xl space-y-5"
        noValidate
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.transactions.form.amount}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0.01"
                      placeholder={t.transactions.form.amountPlaceholder}
                      className="pe-16"
                      {...field}
                    />
                    <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-muted-foreground">
                      {currency}
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.transactions.form.type}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t.transactions.form.selectType} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {typeLabel(type, t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.transactions.form.reason}</FormLabel>
              <FormControl>
                <Input placeholder={t.transactions.form.reasonPlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.transactions.form.description}</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder={t.transactions.form.descriptionPlaceholder}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.transactions.form.date}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="attachmentUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.transactions.form.attachment}</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder={t.transactions.form.attachmentPlaceholder}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {t.transactions.form.attachmentHint}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.common.saving}
              </>
            ) : mode === "edit" ? (
              t.common.saveChanges
            ) : (
              t.transactions.form.submit
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            {t.common.cancel}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          {t.transactions.form.pendingNote(t.status.PENDING)}
        </p>
      </form>
    </Form>
  );
}