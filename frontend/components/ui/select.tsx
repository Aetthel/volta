"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  labels: Record<string, React.ReactNode>;
  registerLabel: (value: string, node: React.ReactNode) => void;
}

const SelectContext = React.createContext<SelectContextType | null>(null);

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children: React.ReactNode;
}

export function Select({ value: controlledValue, onValueChange, defaultValue, children }: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const [open, setOpen] = React.useState(false);
  const [labels, setLabels] = React.useState<Record<string, React.ReactNode>>({});

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
      setOpen(false);
    },
    [controlledValue, onValueChange]
  );

  const registerLabel = React.useCallback((val: string, node: React.ReactNode) => {
    setLabels((prev) => (prev[val] === node ? prev : { ...prev, [val]: node }));
  }, []);

  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        open,
        setOpen,
        labels,
        registerLabel,
      }}
    >
      <div ref={containerRef} className="relative inline-block w-full">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  className,
  children,
  id,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(SelectContext);
  return (
    <button
      type="button"
      id={id}
      onClick={() => ctx?.setOpen((prev) => !prev)}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface shadow-xs hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-1" />
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(SelectContext);
  const currentLabel = ctx?.value ? ctx.labels[ctx.value] : null;
  return (
    <span className="block truncate text-left">
      {currentLabel || (ctx?.value ? ctx.value : <span className="text-on-surface-variant/50">{placeholder || "Select..."}</span>)}
    </span>
  );
}

export function SelectContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(SelectContext);
  if (!ctx?.open) return null;

  return (
    <div
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-outline-variant bg-surface-container-lowest p-1 text-on-surface shadow-lg animate-in fade-in-80",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SelectItem({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(SelectContext);

  React.useEffect(() => {
    ctx?.registerLabel(value, children);
  }, [value, children, ctx]);

  const isSelected = ctx?.value === value;

  return (
    <div
      onClick={() => ctx?.onValueChange?.(value)}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-surface-container-high focus:bg-surface-container-high transition-colors",
        isSelected && "font-medium text-primary bg-primary/10",
        className
      )}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-4 w-4 text-primary" />
        </span>
      )}
      {children}
    </div>
  );
}
