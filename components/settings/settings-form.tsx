"use client";

import { useTransition, useState } from "react";
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
import { updateSettings } from "@/lib/actions";
import { getSettingsFormSchema, type SettingsFormValues } from "@/lib/validations";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

const TRANSLATION_LOCALES = [
  { code: "en", name: "nameEn", description: "descriptionEn" },
  { code: "fr", name: "nameFr", description: "descriptionFr" },
  { code: "ar", name: "nameAr", description: "descriptionAr" },
] as const;

type TranslationLocale = (typeof TRANSLATION_LOCALES)[number]["code"];

export function SettingsForm({
  settings,
}: {
  settings: {
    name: string;
    nameEn: string | null;
    nameFr: string | null;
    nameAr: string | null;
    description: string | null;
    descriptionEn: string | null;
    descriptionFr: string | null;
    descriptionAr: string | null;
    currency: string;
    email: string | null;
    phone: string | null;
    logoUrl: string | null;
  };
}) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [translationLocale, setTranslationLocale] = useState<TranslationLocale>(
    locale === "ar" ? "ar" : locale === "fr" ? "fr" : "en",
  );

  const translationLabels = {
    en: { name: t.settings.nameEn, description: t.settings.descriptionEn },
    fr: { name: t.settings.nameFr, description: t.settings.descriptionFr },
    ar: { name: t.settings.nameAr, description: t.settings.descriptionAr },
  } as const;

  const translationPlaceholders = {
    en: "Association of Unity and Solidarity…",
    fr: "Association de l'Unité et de la Solidarité…",
    ar: "جمعية الوحدة والتضامن للتنمية المستدامة…",
  } as const;

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(getSettingsFormSchema(t)),
    defaultValues: {
      name: settings.name,
      nameEn: settings.nameEn ?? "",
      nameFr: settings.nameFr ?? "",
      nameAr: settings.nameAr ?? "",
      description: settings.description ?? "",
      descriptionEn: settings.descriptionEn ?? "",
      descriptionFr: settings.descriptionFr ?? "",
      descriptionAr: settings.descriptionAr ?? "",
      currency: settings.currency,
      email: settings.email ?? "",
      phone: settings.phone ?? "",
      logoUrl: settings.logoUrl ?? "",
    },
  });

  function onSubmit(values: SettingsFormValues) {
    startTransition(async () => {
      const result = await updateSettings(values);
      if (result.success) {
        toast.success(t.settings.savedToast);
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.settings.associationName}</FormLabel>
              <FormControl>
                <Input placeholder={t.settings.associationNamePlaceholder} {...field} />
              </FormControl>
              <FormDescription>{t.settings.associationNameHint}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.settings.description}</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder={t.settings.descriptionPlaceholder}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <h3 className="text-sm font-semibold text-foreground">
            {t.settings.translations}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t.settings.translationsHint}
          </p>

          <div
            role="tablist"
            aria-label={t.settings.translations}
            className="mt-4 flex min-w-0 flex-wrap gap-1 rounded-lg border border-border bg-background/60 p-1"
          >
            {TRANSLATION_LOCALES.map((lang) => {
              const selected = translationLocale === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setTranslationLocale(lang.code)}
                  className={cn(
                    "min-w-0 flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
                  )}
                >
                  {t.languages[lang.code]}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-4">
            {TRANSLATION_LOCALES.map((lang) => (
              <div
                key={lang.code}
                dir={lang.code === "ar" ? "rtl" : "ltr"}
                className={cn(
                  "grid min-w-0 gap-4",
                  translationLocale !== lang.code && "hidden",
                )}
              >
                <FormField
                  control={form.control}
                  name={lang.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translationLabels[lang.code].name}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={translationPlaceholders[lang.code]}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={lang.description}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translationLabels[lang.code].description}</FormLabel>
                      <FormControl>
                        <Textarea rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.settings.currency}</FormLabel>
                <FormControl>
                  <Input
                    placeholder="MAD"
                    maxLength={10}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t.settings.currencyHint}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.settings.logo}</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder={t.settings.logoPlaceholder}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t.settings.logoHint}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.settings.contactEmail}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t.settings.emailPlaceholder} {...field} />
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
                <FormLabel>{t.settings.phone}</FormLabel>
                <FormControl>
                  <Input placeholder={t.settings.phonePlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.common.saving}
            </>
          ) : (
            t.settings.save
          )}
        </Button>
      </form>
    </Form>
  );
}