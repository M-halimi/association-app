"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Prisma, Role, TransactionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireAdmin, requireAuth } from "@/lib/data";
import {
  getLoginSchema,
  getMemberFormSchema,
  getPersonFormSchema,
  getSettingsFormSchema,
  getTransactionFormSchema,
} from "@/lib/validations";
import { isLocale } from "@/lib/i18n/locale";
import { dictForLocale, type Dict } from "@/lib/i18n/translations";

export type ActionResult = { success: boolean; error?: string };

async function getDict(): Promise<Dict> {
  const cookieStore = await cookies();
  const lc = cookieStore.get("NEXT_LOCALE")?.value;
  return dictForLocale(isLocale(lc) ? lc : "en");
}

function zodError(error: unknown, t: Dict): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return t.errors.recordExists;
  }
  if (error instanceof Error) return error.message;
  return t.errors.somethingWentWrong;
}

async function nextReference(): Promise<string> {
  const count = await prisma.transaction.count();
  return `TRX-${String(count + 1).padStart(5, "0")}`;
}

export async function createTransaction(
  input: unknown,
): Promise<ActionResult> {
  const user = await requireAuth();
  const t = await getDict();

  const parsed = getTransactionFormSchema(t).safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const data = parsed.data;
  try {
    await prisma.transaction.create({
      data: {
        reference: await nextReference(),
        userId: user.id,
        amount: Number(data.amount),
        type: data.type,
        reason: data.reason,
        description: data.description || null,
        status: TransactionStatus.PENDING,
        transactionDate: new Date(`${data.date}T00:00:00`),
        attachmentUrl: data.attachmentUrl || null,
      },
    });
  } catch (error) {
    return { success: false, error: zodError(error, t) };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateTransaction(
  transactionId: string,
  input: unknown,
): Promise<ActionResult> {
  const user = await requireAuth();
  const t = await getDict();

  const parsed = getTransactionFormSchema(t).safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const existing = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });
  if (!existing) return { success: false, error: t.errors.transactionNotFound };

  const isAdmin = user.role === Role.ADMIN;
  const canEdit =
    isAdmin ||
    (existing.userId === user.id && existing.status === TransactionStatus.PENDING);
  if (!canEdit) {
    return { success: false, error: t.errors.notAllowedEdit };
  }

  const data = parsed.data;
  try {
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        amount: Number(data.amount),
        type: data.type,
        reason: data.reason,
        description: data.description || null,
        transactionDate: new Date(`${data.date}T00:00:00`),
        attachmentUrl: data.attachmentUrl || null,
      },
    });
  } catch (error) {
    return { success: false, error: zodError(error, t) };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteTransaction(
  transactionId: string,
): Promise<ActionResult> {
  const user = await requireAuth();
  const t = await getDict();

  const existing = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });
  if (!existing) return { success: false, error: t.errors.transactionNotFound };

  const isAdmin = user.role === Role.ADMIN;
  const canDelete =
    isAdmin ||
    (existing.userId === user.id && existing.status === TransactionStatus.PENDING);
  if (!canDelete) {
    return { success: false, error: t.errors.notAllowedDelete };
  }

  await prisma.transaction.delete({ where: { id: transactionId } });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function setTransactionStatus(
  transactionId: string,
  status: "APPROVED" | "REJECTED",
): Promise<ActionResult> {
  await requireAdmin();
  const t = await getDict();

  const existing = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });
  if (!existing) return { success: false, error: t.errors.transactionNotFound };
  if (existing.status !== TransactionStatus.PENDING) {
    return { success: false, error: t.errors.onlyPendingReview };
  }

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { status },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function createMember(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const t = await getDict();

  const parsed = getMemberFormSchema(t).safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const data = parsed.data;
  const email = data.email.toLowerCase().trim();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { success: false, error: t.errors.duplicateEmail };

  const password = data.password;
  if (!password) return { success: false, error: t.errors.passwordRequired };

  try {
    await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        password: await bcrypt.hash(password, 10),
        phone: data.phone || null,
        role: Role.MEMBER,
      },
    });
  } catch (error) {
    return { success: false, error: zodError(error, t) };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateMember(
  memberId: string,
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  const t = await getDict();

  const parsed = getMemberFormSchema(t).safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const member = await prisma.user.findUnique({ where: { id: memberId } });
  if (!member) return { success: false, error: t.errors.memberNotFound };
  if (member.role !== Role.MEMBER) {
    return { success: false, error: t.errors.onlyMembers };
  }

  const data = parsed.data;
  const email = data.email.toLowerCase().trim();

  const emailTaken = await prisma.user.findFirst({
    where: { email, id: { not: memberId } },
  });
  if (emailTaken) {
    return { success: false, error: t.errors.duplicateEmail };
  }

  try {
    await prisma.user.update({
      where: { id: memberId },
      data: {
        name: data.name.trim(),
        email,
        phone: data.phone || null,
        ...(data.password
          ? { password: await bcrypt.hash(data.password, 10) }
          : {}),
      },
    });
  } catch (error) {
    return { success: false, error: zodError(error, t) };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function setMemberStatus(
  memberId: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const t = await getDict();

  const member = await prisma.user.findUnique({ where: { id: memberId } });
  if (!member) return { success: false, error: t.errors.memberNotFound };
  if (member.id === admin.id) {
    return { success: false, error: t.errors.cannotChangeOwn };
  }

  await prisma.user.update({
    where: { id: memberId },
    data: { status },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateSettings(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const t = await getDict();

  const parsed = getSettingsFormSchema(t).safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const data = parsed.data;
  const existing = await prisma.associationSettings.findFirst();

  try {
    if (existing) {
      await prisma.associationSettings.update({
        where: { id: existing.id },
        data: {
          name: data.name.trim(),
          nameEn: data.nameEn || null,
          nameFr: data.nameFr || null,
          nameAr: data.nameAr || null,
          description: data.description || null,
          descriptionEn: data.descriptionEn || null,
          descriptionFr: data.descriptionFr || null,
          descriptionAr: data.descriptionAr || null,
          currency: data.currency,
          email: data.email || null,
          phone: data.phone || null,
          logoUrl: data.logoUrl || null,
        },
      });
    } else {
      await prisma.associationSettings.create({
        data: {
          name: data.name.trim(),
          nameEn: data.nameEn || null,
          nameFr: data.nameFr || null,
          nameAr: data.nameAr || null,
          description: data.description || null,
          descriptionEn: data.descriptionEn || null,
          descriptionFr: data.descriptionFr || null,
          descriptionAr: data.descriptionAr || null,
          currency: data.currency,
          email: data.email || null,
          phone: data.phone || null,
          logoUrl: data.logoUrl || null,
        },
      });
    }
  } catch (error) {
    return { success: false, error: zodError(error, t) };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function createPerson(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const t = await getDict();

  const parsed = getPersonFormSchema(t).safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const data = parsed.data;
  try {
    await prisma.person.create({
      data: {
        fullName: data.fullName.trim(),
        dateOfBirth: new Date(`${data.dateOfBirth}T00:00:00`),
        gender: data.gender,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        membershipDate: new Date(`${data.membershipDate}T00:00:00`),
        status: data.status,
      },
    });
  } catch (error) {
    return { success: false, error: zodError(error, t) };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function updatePerson(
  personId: string,
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  const t = await getDict();

  const parsed = getPersonFormSchema(t).safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const existing = await prisma.person.findUnique({ where: { id: personId } });
  if (!existing) return { success: false, error: t.errors.personNotFound };

  const data = parsed.data;
  try {
    await prisma.person.update({
      where: { id: personId },
      data: {
        fullName: data.fullName.trim(),
        dateOfBirth: new Date(`${data.dateOfBirth}T00:00:00`),
        gender: data.gender,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        membershipDate: new Date(`${data.membershipDate}T00:00:00`),
        status: data.status,
      },
    });
  } catch (error) {
    return { success: false, error: zodError(error, t) };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deletePerson(
  personId: string,
): Promise<ActionResult> {
  await requireAdmin();
  const t = await getDict();

  const existing = await prisma.person.findUnique({ where: { id: personId } });
  if (!existing) return { success: false, error: t.errors.personNotFound };

  await prisma.person.delete({ where: { id: personId } });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signOutAction(): Promise<void> {
  const { signOut } = await import("@/lib/auth");
  await signOut({ redirectTo: "/login" });
}

export async function authenticate(input: unknown): Promise<ActionResult> {
  const t = await getDict();

  const parsed = getLoginSchema(t).safeParse(input);
  if (!parsed.success) {
    return { success: false, error: t.errors.invalidEmailOrPassword };
  }

  const { signIn } = await import("@/lib/auth");
  const { AuthError } = await import("next-auth");

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: t.errors.invalidEmailOrPassword };
    }
    throw error;
  }

  return { success: true };
}