/**
 * Volta Service Color System
 *
 * 7 Curated Solid Pastel Themes inspired by user avatars and Refactoring UI principles.
 * Light, non-distracting pastel backgrounds with deep, WCAG AAA compliant text
 * and subtle harmonious borders.
 */

export interface ServicePalette {
  id: string;
  name: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  badgeBg: string;
  badgeText: string;
}

export const SERVICE_PALETTES: ServicePalette[] = [
  {
    id: "teal",
    name: "Menta",
    bg: "#a7f3d0", // Pastel Mint/Teal
    text: "#064e3b",
    border: "#6ee7b7",
    dot: "#059669",
    badgeBg: "rgba(6, 78, 59, 0.08)",
    badgeText: "#064e3b",
  },
  {
    id: "lavender",
    name: "Lavanda",
    bg: "#c7d2fe", // Pastel Lavender/Indigo
    text: "#312e81",
    border: "#a5b4fc",
    dot: "#4f46e5",
    badgeBg: "rgba(49, 46, 129, 0.08)",
    badgeText: "#312e81",
  },
  {
    id: "rose",
    name: "Rosa",
    bg: "#fecdd3", // Pastel Rose/Pink
    text: "#881337",
    border: "#fda4af",
    dot: "#e11d48",
    badgeBg: "rgba(136, 19, 55, 0.08)",
    badgeText: "#881337",
  },
  {
    id: "amber",
    name: "Melocotón",
    bg: "#fde68a", // Pastel Peach/Amber
    text: "#78350f",
    border: "#fcd34d",
    dot: "#d97706",
    badgeBg: "rgba(120, 53, 15, 0.08)",
    badgeText: "#78350f",
  },
  {
    id: "sky",
    name: "Cielo",
    bg: "#bae6fd", // Pastel Sky Blue
    text: "#0c4a6e",
    border: "#7dd3fc",
    dot: "#0284c7",
    badgeBg: "rgba(12, 74, 110, 0.08)",
    badgeText: "#0c4a6e",
  },
  {
    id: "purple",
    name: "Malva",
    bg: "#e9d5ff", // Pastel Purple/Mauve
    text: "#581c87",
    border: "#d8b4fe",
    dot: "#9333ea",
    badgeBg: "rgba(88, 28, 135, 0.08)",
    badgeText: "#581c87",
  },
  {
    id: "coral",
    name: "Coral",
    bg: "#fed7aa", // Pastel Coral/Orange
    text: "#7c2d12",
    border: "#fdba74",
    dot: "#ea580c",
    badgeBg: "rgba(124, 45, 18, 0.08)",
    badgeText: "#7c2d12",
  },
];

// Mapping for legacy or case-insensitive color identifiers
const LEGACY_COLOR_MAP: Record<string, string> = {
  TEAL: "teal",
  DEEP_TEAL: "teal",
  SAGE: "teal",
  SLATE: "sky",
  FOREST: "teal",
  PETROL: "teal",
  INDIGO: "lavender",
  PURPLE: "purple",
  ROSE: "rose",
  PINK: "rose",
  AMBER: "amber",
  EMERALD: "teal",
  SKY: "sky",
  CORAL: "coral",
  ORANGE: "coral",
};

/**
 * Returns the next pastel color ID in rotation for a new service.
 */
export function getNextServiceColor(existingCount: number): string {
  const index = Math.abs(existingCount) % SERVICE_PALETTES.length;
  return SERVICE_PALETTES[index].id;
}

/**
 * Resolves a ServicePalette for any service, ID, name, or index.
 */
export function getServicePalette(
  serviceOrIdOrName?:
    | { id?: string; name?: string; color?: string | null }
    | string
    | number
    | null,
  index?: number
): ServicePalette {
  if (typeof serviceOrIdOrName === "number") {
    return SERVICE_PALETTES[Math.abs(serviceOrIdOrName) % SERVICE_PALETTES.length];
  }

  if (typeof index === "number" && index >= 0) {
    return SERVICE_PALETTES[index % SERVICE_PALETTES.length];
  }

  if (!serviceOrIdOrName) return SERVICE_PALETTES[0];

  let rawColor: string | undefined;
  let identifier: string | undefined;

  if (typeof serviceOrIdOrName === "object") {
    rawColor = serviceOrIdOrName.color || undefined;
    identifier = serviceOrIdOrName.id || serviceOrIdOrName.name;
  } else {
    rawColor = serviceOrIdOrName;
    identifier = serviceOrIdOrName;
  }

  if (rawColor) {
    const normalized = rawColor.toLowerCase();
    const directMatch = SERVICE_PALETTES.find((p) => p.id === normalized);
    if (directMatch) return directMatch;

    const legacyKey = LEGACY_COLOR_MAP[rawColor.toUpperCase()];
    if (legacyKey) {
      const match = SERVICE_PALETTES.find((p) => p.id === legacyKey);
      if (match) return match;
    }
  }

  // Deterministic fallback hashing by string identifier (guarantees consistency)
  if (identifier) {
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      hash = (hash * 31 + identifier.charCodeAt(i)) | 0;
    }
    const idx = Math.abs(hash) % SERVICE_PALETTES.length;
    return SERVICE_PALETTES[idx];
  }

  return SERVICE_PALETTES[0];
}
