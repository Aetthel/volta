"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Send,
  Loader2,
  Sparkles,
  RotateCcw,
  Check,
} from "lucide-react";
import type { MessageTemplates } from "@/types/settings";
import { Button, toast } from "@/components/ui/volta-ui";
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
}

export const WhatsAppTemplatesEditor: React.FC<WhatsAppTemplatesEditorProps> = ({
  businessId,
  profileName,
}) => {
  const [templates, setTemplates] = useState<MessageTemplates>({
    welcomeMessage: "",
    reminderMessage: "",
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const reminderTextareaRef = useRef<HTMLTextAreaElement>(null);
  const welcomeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const saveToServer = useCallback(
    async (dataToSave: MessageTemplates) => {
      if (!businessId || businessId === "mock-business-id") return;
      setSaveStatus("saving");
      try {
        const res = await apiClient.whatsapp.saveTemplates({ businessId, ...dataToSave });
        if (res.error) throw new Error(res.error);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } catch {
        setSaveStatus("idle");
        toast.error("Error al guardar plantillas");
      }
    },
    [businessId]
  );

  const scheduleAutoSave = (newTemplates: MessageTemplates) => {
    setTemplates(newTemplates);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveToServer(newTemplates);
    }, 800);
  };

  const insertVariable = (target: "reminder" | "welcome", variableTag: string) => {
    const textarea = target === "reminder" ? reminderTextareaRef.current : welcomeTextareaRef.current;
    if (!textarea) return;

    const currentVal = target === "reminder" ? templates.reminderMessage : templates.welcomeMessage;
    const start = textarea.selectionStart || currentVal.length;
    const end = textarea.selectionEnd || currentVal.length;

    const newVal = currentVal.substring(0, start) + variableTag + currentVal.substring(end);
    const updated = {
      ...templates,
      [target === "reminder" ? "reminderMessage" : "welcomeMessage"]: newVal,
    };
    scheduleAutoSave(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variableTag.length, start + variableTag.length);
    }, 0);
  };

  return (
    <div className="pt-8 w-full">
      <div className="flex flex-col">
        <SectionHeading
          icon={Send}
          title="Personalización de Plantillas"
          description="Define el contenido exacto de los mensajes automáticos que recibirán tus clientes. Se guardan automáticamente al escribir."
          className="mb-6"
          trailing={
            saveStatus === "saving" ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>Guardando...</span>
              </span>
            ) : saveStatus === "saved" ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Guardado</span>
              </span>
            ) : null
          }
        />

        {/* 2 Columnas completas: Recordatorio a la izquierda, Bienvenida LOPD a la derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna 1: Recordatorio 24h */}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span>Recordatorio 24h antes de la cita</span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const updated = {
                    ...templates,
                    reminderMessage: `Hola {nombre}, te recordamos tu cita de {servicio} para {fecha} a las {hora}. ¡Te esperamos en ${profileName || "nuestro negocio"}!`,
                  };
                  scheduleAutoSave(updated);
                }}
                className="text-[11px] font-semibold text-on-surface-variant hover:text-primary gap-1 h-7 px-2"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar</span>
              </Button>
            </div>

            {/* Variable Chips Toolbar */}
            <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/40 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />
                Variables dinámicas (haz clic para insertar)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {["{nombre}", "{servicio}", "{fecha}", "{hora}", "{negocio}"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => insertVariable("reminder", tag)}
                    className={VARIABLE_CHIP}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              ref={reminderTextareaRef}
              id="reminderTextarea"
              rows={5}
              value={templates.reminderMessage}
              onChange={(e) =>
                scheduleAutoSave({ ...templates, reminderMessage: e.target.value })
              }
              onBlur={() => saveToServer(templates)}
              placeholder={DEFAULT_REMINDER}
              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans leading-relaxed"
            />
          </div>

          {/* Columna 2: Bienvenida LOPD */}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span>Bienvenida y Consentimiento LOPD</span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const updated = {
                    ...templates,
                    welcomeMessage: `Hola {nombre}, bienvenido/a a ${profileName || "nuestro negocio"}. Por favor confirma tu política de privacidad en: {link_lopd}`,
                  };
                  scheduleAutoSave(updated);
                }}
                className="text-[11px] font-semibold text-on-surface-variant hover:text-primary gap-1 h-7 px-2"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar</span>
              </Button>
            </div>

            {/* Variable Chips Toolbar */}
            <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/40 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />
                Variables dinámicas (haz clic para insertar)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {["{nombre}", "{negocio}", "{link_lopd}"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => insertVariable("welcome", tag)}
                    className={VARIABLE_CHIP}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              ref={welcomeTextareaRef}
              id="welcomeTextarea"
              rows={5}
              value={templates.welcomeMessage}
              onChange={(e) =>
                scheduleAutoSave({ ...templates, welcomeMessage: e.target.value })
              }
              onBlur={() => saveToServer(templates)}
              placeholder={DEFAULT_WELCOME}
              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
