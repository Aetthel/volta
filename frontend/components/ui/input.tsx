import * as React from "react";
import { cn, formatPhoneNumber } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "sm" | "md" | "lg";
  leftIcon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  rightIcon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  autoFormatPhone?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      inputSize = "md",
      leftIcon,
      rightIcon,
      icon,
      onChange,
      autoFormatPhone = true,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "h-8 px-2.5 py-1 text-xs rounded-lg",
      md: "h-10 px-3 py-2 text-sm rounded-xl",
      lg: "h-12 px-4 py-3 text-base rounded-2xl",
    };

    const renderIconNode = (
      nodeOrComponent: React.ComponentType<{ className?: string }> | React.ReactNode
    ): React.ReactNode => {
      if (!nodeOrComponent) return null;
      if (React.isValidElement(nodeOrComponent)) {
        return nodeOrComponent;
      }
      if (
        typeof nodeOrComponent === "function" ||
        (typeof nodeOrComponent === "object" && nodeOrComponent !== null)
      ) {
        const IconComp = nodeOrComponent as React.ComponentType<{ className?: string }>;
        return <IconComp className="w-4 h-4 text-on-surface-variant/70 shrink-0" />;
      }
      return null;
    };

    const effectiveLeftIcon = renderIconNode(leftIcon || icon);
    const effectiveRightIcon = renderIconNode(rightIcon);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (type === "tel" && autoFormatPhone) {
        const formatted = formatPhoneNumber(e.target.value);
        e.target.value = formatted;
      }
      onChange?.(e);
    };

    const processedValue =
      type === "tel" && autoFormatPhone && typeof props.value === "string"
        ? formatPhoneNumber(props.value)
        : props.value;

    const inputElement = (
      <input
        type={type}
        ref={ref}
        onChange={handleChange}
        {...props}
        {...(processedValue !== undefined ? { value: processedValue } : {})}
        className={cn(
          "flex w-full bg-surface border border-outline-variant/80 text-on-surface shadow-xs transition-all duration-150",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-on-surface",
          "placeholder:text-on-surface-variant/50 placeholder:font-normal",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-container-low",
          "aria-invalid:border-error aria-invalid:ring-error/20 aria-invalid:text-on-surface",
          sizeClasses[inputSize] || sizeClasses.md,
          effectiveLeftIcon && "pl-9",
          effectiveRightIcon && "pr-9",
          className
        )}
      />
    );

    if (effectiveLeftIcon || effectiveRightIcon) {
      return (
        <div className="relative flex items-center w-full">
          {effectiveLeftIcon && (
            <span className="absolute left-3 flex items-center pointer-events-none text-on-surface-variant/70 z-10">
              {effectiveLeftIcon}
            </span>
          )}
          {inputElement}
          {effectiveRightIcon && (
            <span className="absolute right-3 flex items-center text-on-surface-variant/70 z-10">
              {effectiveRightIcon}
            </span>
          )}
        </div>
      );
    }

    return inputElement;
  }
);
Input.displayName = "Input";

export default Input;
