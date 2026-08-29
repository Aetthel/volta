"use client";

import { useState, useCallback } from "react";

export type CalendarViewType = "month" | "week" | "day" | "list";

export function useCalendarNavigation(initialDate: Date = new Date(), initialView: CalendarViewType = "month") {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [view, setView] = useState<CalendarViewType>(initialView);

  const navigateDate = useCallback(
    (direction: "prev" | "next") => {
      setCurrentDate((prev) => {
        const newDate = new Date(prev);
        if (view === "month") {
          newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
        } else if (view === "week") {
          newDate.setDate(prev.getDate() + (direction === "next" ? 7 : -7));
        } else if (view === "day" || view === "list") {
          newDate.setDate(prev.getDate() + (direction === "next" ? 1 : -1));
        }
        return newDate;
      });
    },
    [view]
  );

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const getFormattedTitle = useCallback(() => {
    if (view === "month") {
      return currentDate.toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      });
    }

    if (view === "week") {
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const sameMonth = startOfWeek.getMonth() === endOfWeek.getMonth();
      const startStr = startOfWeek.toLocaleDateString("es-ES", {
        day: "numeric",
        month: sameMonth ? undefined : "short",
      });
      const endStr = endOfWeek.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      return `${startStr} – ${endStr}`;
    }

    return currentDate.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [currentDate, view]);

  return {
    currentDate,
    setCurrentDate,
    view,
    setView,
    navigateDate,
    goToToday,
    getFormattedTitle,
  };
}
