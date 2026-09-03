"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Encabezado de bloque de las pantallas de ajustes. Sin tarjetas que envuelvan
 * el contenido, el peso tipográfico y el aire son lo único que separa un bloque
 * del siguiente, así que todos los bloques tienen que titularse igual.
 */
export interface SectionHeadingProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  /** Acepta JSX para poder forzar un salto de línea concreto con `<br />`. */
  description?: React.ReactNode;
  /** Contenido a la derecha del título: badges de estado, píldoras, etc. */
  trailing?: React.ReactNode;
  /** 2 cuando el bloque cuelga directamente del título de página. */
  headingLevel?: 2 | 3;
  className?: string;
}

export function SectionHeading({
  icon: Icon,
  title,
  description,
  trailing,
  headingLevel = 3,
  className,
}: SectionHeadingProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <div className={cn("flex flex-col gap-1.5 mb-6", className)}>
      <div className="flex items-center gap-2.5 flex-wrap">
        <Icon className="w-5 h-5 text-primary shrink-0" strokeWidth={2.2} />
        <Heading className="text-lg sm:text-xl font-bold text-on-surface tracking-tight">{title}</Heading>
        {trailing}
      </div>
      {description && (
        <p className="text-sm text-on-surface-variant/85 leading-relaxed max-w-[68ch]">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
