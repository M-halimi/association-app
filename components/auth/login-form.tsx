"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { authenticate } from "@/lib/actions";
import { getLoginSchema } from "@/lib/validations";
import { useI18n } from "@/lib/i18n/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(getLoginSchema(t)),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: { email: string; password: string }) {
    setError(null);
    startTransition(async () => {
      const result = await authenticate(values);
      if (!result.success) {
        setError(result.error ?? t.auth.invalidCredentials);
        return;
      }
      toast.success(t.auth.signedIn);
      router.push(callbackUrl);
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-6 space-y-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.auth.email}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t.auth.emailPlaceholder}
                  autoComplete="email"
                  {...field}
                />
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
              <FormLabel>{t.auth.password}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t.auth.passwordPlaceholder}
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.auth.signingIn}
            </>
          ) : (
            t.auth.signIn
          )}
        </Button>
      </form>
    </Form>
  );
}