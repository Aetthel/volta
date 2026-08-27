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
} from "lucide-react";
import {
  FieldGroup,
  Field,
  FloatingInput,
  Button,
  Alert,
  InlineSelect,
  CalendarSelect,
  SegmentedControl,
} from "@/components/ui/volta-ui";
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
    modalWidth: 448,
    modalHeight: 550,
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const [selectedHour, selectedMin] = (formData.time || "10:00").split(":");

  return createPortal(
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Backdrop — transparent without dimming */}
      <div className="absolute inset-0 bg-transparent pointer-events-auto" onClick={onClose} />

      {/* Modal Content Card */}
      <div
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: "448px",
          maxWidth: "calc(100vw - 32px)",
          transition: "none",
        }}
        className="bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant overflow-visible z-10 pointer-events-auto animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div
          onMouseDown={handleMouseDown}
          className="px-5 pt-5 pb-1 flex justify-between items-center bg-transparent cursor-grab active:cursor-grabbing select-none"
        >
          <GripHorizontal className="w-5 h-5 text-on-surface-variant/40 pointer-events-none" />
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-1.5 rounded-full text-on-surface-variant hover:text-on-surface w-8 h-8 active:scale-95 shadow-none"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Title & Mode Switcher */}
        <div className="px-5 pb-2">
          <h2 className="text-2xl font-medium text-on-surface mb-3">
            {bookingType === "INDIVIDUAL"
              ? "Reservar Cita Individual"
              : "Crear Sesión de Grupo / Clase"}
          </h2>

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
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
          {/* Client & Service Details */}
          <FieldGroup className="flex flex-col gap-5">
            {/* Service Selection */}
            <div className="flex items-start gap-4">
              <div className="w-6 h-10 flex items-center justify-center text-on-surface-variant/40 shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <Field>
                  <InlineSelect
                    id="service"
                    label={
                      bookingType === "GROUP"
                        ? "Seleccionar Clase de Grupo"
                        : "Seleccionar Servicio"
                    }
                    value={formData.service}
                    onChange={(val) => setFormData((prev) => ({ ...prev, service: val }))}
                    options={serviceOptions}
                    variant="borderless"
                  />
                </Field>
              </div>
            </div>

            {/* Client / Student Name */}
            <div className="flex items-start gap-4">
              <div className="w-6 h-10 flex items-center justify-center text-on-surface-variant/40 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <Field>
                  <div className="relative w-full">
                    <FloatingInput
                      id="clientName"
                      label={
                        bookingType === "GROUP"
                          ? "Nombre del Alumno (opcional)"
                          : "Nombre del Cliente"
                      }
                      type="text"
                      required={bookingType === "INDIVIDUAL"}
                      value={formData.clientName}
                      onChange={handleNameChange}
                      variant="borderless"
                      className="text-body-lg font-normal !py-2"
                      onFocus={() => {
                        if (formData.clientName.trim().length > 1 && suggestions.length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                    />

                    {/* Autocomplete Suggestions list */}
                    {showSuggestions && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowSuggestions(false)}
                        />
                        <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg max-h-48 overflow-y-auto custom-scrollbar z-50 py-1">
                          {suggestions.map((client) => (
                            <Button
                              key={client.id}
                              variant="ghost"
                              type="button"
                              onClick={() => handleSelectSuggestion(client)}
                              className="w-full px-4 py-2 hover:bg-surface-variant flex items-center justify-between text-left border-none rounded-none active:scale-100 shadow-none font-normal"
                            >
                              <div className="flex flex-col text-left">
                                <span className="text-body-md font-medium text-on-surface">
                                  {client.name} {client.surname}
                                </span>
                                <span className="text-body-xs text-on-surface-variant">
                                  {client.phone}
                                </span>
                              </div>
                              <span className="text-body-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                                Registrado
                              </span>
                            </Button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </Field>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="w-6 h-10 flex items-center justify-center text-on-surface-variant/40 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <Field>
                  <FloatingInput
                    id="clientPhone"
                    label={bookingType === "GROUP" ? "Teléfono del Alumno (opcional)" : "Teléfono"}
                    type="tel"
                    required={bookingType === "INDIVIDUAL"}
                    variant="borderless"
                    value={formData.clientPhone}
                    onChange={handleChange}
                  />
                </Field>
              </div>
            </div>

            {/* Date and Time selection */}
            <div className="flex items-start gap-4">
              <div className="w-6 h-10 flex items-center justify-center text-on-surface-variant/40 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <Field>
                  <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
                    {/* Date Picker */}
                    <div className="flex-1 min-w-0">
                      <CalendarSelect
                        id="date"
                        value={formData.date}
                        onChange={(val) => setFormData((prev) => ({ ...prev, date: val }))}
                        variant="borderless"
                      />
                    </div>

                    {/* Time Selectors typed by hand */}
                    <div className="flex items-center gap-1.5 shrink-0 px-2">
                      <input
                        type="text"
                        pattern="[0-9]*"
                        maxLength={2}
                        value={selectedHour}
                        onChange={(e) => handleHourChange(e.target.value)}
                        onBlur={handleHourBlur}
                        className="w-10 bg-transparent text-body-lg text-on-surface border-0 rounded-none focus:ring-0 py-1 outline-none text-center hover:bg-on-surface/[0.04] focus:bg-on-surface/[0.06] rounded-md transition-all duration-200"
                        placeholder="10"
                      />
                      <span className="text-on-surface-variant/50 font-medium">:</span>
                      <input
                        type="text"
                        pattern="[0-9]*"
                        maxLength={2}
                        value={selectedMin}
                        onChange={(e) => handleMinChange(e.target.value)}
                        onBlur={handleMinBlur}
                        className="w-10 bg-transparent text-body-lg text-on-surface border-0 rounded-none focus:ring-0 py-1 outline-none text-center hover:bg-on-surface/[0.04] focus:bg-on-surface/[0.06] rounded-md transition-all duration-200"
                        placeholder="00"
                      />
                    </div>
                  </div>
                </Field>
              </div>
            </div>
          </FieldGroup>

          {/* Motivo real del backend: hueco ocupado, fuera de horario,
              teléfono inválido, límite de plan alcanzado... */}
          {submitError && (
            <Alert variant="error" role="alert">
              <p className="text-body-sm">{submitError}</p>
            </Alert>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" onClick={onClose} variant="outline" size="lg">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Reservar Cita"}
            </Button>
          </div>
        </form>
      </div>

      {/* LOPD WhatsApp Consent Toast Overlay */}
      {showConsentToast && (
        <Alert
          variant="info"
          className="fixed top-6 right-6 z-[60] flex items-center gap-3 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm"
        >
          <svg className="w-6 h-6 text-secondary shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
          </svg>
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
