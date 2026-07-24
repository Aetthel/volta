"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  COLOR_PALETTES,
  FONT_SCALES,
  RADIUS_SCALES,
  getThemeColor,
  applyThemeColors,
} from "@/lib/theme";

function ThemeInitializerClient() {
  const { data: session } = useSession();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const body = document.body;

    const localColor = localStorage.getItem("volta_theme_color");
    const localFont = localStorage.getItem("volta_font_size");
    const localRadius = localStorage.getItem("volta_border_radius");

    const themeColor = getThemeColor(localColor || session?.user?.themeColor);
    const fontSizeLevel = (localFont ||
      session?.user?.fontSizeLevel ||
      "MEDIUM") as keyof typeof FONT_SCALES;
    const borderRadiusLevel = (localRadius ||
      session?.user?.borderRadiusLevel ||
      "MEDIUM") as keyof typeof RADIUS_SCALES;

    // Apply colors
    const palette = COLOR_PALETTES[themeColor] || COLOR_PALETTES.CLINICAL_ELEGANCE;
    applyThemeColors(root, palette);

    // Apply font-size scale
    const fontScale = FONT_SCALES[fontSizeLevel]?.scale || FONT_SCALES.MEDIUM.scale;
    root.style.setProperty("--font-scale", fontScale);
    if (body) body.style.setProperty("--font-scale", fontScale);

    // Apply border-radius scale
    const radiusScale = RADIUS_SCALES[borderRadiusLevel]?.scale || RADIUS_SCALES.MEDIUM.scale;
    root.style.setProperty("--radius-scale", radiusScale);
    if (body) body.style.setProperty("--radius-scale", radiusScale);
  }, [session?.user?.themeColor, session?.user?.fontSizeLevel, session?.user?.borderRadiusLevel]);

  return null;
}

export default function ThemeInitializer() {
  if (typeof window === "undefined") return null;
  return <ThemeInitializerClient />;
}
