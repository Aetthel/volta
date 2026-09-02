"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Send,
  Loader2,
  Save,
  Smartphone,
  Sparkles,
  Clock,
  RotateCcw,
} from "lucide-react";
import type { MessageTemplates, ToastState } from "@/types/settings";
import { Button } from "@/components/ui/volta-ui";
import { SectionHeading } from "../SectionHeading";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/apiClient";

/** Chip de variable dinámica: blanco sobre el panel gris de la barra. */
const VARIABLE_CHIP =
  "px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-surface-container-lowest text-primary border border-outline-variant/60 hover:border-primary hover:bg-primary/5 transition-all active:scale-95 cursor-pointer shadow-2xs";

const DEFAULT_WELCOME = `Hola {nombre}, ¡bienvenido/a a {negocio}! Por favor confirma tu consentimiento de privacidad en: {link_lopd}`;
const DEFAULT_REMINDER = `Hola {nombre}, te recordamos tu cita de {servicio} para {fecha} a las {hora} en {negocio}. ¡Te esperamos!`;

interface WhatsAppTemplatesEditorProps {
  businessId: string;
  profileName: string;
  setToast: (toast: ToastState) => void;
}

export const WhatsAppTemplatesEditor: React.FC<WhatsAppTemplatesEditorProps> = ({
  businessId,
  profileName,
  setToast,
}) => {
  const [templates, setTemplates] = useState<MessageTemplates>({
    welcomeMessage: "",
    reminderMessage: "",
  });
  const [savingTemplates, setSavingTemplates] = useState(false);
  const [activeTemplateTab, setActiveTemplateTab] = useState<"reminder" | "welcome">("reminder");

  const reminderTextareaRef = useRef<HTMLTextAreaElement>(null);
  const welcomeTextareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchTemplates = useCallback(async () => {
    if (!businessId || businessId === "mock-business-id") return;
    try {
      const res = await apiClient.whatsapp.getTemplates<any>(businessId);
      if (res.data && !res.data.error) {
        const businessTitle = profileName || "nuestro negocio";
        const defWelcome = `Hola {nombre}, bienvenido/a a ${businessTitle}. Por favor confirma tu política de privacidad en: {link_lopd}`;
        const defReminder = `Hola {nombre}, te recordamos tu cita de {servicio} para {fecha} a las {hora}. ¡Te esperamos en ${businessTitle}!`;
        setTemplates({
          welcomeMessage: res.data.welcomeMessage || defWelcome,
          reminderMessage: res.data.reminderMessage || defReminder,
        });
      }
    } catch {}
  }, [businessId, profileName]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleSaveTemplates = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTemplates(true);
    try {
      const res = await apiClient.whatsapp.saveTemplates({ businessId, ...templates });
      if (res.error) throw new Error(res.error);

      setToast({ show: true, text: "¡Plantillas guardadas correctamente!" });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    } catch (err: any) {
      setToast({ show: true, text: err.message || "Error al guardar plantillas" });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    } finally {
      setSavingTemplates(false);
    }
  };

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
    <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-12 pt-8">
      {/* Columna izquierda: editor de plantillas (7 cols) */}
      <div className="lg:col-span-7 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <SectionHeading
            icon={Send}
            title="Personalización de Plantillas"
            description="Define el contenido exacto de los mensajes automáticos que recibirán tus clientes."
            className="mb-0"
          />

          {/* Selector de plantilla */}
          <div className="flex items-center p-1 bg-surface-container-low border border-outline-variant/50 rounded-xl self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveTemplateTab("reminder")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                activeTemplateTab === "reminder"
                  ? "bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/40 font-bold"
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
                  ? "bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/40 font-bold"
                  : "text-on-surface-variant/75 hover:text-on-surface"
              )}
            >
              Bienvenida LOPD
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveTemplates} className="mt-6">
          <div className="flex flex-col gap-4">
            {/* Variable Chips Toolbar */}
            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-label-sm font-bold text-on-surface-variant/80 uppercase tracking-wider flex items-center gap-1.5">
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
                      className={VARIABLE_CHIP}
                    >
                      + {"{nombre}"}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertVariable("{servicio}")}
                      className={VARIABLE_CHIP}
                    >
                      + {"{servicio}"}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertVariable("{fecha}")}
                      className={VARIABLE_CHIP}
                    >
                      + {"{fecha}"}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertVariable("{hora}")}
                      className={VARIABLE_CHIP}
                    >
                      + {"{hora}"}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertVariable("{negocio}")}
                      className={VARIABLE_CHIP}
                    >
                      + {"{negocio}"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => insertVariable("{nombre}")}
                      className={VARIABLE_CHIP}
                    >
                      + {"{nombre}"}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertVariable("{negocio}")}
                      className={VARIABLE_CHIP}
                    >
                      + {"{negocio}"}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertVariable("{link_lopd}")}
                      className={VARIABLE_CHIP}
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
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
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
              variant="default"
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
          </div>
        </form>
      </div>

      {/* Columna derecha: simulador de chat (5 cols). El marco se queda: no es un
          contenedor de contenido, dibuja la pantalla de un móvil. */}
      <div className="lg:col-span-5 flex flex-col mt-10 pt-8 border-t border-outline-variant/50 lg:mt-0 lg:pt-0 lg:border-t-0 lg:border-l lg:pl-12">
        <div className="rounded-xl overflow-hidden border border-outline-variant shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-surface-container-low border-b border-outline-variant/40">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                Vista Previa en Vivo
              </span>
            </div>
            <span className="text-label-sm font-semibold text-on-surface-variant/70">
              WhatsApp Chat
            </span>
          </div>

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
        </div>

        {/* Disparadores automáticos: título y filas centrados sobre el eje de la
            columna, cada fila con su icono pegado al texto. */}
        <div className="mt-8 flex flex-col gap-3 items-center text-center">
          <span className="font-bold text-xs uppercase tracking-wider text-on-surface flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            Disparadores Automáticos Activos
          </span>
          <div className="flex flex-col gap-2 items-center text-xs text-on-surface-variant">
            <span>Recordatorio 24 horas antes del servicio</span>
            <span>Consentimiento LOPD al registrar nuevo cliente</span>
            <span>Sincronización instantánea de cancelaciones</span>
          </div>
        </div>
      </div>
    </div>
  );
};
