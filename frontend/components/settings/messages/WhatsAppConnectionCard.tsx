"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Loader2, Lock, QrCode } from "lucide-react";
import type { ToastState } from "@/types/settings";
import dynamic from "next/dynamic";
import { Button, Badge } from "@/components/ui/volta-ui";
import { SectionHeading } from "../SectionHeading";
import { apiClient } from "@/lib/apiClient";

const UpgradeProModal = dynamic(() => import("@/components/UpgradeProModal"), {
  ssr: false,
});

interface WhatsAppConnectionCardProps {
  businessId: string;
  hasWhatsApp: boolean;
  setToast: (toast: ToastState) => void;
}

export const WhatsAppConnectionCard: React.FC<WhatsAppConnectionCardProps> = ({
  businessId,
  hasWhatsApp,
  setToast,
}) => {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState("DISCONNECTED");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);

  const fetchWhatsappStatus = useCallback(async () => {
    if (!businessId || businessId === "mock-business-id" || !hasWhatsApp) return;
    try {
      const res = await apiClient.whatsapp.getStatus<any>(businessId);
      if (res.data && !res.data.error) {
        setWhatsappStatus(res.data.status);
        setQrCode(res.data.qrCode);
        setPollingActive(res.data.status === "WAITING_QR");
      }
    } catch {}
  }, [businessId, hasWhatsApp]);

  useEffect(() => {
    fetchWhatsappStatus();
  }, [fetchWhatsappStatus]);

  useEffect(() => {
    if (!pollingActive || !businessId || !hasWhatsApp) return;
    const interval = setInterval(async () => {
      try {
        const res = await apiClient.whatsapp.getStatus<any>(businessId);
        if (res.data && !res.data.error) {
          setWhatsappStatus(res.data.status);
          setQrCode(res.data.qrCode);
          if (res.data.status === "CONNECTED" || res.data.status === "DISCONNECTED") {
            setPollingActive(false);
            setQrCode(null);
          }
        }
      } catch {}
    }, 4000);
    return () => clearInterval(interval);
  }, [pollingActive, businessId, hasWhatsApp]);

  const handleConnectWhatsapp = async () => {
    if (!hasWhatsApp) {
      setIsUpgradeOpen(true);
      return;
    }
    setLoadingQr(true);
    try {
      await apiClient.whatsapp.init(businessId);
      setWhatsappStatus("WAITING_QR");
      setPollingActive(true);
    } finally {
      setLoadingQr(false);
    }
  };

  const handleDisconnectWhatsapp = async () => {
    if (
      !window.confirm(
        "¿Seguro que deseas desconectar tu cuenta de WhatsApp? Se detendrán los recordatorios automáticos."
      )
    ) {
      return;
    }
    try {
      await apiClient.whatsapp.disconnect(businessId);
      setWhatsappStatus("DISCONNECTED");
      setQrCode(null);
      setPollingActive(false);
      setToast({ show: true, text: "WhatsApp desconectado correctamente." });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    } catch {}
  };

  return (
    <>
      <section className="pb-8 border-b border-outline-variant/50">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <SectionHeading
            icon={MessageSquare}
            headingLevel={2}
            title="Canal de Mensajería WhatsApp"
            description={
              hasWhatsApp
                ? "Vincula tu cuenta de WhatsApp para enviar recordatorios automáticos 24h antes y confirmaciones inmediatas a los clientes."
                : "Los recordatorios interactivos y confirmaciones por WhatsApp Bot están incluidos en el Plan Pro."
            }
            className="mb-0"
            trailing={
              <>
                {whatsappStatus === "CONNECTED" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Conectado y Activo
                  </span>
                ) : whatsappStatus === "WAITING_QR" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    Esperando Escaneo QR
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container text-on-surface-variant border border-outline-variant/60">
                    <span className="w-2 h-2 rounded-full bg-on-surface-variant/40" />
                    Desconectado
                  </span>
                )}

                {!hasWhatsApp && (
                  <Badge
                    variant="outline"
                    className="text-label-sm font-bold text-primary border-primary/30"
                  >
                    PLAN PRO
                  </Badge>
                )}
              </>
            }
          />

          {/* Connection Action Button */}
          <div className="flex items-center gap-3 shrink-0 self-stretch md:self-auto md:mt-0.5 justify-end">
            {!hasWhatsApp ? (
              <Button
                variant="default"
                size="md"
                onClick={() => setIsUpgradeOpen(true)}
                className="flex items-center gap-2 font-medium"
              >
                <Lock className="w-4 h-4" />
                <span>Desbloquear con Plan Pro</span>
              </Button>
            ) : whatsappStatus === "CONNECTED" ? (
              <Button
                variant="outline"
                size="md"
                onClick={handleDisconnectWhatsapp}
                className="text-error hover:text-error hover:bg-error/10 border-error/30 font-medium"
              >
                Desconectar cuenta
              </Button>
            ) : whatsappStatus === "WAITING_QR" ? (
              <Button
                variant="outline"
                size="md"
                onClick={handleDisconnectWhatsapp}
                className="font-medium"
              >
                Cancelar vinculación
              </Button>
            ) : (
              <Button
                variant="default"
                size="md"
                onClick={handleConnectWhatsapp}
                disabled={loadingQr}
                className="flex items-center gap-2 font-medium"
              >
                {loadingQr ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Iniciando vinculación...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>Vincular con Código QR</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* QR Code Container (when WAITING_QR) */}
        {hasWhatsApp && whatsappStatus === "WAITING_QR" && (
          <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Fondo blanco obligatorio: es lo que hace escaneable el QR. */}
            <div className="bg-white p-4 rounded-2xl border border-outline-variant shadow-sm flex flex-col items-center">
              {qrCode ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={
                    qrCode.startsWith("data:")
                      ? qrCode
                      : `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrCode)}`
                  }
                  alt="Código QR WhatsApp"
                  className="w-48 h-48 rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 flex flex-col items-center justify-center gap-2 bg-surface-container-low rounded-lg">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <span className="text-xs font-semibold text-on-surface-variant">
                    Generando código QR...
                  </span>
                </div>
              )}
              <span className="text-label-sm font-semibold text-on-surface-variant/70 mt-2.5">
                Se actualiza automáticamente
              </span>
            </div>

            <div className="flex flex-col gap-3 max-w-sm text-sm">
              <span className="font-bold text-on-surface text-base">
                Pasos para sincronizar en tu móvil:
              </span>
              <ol className="flex flex-col gap-2 text-on-surface-variant text-xs leading-relaxed list-decimal list-inside">
                <li>Abre WhatsApp en tu teléfono.</li>
                <li>
                  Toca en <strong>Ajustes</strong> o <strong>Menú (⋮)</strong> y selecciona{" "}
                  <strong>Dispositivos vinculados</strong>.
                </li>
                <li>
                  Pulsa en <strong>Vincular un dispositivo</strong> y apunta tu cámara al código QR.
                </li>
              </ol>
            </div>
          </div>
        )}
      </section>

      <UpgradeProModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        title="Automatización de WhatsApp"
        description="Conecta el bot interactivo de WhatsApp 2 vías y envía confirmaciones inmediatas y recordatorios automáticos actualizando al Plan Pro (40€/mes)."
      />
    </>
  );
};
