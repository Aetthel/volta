import Link from "next/link";
import { ArrowLeft, Shield, Lock, CheckCircle2, Eye, Server, UserCheck } from "lucide-react";
import FaceIcon from "@/components/FaceIcon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad y Protección de Datos",
  description:
    "Información sobre el tratamiento y protección de datos personales en la plataforma Volta conforme a RGPD y LOPDGDD.",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-outline-variant/60 bg-surface/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
              <FaceIcon className="w-5 h-5 fill-current" />
            </div>
            <span className="font-extrabold text-lg text-on-surface tracking-tight group-hover:text-primary transition-colors">
              Volta
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-primary py-2 px-3 rounded-lg hover:bg-surface-container transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 mb-4">
            <Shield className="w-3.5 h-3.5" />
            Cumplimiento RGPD (UE 2016/679) & LOPDGDD (3/2018)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
            Política de Privacidad y Protección de Datos
          </h1>
          <p className="text-sm text-on-surface-variant mt-2 max-w-2xl leading-relaxed">
            En Volta nos tomamos muy en serio la seguridad y confidencialidad de tus datos personales y los de tus clientes. A continuación detallamos cómo recopilamos, utilizamos y protegemos tu información.
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 sm:p-10 shadow-xs space-y-8 text-sm text-on-surface-variant leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="text-primary font-mono text-base">1.</span>
              Responsable del Tratamiento
            </h2>
            <p>
              El responsable del tratamiento de los datos recabados en la plataforma Volta es <strong>Aetthel</strong>, con domicilio en España.
            </p>
            <p>
              Para cualquier consulta, solicitud o ejercicio de derechos en materia de protección de datos, puedes dirigirte a nuestro Delegado de Privacidad mediante correo electrónico a: <a href="mailto:contacto@aetthel.com" className="text-primary hover:underline font-medium">contacto@aetthel.com</a>.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="text-primary font-mono text-base">2.</span>
              Datos que Recopilamos
            </h2>
            <p>Tratamos las siguientes categorías de datos según el uso de la plataforma:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Datos de cuenta y registro:</strong> Nombre, apellidos, dirección de correo electrónico, contraseña (almacenada mediante hash seguro bcrypt), nombre comercial del negocio, número de teléfono y configuración de zona horaria y moneda.
              </li>
              <li>
                <strong>Datos de facturación:</strong> Las transacciones y datos de tarjeta de crédito son procesados directamente por la pasarela segura Lemon Squeezy (Merchant of Record). Volta no almacena números completos de tarjetas de crédito en sus servidores.
              </li>
              <li>
                <strong>Datos de clientes finales del negocio:</strong> Nombre, teléfono y correo electrónico de los clientes que reservan citas en tu negocio, junto con el historial de citas y el registro de consentimiento LOPD (con dirección IP anonimizada y timestamp criptográfico HMAC).
              </li>
              <li>
                <strong>Datos técnicos y de navegación:</strong> Registros del servidor, dirección IP, tipo de navegador y cookies de sesión necesarias para mantener la autenticación del usuario.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="text-primary font-mono text-base">3.</span>
              Finalidad del Tratamiento y Base Legal
            </h2>
            <p>Tus datos son tratados para las siguientes finalidades legítimas:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl border border-outline-variant/60 bg-surface-container-low/40">
                <p className="font-bold text-on-surface text-xs">Ejecución del Contrato SaaS</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Proveer el servicio de agenda, sincronizar citas, procesar reservas online y permitir el acceso de tu equipo al panel.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-outline-variant/60 bg-surface-container-low/40">
                <p className="font-bold text-on-surface text-xs">Envío de Notificaciones y Recordatorios</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Enviar confirmaciones de citas por WhatsApp y correo electrónico para reducir ausencias, siempre con consentimiento explícito del destinatario.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-outline-variant/60 bg-surface-container-low/40">
                <p className="font-bold text-on-surface text-xs">Cumplimiento Legal (LOPD)</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Auditoría y trazabilidad de consentimientos legales requeridos por la legislación española y europea.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-outline-variant/60 bg-surface-container-low/40">
                <p className="font-bold text-on-surface text-xs">Soporte Técnico y Seguridad</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Resolver incidencias técnicas, prevenir accesos no autorizados y proteger la integridad del sistema multi-tenant.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="text-primary font-mono text-base">4.</span>
              Encargados del Tratamiento y Destinatarios
            </h2>
            <p>
              Volta no vende, alquila ni cede tus datos personales ni los de tus clientes a terceros con fines publicitarios. Únicamente compartimos datos indispensables con proveedores de servicios tecnológicos bajo estrictos contratos de encargo de tratamiento:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Lemon Squeezy, LLC:</strong> Procesamiento de pagos y facturación internacional (cumple PCI-DSS nivel 1).</li>
              <li><strong>Infraestructura en la Unión Europea:</strong> Servidores de base de datos y alojamiento de alta seguridad en centros de datos ubicados en el Espacio Económico Europeo.</li>
              <li><strong>Evolution API:</strong> Conexión cifrada a la pasarela de WhatsApp Webhook para la entrega de recordatorios y confirmaciones.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="text-primary font-mono text-base">5.</span>
              Medidas de Seguridad
            </h2>
            <p>
              Implementamos rigurosas medidas de seguridad técnicas y organizativas para proteger los datos frente a pérdida, alteración o acceso no autorizado:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-3 py-1 bg-surface-container rounded-lg text-xs font-medium text-on-surface border border-outline-variant/60">Cifrado TLS/SSL en tránsito</span>
              <span className="px-3 py-1 bg-surface-container rounded-lg text-xs font-medium text-on-surface border border-outline-variant/60">Contraseñas con hash bcrypt</span>
              <span className="px-3 py-1 bg-surface-container rounded-lg text-xs font-medium text-on-surface border border-outline-variant/60">Tokens de auditoría LOPD HMAC-SHA256</span>
              <span className="px-3 py-1 bg-surface-container rounded-lg text-xs font-medium text-on-surface border border-outline-variant/60">Aislamiento por negocio (Multi-Tenant)</span>
              <span className="px-3 py-1 bg-surface-container rounded-lg text-xs font-medium text-on-surface border border-outline-variant/60">Doble Factor de Autenticación (2FA / TOTP)</span>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="text-primary font-mono text-base">6.</span>
              Tus Derechos (Derechos ARCO)
            </h2>
            <p>
              Conforme al RGPD, tienes derecho a acceder, rectificar o suprimir tus datos personales, así como a solicitar la limitación del tratamiento, oponerte al mismo o solicitar la portabilidad de tus datos.
            </p>
            <p>
              Para ejercer cualquiera de estos derechos, envía un correo electrónico a <a href="mailto:contacto@aetthel.com" className="text-primary hover:underline font-medium">contacto@aetthel.com</a> adjuntando copia de tu documento de identidad para verificar tu titularidad. Asimismo, si consideras que tus derechos no han sido debidamente atendidos, puedes presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD).
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-on-surface-variant pt-6 border-t border-outline-variant/40">
          <p>© {new Date().getFullYear()} Volta Technologies / Aetthel. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="/terminos" className="hover:text-primary transition-colors">
              Términos de Servicio
            </Link>
            <Link href="/reembolsos" className="hover:text-primary transition-colors">
              Política de Reembolso y Cancelación
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
