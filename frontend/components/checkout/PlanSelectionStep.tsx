"use client";

import React from "react";
import { Check, Clock, Users, Plus, Minus, Tag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/volta-ui";
import { PLAN_CONFIGS, calculatePlanPrice } from "@/lib/permissions";

interface PlanSelectionStepProps {
  selectedPlan: "BASIC" | "PRO";
  onSelectPlan: (plan: "BASIC" | "PRO") => void;
  totalWorkers: number;
  setTotalWorkers: React.Dispatch<React.SetStateAction<number>>;
  isTrialing: boolean;
  daysLeftInTrial: number;
  pricing: ReturnType<typeof calculatePlanPrice>;
  couponCode: string;
  setCouponCode: (c: string) => void;
  couponApplied: boolean;
  discountPercent: number;
  couponError: string;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  onNext: () => void;
}

export const PlanSelectionStep: React.FC<PlanSelectionStepProps> = ({
  selectedPlan,
  onSelectPlan,
  totalWorkers,
  setTotalWorkers,
  isTrialing,
  daysLeftInTrial,
  pricing,
  couponCode,
  setCouponCode,
  couponApplied,
  discountPercent,
  couponError,
  onApplyCoupon,
  onRemoveCoupon,
  onNext,
}) => {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-200">
      <div className="text-center">
        <h3 id="checkout-modal-title" className="text-2xl font-bold text-on-surface">
          Elige tu Plan de Suscripción
        </h3>
        <p className="text-sm text-on-surface-variant mt-1">
          Facturación mensual transparente con IVA gestionado por Lemon Squeezy (MoR).
        </p>
      </div>

      {/* Trial notice */}
      {isTrialing && daysLeftInTrial > 0 && (
        <div className="p-3.5 bg-primary/10 rounded-xl border border-primary/20 flex items-center gap-3 text-xs text-primary">
          <Clock className="w-5 h-5 shrink-0" />
          <span>
            <strong>¡Prueba Gratuita Activa!</strong> Te quedan{" "}
            <strong>{daysLeftInTrial} días</strong> de prueba. Hoy no se te cobrará nada; tu
            primer cobro se programará para el final del periodo de prueba.
          </span>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Basic Plan (30€/mes) */}
        <div
          onClick={() => onSelectPlan("BASIC")}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
            selectedPlan === "BASIC"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-outline-variant/30 hover:border-outline-variant/60 bg-surface-container-low"
          }`}
        >
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Básico
              </span>
              {selectedPlan === "BASIC" && (
                <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-on-surface mb-1">
              30€<span className="text-xs font-normal text-on-surface-variant">/mes</span>
            </div>
            <p className="text-xs text-on-surface-variant font-medium">
              Para empezar sin complicaciones.
            </p>
          </div>
          <ul className="mt-3 text-xs space-y-1.5 text-on-surface">
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-primary shrink-0" /> 1 trabajador incluido (+5€ extra)
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-primary shrink-0" /> 1 calendario
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-primary shrink-0" /> Reserva online (100/mes)
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-primary shrink-0" /> Recordatorios Email/SMS
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-primary shrink-0" /> Soporte por email
            </li>
          </ul>
        </div>

        {/* Pro Plan (40€/mes) */}
        <div
          onClick={() => onSelectPlan("PRO")}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
            selectedPlan === "PRO"
              ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary"
              : "border-outline-variant/30 hover:border-outline-variant/60 bg-surface-container-low"
          }`}
        >
          <div className="absolute -top-2.5 right-3 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
            Recomendado
          </div>
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Pro
              </span>
              {selectedPlan === "PRO" && (
                <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-on-surface mb-1">
              40€<span className="text-xs font-normal text-on-surface-variant">/mes</span>
            </div>
            <p className="text-xs text-on-surface-variant font-medium">
              Para negocios que quieren crecer.
            </p>
          </div>
          <ul className="mt-3 text-xs space-y-1.5 text-on-surface font-medium">
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-primary shrink-0" /> 2 trabajadores incluidos (+5€ extra)
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-primary shrink-0" /> Multi-calendario / Sedes / Salas
            </li>
            <li className="flex items-center gap-1.5 text-on-surface font-medium">
              <Check className="w-3.5 h-3.5 text-primary shrink-0" /> Recordatorios WhatsApp bidireccional
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-primary shrink-0" /> Pagos online (señas y depósitos)
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-primary shrink-0" /> Gestión completa de clientes
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-primary shrink-0" /> Analítica de negocio
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-primary shrink-0" /> Soporte prioritario por chat
            </li>
          </ul>
        </div>
      </div>

      {/* Workers Count Selector */}
      <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Users className="w-4 h-4 text-primary" />
          <div>
            <p className="text-xs font-bold text-on-surface">Número de Trabajadores</p>
            <p className="text-[11px] text-on-surface-variant">
              {pricing.includedWorkers} incluido(s) en {PLAN_CONFIGS[selectedPlan].name} · +5€/mes por trabajador adicional
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-surface px-2 py-1 rounded-lg border border-outline-variant/40">
          <button
            type="button"
            onClick={() => setTotalWorkers((prev) => Math.max(1, prev - 1))}
            disabled={totalWorkers <= 1}
            className="p-1 text-on-surface-variant hover:text-on-surface disabled:opacity-30 cursor-pointer"
            aria-label="Disminuir trabajadores"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-bold text-on-surface min-w-5 text-center">
            {totalWorkers}
          </span>
          <button
            type="button"
            onClick={() => setTotalWorkers((prev) => prev + 1)}
            className="p-1 text-on-surface-variant hover:text-on-surface cursor-pointer"
            aria-label="Aumentar trabajadores"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Coupon Code Section */}
      <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-on-surface flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-primary" /> ¿Tienes un cupón promocional?
          </span>
          {couponApplied && (
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={onRemoveCoupon}
              className="text-error hover:text-error text-xs font-medium"
            >
              Eliminar cupón
            </Button>
          )}
        </div>
        {!couponApplied ? (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ej. VOLTA2026"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-surface text-on-surface text-xs rounded-lg border border-outline-variant focus:outline-hidden focus:ring-1 focus:ring-primary uppercase"
            />
            <Button variant="outline" size="sm" onClick={onApplyCoupon}>
              Aplicar
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <span>Cupón {couponCode.toUpperCase()} aplicado</span>
            <span>-{discountPercent}% de descuento</span>
          </div>
        )}
        {couponError && <p className="text-xs text-error font-medium">{couponError}</p>}
      </div>

      {/* Price Breakdown */}
      <div className="bg-surface-container rounded-xl p-3.5 text-xs flex flex-col gap-1.5">
        <div className="flex justify-between text-on-surface-variant">
          <span>Plan {PLAN_CONFIGS[selectedPlan].name} Base</span>
          <span>{pricing.basePrice.toFixed(2)}€</span>
        </div>
        {pricing.extraWorkers > 0 && (
          <div className="flex justify-between text-on-surface-variant">
            <span>{pricing.extraWorkers}x Trabajador extra (+5€/u)</span>
            <span>+{pricing.extraWorkersCost.toFixed(2)}€</span>
          </div>
        )}
        {couponApplied && (
          <div className="flex justify-between text-emerald-600 font-medium">
            <span>Descuento Promocional ({discountPercent}%)</span>
            <span>-{pricing.discountAmount.toFixed(2)}€</span>
          </div>
        )}
        <div className="border-t border-outline-variant/30 pt-1.5 mt-0.5 flex justify-between font-bold text-sm text-on-surface">
          <span>Subtotal estimado</span>
          <span>{pricing.total.toFixed(2)}€/mes</span>
        </div>
      </div>

      <Button
        variant="default"
        size="lg"
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 font-bold"
      >
        <span>Continuar a Facturación</span>
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
