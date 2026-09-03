"use client";

import React, { useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CalendarEvent } from "./EventCard";

export interface TimeGridEventCardProps {
  event: CalendarEvent;
  top: number;
  height: number;
  onEventClick: (event: CalendarEvent) => void;
  onDragStart: (event: CalendarEvent) => void;
  onDragEnd: () => void;
  getColorClasses: (color: string) => { bg: string; text: string };
  leftOffsetPercent?: number;
  widthPercent?: number;
}

/**
 * Alto de una hora en la rejilla. Vive aquí porque la geometría del chip se
 * calcula contra este valor: si la vista de semana y la de día usaran otro, los
 * chips se cortarían. Ambas lo importan de aquí.
 */
export const HOUR_HEIGHT = 72;

/** Relleno vertical del chip (`py-1`, arriba y abajo). */
const CHIP_PAD_Y = 8;

/**
 * Caja de línea real de la tipografía del chip.
 *
 * 13 px y no 14 es lo que hace que una cita de 30 minutos muestre servicio Y
 * cliente: con HOUR_HEIGHT a 72 el chip mide 34 px, quedan 26 útiles, y a 13 px
 * por línea entran dos. Cambiar cualquiera de los dos números por debajo de esa
 * relación devuelve la cita corta a una sola línea con el título recortado.
 *
 * Los tamaños van en píxeles fijos y no en `text-label-*` a propósito: esas
 * escalan con la preferencia de tamaño de letra del usuario, y al hacerlo
 * desbordarían un alto que se calcula en píxeles contra HOUR_HEIGHT.
 */
const CHIP_LINE = 13;

export function layoutDayEvents(events: CalendarEvent[]) {
  const START_HOUR = 8;

  const sorted = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const items = sorted.map((event) => {
    const startHour = event.startTime.getHours();
    const startMin = event.startTime.getMinutes();

    const startTotalMins = (startHour - START_HOUR) * 60 + startMin;
    const durationMins = Math.max(
      15,
      Math.round((event.endTime.getTime() - event.startTime.getTime()) / 60000)
    );
    const endTotalMins = startTotalMins + durationMins;

    const top = Math.max(0, (startTotalMins / 60) * HOUR_HEIGHT);
    const height = Math.max(22, (durationMins / 60) * HOUR_HEIGHT - 2);

    return {
      event,
      top,
      height,
      startTotalMins,
      endTotalMins,
      leftOffsetPercent: 0,
      widthPercent: 100,
    };
  });

  // Calculate overlapping clusters
  for (let i = 0; i < items.length; i++) {
    const curr = items[i];
    const overlaps = items.filter(
      (other, j) =>
        i !== j &&
        curr.startTotalMins < other.endTotalMins &&
        curr.endTotalMins > other.startTotalMins
    );
    if (overlaps.length > 0) {
      const allCluster = [curr, ...overlaps].sort((a, b) => a.startTotalMins - b.startTotalMins);
      const totalColumns = allCluster.length;
      const indexInCluster = allCluster.findIndex((item) => item.event.id === curr.event.id);
      curr.widthPercent = Math.floor(100 / totalColumns);
      curr.leftOffsetPercent = curr.widthPercent * indexInCluster;
    }
  }

  return items;
}

export const TimeGridEventCard: React.FC<TimeGridEventCardProps> = ({
  event,
  top,
  height,
  onEventClick,
  onDragStart,
  onDragEnd,
  getColorClasses,
  leftOffsetPercent = 0,
  widthPercent = 100,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const colorClasses = getColorClasses(event.color);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = () => {
    const diff = event.endTime.getTime() - event.startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Cuántas líneas caben de verdad en este chip. Antes eran umbrales fijos
  // (38 / 60) que no cuadraban con el alto real del contenido, y la última fila
  // se renderizaba igualmente y salía cortada a media letra.
  const lineCount = Math.max(1, Math.floor((height - CHIP_PAD_Y) / CHIP_LINE));
  const showClient = lineCount >= 2 && Boolean(event.clientName);
  const showTimeRange = lineCount >= 3;
  const showTags = lineCount >= 4 && Boolean(event.tags?.length);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(event)}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        e.stopPropagation();
        onEventClick(event);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: `calc(${leftOffsetPercent}% + 2px)`,
        width: `calc(${widthPercent}% - 4px)`,
      }}
      className={cn(
        "absolute z-10 cursor-pointer rounded-md px-2 py-1 transition-all duration-150 shadow-xs flex flex-col select-none",
        colorClasses.bg,
        "text-white",
        isHovered && "z-30 ring-2 ring-white/80 shadow-md brightness-105"
      )}
    >
      {/* El recorte vive aquí y no en el contenedor: el tooltip de hover es
          hermano de este bloque, así que puede desbordar el chip. Colgado del
          contenedor recortado, como estaba, no se veía nunca. */}
      <div
        className={cn(
          "flex h-full min-h-0 flex-col overflow-hidden",
          lineCount === 1 ? "justify-center" : "justify-start"
        )}
      >
      {/* Una sola línea: el título manda. Ni hora de inicio ni rango — la
          posición del chip en la rejilla ya dice a qué hora empieza, y repetirlo
          dejaba título y cliente en puntos suspensivos. */}
      {lineCount === 1 ? (
        <div className="flex items-baseline gap-1.5 min-w-0">
          <span className="font-semibold text-[11px] leading-none truncate">{event.title}</span>
          {event.clientName && (
            <span className="text-[10px] leading-none opacity-85 truncate">
              {event.clientName}
            </span>
          )}
        </div>
      ) : (
        <>
          <div className="font-semibold text-[11px] leading-[13px] truncate">{event.title}</div>

          {showClient && (
            <div className="text-[10px] leading-[13px] opacity-90 truncate">
              {event.clientName}
            </div>
          )}

          {/* La duración entre paréntesis desaparece: es deducible del rango y
              era justo la pieza que empujaba la fila fuera del chip. */}
          {showTimeRange && (
            <div className="flex items-center gap-1 text-[10px] leading-[13px] opacity-80 min-w-0">
              <Clock className="w-3 h-3 shrink-0 opacity-80" />
              <span className="truncate">
                {formatTime(event.startTime)}–{formatTime(event.endTime)}
              </span>
            </div>
          )}

          {showTags && (
            <div className="flex flex-wrap gap-1 mt-auto pt-1">
              {event.tags!.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 text-[9px] leading-none font-semibold rounded bg-white/20 text-white backdrop-blur-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </>
      )}
      </div>

      {/* Hover Card / Tooltip Popup */}
      {isHovered && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-none">
          <Card className="border border-outline-variant p-3 shadow-xl bg-surface-container-lowest text-on-surface">
            <div className="space-y-1.5">
              <h4 className="font-bold text-sm leading-tight text-on-surface">{event.title}</h4>
              {event.clientName && (
                <p className="text-xs font-semibold text-primary">{event.clientName}</p>
              )}
              {event.description && (
                <p className="text-xs text-on-surface-variant line-clamp-2">{event.description}</p>
              )}
              <div className="flex items-center gap-1 text-xs text-on-surface-variant font-medium">
                <Clock className="h-3 w-3" />
                <span>
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </span>
                <span className="text-[10px] text-on-surface-variant/75">({getDuration()})</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {event.category && (
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {event.category}
                  </Badge>
                )}
                {event.tags?.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px] h-5">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
