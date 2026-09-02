// @ts-ignore - config is an existing JS module
import config from "../config/index.js";
import { logger } from "../utils/logger.js";

export interface EvolutionConnectionState {
  instanceName: string;
  state: "open" | "close" | "connecting" | string;
}

/**
 * Evolution API v2 HTTP Client for WhatsApp Management
 */
class EvolutionApiClient {
  public baseUrl: string;
  public apiKey: string;

  constructor() {
    this.baseUrl = config.evolutionApiUrl || "http://localhost:8080";
    this.apiKey = config.evolutionApiKey || "volta_dev_evolution_key_2026";
  }

  getInstanceName(businessId: string): string {
    return `biz_${businessId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  }

  getHeaders(): Record<string, string> {
    return {
      apikey: this.apiKey,
      "Content-Type": "application/json",
    };
  }

  /**
   * Helper for API HTTP requests
   */
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      ...this.getHeaders(),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.response?.message || data?.message || response.statusText;
        const err = new Error(
          `[EvolutionAPI] HTTP ${response.status} on ${endpoint}: ${JSON.stringify(errorMsg)}`
        ) as Error & { status?: number; data?: unknown };
        err.status = response.status;
        err.data = data;
        throw err;
      }

      return data as T;
    } catch (err: any) {
      if (err.status) throw err;
      logger.error(`[EvolutionAPI] Network error requesting ${url}:`, err.message);
      throw new Error(`[EvolutionAPI] Error de red al conectar con el gateway: ${err.message}`);
    }
  }

  /**
   * Creates or fetches an instance for a business.
   */
  async createInstance(businessId: string) {
    const instanceName = this.getInstanceName(businessId);
    logger.info(`[EvolutionAPI] Creating / ensuring instance for business: ${businessId} (${instanceName})`);

    try {
      // First check if instance exists
      const connectionState = await this.getConnectionState(businessId).catch(() => null);
      if (connectionState) {
        logger.info(`[EvolutionAPI] Instance ${instanceName} already exists with state: ${connectionState.state}`);
        return { instance: { instanceName, status: connectionState.state } };
      }
    } catch {
      // Proceed to creation
    }

    const payload = {
      instanceName,
      qrcode: true,
      integration: "WHATSAPP-BAILEYS",
    };

    return this.request("/instance/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Fetches QR code connection information
   */
  async getConnectQr(businessId: string) {
    const instanceName = this.getInstanceName(businessId);
    return this.request(`/instance/connect/${instanceName}`, {
      method: "GET",
    });
  }

  /**
   * Fetches current connection state
   */
  async getConnectionState(businessId: string): Promise<EvolutionConnectionState> {
    const instanceName = this.getInstanceName(businessId);
    const data = await this.request<{ instance?: EvolutionConnectionState }>(
      `/instance/connectionState/${instanceName}`,
      { method: "GET" }
    );
    return data?.instance || { instanceName, state: "close" };
  }

  /**
   * Sends a plain text message
   */
  async sendTextMessage(businessId: string, phone: string, text: string) {
    const instanceName = this.getInstanceName(businessId);
    const cleanPhone = this.cleanPhoneForWhatsApp(phone);

    logger.info(`[EvolutionAPI] Sending message via ${instanceName} to ${cleanPhone}...`);

    const payload = {
      number: cleanPhone,
      text,
    };

    return this.request(`/message/sendText/${instanceName}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Disconnects / Logs out an instance
   */
  async logoutInstance(businessId: string) {
    const instanceName = this.getInstanceName(businessId);
    try {
      return await this.request(`/instance/logout/${instanceName}`, {
        method: "DELETE",
      });
    } catch (err: any) {
      logger.warn(`[EvolutionAPI] Logout warning for ${instanceName}:`, err.message);
      return null;
    }
  }

  /**
   * Deletes an instance completely
   */
  async deleteInstance(businessId: string) {
    const instanceName = this.getInstanceName(businessId);
    try {
      return await this.request(`/instance/delete/${instanceName}`, {
        method: "DELETE",
      });
    } catch (err: any) {
      logger.warn(`[EvolutionAPI] Delete warning for ${instanceName}:`, err.message);
      return null;
    }
  }

  cleanPhoneForWhatsApp(phone?: string | null): string {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    if (
      digits.length === 9 &&
      (digits.startsWith("6") || digits.startsWith("7") || digits.startsWith("9"))
    ) {
      return `34${digits}`;
    }
    return digits;
  }
}

export const evolutionApiClient = new EvolutionApiClient();
export default evolutionApiClient;
