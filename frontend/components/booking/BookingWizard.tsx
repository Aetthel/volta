"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Lock,
  Phone,
  Store,
  User,
  Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Alert, Button, Card } from "@/components/ui/volta-ui";
import type { BookingIdentity } from "@/hooks/useBookingSession";

export interface BookingService {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  capacity: number;
}

export interface BookingBusinessData {
  id: string;
  name: string;
  address?: string | null;
  themeColor?: string;
  services: BookingService[];
}

export type WizardStep = 1 | 2 | 3 | 4;

export interface WizardSelection {
  service: BookingService | null;
  date: string;
  time: string;
}

interface BookingWizardProps {
  business: BookingBusinessData;
  identity: BookingIdentity;
  /** Selección elevada a la página: sobrevive a que caduque la sesión. */
  selection: WizardSelection;
  onSelectionChange: (next: WizardSelection) => void;
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

const STEP_LABELS = ["1. Servicio", "2. Fecha y Hora", "3. Mis Datos", "4. Confirmación"] as const;

const formatLongDate = (isoDate: string) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

export default function BookingWizard({
  business,
  identity,
  selection,
  onSelectionChange,
  authFetch,
}: BookingWizardProps) {
  const [step, setStep] = useState<WizardStep>(selection.service ? 2 : 1);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [clientEmail, setClientEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const { service: selectedService, date: selectedDate, time: selectedTime } = selection;

  useEffect(() => {
    if (!selectedService || !selectedDate) return;

    let cancelled = false;
    setLoadingSlots(true);

    authFetch(
      `/api/backend/public/booking/${business.id}/available-slots?serviceId=${selectedService.id}&date=${selectedDate}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setAvailableSlots(data.error ? [] : data.availableSlots || []);
      })
      .catch(() => {
        if (!cancelled) setAvailableSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [business.id, selectedService, selectedDate, authFetch]);

  const update = (patch: Partial<WizardSelection>) =>
    onSelectionChange({ ...selection, ...patch });

  const handleBookingSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedService || !selectedTime) return;

    setSubmitting(true);
    setError("");

    try {
      // El teléfono y el nombre NO viajan en el cuerpo: el backend los toma del
      // token de sesión, que es lo que impide reservar en nombre de otro.
      const res = await authFetch("/api/backend/public/booking/reserve", {
        method: "POST",
        body: JSON.stringify({
          businessId: business.id,
          serviceId: selectedService.id,
          appointmentDate: `${selectedDate}T${selectedTime}:00`,
          clientEmail: clientEmail.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // El 401 ya ha limpiado la sesión: la página devuelve al visitante al
        // gate conservando servicio, fecha y hora.
        if (res.status !== 401) setError(data.error || "No se pudo realizar la reserva");
        return;
      }

      setConfirmed(true);
      setStep(4);
    } catch {
      setError("Error de conexión al procesar la reserva.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface py-8 px-4 sm:px-8 max-w-3xl mx-auto flex flex-col justify-between select-none">
      <div>
        {/* Cabecera con la identidad ya verificada */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 sm:p-6 mb-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Store className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-display text-headline-md font-bold text-on-surface">
                {business.name}
              </h1>
              {business.address && (
                <p className="text-body-sm text-on-surface-variant mt-0.5">{business.address}</p>
              )}
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-label-md font-semibold rounded-full border border-primary/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {identity.name}
          </span>
        </div>

        {/* Indicador de pasos */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEP_LABELS.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div key={label} className="flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isActive
                      ? "bg-primary text-on-primary shadow-md"
                      : isDone
                        ? "bg-primary/20 text-primary"
                        : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {stepNum}
                </span>
                <span
                  className={`hidden md:inline text-body-xs font-semibold ${
                    isActive ? "text-primary" : "text-on-surface-variant"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {error && (
          <Alert variant="error" className="mb-6 py-2.5 px-4 rounded-xl text-body-md">
            {error}
          </Alert>
        )}

        {/* PASO 1: Servicio */}
        {step === 1 && (
          <div className="animate-in fade-in duration-200">
            <h2 className="text-headline-sm font-bold text-on-surface mb-2">
              Selecciona un Servicio
            </h2>
            <p className="text-body-sm text-on-surface-variant mb-6">
              Elige la actividad o servicio que deseas reservar.
            </p>

            <div className="grid grid-cols-1 gap-3">
              {business.services.map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => {
                    update({ service: srv, time: "" });
                    setStep(2);
                  }}
                  className={`w-full text-left p-5 rounded-xl border transition-all cursor-pointer flex items-center justify-between bg-surface-container-lowest ${
                    selectedService?.id === srv.id
                      ? "border-primary ring-2 ring-primary/20 bg-primary/5 shadow-sm"
                      : "border-outline-variant/60 hover:border-primary/50 hover:bg-surface-container-low"
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-title-md text-on-surface">{srv.name}</span>
                      {srv.capacity > 1 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-body-xs bg-secondary-container text-on-secondary-container rounded-md font-semibold">
                          <Users className="w-3 h-3" /> Aforo: {srv.capacity} personas
                        </span>
                      )}
                    </div>
                    {srv.description && (
                      <p className="text-body-sm text-on-surface-variant">{srv.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-body-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {srv.duration} min
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className="font-bold text-title-lg text-primary">
                      {formatCurrency(srv.price)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2: Fecha y hora */}
        {step === 2 && selectedService && (
          <div className="animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-headline-sm font-bold text-on-surface">
                  Selecciona Fecha y Hora
                </h2>
                <p className="text-body-sm text-on-surface-variant">
                  Para {selectedService.name} ({selectedService.duration} min)
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-primary"
              >
                <ChevronLeft className="w-4 h-4" /> Cambiar servicio
              </Button>
            </div>

            <Card className="p-6 mb-6">
              <label
                htmlFor="booking-date"
                className="block text-body-sm font-semibold text-on-surface mb-2"
              >
                Fecha de la Cita
              </label>
              <input
                id="booking-date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={selectedDate}
                onChange={(event) => update({ date: event.target.value, time: "" })}
                className="w-full px-4 py-3 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />

              <span className="block text-body-sm font-semibold text-on-surface mt-6 mb-3">
                Horarios Disponibles
              </span>
              {loadingSlots ? (
                <div className="py-8 flex items-center justify-center gap-2 text-on-surface-variant text-body-sm">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Buscando horarios disponibles...
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 text-center text-on-surface-variant text-body-sm">
                  No hay horarios disponibles para esta fecha. El negocio puede estar cerrado o
                  tener su aforo completo.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {availableSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => update({ time })}
                      className={`py-2.5 px-3 rounded-lg border text-body-sm font-semibold transition-all cursor-pointer ${
                        selectedTime === time
                          ? "bg-primary text-on-primary border-primary shadow-sm"
                          : "border-outline-variant hover:bg-surface-variant text-on-surface"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </Card>

            <div className="flex justify-end">
              <Button
                variant="primary"
                disabled={!selectedTime}
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
              >
                Continuar con Mis Datos <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* PASO 3: Datos ya verificados */}
        {step === 3 && selectedService && selectedTime && (
          <div className="animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-headline-sm font-bold text-on-surface">Tus Datos</h2>
                <p className="text-body-sm text-on-surface-variant">
                  Ya hemos verificado tu teléfono por WhatsApp.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(2)}
                className="flex items-center gap-1 text-primary"
              >
                <ChevronLeft className="w-4 h-4" /> Cambiar hora
              </Button>
            </div>

            <Card className="p-6 mb-6">
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60">
                    <span className="flex items-center gap-1.5 text-body-xs font-semibold text-on-surface-variant mb-1">
                      <User className="w-3.5 h-3.5" /> Nombre
                    </span>
                    <span className="flex items-center gap-2 text-body-md font-semibold text-on-surface">
                      {identity.name}
                      <Lock className="w-3 h-3 text-on-surface-variant" />
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60">
                    <span className="flex items-center gap-1.5 text-body-xs font-semibold text-on-surface-variant mb-1">
                      <Phone className="w-3.5 h-3.5" /> Teléfono verificado
                    </span>
                    <span className="flex items-center gap-2 text-body-md font-semibold text-on-surface">
                      {identity.phone}
                      <Lock className="w-3 h-3 text-on-surface-variant" />
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="booking-email"
                    className="block text-body-sm font-semibold text-on-surface mb-1"
                  >
                    Correo Electrónico (Opcional)
                  </label>
                  <input
                    id="booking-email"
                    type="email"
                    value={clientEmail}
                    onChange={(event) => setClientEmail(event.target.value)}
                    placeholder="Ej. maria@ejemplo.com"
                    className="w-full px-4 py-3 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="p-4 bg-surface-container-low border border-outline-variant/60 rounded-xl mt-6">
                  <span className="font-semibold text-body-sm text-primary block mb-2">
                    Resumen de tu Reserva:
                  </span>
                  <div className="text-body-sm text-on-surface space-y-1">
                    <p>
                      <strong>Servicio:</strong> {selectedService.name} (
                      {formatCurrency(selectedService.price)})
                    </p>
                    <p>
                      <strong>Fecha y Hora:</strong> {formatLongDate(selectedDate)} a las{" "}
                      {selectedTime} h
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  variant="primary"
                  className="w-full py-3.5 px-6 font-semibold rounded-xl mt-4 text-body-md"
                >
                  {submitting ? "Confirmando Reserva..." : "Confirmar y Reservar Cita"}
                </Button>
              </form>
            </Card>
          </div>
        )}

        {/* PASO 4: Recibo */}
        {step === 4 && confirmed && (
          <div className="animate-in zoom-in-95 duration-200 text-center">
            <Card className="p-8 max-w-lg mx-auto bg-surface-container-lowest border-outline-variant/60">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-headline-md font-bold text-on-surface mb-2">
                ¡Reserva Confirmada!
              </h2>
              <p className="text-body-md text-on-surface-variant mb-6">
                Hemos registrado tu cita correctamente en <strong>{business.name}</strong>.
              </p>

              <div className="bg-surface-container-low p-5 rounded-xl text-left border border-outline-variant/50 mb-6 space-y-2 text-body-sm text-on-surface">
                <p>
                  <strong>Servicio:</strong> {selectedService?.name}
                </p>
                <p>
                  <strong>Fecha y Hora:</strong> {formatLongDate(selectedDate)} a las {selectedTime}{" "}
                  h
                </p>
                <p>
                  <strong>Nombre:</strong> {identity.name}
                </p>
                <p>
                  <strong>Teléfono:</strong> {identity.phone}
                </p>
              </div>

              <p className="text-body-xs text-on-surface-variant/80 mb-6">
                Recibirás un recordatorio por WhatsApp antes de la cita. ¡Gracias por confiar en{" "}
                {business.name}!
              </p>

              <Button
                variant="outline"
                onClick={() => {
                  onSelectionChange({ service: null, date: selectedDate, time: "" });
                  setConfirmed(false);
                  setStep(1);
                }}
                className="w-full py-3 font-semibold rounded-xl"
              >
                Hacer otra reserva
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
