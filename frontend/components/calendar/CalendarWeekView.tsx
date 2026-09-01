"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TimeGridEventCard, layoutDayEvents } from "./TimeGridEventCard";
import type { CalendarEvent } from "./EventCard";

interface CalendarWeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (date: Date) => void;
  onDragStart: (event: CalendarEvent) => void;
  onDragEnd: () => void;
  onDrop: (date: Date, hour: number) => void;
  getColorClasses: (color: string) => { bg: string; text: string };
  isDayClosed?: (date: Date) => boolean;
  getClosedLabel?: (date: Date) => string | undefined;
}

export const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
  currentDate,
  events,
  onEventClick,
  onSlotClick,
  onDragStart,
  onDragEnd,
  onDrop,
  getColorClasses,
  isDayClosed,
  getClosedLabel,
}) => {
  const startOfWeek = new Date(currentDate);
  const dayOfWeek = (currentDate.getDay() + 6) % 7;
  startOfWeek.setDate(currentDate.getDate() - dayOfWeek);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  const START_HOUR = 8;
  const hours = Array.from({ length: 14 }, (_, i) => i + START_HOUR);
  const HOUR_HEIGHT = 64;
  const TOTAL_GRID_HEIGHT = hours.length * HOUR_HEIGHT;

  return (
    <div className="w-full h-full overflow-auto">
      {/* Sticky Day Header */}
      <div className="flex border-b border-outline-variant/30 bg-surface-container-low/50 min-w-[750px] sticky top-0 z-20">
        <div className="w-14 sm:w-16 flex-shrink-0 border-r border-outline-variant/30 p-2.5 text-center text-xs font-semibold text-on-surface-variant sm:text-sm">
          Hora
        </div>
        <div className="grid grid-cols-7 flex-1">
          {weekDays.map((day) => {
            const isToday = day.toDateString() === new Date().toDateString();
            const closed = isDayClosed?.(day) ?? false;
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "border-r border-outline-variant/30 p-2 text-center text-xs font-medium last:border-r-0 sm:text-sm",
                  closed && "bg-surface-container-high/50"
                )}
              >
                <div
                  className={cn(
                    "hidden sm:block capitalize",
                    closed
                      ? "text-on-surface-variant/50 font-semibold"
                      : isToday
                        ? "text-primary font-bold"
                        : "text-on-surface font-semibold"
                  )}
                >
                  {day.toLocaleDateString("es-ES", { weekday: "short" })}
                </div>
                <div
                  className={cn(
                    "sm:hidden capitalize font-semibold",
                    closed && "text-on-surface-variant/50"
                  )}
                >
                  {day.toLocaleDateString("es-ES", { weekday: "narrow" })}
                </div>
                <div
                  className={cn(
                    "text-[11px]",
                    closed
                      ? "text-on-surface-variant/50"
                      : isToday
                        ? "text-primary font-bold"
                        : "text-on-surface-variant"
                  )}
                >
                  {day.toLocaleDateString("es-ES", { month: "short", day: "numeric" })}
                </div>
                {closed && (
                  <div
                    className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant/60"
                    title={getClosedLabel?.(day) ?? "Cerrado"}
                  >
                    {getClosedLabel?.(day) ?? "Cerrado"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Grid Body */}
      <div className="flex min-w-[750px] relative">
        {/* Time Column */}
        <div className="w-14 sm:w-16 flex-shrink-0 border-r border-outline-variant/30 select-none bg-surface-container-lowest/40">
          {hours.map((hour) => (
            <div
              key={hour}
              style={{ height: `${HOUR_HEIGHT}px` }}
              className="border-b border-outline-variant/30 p-1 text-[11px] font-medium text-on-surface-variant/70 text-center flex items-start justify-center pt-1"
            >
              {hour.toString().padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* 7 Day Columns */}
        <div className="grid grid-cols-7 flex-1">
          {weekDays.map((day) => {
            const dayEvents = events.filter((event) => {
              const eventDate = new Date(event.startTime);
              return (
                eventDate.getDate() === day.getDate() &&
                eventDate.getMonth() === day.getMonth() &&
                eventDate.getFullYear() === day.getFullYear()
              );
            });

            const laidOutEvents = layoutDayEvents(dayEvents);
            const closed = isDayClosed?.(day) ?? false;

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "relative border-r border-outline-variant/30 last:border-r-0",
                  closed && "bg-surface-container-high/40"
                )}
                style={{ height: `${TOTAL_GRID_HEIGHT}px` }}
                aria-disabled={closed || undefined}
              >
                {/* Background Hour Slots */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    data-day-slot
                    data-closed={closed || undefined}
                    style={{ height: `${HOUR_HEIGHT}px` }}
                    className={cn(
                      "border-b border-outline-variant/20 transition-colors",
                      closed
                        ? "cursor-not-allowed"
                        : "hover:bg-surface-container-low/50 cursor-pointer"
                    )}
                    onClick={
                      closed
                        ? undefined
                        : () => {
                            const slotDate = new Date(day);
                            slotDate.setHours(hour, 0, 0, 0);
                            onSlotClick(slotDate);
                          }
                    }
                    // Sin onDragOver que haga preventDefault, el navegador no
                    // acepta el soltar: así un evento arrastrado a un día cerrado
                    // vuelve a su sitio en lugar de reagendarse.
                    onDragOver={closed ? undefined : (e) => e.preventDefault()}
                    onDrop={closed ? undefined : () => onDrop(day, hour)}
                  />
                ))}

                {closed && (
                  <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-6">
                    <span className="max-w-[90%] truncate rounded-full bg-surface-container-highest/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant/70">
                      {getClosedLabel?.(day) ?? "Cerrado"}
                    </span>
                  </div>
                )}

                {/* Proportional Height Event Cards */}
                {laidOutEvents.map(
                  ({ event, top, height, leftOffsetPercent, widthPercent }) => (
                    <TimeGridEventCard
                      key={event.id}
                      event={event}
                      top={top}
                      height={height}
                      leftOffsetPercent={leftOffsetPercent}
                      widthPercent={widthPercent}
                      onEventClick={onEventClick}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                      getColorClasses={getColorClasses}
                    />
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
