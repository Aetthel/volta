export const COLOR_PALETTES = {
  CLINICAL_ELEGANCE: {
    name: "Elegancia Clínica (Defecto)",
    primary: "#006565",
    primaryContainer: "#008080",
    secondary: "#4c6262",
    secondaryContainer: "#cce4e4",
  },
  ORCHID_SERENITY: {
    name: "Orquídea Serena",
    primary: "#8a4d4e",
    primaryContainer: "#d48c8c",
    secondary: "#545f72",
    secondaryContainer: "#d5e0f7",
  },
  ORGANIC_VITALITY: {
    name: "Vitalidad Orgánica",
    primary: "#476500",
    primaryContainer: "#5d7f13",
    secondary: "#676014",
    secondaryContainer: "#efe58b",
  },
  WARM_SAND: {
    name: "Arena Cálida",
    primary: "#934930",
    primaryContainer: "#d17a5d",
    secondary: "#645d56",
    secondaryContainer: "#ebe1d8",
  }
};

export const FONT_SCALES = {
  SMALL: { name: "Pequeño", scale: "0.9" },
  MEDIUM: { name: "Mediano", scale: "1.0" },
  LARGE: { name: "Grande", scale: "1.15" }
};

export const RADIUS_SCALES = {
  SMALL: { name: "Recto", scale: "0.0" },
  MEDIUM: { name: "Suave", scale: "1.0" },
  LARGE: { name: "Muy Redondeado", scale: "2.0" }
};

export function getThemeColor(color: string | null | undefined): keyof typeof COLOR_PALETTES {
  if (!color) return "CLINICAL_ELEGANCE";
  const mapped: Record<string, string> = {
    TEAL: "CLINICAL_ELEGANCE",
    INDIGO: "CLINICAL_ELEGANCE",
    ROSE: "ORCHID_SERENITY",
    AMBER: "WARM_SAND",
    EMERALD: "ORGANIC_VITALITY",
    CLINICAL_ELEGANCE: "CLINICAL_ELEGANCE",
    ORCHID_SERENITY: "ORCHID_SERENITY",
    ORGANIC_VITALITY: "ORGANIC_VITALITY",
    WARM_SAND: "WARM_SAND",
  };
  const target = mapped[color.toUpperCase()] || color.toUpperCase();
  return (target in COLOR_PALETTES ? target : "CLINICAL_ELEGANCE") as keyof typeof COLOR_PALETTES;
}
