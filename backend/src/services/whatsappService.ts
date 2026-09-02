import prisma from "../config/db.js";
import { logger } from "../utils/logger.js";
import evolutionApiClient, { type EvolutionConnectionState } from "./evolutionApiClient.js";

declare global {
  // eslint-disable-next-line no-var
  var whatsappManager: WhatsAppManager | undefined;
}

export type WhatsAppStatus = "CONNECTED" | "DISCONNECTED" | "WAITING_QR";

export class WhatsAppManager {
  private _initializing: Map<string, Promise<any>>;

  constructor() {
    this._initializing = new Map();
  }

  async updateStatus(
    businessId: string,
    status: WhatsAppStatus,
    qr: string | null = null
  ): Promise<void> {
    try {
      await prisma.business.update({
        where: { id: businessId },
        data: {
          whatsappStatus: status,
          qrCode: qr,
        },
      });
      logger.info(`[WhatsApp] Status updated for ${businessId}: ${status}`);
    } catch (err: unknown) {
      logger.error(`[WhatsApp] Error updating status for ${businessId}:`, err);
    }
  }

  async deleteSession(businessId: string): Promise<void> {
    try {
      logger.info(`[WhatsApp] Deleting session for business: ${businessId}`);
      await evolutionApiClient.deleteInstance(businessId);
    } catch (err: unknown) {
      logger.error(`[WhatsApp] Failed to delete session for ${businessId}:`, err);
    }
  }

  async initClient(businessId: string): Promise<any> {
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

  private async _doInitClient(businessId: string): Promise<any> {
    logger.info(`[WhatsApp] Initializing Evolution instance for business: ${businessId}`);

    try {
      const response = await evolutionApiClient.createInstance(businessId);
      const state = await evolutionApiClient.getConnectionState(businessId).catch(() => null);

      if (state?.state === "open") {
        await this.updateStatus(businessId, "CONNECTED", null);
      } else {
        let qrCodeString: string | null = null;
        for (let i = 0; i < 4; i++) {
          const qrData = await evolutionApiClient.getConnectQr(businessId).catch(() => null);
          qrCodeString = qrData?.base64 || qrData?.code || null;
          if (qrCodeString) break;
          await new Promise((res) => setTimeout(res, 600));
        }
        await this.updateStatus(businessId, "WAITING_QR", qrCodeString);
      }

      return response;
    } catch (err: any) {
      logger.error(`[WhatsApp] Failed to initialize Evolution instance for ${businessId}:`, err.message);
      await this.updateStatus(businessId, "DISCONNECTED", null);
      throw err;
    }
  }

  async getQr(businessId: string): Promise<string | null> {
    try {
      const qrData = await evolutionApiClient.getConnectQr(businessId);
      const qrCodeString: string | null = qrData?.base64 || qrData?.code || null;
      if (qrCodeString) {
        await this.updateStatus(businessId, "WAITING_QR", qrCodeString);
      }
      return qrCodeString;
    } catch (err: any) {
      logger.warn(`[WhatsApp] Failed to fetch connect QR for ${businessId}:`, err.message);
      return null;
    }
  }

  isReady(_businessId?: string): boolean {
    return true;
  }

  async getConnectionState(businessId: string): Promise<EvolutionConnectionState> {
    return evolutionApiClient.getConnectionState(businessId);
  }

  async waitForReady(businessId: string, timeoutMs = 15000): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const state = await evolutionApiClient.getConnectionState(businessId);
        if (state?.state === "open") {
          return true;
        }
      } catch {
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

  cleanPhoneForWhatsApp(phone?: string | null): string {
    return evolutionApiClient.cleanPhoneForWhatsApp(phone);
  }

  async sendMessage(businessId: string, phone: string, message: string): Promise<any> {
    const cleanPhone = this.cleanPhoneForWhatsApp(phone);

    try {
      logger.info(`[WhatsApp] Sending message via Evolution API to ${cleanPhone}...`);
      return await evolutionApiClient.sendTextMessage(businessId, cleanPhone, message);
    } catch (err: any) {
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

export const whatsappManager = globalThis.whatsappManager;
export default whatsappManager;
