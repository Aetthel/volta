"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TimeGridEventCard, layoutDayEvents } from "./TimeGridEventCard";
import type { CalendarEvent } from "./EventCard";

interface CalendarDayViewProps {
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

export const CalendarDayView: React.FC<CalendarDayViewProps> = ({
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
  const START_HOUR = 8;
  const hours = Array.from({ length: 14 }, (_, i) => i + START_HOUR);
  const HOUR_HEIGHT = 64;
  const TOTAL_GRID_HEIGHT = hours.length * HOUR_HEIGHT;

  const dayEvents = events.filter((event) => {
    const eventDate = new Date(event.startTime);
    return (
      eventDate.getDate() === currentDate.getDate() &&
      eventDate.getMonth() === currentDate.getMonth() &&
      eventDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const laidOutEvents = layoutDayEvents(dayEvents);
  const closed = isDayClosed?.(currentDate) ?? false;

  return (
    <div className="w-full h-full overflow-auto">
      <div className="flex min-w-[500px] relative">
        {/* Time Column */}
        <div className="w-16 sm:w-24 flex-shrink-0 border-r border-outline-variant/30 select-none bg-surface-container-lowest/40">
          {hours.map((hour) => (
            <div
              key={hour}
              style={{ height: `${HOUR_HEIGHT}px` }}
              className="border-b border-outline-variant/30 p-2 text-xs font-semibold text-on-surface-variant text-center flex items-start justify-center pt-1.5"
            >
              {hour.toString().padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* Day Column */}
        <div
          className={cn("flex-1 relative", closed && "bg-surface-container-high/40")}
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
                closed ? "cursor-not-allowed" : "hover:bg-surface-container-low/50 cursor-pointer"
              )}
              onClick={
                closed
                  ? undefined
                  : () => {
                      const slotDate = new Date(currentDate);
                      slotDate.setHours(hour, 0, 0, 0);
                      onSlotClick(slotDate);
                    }
              }
              // Sin preventDefault en onDragOver el navegador rechaza el soltar,
              // así que el evento arrastrado vuelve a su hueco original.
              onDragOver={closed ? undefined : (e) => e.preventDefault()}
              onDrop={closed ? undefined : () => onDrop(currentDate, hour)}
            />
          ))}

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
      </div>
    </div>
  );
};
