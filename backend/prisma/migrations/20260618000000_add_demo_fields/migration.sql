-- AlterTable: Add demo fields to Business
ALTER TABLE "Business" ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Business" ADD COLUMN "demoExpiresAt" TIMESTAMP(3);

-- AlterTable: Add cascade delete to Client.business
ALTER TABLE "Client" DROP CONSTRAINT "Client_businessId_fkey";
ALTER TABLE "Client" ADD CONSTRAINT "Client_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: Add cascade delete to Appointment.business
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_businessId_fkey";
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
