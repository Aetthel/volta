"use client";

import React from "react";
import { CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/volta-ui";
import { PLAN_CONFIGS } from "@/lib/permissions";

interface CheckoutSuccessStepProps {
  selectedPlan: "BASIC" | "PRO";
  onClose: () => void;
}

export const CheckoutSuccessStep: React.FC<CheckoutSuccessStepProps> = ({
  selectedPlan,
  onClose,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-5 py-6 animate-in zoom-in-95 duration-200">
      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-2xl font-bold text-on-surface">¡Suscripción Activada con Éxito!</h3>
        <p className="text-sm text-on-surface-variant max-w-sm">
          Tu plan <strong>{PLAN_CONFIGS[selectedPlan].name}</strong> ya está activo. Tienes acceso completo a todas las funcionalidades contratadas.
        </p>
      </div>

      <div className="p-4 bg-surface-container rounded-xl w-full flex items-center justify-between text-xs font-semibold text-on-surface">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span>Estado del Plan:</span>
        </div>
        <span className="text-emerald-600 font-bold">ACTIVO</span>
      </div>

      <Button variant="default" size="lg" onClick={onClose} className="w-full font-bold">
        Acceder a mi Panel de Volta
      </Button>
    </div>
  );
};
