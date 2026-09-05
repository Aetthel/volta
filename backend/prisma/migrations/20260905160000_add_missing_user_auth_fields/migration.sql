-- AlterTable: Add missing columns to User table matching schema.prisma
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "otpCode" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "otpExpiresAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "otpAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorBackupCodes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetPasswordToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetPasswordExpiresAt" TIMESTAMP(3);

-- CreateEnum: AlertCategory
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AlertCategory') THEN
        CREATE TYPE "AlertCategory" AS ENUM ('APPOINTMENT', 'WHATSAPP', 'CLIENT', 'BILLING', 'SYSTEM');
    END IF;
END
$$;

-- AlterTable: Add missing columns and relations to Alert table
ALTER TABLE "Alert" ADD COLUMN IF NOT EXISTS "category" "AlertCategory" NOT NULL DEFAULT 'SYSTEM';
ALTER TABLE "Alert" ADD COLUMN IF NOT EXISTS "actionUrl" TEXT;
ALTER TABLE "Alert" ADD COLUMN IF NOT EXISTS "actionLabel" TEXT;
ALTER TABLE "Alert" ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Alert" ADD COLUMN IF NOT EXISTS "businessId" TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Alert_businessId_fkey' AND table_name = 'Alert'
    ) THEN
        ALTER TABLE "Alert" ADD CONSTRAINT "Alert_businessId_fkey" 
        FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON UPDATE CASCADE ON DELETE CASCADE;
    END IF;
END
$$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Alert_businessId_idx" ON "Alert"("businessId");
CREATE INDEX IF NOT EXISTS "Alert_businessId_category_idx" ON "Alert"("businessId", "category");
CREATE INDEX IF NOT EXISTS "Alert_isArchived_idx" ON "Alert"("isArchived");
