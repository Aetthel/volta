import prisma from "../config/db.js";
import { logger } from "../utils/logger.js";
import evolutionApiClient from "./evolutionApiClient.js";

class WhatsAppManager {
  constructor() {
    this._initializing = new Map();
  }

  async updateStatus(businessId, status, qr = null) {
    try {
      await prisma.business.update({
        where: { id: businessId },
        data: {
          whatsappStatus: status,
          qrCode: qr,
        },
      });
      logger.info(`[WhatsApp] Status updated for ${businessId}: ${status}`);
    } catch (err) {
      logger.error(`[WhatsApp] Error updating status for ${businessId}:`, err);
    }
  }

  async deleteSession(businessId) {
    try {
      logger.info(`[WhatsApp] Deleting session for business: ${businessId}`);
      await evolutionApiClient.deleteInstance(businessId);
    } catch (err) {
      logger.error(`[WhatsApp] Failed to delete session for ${businessId}:`, err);
    }
  }

  async initClient(businessId) {
    if (this._initializing.has(businessId)) {
      return this._initializing.get(businessId);
    }

    const initPromise = this._doInitClient(businessId);
    this._initializing.set(businessId, initPromise);

    try {
      return await initPromise;
    } finally {
      this._initializing.delete(businessId);
    }
  }

  async _doInitClient(businessId) {
    logger.info(`[WhatsApp] Initializing Evolution instance for business: ${businessId}`);

    try {
      const response = await evolutionApiClient.createInstance(businessId);
      const state = await evolutionApiClient.getConnectionState(businessId).catch(() => null);

      if (state?.state === "open") {
        await this.updateStatus(businessId, "CONNECTED", null);
      } else {
        const qrData = await evolutionApiClient.getConnectQr(businessId).catch(() => null);
        const qrCodeString = qrData?.base64 || qrData?.code || null;
        await this.updateStatus(businessId, "WAITING_QR", qrCodeString);
      }

      return response;
    } catch (err) {
      logger.error(`[WhatsApp] Failed to initialize Evolution instance for ${businessId}:`, err.message);
      await this.updateStatus(businessId, "DISCONNECTED", null);
      throw err;
    }
  }

  async waitForReady(businessId, timeoutMs = 15000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const state = await evolutionApiClient.getConnectionState(businessId);
        if (state?.state === "open") {
          return true;
        }
      } catch (e) {
        // Ignore and retry
      }
      await new Promise((res) => setTimeout(res, 1000));
    }

    // In non-production or testing, don't block forever
    if (process.env.NODE_ENV !== "production") {
      logger.info(`[WhatsApp] [DEV] Bypassing waitForReady timeout for ${businessId}`);
      return true;
    }

    throw new Error(`[WhatsApp] Timeout waiting for business ${businessId} connection`);
  }

  cleanPhoneForWhatsApp(phone) {
    return evolutionApiClient.cleanPhoneForWhatsApp(phone);
  }

  async sendMessage(businessId, phone, message) {
    const cleanPhone = this.cleanPhoneForWhatsApp(phone);

    try {
      logger.info(`[WhatsApp] Sending message via Evolution API to ${cleanPhone}...`);
      return await evolutionApiClient.sendTextMessage(businessId, cleanPhone, message);
    } catch (err) {
      logger.error(`[WhatsApp] Failed to send message to ${cleanPhone}:`, err.message);

      if (process.env.NODE_ENV !== "production") {
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
