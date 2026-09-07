import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Always attempt to load env variables from the root .env file without overriding Docker env vars
dotenv.config({ path: path.resolve(__dirname, "../../../.env"), override: false });

// Los secretos NO llevan .default(): zod aplica el default antes de validar, así que
// un default aquí haría que una variable ausente pasara la validación silenciosamente
// y el proceso arrancara firmando JWT/HMAC con un valor conocido. Deben ser requeridos
// siempre; los valores de desarrollo viven en .env.example y los de test en el bloque
// de bypass de abajo.
const envSchema = z.object({
  DATABASE_URL: z.string({ error: "DATABASE_URL es requerida" }).min(1, "DATABASE_URL es requerida"),
  API_KEY: z.string({ error: "API_KEY es requerida" }).min(1, "API_KEY es requerida"),
  BACKEND_JWT_SECRET: z
    .string({ error: "BACKEND_JWT_SECRET es requerida" })
    .min(1, "BACKEND_JWT_SECRET es requerida"),
  LOPD_HMAC_SECRET: z
    .string({ error: "LOPD_HMAC_SECRET es requerida" })
    .min(1, "LOPD_HMAC_SECRET es requerida"),
  BOOKING_JWT_SECRET: z
    .string({ error: "BOOKING_JWT_SECRET es requerida" })
    .min(1, "BOOKING_JWT_SECRET es requerida"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  EVOLUTION_API_URL: z.string().default("http://localhost:8080"),
  EVOLUTION_API_KEY: z.string().default("volta_dev_evolution_key_2026"),
  GROQ_API_KEY: z.string().optional().default(""),
  OPENAI_API_KEY: z.string().optional().default(""),
  RESEND_API_KEY: z.string().optional().default(""),
  EMAIL_FROM: z.string().optional().default("Volta <onboarding@resend.dev>"),
});

export type EnvConfig = z.infer<typeof envSchema>;

// Lo único que el bypass de tests/build necesita aportar: las claves sin default en
// el esquema. El resto de valores sale de reparsear con el propio esquema, para que
// sus defaults no estén duplicados aquí.
const BYPASS_FALLBACKS: Record<string, string> = {
  DATABASE_URL: "postgresql://dummy:dummy@localhost:5432/dummy",
  API_KEY: "test-api-key",
  BACKEND_JWT_SECRET: "test-jwt-secret",
  LOPD_HMAC_SECRET: "test-lopd-hmac-secret",
  BOOKING_JWT_SECRET: "test-booking-jwt-secret",
};

let parsedEnv: EnvConfig;
try {
  parsedEnv = envSchema.parse(process.env);
} catch (err: any) {
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.NODE_ENV === "test") {
    console.warn(
      `[WARN] Environment validation bypassed during ${process.env.NODE_ENV === "test" ? "tests" : "Next.js build"}`
    );
    // Se descartan las variables vacías para que un `VAR=""` caiga en el fallback o
    // en el default del esquema, igual que hacía el `process.env.X || "..."` previo.
    const envDefinidas = Object.fromEntries(
      Object.entries(process.env).filter(([, value]) => value !== undefined && value !== "")
    );
    parsedEnv = envSchema.parse({ ...BYPASS_FALLBACKS, ...envDefinidas });
  } else {
    // zod v4 expone las incidencias en `issues` (`errors` ya no existe).
    const detalle = Array.isArray(err?.issues)
      ? err.issues.map((i: z.core.$ZodIssue) => `  - ${i.path.join(".")}: ${i.message}`).join("\n")
      : err?.message;
    console.error(`\x1b[31m[FATAL] Error de validación en variables de entorno:\x1b[0m\n${detalle}`);
    process.exit(1);
  }
}

export interface AppConfig {
  databaseUrl: string;
  apiKey: string;
  backendJwtSecret: string;
  lopdHmacSecret: string;
  bookingJwtSecret: string;
  port: number | string;
  frontendUrl: string;
  evolutionApiUrl: string;
  evolutionApiKey: string;
  groqApiKey: string;
  openaiApiKey: string;
  resendApiKey: string;
  emailFrom: string;
}

const config: AppConfig = {
  databaseUrl: parsedEnv.DATABASE_URL,
  apiKey: parsedEnv.API_KEY,
  backendJwtSecret: parsedEnv.BACKEND_JWT_SECRET,
  lopdHmacSecret: parsedEnv.LOPD_HMAC_SECRET,
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

const isBuildOrTest =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.NODE_ENV === "test";

if (
  process.env.NODE_ENV === "production" &&
  !isBuildOrTest &&
  config.bookingJwtSecret === "test-booking-jwt-secret"
) {
  console.error(
    " \x1b[31m[FATAL] BOOKING_JWT_SECRET no esta definida: el portal publico de reservas emitiria tokens firmados con el secreto por defecto. \x1b[0m"
  );
  process.exit(1);
}

if (process.env.NODE_ENV === "production" && !isBuildOrTest && !config.resendApiKey) {
  console.warn(
    "\x1b[33m[WARN] RESEND_API_KEY no está definida: los correos de recuperación de contraseña y verificación NO se enviarán, solo se registrarán en el log.\x1b[0m"
  );
}

export default config;
