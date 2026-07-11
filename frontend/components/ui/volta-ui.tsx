"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Search, ChevronDown, Check } from "lucide-react";
import Header from "../Header";

// FieldGroup
export interface FieldGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export const FieldGroup = React.forwardRef<HTMLDivElement, FieldGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-4 w-full", className)}
        {...props}
      />
    );
  },
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
    ref,
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
          className,
        )}
        {...props}
      />
    );
  },
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
          "font-label-lg text-label-lg text-on-surface select-none transition-colors duration-200",
          "group-data-[disabled]:text-on-surface/40",
          "group-data-[invalid]:text-error",
          className,
        )}
        {...props}
      />
    );
  },
);
FieldLabel.displayName = "FieldLabel";

// FieldDescription
export interface FieldDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  FieldDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn(
        "font-body-sm text-body-sm text-on-surface-variant/85",
        "group-data-[disabled]:text-on-surface/30",
        "group-data-[invalid]:text-error",
        className,
      )}
      {...props}
    />
  );
});
FieldDescription.displayName = "FieldDescription";

// InputGroup
export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative flex items-center w-full", className)}
        {...props}
      />
    );
  },
);
InputGroup.displayName = "InputGroup";

// Card
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-surface-container-lowest border border-outline-variant rounded-default shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden",
          className,
        )}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";

// CardHeader
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 flex flex-col gap-1.5", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

// CardTitle
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-title-lg text-title-lg text-on-surface font-semibold",
      className,
    )}
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
    className={cn(
      "font-body-md text-body-md text-on-surface-variant",
      className,
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// CardContent
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

// CardFooter
export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pt-0 flex items-center justify-end gap-2", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// Alert
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "error" | "info" | "success" | "warning";
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default:
        "bg-surface-container border border-outline-variant text-on-surface",
      error:
        "bg-error-container border border-error-container/60 text-on-error-container",
      info: "bg-secondary-container border border-secondary-container/60 text-on-secondary-container",
      success: "bg-secondary-container border border-secondary-container/60 text-on-secondary-container",
      warning: "bg-surface-container border border-outline-variant text-on-surface-variant",
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "p-4 rounded-md text-body-md font-medium border flex gap-3 items-start",
          variantClasses[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
Alert.displayName = "Alert";

// Badge
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "error";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-primary text-on-primary",
      secondary: "bg-secondary-container text-on-secondary-container",
      outline: "border border-outline-variant text-on-surface",
      error: "bg-error-container text-on-error-container",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-label-sm font-semibold transition-colors",
          variantClasses[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
Badge.displayName = "Badge";

// FloatingInput
export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ComponentType<any>;
  endAction?: React.ReactNode;
  variant?: "outlined" | "minimal" | "borderless";
}

export const FloatingInput = React.forwardRef<
  HTMLInputElement,
  FloatingInputProps
>((({ className, label, icon: Icon, endAction, id, type, variant = "outlined", ...props }, ref) => {
  return (
    <div
      className={cn(
        "relative w-full group/input transition-all duration-200",
        variant === "minimal"
          ? "border-b border-outline-variant focus-within:border-primary hover:bg-on-surface/[0.04] focus-within:bg-on-surface/[0.06] rounded-t-md px-3"
          : "",
        variant === "borderless"
          ? "border-b border-transparent focus-within:border-primary focus-within:border-b hover:bg-on-surface/[0.04] focus-within:bg-on-surface/[0.06] rounded-md focus-within:rounded-b-none focus-within:rounded-t-md px-3"
          : ""
      )}
    >
      {/* Leading Icon */}
      {Icon && (
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within/input:text-primary pointer-events-none z-10",
            variant === "minimal" || variant === "borderless" ? "left-3" : "left-4"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}

      {/* Input */}
      <input
        ref={ref}
        id={id}
        type={type}
        placeholder=" "
        className={cn(
          "peer block w-full bg-transparent text-body-lg text-on-surface focus:outline-none transition-all",
          variant === "minimal" || variant === "borderless"
            ? "border-0 rounded-none focus:ring-0 py-2 px-0 shadow-none"
            : "border border-outline rounded-sm focus:border-primary focus:border-2 py-3.5 pr-4",
          variant === "minimal" || variant === "borderless"
            ? (Icon ? "pl-8" : "pl-0")
            : (Icon ? "pl-12" : "pl-4"),
          endAction ? "pr-12" : "pr-4",
          className,
        )}
        {...props}
      />

      {/* Floating Label */}
      <label
        htmlFor={id}
        className={cn(
          "absolute z-10 origin-left text-on-surface-variant transition-all duration-200 pointer-events-none select-none",
          variant === "minimal" || variant === "borderless" ? "bg-transparent" : "bg-surface-container-lowest px-1.5",
          variant === "minimal" || variant === "borderless"
            ? "top-1/2 -translate-y-1/2 text-body-lg peer-[:not(:placeholder-shown)]:opacity-0 peer-[:not(:placeholder-shown)]:pointer-events-none"
            : ((type === "date" || type === "time")
                ? "top-0 scale-[0.82] text-primary"
                : "top-1/2 -translate-y-1/2 text-body-lg peer-focus:top-0 peer-focus:scale-[0.82] peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:scale-[0.82]"
              ),
          variant === "minimal" || variant === "borderless"
            ? (Icon ? "left-11" : "left-3")
            : (Icon ? "left-12" : "left-4"),
        )}
      >
        {label}
      </label>

      {/* End Action */}
      {endAction && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer z-20 flex items-center justify-center">
          {endAction}
        </div>
      )}
    </div>
  );
}));
FloatingInput.displayName = "FloatingInput";

// FloatingSelect
export interface FloatingSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  icon?: React.ComponentType<any>;
}

export const FloatingSelect = React.forwardRef<HTMLSelectElement, FloatingSelectProps>(
  ({ className, label, icon: Icon, children, id, ...props }, ref) => {
    return (
      <div className="relative w-full group/select">
        {/* Leading Icon */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none z-10">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <select
          ref={ref}
          id={id}
          className={cn(
            "peer block w-full bg-transparent bg-none text-body-lg text-on-surface border border-outline rounded-sm focus:border-primary focus:border-2 focus:outline-none transition-all py-3.5 pr-10 appearance-none cursor-pointer",
            Icon ? "pl-12" : "pl-4",
            className
          )}
          {...props}
        >
          {children}
        </select>

        {/* Custom Chevron Indicator */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none z-10">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Floating Label */}
        <label
          htmlFor={id}
          className={cn(
            "absolute z-10 origin-left bg-surface-container-lowest px-1.5 text-on-surface-variant transition-all duration-200 pointer-events-none select-none top-0 scale-[0.82] text-primary",
            Icon ? "left-12" : "left-4"
          )}
        >
          {label}
        </label>
      </div>
    );
  }
);
FloatingSelect.displayName = "FloatingSelect";

// Combobox
export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
}

export interface ComboboxProps {
  label: string;
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ComponentType<any>;
  className?: string;
  id?: string;
  size?: "md" | "sm";
  variant?: "outlined" | "minimal" | "borderless";
  searchable?: boolean;
}

export const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(
  ({ label, options, value, onChange, placeholder = "Buscar...", icon: Icon, className, id, size = "md", variant = "outlined", searchable = true }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [mounted, setMounted] = React.useState(false);
    const [coords, setCoords] = React.useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

    const containerRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    const updateCoords = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      }
    };

    React.useEffect(() => {
      if (isOpen) {
        updateCoords();
        window.addEventListener("scroll", updateCoords, true);
        window.addEventListener("resize", updateCoords);
      }
      return () => {
        window.removeEventListener("scroll", updateCoords, true);
        window.removeEventListener("resize", updateCoords);
      };
    }, [isOpen]);

    React.useEffect(() => {
      const handleOutsideClick = (e: MouseEvent) => {
        const clickedInsideTrigger = containerRef.current && containerRef.current.contains(e.target as Node);
        const clickedInsideDropdown = dropdownRef.current && dropdownRef.current.contains(e.target as Node);
        if (!clickedInsideTrigger && !clickedInsideDropdown) {
          setIsOpen(false);
        }
      };
      if (isOpen) {
        document.addEventListener("mousedown", handleOutsideClick);
      }
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    }, [isOpen]);

    React.useEffect(() => {
      if (!isOpen) {
        setSearchQuery("");
      }
    }, [isOpen]);

    const selectedOption = options.find((opt) => opt.value === value);

    const filteredOptions = options.filter((opt) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        opt.label.toLowerCase().includes(query) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(query)) ||
        opt.value.toLowerCase().includes(query)
      );
    });

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative w-full group/select transition-all duration-200",
          variant === "minimal"
            ? "border-b border-outline-variant focus-within:border-primary hover:bg-on-surface/[0.04] focus-within:bg-on-surface/[0.06] rounded-t-md px-3"
            : "",
          variant === "borderless"
            ? "border-b border-transparent focus-within:border-primary focus-within:border-b hover:bg-on-surface/[0.04] focus-within:bg-on-surface/[0.06] rounded-md focus-within:rounded-b-none focus-within:rounded-t-md px-3"
            : "",
          className
        )}
        id={id}
      >
        {/* Trigger Button */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center bg-transparent text-on-surface focus:outline-none transition-all pr-10 cursor-pointer text-left select-none",
            variant === "minimal" || variant === "borderless"
              ? "border-0 rounded-none pt-5 pb-1 px-0 text-body-lg"
              : (size === "sm" ? "h-8 py-1 rounded-lg text-label-md border border-outline px-4" : "py-3.5 rounded-xl text-body-lg border border-outline px-4"),
            Icon ? (variant === "minimal" || variant === "borderless" ? "pl-8" : (size === "sm" ? "pl-9" : "pl-12")) : (variant === "minimal" || variant === "borderless" ? "pl-0" : (size === "sm" ? "pl-3" : "pl-4")),
            isOpen && variant !== "minimal" && variant !== "borderless" ? (size === "sm" ? "h-8 py-[3px] border-primary border-2" : "py-3 border-primary border-2") : ""
          )}
        >
          {Icon && (
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none",
                variant === "minimal" || variant === "borderless" ? "left-3" : "left-3"
              )}
            >
              <Icon className={size === "sm" || variant === "minimal" || variant === "borderless" ? "w-4 h-4" : "w-5 h-5"} />
            </div>
          )}
          
          <span className="truncate w-full pr-2">
            {selectedOption ? (
              <span className="flex items-center gap-1.5 w-full">
                <span className="truncate">{selectedOption.label}</span>
                {selectedOption.sublabel && (
                  <span className="text-on-surface-variant/80 text-body-md font-normal shrink-0">
                    — {selectedOption.sublabel}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-on-surface-variant/50">
                {variant === "minimal" || variant === "borderless" ? "" : placeholder}
              </span>
            )}
          </span>

          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none",
              variant === "minimal" || variant === "borderless" ? "right-3" : "right-3"
            )}
          >
            <ChevronDown className={cn(size === "sm" || variant === "minimal" || variant === "borderless" ? "w-4 h-4" : "w-5 h-5", "transition-transform duration-200")} style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
          </div>
        </button>

        {/* Floating Label */}
        {label && (
          <label
            className={cn(
              "absolute z-10 origin-left text-on-surface-variant transition-all duration-200 pointer-events-none select-none",
              variant === "minimal" || variant === "borderless" ? "bg-transparent" : "bg-surface-container-lowest px-1.5",
              variant === "minimal" || variant === "borderless"
                ? cn("top-1/2 -translate-y-1/2 text-body-lg", value ? "opacity-0 pointer-events-none" : "opacity-100")
                : "top-0 scale-[0.82] text-primary",
              variant === "minimal" || variant === "borderless"
                ? (Icon ? "left-11" : "left-3")
                : (Icon ? "left-12" : "left-4")
            )}
          >
            {label}
          </label>
        )}

        {/* Dropdown Panel in React Portal */}
        {isOpen && mounted && createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
            }}
            className="bg-surface-container-high border border-outline-variant/60 rounded-xl shadow-xl shadow-primary/5 max-h-60 overflow-hidden flex flex-col z-[9999] animate-in fade-in slide-in-from-top-2 duration-150"
          >
            {/* Search Input Box */}
            {searchable && (
              <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low border-b border-outline-variant/60 shrink-0">
                <Search className="w-4 h-4 text-on-surface-variant shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-transparent text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none"
                  autoFocus
                />
              </div>
            )}

            {/* Options List */}
            <div className="overflow-y-auto custom-scrollbar flex-1 py-1 max-h-48">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full mx-2 my-0.5 px-4 py-2.5 flex items-center justify-between text-left hover:bg-surface-variant/80 border-none rounded-lg active:scale-100 shadow-none font-normal text-body-md text-on-surface transition-colors cursor-pointer",
                        isSelected ? "bg-primary/10 text-primary hover:bg-primary/15" : "",
                        "max-w-[calc(100%-16px)]"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isSelected ? (
                          <Check className="w-4 h-4 text-primary shrink-0" />
                        ) : (
                          <div className="w-4 h-4 shrink-0" /> // Spacer
                        )}
                        <span className={cn("truncate", isSelected ? "font-semibold" : "")}>
                          {opt.label}
                        </span>
                      </div>
                      {opt.sublabel && (
                        <span className={cn("text-body-sm ml-2 shrink-0", isSelected ? "text-primary/80" : "text-on-surface-variant")}>
                          {opt.sublabel}
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-3 text-body-sm text-on-surface-variant/60 text-center select-none">
                  No se encontraron resultados
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }
);
Combobox.displayName = "Combobox";

// FloatingTextarea
export interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  variant?: "outlined" | "minimal" | "borderless";
}

export const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ className, label, id, variant = "outlined", ...props }, ref) => {
    return (
      <div
        className={cn(
          "relative w-full group/textarea transition-all duration-200",
          variant === "minimal"
            ? "border-b border-outline-variant focus-within:border-primary hover:bg-on-surface/[0.04] focus-within:bg-on-surface/[0.06] rounded-t-md px-3"
            : "",
          variant === "borderless"
            ? "border-b border-transparent focus-within:border-primary focus-within:border-b hover:bg-on-surface/[0.04] focus-within:bg-on-surface/[0.06] rounded-md focus-within:rounded-b-none focus-within:rounded-t-md px-3"
            : ""
        )}
      >
        <textarea
          ref={ref}
          id={id}
          placeholder=" "
          className={cn(
            "peer block w-full bg-transparent text-body-lg text-on-surface focus:outline-none transition-all resize-none",
            variant === "minimal" || variant === "borderless"
              ? "border-0 rounded-none focus:ring-0 py-2 px-0 shadow-none"
              : "border border-outline rounded-sm focus:border-primary focus:border-2 py-3.5 px-4",
            className
          )}
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            "absolute z-10 origin-left text-on-surface-variant transition-all duration-200 pointer-events-none select-none",
            variant === "minimal" || variant === "borderless" ? "bg-transparent left-3" : "bg-surface-container-lowest px-1.5 left-4",
            variant === "minimal" || variant === "borderless"
              ? "top-5 -translate-y-1/2 text-body-lg peer-[:not(:placeholder-shown)]:opacity-0 peer-[:not(:placeholder-shown)]:pointer-events-none"
              : "top-6 -translate-y-1/2 text-body-lg peer-focus:top-0 peer-focus:scale-[0.82] peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:scale-[0.82]"
          )}
        >
          {label}
        </label>
      </div>
    );
  }
);
FloatingTextarea.displayName = "FloatingTextarea";


// Separator
export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-outline-variant/50 shrink-0",
          orientation === "horizontal" ? "h-[1px] w-full" : "w-[1px] h-full",
          className,
        )}
        {...props}
      />
    );
  },
);
Separator.displayName = "Separator";

// Button
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variantClasses = {
      primary:
        "bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary shadow-sm",
      secondary:
        "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 shadow-sm",
      outline:
        "border border-outline text-primary hover:bg-surface-container shadow-sm",
      ghost:
        "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors",
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-[0.7rem] rounded",
      md: "px-5 py-2 text-[0.75rem] rounded-md",
      lg: "px-6 py-2.5 text-[0.875rem] rounded-md",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50 gap-2",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";


// Select
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ComponentType<any>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, icon: Icon, children, ...props }, ref) => {
    return (
      <div className="relative w-full group/select">
        {/* Leading Icon */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within/select:text-primary pointer-events-none z-10">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <select
          ref={ref}
          className={cn(
            "block w-full bg-surface bg-none text-body-lg text-on-surface border border-outline rounded-sm focus:border-primary focus:border-2 focus:outline-none transition-all py-3 shadow-sm appearance-none cursor-pointer pr-10",
            Icon ? "pl-12" : "pl-4",
            className,
          )}
          {...props}
        >
          {children}
        </select>

        {/* Custom Chevron Indicator */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none transition-colors group-focus-within/select:text-primary z-10">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";


// Textarea
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "block w-full px-4 py-3 bg-surface text-body-lg text-on-surface border border-outline rounded-sm focus:border-primary focus:border-2 focus:outline-none transition-all shadow-sm resize-none custom-scrollbar",
          className,
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";


// Skeleton
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("animate-pulse rounded bg-outline-variant/30", className)}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";


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
          className,
        )}
        {...props}
      >
        {Icon && (
          <div className="p-3 bg-surface-container text-on-surface-variant rounded-full">
            <Icon className="w-8 h-8 text-on-surface-variant" />
          </div>
        )}
        <div className="flex flex-col gap-1 max-w-sm">
          <h3 className="font-title-md text-title-md text-on-surface font-semibold">
            {title}
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {description}
          </p>
        </div>
        {action && <div className="mt-2">{action}</div>}
      </div>
    );
  }
);
Empty.displayName = "Empty";


// Global ContextMenu manager — ensures only one menu is open at a time
let _activeContextMenuClose: (() => void) | null = null;

function registerContextMenu(closeFn: () => void) {
  if (_activeContextMenuClose && _activeContextMenuClose !== closeFn) {
    _activeContextMenuClose(); // close the previously open menu
  }
  _activeContextMenuClose = closeFn;
}

function unregisterContextMenu(closeFn: () => void) {
  if (_activeContextMenuClose === closeFn) {
    _activeContextMenuClose = null;
  }
}

// ContextMenu Context
interface ContextMenuContextType {
  isOpen: boolean;
  x: number;
  y: number;
  openMenu: (e: React.MouseEvent | TouchEvent | React.TouchEvent, clientX: number, clientY: number) => void;
  closeMenu: () => void;
}

const ContextMenuContext = React.createContext<ContextMenuContextType | null>(null);

export interface ContextMenuProps {
  children: React.ReactNode;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [coords, setCoords] = React.useState({ x: 0, y: 0 });

  const closeMenu = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const openMenu = React.useCallback((e: React.MouseEvent | TouchEvent | React.TouchEvent, clientX: number, clientY: number) => {
    registerContextMenu(closeMenu); // close any other open menu first
    setCoords({ x: clientX, y: clientY });
    setIsOpen(true);
  }, [closeMenu]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleClose = () => closeMenu();
    document.addEventListener("click", handleClose);
    window.addEventListener("scroll", handleClose);
    window.addEventListener("resize", handleClose);
    return () => {
      document.removeEventListener("click", handleClose);
      window.removeEventListener("scroll", handleClose);
      window.removeEventListener("resize", handleClose);
      unregisterContextMenu(closeMenu);
    };
  }, [isOpen, closeMenu]);

  return (
    <ContextMenuContext.Provider value={{ isOpen, x: coords.x, y: coords.y, openMenu, closeMenu }}>
      {children}
    </ContextMenuContext.Provider>
  );
};

// ContextMenuTrigger
export interface ContextMenuTriggerProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  disabled?: boolean;
}

export const ContextMenuTrigger = React.forwardRef<HTMLElement, ContextMenuTriggerProps>(
  ({ children, disabled, className, as: Component = "div", ...props }, ref) => {
    const context = React.useContext(ContextMenuContext);
    if (!context) throw new Error("ContextMenuTrigger must be used within ContextMenu");

    const touchTimer = React.useRef<NodeJS.Timeout | null>(null);
    const touchStartCoords = React.useRef<{ x: number; y: number } | null>(null);

    const handleContextMenu = (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      context.openMenu(e, e.clientX, e.clientY);
    };

    // Long press detection for mobile/touch devices
    const handleTouchStart = (e: React.TouchEvent) => {
      if (disabled) return;
      const touch = e.touches[0];
      touchStartCoords.current = { x: touch.clientX, y: touch.clientY };

      touchTimer.current = setTimeout(() => {
        context.openMenu(e, touch.clientX, touch.clientY);
      }, 500); // 500ms long-press
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!touchStartCoords.current) return;
      const touch = e.touches[0];
      const diffX = Math.abs(touch.clientX - touchStartCoords.current.x);
      const diffY = Math.abs(touch.clientY - touchStartCoords.current.y);
      // Cancel long press if user drags or scrolls
      if (diffX > 10 || diffY > 10) {
        if (touchTimer.current) {
          clearTimeout(touchTimer.current);
          touchTimer.current = null;
        }
      }
    };

    const handleTouchEnd = () => {
      if (touchTimer.current) {
        clearTimeout(touchTimer.current);
        touchTimer.current = null;
      }
      touchStartCoords.current = null;
    };

    return (
      <Component
        ref={ref}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={className}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
ContextMenuTrigger.displayName = "ContextMenuTrigger";

// ContextMenuContent
export interface ContextMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ContextMenuContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(
  ({ children, className, ...props }, ref) => {
    const context = React.useContext(ContextMenuContext);
    if (!context) throw new Error("ContextMenuContent must be used within ContextMenu");
    
    const [mounted, setMounted] = React.useState(false);
    const [computedPos, setComputedPos] = React.useState<{ top: number; left: number } | null>(null);
    const localRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    // Screen boundary checks
    React.useEffect(() => {
      if (!context.isOpen || !mounted) return;
      
      const updatePosition = () => {
        const menuEl = localRef.current;
        if (!menuEl) return;

        const menuWidth = menuEl.offsetWidth || 180;
        const menuHeight = menuEl.offsetHeight || 220;

        let posX = context.x;
        let posY = context.y;

        if (context.x + menuWidth > window.innerWidth) {
          posX = context.x - menuWidth;
        }
        if (context.y + menuHeight > window.innerHeight) {
          posY = context.y - menuHeight;
        }

        setComputedPos({
          top: posY + window.scrollY,
          left: Math.max(8, posX + window.scrollX),
        });
      };

      const frame = requestAnimationFrame(updatePosition);
      return () => cancelAnimationFrame(frame);
    }, [context.isOpen, context.x, context.y, mounted, children]);

    if (!context.isOpen || !mounted) return null;

    const contentElement = (
      <div
        ref={(el) => {
          localRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        style={computedPos ? {
          position: "absolute",
          top: `${computedPos.top}px`,
          left: `${computedPos.left}px`,
        } : {
          position: "absolute",
          visibility: "hidden", // Hide initially while measuring
          top: `${context.y + window.scrollY}px`,
          left: `${context.x + window.scrollX}px`,
        }}
        className={cn(
          "w-48 bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-lg py-2 z-[9999] animate-in fade-in zoom-in-95 duration-100 origin-top-left flex flex-col gap-0.5",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    );

    return createPortal(contentElement, document.body);
  }
);
ContextMenuContent.displayName = "ContextMenuContent";

// ContextMenuItem
export interface ContextMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "error";
}

export const ContextMenuItem = React.forwardRef<HTMLButtonElement, ContextMenuItemProps>(
  ({ children, className, variant = "default", onClick, ...props }, ref) => {
    const context = React.useContext(ContextMenuContext);
    if (!context) throw new Error("ContextMenuItem must be used within ContextMenu");

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      context.closeMenu();
      if (onClick) onClick(e);
    };

    const variantClasses = {
      default: "text-on-surface hover:bg-secondary-container/30",
      error: "text-error hover:bg-error-container/15",
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        className={cn(
          "w-full px-4 py-2 text-left font-label-md text-label-md hover:bg-surface-container justify-start shadow-none active:scale-100 flex items-center gap-2.5 transition-colors cursor-pointer select-none border-none bg-transparent",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ContextMenuItem.displayName = "ContextMenuItem";

// ContextMenuSeparator
export const ContextMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("my-1 border-t border-outline-variant/50", className)}
    {...props}
  />
));
ContextMenuSeparator.displayName = "ContextMenuSeparator";

// PageHeader
export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, actions, ...props }, ref) => {
    return (
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
    );
  }
);
PageHeader.displayName = "PageHeader";

