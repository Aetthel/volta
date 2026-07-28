-- CreateEnum ServiceType if not exists
DO $$ BEGIN
    CREATE TYPE "ServiceType" AS ENUM ('INDIVIDUAL', 'GROUP');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable Service
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "type" "ServiceType" NOT NULL DEFAULT 'INDIVIDUAL',
ADD COLUMN IF NOT EXISTS "color" TEXT NOT NULL DEFAULT 'TEAL';

-- AlterTable Appointment
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "attended" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable LopdConsentLog if not exists
CREATE TABLE IF NOT EXISTS "LopdConsentLog" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "policyVersion" TEXT NOT NULL DEFAULT '1.0',

    CONSTRAINT "LopdConsentLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LopdConsentLog_clientId_idx" ON "LopdConsentLog"("clientId");
CREATE INDEX IF NOT EXISTS "LopdConsentLog_businessId_idx" ON "LopdConsentLog"("businessId");

-- AddForeignKey
ALTER TABLE "LopdConsentLog" DROP CONSTRAINT IF EXISTS "LopdConsentLog_clientId_fkey";
ALTER TABLE "LopdConsentLog" ADD CONSTRAINT "LopdConsentLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LopdConsentLog" DROP CONSTRAINT IF EXISTS "LopdConsentLog_businessId_fkey";
ALTER TABLE "LopdConsentLog" ADD CONSTRAINT "LopdConsentLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
