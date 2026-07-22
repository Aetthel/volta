"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Sparkles, AlertTriangle, Clock, ArrowRight, X } from "lucide-react";

function TrialBannerContent() {
  const [isVisible, setIsVisible] = useState(true);
  const { data: session } = useSession();

  const isTrialing = session?.user?.subscriptionStatus === "TRIALING";
  const trialExpiresAtStr = session?.user?.trialExpiresAt;

  if (!isTrialing || !trialExpiresAtStr || !isVisible) {
    return null;
  }

  const expiresDate = new Date(trialExpiresAtStr);
  const now = new Date();
  const diffMs = expiresDate.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const isExpired = daysLeft === 0;
  const isUrgent = daysLeft <= 3 && !isExpired;

  return (
    <div
      className={`w-full py-2 text-body-sm font-medium border-b transition-colors z-20 shrink-0 select-none ${
        isExpired
          ? "bg-error/10 text-error border-error/20"
          : isUrgent
          ? "bg-amber-500/10 text-amber-800 border-amber-500/20"
          : "bg-primary/10 text-primary border-primary/20"
      }`}
    >
      <div className="max-w-container-max mx-auto px-gutter w-full flex items-center justify-between gap-4">
        {/* Icon + Message */}
        <div className="flex items-center gap-2.5 min-w-0">
          {isExpired ? (
            <AlertTriangle className="w-4 h-4 text-error shrink-0" />
          ) : isUrgent ? (
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
          )}

          <div className="truncate">
            {isExpired ? (
              <span>
                <strong>Período de prueba finalizado:</strong> Elige tu suscripción (Plan Básico 18€/mes o Plan Pro 25€/mes) para continuar usando todas las funciones.
              </span>
            ) : isUrgent ? (
              <span>
                <strong>¡Últimos días de prueba!</strong> Te quedan{" "}
                <strong>{daysLeft} día{daysLeft === 1 ? "" : "s"}</strong> de prueba gratuita en Plan Pro (25€/mes).
              </span>
            ) : (
              <span>
                Estás disfrutando de <strong>14 días de prueba gratuita del Plan Pro (25€/mes)</strong>. Te quedan{" "}
                <strong>{daysLeft} día{daysLeft === 1 ? "" : "s"}</strong>.
              </span>
            )}
          </div>
        </div>

        {/* Action Button & Dismiss */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/ajustes">
            <button
              className={`py-1 px-3 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                isExpired
                  ? "bg-error text-white hover:bg-error/90"
                  : isUrgent
                  ? "border border-amber-600/40 text-amber-900 hover:bg-amber-500/10"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
            >
              <span>Seleccionar Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Cerrar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
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
