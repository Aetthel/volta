"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDraggableModal } from "@/lib/useDraggableModal";
import {
  X,
  Clock,
  User,
  Users,
  Phone,
  Sparkles,
  GripHorizontal,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button, Alert, SegmentedControl } from "@/components/ui/volta-ui";
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
    modalWidth: 480,
    modalHeight: 560,
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const [selectedHour, selectedMin] = (formData.time || "10:00").split(":");

  return createPortal(
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-auto transition-opacity" onClick={onClose} />

      {/* Modal Content Card */}
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
        {/* Header with drag grip */}
        <div
          onMouseDown={handleMouseDown}
          className="px-6 pt-5 pb-4 flex justify-between items-start border-b border-outline-variant/30 bg-surface-container-low/40 cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <GripHorizontal className="w-4 h-4 text-on-surface-variant/40 pointer-events-none" />
              <h2 className="text-lg font-bold text-on-surface">
                {bookingType === "INDIVIDUAL" ? "Agendar Cita" : "Crear Sesión de Grupo"}
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant pl-6">
              Selecciona el servicio, cliente y horario de la reserva
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container-high/60 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="px-6 pt-4 pb-1">
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
        <form onSubmit={handleSubmit} className="p-6 pt-3 flex flex-col gap-4">
          {/* Servicio Selection */}
          <div>
            <label htmlFor="service" className="text-xs font-semibold text-on-surface mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>{bookingType === "GROUP" ? "Clase de Grupo" : "Servicio"} <span className="text-error">*</span></span>
            </label>
            <select
              id="service"
              name="service"
              required
              value={formData.service}
              onChange={(e) => setFormData((prev) => ({ ...prev, service: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all cursor-pointer"
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
            <label htmlFor="clientName" className="text-xs font-semibold text-on-surface mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>{bookingType === "GROUP" ? "Nombre del Alumno (opcional)" : "Cliente"} {bookingType === "INDIVIDUAL" && <span className="text-error">*</span>}</span>
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
              className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all"
            />

            {/* Suggestions dropdown */}
            {showSuggestions && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSuggestions(false)}
                />
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
            <label htmlFor="clientPhone" className="text-xs font-semibold text-on-surface mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>Teléfono de contacto {bookingType === "INDIVIDUAL" && <span className="text-error">*</span>}</span>
            </label>
            <input
              id="clientPhone"
              name="clientPhone"
              type="tel"
              required={bookingType === "INDIVIDUAL"}
              placeholder="612 34 56 78"
              value={formData.clientPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all"
            />
          </div>

          {/* Fecha y Hora (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="date" className="text-xs font-semibold text-on-surface mb-1.5 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                <span>Fecha <span className="text-error">*</span></span>
              </label>
              <input
                id="date"
                name="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-on-surface mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Hora <span className="text-error">*</span></span>
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

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/30 mt-1">
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
              className="px-5 text-xs font-semibold shadow-sm cursor-pointer"
            >
              Reservar Cita
            </Button>
          </div>
        </form>
      </div>

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
