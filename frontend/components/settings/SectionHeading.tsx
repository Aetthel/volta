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
  description?: string;
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
        <Icon className="w-4 h-4 text-primary shrink-0" strokeWidth={2.2} />
        <Heading className="text-base font-bold text-on-surface">{title}</Heading>
        {trailing}
      </div>
      {description && (
        // Sangrado igual al ancho del icono (1rem) más su separación (0.625rem),
        // para que la descripción arranque bajo la primera letra del título y no
        // bajo el icono. Va en margen y no en relleno para no comerse la medida.
        <p className="ml-6.5 text-sm text-on-surface-variant/85 leading-relaxed max-w-[62ch]">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
