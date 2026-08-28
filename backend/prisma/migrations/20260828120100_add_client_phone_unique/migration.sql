-- El teléfono pasa a ser la clave funcional del cliente dentro de un negocio.
-- Esta migración NO deduplica: fusionar fichas implica reasignar citas y
-- consentimientos LOPD y decidir qué dato prevalece, y eso vive en
-- `scripts/dedupeClientPhones.js`, que se ejecuta antes (primero con
-- `--dry-run` para revisar el informe).
--
-- Si quedan duplicados, se aborta con un mensaje accionable en lugar de dejar
-- que Postgres falle con un error de índice difícil de interpretar.
DO $$
DECLARE
    dup_groups INTEGER;
BEGIN
    SELECT COUNT(*) INTO dup_groups FROM (
        SELECT "businessId", "phone"
        FROM "Client"
        GROUP BY "businessId", "phone"
        HAVING COUNT(*) > 1
    ) AS duplicates;

    IF dup_groups > 0 THEN
        RAISE EXCEPTION
            'Quedan % grupos de clientes que comparten (businessId, phone). Ejecuta `node scripts/dedupeClientPhones.js --dry-run` para revisarlos y luego sin el flag para fusionarlos, antes de volver a aplicar esta migración.',
            dup_groups;
    END IF;
END
$$;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Client_businessId_phone_key" ON "Client"("businessId", "phone");

-- DropIndex: el índice no único queda cubierto por el índice único anterior.
DROP INDEX IF EXISTS "Client_businessId_phone_idx";
