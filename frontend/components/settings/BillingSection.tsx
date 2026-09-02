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
} from "lucide-react";
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge, Skeleton } from "@/components/ui/volta-ui";
import type { Invoice } from "@/types/domain";
import { cn } from "@/lib/utils";
import {
  LEMON_SQUEEZY_PRODUCT_URLS,
  buildLemonSqueezyCheckoutUrl,
  openLemonSqueezyOverlay,
} from "@/lib/lemonsqueezy";

interface BillingSectionProps {
  onShowToast: (message: string) => void;
}

export default function BillingSection({ onShowToast }: BillingSectionProps) {
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
        onShowToast("Suscripción cancelada al término del periodo actual");
        fetchBillingData();
      } else {
        const errData = await res.json();
        onShowToast(errData.error || "No se pudo cancelar la suscripción");
      }
    } catch {
      onShowToast("Error de conexión al cancelar la suscripción");
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

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200 mt-2">
      {/* 1. Grace Period Alert (if active) */}
      {isGraceActive && (
        <div className="p-4 bg-error/10 border-2 border-error/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-error">
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
          {/* TODO: Insertar URL del producto de Lemon Squeezy aquí */}
          {(() => {
            const url = buildLemonSqueezyCheckoutUrl(
              currentPlan === "BASIC"
                ? LEMON_SQUEEZY_PRODUCT_URLS.BASIC
                : LEMON_SQUEEZY_PRODUCT_URLS.PRO,
              session?.user
            );
            return (
              <a
                href={url}
                onClick={(e) => openLemonSqueezyOverlay(url, e)}
                className="lemonsqueezy-button bg-error text-white hover:bg-error/90 shrink-0 font-semibold text-xs py-2 px-3 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer"
              >
                Actualizar Pago
              </a>
            );
          })()}
        </div>
      )}

      {/* 2. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Plan Details & Capabilities (7 cols) */}
        <Card className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <CardHeader className="pb-4 border-b border-outline-variant/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <CardTitle className="text-xl font-bold text-on-surface flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <span>Plan Volta {currentPlan === "BASIC" ? "Básico" : "Pro"}</span>
                    </CardTitle>
                    {currentStatus === "ACTIVE" && !isCancelledEnd && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Suscripción Activa
                      </span>
                    )}
                    {currentStatus === "TRIALING" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        <Clock className="w-3 h-3 text-primary" />
                        {daysLeft > 0 ? `Prueba Gratuita (${daysLeft} días restantes)` : "Prueba Gratuita"}
                      </span>
                    )}
                    {isCancelledEnd && (
                      <Badge variant="error">Cancelación Programada</Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs text-on-surface-variant/80">
                    {currentPlan === "BASIC"
                      ? "Ideal para profesionales individuales o pequeños locales con reservas básicas."
                      : "La solución completa con automatizaciones WhatsApp 2 vías, multi-agenda y analítica avanzada."}
                  </CardDescription>
                </div>

                {/* Price Tag */}
                <div className="text-left sm:text-right shrink-0">
                  <div className="text-2xl font-bold text-on-surface">
                    {currentPlan === "BASIC" ? "30,00€" : "40,00€"}
                  </div>
                  <span className="text-[11px] font-medium text-on-surface-variant">
                    + IVA / mes
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4 flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Características incluidas en tu plan:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {currentPlan === "BASIC"
                      ? "1 Calendario y local"
                      : "Multi-calendario y sedes ilimitadas"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {currentPlan === "BASIC"
                      ? "1 Especialista incluido (+5€ extra)"
                      : "2 Especialistas incluidos (+5€ extra)"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {currentPlan === "BASIC"
                      ? "Hasta 100 citas online / mes"
                      : "Reservas y citas ilimitadas"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {currentPlan === "BASIC"
                      ? "Recordatorios Email y SMS"
                      : "WhatsApp Bot interactivo 2 vías"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Gestión de clientes y consentimiento LOPD</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Portal público de reservas con código QR</span>
                </div>
              </div>
            </CardContent>
          </div>

          <CardFooter className="border-t border-outline-variant/40 pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* TODO: Insertar URL del producto de Lemon Squeezy aquí */}
              {(() => {
                const url = buildLemonSqueezyCheckoutUrl(
                  currentPlan === "BASIC"
                    ? LEMON_SQUEEZY_PRODUCT_URLS.PRO
                    : LEMON_SQUEEZY_PRODUCT_URLS.PRO,
                  session?.user
                );
                return (
                  <a
                    href={url}
                    onClick={(e) => openLemonSqueezyOverlay(url, e)}
                    className="lemonsqueezy-button inline-flex items-center justify-center gap-2 font-medium bg-primary text-white hover:bg-primary/90 py-2.5 px-4 rounded-xl text-sm transition-colors cursor-pointer shadow-sm"
                  >
                    <Zap className="w-4 h-4" />
                    <span>
                      {currentStatus === "ACTIVE" ? "Cambiar o Mejorar Plan" : "Activar Suscripción"}
                    </span>
                  </a>
                );
              })()}
            </div>

            {currentStatus === "ACTIVE" && !isCancelledEnd && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-error hover:text-error hover:bg-error/10 font-semibold"
                disabled={isCancelling}
                onClick={handleCancelSubscription}
              >
                {isCancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Cancelar Suscripción</span>
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Right Column: Security, Payment & Capacity (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Payment Method & Security Card */}
          <Card className="p-5 bg-surface-container-low border border-outline-variant/50">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Método de Pago y Facturación
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  SSL Seguro
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white dark:bg-black/20 rounded-xl border border-outline-variant/40">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-xs">
                  <span className="font-bold text-on-surface">Pagos Internacionales Seguros</span>
                  <span className="text-on-surface-variant/80">
                    Tarjeta, Apple Pay, Google Pay procesados por Lemon Squeezy (MoR).
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-on-surface-variant/80 leading-relaxed">
                Todas las transacciones cumplen con la normativa fiscal de la UE (IVA intracomunitario) y la directiva PSD2 con autenticación reforzada SCA.
              </p>
            </div>
          </Card>

          {/* Business Limits / Capacity Card */}
          <Card className="p-5 bg-surface-container-low border border-outline-variant/50">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-primary" />
                Capacidad y Recursos del Negocio
              </span>

              <div className="flex flex-col gap-2.5 text-xs text-on-surface-variant">
                <div className="flex items-center justify-between py-1 border-b border-outline-variant/30">
                  <span className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    Especialistas en equipo:
                  </span>
                  <span className="font-bold text-on-surface">
                    {currentPlan === "BASIC" ? "1 incluido" : "2 incluidos"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-outline-variant/30">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    Citas mensuales:
                  </span>
                  <span className="font-bold text-on-surface">
                    {currentPlan === "BASIC" ? "100 citas/mes" : "Ilimitadas"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    WhatsApp 2 Vías:
                  </span>
                  <span className="font-bold text-on-surface">
                    {currentPlan === "BASIC" ? "No disponible" : "Activo"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 3. Invoices History Table */}
      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="pb-3 border-b border-outline-variant/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-on-surface flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>Historial de Facturas y Recibos</span>
              </CardTitle>
              <CardDescription>
                Descarga tus facturas oficiales con desglose de impuestos emitidas tras cada cobro.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
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
        </CardContent>
      </Card>
    </div>
  );
}
