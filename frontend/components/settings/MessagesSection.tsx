"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import {
  MessageSquare,
  Send,
  Loader2,
  Save,
  Lock,
  Smartphone,
  CheckCircle2,
  Sparkles,
  QrCode,
  RefreshCw,
  Clock,
  RotateCcw,
  Check,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import type { MessageTemplates, ToastState } from "@/types/settings";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  Skeleton,
} from "@/components/ui/volta-ui";
import { hasFeatureAccess } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const UpgradeProModal = dynamic(() => import("@/components/UpgradeProModal"), {
  ssr: false,
});

interface MessagesSectionProps {
  businessId: string;
  profileName: string;
  setToast: (toast: ToastState) => void;
}

const DEFAULT_WELCOME = `Hola {nombre}, ¡bienvenido/a a {negocio}! Por favor confirma tu consentimiento de privacidad en: {link_lopd}`;
const DEFAULT_REMINDER = `Hola {nombre}, te recordamos tu cita de {servicio} para {fecha} a las {hora} en {negocio}. ¡Te esperamos!`;

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
  const [savingTemplates, setSavingTemplates] = useState(false);
  const [activeTemplateTab, setActiveTemplateTab] = useState<"reminder" | "welcome">("reminder");

  const reminderTextareaRef = useRef<HTMLTextAreaElement>(null);
  const welcomeTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch status
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

  // Fetch templates
  const fetchTemplates = useCallback(() => {
    if (!businessId || businessId === "mock-business-id") return;
    fetch(`/api/backend/whatsapp/templates?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          const businessTitle = profileName || "nuestro negocio";
          const defWelcome = `Hola {nombre}, bienvenido/a a ${businessTitle}. Por favor confirma tu política de privacidad en: {link_lopd}`;
          const defReminder = `Hola {nombre}, te recordamos tu cita de {servicio} para {fecha} a las {hora}. ¡Te esperamos en ${businessTitle}!`;
          setTemplates({
            welcomeMessage: data.welcomeMessage || defWelcome,
            reminderMessage: data.reminderMessage || defReminder,
          });
        }
      })
      .catch(() => {});
  }, [businessId, profileName]);

  useEffect(() => {
    fetchWhatsappStatus();
    fetchTemplates();
  }, [fetchWhatsappStatus, fetchTemplates]);

  // Poll status when scanning QR
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
    }, 4000);
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
        "¿Seguro que deseas desconectar tu cuenta de WhatsApp? Se detendrán los recordatorios automáticos."
      )
    ) {
      return;
    }
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
        if (!res.ok) throw new Error("Error al guardar plantillas");
        return res.json();
      })
      .then(() => {
        setToast({ show: true, text: "¡Plantillas guardadas correctamente!" });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);
      })
      .catch((err: any) => {
        setToast({ show: true, text: err.message || "Error al guardar plantillas" });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);
      })
      .finally(() => setSavingTemplates(false));
  };

  // Helper to insert variable chip into active textarea
  const insertVariable = (variableTag: string) => {
    const isReminder = activeTemplateTab === "reminder";
    const textarea = isReminder ? reminderTextareaRef.current : welcomeTextareaRef.current;
    if (!textarea) return;

    const currentVal = isReminder ? templates.reminderMessage : templates.welcomeMessage;
    const start = textarea.selectionStart || currentVal.length;
    const end = textarea.selectionEnd || currentVal.length;

    const newVal = currentVal.substring(0, start) + variableTag + currentVal.substring(end);
    setTemplates((prev) => ({
      ...prev,
      [isReminder ? "reminderMessage" : "welcomeMessage"]: newVal,
    }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variableTag.length, start + variableTag.length);
    }, 0);
  };

  // Live preview message resolver (memoized for performance)
  const previewMessage = useMemo(() => {
    const rawTemplate =
      activeTemplateTab === "reminder"
        ? templates.reminderMessage
        : templates.welcomeMessage;
    if (!rawTemplate) return "";
    return rawTemplate
      .replace(/\{nombre\}/g, "María González")
      .replace(/\{servicio\}/g, "Corte y Peinado")
      .replace(/\{fecha\}/g, "mañana, 30 de agosto")
      .replace(/\{hora\}/g, "17:30")
      .replace(/\{negocio\}/g, profileName || "Volta Salón")
      .replace(/\{link_lopd\}/g, "https://volta.app/lopd/c8f91");
  }, [activeTemplateTab, templates.reminderMessage, templates.welcomeMessage, profileName]);

  return (
    <>
      <div className="flex flex-col gap-6 animate-in fade-in duration-200 mt-2">
        {/* 1. WhatsApp Connection Status Card */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs",
                  whatsappStatus === "CONNECTED"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : whatsappStatus === "WAITING_QR"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-primary/10 text-primary"
                )}
              >
                <MessageSquare className="w-6 h-6" strokeWidth={1.8} />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="font-title-lg text-lg font-bold text-on-surface">
                    Canal de Mensajería WhatsApp
                  </h2>
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
                    <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/30">
                      PLAN PRO
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-on-surface-variant/85 leading-relaxed max-w-2xl">
                  {hasWhatsApp
                    ? "Vincula tu cuenta de WhatsApp para enviar recordatorios automáticos 24h antes y confirmaciones inmediatas a los clientes."
                    : "Los recordatorios interactivos y confirmaciones por WhatsApp Bot están incluidos en el Plan Pro."}
                </p>
              </div>
            </div>

            {/* Connection Action Button */}
            <div className="flex items-center gap-3 shrink-0 self-stretch md:self-auto justify-end">
              {!hasWhatsApp ? (
                <Button
                  variant="primary"
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
                  variant="primary"
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
            <div className="mt-6 pt-6 border-t border-outline-variant/40 flex flex-col md:flex-row items-center justify-center gap-8 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-white p-4 rounded-2xl border-2 border-outline-variant/60 shadow-lg flex flex-col items-center">
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
                <span className="text-[11px] font-semibold text-on-surface-variant/70 mt-2.5">
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
        </Card>

        {/* 2. Main 2-Column Grid: Templates Editor (Left) & WhatsApp Live Simulator (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Template Editor (7 cols) */}
          <Card className="lg:col-span-7 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold text-on-surface flex items-center gap-2">
                    <Send className="w-4 h-4 text-primary" />
                    <span>Personalización de Plantillas</span>
                  </CardTitle>
                  <CardDescription>
                    Define el contenido exacto de los mensajes automáticos que recibirán tus clientes.
                  </CardDescription>
                </div>

                {/* Template Selector Tabs */}
                <div className="flex items-center p-1 bg-surface-container-low border border-outline-variant/50 rounded-xl self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTemplateTab("reminder")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                      activeTemplateTab === "reminder"
                        ? "bg-white text-primary shadow-xs border border-outline-variant/40 font-bold"
                        : "text-on-surface-variant/75 hover:text-on-surface"
                    )}
                  >
                    Recordatorio 24h
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTemplateTab("welcome")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                      activeTemplateTab === "welcome"
                        ? "bg-white text-primary shadow-xs border border-outline-variant/40 font-bold"
                        : "text-on-surface-variant/75 hover:text-on-surface"
                    )}
                  >
                    Bienvenida LOPD
                  </button>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={handleSaveTemplates}>
              <CardContent className="flex flex-col gap-4 pt-2">
                {/* Variable Chips Toolbar */}
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-on-surface-variant/80 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      Variables dinámicas (haz clic para insertar)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {activeTemplateTab === "reminder" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => insertVariable("{nombre}")}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-white text-primary border border-outline-variant/60 hover:border-primary hover:bg-primary/5 transition-all active:scale-95 cursor-pointer shadow-2xs"
                        >
                          + {"{nombre}"}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertVariable("{servicio}")}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-white text-primary border border-outline-variant/60 hover:border-primary hover:bg-primary/5 transition-all active:scale-95 cursor-pointer shadow-2xs"
                        >
                          + {"{servicio}"}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertVariable("{fecha}")}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-white text-primary border border-outline-variant/60 hover:border-primary hover:bg-primary/5 transition-all active:scale-95 cursor-pointer shadow-2xs"
                        >
                          + {"{fecha}"}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertVariable("{hora}")}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-white text-primary border border-outline-variant/60 hover:border-primary hover:bg-primary/5 transition-all active:scale-95 cursor-pointer shadow-2xs"
                        >
                          + {"{hora}"}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertVariable("{negocio}")}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-white text-primary border border-outline-variant/60 hover:border-primary hover:bg-primary/5 transition-all active:scale-95 cursor-pointer shadow-2xs"
                        >
                          + {"{negocio}"}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => insertVariable("{nombre}")}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-white text-primary border border-outline-variant/60 hover:border-primary hover:bg-primary/5 transition-all active:scale-95 cursor-pointer shadow-2xs"
                        >
                          + {"{nombre}"}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertVariable("{negocio}")}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-white text-primary border border-outline-variant/60 hover:border-primary hover:bg-primary/5 transition-all active:scale-95 cursor-pointer shadow-2xs"
                        >
                          + {"{negocio}"}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertVariable("{link_lopd}")}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-white text-primary border border-outline-variant/60 hover:border-primary hover:bg-primary/5 transition-all active:scale-95 cursor-pointer shadow-2xs"
                        >
                          + {"{link_lopd}"}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Active Textarea */}
                {activeTemplateTab === "reminder" ? (
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="reminderTextarea"
                      className="text-xs font-semibold text-on-surface"
                    >
                      Texto del Recordatorio (24 horas antes)
                    </label>
                    <textarea
                      ref={reminderTextareaRef}
                      id="reminderTextarea"
                      rows={5}
                      value={templates.reminderMessage}
                      onChange={(e) =>
                        setTemplates((prev) => ({ ...prev, reminderMessage: e.target.value }))
                      }
                      placeholder={DEFAULT_REMINDER}
                      className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans leading-relaxed"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="welcomeTextarea"
                      className="text-xs font-semibold text-on-surface"
                    >
                      Texto de Bienvenida y Consentimiento LOPD
                    </label>
                    <textarea
                      ref={welcomeTextareaRef}
                      id="welcomeTextarea"
                      rows={5}
                      value={templates.welcomeMessage}
                      onChange={(e) =>
                        setTemplates((prev) => ({ ...prev, welcomeMessage: e.target.value }))
                      }
                      placeholder={DEFAULT_WELCOME}
                      className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans leading-relaxed"
                    />
                  </div>
                )}
              </CardContent>

              <CardFooter className="border-t border-outline-variant/40 pt-4 flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (activeTemplateTab === "reminder") {
                      setTemplates((prev) => ({
                        ...prev,
                        reminderMessage: `Hola {nombre}, te recordamos tu cita de {servicio} para {fecha} a las {hora}. ¡Te esperamos en ${profileName || "nuestro negocio"}!`,
                      }));
                    } else {
                      setTemplates((prev) => ({
                        ...prev,
                        welcomeMessage: `Hola {nombre}, bienvenido/a a ${profileName || "nuestro negocio"}. Por favor confirma tu política de privacidad en: {link_lopd}`,
                      }));
                    }
                  }}
                  className="text-xs font-semibold text-on-surface-variant hover:text-primary gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar por defecto</span>
                </Button>

                <Button
                  type="submit"
                  disabled={savingTemplates}
                  variant="primary"
                  size="md"
                  className="flex items-center gap-2 font-medium"
                >
                  {savingTemplates ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Guardar Plantillas</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Right Column: WhatsApp Live Smartphone Simulator (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card className="overflow-hidden border-2 border-outline-variant/60 shadow-md">
              <CardHeader className="bg-surface-container-low pb-3 border-b border-outline-variant/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                      Vista Previa en Vivo
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-on-surface-variant/70">
                    WhatsApp Chat
                  </span>
                </div>
              </CardHeader>

              {/* Smartphone Chat Screen */}
              <div className="bg-[#EFEAE2] dark:bg-[#0b141a] p-4 min-h-[320px] flex flex-col justify-between relative select-none">
                {/* Chat Top Header */}
                <div className="bg-[#005c4b] text-white p-2.5 rounded-xl flex items-center justify-between shadow-sm mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white/20 text-white font-bold flex items-center justify-center text-xs">
                      {profileName ? profileName.charAt(0).toUpperCase() : "V"}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs leading-tight">
                        {profileName || "Volta Negocio"}
                      </span>
                      <span className="text-[10px] text-white/80 leading-tight">en línea</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-semibold">
                    Bot
                  </span>
                </div>

                {/* Message Bubble */}
                <div className="flex flex-col items-end my-auto">
                  <div className="bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] p-3 rounded-2xl rounded-tr-xs shadow-xs max-w-[90%] text-xs leading-relaxed relative break-words">
                    <p className="whitespace-pre-wrap">{previewMessage}</p>
                    <div className="flex items-center justify-end gap-1 mt-1.5 text-[10px] text-on-surface-variant/60 dark:text-white/60">
                      <span>12:45</span>
                      <span className="text-sky-600 font-bold">✓✓</span>
                    </div>
                  </div>
                </div>

                {/* Chat Footer Mockup */}
                <div className="mt-4 pt-2 border-t border-black/5 flex items-center gap-2">
                  <div className="flex-1 bg-white dark:bg-[#202c33] rounded-full px-3 py-1.5 text-[11px] text-on-surface-variant/60">
                    Mensaje de WhatsApp
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#005c4b] text-white flex items-center justify-center shadow-xs">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Automation Rules Card */}
            <Card className="p-5 bg-surface-container-low border border-outline-variant/50">
              <div className="flex flex-col gap-3">
                <span className="font-bold text-xs uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  Disparadores Automáticos Activos
                </span>
                <div className="flex flex-col gap-2 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Recordatorio 24 horas antes del servicio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Consentimiento LOPD al registrar nuevo cliente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Sincronización instantánea de cancelaciones</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
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
