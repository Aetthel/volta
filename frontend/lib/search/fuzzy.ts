/**
 * Motor de coincidencia del buscador global (⌘K).
 *
 * Objetivos, por orden de importancia:
 *  1. Escribir "wasap", "whatsap" o "WhatsApp" tiene que encontrar lo mismo.
 *  2. Los términos que el usuario ya conoce (título) pesan más que los sinónimos
 *     internos (keywords), y estos más que la descripción larga.
 *  3. Cada palabra de la consulta debe aparecer en algún sitio de la entrada
 *     (AND), para que "plantilla whatsapp" no devuelva todo lo de WhatsApp.
 */

/**
 * Minúsculas y sin diacríticos, preservando la longitud del texto original.
 *
 * La preservación de longitud es lo que permite usar los índices calculados
 * sobre el texto normalizado para resaltar el texto original: un NFD "a secas"
 * añadiría caracteres combinantes y descuadraría todos los rangos.
 */
export function normalizeText(text: string): string {
  let out = "";
  for (const char of text.toLowerCase()) {
    // El primer code point de la forma NFD es la letra base ("á" -> "a",
    // "ñ" -> "n"); las marcas combinantes quedan detrás y se descartan.
    const stripped = Array.from(char.normalize("NFD"))[0] ?? char;
    // Si la base no ocupa lo mismo que el original (ligaduras, símbolos fuera
    // del BMP) conservamos el original para no descuadrar los índices.
    out += stripped.length === char.length ? stripped : char;
  }
  return out;
}

/** Parte la consulta en términos normalizados, ignorando espacios de más. */
export function tokenizeQuery(query: string): string[] {
  return normalizeText(query.trim())
    .split(/\s+/)
    .filter(Boolean);
}

export type HighlightRange = [start: number, end: number];

export interface MatchableFields {
  title: string;
  /** Sinónimos, términos coloquiales y traducciones. */
  keywords?: string[];
  description?: string;
  /** Sección a la que pertenece la entrada ("Ajustes", "Agenda"...). */
  group?: string;
}

export interface MatchResult {
  score: number;
  /** Tramos del título que han coincidido, ya fusionados y ordenados. */
  titleRanges: HighlightRange[];
}

const FIELD_WEIGHT = {
  title: 100,
  keyword: 62,
  group: 45,
  description: 34,
} as const;

const KIND_BONUS = {
  /** El campo entero empieza por el término. */
  prefix: 40,
  /** El término empieza una palabra dentro del campo. */
  wordStart: 26,
  /** El término aparece en cualquier posición. */
  substring: 10,
  /** Las letras del término aparecen en orden, pero no seguidas. */
  subsequence: 0,
} as const;

interface FieldHit {
  score: number;
  range: HighlightRange | null;
}

function isWordBoundary(text: string, index: number): boolean {
  if (index === 0) return true;
  return !/[a-z0-9]/.test(text[index - 1]);
}

/** Puntúa un término contra un único campo ya normalizado. */
function matchField(field: string, token: string, weight: number): FieldHit | null {
  const index = field.indexOf(token);

  if (index !== -1) {
    const kind =
      index === 0
        ? KIND_BONUS.prefix
        : isWordBoundary(field, index)
          ? KIND_BONUS.wordStart
          : KIND_BONUS.substring;

    return { score: weight + kind, range: [index, index + token.length] };
  }

  return null;
}

/**
 * Coincidencia por subsecuencia: "clte" encuentra "clientes".
 *
 * Solo se aplica al título y con términos de 3+ letras; en descripciones largas
 * cualquier término casaría y el buscador dejaría de filtrar nada.
 */
function matchSubsequence(field: string, token: string, weight: number): FieldHit | null {
  if (token.length < 3) return null;

  let cursor = 0;
  let first = -1;
  let last = -1;

  for (const char of token) {
    const found = field.indexOf(char, cursor);
    if (found === -1) return null;
    if (first === -1) first = found;
    last = found;
    cursor = found + 1;
  }

  // Cuanto más disperso el match, menos relevante.
  const spread = last - first + 1;
  const density = token.length / spread;

  return {
    score: weight * 0.45 * density + KIND_BONUS.subsequence,
    range: null,
  };
}

function mergeRanges(ranges: HighlightRange[]): HighlightRange[] {
  if (ranges.length === 0) return [];

  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const merged: HighlightRange[] = [sorted[0]];

  for (const [start, end] of sorted.slice(1)) {
    const last = merged[merged.length - 1];
    if (start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }

  return merged;
}

/**
 * Puntúa una entrada contra la consulta completa.
 *
 * Devuelve `null` si algún término de la consulta no aparece en ningún campo,
 * de forma que añadir palabras siempre estrecha los resultados.
 */
export function scoreEntry(query: string, fields: MatchableFields): MatchResult | null {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return { score: 0, titleRanges: [] };

  const title = normalizeText(fields.title);
  const keywords = (fields.keywords ?? []).map(normalizeText);
  const description = fields.description ? normalizeText(fields.description) : "";
  const group = fields.group ? normalizeText(fields.group) : "";

  let total = 0;
  const ranges: HighlightRange[] = [];

  for (const token of tokens) {
    let best: FieldHit | null = matchField(title, token, FIELD_WEIGHT.title);

    for (const keyword of keywords) {
      const hit = matchField(keyword, token, FIELD_WEIGHT.keyword);
      if (hit && (!best || hit.score > best.score)) best = { score: hit.score, range: null };
    }

    if (group) {
      const hit = matchField(group, token, FIELD_WEIGHT.group);
      if (hit && (!best || hit.score > best.score)) best = { score: hit.score, range: null };
    }

    if (description) {
      const hit = matchField(description, token, FIELD_WEIGHT.description);
      if (hit && (!best || hit.score > best.score)) best = { score: hit.score, range: null };
    }

    if (!best) {
      best = matchSubsequence(title, token, FIELD_WEIGHT.title);
    }

    // Un término sin sitio donde encajar descarta la entrada entera.
    if (!best) return null;

    total += best.score;
    if (best.range) ranges.push(best.range);
  }

  // La consulta escrita tal cual al principio del título es la señal más fuerte
  // que tenemos de que el usuario buscaba exactamente esto.
  const fullQuery = normalizeText(query.trim());
  if (fullQuery && title.startsWith(fullQuery)) total += 50;
  if (fullQuery && title === fullQuery) total += 60;

  // Con igual puntuación, el título más corto suele ser el más concreto.
  total -= Math.min(title.length, 60) * 0.15;

  return { score: total, titleRanges: mergeRanges(ranges) };
}

/** Trocea un texto en fragmentos marcados/no marcados para el resaltado. */
export function splitHighlight(
  text: string,
  ranges: HighlightRange[]
): { text: string; match: boolean }[] {
  if (ranges.length === 0) return [{ text, match: false }];

  const parts: { text: string; match: boolean }[] = [];
  let cursor = 0;

  for (const [start, end] of ranges) {
    if (start > cursor) parts.push({ text: text.slice(cursor, start), match: false });
    parts.push({ text: text.slice(start, end), match: true });
    cursor = end;
  }

  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });

  return parts;
}
