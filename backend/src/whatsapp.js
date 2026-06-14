const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');
const prisma = require('./db');

class WhatsAppManager {
  constructor() {
    this.clients = new Map();
    // Track which businessIds have a fully-ready client
    this.readyClients = new Set();
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
      console.log(`[WhatsApp] Status updated for ${businessId}: ${status}`);
    } catch (err) {
      console.error(`[WhatsApp] Error updating status for ${businessId}:`, err);
    }
  }

  deleteSession(businessId) {
    const fs = require('fs');
    const sessionPath = path.join(process.cwd(), '.wwebjs_auth', `session-${businessId}`);
    if (fs.existsSync(sessionPath)) {
      console.log(`[WhatsApp] Deleting session directory for business: ${businessId}`);
      try {
        fs.rmSync(sessionPath, { recursive: true, force: true });
      } catch (rmErr) {
        console.error(`[WhatsApp] Failed to delete session directory for ${businessId}:`, rmErr);
      }
    }
  }

  async initClient(businessId) {
    if (this.clients.has(businessId)) {
      return this.clients.get(businessId);
    }

    console.log(`[WhatsApp] Initializing client for business: ${businessId}`);

    // Remove Chromium's Singleton lock files if they exist from a previous crashed/killed process.
    // This happens when Docker recreates the container with a new hostname but the volume
    // persists — Chromium thinks the profile is "in use by another computer".
    // Note: process.cwd() in the backend workspace resolves to /app/backend.
    const fs = require('fs');
    const sessionDir = path.join(process.cwd(), '.wwebjs_auth', `session-${businessId}`);
    for (const lockFile of ['SingletonLock', 'SingletonSocket', 'SingletonCookie']) {
      const lockPath = path.join(sessionDir, lockFile);
      if (fs.existsSync(lockPath)) {
        try {
          fs.unlinkSync(lockPath);
          console.log(`[WhatsApp] Removed stale ${lockFile} for business: ${businessId}`);
        } catch (e) {
          console.warn(`[WhatsApp] Could not remove ${lockFile}:`, e.message);
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
          '--single-process',
          '--disable-gpu'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
      }
    });

    client.on('qr', (qr) => {
      console.log(`[WhatsApp] QR Code received for business ${businessId}`);
      this.updateStatus(businessId, 'WAITING_QR', qr);
    });

    client.on('ready', () => {
      console.log(`[WhatsApp] Client is ready for business: ${businessId}`);
      this.readyClients.add(businessId);
      this.updateStatus(businessId, 'CONNECTED', null);
    });

    client.on('authenticated', () => {
      console.log(`[WhatsApp] Client authenticated for business: ${businessId}`);
    });

    client.on('auth_failure', (msg) => {
      console.error(`[WhatsApp] Authentication failure for business ${businessId}:`, msg);
      this.readyClients.delete(businessId);
      this.updateStatus(businessId, 'DISCONNECTED', null);
      this.deleteSession(businessId);
    });

    client.on('disconnected', (reason) => {
      console.log(`[WhatsApp] Client disconnected for business ${businessId}:`, reason);
      this.readyClients.delete(businessId);
      this.updateStatus(businessId, 'DISCONNECTED', null);
      this.clients.delete(businessId);
    });

    this.clients.set(businessId, client);
    client.initialize().catch(err => {
      console.error(`[WhatsApp] Failed to initialize client for ${businessId}:`, err);
      this.readyClients.delete(businessId);
      this.updateStatus(businessId, 'DISCONNECTED', null);
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

      const timer = setTimeout(() => {
        reject(new Error(`[WhatsApp] Timeout waiting for client to be ready (business: ${businessId})`));
      }, timeoutMs);

      const cleanup = () => clearTimeout(timer);

      client.once('ready', () => {
        cleanup();
        resolve();
      });

      // Fail fast: if a QR is requested it means the session expired and
      // the user needs to re-scan — no point waiting the full timeout.
      client.once('qr', () => {
        cleanup();
        reject(new Error(`[WhatsApp] Session expired — QR re-scan required (business: ${businessId})`));
      });

      client.once('auth_failure', () => {
        cleanup();
        reject(new Error(`[WhatsApp] Auth failure while waiting for ready (business: ${businessId})`));
      });

      client.once('disconnected', () => {
        cleanup();
        reject(new Error(`[WhatsApp] Client disconnected while waiting for ready (business: ${businessId})`));
      });
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
      console.log(`[WhatsApp] Sending message to ${chatId}...`);
      return await client.sendMessage(chatId, message);
    } catch (err) {
      console.error(`[WhatsApp] Failed to send message to ${chatId}:`, err.message);

      // Only simulate in non-production environments to avoid masking real failures
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[WhatsApp] [SIMULATION] Mock message sent: "${message}"`);
        return { simulated: true, messageId: `mock-msg-${Date.now()}` };
      }

      throw err;
    }
  }
}

// Singleton pattern for Next.js (Global object)
if (!global.whatsappManager) {
  global.whatsappManager = new WhatsAppManager();
}

module.exports = global.whatsappManager;
