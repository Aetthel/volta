-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'JEFE', 'EMPLEADO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EMPLEADO',
    "businessId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Data Migration: Migrate existing Business users to User accounts
-- We map BusinessRole.BUSINESS to UserRole.JEFE (with businessId link)
-- We map BusinessRole.ADMIN to UserRole.ADMIN (with businessId null)
INSERT INTO "User" ("id", "name", "email", "password", "role", "businessId", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  "name",
  "email",
  "password",
  CASE 
    WHEN "role"::text = 'ADMIN' THEN 'ADMIN'::"UserRole"
    ELSE 'JEFE'::"UserRole"
  END,
  CASE 
    WHEN "role"::text = 'ADMIN' THEN NULL
    ELSE "id"
  END,
  NOW(),
  NOW()
FROM "Business";

-- DropIndex
DROP INDEX "Business_email_key";

-- AlterTable
ALTER TABLE "Business" DROP COLUMN "password",
DROP COLUMN "role",
ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "ownerName" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- DropEnum
DROP TYPE "BusinessRole";

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_businessId_idx" ON "User"("businessId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

