"use client";

import React, { useState, useCallback, useRef, useLayoutEffect, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  User,
  Calendar as CalendarIcon,
  Clock,
  Briefcase,
  FileText,
  Tag,
  Trash2,
} from "lucide-react";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { CalendarEvent } from "./EventCard";

interface EventEditDialogProps {
  isOpen: boolean;
  isCreating: boolean;
  position: { x: number; y: number };
  handleMouseDown: (e: React.MouseEvent) => void;
  newEvent: Partial<CalendarEvent>;
  setNewEvent: React.Dispatch<React.SetStateAction<Partial<CalendarEvent>>>;
  selectedEvent: CalendarEvent | null;
  setSelectedEvent: React.Dispatch<React.SetStateAction<CalendarEvent | null>>;
  categories: string[];
  availableTags: string[];
  toggleTag: (tag: string, isCreating: boolean) => void;
  onClose: () => void;
  onCreate: () => void;
  onUpdate: () => void;
  onDelete: (id: string) => void;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

const eventDateLabelFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "short",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const DATE_POPOVER_WIDTH = 300;
const DATE_POPOVER_HEIGHT = 340;
const DEFAULT_EVENT_DURATION_MS = 30 * 60000;

export const EventEditDialog: React.FC<EventEditDialogProps> = ({
  isOpen,
  isCreating,
  position,
  handleMouseDown,
  newEvent,
  setNewEvent,
  selectedEvent,
  setSelectedEvent,
  categories,
  availableTags,
  toggleTag,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const currentStart = (isCreating ? newEvent.startTime : selectedEvent?.startTime) as
    Date | undefined;
  const currentEnd = (isCreating ? newEvent.endTime : selectedEvent?.endTime) as Date | undefined;

  const applyStartTime = useCallback(
    (nextStart: Date) => {
      const duration =
        currentStart && currentEnd && currentEnd > currentStart
          ? currentEnd.getTime() - currentStart.getTime()
          : DEFAULT_EVENT_DURATION_MS;
      const nextEnd = new Date(nextStart.getTime() + duration);

      if (isCreating) {
        setNewEvent((prev) => ({ ...prev, startTime: nextStart, endTime: nextEnd }));
      } else {
        setSelectedEvent((prev) =>
          prev ? { ...prev, startTime: nextStart, endTime: nextEnd } : null
        );
      }
    },
    [currentStart, currentEnd, isCreating, setNewEvent, setSelectedEvent]
  );

  const dateTriggerRef = useRef<HTMLButtonElement>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePopoverPos, setDatePopoverPos] = useState({ left: 0, top: 0 });

  useLayoutEffect(() => {
    if (!showDatePicker) return;
    const el = dateTriggerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const openUpward =
      rect.bottom + DATE_POPOVER_HEIGHT > window.innerHeight && rect.top > DATE_POPOVER_HEIGHT;

    setDatePopoverPos({
      left: Math.max(8, Math.min(rect.left, window.innerWidth - DATE_POPOVER_WIDTH - 8)),
      top: openUpward ? rect.top - DATE_POPOVER_HEIGHT - 6 : rect.bottom + 6,
    });
  }, [showDatePicker]);

  useEffect(() => {
    if (!isOpen) setShowDatePicker(false);
  }, [isOpen]);

  useEffect(() => {
    setShowDatePicker(false);
  }, [position.x, position.y]);

  const handlePickDate = (day: Date) => {
    const base = currentStart ?? new Date();
    const next = new Date(day);
    next.setHours(base.getHours(), base.getMinutes(), 0, 0);
    applyStartTime(next);
    setShowDatePicker(false);
  };

  const [hourDraft, setHourDraft] = useState<string | null>(null);
  const [minuteDraft, setMinuteDraft] = useState<string | null>(null);

  const displayHour = hourDraft ?? (currentStart ? pad2(currentStart.getHours()) : "");
  const displayMinute = minuteDraft ?? (currentStart ? pad2(currentStart.getMinutes()) : "");

  const commitTime = (rawHour: string, rawMinute: string) => {
    const base = currentStart ?? new Date();
    const hours = Math.min(23, parseInt(rawHour || "0", 10) || 0);
    const minutes = Math.min(59, parseInt(rawMinute || "0", 10) || 0);
    const next = new Date(base);
    next.setHours(hours, minutes, 0, 0);
    applyStartTime(next);
  };

  const handleHourChange = (value: string) => {
    let digits = value.replace(/\D/g, "").slice(0, 2);
    if (digits !== "" && parseInt(digits, 10) > 23) digits = "23";
    setHourDraft(digits);
    commitTime(digits, displayMinute);
  };

  const handleMinuteChange = (value: string) => {
    let digits = value.replace(/\D/g, "").slice(0, 2);
    if (digits !== "" && parseInt(digits, 10) > 59) digits = "59";
    setMinuteDraft(digits);
    commitTime(displayHour, digits);
  };

  const handleTimeBlur = () => {
    setHourDraft(null);
    setMinuteDraft(null);
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && confirmDeleteId) {
        setConfirmDeleteId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmDeleteId]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
      <div
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: "480px",
          maxWidth: "calc(100vw - 32px)",
          transition: "none",
        }}
        className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/60 overflow-hidden z-10 pointer-events-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col"
      >
        {/* Header */}
        <div
          onMouseDown={handleMouseDown}
          className="px-6 pt-5 pb-4 flex justify-between items-start border-b border-outline-variant/30 bg-surface-container-low/40 cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-on-surface tracking-tight">
              {isCreating ? "Agendar Cita" : "Editar Cita"}
            </h2>
            <p className="text-sm text-on-surface-variant mt-0.5">
              {isCreating
                ? "Añade una nueva cita al calendario"
                : "Modifica los datos del cliente, servicio u horario"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container-high/60 transition-colors cursor-pointer -mr-1"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 flex flex-col gap-4 max-h-[calc(90vh-140px)] overflow-y-auto custom-scrollbar">
          {/* Título / Cliente */}
          <div>
            <label
              htmlFor="modal-event-title"
              className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-on-surface shrink-0" />
              <span>
                Cliente / Título <span className="text-error">*</span>
              </span>
            </label>
            <input
              id="modal-event-title"
              type="text"
              value={isCreating ? newEvent.title : selectedEvent?.title || ""}
              onChange={(e) =>
                isCreating
                  ? setNewEvent((prev) => ({ ...prev, title: e.target.value }))
                  : setSelectedEvent((prev) => (prev ? { ...prev, title: e.target.value } : null))
              }
              placeholder="Nombre del cliente y servicio"
              className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all"
            />
          </div>

          {/* Fecha y Hora (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                id="modal-event-date-label"
                htmlFor="modal-event-date"
                className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-on-surface shrink-0" />
                <span>Fecha</span>
              </label>
              <button
                id="modal-event-date"
                ref={dateTriggerRef}
                type="button"
                onClick={() => setShowDatePicker((open) => !open)}
                aria-haspopup="dialog"
                aria-expanded={showDatePicker}
                aria-label={
                  currentStart
                    ? `Fecha: ${eventDateLabelFormatter.format(currentStart)}`
                    : "Fecha: seleccionar fecha"
                }
                className={cn(
                  "w-full px-3 py-2 text-sm text-left bg-surface-container-low/60 border rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer truncate",
                  showDatePicker
                    ? "border-primary bg-surface-container-lowest"
                    : "border-outline-variant/70"
                )}
              >
                {currentStart ? (
                  <span className="capitalize">{eventDateLabelFormatter.format(currentStart)}</span>
                ) : (
                  <span className="text-on-surface-variant/40">Seleccionar fecha</span>
                )}
              </button>
            </div>

            <div>
              <label
                htmlFor="modal-event-hour"
                className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-on-surface shrink-0" />
                <span>Hora</span>
              </label>
              <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-low/60 border border-outline-variant/70 rounded-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary focus-within:bg-surface-container-lowest transition-all">
                <input
                  id="modal-event-hour"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  aria-label="Hora"
                  value={displayHour}
                  onChange={(e) => handleHourChange(e.target.value)}
                  onBlur={handleTimeBlur}
                  className="w-8 bg-transparent text-sm font-semibold text-on-surface text-center outline-none"
                  placeholder="10"
                />
                <span className="text-on-surface-variant/60 font-bold">:</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  aria-label="Minutos"
                  value={displayMinute}
                  onChange={(e) => handleMinuteChange(e.target.value)}
                  onBlur={handleTimeBlur}
                  className="w-8 bg-transparent text-sm font-semibold text-on-surface text-center outline-none"
                  placeholder="00"
                />
                <span className="text-xs text-on-surface-variant ml-auto font-medium">hrs</span>
              </div>
            </div>
          </div>

          {/* Categoría / Servicio */}
          <div>
            <label
              htmlFor="modal-event-category"
              className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-on-surface shrink-0" />
              <span>Categoría / Servicio</span>
            </label>
            <select
              id="modal-event-category"
              value={isCreating ? newEvent.category : selectedEvent?.category || ""}
              onChange={(e) => {
                const val = e.target.value;
                isCreating
                  ? setNewEvent((prev) => ({ ...prev, category: val }))
                  : setSelectedEvent((prev) => (prev ? { ...prev, category: val } : null));
              }}
              className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción / Notas */}
          <div>
            <label
              htmlFor="modal-event-description"
              className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-on-surface shrink-0" />
              <span>Notas / Observaciones</span>
            </label>
            <textarea
              id="modal-event-description"
              rows={3}
              value={isCreating ? newEvent.description : selectedEvent?.description || ""}
              onChange={(e) =>
                isCreating
                  ? setNewEvent((prev) => ({ ...prev, description: e.target.value }))
                  : setSelectedEvent((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
              }
              placeholder="Notas o detalles adicionales..."
              className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all resize-none"
            />
          </div>

          {/* Etiquetas */}
          {availableTags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-on-surface shrink-0" />
                <span>Etiquetas</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = isCreating
                    ? newEvent.tags?.includes(tag)
                    : selectedEvent?.tags?.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag, isCreating)}
                      className={cn(
                        "px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer select-none",
                        isSelected
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-surface-container-low/60 border-outline-variant/60 text-on-surface-variant hover:bg-surface-container-high"
                      )}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/30 bg-surface-container-low/20 flex items-center justify-between">
          {!isCreating && selectedEvent ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowDatePicker(false);
                setConfirmDeleteId(selectedEvent.id);
              }}
              aria-haspopup="dialog"
              className="text-error hover:text-error hover:bg-error/10 font-semibold gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar</span>
            </Button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              className="cursor-pointer font-medium"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              onClick={isCreating ? onCreate : onUpdate}
              className="cursor-pointer font-semibold shadow-xs"
            >
              {isCreating ? "Crear Cita" : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </div>

      {/* Popover del calendario */}
      {showDatePicker && (
        <>
          <div
            className="fixed inset-0 z-[1000] pointer-events-auto"
            onClick={() => setShowDatePicker(false)}
          />
          <div
            role="dialog"
            aria-label="Seleccionar fecha"
            style={{
              position: "fixed",
              left: `${datePopoverPos.left}px`,
              top: `${datePopoverPos.top}px`,
            }}
            className="z-[1001] pointer-events-auto bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/60 animate-in fade-in zoom-in-95 duration-100"
          >
            <CalendarPicker
              mode="single"
              autoFocus
              defaultMonth={currentStart}
              selected={currentStart}
              onSelect={(day) => {
                if (!day) return;
                handlePickDate(day);
              }}
            />
          </div>
        </>
      )}

      {/* Confirmación de borrado */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[1002] pointer-events-auto flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 animate-in fade-in duration-100"
            onClick={() => setConfirmDeleteId(null)}
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            aria-describedby="confirm-delete-desc"
            className="relative z-10 w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/60 p-5 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-9 h-9 rounded-full bg-rose-500/10 flex items-center justify-center">
                <Trash2 className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="min-w-0">
                <h3
                  id="confirm-delete-title"
                  className="text-base font-bold text-on-surface tracking-tight"
                >
                  ¿Eliminar esta cita?
                </h3>
                <p id="confirm-delete-desc" className="text-xs text-on-surface-variant mt-1">
                  {selectedEvent?.title ? (
                    <>
                      Se eliminará{" "}
                      <span className="font-semibold text-on-surface">{selectedEvent.title}</span>{" "}
                      de forma permanente. Esta acción no se puede deshacer.
                    </>
                  ) : (
                    "La cita se eliminará de forma permanente. Esta acción no se puede deshacer."
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-5">
              <Button
                type="button"
                variant="outline"
                size="md"
                autoFocus
                onClick={() => setConfirmDeleteId(null)}
                className="cursor-pointer font-medium"
              >
                Cancelar
              </Button>
              <button
                type="button"
                onClick={() => {
                  onDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar cita</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
