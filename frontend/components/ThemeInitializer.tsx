"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { COLOR_PALETTES, FONT_SCALES, RADIUS_SCALES, getThemeColor } from "@/lib/theme";

export default function ThemeInitializer() {
  const { data: session } = useSession();

  useEffect(() => {
    const root = document.documentElement;

    const themeColor = getThemeColor(session?.user?.themeColor);
    const fontSizeLevel = (session?.user?.fontSizeLevel || "MEDIUM") as keyof typeof FONT_SCALES;
    const borderRadiusLevel = (session?.user?.borderRadiusLevel || "MEDIUM") as keyof typeof RADIUS_SCALES;

    // Apply colors
    const palette = COLOR_PALETTES[themeColor] || COLOR_PALETTES.CLINICAL_ELEGANCE;
    root.style.setProperty("--color-primary", palette.primary);
    root.style.setProperty("--color-primary-container", palette.primaryContainer);
    root.style.setProperty("--color-secondary", palette.secondary);
    root.style.setProperty("--color-secondary-container", palette.secondaryContainer);

    // Apply font-size scale
    const fontScale = FONT_SCALES[fontSizeLevel]?.scale || FONT_SCALES.MEDIUM.scale;
    root.style.setProperty("--font-scale", fontScale);

    // Apply border-radius scale
    const radiusScale = RADIUS_SCALES[borderRadiusLevel]?.scale || RADIUS_SCALES.MEDIUM.scale;
    root.style.setProperty("--radius-scale", radiusScale);
  }, [session?.user?.themeColor, session?.user?.fontSizeLevel, session?.user?.borderRadiusLevel]);

  return null;
}
