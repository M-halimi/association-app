import { PrismaClient, Role, TransactionStatus, TransactionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();
  await prisma.associationSettings.deleteMany();

  const adminPassword = await bcrypt.hash("admin123", 10);
  const memberPassword = await bcrypt.hash("member123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Mohammed Halimi",
      email: "admin@alamal.ma",
      password: adminPassword,
      phone: "+212 661 23 45 67",
      role: Role.ADMIN,
    },
  });

  const memberData = [
    { name: "Ahmed Benali", email: "ahmed@example.com", phone: "+212 662 11 22 33" },
    { name: "Fatima Zahra El Idrissi", email: "fatima@example.com", phone: "+212 663 44 55 66" },
    { name: "Youssef Amrani", email: "youssef@example.com", phone: "+212 664 77 88 99" },
    { name: "Khadija Mansouri", email: "khadija@example.com", phone: "+212 665 12 34 56" },
    { name: "Omar Tazi", email: "omar@example.com", phone: "+212 666 98 76 54" },
    { name: "Salma Bennis", email: "salma@example.com", phone: "+212 667 32 10 98" },
    { name: "Rachid Ouazzani", email: "rachid@example.com", phone: "+212 668 56 78 90" },
  ];

  const members = [];
  for (const member of memberData) {
    members.push(
      await prisma.user.create({
        data: {
          name: member.name,
          email: member.email,
          password: memberPassword,
          phone: member.phone,
          role: Role.MEMBER,
        },
      }),
    );
  }

  const settings = await prisma.associationSettings.create({
    data: {
      name: "جمعية الوحدة والتضامن للتنمية المستدامة والمحافظة على البيئة",
      nameEn:
        "Association of Unity and Solidarity for Sustainable Development and Environmental Preservation",
      nameFr:
        "Association de l'Unité et de la Solidarité pour le Développement Durable et la Préservation de l'Environnement",
      nameAr:
        "جمعية الوحدة والتضامن للتنمية المستدامة والمحافظة على البيئة",
      description:
        "جمعية مجتمعية تعمل معًا لدعم الأنشطة المحلية والتعليم والمشاريع الخيرية.",
      descriptionEn:
        "A community association working together to support local activities, education and charitable projects.",
      descriptionFr:
        "Une association communautaire œuvrant ensemble pour soutenir les activités locales, l'éducation et les projets caritatifs.",
      descriptionAr:
        "جمعية مجتمعية تعمل معًا لدعم الأنشطة المحلية والتعليم والمشاريع الخيرية.",
      currency: "MAD",
      email: "contact@alamal.ma",
      phone: "+212 5 22 45 67 89",
    },
  });

  type SeedTransaction = {
    memberIndex: number;
    amount: number;
    type: TransactionType;
    reason: string;
    description: string;
    status: TransactionStatus;
    transactionDate: string;
  };

  const transactions: SeedTransaction[] = [
    // January
    { memberIndex: 0, amount: 200, type: TransactionType.CONTRIBUTION, reason: "Monthly contribution", description: "January monthly contribution.", status: TransactionStatus.APPROVED, transactionDate: "2026-01-05" },
    { memberIndex: 1, amount: 150, type: TransactionType.CONTRIBUTION, reason: "Monthly contribution", description: "January monthly contribution.", status: TransactionStatus.APPROVED, transactionDate: "2026-01-08" },
    { memberIndex: 2, amount: 100, type: TransactionType.CONTRIBUTION, reason: "Support for an activity", description: "Support for the reading club activity.", status: TransactionStatus.APPROVED, transactionDate: "2026-01-15" },
    { memberIndex: 5, amount: 300, type: TransactionType.EXPENSE, reason: "Equipment purchase", description: "Purchased a projector for the meeting room.", status: TransactionStatus.APPROVED, transactionDate: "2026-01-20" },
    // February
    { memberIndex: 0, amount: 200, type: TransactionType.CONTRIBUTION, reason: "Monthly contribution", description: "February monthly contribution.", status: TransactionStatus.APPROVED, transactionDate: "2026-02-03" },
    { memberIndex: 3, amount: 70, type: TransactionType.CONTRIBUTION, reason: "Monthly contribution", description: "February monthly contribution.", status: TransactionStatus.APPROVED, transactionDate: "2026-02-10" },
    { memberIndex: 1, amount: 500, type: TransactionType.INVESTMENT, reason: "Purchase of materials", description: "Investment in materials for the workshop.", status: TransactionStatus.APPROVED, transactionDate: "2026-02-14" },
    { memberIndex: 6, amount: 50, type: TransactionType.CONTRIBUTION, reason: "Monthly contribution", description: "February monthly contribution.", status: TransactionStatus.REJECTED, transactionDate: "2026-02-18" },
    // March
    { memberIndex: 0, amount: 200, type: TransactionType.CONTRIBUTION, reason: "Monthly contribution", description: "March monthly contribution.", status: TransactionStatus.APPROVED, transactionDate: "2026-03-04" },
    { memberIndex: 4, amount: 150, type: TransactionType.CONTRIBUTION, reason: "Event organization", description: "Contribution for the community iftar event.", status: TransactionStatus.APPROVED, transactionDate: "2026-03-12" },
    { memberIndex: 2, amount: 200, type: TransactionType.EXPENSE, reason: "Association expenses", description: "Printed banners and flyers for the event.", status: TransactionStatus.APPROVED, transactionDate: "2026-03-18" },
    { memberIndex: 5, amount: 70, type: TransactionType.CONTRIBUTION, reason: "Monthly contribution", description: "March monthly contribution.", status: TransactionStatus.PENDING, transactionDate: "2026-03-25" },
    // April
    { memberIndex: 0, amount: 200, type: TransactionType.CONTRIBUTION, reason: "Monthly contribution", description: "April monthly contribution.", status: TransactionStatus.APPROVED, transactionDate: "2026-04-02" },
    { memberIndex: 3, amount: 100, type: TransactionType.CONTRIBUTION, reason: "Support for an activity", description: "Support for the children's drawing activity.", status: TransactionStatus.APPROVED, transactionDate: "2026-04-11" },
    { memberIndex: 1, amount: 500, type: TransactionType.EXPENSE, reason: "Equipment purchase", description: "Bought laptops for the training room.", status: TransactionStatus.APPROVED, transactionDate: "2026-04-22" },
    // May
    { memberIndex: 0, amount: 200, type: TransactionType.CONTRIBUTION, reason: "Monthly contribution", description: "May monthly contribution.", status: TransactionStatus.APPROVED, transactionDate: "2026-05-05" },
    { memberIndex: 6, amount: 150, type: TransactionType.CONTRIBUTION, reason: "Monthly contribution", description: "May monthly contribution.", status: TransactionStatus.APPROVED, transactionDate: "2026-05-09" },
    { memberIndex: 4, amount: 70, type: TransactionType.CONTRIBUTION, reason: "Event organization", description: "Contribution for the summer picnic.", status: TransactionStatus.PENDING, transactionDate: "2026-05-21" },
    // June
    { memberIndex: 0, amount: 200, type: TransactionType.CONTRIBUTION, reason: "Monthly contribution", description: "June monthly contribution.", status: TransactionStatus.APPROVED, transactionDate: "2026-06-02" },
    { memberIndex: 2, amount: 300, type: TransactionType.INVESTMENT, reason: "Purchase of materials", description: "Investment in books for the library.", status: TransactionStatus.APPROVED, transactionDate: "2026-06-10" },
    { memberIndex: 3, amount: 50, type: TransactionType.CONTRIBUTION, reason: "Monthly contribution", description: "June monthly contribution.", status: TransactionStatus.APPROVED, transactionDate: "2026-06-15" },
    { memberIndex: 5, amount: 100, type: TransactionType.OTHER, reason: "Association expenses", description: "Reimbursement for office supplies.", status: TransactionStatus.PENDING, transactionDate: "2026-06-28" },
  ];

  let counter = 0;
  for (const transaction of transactions) {
    counter += 1;
    const member = members[transaction.memberIndex];
    await prisma.transaction.create({
      data: {
        reference: `TRX-${String(counter).padStart(5, "0")}`,
        userId: member.id,
        amount: transaction.amount,
        type: transaction.type,
        reason: transaction.reason,
        description: transaction.description,
        status: transaction.status,
        transactionDate: new Date(`${transaction.transactionDate}T12:00:00`),
      },
    });
  }

  console.log(`Seeded:
- 1 admin (${admin.email})
- ${members.length} members
- ${counter} transactions
- Association settings: ${settings.name} (${settings.currency})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });