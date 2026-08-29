"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Alert
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "error" | "info" | "success" | "warning";
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-surface-container border border-outline-variant text-on-surface",
      error: "bg-error-container border border-error-container/60 text-on-error-container",
      info: "bg-secondary-container border border-secondary-container/60 text-on-secondary-container",
      success:
        "bg-secondary-container border border-secondary-container/60 text-on-secondary-container",
      warning: "bg-surface-container border border-outline-variant text-on-surface-variant",
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "p-4 rounded-md text-body-md font-medium border flex gap-3 items-start",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Alert.displayName = "Alert";

// AlertBanner
export interface AlertBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "warning" | "error" | "success";
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const AlertBanner = React.forwardRef<HTMLDivElement, AlertBannerProps>(
  ({ className, variant = "info", icon, action, children, ...props }, ref) => {
    const variantClasses = {
      info: "bg-secondary-container/50 border-secondary-container/60 text-on-secondary-container",
      warning: "bg-primary/5 border-primary/20 text-on-surface",
      error: "bg-error-container/50 border-error-container/60 text-on-error-container",
      success:
        "bg-secondary-container/50 border-secondary-container/60 text-on-secondary-container",
    };
    return (
      <div
        ref={ref}
        role="status"
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl border text-body-md font-medium transition-colors",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <div className="flex-1 min-w-0">{children}</div>
        {action && <span className="shrink-0">{action}</span>}
      </div>
    );
  }
);
AlertBanner.displayName = "AlertBanner";
