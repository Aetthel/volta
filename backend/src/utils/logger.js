/**
 * Simple, dependencies-free structured logger with colors.
 * Includes privacy-safe masking helpers for PII (personally identifiable information).
 */

/**
 * Mask a phone number, showing only last 4 digits.
 * Example: "+34612345678" -> "*********5678"
 */
export function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return '****';
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return '****';
  return '*'.repeat(digits.length - 4) + digits.slice(-4);
}

/**
 * Mask an email, showing only first char and domain.
 * Example: "john@example.com" -> "j***@example.com"
 */
export function maskEmail(email) {
  if (!email || typeof email !== 'string') return '***@***';
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***@***';
  return local[0] + '***@' + domain;
}

export const logger = {
  info(message, meta = null) {
    this._log('INFO', message, meta);
  },

  warn(message, meta = null) {
    this._log('WARN', message, meta);
  },

  error(message, meta = null) {
    this._log('ERROR', message, meta);
  },

  _log(level, message, meta) {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` | ${JSON.stringify(meta)}` : '';
    let color = '\x1b[0m';
    if (level === 'INFO') color = '\x1b[32m'; // Green
    if (level === 'WARN') color = '\x1b[33m'; // Yellow
    if (level === 'ERROR') color = '\x1b[31m'; // Red
    console.log(`${color}[${timestamp}] [${level}] ${message}${metaString}\x1b[0m`);
  }
};
