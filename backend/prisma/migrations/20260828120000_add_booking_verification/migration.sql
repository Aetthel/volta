-- CreateTable
CREATE TABLE IF NOT EXISTS "BookingVerification" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "pendingName" TEXT,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BookingVerification_businessId_phone_idx" ON "BookingVerification"("businessId", "phone");
CREATE INDEX IF NOT EXISTS "BookingVerification_businessId_phone_createdAt_idx" ON "BookingVerification"("businessId", "phone", "createdAt");
CREATE INDEX IF NOT EXISTS "BookingVerification_expiresAt_idx" ON "BookingVerification"("expiresAt");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'BookingVerification_businessId_fkey'
    ) THEN
        ALTER TABLE "BookingVerification" ADD CONSTRAINT "BookingVerification_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;
