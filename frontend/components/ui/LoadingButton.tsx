"use client";

import React from "react";
import { Loader2, Check } from "lucide-react";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  isSuccess?: boolean;
  loadingText?: string;
  successText?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger";
}

export function LoadingButton({
  isLoading = false,
  isSuccess = false,
  loadingText = "Guardando...",
  successText = "¡Guardado!",
  children,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: LoadingButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl px-5 py-2.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none cursor-pointer";

  const variantStyles = {
    primary: "bg-primary text-on-primary hover:bg-primary-container shadow-sm",
    secondary: "bg-secondary text-on-secondary hover:bg-secondary-container",
    outline: "border border-outline-variant hover:bg-surface-variant text-on-surface",
    danger: "bg-error text-on-error hover:bg-error-container",
  };

  return (
    <button
      disabled={isLoading || isSuccess || disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isSuccess ? (
        <span className="inline-flex items-center gap-2 text-emerald-300 animate-fade-in">
          <Check className="w-4 h-4" />
          {successText}
        </span>
      ) : isLoading ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export function CardOverlayLoader({ message = "Procesando..." }: { message?: string }) {
  return (
    <div className="absolute inset-0 z-20 backdrop-blur-xs bg-surface/60 rounded-2xl flex flex-col items-center justify-center space-y-3 p-4 animate-fade-in select-none">
      <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      {message && (
        <span className="text-body-sm font-medium text-on-surface-variant">{message}</span>
      )}
    </div>
  );
}
