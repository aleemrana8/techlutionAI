-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('SENT', 'FAILED');

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "isFounder" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "project_assignments" (
    "id" TEXT NOT NULL,
    "projectRef" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "roleInProject" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_finances" (
    "id" TEXT NOT NULL,
    "projectRef" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "fiverrFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "zakatEnabled" BOOLEAN NOT NULL DEFAULT false,
    "zakatPercent" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "otherCosts" JSONB NOT NULL DEFAULT '[]',
    "totalDeductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sharePerPerson" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalMembers" INTEGER NOT NULL DEFAULT 0,
    "founderIncluded" BOOLEAN NOT NULL DEFAULT true,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_finances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_shares" (
    "id" TEXT NOT NULL,
    "projectFinanceId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "shareAmount" DOUBLE PRECISION NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "projectRef" TEXT,
    "status" "EmailStatus" NOT NULL DEFAULT 'SENT',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_assignments_projectRef_idx" ON "project_assignments"("projectRef");

-- CreateIndex
CREATE INDEX "project_assignments_employeeId_idx" ON "project_assignments"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "project_assignments_projectRef_employeeId_key" ON "project_assignments"("projectRef", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "project_finances_projectRef_key" ON "project_finances"("projectRef");

-- CreateIndex
CREATE INDEX "project_finances_projectRef_idx" ON "project_finances"("projectRef");

-- CreateIndex
CREATE INDEX "project_shares_projectFinanceId_idx" ON "project_shares"("projectFinanceId");

-- CreateIndex
CREATE INDEX "project_shares_employeeId_idx" ON "project_shares"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "project_shares_projectFinanceId_employeeId_key" ON "project_shares"("projectFinanceId", "employeeId");

-- CreateIndex
CREATE INDEX "email_logs_type_idx" ON "email_logs"("type");

-- CreateIndex
CREATE INDEX "email_logs_createdAt_idx" ON "email_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "project_assignments" ADD CONSTRAINT "project_assignments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_shares" ADD CONSTRAINT "project_shares_projectFinanceId_fkey" FOREIGN KEY ("projectFinanceId") REFERENCES "project_finances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_shares" ADD CONSTRAINT "project_shares_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
