import crypto from "crypto";

/**
 * Signs a payload using HMAC-SHA256 and returns a base64url-encoded JWT token.
 * @param {object} payload - The token claims.
 * @param {string} secret - The HMAC secret.
 * @returns {string} The formatted JWT.
 */
function signToken(payload, secret) {
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
 * @param {string} token - The JWT token to verify.
 * @param {string} secret - The HMAC secret.
 * @returns {object|null} The decoded payload or null.
 */
function verifyToken(token, secret) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${header}.${body}`)
      .digest("base64url");
    if (Buffer.byteLength(signature) !== Buffer.byteLength(expectedSignature)) return null;
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature)))
      return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Computes a secure HMAC token of a data string.
 * Used for securing LOPD URLs.
 * @param {string} data - The input string (e.g. client ID).
 * @param {string} secret - The HMAC secret.
 * @returns {string} The signature.
 */
function computeHmac(data, secret) {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

export { signToken, verifyToken, computeHmac };
