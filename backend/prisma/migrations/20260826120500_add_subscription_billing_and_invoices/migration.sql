-- AlterTable
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "gracePeriodExpiresAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "lemonSqueezyCustomerId" TEXT,
ADD COLUMN IF NOT EXISTS "lemonSqueezySubscriptionId" TEXT;

-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InvoiceStatus') THEN
        CREATE TYPE "InvoiceStatus" AS ENUM ('PAID', 'PENDING', 'FAILED', 'REFUNDED');
    END IF;
END
$$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "lemonSqueezyId" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PAID',
    "invoiceUrl" TEXT,
    "billingReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- AlterTable Client lastVisit and Service price
ALTER TABLE "Client" ALTER COLUMN "lastVisit" TYPE TIMESTAMP(3) USING (
    CASE 
        WHEN "lastVisit" IS NULL OR "lastVisit" = '' THEN NULL 
        ELSE "lastVisit"::timestamp(3) 
    END
);

ALTER TABLE "Service" ALTER COLUMN "price" TYPE DECIMAL(10,2) USING "price"::numeric(10,2);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_lemonSqueezyId_key" ON "Invoice"("lemonSqueezyId");
CREATE INDEX IF NOT EXISTS "Invoice_businessId_idx" ON "Invoice"("businessId");
CREATE INDEX IF NOT EXISTS "Invoice_businessId_createdAt_idx" ON "Invoice"("businessId", "createdAt");
CREATE INDEX IF NOT EXISTS "Invoice_businessId_status_idx" ON "Invoice"("businessId", "status");

CREATE INDEX IF NOT EXISTS "User_businessId_role_idx" ON "User"("businessId", "role");
CREATE INDEX IF NOT EXISTS "Client_businessId_phone_idx" ON "Client"("businessId", "phone");
CREATE INDEX IF NOT EXISTS "Client_businessId_email_idx" ON "Client"("businessId", "email");
CREATE INDEX IF NOT EXISTS "Client_businessId_lopdStatus_idx" ON "Client"("businessId", "lopdStatus");
CREATE INDEX IF NOT EXISTS "Appointment_businessId_appointmentDate_idx" ON "Appointment"("businessId", "appointmentDate");
CREATE INDEX IF NOT EXISTS "Appointment_businessId_status_idx" ON "Appointment"("businessId", "status");
CREATE INDEX IF NOT EXISTS "Appointment_businessId_clientId_idx" ON "Appointment"("businessId", "clientId");
CREATE INDEX IF NOT EXISTS "Appointment_businessId_serviceId_idx" ON "Appointment"("businessId", "serviceId");
CREATE INDEX IF NOT EXISTS "Service_businessId_isActive_idx" ON "Service"("businessId", "isActive");
CREATE INDEX IF NOT EXISTS "Alert_userId_isRead_idx" ON "Alert"("userId", "isRead");
CREATE INDEX IF NOT EXISTS "LopdConsentLog_businessId_clientId_idx" ON "LopdConsentLog"("businessId", "clientId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Invoice_businessId_fkey'
    ) THEN
        ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;
