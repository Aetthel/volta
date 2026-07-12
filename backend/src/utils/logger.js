/**
 * Simple, dependencies-free structured logger with colors.
 */
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
export default logger;
