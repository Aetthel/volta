"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Empty
export interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: React.ComponentType<any>;
  action?: React.ReactNode;
}

export const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  ({ className, title, description, icon: Icon, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center text-center p-8 border border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest gap-4",
          className
        )}
        {...props}
      >
        {Icon && (
          <div className="p-3 bg-surface-container text-on-surface-variant rounded-full">
            <Icon className="w-8 h-8 text-on-surface-variant" />
          </div>
        )}
        <div className="flex flex-col gap-1 max-w-sm">
          <h3 className="font-title-md text-title-md text-on-surface font-semibold">{title}</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">{description}</p>
        </div>
        {action && <div className="mt-2">{action}</div>}
      </div>
    );
  }
);
Empty.displayName = "Empty";
