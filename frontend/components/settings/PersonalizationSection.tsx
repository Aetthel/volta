"use client";

import { useSession } from "next-auth/react";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLOR_PALETTES, FONT_SCALES, RADIUS_SCALES, applyThemeColors } from "@/lib/theme";
import type { BusinessProfile } from "@/types/settings";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/volta-ui";

interface PersonalizationSectionProps {
  profile: BusinessProfile;
  setProfile: React.Dispatch<React.SetStateAction<BusinessProfile>>;
  businessId: string;
}

export default function PersonalizationSection({
  profile,
  setProfile,
  businessId,
}: PersonalizationSectionProps) {
  const { update } = useSession();

  const updateSetting = (
    key: "themeColor" | "fontSizeLevel" | "borderRadiusLevel",
    value: string
  ) => {
    setProfile((prev) => ({ ...prev, [key]: value }));

    const root = document.documentElement;
    const body = document.body;
    if (key === "themeColor") {
      localStorage.setItem("volta_theme_color", value);
      const palette = COLOR_PALETTES[value as keyof typeof COLOR_PALETTES];
      if (palette) applyThemeColors(root, palette);
    } else if (key === "fontSizeLevel") {
      localStorage.setItem("volta_font_size", value);
      const scale = FONT_SCALES[value as keyof typeof FONT_SCALES]?.scale;
      if (scale) {
        root.style.setProperty("--font-scale", scale);
        if (body) body.style.setProperty("--font-scale", scale);
      }
    } else if (key === "borderRadiusLevel") {
      localStorage.setItem("volta_border_radius", value);
      const scale = RADIUS_SCALES[value as keyof typeof RADIUS_SCALES]?.scale;
      if (scale) {
        root.style.setProperty("--radius-scale", scale);
        if (body) body.style.setProperty("--radius-scale", scale);
      }
    }

    fetch(`/api/backend/business/${businessId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save");
        return res.json();
      })
      .then(async (data) => {
        if (update) await update({ [key]: data[key] });
      })
      .catch((err) => console.error("Error auto-saving personalization:", err));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mt-gutter animate-in fade-in duration-200">
      <Card className="lg:col-span-12">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-primary flex items-center gap-2">
            <Palette />
            <span>Personalización de Marca</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Color Palette */}
          <div className="border-b border-outline-variant/35 pb-6">
            <h3 className="font-label-md text-label-md text-on-surface font-semibold mb-3">
              Paleta de Color de la Marca
            </h3>
            <p className="text-body-sm text-on-surface-variant mb-4">
              Selecciona el color primario para el panel del negocio. Las opciones se guardan
              automáticamente.
            </p>
            <div className="flex flex-wrap gap-4">
              {Object.entries(COLOR_PALETTES).map(([key, palette]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateSetting("themeColor", key)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-body-sm font-medium transition-all cursor-pointer",
                    profile.themeColor === key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-outline-variant hover:bg-surface-variant text-on-surface-variant"
                  )}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/10"
                    style={{ backgroundColor: palette.primary }}
                  />
                  {palette.name}
                </button>
              ))}
            </div>
          </div>

          {/* Font Scale */}
          <div className="border-b border-outline-variant/35 pb-6">
            <h3 className="font-label-md text-label-md text-on-surface font-semibold mb-3">
              Tamaño del Texto
            </h3>
            <p className="text-body-sm text-on-surface-variant mb-4">
              Ajusta la escala de tipografía de toda la aplicación. Las opciones se guardan
              automáticamente.
            </p>
            <div className="flex gap-4">
              {Object.entries(FONT_SCALES).map(([key, scaleObj]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateSetting("fontSizeLevel", key)}
                  className={cn(
                    "px-4 py-2.5 rounded-lg border text-body-sm font-medium transition-all flex-1 text-center cursor-pointer",
                    profile.fontSizeLevel === key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-outline-variant hover:bg-surface-variant text-on-surface-variant"
                  )}
                >
                  {scaleObj.name}
                </button>
              ))}
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <h3 className="font-label-md text-label-md text-on-surface font-semibold mb-3">
              Estilo de los Bordes
            </h3>
            <p className="text-body-sm text-on-surface-variant mb-4">
              Elige el nivel de redondeado de las tarjetas, botones y campos de entrada. Las
              opciones se guardan automáticamente.
            </p>
            <div className="flex gap-4">
              {Object.entries(RADIUS_SCALES).map(([key, radiusObj]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateSetting("borderRadiusLevel", key)}
                  className={cn(
                    "px-4 py-2.5 rounded-lg border text-body-sm font-medium transition-all flex-1 text-center cursor-pointer",
                    profile.borderRadiusLevel === key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-outline-variant hover:bg-surface-variant text-on-surface-variant"
                  )}
                  style={{
                    borderRadius: key === "SMALL" ? "0px" : key === "MEDIUM" ? "8px" : "16px",
                  }}
                >
                  {radiusObj.name}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
