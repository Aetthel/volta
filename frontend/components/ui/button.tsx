"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "default"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "link";
  size?: "default" | "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.98]";

    const variantStyles: Record<string, string> = {
      primary: "bg-primary text-on-primary hover:bg-primary/90 shadow-xs",
      default: "bg-primary text-on-primary hover:bg-primary/90 shadow-xs",
      secondary:
        "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 shadow-xs",
      outline:
        "border border-outline-variant bg-surface text-on-surface hover:bg-surface-container-low hover:text-primary shadow-xs",
      ghost: "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
      destructive: "bg-error text-on-error hover:bg-error/90 shadow-xs",
      link: "text-primary underline-offset-4 hover:underline p-0 h-auto shadow-none active:scale-100",
    };

    const sizeStyles: Record<string, string> = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-9 px-4 py-2 text-sm rounded-xl gap-2",
      default: "h-9 px-4 py-2 text-sm rounded-xl gap-2",
      lg: "h-11 px-6 text-base rounded-xl gap-2.5",
      icon: "h-9 w-9 p-0 rounded-xl",
    };

    const isIconOnly = size === "icon";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant] || variantStyles.primary,
          sizeStyles[size] || sizeStyles.md,
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className={cn("animate-spin shrink-0", isIconOnly ? "w-4 h-4" : "w-3.5 h-3.5")} />
        ) : (
          leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="shrink-0 flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;
