import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border border-outline-variant/80 bg-surface px-3 py-2 text-sm text-on-surface shadow-xs transition-all duration-150",
          "placeholder:text-on-surface-variant/50 placeholder:font-normal",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-container-low",
          "aria-invalid:border-error aria-invalid:ring-error/20 aria-invalid:text-on-surface",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export default Textarea;
