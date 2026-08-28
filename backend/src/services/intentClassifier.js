import config from "../config/index.js";
import { logger } from "../utils/logger.js";

export const INTENT_TAGS = {
  CONFIRMADO: "CONFIRMADO",
  CANCELADO: "CANCELADO",
  SOLICITA_CAMBIO: "SOLICITA_CAMBIO",
  REQUIERE_HUMANO: "REQUIERE_HUMANO",
};

/**
 * Two-tier Intent Classifier for WhatsApp appointment responses
 */
class IntentClassifier {
  /**
   * Level 1: Deterministic regex/keyword classification (0ms, 0€)
   */
  classifyDeterministic(text) {
    if (!text || typeof text !== "string") return null;

    const normalized = text
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^\w\s]/gi, ""); // remove punctuation

    // Exact affirmative patterns
    const affirmativeDirect = /^(si|sip|yes|ok|okay|vale|confirmo|confirmado|confirmar|asistire|alli estare|ahi estare|perfecto|de acuerdo|listo|voy|1)$/i;
    // Starts with confirmation
    const affirmativePrefix = /^(si|confirmo|ok|vale)\s+(gracias|muchas gracias|alli estare|nos vemos|perfecto)/i;

    if (affirmativeDirect.test(normalized) || affirmativePrefix.test(normalized)) {
      return {
        tag: INTENT_TAGS.CONFIRMADO,
        confidence: 1.0,
        source: "deterministic",
        reason: "Patrón afirmativo directo detectado",
      };
    }

    // Exact cancellation patterns
    const cancellationDirect = /^(no|nop|cancelo|cancelar|cancelado|anulo|anular|no puedo|no podre|no asisto|imposible|2)$/i;
    // Starts with cancellation
    const cancellationPrefix = /^(no puedo|cancelo|anular)\s+(ir|asistir|gracias|el turno|la cita)/i;

    if (cancellationDirect.test(normalized) || cancellationPrefix.test(normalized)) {
      return {
        tag: INTENT_TAGS.CANCELADO,
        confidence: 1.0,
        source: "deterministic",
        reason: "Patrón de cancelación directo detectado",
      };
    }

    return null;
  }

  /**
   * Level 2: AI / LLM classification using Groq Cloud (Free Tier) or OpenAI
   */
  async classifyWithLLM(text, context = {}) {
    const groqKey = config.groqApiKey;
    const openaiKey = config.openaiApiKey;

    const systemPrompt = `Eres un clasificador ultrarrápido y preciso de respuestas de clientes sobre recordatorios de citas.
Clasifica el mensaje del cliente en exactamente UNA de estas 4 etiquetas:
- CONFIRMADO: El cliente confirma que irá o acepta la cita.
- CANCELADO: El cliente rechaza o cancela la cita porque no puede ir.
- SOLICITA_CAMBIO: El cliente pide cambiar de fecha, hora o reagendar la cita.
- REQUIERE_HUMANO: El cliente hace una pregunta específica, duda sobre precios/ubicación o un comentario que requiere atención manual.

Responde ÚNICAMENTE un objeto JSON válido con este esquema:
{"tag": "CONFIRMADO" | "CANCELADO" | "SOLICITA_CAMBIO" | "REQUIERE_HUMANO"}`;

    const userContent = `Mensaje del cliente: "${text}"`;

    // Try Groq First (Free Tier)
    if (groqKey) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContent },
            ],
            response_format: { type: "json_object" },
            max_tokens: 30,
            temperature: 0,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          const parsed = JSON.parse(json.choices[0]?.message?.content || "{}");
          if (parsed.tag && INTENT_TAGS[parsed.tag]) {
            return {
              tag: parsed.tag,
              confidence: 0.95,
              source: "groq_llama_3.3",
            };
          }
        }
      } catch (groqErr) {
        logger.warn("[IntentClassifier] Groq request failed, falling back:", groqErr.message);
      }
    }

    // Fallback to OpenAI if configured
    if (openaiKey) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContent },
            ],
            response_format: { type: "json_object" },
            max_tokens: 30,
            temperature: 0,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          const parsed = JSON.parse(json.choices[0]?.message?.content || "{}");
          if (parsed.tag && INTENT_TAGS[parsed.tag]) {
            return {
              tag: parsed.tag,
              confidence: 0.95,
              source: "openai_gpt4o_mini",
            };
          }
        }
      } catch (openaiErr) {
        logger.warn("[IntentClassifier] OpenAI request failed:", openaiErr.message);
      }
    }

    // If no AI key or AI failed, check basic heuristic for change requests or mark REQUIERE_HUMANO
    if (/cambi|hora|fecha|manana|tarde|jueves|viernes|lunes|martes|miercoles|hueco|posponer/i.test(text)) {
      return {
        tag: INTENT_TAGS.SOLICITA_CAMBIO,
        confidence: 0.7,
        source: "heuristic_fallback",
      };
    }

    return {
      tag: INTENT_TAGS.REQUIERE_HUMANO,
      confidence: 0.5,
      source: "default_fallback",
    };
  }

  /**
   * Main classifier method combining Level 1 and Level 2
   */
  async classify(text, context = {}) {
    const level1Result = this.classifyDeterministic(text);
    if (level1Result) {
      logger.info(`[IntentClassifier] Level 1 Match: ${level1Result.tag} ("${text}")`);
      return level1Result;
    }

    const level2Result = await this.classifyWithLLM(text, context);
    logger.info(`[IntentClassifier] Level 2 Match (${level2Result.source}): ${level2Result.tag} ("${text}")`);
    return level2Result;
  }
}

export const intentClassifier = new IntentClassifier();
export default intentClassifier;
