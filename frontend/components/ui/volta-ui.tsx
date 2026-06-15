"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// FieldGroup
export interface FieldGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export const FieldGroup = React.forwardRef<HTMLDivElement, FieldGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-4 w-full", className)}
        {...props}
      />
    );
  },
);
FieldGroup.displayName = "FieldGroup";

// Field
export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  "data-invalid"?: boolean;
  "data-disabled"?: boolean;
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  (
    {
      className,
      orientation = "vertical",
      "data-invalid": invalid,
      "data-disabled": disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        className={cn(
          "flex w-full group",
          orientation === "horizontal"
            ? "flex-row items-center justify-between gap-4"
            : "flex-col gap-1.5",
          className,
        )}
        {...props}
      />
    );
  },
);
Field.displayName = "Field";

// FieldLabel
export interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "font-label-lg text-label-lg text-on-surface select-none transition-colors duration-200",
          "group-data-[disabled]:text-on-surface/40",
          "group-data-[invalid]:text-error",
          className,
        )}
        {...props}
      />
    );
  },
);
FieldLabel.displayName = "FieldLabel";

// FieldDescription
export interface FieldDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  FieldDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn(
        "font-body-sm text-body-sm text-on-surface-variant/85",
        "group-data-[disabled]:text-on-surface/30",
        "group-data-[invalid]:text-error",
        className,
      )}
      {...props}
    />
  );
});
FieldDescription.displayName = "FieldDescription";

// InputGroup
export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative flex items-center w-full", className)}
        {...props}
      />
    );
  },
);
InputGroup.displayName = "InputGroup";

// Card
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden",
          className,
        )}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";

// CardHeader
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 flex flex-col gap-1.5", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

// CardTitle
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-title-lg text-title-lg text-on-surface font-semibold",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

// CardDescription
export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "font-body-md text-body-md text-on-surface-variant",
      className,
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// CardContent
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

// CardFooter
export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pt-0 flex items-center justify-end gap-2", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// Alert
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "error" | "info" | "success" | "warning";
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default:
        "bg-surface-container border border-outline-variant text-on-surface",
      error:
        "bg-error-container border border-error-container/60 text-on-error-container",
      info: "bg-secondary-container border border-secondary-container/60 text-on-secondary-container",
      success: "bg-emerald-50 border border-emerald-200 text-emerald-800",
      warning: "bg-amber-50 border border-amber-200 text-amber-800",
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "p-4 rounded-md text-body-md font-medium border flex gap-3 items-start",
          variantClasses[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
Alert.displayName = "Alert";

// Badge
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "error";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-primary text-on-primary",
      secondary: "bg-secondary-container text-on-secondary-container",
      outline: "border border-outline-variant text-on-surface",
      error: "bg-error-container text-on-error-container",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-label-sm font-semibold transition-colors",
          variantClasses[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
Badge.displayName = "Badge";

// FloatingInput
export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ComponentType<any>;
  endAction?: React.ReactNode;
}

export const FloatingInput = React.forwardRef<
  HTMLInputElement,
  FloatingInputProps
>(({ className, label, icon: Icon, endAction, id, type, ...props }, ref) => {
  return (
    <div className="relative w-full group/input">
      {/* Leading Icon */}
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within/input:text-primary pointer-events-none">
          <Icon className="w-5 h-5" />
        </div>
      )}

      {/* Input */}
      <input
        ref={ref}
        id={id}
        type={type}
        placeholder=" "
        className={cn(
          "peer block w-full bg-transparent text-body-lg text-on-surface border border-outline rounded-md focus:border-primary focus:border-2 focus:outline-none transition-all py-3.5 pr-4",
          Icon ? "pl-12" : "pl-4",
          endAction ? "pr-12" : "pr-4",
          className,
        )}
        {...props}
      />

      {/* Floating Label */}
      <label
        htmlFor={id}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 z-10 origin-left scale-100 bg-surface-container-lowest px-1.5 text-body-lg text-on-surface-variant transition-all duration-200 pointer-events-none select-none",
          "peer-focus:top-0 peer-focus:scale-[0.82] peer-focus:text-primary",
          "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:scale-[0.82]",
          Icon
            ? "left-12 peer-focus:left-3 peer-[:not(:placeholder-shown)]:left-3"
            : "left-4",
        )}
      >
        {label}
      </label>

      {/* End Action */}
      {endAction && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer z-20 flex items-center justify-center">
          {endAction}
        </div>
      )}
    </div>
  );
});
FloatingInput.displayName = "FloatingInput";

// Separator
export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-outline-variant/50 shrink-0",
          orientation === "horizontal" ? "h-[1px] w-full" : "w-[1px] h-full",
          className,
        )}
        {...props}
      />
    );
  },
);
Separator.displayName = "Separator";
