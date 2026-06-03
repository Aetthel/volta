import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata = {
  title: "Volta Dashboard",
  description: "Gestión inteligente de citas por WhatsApp",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${cormorant.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased font-sans bg-[#F9F9F9] text-[#1A1A1A] dark:bg-[#0A0A0A] dark:text-[#EDEDED]">
        {children}
      </body>
    </html>
  );
}
