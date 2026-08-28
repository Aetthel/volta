"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useDraggableModal } from "@/lib/useDraggableModal";
import { X, Clock, User, Users, Phone, Briefcase, Calendar as CalendarIcon } from "lucide-react";
import { Button, Alert, SegmentedControl } from "@/components/ui/volta-ui";
import { Calendar } from "@/components/ui/calendar";
import UserAvatar from "@/components/UserAvatar";
import { useNewAppointmentForm } from "@/hooks/useNewAppointmentForm";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointmentData: {
    id?: string;
    clientName: string;
    clientPhone: string;
    service: string;
    date?: string;
    time?: string;
    appointmentDate?: string;
    businessId?: string;
    status?: string;
    clientId?: string | null;
    serviceId?: string | null;
    serviceName?: string | null;
    workerId?: string;
  }) => void;
  initialDate?: string;
  initialTime?: string;
  triggerRect?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  } | null;
}

// La altura es orientativa (posiciona el modal al abrirlo); el tope real lo pone
// MODAL_MAX_HEIGHT sobre el viewport.
const MODAL_WIDTH = 440;
const MODAL_HEIGHT = 520;
const MODAL_MAX_HEIGHT = "calc(100vh - 24px)";

// Alto/ancho aproximados del popover del calendario; solo se usan para decidir
// si abrirlo hacia arriba o hacia abajo del campo.
const DATE_POPOVER_WIDTH = 300;
const DATE_POPOVER_HEIGHT = 340;

/**
 * `formData.date` viaja como "YYYY-MM-DD" en hora local y el submit la recompone
 * con `new Date(\`${date}T${time}:00\`)`. Usar toISOString() aquí adelantaría o
 * atrasaría un día según el huso (en España, UTC+1/+2), así que el formateo se
 * hace con los getters locales.
 */
const toLocalDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/** Interpreta "YYYY-MM-DD" como medianoche local, no como UTC. */
const fromLocalDateString = (value: string): Date | undefined => {
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const dateLabelFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "short",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function NewAppointmentModal({
  isOpen,
  onClose,
  onSave,
  initialDate,
  initialTime,
  triggerRect,
}: NewAppointmentModalProps) {
  const {
    bookingType,
    setBookingType,
    formData,
    setFormData,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    showConsentToast,
    toastPhone,
    submitError,
    isSubmitting,
    handleChange,
    handleNameChange,
    handleSelectSuggestion,
    handleSubmit,
    handleHourChange,
    handleHourBlur,
    handleMinChange,
    handleMinBlur,
    serviceOptions,
  } = useNewAppointmentForm(isOpen, initialDate, initialTime, onSave, onClose);

  const { position, handleMouseDown } = useDraggableModal({
    isOpen,
    triggerRect,
    modalWidth: MODAL_WIDTH,
    modalHeight: MODAL_HEIGHT,
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // El calendario se renderiza fuera de la tarjeta del modal (que tiene
  // overflow-hidden y una zona de campos con scroll propio), así que se posiciona
  // en coordenadas de viewport a partir del rect del disparador.
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
      left: Math.max(
        8,
        Math.min(rect.left, window.innerWidth - DATE_POPOVER_WIDTH - 8)
      ),
      top: openUpward ? rect.top - DATE_POPOVER_HEIGHT - 6 : rect.bottom + 6,
    });
  }, [showDatePicker]);

  // Cerrar el calendario al soltar el modal en otra posición o al cerrarlo evita
  // que el popover quede flotando lejos de su campo.
  useEffect(() => {
    if (!isOpen) setShowDatePicker(false);
  }, [isOpen]);

  useEffect(() => {
    setShowDatePicker(false);
  }, [position.x, position.y]);

  if (!isOpen || !mounted) return null;

  const [selectedHour, selectedMin] = (formData.time || "10:00").split(":");
  const selectedDate = fromLocalDateString(formData.date);

  return createPortal(
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Backdrop — transparent without blur or darkening */}
      <div className="absolute inset-0 bg-transparent pointer-events-auto" onClick={onClose} />

      {/* Modal Content Card */}
      <div
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${MODAL_WIDTH}px`,
          maxWidth: "calc(100vw - 24px)",
          maxHeight: MODAL_MAX_HEIGHT,
          transition: "none",
        }}
        className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/60 overflow-hidden z-10 pointer-events-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col"
      >
        {/* Header */}
        <div
          onMouseDown={handleMouseDown}
          className="px-5 pt-3.5 pb-3 flex justify-between items-start border-b border-outline-variant/30 bg-surface-container-low/40 cursor-grab active:cursor-grabbing select-none shrink-0"
        >
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-on-surface tracking-tight">
              {bookingType === "INDIVIDUAL" ? "Agendar Cita" : "Crear Sesión de Grupo"}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Selecciona el servicio, cliente y horario de la reserva
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container-high/60 transition-colors cursor-pointer -mr-1"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="px-5 pt-3 pb-1 shrink-0">
          <SegmentedControl
            value={bookingType}
            onChange={(val) => setBookingType(val as "INDIVIDUAL" | "GROUP")}
            options={[
              { value: "INDIVIDUAL", label: "Cita Individual", icon: User },
              { value: "GROUP", label: "Clase de Grupo", icon: Users },
            ]}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Campos — único bloque que scrollea */}
          <div className="px-5 pt-3 pb-4 flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            {/* Servicio Selection */}
            <div>
              <label
                htmlFor="service"
                className="text-xs font-medium text-on-surface mb-1 flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5 text-on-surface shrink-0" />
                <span>
                  {bookingType === "GROUP" ? "Clase de Grupo" : "Servicio"}{" "}
                  <span className="text-error">*</span>
                </span>
              </label>
              <select
                id="service"
                name="service"
                required
                value={formData.service}
                onChange={(e) => setFormData((prev) => ({ ...prev, service: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all cursor-pointer"
              >
                {serviceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Cliente (with Autocomplete) */}
            <div className="relative">
              <label
                htmlFor="clientName"
                className="text-xs font-medium text-on-surface mb-1 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-on-surface shrink-0" />
                <span>
                  {bookingType === "GROUP" ? "Nombre del Alumno (opcional)" : "Cliente"}{" "}
                  {bookingType === "INDIVIDUAL" && <span className="text-error">*</span>}
                </span>
              </label>
              <input
                id="clientName"
                name="clientName"
                type="text"
                required={bookingType === "INDIVIDUAL"}
                placeholder="Buscar por nombre o teléfono..."
                value={formData.clientName}
                onChange={handleNameChange}
                onFocus={() => {
                  if (formData.clientName.trim().length > 1 && suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                className="w-full px-3 py-1.5 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all"
              />

              {/* Suggestions dropdown */}
              {showSuggestions && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl max-h-52 overflow-y-auto custom-scrollbar z-50 py-1 divide-y divide-outline-variant/20">
                    {suggestions.map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(client)}
                        className="w-full px-3.5 py-2 hover:bg-surface-container-high/60 flex items-center justify-between text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <UserAvatar name={client.name} surname={client.surname} size="sm" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-on-surface truncate">
                              {client.name} {client.surname || ""}
                            </span>
                            <span className="text-[11px] text-on-surface-variant">
                              {client.phone}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                          Registrado
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label
                htmlFor="clientPhone"
                className="text-xs font-medium text-on-surface mb-1 flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-on-surface shrink-0" />
                <span>
                  Teléfono de contacto{" "}
                  {bookingType === "INDIVIDUAL" && <span className="text-error">*</span>}
                </span>
              </label>
              <input
                id="clientPhone"
                name="clientPhone"
                type="tel"
                required={bookingType === "INDIVIDUAL"}
                placeholder="612 34 56 78"
                value={formData.clientPhone}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
            </div>

            {/* Fecha y Hora (2 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="date"
                  className="text-xs font-medium text-on-surface mb-1 flex items-center gap-1.5"
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-on-surface shrink-0" />
                  <span>
                    Fecha <span className="text-error">*</span>
                  </span>
                </label>
                <button
                  id="date"
                  ref={dateTriggerRef}
                  type="button"
                  onClick={() => setShowDatePicker((open) => !open)}
                  aria-haspopup="dialog"
                  aria-expanded={showDatePicker}
                  className={`w-full px-3 py-1.5 text-sm text-left bg-surface-container-low/60 border rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer truncate ${
                    showDatePicker
                      ? "border-primary bg-surface-container-lowest"
                      : "border-outline-variant/70"
                  }`}
                >
                  {selectedDate ? (
                    <span className="capitalize">{dateLabelFormatter.format(selectedDate)}</span>
                  ) : (
                    <span className="text-on-surface-variant/40">Seleccionar fecha</span>
                  )}
                </button>
              </div>
              <div>
                <label className="text-xs font-medium text-on-surface mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-on-surface shrink-0" />
                  <span>
                    Hora <span className="text-error">*</span>
                  </span>
                </label>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low/60 border border-outline-variant/70 rounded-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary focus-within:bg-surface-container-lowest transition-all">
                  <input
                    type="text"
                    pattern="[0-9]*"
                    maxLength={2}
                    value={selectedHour}
                    onChange={(e) => handleHourChange(e.target.value)}
                    onBlur={handleHourBlur}
                    className="w-8 bg-transparent text-sm font-semibold text-on-surface text-center outline-none"
                    placeholder="10"
                  />
                  <span className="text-on-surface-variant/60 font-bold">:</span>
                  <input
                    type="text"
                    pattern="[0-9]*"
                    maxLength={2}
                    value={selectedMin}
                    onChange={(e) => handleMinChange(e.target.value)}
                    onBlur={handleMinBlur}
                    className="w-8 bg-transparent text-sm font-semibold text-on-surface text-center outline-none"
                    placeholder="00"
                  />
                  <span className="text-xs text-on-surface-variant ml-auto font-medium">hrs</span>
                </div>
              </div>
            </div>

            {/* Motivo real del backend: hueco ocupado, fuera de horario,
              teléfono inválido, límite de plan alcanzado... */}
            {submitError && (
              <Alert variant="error" role="alert">
                <p className="text-body-sm">{submitError}</p>
              </Alert>
            )}
          </div>

          {/* Footer Actions — fijo fuera del área scrollable */}
          <div className="px-5 py-3 flex items-center justify-end gap-2.5 border-t border-outline-variant/30 bg-surface-container-low/20 shrink-0">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              size="md"
              className="px-4 text-xs font-medium cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              className="px-5 text-xs font-semibold shadow-sm cursor-pointer"
            >
              {isSubmitting ? "Guardando..." : "Reservar Cita"}
            </Button>
          </div>
        </form>
      </div>

      {/* Popover del calendario — fuera de la tarjeta del modal a propósito: esa
        tarjeta tiene overflow-hidden y el bloque de campos su propio scroll, así
        que anidarlo dentro lo recortaría. */}
      {showDatePicker && (
        <>
          <div
            className="fixed inset-0 z-110 pointer-events-auto"
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
            className="z-120 pointer-events-auto bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/60 animate-in fade-in zoom-in-95 duration-100"
          >
            <Calendar
              mode="single"
              autoFocus
              defaultMonth={selectedDate}
              selected={selectedDate}
              onSelect={(day) => {
                if (!day) return;
                setFormData((prev) => ({ ...prev, date: toLocalDateString(day) }));
                setShowDatePicker(false);
              }}
            />
          </div>
        </>
      )}

      {/* LOPD WhatsApp Consent Toast Overlay */}
      {showConsentToast && (
        <Alert
          variant="default"
          className="fixed top-6 right-6 z-[60] flex items-center gap-3 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm"
        >
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-on-secondary-container text-body-md">Cita Reservada</p>
            <p className="text-body-sm text-on-secondary-container/80">
              Enlace de consentimiento LOPD enviado a{" "}
              <span className="font-semibold">{toastPhone}</span> por WhatsApp.
            </p>
          </div>
        </Alert>
      )}
    </div>,
    document.body
  );
}
