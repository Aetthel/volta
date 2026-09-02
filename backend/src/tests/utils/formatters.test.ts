import { describe, it, expect } from "vitest";
import { normalizePhone, normalizeString, formatCurrency } from "../../utils/formatters.js";
import whatsappManager from "../../services/whatsappService.js";

describe("normalizePhone", () => {
  it("collapses every way of writing the same Spanish mobile into one canonical value", () => {
    const canonical = "600112233";

    expect(normalizePhone("600112233")).toBe(canonical);
    expect(normalizePhone("600 11 22 33")).toBe(canonical);
    expect(normalizePhone("600-11-22-33")).toBe(canonical);
    expect(normalizePhone("+34600112233")).toBe(canonical);
    expect(normalizePhone("+34 600 11 22 33")).toBe(canonical);
    expect(normalizePhone("0034600112233")).toBe(canonical);
  });

  it("is idempotent, so re-normalizing a stored value never changes it", () => {
    const once = normalizePhone("+34 600 11 22 33");
    expect(normalizePhone(once)).toBe(once);
  });

  it("keeps a 9-digit number that merely starts with 34", () => {
    expect(normalizePhone("341234567")).toBe("341234567");
  });

  it("returns an empty string for empty input", () => {
    expect(normalizePhone("")).toBe("");
    expect(normalizePhone(null as any)).toBe("");
    expect(normalizePhone(undefined as any)).toBe("");
  });

  it("feeds cleanPhoneForWhatsApp without fighting it", () => {
    const canonical = normalizePhone("+34 600 11 22 33");
    expect(whatsappManager.cleanPhoneForWhatsApp(canonical)).toBe("34600112233");
    expect(whatsappManager.cleanPhoneForWhatsApp("34600112233")).toBe("34600112233");
  });
});

describe("normalizeString", () => {
  it("lowercases, strips accents and collapses whitespace", () => {
    expect(normalizeString("  María   José  ")).toBe("maria jose");
  });

  it("returns an empty string for empty input", () => {
    expect(normalizeString("")).toBe("");
    expect(normalizeString(null as any)).toBe("");
  });
});

describe("formatCurrency", () => {
  it("formats amounts with the Spanish convention", () => {
    expect(formatCurrency(1234.5).replace(/\s/g, " ")).toBe("1234,50 €");
    expect(formatCurrency(12345.5).replace(/\s/g, " ")).toBe("12.345,50 €");
  });

  it("falls back to zero for non-numeric input", () => {
    expect(formatCurrency("no-es-un-numero" as any).replace(/\s/g, " ")).toBe("0,00 €");
  });
});
