"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSession, signOut } from "next-auth/react";
import { X, Lock, Check, ArrowRight, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/volta-ui";
import {
  LEMON_SQUEEZY_PRODUCT_URLS,
  buildLemonSqueezyCheckoutUrl,
  openLemonSqueezyOverlay,
} from "@/lib/lemonsqueezy";

interface UpgradeProModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  mode?: "pro" | "register";
}

export default function UpgradeProModal({
  isOpen,
  onClose,
  title = "Desbloquea el Plan Pro",
  description = "Para acceder a esta función (multi-calendario/sedes, WhatsApp bidireccional, pagos online o analítica), actualiza tu cuenta a Plan Pro (40€/mes).",
  mode = "pro",
}: UpgradeProModalProps) {
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (!isOpen) return null;

  const isRegisterMode = mode === "register";

  const checkoutUrl = buildLemonSqueezyCheckoutUrl(
    LEMON_SQUEEZY_PRODUCT_URLS.PRO,
    session?.user
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-outline-variant/30 relative flex flex-col gap-6 select-none animate-in zoom-in-95 duration-150">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors cursor-pointer"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge & Icon */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="text-primary flex items-center justify-center">
            {isRegisterMode ? (
              <UserPlus className="w-9 h-9 text-primary" strokeWidth={1.75} />
            ) : (
              <Lock className="w-9 h-9 text-primary" strokeWidth={1.75} />
            )}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
            {isRegisterMode ? "Modo Demostración" : "Ventaja Exclusiva Pro"}
          </span>
          <h3 className="text-2xl font-bold text-on-surface tracking-tight">{title}</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">{description}</p>
        </div>

        {/* Feature List */}
        <div className="bg-surface-container-low rounded-xl p-4 flex flex-col gap-2.5 border border-outline-variant/20">
          {isRegisterMode ? (
            <>
              <div className="flex items-center gap-2.5 text-xs text-on-surface font-medium">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Guarda tus citas, clientes y datos permanentemente</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-on-surface font-medium">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Configura horarios comerciales semanales y festivos</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-on-surface font-medium">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Crea tu catálogo de servicios y precios propios</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-on-surface font-medium">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Enlace público y código de reservas online</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-on-surface font-medium">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>14 días de prueba completa sin tarjeta requerida</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2.5 text-xs text-on-surface font-medium">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Multi-calendario, varias sedes y salas</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-on-surface font-medium">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>2 trabajadores incluidos (+5€ extra)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-on-surface font-medium">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Recordatorios WhatsApp bidireccional</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-on-surface font-medium">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Pagos online (señas y depósitos)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-on-surface font-medium">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Analítica de negocio y soporte prioritario por chat</span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 pt-2">
          {isRegisterMode ? (
            <button
              type="button"
              onClick={async () => {
                onClose();
                await signOut({ callbackUrl: "/register" });
              }}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold shadow-md cursor-pointer bg-primary text-white hover:bg-primary/90 py-3 px-4 rounded-xl transition-colors"
            >
              <span>Crear Cuenta Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <a
              href={checkoutUrl}
              onClick={(e) => {
                onClose();
                openLemonSqueezyOverlay(checkoutUrl, e);
              }}
              className="lemonsqueezy-button w-full flex items-center justify-center gap-2 text-sm font-semibold shadow-md cursor-pointer bg-primary text-white hover:bg-primary/90 py-3 px-4 rounded-xl transition-colors"
            >
              <span>Actualizar a Plan Pro (40€/mes)</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-full text-xs font-medium text-on-surface-variant"
          >
            {isRegisterMode ? "Continuar explorando la demo" : "Continuar en el plan actual"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
