import { PrismaClient } from "../generated/client/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
import config from "./index.js";

const { Pool } = pkg;

const pool = new Pool({ connectionString: config.databaseUrl });
const adapter = new PrismaPg(pool);

// Service.price es Decimal(10,2): Prisma lo entrega como objeto Decimal, que se
// serializa a JSON como string ("35"). Eso rompe cualquier suma en el cliente
// (0 + "35" === "035"), así que lo exponemos siempre como number.
const prisma = new PrismaClient({ adapter }).$extends({
  result: {
    service: {
      price: {
        needs: { price: true },
        compute: ({ price }) => (price === null || price === undefined ? price : Number(price)),
      },
    },
  },
});

const gracefulShutdown = async () => {
  try {
    await prisma.$disconnect();
    await pool.end();
  } catch (err) {
    console.error("Error durante la desconexión de la base de datos:", err);
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

export default prisma;
