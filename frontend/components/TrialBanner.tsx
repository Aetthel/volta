"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import {
  Sparkles,
  AlertTriangle,
  Clock,
  ArrowRight,
  X,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SubscriptionCheckoutModal = dynamic(() => import("./SubscriptionCheckoutModal"), {
  ssr: false,
});

const DISMISS_STORAGE_KEY = "volta_trial_banner_dismissed";

export function TrialBannerContent() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const { data: session } = useSession();

  const subscriptionStatus = session?.user?.subscriptionStatus || "TRIALING";
  const trialExpiresAtStr = session?.user?.trialExpiresAt;
  const sandboxExpiresAtStr = session?.user?.sandboxExpiresAt;

  const isTrialing = subscriptionStatus === "TRIALING";
  const isDemoSandbox = subscriptionStatus === "DEMO_SANDBOX";
  const isPastDue = subscriptionStatus === "PAST_DUE";

  // Check dismissal in sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem(DISMISS_STORAGE_KEY) === "true";
      setIsDismissed(dismissed);
    }
  }, []);

  // Update timer every second for Demo Sandbox or countdown accuracy
  useEffect(() => {
    if (!isDemoSandbox && !isTrialing) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isDemoSandbox, isTrialing]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(DISMISS_STORAGE_KEY, "true");
    }
  };

  // Demo Sandbox calculations
  const sandboxDetails = useMemo(() => {
    if (!isDemoSandbox) return null;
    const expiresMs = sandboxExpiresAtStr
      ? new Date(sandboxExpiresAtStr).getTime()
      : now + 20 * 60 * 1000;
    const diffMs = Math.max(0, expiresMs - now);
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    const isEndingSoon = mins < 5;
    return {
      formattedTime: `${mins}:${secs.toString().padStart(2, "0")}`,
      isEndingSoon,
    };
  }, [isDemoSandbox, sandboxExpiresAtStr, now]);

  // Regular Trial calculations
  const trialDetails = useMemo(() => {
    if (!isTrialing || !trialExpiresAtStr) return null;
    const expiresMs = new Date(trialExpiresAtStr).getTime();
    const diffMs = expiresMs - now;
    const totalDays = 14;
    const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const hoursLeft = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

    const isExpired = diffMs <= 0;
    const isUrgent = daysLeft <= 3 && !isExpired;
    const progressPercent = Math.min(100, Math.max(0, ((totalDays - daysLeft) / totalDays) * 100));

    return {
      daysLeft,
      hoursLeft,
      isExpired,
      isUrgent,
      progressPercent,
    };
  }, [isTrialing, trialExpiresAtStr, now]);

  // Don't render for active paying users or non-applicable statuses
  if (!isTrialing && !isDemoSandbox && !isPastDue) {
    return null;
  }

  // If user dismissed and it's not urgent or expired, don't show
  if (isDismissed && !trialDetails?.isExpired && !trialDetails?.isUrgent && !sandboxDetails?.isEndingSoon) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          "w-full transition-all duration-300 z-30 shrink-0 select-none border-b",
          // Demo Sandbox Styling
          isDemoSandbox &&
            (sandboxDetails?.isEndingSoon
              ? "bg-amber-500/10 text-amber-950 dark:text-amber-100 border-amber-500/30"
              : "bg-primary/10 text-primary border-primary/20"),
          // Trial Styling
          isTrialing &&
            (trialDetails?.isExpired
              ? "bg-error/10 text-error border-error/30"
              : trialDetails?.isUrgent
                ? "bg-amber-500/15 text-amber-950 dark:text-amber-100 border-amber-500/30"
                : "bg-surface-container-low/90 backdrop-blur-md text-on-surface border-outline-variant/40"),
          // Past due Styling
          isPastDue && "bg-error/10 text-error border-error/30"
        )}
      >
        <div className="max-w-container-max mx-auto px-4 sm:px-gutter py-2.5 flex items-center justify-between gap-3">
          {/* Left: Icon + Content */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Dynamic Status Icon */}
            <div className="shrink-0 flex items-center justify-center">
              {isDemoSandbox ? (
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                  <Zap className="w-4 h-4" />
                </div>
              ) : trialDetails?.isExpired || isPastDue ? (
                <div className="w-7 h-7 rounded-lg bg-error/20 flex items-center justify-center text-error">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              ) : trialDetails?.isUrgent ? (
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-300 relative">
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <Clock className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Message */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
              {/* Badge Tag */}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider shrink-0 w-fit",
                  isDemoSandbox
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : trialDetails?.isExpired
                      ? "bg-error text-white"
                      : trialDetails?.isUrgent
                        ? "bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/40"
                        : "bg-primary/15 text-primary border border-primary/25"
                )}
              >
                {isDemoSandbox
                  ? `Sesión Demo: ${sandboxDetails?.formattedTime}`
                  : trialDetails?.isExpired
                    ? "Prueba Caducada"
                    : trialDetails?.isUrgent
                      ? `Quedan ${trialDetails.daysLeft} días`
                      : "Prueba Plan Pro"}
              </span>

              {/* Description */}
              <p className="text-xs sm:text-sm font-medium text-on-surface truncate">
                {isDemoSandbox ? (
                  <span>
                    Estás en un entorno de pruebas efímero. Activa tu plan para conservar tus cambios y datos.
                  </span>
                ) : trialDetails?.isExpired ? (
                  <span>
                    Tu período de prueba ha finalizado. Elige tu plan mensual para seguir gestionando tu negocio.
                  </span>
                ) : trialDetails?.isUrgent ? (
                  <span>
                    ¡Últimos días! Te quedan <strong>{trialDetails.daysLeft} días</strong> de prueba gratuita en Plan Pro (25€/mes).
                  </span>
                ) : (
                  <span>
                    Disfrutas de <strong>14 días de prueba gratuita</strong>. Te quedan{" "}
                    <strong>
                      {trialDetails?.daysLeft} día{trialDetails?.daysLeft === 1 ? "" : "s"}
                    </strong>
                    .
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              className={cn(
                "py-1.5 px-3.5 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer select-none",
                trialDetails?.isExpired
                  ? "bg-error text-white hover:bg-error/90 active:scale-95"
                  : trialDetails?.isUrgent
                    ? "bg-amber-600 hover:bg-amber-700 text-white active:scale-95 shadow-amber-600/20"
                    : "bg-primary text-white hover:opacity-90 active:scale-95"
              )}
            >
              <span>{trialDetails?.isExpired ? "Activar Suscripción" : "Seleccionar Plan"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {!trialDetails?.isExpired && (
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1.5 rounded-lg text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                aria-label="Cerrar aviso temporalmente"
                title="Cerrar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <SubscriptionCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        initialPlan="PRO"
      />
    </>
  );
}

export default function TrialBanner() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof window === "undefined") {
    return null;
  }

  return <TrialBannerContent />;
}
