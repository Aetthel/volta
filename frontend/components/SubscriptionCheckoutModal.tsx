"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";
import { calculatePlanPrice } from "@/lib/permissions";
import { apiClient } from "@/lib/apiClient";
import { PlanSelectionStep } from "./checkout/PlanSelectionStep";
import { BillingInfoStep } from "./checkout/BillingInfoStep";
import { OrderSummaryStep } from "./checkout/OrderSummaryStep";
import { CheckoutSuccessStep } from "./checkout/CheckoutSuccessStep";

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
  }, [isOpen, initialPlan, handleCheckoutSuccess, session?.user?.name, session?.user?.email]);

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

  const pricing = calculatePlanPrice(selectedPlan, totalWorkers, couponApplied ? discountPercent : 0);
  const vatAmount = pricing.total * 0.21;
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
      const res = await apiClient.post<any>("/subscription/checkout-url", {
        plan: selectedPlan,
        totalWorkers,
      });

      if (res.error || !res.data) {
        throw new Error(res.error || "No se pudo iniciar la sesión de pago");
      }

      if (res.data.isMock) {
        const mockRes = await apiClient.post<any>("/subscription/mock-activate", {
          plan: selectedPlan,
        });

        if (mockRes.status === 200) {
          handleCheckoutSuccess();
        } else {
          throw new Error("Error al activar suscripción de prueba");
        }
      } else if (res.data.url) {
        if (window.LemonSqueezy?.Url?.Open) {
          window.LemonSqueezy.Url.Open(res.data.url);
        } else {
          window.location.href = res.data.url;
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
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

        {/* Steps */}
        {step === 1 && (
          <PlanSelectionStep
            selectedPlan={selectedPlan}
            onSelectPlan={handleSelectPlan}
            totalWorkers={totalWorkers}
            setTotalWorkers={setTotalWorkers}
            isTrialing={isTrialing}
            daysLeftInTrial={daysLeftInTrial}
            pricing={pricing}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            couponApplied={couponApplied}
            discountPercent={discountPercent}
            couponError={couponError}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <BillingInfoStep
            legalName={legalName}
            setLegalName={setLegalName}
            taxId={taxId}
            setTaxId={setTaxId}
            billingEmail={billingEmail}
            setBillingEmail={setBillingEmail}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <OrderSummaryStep
            selectedPlan={selectedPlan}
            totalWorkers={totalWorkers}
            pricing={pricing}
            vatAmount={vatAmount}
            totalWithVat={totalWithVat}
            couponApplied={couponApplied}
            discountPercent={discountPercent}
            legalName={legalName}
            taxId={taxId}
            billingEmail={billingEmail}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onBack={() => setStep(2)}
            onLaunchCheckout={handleLaunchCheckout}
          />
        )}

        {step === 4 && (
          <CheckoutSuccessStep
            selectedPlan={selectedPlan}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
