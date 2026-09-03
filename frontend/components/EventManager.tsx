"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useDraggableModal } from "@/lib/useDraggableModal";
import { useCalendarNavigation, type CalendarViewType } from "@/lib/hooks/useCalendarNavigation";
import { useCalendarFilters } from "@/lib/hooks/useCalendarFilters";
import { cn } from "@/lib/utils";
import { CalendarHeader, type ColorItem } from "./calendar/CalendarHeader";
import { CalendarMonthView } from "./calendar/CalendarMonthView";
import { CalendarWeekView } from "./calendar/CalendarWeekView";
import { CalendarDayView } from "./calendar/CalendarDayView";
import { CalendarListView } from "./calendar/CalendarListView";
import { EventEditDialog } from "./calendar/EventEditDialog";
import type { CalendarEvent } from "./calendar/EventCard";
import { SERVICE_PALETTES, getServicePalette } from "@/lib/serviceColors";

const UpgradeProModal = dynamic(() => import("@/components/UpgradeProModal"), {
  ssr: false,
});

export type Event = CalendarEvent;

export interface ColorOption extends ColorItem {
  label?: string;
  border?: string;
}

export interface EventManagerProps {
  events?: Event[];
  onEventCreate?: (event: Event) => void;
  onEventUpdate?: (id: string, event: Partial<Event>) => void;
  onEventDelete?: (id: string) => void;
  categories?: string[];
  colors?: ColorItem[];
  defaultView?: CalendarViewType;
  className?: string;
  availableTags?: string[];
  onOpenNewModal?: (prefilledDate?: Date) => void;
  /**
   * Días marcados como cerrados en Ajustes. Se pintan en gris y no admiten
   * citas ni actividades de grupo. Sin este prop el calendario se comporta como
   * si el negocio abriera todos los días.
   */
  isDayClosed?: (date: Date) => boolean;
  /** Motivo a mostrar en el día bloqueado: nombre del festivo o "Cerrado". */
  getClosedLabel?: (date: Date) => string | undefined;
}

export const defaultColors: ColorItem[] = SERVICE_PALETTES.map((p) => ({
  name: p.name,
  value: p.id,
  bg: p.bg,
  text: p.text,
  border: p.border,
}));

export function EventManager({
  events: initialEvents = [],
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  categories = [],
  colors = defaultColors,
  defaultView = "week",
  className,
  availableTags = ["Confirmada", "Pendiente", "Completada", "Cancelada"],
  onOpenNewModal,
  isDayClosed,
  getClosedLabel,
}: EventManagerProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [isQuotaUpgradeOpen, setIsQuotaUpgradeOpen] = useState(false);

  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    description: "",
    color: colors[0]?.value || "TEAL",
    category: categories[0] || "",
    tags: [],
  });

  // Custom Navigation Hook
  const {
    currentDate,
    setCurrentDate,
    view,
    setView,
    navigateDate,
    goToToday,
    getFormattedTitle,
  } = useCalendarNavigation(new Date(), defaultView);

  // Custom Filter Hook
  const {
    selectedColors,
    selectedTags,
    selectedCategories,
    filteredEvents,
    hasActiveFilters,
    clearFilters,
    toggleColor,
    toggleTag: toggleFilterTag,
    toggleCategory,
  } = useCalendarFilters(events);

  // Draggable Modal Hook
  const { position, handleMouseDown } = useDraggableModal({
    isOpen: isDialogOpen,
    modalWidth: 480,
    modalHeight: 580,
  });

  // Sync state if initialEvents changes from parent API updates
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  // Session & Basic Plan Quota
  const { data: session } = useSession();
  const subscriptionPlan = session?.user?.subscriptionPlan || "BASIC";
  const subscriptionStatus = session?.user?.subscriptionStatus || "ACTIVE";
  const isBasicActive = subscriptionPlan === "BASIC" && subscriptionStatus !== "TRIALING";

  const currentMonthApps = useMemo(() => {
    const now = new Date();
    return events.filter((e) => {
      const d = e.startTime instanceof Date ? e.startTime : new Date(e.startTime);
      return (
        !isNaN(d.getTime()) &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [events]);

  const isQuotaWarning = currentMonthApps >= 80 && currentMonthApps < 100;
  const isQuotaExceeded = currentMonthApps >= 100;

  const getColorClasses = useCallback(
    (colorValue: string) => {
      const customColor = colors.find(
        (c) => c.value === colorValue || c.value.toLowerCase() === colorValue?.toLowerCase()
      );
      if (customColor) return customColor;
      const palette = getServicePalette(colorValue);
      return {
        name: palette.name,
        value: palette.id,
        bg: palette.bg,
        text: palette.text,
        border: palette.border,
      };
    },
    [colors]
  );

  // Event Handlers
  const handleEventClick = useCallback((event: Event) => {
    setSelectedEvent(event);
    setIsCreating(false);
    setIsDialogOpen(true);
  }, []);

  const handleSlotClick = useCallback(
    (slotDate: Date) => {
      // Las vistas ya desactivan el hueco, pero la guarda evita que un camino
      // nuevo (atajo de teclado, otra vista) cuele una cita en día cerrado.
      if (isDayClosed?.(slotDate)) return;

      if (onOpenNewModal) {
        onOpenNewModal(slotDate);
        return;
      }
      setNewEvent({
        title: "",
        description: "",
        startTime: slotDate,
        endTime: new Date(slotDate.getTime() + 30 * 60000),
        color: colors[0]?.value || "TEAL",
        category: categories[0] || "",
        tags: [],
      });
      setIsCreating(true);
      setIsDialogOpen(true);
    },
    [onOpenNewModal, colors, categories, isDayClosed]
  );

  const handleDragStart = useCallback((event: Event) => {
    setDraggedEvent(event);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedEvent(null);
  }, []);

  const handleDrop = useCallback(
    (targetDate: Date, targetHour?: number) => {
      if (!draggedEvent) return;
      // Reagendar arrastrando a un día cerrado dejaría la cita fuera del horario
      // comercial, así que se descarta y el evento se queda donde estaba.
      if (isDayClosed?.(targetDate)) {
        setDraggedEvent(null);
        return;
      }

      const duration = draggedEvent.endTime.getTime() - draggedEvent.startTime.getTime();
      const newStartTime = new Date(targetDate);
      if (targetHour !== undefined) {
        newStartTime.setHours(targetHour, draggedEvent.startTime.getMinutes(), 0, 0);
      }
      const newEndTime = new Date(newStartTime.getTime() + duration);

      const updatedEvent = {
        ...draggedEvent,
        startTime: newStartTime,
        endTime: newEndTime,
      };

      setEvents((prev) => prev.map((e) => (e.id === draggedEvent.id ? updatedEvent : e)));
      onEventUpdate?.(draggedEvent.id, updatedEvent);
      setDraggedEvent(null);
    },
    [draggedEvent, onEventUpdate, isDayClosed]
  );

  const handleCreateEvent = useCallback(() => {
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) return;

    const event: Event = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEvent.title,
      description: newEvent.description,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      color: newEvent.color || colors[0]?.value || "TEAL",
      category: newEvent.category,
      attendees: newEvent.attendees,
      tags: newEvent.tags || [],
    };

    setEvents((prev) => [...prev, event]);
    onEventCreate?.(event);
    setIsDialogOpen(false);
    setIsCreating(false);
    setNewEvent({
      title: "",
      description: "",
      color: colors[0]?.value || "TEAL",
      category: categories[0] || "",
      tags: [],
    });
  }, [newEvent, colors, categories, onEventCreate]);

  const handleUpdateEvent = useCallback(() => {
    if (!selectedEvent) return;

    setEvents((prev) => prev.map((e) => (e.id === selectedEvent.id ? selectedEvent : e)));
    onEventUpdate?.(selectedEvent.id, selectedEvent);
    setIsDialogOpen(false);
    setSelectedEvent(null);
  }, [selectedEvent, onEventUpdate]);

  const handleDeleteEvent = useCallback(
    (id: string) => {
      setEvents((prev) => prev.filter((e) => e.id !== id));
      onEventDelete?.(id);
      setIsDialogOpen(false);
      setSelectedEvent(null);
    },
    [onEventDelete]
  );

  const toggleTag = useCallback((tag: string, isCreatingMode: boolean) => {
    if (isCreatingMode) {
      setNewEvent((prev) => ({
        ...prev,
        tags: prev.tags?.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...(prev.tags || []), tag],
      }));
    } else {
      setSelectedEvent((prev) =>
        prev
          ? {
              ...prev,
              tags: prev.tags?.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...(prev.tags || []), tag],
            }
          : null
      );
    }
  }, []);

  return (
    <div className={cn("flex-1 flex flex-col w-full h-full min-h-full", className)}>
      {/* Calendar Header Controls */}
      <CalendarHeader
        formattedTitle={getFormattedTitle()}
        currentDate={currentDate}
        view={view}
        setView={setView}
        navigateDate={navigateDate}
        goToToday={goToToday}
        colors={colors}
        availableTags={availableTags}
        categories={categories}
        selectedColors={selectedColors}
        selectedTags={selectedTags}
        selectedCategories={selectedCategories}
        hasActiveFilters={hasActiveFilters}
        toggleColor={toggleColor}
        toggleTag={toggleFilterTag}
        toggleCategory={toggleCategory}
        clearFilters={clearFilters}
        getColorClasses={getColorClasses}
        isBasicActive={isBasicActive}
        isQuotaWarning={isQuotaWarning}
        isQuotaExceeded={isQuotaExceeded}
        currentMonthApps={currentMonthApps}
        onOpenQuotaUpgrade={() => setIsQuotaUpgradeOpen(true)}
      />

      {/* Main Grid View Container */}
      <div className="flex-1 flex flex-col min-h-0 bg-surface overflow-auto border-t border-outline-variant/30">
        <div className="w-full flex-1 flex flex-col min-h-0 bg-surface-container-lowest overflow-hidden">
          {view === "month" && (
            <CalendarMonthView
              currentDate={currentDate}
              events={filteredEvents}
              onEventClick={handleEventClick}
              onSlotClick={handleSlotClick}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              getColorClasses={getColorClasses}
              isDayClosed={isDayClosed}
              getClosedLabel={getClosedLabel}
            />
          )}

          {view === "week" && (
            <CalendarWeekView
              currentDate={currentDate}
              events={filteredEvents}
              onEventClick={handleEventClick}
              onSlotClick={handleSlotClick}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              getColorClasses={getColorClasses}
              isDayClosed={isDayClosed}
              getClosedLabel={getClosedLabel}
            />
          )}

          {view === "day" && (
            <CalendarDayView
              currentDate={currentDate}
              events={filteredEvents}
              onEventClick={handleEventClick}
              onSlotClick={handleSlotClick}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              getColorClasses={getColorClasses}
              isDayClosed={isDayClosed}
              getClosedLabel={getClosedLabel}
            />
          )}

          {view === "list" && (
            <CalendarListView
              events={filteredEvents}
              onEventClick={handleEventClick}
              getColorClasses={getColorClasses}
            />
          )}
        </div>
      </div>

      {/* Draggable Event Create/Edit Dialog */}
      <EventEditDialog
        isOpen={isDialogOpen}
        isCreating={isCreating}
        position={position}
        handleMouseDown={handleMouseDown}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        categories={categories}
        availableTags={availableTags}
        toggleTag={toggleTag}
        onClose={() => {
          setIsDialogOpen(false);
          setIsCreating(false);
          setSelectedEvent(null);
        }}
        onCreate={handleCreateEvent}
        onUpdate={handleUpdateEvent}
        onDelete={handleDeleteEvent}
      />

      {/* Upgrade Pro Modal for Quota */}
      <UpgradeProModal
        isOpen={isQuotaUpgradeOpen}
        onClose={() => setIsQuotaUpgradeOpen(false)}
        title="Citas Ilimitadas con Plan Pro"
        description={`Has utilizado ${currentMonthApps} de tus 100 citas del mes en el Plan Básico. Actualiza al Plan Pro (40€/mes) para disfrutar de citas ilimitadas sin restricciones de cupo.`}
      />
    </div>
  );
}

export default EventManager;
