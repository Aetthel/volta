"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Lightweight native Slot component for asChild pattern without external radix dependency
const Slot = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }
>(({ children, className, ...props }, ref) => {
  if (React.isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, any>>;
    return React.cloneElement(child, {
      ...props,
      ...child.props,
      className: cn(className, child.props?.className),
      ref: (ref as any) || (child as any).ref,
    });
  }
  return null;
});
Slot.displayName = "Slot";

const badgeVariants = cva(
  "inline-flex items-center justify-center border border-transparent font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 [&_svg]:-ms-px [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary",
        default: "bg-primary text-on-primary",
        secondary: "bg-surface-container-high text-on-surface",
        success: "bg-green-600 text-white",
        warning: "bg-amber-500 text-white",
        info: "bg-sky-600 text-white",
        destructive: "bg-error text-on-error",
        error: "bg-error text-on-error",
        neutral: "bg-surface-variant text-on-surface-variant",
        outline: "bg-transparent border border-outline-variant text-on-surface",
      },
      appearance: {
        default: "",
        light: "",
        outline: "",
        ghost: "border-transparent bg-transparent",
      },
      disabled: {
        true: "opacity-50 pointer-events-none",
      },
      size: {
        lg: "rounded-md px-2.5 h-7 min-w-7 gap-1.5 text-xs [&_svg]:size-3.5",
        md: "rounded-md px-2 h-6 min-w-6 gap-1.5 text-xs [&_svg]:size-3.5",
        sm: "rounded-sm px-1.5 h-5 min-w-5 gap-1 text-[0.6875rem] leading-[0.75rem] [&_svg]:size-3",
        xs: "rounded-sm px-1 h-4 min-w-4 gap-1 text-[0.625rem] leading-[0.5rem] [&_svg]:size-3",
      },
      shape: {
        default: "",
        circle: "rounded-full",
        pill: "rounded-full",
      },
    },
    compoundVariants: [
      /* --- Appearance: Light --- */
      {
        variant: ["primary", "default"],
        appearance: "light",
        className:
          "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary",
      },
      {
        variant: "secondary",
        appearance: "light",
        className:
          "bg-surface-container-high/80 text-on-surface-variant border-outline-variant/50",
      },
      {
        variant: "success",
        appearance: "light",
        className:
          "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20",
      },
      {
        variant: "warning",
        appearance: "light",
        className:
          "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
      },
      {
        variant: "info",
        appearance: "light",
        className:
          "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/20",
      },
      {
        variant: ["destructive", "error"],
        appearance: "light",
        className:
          "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
      },
      {
        variant: "neutral",
        appearance: "light",
        className:
          "bg-surface-variant/60 text-on-surface-variant border-outline-variant/40",
      },

      /* --- Appearance: Outline --- */
      {
        variant: ["primary", "default"],
        appearance: "outline",
        className:
          "border-primary/30 text-primary bg-primary/5 dark:bg-primary/10",
      },
      {
        variant: "secondary",
        appearance: "outline",
        className:
          "border-outline-variant text-on-surface-variant bg-transparent",
      },
      {
        variant: "success",
        appearance: "outline",
        className:
          "border-green-500/30 text-green-700 dark:text-green-400 bg-green-500/5",
      },
      {
        variant: "warning",
        appearance: "outline",
        className:
          "border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/5",
      },
      {
        variant: "info",
        appearance: "outline",
        className:
          "border-sky-500/30 text-sky-700 dark:text-sky-400 bg-sky-500/5",
      },
      {
        variant: ["destructive", "error"],
        appearance: "outline",
        className:
          "border-red-500/30 text-red-700 dark:text-red-400 bg-red-500/5",
      },

      /* --- Appearance: Ghost --- */
      {
        variant: ["primary", "default"],
        appearance: "ghost",
        className: "text-primary",
      },
      {
        variant: "secondary",
        appearance: "ghost",
        className: "text-on-surface-variant",
      },
      {
        variant: "success",
        appearance: "ghost",
        className: "text-green-600 dark:text-green-400",
      },
      {
        variant: "warning",
        appearance: "ghost",
        className: "text-amber-600 dark:text-amber-400",
      },
      {
        variant: "info",
        appearance: "ghost",
        className: "text-sky-600 dark:text-sky-400",
      },
      {
        variant: ["destructive", "error"],
        appearance: "ghost",
        className: "text-error",
      },

      /* Appearance Ghost padding resets */
      { size: "lg", appearance: "ghost", className: "px-0" },
      { size: "md", appearance: "ghost", className: "px-0" },
      { size: "sm", appearance: "ghost", className: "px-0" },
      { size: "xs", appearance: "ghost", className: "px-0" },
    ],
    defaultVariants: {
      variant: "primary",
      appearance: "default",
      size: "md",
      shape: "default",
    },
  }
);

const badgeButtonVariants = cva(
  "cursor-pointer transition-all inline-flex items-center justify-center leading-none size-3.5 [&>svg]:opacity-100! [&>svg]:size-3.5 p-0 rounded-md -me-0.5 opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 select-none",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

export interface BadgeButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof badgeButtonVariants> {
  asChild?: boolean;
}

export type BadgeDotProps = React.HTMLAttributes<HTMLSpanElement>;

export function Badge({
  className,
  variant,
  size,
  appearance,
  shape,
  asChild = false,
  disabled,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, appearance, shape, disabled }), className)}
      {...props}
    />
  );
}

export function BadgeButton({
  className,
  variant,
  asChild = false,
  ...props
}: BadgeButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="badge-button"
      className={cn(badgeButtonVariants({ variant }), className)}
      type="button"
      {...props}
    />
  );
}

export function BadgeDot({ className, ...props }: BadgeDotProps) {
  return (
    <span
      data-slot="badge-dot"
      className={cn("size-1.5 rounded-full bg-current opacity-75 shrink-0", className)}
      {...props}
    />
  );
}

export { badgeVariants, badgeButtonVariants };
