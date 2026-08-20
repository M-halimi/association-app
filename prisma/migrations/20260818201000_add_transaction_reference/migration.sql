-- AlterTable
ALTER TABLE "transactions" ADD COLUMN "reference" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "transactions_reference_key" ON "transactions"("reference");