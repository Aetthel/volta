import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Always attempt to load env variables from the root .env file without overriding Docker env vars
dotenv.config({ path: path.resolve(__dirname, "../../../.env"), override: false });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL es requerida"),
  API_KEY: z.string().min(1, "API_KEY es requerida").default("test-api-key"),
  BACKEND_JWT_SECRET: z.string().min(1, "BACKEND_JWT_SECRET es requerida").default("test-jwt-secret"),
  LOPD_HMAC_SECRET: z.string().min(1, "LOPD_HMAC_SECRET es requerida").default("test-lopd-hmac-secret"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
});

let parsedEnv;
try {
  parsedEnv = envSchema.parse(process.env);
} catch (err) {
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.NODE_ENV === "test") {
    console.warn(`[WARN] Environment validation bypassed during ${process.env.NODE_ENV === "test" ? "tests" : "Next.js build"}`);
    parsedEnv = {
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy",
      API_KEY: process.env.API_KEY || "test-api-key",
      BACKEND_JWT_SECRET: process.env.BACKEND_JWT_SECRET || "test-jwt-secret",
      LOPD_HMAC_SECRET: process.env.LOPD_HMAC_SECRET || "test-lopd-hmac-secret",
      FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
    };
  } else {
    console.error(`\x1b[31m[FATAL] Error de validación en variables de entorno:\x1b[0m`, err.errors || err.message);
    process.exit(1);
  }
}

const config = {
  databaseUrl: parsedEnv.DATABASE_URL,
  apiKey: parsedEnv.API_KEY,
  backendJwtSecret: parsedEnv.BACKEND_JWT_SECRET,
  lopdHmacSecret: parsedEnv.LOPD_HMAC_SECRET,
  port:
    process.env.BACKEND_PORT ||
    (process.env.PORT && process.env.PORT !== "3000" ? process.env.PORT : 3001),
  frontendUrl: parsedEnv.FRONTEND_URL,
  puppeteerExecutablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
};

export default config;
