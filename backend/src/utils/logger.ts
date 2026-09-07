/**
 * Simple, dependencies-free structured logger with colors.
 * Includes privacy-safe masking helpers for PII (personally identifiable information).
 */

/**
 * Mask a phone number, showing only last 4 digits.
 * Example: "+34612345678" -> "*********5678"
 */
export function maskPhone(phone?: string | null): string {
  if (!phone || typeof phone !== "string") return "****";
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 4) return "****";
  return "*".repeat(digits.length - 4) + digits.slice(-4);
}

/**
 * Mask an email, showing only first char and domain.
 * Example: "john@example.com" -> "j***@example.com"
 */
export function maskEmail(email?: string | null): string {
  if (!email || typeof email !== "string") return "***@***";
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***@***";
  return local[0] + "***@" + domain;
}

export type LogLevel = "INFO" | "WARN" | "ERROR";

/**
 * `JSON.stringify` de un Error devuelve "{}" —`message` y `stack` no son propiedades
 * enumerables— y lanza TypeError ante referencias circulares. Sin este formateo,
 * `logger.error("fallo", err)` registraría el fallo sin ningún motivo dentro.
 */
function formatMeta(meta: unknown): string {
  if (meta === null || meta === undefined) return "";
  // `stack` ya empieza por "Name: message", así que no hace falta repetirlo.
  if (meta instanceof Error) return ` | ${meta.stack || `${meta.name}: ${meta.message}`}`;
  if (typeof meta === "string") return ` | ${meta}`;
  try {
    return ` | ${JSON.stringify(meta)}`;
  } catch {
    return ` | [meta no serializable] ${String(meta)}`;
  }
}

export const logger = {
  info(message: string, meta: unknown = null): void {
    this._log("INFO", message, meta);
  },

  warn(message: string, meta: unknown = null): void {
    this._log("WARN", message, meta);
  },

  error(message: string, meta: unknown = null): void {
    this._log("ERROR", message, meta);
  },

  _log(level: LogLevel, message: string, meta: unknown): void {
    const timestamp = new Date().toISOString();
    const metaString = formatMeta(meta);
    let color = "\x1b[0m";
    if (level === "INFO") color = "\x1b[32m"; // Green
    if (level === "WARN") color = "\x1b[33m"; // Yellow
    if (level === "ERROR") color = "\x1b[31m"; // Red
    const line = `${color}[${timestamp}] [${level}] ${message}${metaString}\x1b[0m`;
    // WARN y ERROR van a stderr, como hacían los console.warn/console.error que este
    // logger sustituye: mandarlos a stdout los escondería de cualquier filtro de logs.
    if (level === "ERROR") console.error(line);
    else if (level === "WARN") console.warn(line);
    else console.log(line);
  },
};

export default logger;
