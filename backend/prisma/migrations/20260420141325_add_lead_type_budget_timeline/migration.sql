-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('INQUIRY', 'PROPOSAL');

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "budget" TEXT,
ADD COLUMN     "timeline" TEXT,
ADD COLUMN     "type" "LeadType" NOT NULL DEFAULT 'INQUIRY';
