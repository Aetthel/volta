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
    expect(normalizePhone(null)).toBe("");
    expect(normalizePhone(undefined)).toBe("");
  });

  it("feeds cleanPhoneForWhatsApp without fighting it", () => {
    // El canon se guarda sin el 34; el gateway lo vuelve a añadir al marcar.
    const canonical = normalizePhone("+34 600 11 22 33");
    expect(whatsappManager.cleanPhoneForWhatsApp(canonical)).toBe("34600112233");

    // Y aplicarlo dos veces no duplica el prefijo.
    expect(whatsappManager.cleanPhoneForWhatsApp("34600112233")).toBe("34600112233");
  });
});

describe("normalizeString", () => {
  it("lowercases, strips accents and collapses whitespace", () => {
    expect(normalizeString("  María   José  ")).toBe("maria jose");
  });

  it("returns an empty string for empty input", () => {
    expect(normalizeString("")).toBe("");
    expect(normalizeString(null)).toBe("");
  });
});

describe("formatCurrency", () => {
  it("formats amounts with the Spanish convention", () => {
    // El español no agrupa los millares de cuatro dígitos, sí a partir de cinco.
    expect(formatCurrency(1234.5).replace(/ /g, " ")).toBe("1234,50 €");
    expect(formatCurrency(12345.5).replace(/ /g, " ")).toBe("12.345,50 €");
  });

  it("falls back to zero for non-numeric input", () => {
    expect(formatCurrency("no-es-un-numero").replace(/ /g, " ")).toBe("0,00 €");
  });
});
