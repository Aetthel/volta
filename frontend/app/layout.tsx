import { Inter } from "next/font/google";
import Script from "next/script";
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

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Software Citas + WhatsApp Web | Agenda y Recordatorios 24/7",
    template: "%s | Volta",
  },
  description:
    "Plataforma de agenda online y avisos por WhatsApp para negocios. Evita ausencias y gestiona clientes en tiempo real. ¡Solicita tu acceso hoy!",
  keywords: [
    "software de citas",
    "gestion de citas whatsapp",
    "agenda online",
    "recordatorios whatsapp automatizados",
    "sistema de reservas LOPD",
  ],
  openGraph: {
    title: "Software Citas + WhatsApp Web | Agenda y Recordatorios 24/7",
    description:
      "Plataforma de agenda online y avisos por WhatsApp para negocios. Evita ausencias y gestiona clientes en tiempo real. ¡Solicita tu acceso hoy!",
    siteName: "Volta",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Software Citas + WhatsApp Web | Agenda y Recordatorios 24/7",
    description:
      "Plataforma de agenda online y avisos por WhatsApp para negocios. Evita ausencias y gestiona clientes en tiempo real. ¡Solicita tu acceso hoy!",
  },
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Volta",
        operatingSystem: "All",
        applicationCategory: "BusinessApplication",
        offers: {
          "@type": "Offer",
          price: "0.00",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "128",
          reviewCount: "128",
        },
        description:
          "Plataforma de agenda online y avisos por WhatsApp para negocios. Evita ausencias y gestiona clientes en tiempo real.",
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "¿Es difícil migrar mis datos desde otro software?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "En absoluto. Nuestro equipo de soporte se encarga de la migración completa de tus clientes, citas futuras e historial de servicios desde los principales softwares del mercado de forma gratuita en el plan Pro.",
            },
          },
          {
            "@type": "Question",
            name: "¿Tengo permanencia o contrato a largo plazo?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. Volta funciona mediante suscripción mensual sin compromiso de permanencia. Puedes cancelar o pausar tu cuenta en cualquier momento desde el panel de configuración.",
            },
          },
          {
            "@type": "Question",
            name: "¿Los recordatorios por WhatsApp tienen coste adicional?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Los planes Pro y A Medida incluyen una cuota generosa de mensajes mensuales que cubren las necesidades de más del 95% de los negocios. Si superas el límite, el coste por mensaje extra es marginal y transparente.",
            },
          },
          {
            "@type": "Question",
            name: "¿Volta es solo para peluquerías o centros de estética?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No, Volta está diseñado para cualquier negocio basado en citas y servicios: peluquerías, clínicas dentales, fisioterapeutas, entrenadores personales, consultoras y mucho más. La plataforma se adapta a tu sector.",
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang="es" className={`${inter.variable}`} style={inlineStyles}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var f=localStorage.getItem("volta_font_size"),r=localStorage.getItem("volta_border_radius");var fs={SMALL:"0.9",MEDIUM:"1.0",LARGE:"1.15"},rs={SMALL:"0.0",MEDIUM:"1.0",LARGE:"2.0"};var root=document.documentElement;if(f&&fs[f])root.style.setProperty("--font-scale",fs[f]);if(r&&rs[r])root.style.setProperty("--radius-scale",rs[r]);}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="min-h-screen font-sans font-normal bg-surface text-on-surface antialiased"
        style={inlineStyles}
      >
        <ClientProvidersWrapper session={session}>{children}</ClientProvidersWrapper>
        <Script src="https://assets.lemonsqueezy.com/lemon.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
