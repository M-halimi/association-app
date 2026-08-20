import { z } from "zod";
import { TransactionType } from "@prisma/client";
import { en, type Dict } from "@/lib/i18n/en";

export function getLoginSchema(t: Dict) {
  return z.object({
    email: z.email(t.validation.invalidEmail),
    password: z.string().min(1, t.validation.passwordRequired),
  });
}

export const loginSchema = getLoginSchema(en);

export type LoginValues = z.infer<typeof loginSchema>;

export function getAmountSchema(t: Dict) {
  return z
    .string()
    .trim()
    .min(1, t.validation.amountRequired)
    .refine((value) => {
      const amount = Number(value);
      return Number.isFinite(amount) && amount > 0;
    }, t.validation.amountPositive)
    .refine((value) => Number(value) <= 999_999_999.99, t.validation.amountTooLarge);
}

export function getTransactionFormSchema(t: Dict) {
  return z.object({
    amount: getAmountSchema(t),
    type: z.nativeEnum(TransactionType, {
      error: t.validation.typeRequired,
    }),
    reason: z
      .string()
      .trim()
      .min(3, t.validation.reasonMin)
      .max(200, t.validation.reasonMax),
    description: z
      .string()
      .trim()
      .max(1000, t.validation.descriptionMax)
      .optional()
      .or(z.literal("")),
    date: z
      .string()
      .min(1, t.validation.dateRequired)
      .refine(
        (value) => !Number.isNaN(Date.parse(value)),
        t.validation.dateInvalid,
      ),
    attachmentUrl: z
      .string()
      .trim()
      .max(500, t.validation.attachmentMax)
      .optional()
      .or(z.literal("")),
  });
}

export const transactionFormSchema = getTransactionFormSchema(en);

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export function getMemberFormSchema(t: Dict) {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(2, t.validation.nameMin)
        .max(100, t.validation.nameMax),
      email: z.email(t.validation.invalidEmail),
      phone: z
        .string()
        .trim()
        .max(30, t.validation.phoneMax)
        .optional()
        .or(z.literal("")),
      password: z
        .string()
        .min(8, t.validation.passwordMin)
        .max(100, t.validation.passwordMax)
        .optional()
        .or(z.literal("")),
    })
    .refine((data) => data.password && data.password.length >= 8, {
      message: t.validation.passwordMin,
      path: ["password"],
    });
}

export const memberFormSchema = getMemberFormSchema(en);

export type MemberFormValues = z.infer<typeof memberFormSchema>;

export function getSettingsFormSchema(t: Dict) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, t.validation.associationNameMin)
      .max(120, t.validation.associationNameMax),
    nameEn: z
      .string()
      .trim()
      .max(120, t.validation.associationNameMax)
      .optional()
      .or(z.literal("")),
    nameFr: z
      .string()
      .trim()
      .max(120, t.validation.associationNameMax)
      .optional()
      .or(z.literal("")),
    nameAr: z
      .string()
      .trim()
      .max(120, t.validation.associationNameMax)
      .optional()
      .or(z.literal("")),
    description: z
      .string()
      .trim()
      .max(1000, t.validation.descriptionMax)
      .optional()
      .or(z.literal("")),
    descriptionEn: z
      .string()
      .trim()
      .max(1000, t.validation.descriptionMax)
      .optional()
      .or(z.literal("")),
    descriptionFr: z
      .string()
      .trim()
      .max(1000, t.validation.descriptionMax)
      .optional()
      .or(z.literal("")),
    descriptionAr: z
      .string()
      .trim()
      .max(1000, t.validation.descriptionMax)
      .optional()
      .or(z.literal("")),
    currency: z
      .string()
      .trim()
      .min(1, t.validation.currencyRequired)
      .max(10, t.validation.currencyMax)
      .toUpperCase(),
    email: z
      .union([z.email(t.validation.invalidEmail), z.literal("")])
      .optional(),
    phone: z
      .string()
      .trim()
      .max(30, t.validation.phoneMax)
      .optional()
      .or(z.literal("")),
    logoUrl: z
      .string()
      .trim()
      .max(500, t.validation.logoMax)
      .optional()
      .or(z.literal("")),
  });
}

export const settingsFormSchema = getSettingsFormSchema(en);

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;