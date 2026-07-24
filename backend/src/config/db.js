import { PrismaClient } from "../generated/client/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
import config from "./index.js";

const { Pool } = pkg;

const pool = new Pool({ connectionString: config.databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
