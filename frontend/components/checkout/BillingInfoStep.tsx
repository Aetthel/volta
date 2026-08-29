"use client";

import React from "react";
import { Building2, ArrowRight } from "lucide-react";
import { Button, FloatingInput } from "@/components/ui/volta-ui";

interface BillingInfoStepProps {
  legalName: string;
  setLegalName: (name: string) => void;
  taxId: string;
  setTaxId: (tax: string) => void;
  billingEmail: string;
  setBillingEmail: (email: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const BillingInfoStep: React.FC<BillingInfoStepProps> = ({
  legalName,
  setLegalName,
  taxId,
  setTaxId,
  billingEmail,
  setBillingEmail,
  onBack,
  onNext,
}) => {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-200">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-on-surface">Datos de Facturación</h3>
        <p className="text-sm text-on-surface-variant mt-1">
          Información legal para la emisión de facturas oficiales.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-on-surface block mb-1.5">
            Razón Social o Nombre del Autónomo/Empresa *
          </label>
          <FloatingInput
            label="Nombre o Razón Social"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-on-surface block mb-1.5">
            NIF / CIF / VAT Number (opcional)
          </label>
          <FloatingInput
            label="Ej. B12345678 o 12345678Z"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value.toUpperCase())}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-on-surface block mb-1.5">
            Correo para Facturas y Recibos *
          </label>
          <FloatingInput
            label="email@empresa.com"
            type="email"
            value={billingEmail}
            onChange={(e) => setBillingEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="p-3 bg-surface-container rounded-xl flex items-start gap-2.5 text-xs text-on-surface-variant">
        <Building2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <span>
          Las facturas se generarán automáticamente a través de Lemon Squeezy (Merchant of Record) y se enviarán a tu correo electrónico.
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="lg" onClick={onBack} className="flex-1">
          Atrás
        </Button>
        <Button
          variant="default"
          size="lg"
          onClick={onNext}
          disabled={!legalName.trim() || !billingEmail.trim()}
          className="flex-1 flex items-center justify-center gap-2 font-bold"
        >
          <span>Continuar al Pago</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
