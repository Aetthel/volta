import pkg from 'whatsapp-web.js';
import path from 'path';
import fs from 'fs';
import prisma from '../config/db.js';
import config from '../config/index.js';
import { logger } from '../utils/logger.js';

const { Client, LocalAuth } = pkg;

class WhatsAppManager {
  constructor() {
    this.clients = new Map();
    this.readyClients = new Set();
    // Lock map: businessId -> Promise resolving to the initialized client
    this._initializing = new Map();
  }

  async updateStatus(businessId, status, qr = null) {
    try {
      await prisma.business.update({
        where: { id: businessId },
        data: {
          whatsappStatus: status,
          qrCode: qr
        }
      });
      logger.info(`[WhatsApp] Status updated for ${businessId}: ${status}`);
    } catch (err) {
      logger.error(`[WhatsApp] Error updating status for ${businessId}:`, err);
    }
  }

  deleteSession(businessId) {
    if (!/^[a-zA-Z0-9_-]+$/.test(businessId)) {
      logger.error(`[WhatsApp] Invalid businessId for session deletion: ${businessId}`);
      return;
    }
    const sessionPath = path.join(process.cwd(), '.wwebjs_auth', `session-${businessId}`);
    if (fs.existsSync(sessionPath)) {
      logger.info(`[WhatsApp] Deleting session directory for business: ${businessId}`);
      try {
        fs.rmSync(sessionPath, { recursive: true, force: true });
      } catch (rmErr) {
        logger.error(`[WhatsApp] Failed to delete session directory for ${businessId}:`, rmErr);
      }
    }
  }

  async initClient(businessId) {
    // Return existing ready client
    if (this.clients.has(businessId)) {
      return this.clients.get(businessId);
    }

    // If initialization is already in progress, wait for it
    if (this._initializing.has(businessId)) {
      return this._initializing.get(businessId);
    }

    // Lock: start initialization
    const initPromise = this._doInitClient(businessId);
    this._initializing.set(businessId, initPromise);

    try {
      return await initPromise;
    } finally {
      this._initializing.delete(businessId);
    }
  }

  async _doInitClient(businessId) {
    logger.info(`[WhatsApp] Initializing client for business: ${businessId}`);

    const sessionDir = path.join(process.cwd(), '.wwebjs_auth', `session-${businessId}`);
    for (const lockFile of ['SingletonLock', 'SingletonSocket', 'SingletonCookie']) {
      const lockPath = path.join(sessionDir, lockFile);
      if (fs.existsSync(lockPath)) {
        try {
          fs.unlinkSync(lockPath);
          logger.info(`[WhatsApp] Removed stale ${lockFile} for business: ${businessId}`);
        } catch (e) {
          logger.warn(`[WhatsApp] Could not remove ${lockFile}:`, e.message);
        }
      }
    }

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: businessId,
        dataPath: path.join(process.cwd(), '.wwebjs_auth')
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ],
        executablePath: config.puppeteerExecutablePath,
      }
    });

    client.on('qr', (qr) => {
      logger.info(`[WhatsApp] QR Code received for business ${businessId}`);
      this.updateStatus(businessId, 'WAITING_QR', qr);
    });

    client.on('ready', () => {
      logger.info(`[WhatsApp] Client is ready for business: ${businessId}`);
      this.readyClients.add(businessId);
      this.updateStatus(businessId, 'CONNECTED', null);
    });

    client.on('authenticated', () => {
      logger.info(`[WhatsApp] Client authenticated for business: ${businessId}`);
    });

    client.on('auth_failure', (msg) => {
      logger.error(`[WhatsApp] Authentication failure for business ${businessId}:`, msg);
      this.readyClients.delete(businessId);
      this.clients.delete(businessId);
      this.updateStatus(businessId, 'DISCONNECTED', null);
      this.deleteSession(businessId);
    });

    client.on('disconnected', (reason) => {
      logger.info(`[WhatsApp] Client disconnected for business ${businessId}:`, reason);
      this.readyClients.delete(businessId);
      this.clients.delete(businessId);
      this.updateStatus(businessId, 'DISCONNECTED', null);
    });

    this.clients.set(businessId, client);
    await client.initialize().catch(err => {
      logger.error(`[WhatsApp] Failed to initialize client for ${businessId}:`, err);
      this.clients.delete(businessId);
      this.readyClients.delete(businessId);
      this.updateStatus(businessId, 'DISCONNECTED', null);
      throw err;
    });

    return client;
  }

  getClient(businessId) {
    return this.clients.get(businessId);
  }

  isReady(businessId) {
    return this.readyClients.has(businessId);
  }

  /**
   * Waits until the WhatsApp client for a business is fully ready (fired the 'ready' event).
   * Resolves immediately if already ready.
   * Rejects with a timeout error if the client doesn't become ready within `timeoutMs`.
   */
  waitForReady(businessId, timeoutMs = 45000) {
    if (this.readyClients.has(businessId)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const client = this.clients.get(businessId);
      if (!client) {
        return reject(new Error(`No client found for business ${businessId}`));
      }

      let resolved = false;

      const onReady = () => {
        finish();
        resolve();
      };

      // Fail fast: if a QR is requested it means the session expired and
      // the user needs to re-scan — no point waiting the full timeout.
      const onQr = () => {
        finish();
        reject(new Error(`[WhatsApp] Session expired — QR re-scan required (business: ${businessId})`));
      };

      const onAuthFailure = () => {
        finish();
        reject(new Error(`[WhatsApp] Auth failure while waiting for ready (business: ${businessId})`));
      };

      const onDisconnected = () => {
        finish();
        reject(new Error(`[WhatsApp] Client disconnected while waiting for ready (business: ${businessId})`));
      };

      const timer = setTimeout(() => {
        finish();
        reject(new Error(`[WhatsApp] Timeout waiting for client to be ready (business: ${businessId})`));
      }, timeoutMs);

      const finish = () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        client.off('ready', onReady);
        client.off('qr', onQr);
        client.off('auth_failure', onAuthFailure);
        client.off('disconnected', onDisconnected);
      };

      client.once('ready', onReady);
      client.once('qr', onQr);
      client.once('auth_failure', onAuthFailure);
      client.once('disconnected', onDisconnected);
    });
  }

  cleanPhoneForWhatsApp(phone) {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    // If it's a 9-digit Spanish phone number, prepend the 34 country code
    if (digits.length === 9 && (digits.startsWith("6") || digits.startsWith("7") || digits.startsWith("9"))) {
      return `34${digits}`;
    }
    return digits;
  }

  async sendMessage(businessId, phone, message) {
    const client = this.clients.get(businessId);
    if (!client) throw new Error("Bot no inicializado");

    const cleanPhone = this.cleanPhoneForWhatsApp(phone);
    const chatId = `${cleanPhone}@c.us`;

    try {
      logger.info(`[WhatsApp] Sending message to ${chatId}...`);
      return await client.sendMessage(chatId, message);
    } catch (err) {
      logger.error(`[WhatsApp] Failed to send message to ${chatId}:`, err.message);

      // Only simulate in non-production environments to avoid masking real failures
      if (process.env.NODE_ENV !== 'production') {
        logger.info(`[WhatsApp] [SIMULATION] Mock message sent to chat`);
        return { simulated: true, messageId: `mock-msg-${Date.now()}` };
      }

      throw err;
    }
  }
}

if (!globalThis.whatsappManager) {
  globalThis.whatsappManager = new WhatsAppManager();
}

export default globalThis.whatsappManager;
