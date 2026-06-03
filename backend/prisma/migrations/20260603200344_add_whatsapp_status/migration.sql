-- CreateEnum
CREATE TYPE "WhatsAppStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'WAITING_QR');

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "qrCode" TEXT,
ADD COLUMN     "whatsappStatus" "WhatsAppStatus" NOT NULL DEFAULT 'DISCONNECTED';
