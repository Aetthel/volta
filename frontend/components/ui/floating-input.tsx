"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// FloatingInput
export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Etiqueta flotante sobre el borde. Omitirla cuando el campo ya lleve un
   * `FieldLabel` encima: si no, las dos etiquetas se superponen. Sin ella, el
   * nombre accesible lo aporta ese `FieldLabel` a través de `htmlFor`/`id`.
   */
  label?: string;
  icon?: React.ComponentType<any>;
  endAction?: React.ReactNode;
  variant?: "outlined" | "minimal" | "borderless";
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, icon: Icon, endAction, id, type, variant = "outlined", ...props }, ref) => {
    return (
      <div
        className={cn(
          "relative w-full group/input transition-all duration-200",
          variant === "minimal"
            ? "border-b border-outline-variant focus-within:border-primary hover:bg-on-surface/[0.04] focus-within:bg-on-surface/[0.06] rounded-t-md px-3"
            : "",
          variant === "borderless"
            ? "border-b border-transparent focus-within:border-primary focus-within:border-b hover:bg-on-surface/[0.04] focus-within:bg-on-surface/[0.06] rounded-md focus-within:rounded-b-none focus-within:rounded-t-md px-3"
            : ""
        )}
      >
        {/* Leading Icon */}
        {Icon && (
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within/input:text-primary pointer-events-none z-10",
              variant === "minimal" || variant === "borderless" ? "left-2.5" : "left-3"
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={id}
          type={type}
          placeholder=" "
          className={cn(
            "peer block w-full bg-transparent text-sm text-on-surface focus:outline-none transition-all",
            variant === "minimal" || variant === "borderless"
              ? "border-0 rounded-none focus:ring-0 py-1.5 px-0 shadow-none"
              : "border border-outline-variant/70 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/15 py-2.5 pr-3.5",
            variant === "minimal" || variant === "borderless"
              ? Icon
                ? "pl-7"
                : "pl-0"
              : Icon
                ? "pl-9"
                : "pl-3",
            endAction ? "pr-10" : "pr-3.5",
            className
          )}
          {...props}
        />

        {/* Floating Label */}
        {label && (
        <label
          htmlFor={id}
          className={cn(
            "absolute z-10 origin-left text-on-surface-variant transition-all duration-200 pointer-events-none select-none",
            variant === "minimal" || variant === "borderless"
              ? "bg-transparent"
              : "bg-surface-container-lowest px-1.5",
            type === "date" || type === "time"
              ? variant === "minimal" || variant === "borderless"
                ? "-top-2 scale-[0.82] text-primary"
                : "top-0 scale-[0.82] text-primary"
              : variant === "minimal" || variant === "borderless"
                ? "top-1/2 -translate-y-1/2 text-sm peer-[:not(:placeholder-shown)]:opacity-0 peer-[:not(:placeholder-shown)]:pointer-events-none"
                : "top-1/2 -translate-y-1/2 text-sm peer-focus:top-0 peer-focus:scale-[0.82] peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:scale-[0.82]",
            variant === "minimal" || variant === "borderless"
              ? Icon
                ? "left-8"
                : "left-2.5"
              : Icon
                ? "left-9"
                : "left-3"
          )}
        >
          {label}
        </label>
        )}

        {/* End Action */}
        {endAction && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer z-20 flex items-center justify-center">
            {endAction}
          </div>
        )}
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";

// FloatingSelect
export interface FloatingSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  icon?: React.ComponentType<any>;
}

export const FloatingSelect = React.forwardRef<HTMLSelectElement, FloatingSelectProps>(
  ({ className, label, icon: Icon, children, id, ...props }, ref) => {
    return (
      <div className="relative w-full group/select">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none z-10">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <select
          ref={ref}
          id={id}
          className={cn(
            "peer block w-full bg-transparent bg-none text-body-lg text-on-surface border border-outline rounded-xl focus:border-primary focus:border-2 focus:outline-none transition-all py-3.5 pr-10 appearance-none cursor-pointer",
            Icon ? "pl-12" : "pl-4",
            className
          )}
          {...props}
        >
          {children}
        </select>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none z-10">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <label
          htmlFor={id}
          className={cn(
            "absolute z-10 origin-left bg-surface-container-lowest px-1.5 text-on-surface-variant transition-all duration-200 pointer-events-none select-none top-0 scale-[0.82] text-primary",
            Icon ? "left-12" : "left-4"
          )}
        >
          {label}
        </label>
      </div>
    );
  }
);
FloatingSelect.displayName = "FloatingSelect";

// FloatingTextarea
export interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  variant?: "outlined" | "minimal" | "borderless";
}

export const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ className, label, id, variant = "outlined", ...props }, ref) => {
    return (
      <div
        className={cn(
          "relative w-full group/textarea transition-all duration-200",
          variant === "minimal"
            ? "border-b border-outline-variant focus-within:border-primary hover:bg-on-surface/[0.04] focus-within:bg-on-surface/[0.06] rounded-t-md px-3"
            : "",
          variant === "borderless"
            ? "border-b border-transparent focus-within:border-primary focus-within:border-b hover:bg-on-surface/[0.04] focus-within:bg-on-surface/[0.06] rounded-md focus-within:rounded-b-none focus-within:rounded-t-md px-3"
            : ""
        )}
      >
        <textarea
          ref={ref}
          id={id}
          placeholder=" "
          className={cn(
            "peer block w-full bg-transparent text-body-lg text-on-surface focus:outline-none transition-all resize-none",
            variant === "minimal" || variant === "borderless"
              ? "border-0 rounded-none focus:ring-0 py-2 px-0 shadow-none"
              : "border border-outline rounded-xl focus:border-primary focus:border-2 py-3.5 px-4",
            className
          )}
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            "absolute z-10 origin-left text-on-surface-variant transition-all duration-200 pointer-events-none select-none",
            variant === "minimal" || variant === "borderless"
              ? "bg-transparent left-3"
              : "bg-surface-container-lowest px-1.5 left-4",
            variant === "minimal" || variant === "borderless"
              ? "top-5 -translate-y-1/2 text-body-lg peer-[:not(:placeholder-shown)]:opacity-0 peer-[:not(:placeholder-shown)]:pointer-events-none"
              : "top-6 -translate-y-1/2 text-body-lg peer-focus:top-0 peer-focus:scale-[0.82] peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:scale-[0.82]"
          )}
        >
          {label}
        </label>
      </div>
    );
  }
);
FloatingTextarea.displayName = "FloatingTextarea";
