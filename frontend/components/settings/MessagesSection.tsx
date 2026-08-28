"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { MessageSquare, Send, Loader2, Save, Lock } from "lucide-react";
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
import { hasFeatureAccess } from "@/lib/permissions";

const UpgradeProModal = dynamic(() => import("@/components/UpgradeProModal"), {
  ssr: false,
});

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
  const { data: session } = useSession();
  const subscriptionPlan = session?.user?.subscriptionPlan || "BASIC";
  const subscriptionStatus = session?.user?.subscriptionStatus || "ACTIVE";
  const hasWhatsApp = hasFeatureAccess(subscriptionPlan, subscriptionStatus, "whatsappTwoWayBot");

  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
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
    if (!businessId || businessId === "mock-business-id" || !hasWhatsApp) return;
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
  }, [businessId, hasWhatsApp]);

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
    if (!pollingActive || !businessId || !hasWhatsApp) return;
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
  }, [pollingActive, businessId, hasWhatsApp]);

  const handleConnectWhatsapp = () => {
    if (!hasWhatsApp) {
      setIsUpgradeOpen(true);
      return;
    }
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
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-gutter animate-in fade-in duration-200">
        {/* WhatsApp Connection Card */}
        <Card className="sm:col-span-2 lg:col-span-5 flex flex-col justify-between min-h-0 sm:min-h-[420px]">
          <div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-primary flex items-center gap-2">
                  <MessageSquare />
                  <span>Canal de WhatsApp</span>
                </CardTitle>
                {!hasWhatsApp && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>PRO</span>
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:gap-6">
                {!hasWhatsApp ? (
                  <div className="flex flex-col gap-3 py-2">
                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex flex-col gap-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-primary">
                        <Lock className="w-4 h-4" />
                        <span>Función Exclusiva del Plan Pro (40€/mes)</span>
                      </div>
                      <p className="text-on-surface-variant leading-relaxed">
                        La automatización y recordatorios interactivos por WhatsApp 2 vías están disponibles en el Plan Pro. En tu Plan Básico actual, las notificaciones y recordatorios se gestionan por Email y SMS.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-md border border-outline-variant/50 opacity-60">
                      <div className="h-3 w-3 rounded-full bg-on-surface-variant/40 shrink-0"></div>
                      <div>
                        <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                          Desconectado
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Requiere Plan Pro
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
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
                              src={
                                qrCode.startsWith("data:")
                                  ? qrCode
                                  : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`
                              }
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
                  </>
                )}
              </div>
            </CardContent>
          </div>
          <CardFooter className="pt-0">
            {!hasWhatsApp ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsUpgradeOpen(true)}
                className="w-full py-3 flex items-center justify-center gap-2 font-medium cursor-pointer shadow-sm"
              >
                <Lock className="w-4 h-4" />
                <span>Desbloquear WhatsApp con Plan Pro</span>
              </Button>
            ) : whatsappStatus === "CONNECTED" ? (
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
                className="w-full py-3 flex items-center justify-center gap-2 active:scale-[0.98] font-medium cursor-pointer"
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

        {/* Templates Configuration Card */}
        <Card className="sm:col-span-2 lg:col-span-7 flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-on-surface flex items-center gap-2">
                <Send />
                <span>Plantillas de Notificación</span>
              </CardTitle>
              {!isEditingTemplates ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingTemplates(true)}
                  className="font-medium"
                >
                  Editar plantillas
                </Button>
              ) : null}
            </CardHeader>
            <CardContent>
              <form id="templates-form" onSubmit={handleSaveTemplates}>
                <FieldGroup className="gap-6">
                  {/* Bienvenida */}
                  <Field>
                    <FieldLabel htmlFor="welcome-msg">Mensaje de Bienvenida y Consentimiento LOPD</FieldLabel>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">
                      Se enviará cuando des de alta a un cliente nuevo. Usa variables como{" "}
                      <Badge variant="secondary" className="font-mono text-[10px] mx-1">
                        {"{nombre}"}
                      </Badge>{" "}
                      o{" "}
                      <Badge variant="secondary" className="font-mono text-[10px] mx-1">
                        {"{link_lopd}"}
                      </Badge>
                      .
                    </p>
                    <textarea
                      id="welcome-msg"
                      rows={3}
                      disabled={!isEditingTemplates}
                      value={templates.welcomeMessage}
                      onChange={(e) =>
                        setTemplates((prev) => ({ ...prev, welcomeMessage: e.target.value }))
                      }
                      placeholder={`Hola {nombre}, bienvenido/a a ${profileName}. Por favor confirma la política de privacidad en: {link_lopd}`}
                      className="w-full rounded-md border border-outline-variant bg-surface p-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-surface-container-low disabled:text-on-surface-variant"
                    />
                  </Field>

                  {/* Recordatorio */}
                  <Field>
                    <FieldLabel htmlFor="reminder-msg">Mensaje de Recordatorio de Cita</FieldLabel>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">
                      Se enviará 24 horas antes de la cita. Usa variables como{" "}
                      <Badge variant="secondary" className="font-mono text-[10px] mx-1">
                        {"{nombre}"}
                      </Badge>
                      ,{" "}
                      <Badge variant="secondary" className="font-mono text-[10px] mx-1">
                        {"{fecha}"}
                      </Badge>
                      ,{" "}
                      <Badge variant="secondary" className="font-mono text-[10px] mx-1">
                        {"{hora}"}
                      </Badge>{" "}
                      o{" "}
                      <Badge variant="secondary" className="font-mono text-[10px] mx-1">
                        {"{servicio}"}
                      </Badge>
                      .
                    </p>
                    <textarea
                      id="reminder-msg"
                      rows={3}
                      disabled={!isEditingTemplates}
                      value={templates.reminderMessage}
                      onChange={(e) =>
                        setTemplates((prev) => ({ ...prev, reminderMessage: e.target.value }))
                      }
                      placeholder={`Hola {nombre}, te recordamos tu cita de {servicio} para mañana a las {hora}. ¡Te esperamos en ${profileName}!`}
                      className="w-full rounded-md border border-outline-variant bg-surface p-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-surface-container-low disabled:text-on-surface-variant"
                    />
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </div>
          {isEditingTemplates && (
            <CardFooter className="flex justify-end gap-3 border-t border-outline-variant/30 pt-4">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsEditingTemplates(false)}
                disabled={savingTemplates}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                form="templates-form"
                disabled={savingTemplates}
                className="flex items-center gap-2"
              >
                {savingTemplates ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Guardar cambios</span>
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Upgrade Pro Modal */}
      <UpgradeProModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        title="Automatización de WhatsApp"
        description="Conecta el bot interactivo de WhatsApp 2 vías y envía confirmaciones inmediatas y recordatorios automáticos actualizando al Plan Pro (40€/mes)."
      />
    </>
  );
}
