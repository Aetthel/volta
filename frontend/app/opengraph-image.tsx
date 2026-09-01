import { ImageResponse } from "next/og";

export const alt = "Volta | Software de Citas y Automatización por WhatsApp con IA";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "26px",
              fontWeight: 800,
            }}
          >
            ⚡
          </div>
          <span style={{ color: "#ffffff", fontSize: "36px", fontWeight: 700, letterSpacing: "-0.03em" }}>
            Volta
          </span>
          <span
            style={{
              marginLeft: "12px",
              padding: "4px 12px",
              borderRadius: "999px",
              background: "rgba(59, 130, 246, 0.15)",
              color: "#60a5fa",
              fontSize: "16px",
              fontWeight: 600,
              border: "1px solid rgba(59, 130, 246, 0.3)",
            }}
          >
            by Aetthel
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: "58px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              lineHeight: 1.12,
              maxWidth: "1050px",
            }}
          >
            Software de Citas y Automatización por WhatsApp con IA.
          </div>
          <div
            style={{
              fontSize: "26px",
              color: "#a1a1aa",
              maxWidth: "950px",
              lineHeight: 1.4,
            }}
          >
            Agenda online 24/7 · Recordatorios automáticos · Respuestas inteligentes con IA · Cumplimiento LOPD
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: "28px",
          }}
        >
          <div style={{ color: "#60a5fa", fontSize: "22px", fontWeight: 600 }}>
            Plataforma SaaS para Negocios y Clínicas
          </div>
          <div style={{ color: "#71717a", fontSize: "22px" }}>
            volta.aetthel.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
