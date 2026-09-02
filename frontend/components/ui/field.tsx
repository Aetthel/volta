"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// FieldGroup
export interface FieldGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export const FieldGroup = React.forwardRef<HTMLDivElement, FieldGroupProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("flex flex-col gap-4 w-full", className)} {...props} />;
  }
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
    ref
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
          className
        )}
        {...props}
      />
    );
  }
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
          "font-label-lg text-sm font-medium text-on-surface select-none transition-colors duration-200 flex items-center gap-1 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          "group-data-[disabled]:text-on-surface/40",
          "group-data-[invalid]:text-error",
          className
        )}
        {...props}
      />
    );
  }
);
FieldLabel.displayName = "FieldLabel";

// FieldDescription
export interface FieldDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const FieldDescription = React.forwardRef<HTMLParagraphElement, FieldDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          "font-body-sm text-xs text-on-surface-variant/80 leading-relaxed",
          "group-data-[disabled]:text-on-surface/30",
          "group-data-[invalid]:text-error",
          className
        )}
        {...props}
      />
    );
  }
);
FieldDescription.displayName = "FieldDescription";

// FieldError
export interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const FieldError = React.forwardRef<HTMLParagraphElement, FieldErrorProps>(
  ({ className, children, ...props }, ref) => {
    if (!children) return null;

    return (
      <p
        ref={ref}
        role="alert"
        aria-live="polite"
        className={cn(
          "font-body-sm text-xs font-medium text-error flex items-center gap-1.5 mt-0.5",
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);
FieldError.displayName = "FieldError";

// InputGroup
export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("relative flex items-center w-full", className)} {...props} />
    );
  }
);
InputGroup.displayName = "InputGroup";
