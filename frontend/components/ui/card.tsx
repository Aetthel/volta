"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Card
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden",
        className
      )}
      {...props}
    />
  );
});
Card.displayName = "Card";

// CardHeader
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 flex flex-col gap-1.5", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

// CardTitle
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-title-lg text-title-lg text-on-surface font-semibold", className)}
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
    className={cn("font-body-md text-body-md text-on-surface-variant", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// CardContent
export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

// CardFooter
export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-6 pt-0 flex items-center justify-end gap-2", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";
