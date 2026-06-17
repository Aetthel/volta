-- 1. Create UserRole enum conditionally using a PL/pgSQL block
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
        CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'JEFE', 'EMPLEADO');
    END IF;
END$$;

-- 2. Create User table conditionally
CREATE TABLE IF NOT EXISTS "User" (
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

-- 3. Data Migration: Migrate existing Business users to User accounts
-- We use ON CONFLICT ("email") DO NOTHING to avoid duplicate key errors if run multiple times
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
FROM "Business"
ON CONFLICT ("email") DO NOTHING;

-- 4. Alter Business table
-- DropIndex safely
DROP INDEX IF EXISTS "Business_email_key";

-- AlterTable safely
ALTER TABLE "Business" 
  DROP COLUMN IF EXISTS "password",
  DROP COLUMN IF EXISTS "role",
  ALTER COLUMN "email" DROP NOT NULL;

-- Add columns conditionally if they don't exist yet
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "coverUrl" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "ownerName" TEXT;

-- DropEnum safely
DROP TYPE IF EXISTS "BusinessRole";

-- Create indexes conditionally
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_businessId_idx" ON "User"("businessId");

-- Add foreign key constraint conditionally using a PL/pgSQL block
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_businessId_fkey') THEN
        ALTER TABLE "User" ADD CONSTRAINT "User_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END$$;


