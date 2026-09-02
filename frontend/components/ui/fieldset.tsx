"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FieldsetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {}

export const Fieldset = React.forwardRef<HTMLFieldSetElement, FieldsetProps>(
  ({ className, ...props }, ref) => {
    return (
      <fieldset
        ref={ref}
        className={cn("flex w-full flex-col gap-6", className)}
        {...props}
      />
    );
  }
);
Fieldset.displayName = "Fieldset";

export interface FieldsetLegendProps extends React.HTMLAttributes<HTMLLegendElement> {}

export const FieldsetLegend = React.forwardRef<HTMLLegendElement, FieldsetLegendProps>(
  ({ className, ...props }, ref) => {
    return (
      <legend
        ref={ref}
        className={cn(
          "font-label-lg text-title-md font-semibold text-on-surface tracking-tight mb-2",
          className
        )}
        {...props}
      />
    );
  }
);
FieldsetLegend.displayName = "FieldsetLegend";
