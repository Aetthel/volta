"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  X,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building2,
  Tag,
  CheckCircle2,
  Loader2,
  Zap,
  Users,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/volta-ui";
import { calculatePlanPrice, PLAN_CONFIGS } from "@/lib/permissions";

interface SubscriptionCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: "BASIC" | "PRO";
  onSuccess?: () => void;
}

declare global {
  interface Window {
    createLemonSqueezy?: () => void;
    LemonSqueezy?: {
      Url?: {
        Open: (url: string) => void;
        Close: () => void;
      };
      Setup?: (options: {
        eventHandler: (event: { event: string; data?: any }) => void;
      }) => void;
    };
  }
}

export default function SubscriptionCheckoutModal({
  isOpen,
  onClose,
  initialPlan = "PRO",
  onSuccess,
}: SubscriptionCheckoutModalProps) {
  const { data: session, update: updateSession } = useSession();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPlan, setSelectedPlan] = useState<"BASIC" | "PRO">(initialPlan);
  const [totalWorkers, setTotalWorkers] = useState<number>(initialPlan === "BASIC" ? 1 : 2);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");

  // Business details
  const [legalName, setLegalName] = useState(session?.user?.name || "");
  const [taxId, setTaxId] = useState("");
  const [billingEmail, setBillingEmail] = useState(session?.user?.email || "");

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSuccessRef = useRef(onSuccess);
  useEffect(() => {
    handleSuccessRef.current = onSuccess;
  }, [onSuccess]);

  const handleCheckoutSuccess = useCallback(async () => {
    setStep(4);
    try {
      await updateSession({
        subscriptionPlan: selectedPlan,
        subscriptionStatus: "ACTIVE",
      });
    } catch (e) {
      console.warn("Session update warning:", e);
    }
    if (handleSuccessRef.current) handleSuccessRef.current();
  }, [selectedPlan, updateSession]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedPlan(initialPlan);
      setTotalWorkers(initialPlan === "BASIC" ? 1 : 2);
      setErrorMessage("");
      setCouponError("");
      if (session?.user?.name) setLegalName(session.user.name);
      if (session?.user?.email) setBillingEmail(session.user.email);

      // Setup Lemon Squeezy event handler
      if (typeof window !== "undefined" && window.createLemonSqueezy) {
        window.createLemonSqueezy();
        window.LemonSqueezy?.Setup?.({
          eventHandler: (event) => {
            if (event.event === "Checkout.Success") {
              handleCheckoutSuccess();
            }
          },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialPlan]);

  // Adjust totalWorkers minimum when plan toggles
  const handleSelectPlan = (plan: "BASIC" | "PRO") => {
    setSelectedPlan(plan);
    const minWorkers = plan === "BASIC" ? 1 : 2;
    if (totalWorkers < minWorkers) {
      setTotalWorkers(minWorkers);
    }
  };

  if (!isOpen) return null;

  const isTrialing = session?.user?.subscriptionStatus === "TRIALING";
  const trialExpiresAt = session?.user?.trialExpiresAt;
  const daysLeftInTrial = trialExpiresAt
    ? Math.max(0, Math.ceil((new Date(trialExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Price calculations from centralized permissions helper
  const pricing = calculatePlanPrice(selectedPlan, totalWorkers, couponApplied ? discountPercent : 0);
  const vatAmount = (pricing.total * 0.21);
  const totalWithVat = pricing.total + vatAmount;

  const handleApplyCoupon = () => {
    setCouponError("");
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === "VOLTA2026" || code === "PROMO20") {
      setDiscountPercent(20);
      setCouponApplied(true);
    } else if (code === "LAUNCH50") {
      setDiscountPercent(50);
      setCouponApplied(true);
    } else {
      setCouponError("Código promocional inválido o expirado");
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setDiscountPercent(0);
    setCouponCode("");
    setCouponError("");
  };

  const handleLaunchCheckout = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/backend/subscription/checkout-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          totalWorkers,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "No se pudo iniciar la sesión de pago");
      }

      if (data.isMock) {
        // Direct mock activation for local dev/testing
        const mockRes = await fetch("/api/backend/subscription/mock-activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: selectedPlan }),
        });

        if (mockRes.ok) {
          handleCheckoutSuccess();
        } else {
          throw new Error("Error al activar suscripción de prueba");
        }
      } else if (data.url) {
        // Open Lemon Squeezy Overlay
        if (window.LemonSqueezy?.Url?.Open) {
          window.LemonSqueezy.Url.Open(data.url);
        } else {
          window.location.href = data.url;
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Error al conectar con la pasarela de pago");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      <div className="bg-surface rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-outline-variant/30 relative flex flex-col gap-6 select-none overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        {step !== 4 && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Stepper Header */}
        {step !== 4 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
              <span className={step >= 1 ? "text-primary font-bold" : ""}>1. Plan</span>
              <span className="w-8 h-px bg-outline-variant/40" />
              <span className={step >= 2 ? "text-primary font-bold" : ""}>2. Facturación</span>
              <span className="w-8 h-px bg-outline-variant/40" />
              <span className={step >= 3 ? "text-primary font-bold" : ""}>3. Pago Seguro</span>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300 rounded-full"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: Plan Selection & Worker Counter */}
        {step === 1 && (
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
                <Sparkles className="w-5 h-5 shrink-0" />
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
                onClick={() => handleSelectPlan("BASIC")}
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
                onClick={() => handleSelectPlan("PRO")}
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
                  <li className="flex items-center gap-1.5 text-primary">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" /> WhatsApp bidireccional
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
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-error hover:underline text-xs font-medium cursor-pointer"
                  >
                    Eliminar cupón
                  </button>
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
                  <Button variant="outline" size="sm" onClick={handleApplyCoupon}>
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
                <span>Base mensual (Plan {PLAN_CONFIGS[selectedPlan].name})</span>
                <span>{pricing.basePrice.toFixed(2)}€</span>
              </div>
              {pricing.extraWorkers > 0 && (
                <div className="flex justify-between text-on-surface-variant">
                  <span>{pricing.extraWorkers} trabajador(es) adicional(es) (+5€/mes c/u)</span>
                  <span>+{pricing.extraWorkersCost.toFixed(2)}€</span>
                </div>
              )}
              {couponApplied && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Descuento ({discountPercent}%)</span>
                  <span>-{pricing.discountAmount.toFixed(2)}€</span>
                </div>
              )}
              <div className="flex justify-between text-on-surface-variant">
                <span>IVA estimado (21% legal UE)</span>
                <span>{vatAmount.toFixed(2)}€</span>
              </div>
              <div className="border-t border-outline-variant/30 pt-1.5 flex justify-between font-bold text-sm text-on-surface">
                <span>Total a facturar</span>
                <span>{totalWithVat.toFixed(2)}€/mes</span>
              </div>
            </div>

            {/* Action */}
            <Button
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center gap-2 cursor-pointer shadow-md"
              onClick={() => setStep(2)}
            >
              <span>Continuar con Datos de Facturación</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* STEP 2: Business & Billing Info */}
        {step === 2 && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-on-surface">Datos de Facturación</h3>
              <p className="text-sm text-on-surface-variant mt-1">
                La factura oficial será emitida a estos datos por Lemon Squeezy (MoR).
              </p>
            </div>

            <div className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-semibold text-on-surface block mb-1">
                  Razón Social / Nombre Comercial *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type="text"
                    required
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="Ej. Salón Belleza & Spa S.L."
                    className="w-full pl-9 pr-3 py-2 bg-surface text-on-surface text-xs rounded-xl border border-outline-variant focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface block mb-1">
                  NIF / CIF / NIE (Opcional para recibo tributario)
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="Ej. B12345678"
                  className="w-full px-3 py-2 bg-surface text-on-surface text-xs rounded-xl border border-outline-variant focus:outline-hidden focus:ring-1 focus:ring-primary uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface block mb-1">
                  Email para Envío de Facturas *
                </label>
                <input
                  type="email"
                  required
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  placeholder="facturacion@tunegocio.com"
                  className="w-full px-3 py-2 bg-surface text-on-surface text-xs rounded-xl border border-outline-variant focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="lg"
                className="w-1/3 cursor-pointer"
                onClick={() => setStep(1)}
              >
                Atrás
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="w-2/3 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                onClick={() => setStep(3)}
              >
                <span>Ir al Pago Seguro</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Secure Payment with Lemon Squeezy */}
        {step === 3 && (
          <div className="flex flex-col gap-5 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-on-surface">Pasarela de Pago Segura</h3>
              <p className="text-sm text-on-surface-variant mt-1">
                Conexión cifrada de 256 bits mediante Lemon Squeezy (Merchant of Record).
              </p>
            </div>

            {/* Payment methods icons badge */}
            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 flex flex-col gap-3">
              <span className="text-xs font-semibold text-on-surface">
                Métodos de pago admitidos con 1 solo clic:
              </span>
              <div className="flex items-center justify-center gap-4 text-xs font-bold text-on-surface-variant flex-wrap">
                <span className="flex items-center gap-1 bg-surface px-2.5 py-1.5 rounded-lg border border-outline-variant/30 shadow-xs">
                  <CreditCard className="w-4 h-4 text-primary" /> Tarjetas (Visa / MC / AMEX)
                </span>
                <span className="bg-surface px-2.5 py-1.5 rounded-lg border border-outline-variant/30 shadow-xs">
                  🍏 Apple Pay
                </span>
                <span className="bg-surface px-2.5 py-1.5 rounded-lg border border-outline-variant/30 shadow-xs">
                  🌐 Google Pay
                </span>
                <span className="bg-surface px-2.5 py-1.5 rounded-lg border border-outline-variant/30 shadow-xs">
                  🅿️ PayPal
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-error/10 text-error rounded-xl text-xs font-medium border border-error/20">
                {errorMessage}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="lg"
                className="w-1/3 cursor-pointer"
                disabled={isLoading}
                onClick={() => setStep(2)}
              >
                Atrás
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="w-2/3 flex items-center justify-center gap-2 cursor-pointer shadow-md bg-primary hover:bg-primary/90"
                disabled={isLoading}
                onClick={handleLaunchCheckout}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Iniciando checkout...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Pagar {totalWithVat.toFixed(2)}€/mes</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Success & Activation */}
        {step === 4 && (
          <div className="flex flex-col items-center text-center gap-5 py-4 animate-in zoom-in-95 duration-300">
            <div className="w-18 h-18 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shadow-lg ring-8 ring-emerald-50 dark:ring-emerald-950/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
                ¡Plan Activado!
              </span>
              <h3 className="text-2xl font-bold text-on-surface mt-2">
                Bienvenido a Volta Plan {PLAN_CONFIGS[selectedPlan].name}
              </h3>
              <p className="text-sm text-on-surface-variant mt-1.5 max-w-md">
                Tu suscripción ha sido procesada con éxito. Ya tienes acceso completo a todas las
                herramientas de tu plan.
              </p>
            </div>

            <div className="w-full bg-surface-container rounded-xl p-4 text-xs flex flex-col gap-2 border border-outline-variant/30 text-left">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Plan contratado:</span>
                <span className="font-bold text-on-surface">Volta {PLAN_CONFIGS[selectedPlan].name} (Mensual)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Trabajadores:</span>
                <span className="font-bold text-on-surface">{totalWorkers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Estado:</span>
                <span className="font-bold text-emerald-600">Activo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Factura emitida por:</span>
                <span className="font-semibold text-on-surface">Lemon Squeezy (MoR)</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full cursor-pointer shadow-md mt-2"
              onClick={onClose}
            >
              Comenzar a Trabajar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
