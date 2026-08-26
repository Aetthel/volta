import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-primary",
        secondary: "bg-surface-container-high text-on-surface",
        destructive: "bg-error text-on-error",
        outline: "border border-outline-variant text-on-surface",
        success: "bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/20",
        warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20",
        neutral: "bg-surface-variant/70 text-on-surface-variant border border-outline-variant/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };
