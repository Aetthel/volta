import crypto from "crypto";

export interface JwtHeader {
  alg: string;
  typ: string;
}

export interface JwtPayload {
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

/**
 * Signs a payload using HMAC-SHA256 and returns a base64url-encoded JWT token.
 */
export function signToken<T extends Record<string, unknown>>(payload: T, secret: string): string {
  const now = Math.floor(Date.now() / 1000);
  const body = Buffer.from(JSON.stringify({ iat: now, ...payload })).toString("base64url");
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

/**
 * Verifies a base64url-encoded JWT token and returns its decoded payload.
 * Returns null if signature is invalid or token is expired.
 */
export function verifyToken<T = JwtPayload>(token: string, secret: string): T | null {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${header}.${body}`)
      .digest("base64url");

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as JwtPayload;
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
    return payload as T;
  } catch {
    return null;
  }
}

/**
 * Computes a secure HMAC token of a data string.
 * Used for securing LOPD URLs.
 */
export function computeHmac(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

export default { signToken, verifyToken, computeHmac };
