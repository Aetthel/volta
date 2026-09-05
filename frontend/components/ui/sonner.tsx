"use client";

import React from "react";
import { Toaster as Sonner, toast as sonnerToast } from "sonner";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, MessageCircle, X } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      position="top-right"
      richColors={false}
      closeButton
      duration={4000}
      visibleToasts={3}
      className="toaster group font-sans"
      style={
        {
          "--normal-bg": "var(--color-surface-container-lowest)",
          "--normal-border": "var(--color-outline-variant)",
          "--normal-text": "var(--color-on-surface)",
          "--success-bg": "var(--color-surface-container-lowest)",
          "--success-border": "var(--color-primary)",
          "--success-text": "var(--color-on-surface)",
          "--error-bg": "var(--color-surface-container-lowest)",
          "--error-border": "var(--color-error)",
          "--error-text": "var(--color-on-surface)",
          "--warning-bg": "var(--color-surface-container-lowest)",
          "--warning-border": "var(--color-outline)",
          "--warning-text": "var(--color-on-surface)",
          "--info-bg": "var(--color-surface-container-lowest)",
          "--info-border": "var(--color-primary)",
          "--info-text": "var(--color-on-surface)",
          "--border-radius": "var(--radius-xl, 0.625rem)",
          ...props.style,
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface-container-lowest group-[.toaster]:text-on-surface group-[.toaster]:border group-[.toaster]:border-outline-variant/60 group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl group-[.toaster]:font-sans group-[.toaster]:p-4 group-[.toaster]:gap-3",
          title: "group-[.toast]:font-semibold group-[.toast]:text-on-surface text-sm",
          description: "group-[.toast]:text-on-surface-variant group-[.toast]:text-xs mt-0.5 leading-relaxed",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-on-primary hover:group-[.toast]:bg-primary-container group-[.toast]:rounded-lg font-medium text-xs px-3 py-1.5 active:scale-[0.98] transition-all",
          cancelButton:
            "group-[.toast]:bg-surface-container-high group-[.toast]:text-on-surface-variant hover:group-[.toast]:bg-surface-container-highest group-[.toast]:rounded-lg text-xs px-3 py-1.5 transition-colors",
          closeButton:
            "group-[.toast]:border-outline-variant/60 group-[.toast]:bg-surface-container-low group-[.toast]:text-on-surface-variant hover:group-[.toast]:text-on-surface group-[.toast]:transition-colors",
          success:
            "group-[.toaster]:border-primary/40 group-[.toaster]:bg-surface-container-lowest",
          error:
            "group-[.toaster]:border-error/40 group-[.toaster]:bg-surface-container-lowest",
          warning:
            "group-[.toaster]:border-amber-500/40 group-[.toaster]:bg-surface-container-lowest",
          info:
            "group-[.toaster]:border-primary/40 group-[.toaster]:bg-surface-container-lowest",
        },
      }}
      icons={{
        success: <CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0" />,
        error: <AlertCircle className="w-4.5 h-4.5 text-error shrink-0" />,
        warning: <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0" />,
        info: <Info className="w-4.5 h-4.5 text-primary shrink-0" />,
      }}
      {...props}
    />
  );
};

export interface WhatsAppToastOptions {
  phone?: string;
  message: string;
  title?: string;
  duration?: number;
}

export const toast = Object.assign(sonnerToast, {
  whatsapp: ({
    phone,
    message,
    title = "WhatsApp Enviado",
    duration = 4000,
  }: WhatsAppToastOptions) => {
    return sonnerToast.custom(
      (id) => (
        <div
          data-sonner-toast=""
          className="w-full bg-surface-container-lowest border border-primary/30 rounded-xl p-4 shadow-xl flex items-start gap-3 text-on-surface font-sans pointer-events-auto select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <MessageCircle className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-on-surface">{title}</p>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {message}{" "}
              {phone && <span className="font-semibold text-primary">{phone}</span>}
            </p>
          </div>
          <button
            type="button"
            onClick={() => sonnerToast.dismiss(id)}
            className="text-on-surface-variant/50 hover:text-on-surface p-1 rounded-md transition-colors shrink-0 cursor-pointer"
            aria-label="Cerrar notificación"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
      { duration }
    );
  },
});
