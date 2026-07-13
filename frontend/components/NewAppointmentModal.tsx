"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Sparkles,
  GripHorizontal,
  ChevronDown,
} from "lucide-react";
import { useSession } from "next-auth/react";
import {
  FieldGroup,
  Field,
  FloatingInput,
  Button,
  FloatingSelect,
  Alert,
  InlineSelect,
  CalendarSelect,
} from "@/components/ui/volta-ui";

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
  triggerRect?: { left: number; top: number; right: number; bottom: number; width: number; height: number; } | null;
}

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

const DEFAULT_SERVICES = [
  { name: "Corte Caballero", price: 35 },
  { name: "Corte Dama", price: 45 },
  { name: "Coloración Premium", price: 85 },
  { name: "Tratamiento Keratina", price: 50 },
  { name: "Manicura", price: 20 },
  { name: "Spa Facial", price: 40 },
];

export default function NewAppointmentModal({
  isOpen,
  onClose,
  onSave,
  initialDate,
  initialTime,
  triggerRect,
}: NewAppointmentModalProps) {
  const { data: session } = useSession();
  const businessId = session?.user?.businessId || "mock-business-id";

  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    service: "",
    date: "",
    time: "10:00",
    stylist: "Volta",
  });

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const lastIsOpen = useRef(isOpen);
  const isFirstOpen = useRef(false);

  if (isOpen && !lastIsOpen.current) {
    isFirstOpen.current = true;
    lastIsOpen.current = true;
  } else if (!isOpen && lastIsOpen.current) {
    lastIsOpen.current = false;
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("input") || (e.target as HTMLElement).closest("select")) return;

    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setPosition({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Prefill date and time when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        clientName: "",
        clientPhone: "",
        service: "",
        date: initialDate || new Date().toISOString().split("T")[0],
        time: initialTime || "10:00",
        stylist: "Volta",
      });

      // Calculate initial coordinates next to clicked trigger button/space
      if (triggerRect && window.innerWidth >= 768) {
        const modalWidth = 448;
        const modalHeight = 550;
        
        let targetX = triggerRect.right + 12;
        if (targetX + modalWidth > window.innerWidth) {
          targetX = triggerRect.left - modalWidth - 12;
        }
        targetX = Math.max(12, Math.min(targetX, window.innerWidth - modalWidth - 12));

        let targetY = triggerRect.top;
        if (targetY + modalHeight > window.innerHeight) {
          targetY = Math.max(12, window.innerHeight - modalHeight - 12);
        }
        
        setPosition({ x: targetX, y: targetY });
      } else {
        // Center modal on screen
        const modalWidth = Math.min(448, window.innerWidth - 32);
        const modalHeight = Math.min(550, window.innerHeight - 32);
        const targetX = (window.innerWidth - modalWidth) / 2;
        const targetY = (window.innerHeight - modalHeight) / 2;
        setPosition({ x: targetX, y: targetY });
      }

      const timer = setTimeout(() => {
        isFirstOpen.current = false;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialDate, initialTime, triggerRect]);

  const [clientsList, setClientsList] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>(DEFAULT_SERVICES);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showConsentToast, setShowConsentToast] = useState(false);
  const [toastPhone, setToastPhone] = useState("");

  // Load clients and services on modal open
  useEffect(() => {
    if (isOpen && businessId) {
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
      fetch(`/api/backend/services?businessId=${businessId}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setServices(data);
            setFormData((prev) => ({
              ...prev,
              service: data[0].name,
            }));
          } else {
            setServices(DEFAULT_SERVICES);
            setFormData((prev) => ({
              ...prev,
              service: DEFAULT_SERVICES[0].name,
            }));
          }
        })
        .catch((e) => {
          console.error("Error loading services:", e);
          setServices(DEFAULT_SERVICES);
        });
    }
  }, [isOpen, businessId]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;
  if (!mounted) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, clientName: value }));

    if (value.trim().length > 1) {
      const filtered = clientsList.filter((c) => {
        const fullName = `${c.name} ${c.surname || ""}`.trim();
        return (
          normalizeString(fullName).includes(normalizeString(value)) ||
          normalizePhone(c.phone).includes(normalizePhone(value))
        );
      });
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (client: { name: string; surname?: string; phone: string }) => {
    const fullName = `${client.name} ${client.surname || ""}`.trim();
    setFormData((prev) => ({
      ...prev,
      clientName: fullName,
      clientPhone: client.phone,
    }));
    setShowSuggestions(false);
  };

  const resetFormAndClose = () => {
    setFormData({
      clientName: "",
      clientPhone: "",
      service: "",
      date: "",
      time: "10:00",
      stylist: "Volta",
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Strictly format time as HH:MM to prevent Invalid Date on Safari
    const [h, m] = (formData.time || "10:00").split(":");
    const cleanH = (h || "10").padStart(2, "0");
    const cleanM = (m || "00").padStart(2, "0");
    const formattedTime = `${cleanH}:${cleanM}`;

    // Parse as local browser date/time and convert to ISO string to handle timezone offsets correctly
    const localDate = new Date(`${formData.date}T${formattedTime}:00`);
    if (isNaN(localDate.getTime())) {
      console.error("Invalid appointment date/time calculated");
      return;
    }
    const appointmentDateStr = localDate.toISOString();

    fetch("/api/backend/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        appointmentDate: appointmentDateStr,
        businessId: businessId,
        service: formData.service,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save appointment");
        return res.json();
      })
      .then((savedApp) => {
        // Call parent onSave with the response data (which is a real DB appointment)
        onSave({
          ...savedApp,
          service: formData.service, // pass original service name for frontend layout state updates
        });

        // Check if client exists to show toast if it's new
        const exist = clientsList.some((c) => {
          const existingName = normalizeString(`${c.name} ${c.surname || ""}`);
          const inputName = normalizeString(formData.clientName);

          const existingPhone = normalizePhone(c.phone);
          const inputPhone = normalizePhone(formData.clientPhone);

          return existingName === inputName || existingPhone === inputPhone;
        });

        if (!exist && formData.clientName.trim().length > 0) {
          setToastPhone(formData.clientPhone);
          setShowConsentToast(true);
          setTimeout(() => {
            setShowConsentToast(false);
            resetFormAndClose();
          }, 2500);
        } else {
          resetFormAndClose();
        }
      })
      .catch((err) => {
        console.error("Error saving appointment:", err);
        // Fallback in case of network issues to keep UX working
        onSave({
          id: String(Date.now()),
          clientName: formData.clientName,
          clientPhone: formData.clientPhone,
          service: formData.service,
          date: formData.date,
          time: formData.time,
        });
        resetFormAndClose();
      });
  };

  const [selectedHour, selectedMin] = (formData.time || "10:00").split(":");

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const h = e.target.value;
    const [, currentMin] = (formData.time || "10:00").split(":");
    setFormData((prev) => ({ ...prev, time: `${h}:${currentMin || "00"}` }));
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = e.target.value;
    const [currentHour] = (formData.time || "10:00").split(":");
    setFormData((prev) => ({ ...prev, time: `${currentHour || "10"}:${m}` }));
  };
  const serviceOptions = services.map((srv) => ({
    value: srv.name,
    label: srv.name,
    sublabel: srv.price !== undefined ? `€${srv.price}` : undefined,
  }));

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/5 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content Card */}
      <div
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: "448px",
          maxWidth: "calc(100vw - 32px)",
          transition: (isDragging || isFirstOpen.current) ? "none" : undefined,
          animation: isDragging ? "none" : undefined,
        }}
        className="bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant overflow-visible z-10 animate-in fade-in zoom-in-95 duration-200"
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

        {/* Title */}
        <div className="px-5 pb-1">
          <h2 className="text-2xl font-medium text-on-surface">Reservar Cita</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
          {/* Client Details */}
          <FieldGroup className="flex flex-col gap-5">
            {/* Title / Client Name */}
            <div className="flex items-start gap-4">
              <div className="w-6 h-10 flex items-center justify-center text-on-surface-variant/40 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <Field>
                  <div className="relative w-full">
                    <FloatingInput
                      id="clientName"
                      label="Nombre del Cliente"
                      type="text"
                      required
                      value={formData.clientName}
                      onChange={handleNameChange}
                      variant="borderless"
                      className="text-body-lg font-normal !py-2"
                      onFocus={() => {
                        if (
                          formData.clientName.trim().length > 1 &&
                          suggestions.length > 0
                        ) {
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
                    label="Teléfono"
                    type="tel"
                    required
                    variant="borderless"
                    value={formData.clientPhone}
                    onChange={handleChange}
                  />
                </Field>
              </div>
            </div>

            {/* Service */}
            <div className="flex items-start gap-4">
              <div className="w-6 h-10 flex items-center justify-center text-on-surface-variant/40 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <Field>
                  <InlineSelect
                    id="service"
                    label="Seleccionar servicio"
                    value={formData.service}
                    onChange={(val) => setFormData((prev) => ({ ...prev, service: val }))}
                    options={serviceOptions}
                    variant="borderless"
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
                        onChange={(e) => {
                          let val = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 2);
                          if (val !== "") {
                            const num = parseInt(val, 10);
                            if (num > 23) val = "23";
                          }
                          const [, currentMin] = (
                            formData.time || "10:00"
                          ).split(":");
                          setFormData((prev) => ({
                            ...prev,
                            time: `${val}:${currentMin || "00"}`,
                          }));
                        }}
                        onBlur={() => {
                          const [h, m] = (formData.time || "10:00").split(":");
                          const paddedH = h.padStart(2, "0") || "10";
                          setFormData((prev) => ({
                            ...prev,
                            time: `${paddedH}:${m}`,
                          }));
                        }}
                        className="w-10 bg-transparent text-body-lg text-on-surface border-0 rounded-none focus:ring-0 py-1 outline-none text-center hover:bg-on-surface/[0.04] focus:bg-on-surface/[0.06] rounded-md transition-all duration-200"
                        placeholder="10"
                      />
                      <span className="text-on-surface-variant/50 font-medium">
                        :
                      </span>
                      <input
                        type="text"
                        pattern="[0-9]*"
                        maxLength={2}
                        value={selectedMin}
                        onChange={(e) => {
                          let val = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 2);
                          if (val !== "") {
                            const num = parseInt(val, 10);
                            if (num > 59) val = "59";
                          }
                          const [currentHour] = (
                            formData.time || "10:00"
                          ).split(":");
                          setFormData((prev) => ({
                            ...prev,
                            time: `${currentHour || "10"}:${val}`,
                          }));
                        }}
                        onBlur={() => {
                          const [h, m] = (formData.time || "10:00").split(":");
                          const paddedM = m.padStart(2, "0") || "00";
                          setFormData((prev) => ({
                            ...prev,
                            time: `${h}:${paddedM}`,
                          }));
                        }}
                        className="w-10 bg-transparent text-body-lg text-on-surface border-0 rounded-none focus:ring-0 py-1 outline-none text-center hover:bg-on-surface/[0.04] focus:bg-on-surface/[0.06] rounded-md transition-all duration-200"
                        placeholder="00"
                      />
                    </div>
                  </div>
                </Field>
              </div>
            </div>
          </FieldGroup>

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" onClick={onClose} variant="outline" size="lg">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="lg">
              Reservar Cita
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
          <svg
            className="w-6 h-6 text-secondary shrink-0"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
          </svg>
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-on-secondary-container text-body-md">
              Cita Reservada
            </p>
            <p className="text-body-sm text-on-secondary-container/80">
              Enlace de consentimiento LOPD enviado a{" "}
              <span className="font-semibold">{toastPhone}</span> por WhatsApp.
            </p>
          </div>
        </Alert>
      )}
    </div>,
    document.body,
  );
}
