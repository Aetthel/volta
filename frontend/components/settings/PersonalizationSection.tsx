"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Palette,
  Type,
  Maximize2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { COLOR_PALETTES, FONT_SCALES, RADIUS_SCALES, applyThemeColors } from "@/lib/theme";
import type { BusinessProfile } from "@/types/settings";
import { Button, Badge } from "@/components/ui/volta-ui";

import { useTheme } from "@/hooks/useTheme";

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
  const { themeColor, fontSizeLevel, borderRadiusLevel, updateTheme, isSaving } = useTheme();
  const [savedBadge, setSavedBadge] = useState(false);

  const activeThemeColor = profile.themeColor || themeColor || "CLINICAL_ELEGANCE";
  const activeFontSize = profile.fontSizeLevel || fontSizeLevel || "MEDIUM";
  const activeBorderRadius = profile.borderRadiusLevel || borderRadiusLevel || "MEDIUM";

  const updateSetting = async (
    key: "themeColor" | "fontSizeLevel" | "borderRadiusLevel",
    value: string
  ) => {
    setProfile((prev) => ({ ...prev, [key]: value }));

    const success = await updateTheme(
      { [key]: value },
      { persistToDb: true, businessId }
    );

    if (success) {
      setSavedBadge(true);
      setTimeout(() => setSavedBadge(false), 2000);
    }
  };

  const currentThemeKey = activeThemeColor;
  const currentPalette =
    COLOR_PALETTES[currentThemeKey as keyof typeof COLOR_PALETTES] ||
    COLOR_PALETTES.CLINICAL_ELEGANCE;

  const currentRadiusKey = activeBorderRadius;
  const currentRadiusPx =
    currentRadiusKey === "SMALL" ? "0px" : currentRadiusKey === "LARGE" ? "16px" : "8px";


  return (
    <div className="animate-in fade-in duration-200 w-full">
      <div className="flex flex-col gap-10">
        {/* 1. Paleta de color */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <h3 className="text-lg sm:text-xl font-bold text-on-surface tracking-tight">
                Paleta de Color de la Marca
              </h3>
            </div>
            {savedBadge && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Guardado</span>
              </span>
            )}
          </div>

          <p className="text-xs text-on-surface-variant/80 mb-5 leading-relaxed">
            Selecciona la identidad visual de tu plataforma. El sistema adaptará
            automáticamente todos los acentos, botones y estados.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(COLOR_PALETTES).map(([key, palette]) => {
              const isSelected = (profile.themeColor || "CLINICAL_ELEGANCE") === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateSetting("themeColor", key)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer group",
                    isSelected
                      ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                      : "border-outline-variant/60 bg-surface-container-low hover:bg-surface-container hover:border-outline-variant"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-6 h-6 rounded-full border border-black/10 shadow-2xs shrink-0 flex items-center justify-center text-white"
                      style={{ backgroundColor: palette.primary }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold truncate",
                        isSelected ? "text-primary font-bold" : "text-on-surface"
                      )}
                    >
                      {palette.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Escala tipográfica */}
        <section className="pt-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Type className="w-5 h-5 text-primary" />
              <h3 className="text-lg sm:text-xl font-bold text-on-surface tracking-tight">Escala Tipográfica</h3>
            </div>
            {savedBadge && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Guardado</span>
              </span>
            )}
          </div>

          <p className="text-xs text-on-surface-variant/80 mb-5 leading-relaxed">
            Ajusta el tamaño base de la letra para toda la aplicación.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(FONT_SCALES).map(([key, config]) => {
              const isSelected = (profile.fontSizeLevel || "MEDIUM") === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateSetting("fontSizeLevel", key)}
                  className={cn(
                    "flex flex-col p-4 rounded-xl border text-left transition-all cursor-pointer group",
                    isSelected
                      ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                      : "border-outline-variant/60 bg-surface-container-low hover:bg-surface-container hover:border-outline-variant"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span
                      className={cn(
                        "text-xs font-bold",
                        isSelected ? "text-primary" : "text-on-surface"
                      )}
                    >
                      {config.name}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                  </div>
                  <span className="text-[11px] text-on-surface-variant/80">
                    {key === "SMALL"
                      ? "Para pantallas compactas"
                      : key === "MEDIUM"
                        ? "Tamaño estándar recomendado"
                        : "Mayor legibilidad y confort"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Radio de curvatura */}
        <section className="pt-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Maximize2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg sm:text-xl font-bold text-on-surface tracking-tight">Radio de Bordes</h3>
            </div>
            {savedBadge && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Guardado</span>
              </span>
            )}
          </div>

          <p className="text-xs text-on-surface-variant/80 mb-5 leading-relaxed">
            Personaliza la curvatura de esquinas en botones, tarjetas y campos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(RADIUS_SCALES).map(([key, config]) => {
              const isSelected = (profile.borderRadiusLevel || "MEDIUM") === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateSetting("borderRadiusLevel", key)}
                  className={cn(
                    "flex flex-col p-4 rounded-xl border text-left transition-all cursor-pointer group",
                    isSelected
                      ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                      : "border-outline-variant/60 bg-surface-container-low hover:bg-surface-container hover:border-outline-variant"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span
                      className={cn(
                        "text-xs font-bold",
                        isSelected ? "text-primary" : "text-on-surface"
                      )}
                    >
                      {config.name}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                  </div>
                  <span className="text-[11px] text-on-surface-variant/80">
                    {key === "SMALL"
                      ? "Esquinas rectas y estilo técnico"
                      : key === "MEDIUM"
                        ? "Curvatura suave equilibrada"
                        : "Bordes redondeados modernos"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
