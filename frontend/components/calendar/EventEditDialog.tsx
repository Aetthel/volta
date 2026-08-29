"use client";

import React from "react";
import { createPortal } from "react-dom";
import { X, User, Clock, Briefcase, FileText, Tag, Trash2 } from "lucide-react";
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
  if (!isOpen || typeof document === "undefined") return null;

  const formatDateForInput = (d?: Date | string) => {
    if (!d) return "";
    const dateObj = d instanceof Date ? d : new Date(d);
    if (isNaN(dateObj.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = dateObj.getFullYear();
    const month = pad(dateObj.getMonth() + 1);
    const day = pad(dateObj.getDate());
    const hours = pad(dateObj.getHours());
    const minutes = pad(dateObj.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

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

          {/* Hora Inicio & Fin (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="modal-event-startTime"
                className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-on-surface shrink-0" />
                <span>Hora Inicio</span>
              </label>
              <input
                id="modal-event-startTime"
                type="datetime-local"
                value={
                  isCreating
                    ? formatDateForInput(newEvent.startTime)
                    : formatDateForInput(selectedEvent?.startTime)
                }
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  if (!isNaN(date.getTime())) {
                    isCreating
                      ? setNewEvent((prev) => ({ ...prev, startTime: date }))
                      : setSelectedEvent((prev) => (prev ? { ...prev, startTime: date } : null));
                  }
                }}
                className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="modal-event-endTime"
                className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-on-surface shrink-0" />
                <span>Hora Fin</span>
              </label>
              <input
                id="modal-event-endTime"
                type="datetime-local"
                value={
                  isCreating
                    ? formatDateForInput(newEvent.endTime)
                    : formatDateForInput(selectedEvent?.endTime)
                }
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  if (!isNaN(date.getTime())) {
                    isCreating
                      ? setNewEvent((prev) => ({ ...prev, endTime: date }))
                      : setSelectedEvent((prev) => (prev ? { ...prev, endTime: date } : null));
                  }
                }}
                className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
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
                  : setSelectedEvent((prev) => (prev ? { ...prev, description: e.target.value } : null))
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
              onClick={() => onDelete(selectedEvent.id)}
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
    </div>,
    document.body
  );
};
