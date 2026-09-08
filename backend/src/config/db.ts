import { logger } from "../utils/logger";
import { PrismaClient } from "../generated/client/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
// pg@8 no incluye declaraciones propias y aquí no está instalado @types/pg, así que
// el import es implícitamente `any` (TS7016). Se usa @ts-expect-error en lugar de
// @ts-ignore para que tsc avise si algún día se añaden los tipos y sobre esta línea.
// @ts-expect-error
import pkg from "pg";
import config from "./index";

const { Pool } = pkg;

/**
 * Este módulo lo importan DOS procesos —el backend y el servidor de Next, que
 * llega hasta aquí desde `auth.ts`—, así que cada despliegue abre dos pools contra
 * la misma base gestionada. El total de conexiones es, como mínimo,
 * `max × nº de procesos`, y hay que dimensionarlo contra el límite del proveedor.
 *
 * `max` se deja configurable en lugar de fijarlo: el número correcto depende del
 * plan de Postgres contratado y de cuántas instancias se levanten, y eso no se
 * puede decidir desde el código. El valor por defecto es el mismo 10 de `pg`, así
 * que sin configurar nada el comportamiento no cambia.
 */
const poolMax = Number(process.env.DATABASE_POOL_MAX) || 10;

/**
 * `pg` no arma ningún temporizador de conexión por defecto: con el pool agotado,
 * una petición se queda esperando para siempre en lugar de fallar. Eso convierte
 * una saturación puntual en peticiones colgadas sin error ni traza. Con un límite,
 * falla rápido y queda registrado.
 */
const poolConnectionTimeoutMs = Number(process.env.DATABASE_POOL_TIMEOUT_MS) || 10_000;

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: poolMax,
  connectionTimeoutMillis: poolConnectionTimeoutMs,
  // Permite distinguir en `pg_stat_activity` qué conexiones son del backend y
  // cuáles del servidor de Next, que es justo lo que hace falta para dimensionar.
  application_name: process.env.NEXT_RUNTIME ? "volta-next" : "volta-backend",
});

pool.on("error", (err: Error) => {
  // Un cliente inactivo que muere (reinicio del servidor, corte de red) emite aquí.
  // Sin este manejador, Node lo trata como excepción no capturada y tumba el proceso.
  logger.error("[DB] Error en un cliente inactivo del pool", err);
});
const adapter = new PrismaPg(pool);

// Service.price es Decimal(10,2): Prisma lo entrega como objeto Decimal, que se
// serializa a JSON como string ("35"). Eso rompe cualquier suma en el cliente
// (0 + "35" === "035"), así que lo exponemos siempre como number.
const prisma = new PrismaClient({ adapter }).$extends({
  result: {
    service: {
      price: {
        needs: { price: true },
        compute: ({ price }: { price: unknown }) => (price === null || price === undefined ? price : Number(price)),
      },
    },
  },
});

export type ExtendedPrismaClient = typeof prisma;

const gracefulShutdown = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    await pool.end();
  } catch (err) {
    logger.error("Error durante la desconexión de la base de datos", err);
  }
};

process.on("SIGINT", async () => {
  await gracefulShutdown();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await gracefulShutdown();
  process.exit(0);
});

export { prisma, pool };
export default prisma;
