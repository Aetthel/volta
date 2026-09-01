"use client";

import { useState, useEffect, use } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Store,
  Phone,
  Mail,
  User,
  Briefcase,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import {
  COLOR_PALETTES,
  getThemeColor,
  getThemeInlineStyles,
} from "@/lib/theme";
import { formatCurrency } from "@/lib/utils";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  InputGroup,
  Alert,
} from "@/components/ui/volta-ui";

interface PublicBusinessData {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  description?: string;
  themeColor?: string;
  fontSizeLevel?: string;
  borderRadiusLevel?: string;
  enablePublicBooking?: boolean;
  hours: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
  services: Array<{
    id: string;
    name: string;
    description?: string;
    duration: number;
    price: number;
    capacity: number;
  }>;
}

export default function PublicBookingPage({ params }: { params: Promise<{ businessId: string }> }) {
  const resolvedParams = use(params);
  const businessId = resolvedParams.businessId;

  const [business, setBusiness] = useState<PublicBusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedService, setSelectedService] = useState<PublicBusinessData["services"][0] | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = useState<string>("");

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    fetch(`/api/backend/public/booking/${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setBusiness(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar la información del negocio.");
        setLoading(false);
      });
  }, [businessId]);

  useEffect(() => {
    if (!businessId || !selectedService || !selectedDate) return;
    setLoadingSlots(true);
    fetch(
      `/api/backend/public/booking/${businessId}/available-slots?serviceId=${selectedService.id}&date=${selectedDate}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setAvailableSlots([]);
        } else {
          setAvailableSlots(data.availableSlots || []);
        }
        setLoadingSlots(false);
      })
      .catch(() => {
        setAvailableSlots([]);
        setLoadingSlots(false);
      });
  }, [businessId, selectedService, selectedDate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-body-md text-on-surface-variant font-medium">
            Cargando reservas...
          </span>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-6 text-center">
          <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
          <h2 className="text-headline-sm font-bold text-on-surface mb-2">
            Reservas No Disponibles
          </h2>
          <p className="text-body-md text-on-surface-variant mb-6">
            {error || "No se ha podido encontrar el negocio solicitado."}
          </p>
        </Card>
      </div>
    );
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedTime || !clientName.trim() || !clientPhone.trim()) {
      setError("Por favor, completa todos los campos requeridos.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const fullDateStr = `${selectedDate}T${selectedTime}:00`;
      const res = await fetch("/api/backend/public/booking/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          serviceId: selectedService.id,
          appointmentDate: fullDateStr,
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          clientEmail: clientEmail.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No se pudo realizar la reserva");
        setSubmitting(false);
      } else {
        setBookingResult(data);
        setStep(4);
        setSubmitting(false);
      }
    } catch (err) {
      setError("Error de conexión al procesar la reserva.");
      setSubmitting(false);
    }
  };

  // Available time slots (09:00 - 20:00 every 30 mins)
  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
  ];

  const bookingThemeKey = getThemeColor(business?.themeColor);
  const bookingPalette = COLOR_PALETTES[bookingThemeKey] || COLOR_PALETTES.CLINICAL_ELEGANCE;
  const bookingStyles = getThemeInlineStyles(
    bookingPalette,
    "1.0",
    "1.0"
  ) as React.CSSProperties;

  return (
    <div
      className="min-h-screen bg-surface py-8 px-4 sm:px-8 max-w-3xl mx-auto flex flex-col justify-between select-none"
      style={bookingStyles}
    >
      <div>
        {/* Header / Branding */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 mb-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-display text-headline-md font-bold text-on-surface">
                {business.name}
              </h1>
              {business.address && (
                <p className="text-body-sm text-on-surface-variant flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                  {business.address}
                </p>
              )}
            </div>
          </div>
          <span className="px-3 py-1 bg-primary/10 text-primary text-label-md font-semibold rounded-full border border-primary/20">
            Reserva Online Oficial
          </span>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          {["1. Servicio", "2. Fecha y Hora", "3. Mis Datos", "4. Confirmación"].map(
            (label, idx) => {
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
                    className={`hidden md:inline text-body-xs font-semibold ${isActive ? "text-primary" : "text-on-surface-variant"}`}
                  >
                    {label}
                  </span>
                </div>
              );
            }
          )}
        </div>

        {error && (
          <Alert variant="error" className="mb-6 py-2.5 px-4 rounded-xl text-body-md">
            {error}
          </Alert>
        )}

        {/* STEP 1: Select Service */}
        {step === 1 && (
          <div className="animate-in fade-in duration-200">
            <h2 className="text-headline-sm font-bold text-on-surface mb-2">
              Selecciona un Servicio
            </h2>
            <p className="text-body-sm text-on-surface-variant mb-6">
              Elige la actividad o servicio que deseas reservar.
            </p>

            <div className="grid grid-cols-1 gap-4">
              {business.services.map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => {
                    setSelectedService(srv);
                    setStep(2);
                  }}
                  className={`p-5 rounded-xl border transition-all cursor-pointer flex items-center justify-between bg-surface-container-lowest ${
                    selectedService?.id === srv.id
                      ? "border-primary ring-2 ring-primary/20 bg-primary/5 shadow-sm"
                      : "border-outline-variant/60 hover:border-primary/50 hover:bg-surface-container-low"
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-title-md text-on-surface">{srv.name}</span>
                      {srv.capacity > 1 && (
                        <span className="px-2 py-0.5 text-body-xs bg-secondary-container text-on-secondary-container rounded-md font-semibold">
                          Aforo: {srv.capacity} personas
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Select Date & Time */}
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
              <label className="block text-body-sm font-semibold text-on-surface mb-2">
                Fecha de la Cita
              </label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime("");
                }}
                className="w-full px-4 py-3 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />

              <label className="block text-body-sm font-semibold text-on-surface mt-6 mb-3">
                Horarios Disponibles
              </label>
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
                      onClick={() => setSelectedTime(time)}
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

        {/* STEP 3: Enter Client Details */}
        {step === 3 && selectedService && selectedTime && (
          <div className="animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-headline-sm font-bold text-on-surface">
                  Tus Datos de Contacto
                </h2>
                <p className="text-body-sm text-on-surface-variant">
                  Necesarios para confirmar tu reserva por WhatsApp o Email.
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
                <div>
                  <label className="block text-body-sm font-semibold text-on-surface mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej. María García"
                    className="w-full px-4 py-3 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-body-sm font-semibold text-on-surface mb-1">
                    Teléfono Móvil (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Ej. 600112233"
                    className="w-full px-4 py-3 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-body-sm font-semibold text-on-surface mb-1">
                    Correo Electrónico (Opcional)
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Ej. maria@ejemplo.com"
                    className="w-full px-4 py-3 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                {/* Summary Box */}
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
                      <strong>Fecha y Hora:</strong> {selectedDate} a las {selectedTime} hs
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

        {/* STEP 4: Success Receipt */}
        {step === 4 && bookingResult && (
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
                  <strong>Fecha y Hora:</strong> {selectedDate} a las {selectedTime} hs
                </p>
                <p>
                  <strong>Nombre:</strong> {clientName}
                </p>
                <p>
                  <strong>Teléfono:</strong> {clientPhone}
                </p>
              </div>

              <p className="text-body-xs text-on-surface-variant/80 mb-6">
                Recibirás un recordatorio por WhatsApp antes de la cita. ¡Gracias por confiar en{" "}
                {business.name}!
              </p>

              <Button
                variant="outline"
                onClick={() => {
                  setStep(1);
                  setSelectedService(null);
                  setSelectedTime("");
                  setBookingResult(null);
                }}
                className="w-full py-3 font-semibold rounded-xl"
              >
                Hacer otra reserva
              </Button>
            </Card>
          </div>
        )}
      </div>

      {/* Footer Disclaimer */}
      <footer className="mt-12 text-center text-body-xs text-on-surface-variant/60 border-t border-outline-variant/40 pt-4 flex items-center justify-center gap-1">
        <ShieldCheck className="w-4 h-4 text-primary" />
        Sistema verificado y seguro · Volta Platform
      </footer>
    </div>
  );
}
