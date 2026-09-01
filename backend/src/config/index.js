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
  BOOKING_JWT_SECRET: z
    .string()
    .min(1, "BOOKING_JWT_SECRET es requerida")
    .default("test-booking-jwt-secret"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  EVOLUTION_API_URL: z.string().default("http://localhost:8080"),
  EVOLUTION_API_KEY: z.string().default("volta_dev_evolution_key_2026"),
  GROQ_API_KEY: z.string().optional().default(""),
  OPENAI_API_KEY: z.string().optional().default(""),
  // Envío de correo transaccional (recuperación de contraseña, verificación de
  // alta). Sin clave el servicio simula el envío por log, que sirve en local
  // pero dejaría a un usuario de producción sin poder recuperar su cuenta.
  RESEND_API_KEY: z.string().optional().default(""),
  EMAIL_FROM: z.string().optional().default("Volta <onboarding@resend.dev>"),
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
      BOOKING_JWT_SECRET: process.env.BOOKING_JWT_SECRET || "test-booking-jwt-secret",
      FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
      EVOLUTION_API_URL: process.env.EVOLUTION_API_URL || "http://localhost:8080",
      EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY || "volta_dev_evolution_key_2026",
      GROQ_API_KEY: process.env.GROQ_API_KEY || "",
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
      RESEND_API_KEY: process.env.RESEND_API_KEY || "",
      EMAIL_FROM: process.env.EMAIL_FROM || "Volta <onboarding@resend.dev>",
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
  // Secreto propio, separado del de backend: este token acredita a un visitante
  // anónimo del portal público, no a un usuario con rol.
  bookingJwtSecret: parsedEnv.BOOKING_JWT_SECRET,
  port:
    process.env.BACKEND_PORT ||
    (process.env.PORT && process.env.PORT !== "3000" ? process.env.PORT : 3001),
  frontendUrl: parsedEnv.FRONTEND_URL,
  evolutionApiUrl: parsedEnv.EVOLUTION_API_URL,
  evolutionApiKey: parsedEnv.EVOLUTION_API_KEY,
  groqApiKey: parsedEnv.GROQ_API_KEY,
  openaiApiKey: parsedEnv.OPENAI_API_KEY,
  resendApiKey: parsedEnv.RESEND_API_KEY,
  emailFrom: parsedEnv.EMAIL_FROM,
};

// El secreto de la sesion de reserva firma credenciales para visitantes anonimos
// de internet. Arrancar en produccion con el valor por defecto dejaria esos
// tokens falsificables por cualquiera que lea el repositorio.
if (process.env.NODE_ENV === "production" && config.bookingJwtSecret === "test-booking-jwt-secret") {
  console.error(
    "[31m[FATAL] BOOKING_JWT_SECRET no esta definida: el portal publico de reservas emitiria tokens firmados con el secreto por defecto.[0m"
  );
  process.exit(1);
}

// Sin clave de Resend el envío se limita a escribir el correo en el log. En
// local es cómodo, pero en producción significa que nadie recibe el enlace de
// recuperación ni el código de alta, y el fallo no da la cara por ningún lado.
if (process.env.NODE_ENV === "production" && !config.resendApiKey) {
  console.warn(
    "\x1b[33m[WARN] RESEND_API_KEY no está definida: los correos de recuperación de contraseña y verificación NO se enviarán, solo se registrarán en el log.\x1b[0m"
  );
}

export default config;
