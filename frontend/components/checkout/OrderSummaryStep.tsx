"use client";

import React from "react";
import { CreditCard, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/volta-ui";
import { PLAN_CONFIGS, calculatePlanPrice } from "@/lib/permissions";

interface OrderSummaryStepProps {
  selectedPlan: "BASIC" | "PRO";
  totalWorkers: number;
  pricing: ReturnType<typeof calculatePlanPrice>;
  vatAmount: number;
  totalWithVat: number;
  couponApplied: boolean;
  discountPercent: number;
  legalName: string;
  taxId: string;
  billingEmail: string;
  isLoading: boolean;
  errorMessage: string;
  onBack: () => void;
  onLaunchCheckout: () => void;
}

export const OrderSummaryStep: React.FC<OrderSummaryStepProps> = ({
  selectedPlan,
  totalWorkers,
  pricing,
  vatAmount,
  totalWithVat,
  couponApplied,
  discountPercent,
  legalName,
  taxId,
  billingEmail,
  isLoading,
  errorMessage,
  onBack,
  onLaunchCheckout,
}) => {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-200">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-on-surface">Resumen y Pago</h3>
        <p className="text-sm text-on-surface-variant mt-1">
          Revisa los detalles antes de completar tu suscripción.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-xs text-error font-medium">
          {errorMessage}
        </div>
      )}

      {/* Plan and Workers Summary Card */}
      <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 flex flex-col gap-3">
        <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
          <div>
            <h4 className="font-bold text-sm text-on-surface">
              Plan {PLAN_CONFIGS[selectedPlan].name}
            </h4>
            <p className="text-xs text-on-surface-variant">
              {totalWorkers} trabajador(es) · Facturación mensual
            </p>
          </div>
          <span className="font-bold text-base text-on-surface">
            {pricing.total.toFixed(2)}€<span className="text-xs font-normal">/mes</span>
          </span>
        </div>

        {/* Breakdown */}
        <div className="text-xs space-y-1 text-on-surface-variant">
          <div className="flex justify-between">
            <span>Cuota base del plan ({pricing.includedWorkers} trabajadores incluidos)</span>
            <span>{pricing.basePrice.toFixed(2)}€</span>
          </div>
          {pricing.extraWorkers > 0 && (
            <div className="flex justify-between">
              <span>{pricing.extraWorkers}x Trabajador adicional</span>
              <span>+{pricing.extraWorkersCost.toFixed(2)}€</span>
            </div>
          )}
          {couponApplied && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Descuento aplicado (-{discountPercent}%)</span>
              <span>-{pricing.discountAmount.toFixed(2)}€</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Base imponible</span>
            <span>{pricing.total.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-on-surface-variant/80">
            <span>IVA (21%)</span>
            <span>+{vatAmount.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-on-surface pt-2 border-t border-outline-variant/20">
            <span>Total a pagar</span>
            <span>{totalWithVat.toFixed(2)}€/mes</span>
          </div>
        </div>
      </div>

      {/* Billing Data Preview */}
      <div className="p-3 bg-surface-container rounded-xl text-xs flex flex-col gap-1 text-on-surface-variant">
        <div className="flex justify-between">
          <span className="font-semibold text-on-surface">Razón Social:</span>
          <span>{legalName}</span>
        </div>
        {taxId && (
          <div className="flex justify-between">
            <span className="font-semibold text-on-surface">NIF/CIF:</span>
            <span>{taxId}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="font-semibold text-on-surface">Email de Facturación:</span>
          <span>{billingEmail}</span>
        </div>
      </div>

      {/* Guarantee & MoR Notice */}
      <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-primary/5 p-3 rounded-xl border border-primary/10">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
        <span>
          Pago seguro cifrado con TLS 256-bit. Cancela tu suscripción en cualquier momento desde tu panel de ajustes sin permanencia.
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="lg" onClick={onBack} disabled={isLoading} className="flex-1">
          Atrás
        </Button>
        <Button
          variant="default"
          size="lg"
          onClick={onLaunchCheckout}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 font-bold"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Cargando pasarela...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Proceder al Pago Seguro</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
