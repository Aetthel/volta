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
  ArrowRight,
  Clock,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Button, Card, Badge } from "@/components/ui/volta-ui";
import type { Invoice } from "@/types/domain";

const SubscriptionCheckoutModal = dynamic(
  () => import("@/components/SubscriptionCheckoutModal"),
  { ssr: false }
);

interface BillingSectionProps {
  onShowToast: (message: string) => void;
}

export default function BillingSection({ onShowToast }: BillingSectionProps) {
  const { data: session } = useSession();
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
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
    if (!confirm("¿Estás seguro de que deseas cancelar tu suscripción? Mantendrás el acceso hasta el final de tu ciclo mensual actual.")) {
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
    } catch (e) {
      onShowToast("Error de conexión al cancelar la suscripción");
    } finally {
      setIsCancelling(false);
    }
  };

  const currentPlan = subscriptionData?.subscriptionPlan || session?.user?.subscriptionPlan || "PRO";
  const currentStatus = subscriptionData?.subscriptionStatus || session?.user?.subscriptionStatus || "TRIALING";
  const isGraceActive = subscriptionData?.isGracePeriodActive;
  const daysLeft = subscriptionData?.daysLeftInTrial ?? 0;
  const isCancelledEnd = subscriptionData?.cancelAtPeriodEnd;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Grace Period Alert */}
      {isGraceActive && (
        <div className="p-4 bg-error/10 border border-error/30 rounded-2xl flex items-center justify-between gap-4 text-error">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <p className="text-sm font-bold">Aviso: Periodo de Gracia de 3 Días Activo</p>
              <p className="text-xs text-error/90 mt-0.5">
                Hubo un fallo en la renovación automática de tu tarjeta. Dispones de 3 días para actualizarla antes de la suspensión del servicio.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="bg-error text-white hover:bg-error/90 shrink-0"
            onClick={() => setIsCheckoutOpen(true)}
          >
            Actualizar Pago
          </Button>
        </div>
      )}

      {/* Subscription Overview Card */}
      <Card className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-outline-variant/20">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-2xl font-bold text-on-surface">
                Plan Volta {currentPlan === "BASIC" ? "Básico" : "Pro"}
              </h3>
              {currentStatus === "ACTIVE" && !isCancelledEnd && (
                <Badge variant="default" className="bg-emerald-600 text-white">
                  Suscripción Activa
                </Badge>
              )}
              {currentStatus === "TRIALING" && (
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  {daysLeft > 0 ? `Prueba Gratuita (${daysLeft} días)` : "Prueba Gratuita"}
                </Badge>
              )}
              {isCancelledEnd && (
                <Badge variant="error">Cancelación Programada</Badge>
              )}
            </div>
            <p className="text-sm text-on-surface-variant max-w-xl">
              {currentPlan === "BASIC"
                ? "1 Sede/calendario, 1 trabajador incluido (+5€ extra), hasta 100 reservas online/mes y recordatorios Email/SMS."
                : "Multi-calendario, sedes/salas ilimitadas, 2 trabajadores incluidos (+5€ extra), WhatsApp bidireccional, pagos online y analítica completa."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button
              variant="primary"
              size="md"
              className="flex items-center gap-2 shadow-sm cursor-pointer"
              onClick={() => setIsCheckoutOpen(true)}
            >
              <Zap className="w-4 h-4" />
              <span>{currentStatus === "ACTIVE" ? "Cambiar / Mejorar Plan" : "Activar Suscripción"}</span>
            </Button>
            {currentStatus === "ACTIVE" && !isCancelledEnd && (
              <Button
                variant="outline"
                size="md"
                className="text-error border-error/40 hover:bg-error/10 cursor-pointer"
                disabled={isCancelling}
                onClick={handleCancelSubscription}
              >
                Cancelar Suscripción
              </Button>
            )}
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-xs">
          <div className="space-y-1">
            <span className="text-on-surface-variant block font-medium">Cuota Mensual</span>
            <span className="text-base font-bold text-on-surface">
              {currentPlan === "BASIC" ? "30,00€" : "40,00€"} <span className="text-xs font-normal text-on-surface-variant">+ IVA / mes</span>
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-on-surface-variant block font-medium">Pasarela y Cumplimiento Fiscal</span>
            <span className="text-base font-semibold text-on-surface flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" /> Lemon Squeezy (MoR)
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-on-surface-variant block font-medium">Métodos Admitidos</span>
            <span className="text-base font-semibold text-on-surface flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-on-surface-variant" /> Tarjeta, Apple Pay, Google Pay
            </span>
          </div>
        </div>
      </Card>

      {/* Invoices History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-bold text-on-surface">Historial de Facturas</h4>
            <p className="text-xs text-on-surface-variant">
              Facturas oficiales y válidas emitidas por Lemon Squeezy con desglose de impuestos.
            </p>
          </div>
        </div>

        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-on-surface-variant">
              Cargando facturas...
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center gap-2 text-on-surface-variant">
              <Calendar className="w-8 h-8 opacity-40 mb-1" />
              <p className="text-sm font-semibold text-on-surface">No hay facturas emitidas todavía</p>
              <p className="text-xs max-w-sm">
                Tus recibos y facturas fiscales oficiales aparecerán aquí tras realizar el primer cobro de suscripción.
              </p>
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
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-surface-container/50 transition-colors">
                      <td className="py-3 px-4 text-on-surface">
                        {new Date(inv.createdAt).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-on-surface">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant">
                        {inv.billingReason || `Volta Plan Mensual`}
                      </td>
                      <td className="py-3 px-4 font-bold text-on-surface">
                        {Number(inv.amount).toFixed(2)}€
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" /> Pagada
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {inv.invoiceUrl ? (
                          <a
                            href={inv.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary font-semibold hover:underline cursor-pointer"
                          >
                            <span>Descargar PDF</span>
                            <ExternalLink className="w-3.5 h-3.5" />
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
        </Card>
      </div>

      {/* Checkout Modal */}
      <SubscriptionCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        initialPlan={currentPlan === "BASIC" ? "BASIC" : "PRO"}
        onSuccess={() => {
          setIsCheckoutOpen(false);
          onShowToast("¡Suscripción activada con éxito!");
          fetchBillingData();
        }}
      />
    </div>
  );
}
