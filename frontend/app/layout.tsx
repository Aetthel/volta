import { Inter } from 'next/font/google';
import { SessionProvider } from "next-auth/react";
import ThemeInitializer from '@/components/ThemeInitializer';
import { COLOR_PALETTES, FONT_SCALES, RADIUS_SCALES, getThemeColor } from '@/lib/theme';
import { auth } from '@/auth';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: 'Volta - Gestión de Salones',
  description: 'Gestión clínica para salones de belleza de alto rendimiento.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const themeColor = getThemeColor(session?.user?.themeColor);
  const fontSizeLevel = (session?.user?.fontSizeLevel || "MEDIUM") as keyof typeof FONT_SCALES;
  const borderRadiusLevel = (session?.user?.borderRadiusLevel || "MEDIUM") as keyof typeof RADIUS_SCALES;

  // Resolve styles on the server to prevent FOUC (styling flash)
  const palette = COLOR_PALETTES[themeColor] || COLOR_PALETTES.CLINICAL_ELEGANCE;
  const fontScale = FONT_SCALES[fontSizeLevel]?.scale || FONT_SCALES.MEDIUM.scale;
  const radiusScale = RADIUS_SCALES[borderRadiusLevel]?.scale || RADIUS_SCALES.MEDIUM.scale;

  const inlineStyles = {
    "--color-primary": palette.primary,
    "--color-primary-container": palette.primaryContainer,
    "--color-secondary": palette.secondary,
    "--color-secondary-container": palette.secondaryContainer,
    "--font-scale": fontScale,
    "--radius-scale": radiusScale,
  } as React.CSSProperties;

  return (
    <html lang="es" className={`${inter.variable}`} style={inlineStyles}>
      <body className="min-h-screen font-sans font-normal bg-surface text-on-surface antialiased">
        <SessionProvider>
          <ThemeInitializer />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
