-- Excepciones del negocio al catálogo de festivos españoles.
-- El catálogo en sí se calcula en código (`utils/holidays.js`), incluidos los
-- festivos que dependen de la Pascua: aquí solo viven las decisiones del negocio
-- que se apartan del comportamiento por defecto.
CREATE TABLE "BusinessHoliday" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "holidayKey" TEXT NOT NULL,
    "isObserved" BOOLEAN NOT NULL,

    CONSTRAINT "BusinessHoliday_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BusinessHoliday_businessId_holidayKey_key" ON "BusinessHoliday"("businessId", "holidayKey");

CREATE INDEX "BusinessHoliday_businessId_idx" ON "BusinessHoliday"("businessId");

ALTER TABLE "BusinessHoliday" ADD CONSTRAINT "BusinessHoliday_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
