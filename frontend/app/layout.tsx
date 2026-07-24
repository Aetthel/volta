import { Inter } from "next/font/google";
import ClientProvidersWrapper from "@/components/ClientProvidersWrapper";
import {
  COLOR_PALETTES,
  FONT_SCALES,
  RADIUS_SCALES,
  getThemeColor,
  getThemeInlineStyles,
} from "@/lib/theme";
import { auth } from "@/auth";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Volta - Plataforma Profesional de Gestión",
  description:
    "Gestión profesional para peluquerías, clínicas, centros de estética, gimnasios y negocios de servicios.",
  icons: {
    icon: "/face.svg",
    shortcut: "/face.svg",
    apple: "/face.svg",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let session = null;
  try {
    session = await auth();
  } catch (e) {
    session = null;
  }
  const themeColor = getThemeColor(session?.user?.themeColor);
  const fontSizeLevel = (session?.user?.fontSizeLevel || "MEDIUM") as keyof typeof FONT_SCALES;
  const borderRadiusLevel = (session?.user?.borderRadiusLevel ||
    "MEDIUM") as keyof typeof RADIUS_SCALES;

  // Resolve styles on the server to prevent FOUC (styling flash)
  const palette = COLOR_PALETTES[themeColor] || COLOR_PALETTES.CLINICAL_ELEGANCE;
  const fontScale = FONT_SCALES[fontSizeLevel]?.scale || FONT_SCALES.MEDIUM.scale;
  const radiusScale = RADIUS_SCALES[borderRadiusLevel]?.scale || RADIUS_SCALES.MEDIUM.scale;

  const inlineStyles = getThemeInlineStyles(palette, fontScale, radiusScale) as React.CSSProperties;

  return (
    <html lang="es" className={`${inter.variable}`}>
      <body
        className="min-h-screen font-sans font-normal bg-surface text-on-surface antialiased"
        style={inlineStyles}
      >
        <ClientProvidersWrapper session={session}>{children}</ClientProvidersWrapper>
      </body>
    </html>
  );
}
