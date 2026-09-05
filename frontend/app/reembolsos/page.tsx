import Link from "next/link";
import { ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, Clock, CreditCard, Mail } from "lucide-react";
import FaceIcon from "@/components/FaceIcon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cancelación y Reembolso",
  description:
    "Condiciones de prueba gratuita, cancelación de suscripción y política de reembolsos de Volta SaaS.",
};

export default function ReembolsosPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 mb-4">
            <RefreshCw className="w-3.5 h-3.5" />
            Transparencia y Garantía de Satisfacción
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
            Política de Cancelación y Reembolso
          </h1>
          <p className="text-sm text-on-surface-variant mt-2 max-w-2xl leading-relaxed">
            Queremos que utilices Volta con absoluta tranquilidad y confianza. A continuación te detallamos las condiciones de prueba gratuita, cancelación de suscripción y reembolsos.
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 sm:p-10 shadow-xs space-y-8 text-sm text-on-surface-variant leading-relaxed">
          {/* Section 1: Free Trial */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="text-primary font-mono text-base">1.</span>
              Período de Prueba Gratuito de 14 Días
            </h2>
            <p>
              Todos los nuevos usuarios disponen de un <strong>período de prueba de 14 días completamente gratuito</strong>. Durante este período:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>No se requiere introducir tarjeta de crédito ni método de pago para comenzar.</li>
              <li>Tienes acceso a todas las funcionalidades del software para probarlo en tu día a día.</li>
              <li>Si al finalizar los 14 días decides no contratar ningún plan, tu cuenta pasará a estado de solo lectura y no se realizará ningún cargo automático.</li>
            </ul>
          </section>

          {/* Section 2: Cancellation */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="text-primary font-mono text-base">2.</span>
              Cancelación de la Suscripción (Sin Permanencia)
            </h2>
            <p>
              Puedes <strong>cancelar tu suscripción en cualquier momento</strong>, de forma inmediata y sin necesidad de llamar por teléfono ni trámites complejos:
            </p>
            <div className="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-low/50 space-y-2">
              <p className="font-semibold text-on-surface text-xs">
                ¿Cómo cancelar desde tu panel de control?
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-xs text-on-surface-variant">
                <li>Inicia sesión en tu cuenta de Volta y dirígete a <strong>Ajustes</strong>.</li>
                <li>Selecciona la pestaña <strong>Facturación y Suscripción</strong>.</li>
                <li>Haz clic en el botón <strong>&quot;Cancelar suscripción&quot;</strong> y confirma la acción.</li>
              </ol>
            </div>
            <p>
              <strong>Efecto de la cancelación:</strong> Al cancelar, la renovación automática mensual queda desactivada de inmediato. Conservarás el acceso íntegro a todas las prestaciones de tu plan hasta el último día de tu ciclo de facturación mensual ya pagado. Tras esa fecha, no se te cobrará ninguna cuota adicional.
            </p>
          </section>

          {/* Section 3: Refund Policy */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="text-primary font-mono text-base">3.</span>
              Política de Reembolso y Devoluciones
            </h2>
            <p>
              Dado que ofrecemos un período de prueba gratuito de 14 días previo a cualquier pago, los usuarios pueden evaluar el servicio sin riesgo antes de suscribirse. No obstante, aplicamos los siguientes criterios de reembolso:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Primer cobro tras el período de prueba (Garantía de 14 días):</strong> Si tras realizar el primer pago de tu suscripción experimentas cualquier problema técnico insalvable o el servicio no cumple con lo prometido, dispones de <strong>14 días naturales</strong> desde la fecha del primer cobro para solicitar el reembolso íntegro del importe.
              </li>
              <li>
                <strong>Cobros recurrentes mensuales:</strong> Si olvidaste cancelar tu suscripción antes de la fecha de renovación automática, ponte en contacto con nosotros dentro de las <strong>48 horas siguientes al cobro</strong> y, siempre que no se haya hecho un uso extensivo de la plataforma durante ese nuevo ciclo, tramitaremos el reembolso de esa última mensualidad.
              </li>
              <li>
                <strong>Fallos técnicos atribuibles a la plataforma:</strong> Si se produce una interrupción prolongada del servicio que impida de forma sustancial el funcionamiento de tu negocio por causas imputables a Volta, se compensará proporcionalmente o se reembolsará el período afectado.
              </li>
            </ul>
          </section>

          {/* Section 4: How to request refund */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="text-primary font-mono text-base">4.</span>
              Cómo Solicitar un Reembolso
            </h2>
            <p>
              Para solicitar una devolución o consultar cualquier discrepancia en tu factura, envía un correo electrónico a nuestro equipo de soporte:
            </p>
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-on-surface">Email de Facturación y Soporte:</p>
                <a href="mailto:contacto@aetthel.com" className="text-sm font-bold text-primary hover:underline">
                  contacto@aetthel.com
                </a>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant/80">
              Por favor, incluye en el mensaje el correo electrónico asociado a tu cuenta de Volta o el número de factura de Lemon Squeezy. Nuestro equipo responderá en un plazo máximo de <strong>24 a 48 horas laborables</strong>. Una vez aprobado, el dinero se acreditará automáticamente en la misma tarjeta o método de pago original a través de Lemon Squeezy en un plazo de 3 a 5 días hábiles (según tu entidad bancaria).
            </p>
          </section>

          {/* Section 5: Payouts & Disputed payments */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="text-primary font-mono text-base">5.</span>
              Periodo de Gracia por Fallo en el Pago
            </h2>
            <p>
              Si en la renovación mensual automática tu banco o tarjeta rechaza el pago (por caducidad, fondos insuficientes o bloqueo temporal), la cuenta <strong>no se suspende de inmediato</strong>: dispones de un <strong>período de gracia de 3 días</strong> con avisos en pantalla para actualizar tu método de pago sin que se interrumpa el servicio de tus citas ni la atención de tus clientes.
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
            <Link href="/privacidad" className="hover:text-primary transition-colors">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
