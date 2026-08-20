import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { locale } from "next/root-params";
import { Decimal } from "@prisma/client/runtime/library";
import {
  Role,
  TransactionStatus,
  TransactionType,
  UserStatus,
} from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locale";

const ASSOCIATION_NAME_AR =
  "جمعية الوحدة والتضامن للتنمية المستدامة والمحافظة على البيئة";
const ASSOCIATION_NAME_EN =
  "Association of Unity and Solidarity for Sustainable Development and Environmental Preservation";
const ASSOCIATION_NAME_FR =
  "Association de l'Unité et de la Solidarité pour le Développement Durable et la Préservation de l'Environnement";

export function localizedName(
  settings: {
    name: string;
    nameEn: string | null;
    nameFr: string | null;
    nameAr: string | null;
  },
  locale: Locale,
): string {
  if (locale === "en") return settings.nameEn ?? settings.name;
  if (locale === "fr") return settings.nameFr ?? settings.name;
  if (locale === "ar") return settings.nameAr ?? settings.name;
  return settings.name;
}

export function localizedDescription(
  settings: {
    description: string | null;
    descriptionEn: string | null;
    descriptionFr: string | null;
    descriptionAr: string | null;
  },
  locale: Locale,
): string | null {
  if (locale === "en") return settings.descriptionEn ?? settings.description;
  if (locale === "fr") return settings.descriptionFr ?? settings.description;
  if (locale === "ar") return settings.descriptionAr ?? settings.description;
  return settings.description;
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export function toNumber(value: Decimal | number): number {
  return typeof value === "number" ? value : Number(value);
}

export const getSession = cache(async (): Promise<SessionUser | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    role: session.user.role,
  };
});

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth();
  if (session.role !== Role.ADMIN) redirect("/");
  return session;
}

export const getSettings = cache(async () => {
  const existing = await prisma.associationSettings.findFirst();
  if (existing) return existing;

  const created = await prisma.associationSettings.create({
    data: {
      name: ASSOCIATION_NAME_AR,
      nameEn: ASSOCIATION_NAME_EN,
      nameFr: ASSOCIATION_NAME_FR,
      nameAr: ASSOCIATION_NAME_AR,
      description:
        "جمعية مجتمعية تعمل معًا لدعم الأنشطة المحلية والتعليم والمشاريع الخيرية.",
      descriptionEn:
        "A community association working together to support local activities, education and charitable projects.",
      descriptionFr:
        "Une association communautaire œuvrant ensemble pour soutenir les activités locales, l'éducation et les projets caritatifs.",
      descriptionAr:
        "جمعية مجتمعية تعمل معًا لدعم الأنشطة المحلية والتعليم والمشاريع الخيرية.",
      currency: "MAD",
    },
  });
  return created;
});

export async function getAssociation() {
  const settings = await getSettings();
  const lang = await locale();
  const currentLocale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  return {
    ...settings,
    name: localizedName(settings, currentLocale),
    description: localizedDescription(settings, currentLocale),
  };
}

export async function getDashboardStats(user: SessionUser) {
  if (user.role === Role.ADMIN) {
    const [
      settings,
      totalContributions,
      totalInvestments,
      totalExpenses,
      memberCount,
      approvedCount,
      pendingCount,
      recentTransactions,
      typeTotals,
    ] = await Promise.all([
      getSettings(),
      prisma.transaction.aggregate({
        where: {
          status: TransactionStatus.APPROVED,
          type: TransactionType.CONTRIBUTION,
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          status: TransactionStatus.APPROVED,
          type: TransactionType.INVESTMENT,
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          status: TransactionStatus.APPROVED,
          type: TransactionType.EXPENSE,
        },
        _sum: { amount: true },
      }),
      prisma.user.count({ where: { role: Role.MEMBER } }),
      prisma.transaction.count({
        where: { status: TransactionStatus.APPROVED },
      }),
      prisma.transaction.count({ where: { status: TransactionStatus.PENDING } }),
      prisma.transaction.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { select: { name: true } } },
      }),
      prisma.transaction.groupBy({
        by: ["type", "status"],
        where: { status: TransactionStatus.APPROVED },
        _sum: { amount: true },
      }),
    ]);

    const contributions =
      toNumber(totalContributions._sum.amount ?? 0) +
      toNumber(totalInvestments._sum.amount ?? 0);
    const expenses = toNumber(totalExpenses._sum.amount ?? 0);

    return {
      settings,
      contributions,
      expenses,
      balance: contributions - expenses,
      memberCount,
      approvedCount,
      pendingCount,
      recentTransactions,
      typeTotals: typeTotals.map((t) => ({
        type: t.type,
        status: t.status,
        _sum: { amount: t._sum.amount === null ? null : toNumber(t._sum.amount) },
      })),
    };
  }

  const userId = user.id;
  const [settings, contributions, investments, expenses, approvedCount, pendingCount, recentTransactions] =
    await Promise.all([
      getSettings(),
      prisma.transaction.aggregate({
        where: {
          userId,
          status: TransactionStatus.APPROVED,
          type: TransactionType.CONTRIBUTION,
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          status: TransactionStatus.APPROVED,
          type: TransactionType.INVESTMENT,
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          status: TransactionStatus.APPROVED,
          type: TransactionType.EXPENSE,
        },
        _sum: { amount: true },
      }),
      prisma.transaction.count({
        where: { userId, status: TransactionStatus.APPROVED },
      }),
      prisma.transaction.count({ where: { userId, status: TransactionStatus.PENDING } }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { select: { name: true } } },
      }),
    ]);

  return {
    settings,
    contributions:
      toNumber(contributions._sum.amount ?? 0) +
      toNumber(investments._sum.amount ?? 0),
    expenses: toNumber(expenses._sum.amount ?? 0),
    balance:
      toNumber(contributions._sum.amount ?? 0) +
      toNumber(investments._sum.amount ?? 0) -
      toNumber(expenses._sum.amount ?? 0),
    approvedCount,
    pendingCount,
    recentTransactions,
    typeTotals: [] as {
      type: TransactionType;
      status: TransactionStatus;
      _sum: { amount: number | null };
    }[],
  };
}

export async function getTransactionsForUser(userId: string) {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { transactionDate: "desc" },
    include: { user: { select: { name: true } } },
  });
}

export async function getAllTransactions() {
  return prisma.transaction.findMany({
    orderBy: { transactionDate: "desc" },
    include: { user: { select: { id: true, name: true } } },
  });
}

export async function getTransactionForUser(
  userId: string,
  transactionId: string,
) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { user: { select: { name: true } } },
  });
  if (!transaction || transaction.userId !== userId) return null;
  return transaction;
}

export async function getTransactionForAdmin(transactionId: string) {
  return prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { user: { select: { id: true, name: true } } },
  });
}

export type MemberListItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: UserStatus;
  createdAt: Date;
  totalApproved: number;
  totalPending: number;
  transactionCount: number;
};

export async function getMembersList(): Promise<MemberListItem[]> {
  const members = await prisma.user.findMany({
    where: { role: Role.MEMBER },
    orderBy: { createdAt: "asc" },
    include: {
      transactions: {
        select: { amount: true, status: true },
      },
    },
  });

  return members.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    phone: member.phone,
    status: member.status,
    createdAt: member.createdAt,
    totalApproved: member.transactions
      .filter((t) => t.status === TransactionStatus.APPROVED)
      .reduce((sum, t) => sum + toNumber(t.amount), 0),
    totalPending: member.transactions
      .filter((t) => t.status === TransactionStatus.PENDING)
      .reduce((sum, t) => sum + toNumber(t.amount), 0),
    transactionCount: member.transactions.length,
  }));
}

export async function getMemberProfile(memberId: string) {
  const member = await prisma.user.findUnique({
    where: { id: memberId },
    include: {
      transactions: {
        orderBy: { transactionDate: "desc" },
      },
    },
  });
  if (!member || member.role !== Role.MEMBER) return null;

  const approved = member.transactions.filter(
    (t) => t.status === TransactionStatus.APPROVED,
  );
  const pending = member.transactions.filter(
    (t) => t.status === TransactionStatus.PENDING,
  );
  const approvedIn = approved
    .filter((t) => t.type !== TransactionType.EXPENSE)
    .reduce((sum, t) => sum + toNumber(t.amount), 0);
  const approvedOut = approved
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + toNumber(t.amount), 0);

  return {
    ...member,
    transactions: member.transactions.map((t) => ({
      ...t,
      user: { name: member.name },
    })),
    totalContribution: approvedIn,
    approvedAmount: approvedIn,
    pendingAmount: pending.reduce((sum, t) => sum + toNumber(t.amount), 0),
    approvedExpenses: approvedOut,
    transactionCount: member.transactions.length,
    pendingCount: pending.length,
    approvedCount: approved.length,
  };
}

export type ReportFilters = {
  from?: string;
  to?: string;
  memberId?: string;
  type?: string;
  status?: string;
};

export async function getReportData(filters: ReportFilters) {
  const where: Record<string, unknown> = {};

  if (filters.from) {
    where.transactionDate = {
      ...(where.transactionDate as object),
      gte: new Date(`${filters.from}T00:00:00`),
    };
  }
  if (filters.to) {
    where.transactionDate = {
      ...(where.transactionDate as object),
      lte: new Date(`${filters.to}T23:59:59`),
    };
  }
  if (filters.memberId && filters.memberId !== "all") {
    where.userId = filters.memberId;
  }
  if (filters.type && filters.type !== "all") {
    where.type = filters.type;
  }
  if (filters.status && filters.status !== "all") {
    where.status = filters.status;
  }

  const [transactions, members, settings] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { transactionDate: "desc" },
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.user.findMany({
      where: { role: Role.MEMBER },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    getSettings(),
  ]);

  const approved = transactions.filter(
    (t) => t.status === TransactionStatus.APPROVED,
  );
  const pending = transactions.filter(
    (t) => t.status === TransactionStatus.PENDING,
  );

  const totalContributions = approved
    .filter((t) => t.type === TransactionType.CONTRIBUTION)
    .reduce((sum, t) => sum + toNumber(t.amount), 0);
  const totalInvestments = approved
    .filter((t) => t.type === TransactionType.INVESTMENT)
    .reduce((sum, t) => sum + toNumber(t.amount), 0);
  const totalExpenses = approved
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + toNumber(t.amount), 0);
  const totalOther = approved
    .filter((t) => t.type === TransactionType.OTHER)
    .reduce((sum, t) => sum + toNumber(t.amount), 0);
  const pendingAmount = pending.reduce(
    (sum, t) => sum + toNumber(t.amount),
    0,
  );

  return {
    transactions,
    members,
    settings,
    totals: {
      totalMoney: totalContributions + totalInvestments - totalExpenses,
      totalContributions,
      totalInvestments,
      totalExpenses,
      totalOther,
      pendingAmount,
      approvedCount: approved.length,
      pendingCount: pending.length,
    },
  };
}

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: { select: { transactions: true } },
    },
  });
}