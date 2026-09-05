import Link from "next/link";
import { ArrowLeft, Shield, FileText, CheckCircle2, HelpCircle } from "lucide-react";
import FaceIcon from "@/components/FaceIcon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones del Servicio",
  description:
    "Condiciones generales de contratación y uso de la plataforma SaaS Volta.",
};

export default function TerminosPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-4">
            <FileText className="w-3.5 h-3.5" />
            Última actualización: Septiembre 2026
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
            Términos y Condiciones del Servicio
          </h1>
          <p className="text-sm text-on-surface-variant mt-2 max-w-2xl leading-relaxed">
            Por favor, lee atentamente estos términos antes de utilizar la plataforma Volta.
            El acceso y uso del servicio implica tu aceptación plena y sin reservas de las presentes condiciones.
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 sm:p-10 shadow-xs space-y-8 text-sm text-on-surface-variant leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="text-primary font-mono text-base">1.</span>
              Identificación del Titular y Servicio
            </h2>
            <p>
              El presente servicio de software como servicio (SaaS) denominado <strong>Volta</strong> es operado y titularidad de <strong>Aetthel</strong> (en adelante, &quot;el Proveedor&quot; o &quot;Volta&quot;), con domicilio en España y correo electrónico de contacto oficial: <a href="mailto:contacto@aetthel.com" className="text-primary hover:underline font-medium">contacto@aetthel.com</a>.
            </p>
            <p>
              Volta es una plataforma en la nube diseñada para profesionales, clínicas, centros de estética, peluquerías y negocios de servicios para gestionar su agenda de citas, base de datos de clientes, cumplimiento normativo LOPD y automatizar recordatorios y confirmaciones a través de canales de mensajería (WhatsApp y correo electrónico).
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="text-primary font-mono text-base">2.</span>
              Planes de Suscripción y Precios
            </h2>
            <p>
              Volta se comercializa bajo la modalidad de suscripción mensual recurrente sin compromiso de permanencia. Los planes disponibles actualmente son:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-outline-variant/70 bg-surface-container-low/50">
                <h3 className="font-bold text-on-surface">Plan Básico</h3>
                <p className="text-xl font-extrabold text-primary mt-1">30,00 € <span className="text-xs font-normal text-on-surface-variant">+ IVA / mes</span></p>
                <ul className="mt-3 space-y-1.5 text-xs text-on-surface">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 1 Calendario y local único</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 1 Especialista incluido</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Hasta 100 citas online / mes</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Portal de reservas y código QR</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl border border-primary/40 bg-surface-container-low/50 ring-1 ring-primary/20">
                <h3 className="font-bold text-on-surface">Plan Pro (Recomendado)</h3>
                <p className="text-xl font-extrabold text-primary mt-1">40,00 € <span className="text-xs font-normal text-on-surface-variant">+ IVA / mes</span></p>
                <ul className="mt-3 space-y-1.5 text-xs text-on-surface">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" /> 2 Especialistas incluidos</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" /> Reservas y citas ilimitadas</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" /> Bot interactivo de WhatsApp 2 vías</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" /> Cobro de señas y soporte prioritario</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant/80 pt-1">
              * Los especialistas adicionales a los incluidos en el plan base tienen un coste de 5,00 € + IVA/mes cada uno.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="text-primary font-mono text-base">3.</span>
              Facturación y Pasarela de Pago (Merchant of Record)
            </h2>
            <p>
              Para garantizar la máxima seguridad en las transacciones financieras y el cumplimiento de la normativa fiscal internacional (IVA/VAT), los cobros y la facturación son gestionados por <strong>Lemon Squeezy</strong> (Lemon Squeezy, LLC), quien actúa como <em>Merchant of Record</em> (Comerciante Registrado).
            </p>
            <p>
              Al contratar cualquier plan, autorizas a Lemon Squeezy a cargar en tu método de pago seleccionado el importe correspondiente a la cuota periódica mensual, emitiendo la correspondiente factura legal descargable desde tu panel de usuario o desde el portal de cliente.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="text-primary font-mono text-base">4.</span>
              Período de Prueba Gratuito y Cancelación
            </h2>
            <p>
              Ofrecemos un <strong>período de prueba gratuito de 14 días</strong> sin compromiso. Durante dicho periodo tendrás acceso sin restricciones a las herramientas de la plataforma para verificar su adaptación a tu negocio.
            </p>
            <p>
              Puedes <strong>cancelar tu suscripción en cualquier momento</strong> con un solo clic desde la sección <em>Ajustes ➔ Facturación y Suscripción</em> de tu panel Volta. No existen penalizaciones ni cláusulas de permanencia. Al cancelar, conservarás el acceso a todas las prestaciones hasta el final de tu ciclo de facturación mensual ya liquidado.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="text-primary font-mono text-base">5.</span>
              Uso Aceptable de la Plataforma
            </h2>
            <p>
              El usuario se compromete a hacer un uso diligente y legal de la plataforma. Queda terminantemente prohibido:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>El envío masivo de mensajes no solicitados (SPAM) a través de la integración de WhatsApp o correo electrónico.</li>
              <li>El tratamiento de datos de clientes sin contar con una base legitimadora válida conforme a la legislación de protección de datos (RGPD / LOPDGDD).</li>
              <li>Intentar eludir las medidas de seguridad, vulnerar el aislamiento multi-tenant de datos o sobrecargar de forma malintencionada la infraestructura.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="text-primary font-mono text-base">6.</span>
              Disponibilidad, Propiedad Intelectual y Soporte
            </h2>
            <p>
              Todos los derechos de propiedad intelectual e industrial sobre el software, diseño, marcas y código de Volta son propiedad exclusiva de Aetthel. El usuario recibe una licencia de uso limitada, no exclusiva e intransferible durante la vigencia de su suscripción.
            </p>
            <p>
              Nos esforzamos por garantizar una disponibilidad del servicio del 99,9%, realizando tareas de mantenimiento preventivo y copias de seguridad continuas. Para cualquier duda o soporte técnico, puedes contactar en <a href="mailto:contacto@aetthel.com" className="text-primary hover:underline font-medium">contacto@aetthel.com</a>.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="text-primary font-mono text-base">7.</span>
              Legislación Aplicable y Jurisdicción
            </h2>
            <p>
              Las presentes Condiciones Generales se rigen por la legislación española. Para la resolución de cualquier controversia relativa a la validez, interpretación o ejecución de las mismas, las partes se someten expresamente a los Juzgados y Tribunales competentes con arreglo a la normativa aplicable.
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-on-surface-variant pt-6 border-t border-outline-variant/40">
          <p>© {new Date().getFullYear()} Volta Technologies / Aetthel. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="/privacidad" className="hover:text-primary transition-colors">
              Política de Privacidad
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
