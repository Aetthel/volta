-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserStatus') THEN
        CREATE TYPE "UserStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED');
    END IF;
END
$$;

-- AlterTable
-- El default es ACTIVE, así que las filas ya existentes quedan activas y nadie
-- pierde el acceso al desplegar. Sólo el alta pública escribe
-- PENDING_VERIFICATION, y lo hace de forma explícita en registerUser.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verificationLoginToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verificationLoginExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_verificationLoginToken_idx" ON "User"("verificationLoginToken");
