import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const runInDocker = fs.existsSync('/.dockerenv');

if (!process.env.DATABASE_URL || !process.env.API_KEY) {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: !runInDocker });
}

// Startup environment variables verification
const REQUIRED_ENV_VARS = ['DATABASE_URL', 'API_KEY', 'BACKEND_JWT_SECRET', 'LOPD_HMAC_SECRET'];
const missingVars = REQUIRED_ENV_VARS.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`\x1b[31m[FATAL] Missing required environment variables: ${missingVars.join(', ')}\x1b[0m`);
  console.error('Please verify your .env configuration file.');
  process.exit(1);
}

const config = {
  databaseUrl: process.env.DATABASE_URL,
  apiKey: process.env.API_KEY,
  backendJwtSecret: process.env.BACKEND_JWT_SECRET,
  lopdHmacSecret: process.env.LOPD_HMAC_SECRET,
  port: process.env.BACKEND_PORT || (process.env.PORT && process.env.PORT !== '3000' ? process.env.PORT : 3001),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  puppeteerExecutablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
};

export default config;
