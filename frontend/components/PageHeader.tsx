"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Header from "./Header";
import TrialBanner from "./TrialBanner";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, description, actions, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-4 w-full">
        <TrialBanner />
        <section
          ref={ref}
          className={cn(
            "flex flex-col lg:flex-row lg:items-center justify-between gap-gutter mb-gutter w-full",
            className
          )}
          {...props}
        >
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center gap-3 w-full">
              <h1 className="font-display text-headline-lg text-on-surface font-semibold mb-1">
                {title}
              </h1>
              <div className="lg:hidden ml-auto shrink-0">
                <Header />
              </div>
            </div>
            {description && (
              <div className="font-body-lg text-body-lg text-on-surface-variant font-medium">
                {description}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 shrink-0 mt-2 lg:mt-0 justify-between lg:justify-end w-full lg:w-auto">
            {actions ? (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            ) : (
              <div />
            )}
            <div className="hidden lg:block">
              <Header />
            </div>
          </div>
        </section>
      </div>
    );
  }
);
PageHeader.displayName = "PageHeader";

export default PageHeader;
