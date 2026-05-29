const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

class WhatsAppManager {
  constructor() {
    this.clients = new Map();
  }

  /**
   * Initializes a WhatsApp client for a specific business
   * @param {string} businessId - The unique ID of the business
   * @returns {Promise<Client>}
   */
  async initClient(businessId) {
    if (this.clients.has(businessId)) {
      return this.clients.get(businessId);
    }

    console.log(`[WhatsApp] Initializing client for business: ${businessId}`);

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: businessId,
        dataPath: path.join(__dirname, '../.wwebjs_auth')
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
          '--single-process', // <- this one is important for memory efficiency
          '--disable-gpu'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
      }
    });

    client.on('qr', (qr) => {
      console.log(`[WhatsApp] QR Code received for business ${businessId}. Scan it below:`);
      qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
      console.log(`[WhatsApp] Client is ready for business: ${businessId}`);
    });

    client.on('authenticated', () => {
      console.log(`[WhatsApp] Client authenticated for business: ${businessId}`);
    });

    client.on('auth_failure', (msg) => {
      console.error(`[WhatsApp] Authentication failure for business ${businessId}:`, msg);
    });

    client.on('disconnected', (reason) => {
      console.log(`[WhatsApp] Client disconnected for business ${businessId}:`, reason);
      this.clients.delete(businessId);
    });

    try {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Timeout waiting for WhatsApp client to be ready for business ${businessId}`));
        }, 60000); // 60s timeout

        client.once('ready', () => {
          clearTimeout(timeout);
          this.clients.set(businessId, client);
          resolve(client);
        });

        client.once('auth_failure', (err) => {
          clearTimeout(timeout);
          reject(err);
        });

        client.initialize().catch(err => {
          clearTimeout(timeout);
          reject(err);
        });
      });
    } catch (err) {
      console.error(`[WhatsApp] Failed to initialize client for business ${businessId}:`, err);
      throw err;
    }
  }

  /**
   * Gets an existing client or returns null
   * @param {string} businessId 
   */
  getClient(businessId) {
    return this.clients.get(businessId);
  }
}

module.exports = new WhatsAppManager();
