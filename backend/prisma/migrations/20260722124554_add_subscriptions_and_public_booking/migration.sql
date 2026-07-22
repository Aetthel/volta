/*
  Warnings:

  - You are about to drop the column `demoExpiresAt` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `isDemo` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `ownerName` on the `Business` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('BASIC', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('DEMO_SANDBOX', 'TRIALING', 'ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('EMERGENTE', 'AVISO', 'NOTIFICACION');

-- AlterTable
ALTER TABLE "Business" DROP COLUMN "demoExpiresAt",
DROP COLUMN "isDemo",
DROP COLUMN "ownerName",
ADD COLUMN     "businessType" TEXT,
ADD COLUMN     "enablePublicBooking" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sandboxExpiresAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'PRO',
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
ADD COLUMN     "trialExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "capacity" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alert_userId_idx" ON "Alert"("userId");

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
