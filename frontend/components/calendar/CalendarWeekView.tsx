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
            return (
              <div
                key={day.toISOString()}
                className="border-r border-outline-variant/30 p-2 text-center text-xs font-medium last:border-r-0 sm:text-sm"
              >
                <div
                  className={cn(
                    "hidden sm:block capitalize",
                    isToday ? "text-primary font-bold" : "text-on-surface font-semibold"
                  )}
                >
                  {day.toLocaleDateString("es-ES", { weekday: "short" })}
                </div>
                <div className="sm:hidden capitalize font-semibold">
                  {day.toLocaleDateString("es-ES", { weekday: "narrow" })}
                </div>
                <div
                  className={cn(
                    "text-[11px]",
                    isToday ? "text-primary font-bold" : "text-on-surface-variant"
                  )}
                >
                  {day.toLocaleDateString("es-ES", { month: "short", day: "numeric" })}
                </div>
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

            return (
              <div
                key={day.toISOString()}
                className="relative border-r border-outline-variant/30 last:border-r-0"
                style={{ height: `${TOTAL_GRID_HEIGHT}px` }}
              >
                {/* Background Hour Slots */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    style={{ height: `${HOUR_HEIGHT}px` }}
                    className="border-b border-outline-variant/20 hover:bg-surface-container-low/50 cursor-pointer transition-colors"
                    onClick={() => {
                      const slotDate = new Date(day);
                      slotDate.setHours(hour, 0, 0, 0);
                      onSlotClick(slotDate);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDrop(day, hour)}
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
            );
          })}
        </div>
      </div>
    </div>
  );
};
