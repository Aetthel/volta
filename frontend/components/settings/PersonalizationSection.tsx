"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Palette,
  Type,
  Maximize2,
  Check,
  Sparkles,
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  User,
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
    <div className="animate-in fade-in duration-200">
      {/* Dos columnas: controles a la izquierda, simulador a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-12">
        {/* Columna izquierda: controles del tema (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          {/* 1. Paleta de color */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-on-surface">
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
              Selecciona el color primario de acento para la interfaz del panel y el portal de reservas públicas de tus clientes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                    <div className="flex items-center gap-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: palette.primaryContainer || palette.primary }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: palette.secondaryContainer || palette.primary }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. Tipografía y radio de bordes */}
          <section className="mt-10 pt-10 border-t border-outline-variant/50">
            <div className="flex flex-col gap-6">
              {/* Font Size */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-bold text-on-surface">Escala del Texto</h4>
                </div>
                <p className="text-xs text-on-surface-variant/80">
                  Ajusta el tamaño base de la tipografía para mayor legibilidad en pantallas pequeñas o escritorios.
                </p>

                <div className="grid grid-cols-3 gap-2.5">
                  {Object.entries(FONT_SCALES).map(([key, scaleObj]) => {
                    const isSelected = (profile.fontSizeLevel || "MEDIUM") === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => updateSetting("fontSizeLevel", key)}
                        className={cn(
                          "py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all text-center cursor-pointer",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-xs font-bold ring-1 ring-primary/30"
                            : "border-outline-variant/60 bg-surface-container-low hover:bg-surface-container text-on-surface-variant"
                        )}
                      >
                        {scaleObj.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-outline-variant/40" />

              {/* Border Radius */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-bold text-on-surface">Curvatura de Bordes</h4>
                </div>
                <p className="text-xs text-on-surface-variant/80">
                  Elige el redondeado para tarjetas, botones, inputs y selectores del sistema.
                </p>

                <div className="grid grid-cols-3 gap-2.5">
                  {Object.entries(RADIUS_SCALES).map(([key, radiusObj]) => {
                    const isSelected = (profile.borderRadiusLevel || "MEDIUM") === key;
                    const rStyle = key === "SMALL" ? "2px" : key === "LARGE" ? "14px" : "8px";
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => updateSetting("borderRadiusLevel", key)}
                        style={{ borderRadius: rStyle }}
                        className={cn(
                          "py-2.5 px-3 border text-xs font-semibold transition-all text-center cursor-pointer",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-xs font-bold ring-1 ring-primary/30"
                            : "border-outline-variant/60 bg-surface-container-low hover:bg-surface-container text-on-surface-variant"
                        )}
                      >
                        {radiusObj.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Columna derecha: simulador (5 cols). El marco se queda: no es un
            contenedor de contenido, es la maqueta que demuestra el tema. */}
        <div className="lg:col-span-5 flex flex-col justify-center mt-10 pt-10 border-t border-outline-variant/50 lg:mt-0 lg:pt-0 lg:border-t-0 lg:border-l lg:px-12">
          <div className="rounded-xl overflow-hidden border border-outline-variant shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                    Vista Previa en Vivo
                  </span>
                </div>
                <span className="text-label-sm font-semibold text-on-surface-variant/70">
                  UI Mockup
                </span>
              </div>
            </div>

            <div className="p-5 flex flex-col gap-4 bg-surface">
              {/* Sample Card Box with custom radius and color */}
              <div
                className="p-4 bg-surface-container-low border border-outline-variant/60 shadow-xs flex flex-col gap-3 transition-all"
                style={{ borderRadius: currentRadiusPx }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-2xs shrink-0"
                      style={{ backgroundColor: currentPalette.primary }}
                    >
                      V
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-on-surface">Cita Confirmada</span>
                      <span className="text-[10px] text-on-surface-variant">Corte & Peinado</span>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${currentPalette.primary}20`,
                      color: currentPalette.primary,
                    }}
                  >
                    17:30h
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-on-surface-variant/80">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Mañana, 30 de agosto · 45 min</span>
                </div>
              </div>

              {/* Sample Input */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-on-surface-variant">
                  Campo de Entrada
                </label>
                <input
                  type="text"
                  readOnly
                  value="María González"
                  className="w-full px-3 py-2 text-xs bg-surface-container-low border border-outline-variant/60 text-on-surface focus:outline-none"
                  style={{ borderRadius: currentRadiusPx }}
                />
              </div>

              {/* Sample Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  className="flex-1 py-2 text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-95"
                  style={{
                    backgroundColor: currentPalette.primary,
                    borderRadius: currentRadiusPx,
                  }}
                >
                  Confirmar Reserva
                </button>
                <button
                  type="button"
                  className="px-3 py-2 text-xs font-semibold border border-outline-variant bg-surface-container-low text-on-surface hover:bg-surface-container"
                  style={{ borderRadius: currentRadiusPx }}
                >
                  Cancelar
                </button>
              </div>

              {/* Interactive Color Swatch Bar */}
              <div
                className="mt-2 p-3 bg-surface-container-low border border-outline-variant/40 flex items-center justify-between"
                style={{ borderRadius: currentRadiusPx }}
              >
                <div className="flex items-center gap-2 text-xs font-medium text-on-surface">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Paleta Activa:</span>
                </div>
                <span
                  className="text-xs font-bold"
                  style={{ color: currentPalette.primary }}
                >
                  {currentPalette.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
