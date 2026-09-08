import { describe, it, expect, vi, afterEach } from "vitest";
import evolutionApiClient from "../../services/evolutionApiClient.js";
import whatsappManager from "../../services/whatsappService.js";

describe("evolutionApiClient & whatsappManager phone handling", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("cleanPhoneForWhatsApp", () => {
    it("returns empty string for null or empty input", () => {
      expect(evolutionApiClient.cleanPhoneForWhatsApp(null)).toBe("");
      expect(evolutionApiClient.cleanPhoneForWhatsApp(undefined)).toBe("");
      expect(evolutionApiClient.cleanPhoneForWhatsApp("")).toBe("");
    });

    it("strips international prefix 00 and prefixes Spanish 34 if 9 digits", () => {
      expect(evolutionApiClient.cleanPhoneForWhatsApp("0034600112233")).toBe("34600112233");
    });

    it("handles foreign numbers with 00 prefix correctly", () => {
      expect(evolutionApiClient.cleanPhoneForWhatsApp("0033612345678")).toBe("33612345678");
    });

    it("adds 34 to 9-digit Spanish mobile and landline numbers", () => {
      expect(evolutionApiClient.cleanPhoneForWhatsApp("600112233")).toBe("34600112233");
      expect(evolutionApiClient.cleanPhoneForWhatsApp("712345678")).toBe("34712345678");
      expect(evolutionApiClient.cleanPhoneForWhatsApp("912345678")).toBe("34912345678");
    });

    it("keeps existing 34 prefix without doubling", () => {
      expect(evolutionApiClient.cleanPhoneForWhatsApp("+34600112233")).toBe("34600112233");
      expect(evolutionApiClient.cleanPhoneForWhatsApp("34600112233")).toBe("34600112233");
    });
  });

  describe("sendMessage phone validation", () => {
    it("rejects invalid or too short phone numbers with an error", async () => {
      await expect(
        whatsappManager.sendMessage("biz-1", "123", "Hello")
      ).rejects.toThrow("Número de teléfono no válido");
    });
  });
});
