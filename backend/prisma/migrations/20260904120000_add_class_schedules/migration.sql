-- Clases de grupo que se repiten siempre en los mismos días y hora.
-- La programación es la fuente de verdad; las sesiones concretas se materializan
-- como filas de "Appointment" hasta un horizonte móvil, marcado por
-- "generatedUntil", para que agenda, aforo y recordatorios sigan operando sobre
-- citas normales.
CREATE TABLE "ClassSchedule" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "daysOfWeek" INTEGER[],
    "startTime" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "repeatClients" BOOLEAN NOT NULL DEFAULT true,
    "attendees" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "generatedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassSchedule_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ClassSchedule_businessId_isActive_idx" ON "ClassSchedule"("businessId", "isActive");

CREATE INDEX "ClassSchedule_serviceId_idx" ON "ClassSchedule"("serviceId");

ALTER TABLE "ClassSchedule" ADD CONSTRAINT "ClassSchedule_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClassSchedule" ADD CONSTRAINT "ClassSchedule_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enlace de cada sesión con su programación. SET NULL al borrar: eliminar la
-- clase semanal no debe llevarse por delante el histórico de sesiones pasadas.
ALTER TABLE "Appointment" ADD COLUMN "classScheduleId" TEXT;

-- Una sesión por programación e instante: hace idempotente la materialización del
-- horizonte. Las citas sueltas llevan NULL y en Postgres los nulos no colisionan.
CREATE UNIQUE INDEX "Appointment_classScheduleId_appointmentDate_key" ON "Appointment"("classScheduleId", "appointmentDate");

ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_classScheduleId_fkey" FOREIGN KEY ("classScheduleId") REFERENCES "ClassSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
