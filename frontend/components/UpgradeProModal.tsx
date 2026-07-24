"use client";

import { X, Sparkles, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/volta-ui";

interface UpgradeProModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function UpgradeProModal({
  isOpen,
  onClose,
  title = "Desbloquea el Plan Pro",
  description = "Para acceder a esta función (multisede, miembros ilimitados o recordatorios por WhatsApp), actualiza tu cuenta a Plan Pro (25€/mes).",
}: UpgradeProModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-outline-variant/30 relative flex flex-col gap-6 select-none">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge & Icon */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
            Ventaja Exclusiva Pro
          </span>
          <h3 className="text-2xl font-bold text-on-surface tracking-tight">{title}</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">{description}</p>
        </div>

        {/* Feature List */}
        <div className="bg-surface-container-low rounded-xl p-4 flex flex-col gap-2.5 border border-outline-variant/20">
          <div className="flex items-center gap-2.5 text-xs text-on-surface font-medium">
            <Check className="w-4 h-4 text-primary shrink-0" />
            <span>Trabajadores y agendas ilimitadas</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-on-surface font-medium">
            <Check className="w-4 h-4 text-primary shrink-0" />
            <span>Automatización de WhatsApp 2 vías</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-on-surface font-medium">
            <Check className="w-4 h-4 text-primary shrink-0" />
            <span>Gestión multisede y analítica avanzada</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 pt-2">
          <Link href="/ajustes">
            <Button
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold shadow-md"
            >
              <span>Actualizar a Plan Pro (25€/mes)</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Continuar en el plan actual
          </button>
        </div>
      </div>
    </div>
  );
}
