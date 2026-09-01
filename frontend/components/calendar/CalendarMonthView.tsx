"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { EventCard, type CalendarEvent } from "./EventCard";

interface CalendarMonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (date: Date) => void;
  onDragStart: (event: CalendarEvent) => void;
  onDragEnd: () => void;
  onDrop: (date: Date) => void;
  getColorClasses: (color: string) => { bg: string; text: string };
  isDayClosed?: (date: Date) => boolean;
}

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  currentDate,
  events,
  onEventClick,
  onSlotClick,
  onDragStart,
  onDragEnd,
  onDrop,
  getColorClasses,
  isDayClosed,
}) => {
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7)); // Start on Monday

  const days: Date[] = [];
  const currentDay = new Date(startDate);

  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startTime);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <div className="w-full h-full flex flex-col min-w-[700px]">
      <div className="grid grid-cols-7 border-b border-outline-variant/30 bg-surface-container-low/50 sticky top-0 z-20">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
          <div
            key={day}
            className="border-r border-outline-variant/30 p-2.5 text-center text-xs font-semibold text-on-surface-variant last:border-r-0 sm:text-sm"
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();
          const closed = isDayClosed?.(day) ?? false;

          return (
            <div
              key={index}
              data-day-cell
              data-closed={closed || undefined}
              className={cn(
                "min-h-24 border-b border-r border-outline-variant/30 p-1.5 transition-colors last:border-r-0 sm:min-h-28 sm:p-2",
                !isCurrentMonth && "bg-surface-container-low/30 opacity-60",
                closed
                  ? "bg-surface-container-high/40 cursor-not-allowed"
                  : "cursor-pointer hover:bg-surface-container-low/60"
              )}
              aria-disabled={closed || undefined}
              onClick={
                closed
                  ? undefined
                  : () => {
                      const clickDate = new Date(day);
                      clickDate.setHours(9, 0, 0, 0);
                      onSlotClick(clickDate);
                    }
              }
              // Sin preventDefault en onDragOver el navegador rechaza el soltar,
              // así que el evento arrastrado vuelve a su fecha original.
              onDragOver={closed ? undefined : (e) => e.preventDefault()}
              onDrop={closed ? undefined : () => onDrop(day)}
            >
              <div className="mb-1.5 flex items-center justify-between gap-1">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs sm:text-sm font-semibold",
                    isToday
                      ? "bg-primary text-on-primary"
                      : closed
                        ? "text-on-surface-variant/50"
                        : "text-on-surface"
                  )}
                >
                  {day.getDate()}
                </div>
                {closed && (
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-on-surface-variant/60 sm:text-[10px]">
                    Cerrado
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 4).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEventClick={onEventClick}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    getColorClasses={getColorClasses}
                    variant="compact"
                  />
                ))}
                {dayEvents.length > 4 && (
                  <div className="text-[10px] text-on-surface-variant font-medium sm:text-xs">
                    +{dayEvents.length - 4} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
