"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { formatPhoneNumber } from "@/lib/utils";

const normalizeString = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ");
};

const normalizePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("34") && digits.length > 9) {
    return digits.slice(2);
  }
  return digits;
};

// El backend responde siempre { error: string, details?: [{ field, message }] }.
// Sin desenvolverlo, el usuario solo veía "Failed to save appointment" y se
// perdía el motivo real (hueco ocupado, fuera de horario, teléfono inválido...).
const extractErrorMessage = (payload: unknown, fallback: string) => {
  if (!payload || typeof payload !== "object") return fallback;
  const body = payload as { error?: unknown; details?: unknown };

  if (Array.isArray(body.details) && body.details.length > 0) {
    const messages = body.details
      .map((d) => (d && typeof d === "object" ? (d as { message?: string }).message : null))
      .filter((m): m is string => typeof m === "string" && m.length > 0);
    if (messages.length > 0) return messages.join(". ");
  }

  return typeof body.error === "string" && body.error.length > 0 ? body.error : fallback;
};

export interface NewAppointmentFormData {
  clientName: string;
  clientPhone: string;
  service: string;
  date: string;
  time: string;
  stylist: string;
}

/**
 * Repetición semanal de una clase de grupo.
 *
 * `daysOfWeek` sigue el convenio de Date.getDay() (0 = domingo), el mismo que usan
 * el horario del negocio y el backend, así que no hay que traducir índices.
 */
export interface GroupRecurrence {
  enabled: boolean;
  daysOfWeek: number[];
  endDate: string;
  repeatClients: boolean;
}

/** Día de la semana de un "YYYY-MM-DD", sin que el huso lo corra un día. */
const weekdayOfIsoDay = (isoDay: string): number | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDay);
  if (!match) return null;

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day)).getDay();
};

export function useNewAppointmentForm(
  isOpen: boolean,
  initialDate?: string,
  initialTime?: string,
  onSave?: (appointmentData: any) => void,
  onClose?: () => void
) {
  const { data: session } = useSession();
  const businessId = session?.user?.businessId || "";

  const [bookingType, setBookingType] = useState<"INDIVIDUAL" | "GROUP">("INDIVIDUAL");

  const [formData, setFormData] = useState<NewAppointmentFormData>({
    clientName: "",
    clientPhone: "",
    service: "",
    date: "",
    time: "10:00",
    stylist: "",
  });

  const [clientsList, setClientsList] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [groupClients, setGroupClients] = useState<Array<{ id?: string; name: string; phone?: string }>>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showConsentToast, setShowConsentToast] = useState(false);
  const [toastPhone, setToastPhone] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [recurrence, setRecurrence] = useState<GroupRecurrence>({
    enabled: false,
    daysOfWeek: [],
    endDate: "",
    repeatClients: true,
  });
  // Mientras el jefe no toque los días, el patrón sigue a la fecha elegida: quien
  // abre el modal sobre un martes espera ver marcado el martes.
  const daysTouched = useRef(false);

  // Prefill date and time when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setSubmitError(null);
    setIsSubmitting(false);
    setGroupClients([]);
    daysTouched.current = false;
    setRecurrence({ enabled: false, daysOfWeek: [], endDate: "", repeatClients: true });
    setFormData({
      clientName: "",
      clientPhone: "",
      service: "",
      date: initialDate || new Date().toISOString().split("T")[0],
      time: initialTime || "10:00",
      stylist: "Volta",
    });
  }, [isOpen, initialDate, initialTime]);

  const fetchServices = useCallback(async (selectServiceName?: string) => {
    if (!businessId) return;
    try {
      const res = await fetch(`/api/backend/services?businessId=${businessId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setServices(data);
        if (selectServiceName) {
          setFormData((prev) => ({ ...prev, service: selectServiceName }));
        }
      } else {
        setServices([]);
      }
    } catch (e) {
      console.error("Error loading services:", e);
      setServices([]);
    }
  }, [businessId]);

  // La fecha elegida siembra el día que se repite. Deja de mandar en cuanto el
  // jefe marca los días a mano (p. ej. martes y jueves con la misma clase).
  useEffect(() => {
    if (daysTouched.current) return;

    const weekday = weekdayOfIsoDay(formData.date);
    setRecurrence((prev) => {
      const next = weekday === null ? [] : [weekday];
      if (prev.daysOfWeek.length === next.length && prev.daysOfWeek[0] === next[0]) return prev;
      return { ...prev, daysOfWeek: next };
    });
  }, [formData.date]);

  const toggleRecurrenceDay = useCallback((day: number) => {
    daysTouched.current = true;
    setRecurrence((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day].sort((a, b) => a - b),
    }));
  }, []);

  // Load clients and services on modal open
  useEffect(() => {
    if (!isOpen || !businessId) return;

    // Fetch clients
    fetch(`/api/backend/clients?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClientsList(data);
        }
      })
      .catch((e) => {
        console.error("Error loading clients:", e);
        setClientsList([]);
      });

    // Fetch services
    fetchServices();
  }, [isOpen, businessId, fetchServices]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    const finalVal = id === "clientPhone" ? formatPhoneNumber(value) : value;
    setFormData((prev) => ({ ...prev, [id]: finalVal }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, clientName: value }));

    if (value.trim().length <= 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = clientsList.filter((c) => {
      const fullName = `${c.name} ${c.surname || ""}`.trim();
      return (
        normalizeString(fullName).includes(normalizeString(value)) ||
        normalizePhone(c.phone).includes(normalizePhone(value))
      );
    });

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  const handleSelectSuggestion = (client: { id?: string; name: string; surname?: string; phone: string }) => {
    const fullName = `${client.name} ${client.surname || ""}`.trim();
    if (bookingType === "GROUP") {
      setGroupClients((prev) => {
        if (prev.some((c) => c.name.toLowerCase() === fullName.toLowerCase())) return prev;
        return [...prev, { id: client.id, name: fullName, phone: client.phone }];
      });
      setFormData((prev) => ({ ...prev, clientName: "" }));
    } else {
      setFormData((prev) => ({
        ...prev,
        clientName: fullName,
        clientPhone: client.phone,
      }));
    }
    setShowSuggestions(false);
  };

  const handleAddManualGroupClient = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setGroupClients((prev) => {
      if (prev.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) return prev;
      return [...prev, { name: trimmed }];
    });
    setFormData((prev) => ({ ...prev, clientName: "" }));
    setShowSuggestions(false);
  };

  const handleRemoveGroupClient = (index: number) => {
    setGroupClients((prev) => prev.filter((_, idx) => idx !== index));
  };

  const resetFormAndClose = () => {
    setGroupClients([]);
    daysTouched.current = false;
    setRecurrence({ enabled: false, daysOfWeek: [], endDate: "", repeatClients: true });
    setFormData({
      clientName: "",
      clientPhone: "",
      service: "",
      date: "",
      time: "10:00",
      stylist: "Volta",
    });
    onClose?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);

    const [h, m] = (formData.time || "10:00").split(":");
    const cleanH = (h || "10").padStart(2, "0");
    const cleanM = (m || "00").padStart(2, "0");
    const formattedTime = `${cleanH}:${cleanM}`;

    const localDate = new Date(`${formData.date}T${formattedTime}:00`);
    if (isNaN(localDate.getTime())) {
      setSubmitError("La fecha o la hora de la cita no son válidas.");
      return;
    }
    if (!businessId) {
      setSubmitError("No se ha podido identificar el negocio. Vuelve a iniciar sesión.");
      return;
    }
    const appointmentDateStr = localDate.toISOString();

    const isGroup = bookingType === "GROUP";
    const isRecurring = isGroup && recurrence.enabled;

    if (isRecurring && recurrence.daysOfWeek.length === 0) {
      setSubmitError("Selecciona al menos un día de la semana para repetir la clase.");
      return;
    }

    // Clase semanal: en vez de una cita se programa la serie, y el backend crea
    // las sesiones de los próximos meses y las va extendiendo sola.
    if (isRecurring) {
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/backend/class-schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId,
            service: formData.service,
            daysOfWeek: recurrence.daysOfWeek,
            startTime: formattedTime,
            startDate: formData.date,
            endDate: recurrence.endDate || null,
            repeatClients: recurrence.repeatClients,
            attendees: groupClients.map((client) => ({
              name: client.name,
              phone: client.phone || null,
              clientId: client.id || null,
            })),
          }),
        });

        const payload = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(extractErrorMessage(payload, "No se ha podido programar la clase."));
        }

        onSave?.({ ...payload, recurring: true, service: formData.service });
        resetFormAndClose();
      } catch (err) {
        console.error("Error creating class schedule:", err);
        setSubmitError(
          err instanceof Error ? err.message : "Error inesperado al programar la clase."
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const groupNames = groupClients.map((c) => c.name).join(", ");
    const finalClientName = isGroup
      ? (groupNames || (formData.clientName.trim() ? formData.clientName.trim() : formData.service || "Clase de Grupo"))
      : formData.clientName;
    const finalClientPhone = isGroup
      ? (groupClients.find((c) => c.phone)?.phone || "")
      : formData.clientPhone;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/backend/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientName: finalClientName,
          clientPhone: finalClientPhone,
          appointmentDate: appointmentDateStr,
          businessId: businessId,
          service: formData.service,
        }),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(extractErrorMessage(payload, "No se ha podido guardar la cita."));
      }

      onSave?.({
        ...payload,
        service: formData.service,
      });

      resetFormAndClose();
    } catch (err) {
      console.error("Error saving appointment:", err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Error inesperado al guardar la cita."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHourChange = (value: string) => {
    let val = value.replace(/\D/g, "").slice(0, 2);
    if (val !== "") {
      const num = parseInt(val, 10);
      if (num > 23) val = "23";
    }
    const [, currentMin] = (formData.time || "10:00").split(":");
    setFormData((prev) => ({
      ...prev,
      time: `${val}:${currentMin || "00"}`,
    }));
  };

  const handleHourBlur = () => {
    const [h, m] = (formData.time || "10:00").split(":");
    if (!h) {
      setFormData((prev) => ({ ...prev, time: `10:${m || "00"}` }));
      return;
    }
    const num = parseInt(h, 10);
    // Smart afternoon conversion: Single digit 1-7 (without leading 0) maps to 13:00 - 19:00
    let finalH = h.padStart(2, "0");
    if (!h.startsWith("0") && num >= 1 && num <= 7) {
      finalH = String(num + 12);
    }
    setFormData((prev) => ({
      ...prev,
      time: `${finalH}:${m || "00"}`,
    }));
  };

  const handleMinChange = (value: string) => {
    let val = value.replace(/\D/g, "").slice(0, 2);
    if (val !== "") {
      const num = parseInt(val, 10);
      if (num > 59) val = "59";
    }
    const [currentHour] = (formData.time || "10:00").split(":");
    setFormData((prev) => ({
      ...prev,
      time: `${currentHour || "10"}:${val}`,
    }));
  };

  const handleMinBlur = () => {
    const [h, m] = (formData.time || "10:00").split(":");
    const paddedM = m.padStart(2, "0") || "00";
    setFormData((prev) => ({
      ...prev,
      time: `${h}:${paddedM}`,
    }));
  };

  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      if (bookingType === "GROUP") {
        return srv.type === "GROUP" || (srv.capacity && srv.capacity > 1);
      }
      return srv.type === "INDIVIDUAL" || !srv.type || srv.capacity === 1;
    });
  }, [services, bookingType]);

  useEffect(() => {
    if (filteredServices.length > 0) {
      const exists = filteredServices.some((s) => s.name === formData.service);
      if (!exists) {
        setFormData((prev) => ({ ...prev, service: filteredServices[0].name }));
      }
    } else {
      setFormData((prev) => ({ ...prev, service: "" }));
    }
  }, [filteredServices, formData.service]);

  const serviceOptions = filteredServices.map((srv) => ({
    value: srv.name,
    label: srv.name,
    sublabel:
      srv.price !== undefined
        ? `€${srv.price}${srv.capacity && srv.capacity > 1 ? ` · Máx. ${srv.capacity} alumnos` : ""}`
        : undefined,
  }));

  return {
    bookingType,
    setBookingType,
    formData,
    setFormData,
    recurrence,
    setRecurrence,
    toggleRecurrenceDay,
    groupClients,
    handleAddManualGroupClient,
    handleRemoveGroupClient,
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
    services,
    fetchServices,
    businessId,
  };
}
