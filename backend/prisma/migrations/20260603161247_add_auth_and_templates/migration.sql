/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Business` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Business` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Business` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BusinessRole" AS ENUM ('ADMIN', 'BUSINESS');

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "reminderMessage" TEXT,
ADD COLUMN     "role" "BusinessRole" NOT NULL DEFAULT 'BUSINESS',
ADD COLUMN     "welcomeMessage" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Business_email_key" ON "Business"("email");
