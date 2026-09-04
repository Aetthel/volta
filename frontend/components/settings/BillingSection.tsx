"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Download,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Zap,
  Clock,
  Sparkles,
  Users,
  MessageSquare,
  Building2,
  FileText,
  Loader2,
  X,
  ArrowRight,
} from "lucide-react";
import { Button, Badge, Skeleton, toast } from "@/components/ui/volta-ui";
import { SectionHeading } from "./SectionHeading";
import type { Invoice } from "@/types/domain";
import { cn } from "@/lib/utils";
import {
  LEMON_SQUEEZY_PRODUCT_URLS,
  buildLemonSqueezyCheckoutUrl,
  openLemonSqueezyOverlay,
} from "@/lib/lemonsqueezy";

export default function BillingSection() {
  const { data: session } = useSession();
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchBillingData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/backend/subscription/current");
      if (res.ok) {
        const data = await res.json();
        setSubscriptionData(data);
        setInvoices(data.invoices || []);
      }
    } catch (err) {
      console.error("Error loading billing data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        "¿Estás seguro de que deseas cancelar tu suscripción? Mantendrás el acceso a todas las funciones hasta el final de tu ciclo actual."
      )
    ) {
      return;
    }

    try {
      setIsCancelling(true);
      const res = await fetch("/api/backend/subscription/cancel", {
        method: "POST",
      });

      if (res.ok) {
        toast.success("Suscripción cancelada al término del periodo actual");
        fetchBillingData();
      } else {
        const errData = await res.json();
        toast.error(errData.error || "No se pudo cancelar la suscripción");
      }
    } catch {
      toast.error("Error de conexión al cancelar la suscripción");
    } finally {
      setIsCancelling(false);
    }
  };

  const currentPlan =
    subscriptionData?.subscriptionPlan || session?.user?.subscriptionPlan || "PRO";
  const currentStatus =
    subscriptionData?.subscriptionStatus || session?.user?.subscriptionStatus || "TRIALING";
  const isGraceActive = subscriptionData?.isGracePeriodActive;
  const daysLeft = subscriptionData?.daysLeftInTrial ?? 0;
  const isCancelledEnd = subscriptionData?.cancelAtPeriodEnd;

  const isBasicCurrent = currentPlan === "BASIC";
  const isProCurrent = currentPlan === "PRO";

  const basicCheckoutUrl = buildLemonSqueezyCheckoutUrl(
    LEMON_SQUEEZY_PRODUCT_URLS.BASIC,
    session?.user
  );
  const proCheckoutUrl = buildLemonSqueezyCheckoutUrl(
    LEMON_SQUEEZY_PRODUCT_URLS.PRO,
    session?.user
  );

  return (
    <div className="animate-in fade-in duration-200">
      {/* 1. Grace Period Alert (if active) */}
      {isGraceActive && (
        <div className="mb-8 p-4 bg-error/10 border border-error/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-error">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <p className="text-sm font-bold">Aviso: Periodo de Gracia de 3 Días Activo</p>
              <p className="text-xs text-error/90 mt-0.5">
                Hubo un fallo en la renovación automática de tu tarjeta. Dispones de 3 días para
                actualizarla antes de la suspensión del servicio.
              </p>
            </div>
          </div>
          <a
            href={isBasicCurrent ? basicCheckoutUrl : proCheckoutUrl}
            onClick={(e) => openLemonSqueezyOverlay(isBasicCurrent ? basicCheckoutUrl : proCheckoutUrl, e)}
            className="lemonsqueezy-button bg-error text-white hover:bg-error/90 shrink-0 font-semibold text-xs py-2 px-3 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer"
          >
            Actualizar Pago
          </a>
        </div>
      )}

      {/* Cancellation Scheduled Alert */}
      {isCancelledEnd && (
        <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Cancelación programada:</span> Tu suscripción finalizará al término de tu ciclo de facturación actual. Hasta entonces mantienes todas las funciones activas.
          </div>
        </div>
      )}

      {/* Trialing Notice */}
      {currentStatus === "TRIALING" && (
        <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between gap-4 text-primary">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">Periodo de Prueba Gratuita Activo:</span>{" "}
              {daysLeft > 0
                ? `Te quedan ${daysLeft} días de prueba completa. Elige tu plan para continuar sin interrupciones.`
                : "Tu prueba finaliza pronto. Selecciona un plan para mantener tu negocio activo."}
            </div>
          </div>
        </div>
      )}

      {/* 2. Dos Tarjetas Paralelas: Plan Básico y Plan Pro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch pt-2">
        {/* TARJETA 1: PLAN BÁSICO */}
        <div
          className={cn(
            "rounded-2xl border transition-all duration-200 p-6 flex flex-col justify-between",
            isBasicCurrent
              ? "bg-surface-container-lowest border-primary/50 shadow-xs ring-1 ring-primary/20"
              : "bg-surface-container-lowest/60 border-outline-variant/60 hover:border-outline-variant hover:shadow-xs"
          )}
        >
          <div>
            {/* Cabecera */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container text-on-surface flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface tracking-tight">Plan Básico</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Para empezar sin complicaciones
                  </p>
                </div>
              </div>
              {isBasicCurrent && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Plan Actual
                </span>
              )}
            </div>

            {/* Precio */}
            <div className="mt-5 pb-5 border-b border-outline-variant/30 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-on-surface tracking-tight">30,00€</span>
              <span className="text-xs font-medium text-on-surface-variant">+ IVA / mes</span>
            </div>

            {/* Lista de características */}
            <div className="py-5 flex flex-col gap-3 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/70">
                Prestaciones incluidas:
              </span>
              <div className="flex items-center gap-2.5 text-on-surface">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1 Calendario y local único</span>
              </div>
              <div className="flex items-center gap-2.5 text-on-surface">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1 Especialista incluido (+5€ extra)</span>
              </div>
              <div className="flex items-center gap-2.5 text-on-surface">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Hasta 100 citas online / mes</span>
              </div>
              <div className="flex items-center gap-2.5 text-on-surface">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Recordatorios automáticos por Email y SMS</span>
              </div>
              <div className="flex items-center gap-2.5 text-on-surface">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Gestión de clientes y consentimiento LOPD</span>
              </div>
              <div className="flex items-center gap-2.5 text-on-surface">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Portal de reservas y código QR público</span>
              </div>
              <div className="flex items-center gap-2.5 text-on-surface-variant/50 line-through">
                <X className="w-4 h-4 text-on-surface-variant/40 shrink-0" />
                <span>Bot de WhatsApp interactivo 2 vías</span>
              </div>
              <div className="flex items-center gap-2.5 text-on-surface-variant/50 line-through">
                <X className="w-4 h-4 text-on-surface-variant/40 shrink-0" />
                <span>Pagos online y anticipos de fianza</span>
              </div>
            </div>
          </div>

          {/* Botón Acción Básico */}
          <div className="pt-4 border-t border-outline-variant/30">
            {isBasicCurrent && currentStatus === "ACTIVE" ? (
              <div className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 select-none">
                Tu Plan Actual Activo
              </div>
            ) : (
              <a
                href={basicCheckoutUrl}
                onClick={(e) => openLemonSqueezyOverlay(basicCheckoutUrl, e)}
                className="lemonsqueezy-button w-full inline-flex items-center justify-center gap-2 font-medium bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/70 py-2.5 px-4 rounded-xl text-sm transition-colors cursor-pointer shadow-2xs"
              >
                <span>
                  {isBasicCurrent && currentStatus === "TRIALING"
                    ? "Activar Plan Básico"
                    : "Elegir Plan Básico"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* TARJETA 2: PLAN PRO */}
        <div
          className={cn(
            "rounded-2xl border transition-all duration-200 p-6 flex flex-col justify-between relative",
            isProCurrent
              ? "bg-surface-container-lowest border-primary shadow-sm ring-2 ring-primary/20"
              : "bg-surface-container-lowest border-outline-variant/80 hover:border-primary/50 shadow-xs"
          )}
        >
          {/* Badge Recomendado */}
          <div className="absolute -top-3 right-6">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-primary text-white px-3 py-1 rounded-full shadow-xs">
              Recomendado
            </span>
          </div>

          <div>
            {/* Cabecera */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface tracking-tight">Plan Pro</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Automatizaciones y multi-sede
                  </p>
                </div>
              </div>
              {isProCurrent && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Plan Actual
                </span>
              )}
            </div>

            {/* Precio */}
            <div className="mt-5 pb-5 border-b border-outline-variant/30 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-on-surface tracking-tight">40,00€</span>
              <span className="text-xs font-medium text-on-surface-variant">+ IVA / mes</span>
            </div>

            {/* Lista de características */}
            <div className="py-5 flex flex-col gap-3 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-semibold">
                Todo lo del plan Básico, y además:
              </span>
              <div className="flex items-center gap-2.5 text-on-surface font-medium">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Multi-calendario y sedes ilimitadas</span>
              </div>
              <div className="flex items-center gap-2.5 text-on-surface font-medium">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>2 Especialistas incluidos (+5€ extra)</span>
              </div>
              <div className="flex items-center gap-2.5 text-on-surface font-medium">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Reservas y citas online ilimitadas</span>
              </div>
              <div className="flex items-center gap-2.5 text-on-surface font-medium">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>WhatsApp Bot interactivo bidireccional</span>
              </div>
              <div className="flex items-center gap-2.5 text-on-surface font-medium">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Pagos online y cobro de depósitos/señas</span>
              </div>
              <div className="flex items-center gap-2.5 text-on-surface font-medium">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Analítica avanzada de negocio e informes</span>
              </div>
              <div className="flex items-center gap-2.5 text-on-surface font-medium">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Soporte prioritario por chat</span>
              </div>
            </div>
          </div>

          {/* Botón Acción Pro */}
          <div className="pt-4 border-t border-outline-variant/30">
            {isProCurrent && currentStatus === "ACTIVE" ? (
              <div className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 select-none">
                Tu Plan Actual Activo
              </div>
            ) : (
              <a
                href={proCheckoutUrl}
                onClick={(e) => openLemonSqueezyOverlay(proCheckoutUrl, e)}
                className="lemonsqueezy-button w-full inline-flex items-center justify-center gap-2 font-medium bg-primary text-white hover:bg-primary/90 py-2.5 px-4 rounded-xl text-sm transition-colors cursor-pointer shadow-sm"
              >
                <span>
                  {isProCurrent && currentStatus === "TRIALING"
                    ? "Activar Plan Pro"
                    : "Mejorar a Plan Pro"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Barra inferior de seguridad y gestión de suscripción */}
      <div className="mt-8 p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Pagos procesados de forma segura con cifrado SSL bancario por <strong>Lemon Squeezy</strong> (Merchant of Record). Compatible con Tarjeta de Crédito/Débito, Apple Pay y Google Pay.
          </span>
        </div>

        {currentStatus === "ACTIVE" && !isCancelledEnd && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-error hover:text-error hover:bg-error/10 font-medium shrink-0"
            disabled={isCancelling}
            onClick={handleCancelSubscription}
          >
            {isCancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>Cancelar Suscripción</span>
          </Button>
        )}
      </div>

      {/* 3. Historial de facturas */}
      <section className="mt-12 pt-12 pb-10">
        <SectionHeading
          icon={FileText}
          title="Historial de Facturas y Recibos"
          description={
            <>
              Descarga tus facturas oficiales con desglose de impuestos
              <br />
              emitidas tras cada cobro.
            </>
          }
        />

        <div>
          {isLoading ? (
            <div className="p-8 flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-outline-variant/20 animate-pulse">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-20 h-4" />
                  <Skeleton className="w-16 h-4" />
                </div>
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center gap-3 text-on-surface-variant">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-high text-on-surface-variant/70 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-bold text-on-surface">No hay facturas emitidas todavía</p>
                <p className="text-xs max-w-sm text-on-surface-variant/80">
                  Tus recibos y facturas fiscales oficiales aparecerán aquí tras realizar el primer cobro de suscripción.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 bg-surface-container-low text-on-surface-variant font-semibold">
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Nº Factura</th>
                    <th className="py-3 px-4">Concepto</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Descarga</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-surface-container/50 transition-colors">
                      <td className="py-3.5 px-4 text-on-surface font-medium">
                        {new Date(inv.createdAt).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-on-surface">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant">
                        {inv.billingReason || `Volta Plan Mensual`}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-on-surface">
                        {Number(inv.amount).toFixed(2)}€
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Pagada
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {inv.invoiceUrl ? (
                          <a
                            href={inv.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary font-semibold hover:underline cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Descargar PDF</span>
                          </a>
                        ) : (
                          <span className="text-on-surface-variant/40">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
