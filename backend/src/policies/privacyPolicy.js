/**
 * Versiones de la política de privacidad que se muestra en la pantalla pública
 * de consentimiento LOPD.
 *
 * REGLA FUNDAMENTAL: una versión ya publicada NUNCA se edita.
 *
 * `LopdConsentLog.policyVersion` guarda, por cada consentimiento otorgado, cuál
 * de estas versiones aceptó el cliente. Retocar el texto de una versión ya usada
 * falsearía retroactivamente lo que esas personas consintieron, y dejaría el
 * registro de auditoría sin valor probatorio. Cualquier cambio de redacción, por
 * pequeño que sea, exige una entrada nueva con un `version` superior.
 *
 * Los marcadores {{clientName}} y {{businessName}} se sustituyen al servir la
 * política, siguiendo el mismo convenio que las plantillas de mensajes.
 */

const POLICY_VERSIONS = [
  {
    version: "1.0",
    effectiveDate: "2026-06-06",
    title: "Información Básica sobre Protección de Datos",
    sections: [
      {
        heading: "Responsable del Tratamiento",
        body: "{{businessName}}.",
      },
      {
        heading: "Finalidad",
        body: "Envío de confirmaciones de reserva, modificaciones o cancelaciones de tus citas, y recordatorios automáticos 24 horas antes del servicio contratado a través del canal de WhatsApp.",
      },
      {
        heading: "Legitimación",
        body: "Consentimiento expreso del interesado al marcar la casilla de aceptación y presionar el botón inferior.",
      },
      {
        heading: "Destinatarios",
        body: "No se cederán datos a terceros salvo obligación legal o para la prestación del servicio técnico de envío de mensajes automatizados (Plataforma Volta).",
      },
      {
        heading: "Derechos",
        body: "Tienes derecho a acceder, rectificar y suprimir los datos, así como otros derechos explicados en la política de privacidad detallada, enviando un correo al centro de estética {{businessName}}. Puedes revocar este consentimiento en cualquier momento solicitándolo directamente en tu próxima visita al salón.",
      },
    ],
  },
];

/** Versión vigente: la última de la lista. */
export const CURRENT_POLICY_VERSION = POLICY_VERSIONS[POLICY_VERSIONS.length - 1].version;

/** true si la versión existe. Sirve para validar lo que reporta el cliente. */
export const isKnownPolicyVersion = (version) =>
  POLICY_VERSIONS.some((p) => p.version === version);

const interpolate = (text, vars) =>
  text
    .replace(/{{clientName}}/g, vars.clientName ?? "")
    .replace(/{{businessName}}/g, vars.businessName ?? "");

/**
 * Devuelve la política solicitada (por defecto, la vigente) con los marcadores
 * ya sustituidos y lista para renderizar.
 */
export const getPolicy = (vars = {}, version = CURRENT_POLICY_VERSION) => {
  const policy = POLICY_VERSIONS.find((p) => p.version === version);
  if (!policy) return null;

  return {
    version: policy.version,
    effectiveDate: policy.effectiveDate,
    title: policy.title,
    sections: policy.sections.map((s) => ({
      heading: s.heading,
      body: interpolate(s.body, vars),
    })),
  };
};

export default POLICY_VERSIONS;