import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import Script from "next/script";
import ClientProvidersWrapper from "@/components/ClientProvidersWrapper";
import {
  parseThemeCookie,
  getEffectiveInlineStyles,
  THEME_COOKIE_NAME,
  getThemeColor,
  getFontSizeLevel,
  getBorderRadiusLevel,
  type ThemePreferences,
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
  metadataBase: new URL("https://volta.aetthel.com"),
  title: {
    default: "Volta | Software de Citas + WhatsApp Web | Agenda y Recordatorios 24/7",
    template: "%s | Volta",
  },
  description:
    "Plataforma de agenda online y automatización de citas por WhatsApp con IA para negocios y clínicas. Evita ausencias y gestiona clientes en tiempo real.",
  keywords: [
    "Volta",
    "Volta Aetthel",
    "software de citas",
    "gestion de citas whatsapp",
    "agenda online",
    "recordatorios whatsapp automatizados",
    "sistema de reservas LOPD",
    "software reservas whatsapp ia",
    "agenda whatsapp para clinicas",
    "agenda citas peluquerias estetica",
  ],
  authors: [{ name: "Aetthel", url: "https://aetthel.com" }],
  creator: "Aetthel",
  publisher: "Aetthel",
  alternates: {
    canonical: "./",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Volta | Software de Citas + WhatsApp Web con IA",
    description:
      "Plataforma de agenda online y avisos por WhatsApp para negocios. Evita ausencias y gestiona clientes en tiempo real.",
    url: "https://volta.aetthel.com",
    siteName: "Volta",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "https://volta.aetthel.com/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Volta - Software de Citas y Automatización WhatsApp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Volta | Software de Citas + WhatsApp Web con IA",
    description:
      "Plataforma de agenda online y avisos por WhatsApp para negocios. Evita ausencias y gestiona clientes en tiempo real.",
    images: ["https://volta.aetthel.com/opengraph-image"],
  },
  icons: {
    icon: "/face.svg",
    shortcut: "/face.svg",
    apple: "/face.svg",
  },
  category: "technology",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let session = null;
  try {
    session = await auth();
  } catch (e) {
    session = null;
  }

  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(THEME_COOKIE_NAME)?.value;
  const cookiePrefs = parseThemeCookie(themeCookie);

  const effectivePrefs: ThemePreferences = {
    themeColor: getThemeColor(
      cookieStore.has(THEME_COOKIE_NAME)
        ? cookiePrefs.themeColor
        : session?.user?.themeColor || cookiePrefs.themeColor
    ),
    fontSizeLevel: getFontSizeLevel(
      cookieStore.has(THEME_COOKIE_NAME)
        ? cookiePrefs.fontSizeLevel
        : session?.user?.fontSizeLevel || cookiePrefs.fontSizeLevel
    ),
    borderRadiusLevel: getBorderRadiusLevel(
      cookieStore.has(THEME_COOKIE_NAME)
        ? cookiePrefs.borderRadiusLevel
        : session?.user?.borderRadiusLevel || cookiePrefs.borderRadiusLevel
    ),
  };

  // Resolve styles on the server to prevent FOUC (styling flash)
  const inlineStyles = getEffectiveInlineStyles(effectivePrefs) as React.CSSProperties;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["SoftwareApplication", "WebApplication"],
        "@id": "https://volta.aetthel.com/#software",
        name: "Volta",
        url: "https://volta.aetthel.com",
        operatingSystem: "Web",
        applicationCategory: "BusinessApplication",
        author: {
          "@type": "Organization",
          name: "Aetthel",
          url: "https://aetthel.com",
        },
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
          "Plataforma de agenda online y avisos por WhatsApp con IA para negocios y clínicas. Evita ausencias y gestiona clientes en tiempo real.",
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
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="min-h-screen font-sans font-normal bg-surface text-on-surface antialiased"
        style={inlineStyles}
      >
        <ClientProvidersWrapper session={session} initialPreferences={effectivePrefs}>
          {children}
        </ClientProvidersWrapper>
        <Script src="https://assets.lemonsqueezy.com/lemon.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}

