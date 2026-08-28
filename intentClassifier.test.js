import intentClassifier, { INTENT_TAGS } from "../../services/intentClassifier.js";

describe("IntentClassifier Unit Tests", () => {
  describe("Level 1: Deterministic Patterns (Zero Latency & Zero Cost)", () => {
    const confirmationCases = [
      "si",
      "Si",
      "sí",
      "SÍ",
      "ok",
      "OK",
      "vale",
      "confirmo",
      "confirmado",
      "perfecto",
      "de acuerdo",
      "asistire",
      "alli estare",
      "1",
      "Si gracias",
      "Confirmo, muchas gracias",
      "Ok alli estare",
    ];

    confirmationCases.forEach((text) => {
      it(`should classify "${text}" as CONFIRMADO via deterministic rules`, async () => {
        const result = await intentClassifier.classify(text);
        expect(result.tag).toBe(INTENT_TAGS.CONFIRMADO);
        expect(result.source).toBe("deterministic");
      });
    });

    const cancellationCases = [
      "no",
      "No",
      "cancelo",
      "cancelar",
      "cancelado",
      "no puedo",
      "no podre",
      "imposible",
      "2",
      "No puedo ir",
      "Cancelo la cita",
    ];

    cancellationCases.forEach((text) => {
      it(`should classify "${text}" as CANCELADO via deterministic rules`, async () => {
        const result = await intentClassifier.classify(text);
        expect(result.tag).toBe(INTENT_TAGS.CANCELADO);
        expect(result.source).toBe("deterministic");
      });
    });
  });

  describe("Level 2: Fallback / Heuristics for Complex Inquiries", () => {
    it("should classify schedule change requests as SOLICITA_CAMBIO", async () => {
      const result = await intentClassifier.classify("Hola, ¿podríamos cambiar la hora para mañana por la tarde?");
      expect(result.tag).toBe(INTENT_TAGS.SOLICITA_CAMBIO);
    });

    it("should classify general questions as REQUIERE_HUMANO", async () => {
      const result = await intentClassifier.classify("Hola, ¿dónde tenéis el parking más cercano?");
      expect(result.tag).toBe(INTENT_TAGS.REQUIERE_HUMANO);
    });
  });
});
