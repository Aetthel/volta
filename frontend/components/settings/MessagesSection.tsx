"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, Send, Loader2, Save } from "lucide-react";
import type { MessageTemplates, ToastState } from "@/types/settings";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  FloatingInput,
  Button,
  Badge,
  FieldGroup,
  Field,
  FieldLabel,
  Skeleton,
} from "@/components/ui/volta-ui";

interface MessagesSectionProps {
  businessId: string;
  profileName: string;
  setToast: (toast: ToastState) => void;
}

export default function MessagesSection({
  businessId,
  profileName,
  setToast,
}: MessagesSectionProps) {
  const [whatsappStatus, setWhatsappStatus] = useState("DISCONNECTED");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);

  const [templates, setTemplates] = useState<MessageTemplates>({
    welcomeMessage: "",
    reminderMessage: "",
  });
  const [isEditingTemplates, setIsEditingTemplates] = useState(false);
  const [savingTemplates, setSavingTemplates] = useState(false);

  const fetchWhatsappStatus = useCallback(() => {
    if (!businessId || businessId === "mock-business-id") return;
    fetch(`/api/backend/whatsapp/status?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setWhatsappStatus(data.status);
          setQrCode(data.qrCode);
          setPollingActive(data.status === "WAITING_QR");
        }
      })
      .catch(() => {});
  }, [businessId]);

  const fetchTemplates = useCallback(() => {
    if (!businessId || businessId === "mock-business-id") return;
    fetch(`/api/backend/whatsapp/templates?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setTemplates({
            welcomeMessage: data.welcomeMessage || "",
            reminderMessage: data.reminderMessage || "",
          });
        }
      })
      .catch(() => {});
  }, [businessId]);

  useEffect(() => {
    fetchWhatsappStatus();
    fetchTemplates();
  }, [fetchWhatsappStatus, fetchTemplates]);

  useEffect(() => {
    if (!pollingActive || !businessId) return;
    const interval = setInterval(() => {
      fetch(`/api/backend/whatsapp/status?businessId=${businessId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setWhatsappStatus(data.status);
            setQrCode(data.qrCode);
            if (data.status === "CONNECTED" || data.status === "DISCONNECTED") {
              setPollingActive(false);
              setQrCode(null);
            }
          }
        })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [pollingActive, businessId]);

  const handleConnectWhatsapp = () => {
    setLoadingQr(true);
    fetch("/api/backend/whatsapp/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId }),
    })
      .then((res) => res.json())
      .then(() => {
        setWhatsappStatus("WAITING_QR");
        setPollingActive(true);
        setLoadingQr(false);
      })
      .catch(() => setLoadingQr(false));
  };

  const handleDisconnectWhatsapp = () => {
    if (
      !window.confirm(
        "¿Seguro que deseas desconectar tu cuenta de WhatsApp? Se detendrán los mensajes automáticos."
      )
    )
      return;
    fetch("/api/backend/whatsapp/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId }),
    })
      .then((res) => res.json())
      .then(() => {
        setWhatsappStatus("DISCONNECTED");
        setQrCode(null);
        setPollingActive(false);
        setToast({ show: true, text: "WhatsApp desconectado correctamente." });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);
      })
      .catch(() => {});
  };

  const handleSaveTemplates = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTemplates(true);
    fetch("/api/backend/whatsapp/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, ...templates }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save templates");
        return res.json();
      })
      .then(() => {
        setIsEditingTemplates(false);
        setToast({ show: true, text: "Plantillas guardadas correctamente." });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);
      })
      .catch(() => {})
      .finally(() => setSavingTemplates(false));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-gutter animate-in fade-in duration-200">
      {/* WhatsApp Connection Card */}
      <Card className="sm:col-span-2 lg:col-span-5 flex flex-col justify-between min-h-0 sm:min-h-[420px]">
        <div>
          <CardHeader className="pb-4">
            <CardTitle className="text-primary flex items-center gap-2">
              <MessageSquare />
              <span>Canal de WhatsApp</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-md border border-outline-variant/50">
                {whatsappStatus === "CONNECTED" ? (
                  <>
                    <div className="relative flex h-3 w-3 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/70 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </div>
                    <div>
                      <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                        Conectado
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Mensajería activa
                      </p>
                    </div>
                  </>
                ) : whatsappStatus === "WAITING_QR" ? (
                  <>
                    <div className="relative flex h-3 w-3 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error-container/70 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
                    </div>
                    <div>
                      <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                        Esperando escaneo
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Escanea el código QR
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-3 w-3 rounded-full bg-on-surface-variant/40 shrink-0"></div>
                    <div>
                      <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                        Desconectado
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Sin vinculación activa
                      </p>
                    </div>
                  </>
                )}
              </div>

              {whatsappStatus === "WAITING_QR" ? (
                <div className="flex flex-col items-center justify-center py-2 animate-in fade-in duration-200">
                  {qrCode ? (
                    <div className="flex flex-col items-center bg-white p-4 rounded-md border border-outline-variant shadow-sm max-w-[240px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`}
                        alt="WhatsApp QR Code"
                        className="w-[180px] h-[180px]"
                      />
                      <span className="text-[11px] font-medium text-on-surface-variant mt-2 text-center">
                        Código QR de sincronización
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md border border-outline-variant shadow-sm w-[212px] h-[224px]">
                      <Skeleton className="w-[180px] h-[180px] rounded" />
                      <span className="text-[11px] font-medium text-on-surface-variant mt-2 text-center animate-pulse">
                        Generando QR...
                      </span>
                    </div>
                  )}
                  <div className="mt-4 text-center">
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed max-w-[260px] mx-auto">
                      Abre WhatsApp en tu teléfono, ve a <strong>Dispositivos vinculados</strong> y
                      escanea el código QR.
                    </p>
                  </div>
                </div>
              ) : whatsappStatus === "CONNECTED" ? (
                <div className="flex flex-col justify-center py-4 text-center">
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-[280px] mx-auto mb-4">
                    Tu cuenta de WhatsApp se encuentra vinculada correctamente. Las confirmaciones
                    de citas y recordatorios se enviarán de forma automática a tus clientes.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col justify-center py-4 text-center">
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-[280px] mx-auto mb-4">
                    Vincula tu número de WhatsApp para poder enviar confirmaciones inmediatas al
                    agendar citas y recordatorios automáticos 24 horas antes del servicio.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </div>
        <CardFooter className="pt-0">
          {whatsappStatus === "CONNECTED" ? (
            <Button
              variant="outline"
              size="lg"
              onClick={handleDisconnectWhatsapp}
              className="w-full py-3 border-error text-error hover:bg-error-container/20 shadow-none font-medium"
            >
              Desconectar cuenta
            </Button>
          ) : whatsappStatus === "WAITING_QR" ? (
            <Button
              variant="outline"
              size="lg"
              onClick={handleDisconnectWhatsapp}
              className="w-full py-3 text-on-surface-variant hover:bg-surface-container shadow-none font-medium"
            >
              Cancelar vinculación
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleConnectWhatsapp}
              disabled={loadingQr}
              className="w-full py-3 flex items-center justify-center gap-2 active:scale-[0.98] font-medium"
            >
              {loadingQr ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span>Iniciando...</span>
                </>
              ) : (
                <span>Vincular WhatsApp</span>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Message Templates Editor Card */}
      <Card className="sm:col-span-2 lg:col-span-7 flex flex-col justify-between">
        <div>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-primary flex items-center gap-2">
              <Send />
              <span>Plantillas de Mensajería</span>
            </CardTitle>
            {!isEditingTemplates ? (
              <Button
                variant="ghost"
                onClick={() => setIsEditingTemplates(true)}
                className="text-primary hover:text-primary-container font-label-lg text-label-lg transition-all hover:underline p-0 shadow-none active:scale-100 font-medium"
              >
                Editar plantillas
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsEditingTemplates(false);
                    fetchTemplates();
                  }}
                  className="text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all hover:underline px-0 shadow-none active:scale-100 font-medium"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSaveTemplates}
                  disabled={savingTemplates}
                  className="flex items-center gap-1 px-4 py-2 font-medium"
                >
                  {savingTemplates ? <Loader2 className="animate-spin" /> : <Save />}
                  <span>Guardar</span>
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4 sm:gap-6">
              <FieldGroup className="gap-4 sm:gap-6">
                <Field>
                  <div className="flex justify-between items-center w-full">
                    <FieldLabel>Mensaje de Bienvenida / Confirmación</FieldLabel>
                    <Badge variant="secondary">Inmediato</Badge>
                  </div>
                  <textarea
                    disabled={!isEditingTemplates}
                    rows={3}
                    value={templates.welcomeMessage}
                    onChange={(e) =>
                      setTemplates((prev) => ({ ...prev, welcomeMessage: e.target.value }))
                    }
                    className="w-full border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface disabled:opacity-75 disabled:cursor-not-allowed resize-none custom-scrollbar"
                    placeholder="Escribe el mensaje de confirmación..."
                  />
                </Field>
                <Field>
                  <div className="flex justify-between items-center w-full">
                    <FieldLabel>Mensaje de Recordatorio</FieldLabel>
                    <Badge variant="secondary">Sentinel (24h antes)</Badge>
                  </div>
                  <textarea
                    disabled={!isEditingTemplates}
                    rows={3}
                    value={templates.reminderMessage}
                    onChange={(e) =>
                      setTemplates((prev) => ({ ...prev, reminderMessage: e.target.value }))
                    }
                    className="w-full border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface disabled:opacity-75 disabled:cursor-not-allowed resize-none custom-scrollbar"
                    placeholder="Escribe el mensaje de recordatorio..."
                  />
                </Field>
              </FieldGroup>

              <div className="bg-surface-container-low p-4 rounded-md border border-outline-variant/50">
                <p className="font-label-md text-label-md text-on-surface font-semibold mb-2">
                  Variables dinámicas disponibles:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "{{clientName}}",
                    "{{appointmentDate}}",
                    "{{appointmentTime}}",
                    "{{businessName}}",
                  ].map((v) => (
                    <span
                      key={v}
                      className="bg-surface-container-lowest border border-outline-variant text-[11px] px-2 py-1 rounded font-mono select-all cursor-pointer"
                      title={
                        v === "{{clientName}}"
                          ? "Nombre del cliente"
                          : v === "{{appointmentDate}}"
                            ? "Fecha de la cita"
                            : v === "{{appointmentTime}}"
                              ? "Hora de la cita"
                              : "Nombre comercial"
                      }
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider block mb-2">
                  Vista previa del mensaje de bienvenida:
                </span>
                <div className="bg-[#efeae2] p-4 rounded-md border border-outline-variant font-sans relative">
                  <div className="bg-white rounded-lg p-3 shadow-sm text-body-md text-on-surface max-w-[85%] relative border border-outline-variant/20">
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
                      {templates.welcomeMessage ? (
                        templates.welcomeMessage
                          .replace(/{{clientName}}/g, "Ana García")
                          .replace(/{{appointmentDate}}/g, "lunes 8 de junio")
                          .replace(/{{appointmentTime}}/g, "10:00")
                          .replace(/{{businessName}}/g, profileName || "Glow")
                      ) : (
                        <span className="text-on-surface-variant italic">
                          No hay plantilla configurada para bienvenida.
                        </span>
                      )}
                    </p>
                    <span className="text-[10px] text-on-surface-variant float-right mt-1">
                      12:00
                    </span>
                    <div className="clear-both" />
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
