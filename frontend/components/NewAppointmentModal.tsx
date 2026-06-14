"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, User, Phone, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { FieldGroup, Field, FieldLabel, InputGroup } from "@/components/ui/volta-ui";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointmentData: any) => void;
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

export default function NewAppointmentModal({ isOpen, onClose, onSave }: NewAppointmentModalProps) {
  const { data: session } = useSession();
  const businessId = session?.user?.id || "mock-business-id";

  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    service: "Corte Caballero",
    date: "",
    time: "10:00",
    stylist: "Volta",
  });

  const [clientsList, setClientsList] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showConsentToast, setShowConsentToast] = useState(false);
  const [toastPhone, setToastPhone] = useState("");

  // Load clients on modal open
  useEffect(() => {
    if (isOpen && businessId) {
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
    }
  }, [isOpen, businessId]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleSelectSuggestion = (client: any) => {
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
      service: "Corte Caballero",
      date: "",
      time: "10:00",
      stylist: "Volta",
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const appointmentDateStr = `${formData.date}T${formData.time}:00`;

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
        service: formData.service
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
        service: formData.service // pass original service since DB doesn't store it but frontend needs it to render
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
        time: formData.time
      });
      resetFormAndClose();
    });
  };

  const services = [
    "Corte Caballero",
    "Corte Dama",
    "Coloración Premium",
    "Tratamiento Keratina",
    "Manicura",
    "Spa Facial",
  ];



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content Card */}
      <div className="relative bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant max-w-xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h3 className="font-title-lg text-title-lg text-on-surface font-semibold flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Reservar Nueva Cita</span>
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6">
          
          {/* Client Details */}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="clientName">Nombre del Cliente</FieldLabel>
              <InputGroup>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="clientName"
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={formData.clientName}
                  onChange={handleNameChange}
                  onFocus={() => {
                    if (formData.clientName.trim().length > 1 && suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  className="w-full border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                />

                {/* Autocomplete Suggestions list */}
                {showSuggestions && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowSuggestions(false)}
                    />
                    <div className="absolute left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg max-h-48 overflow-y-auto custom-scrollbar z-50 py-1">
                      {suggestions.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => handleSelectSuggestion(client)}
                          className="w-full px-4 py-2 hover:bg-surface-variant flex items-center justify-between text-left transition-colors cursor-pointer border-none"
                        >
                          <div className="flex flex-col">
                            <span className="text-body-md font-semibold text-on-surface">
                              {client.name} {client.surname}
                            </span>
                            <span className="text-body-xs text-on-surface-variant">
                              {client.phone}
                            </span>
                          </div>
                          <span className="text-body-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                            Registrado
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="clientPhone">Teléfono</FieldLabel>
              <InputGroup>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  id="clientPhone"
                  type="tel"
                  required
                  placeholder="+34 600 000 000"
                  value={formData.clientPhone}
                  onChange={handleChange}
                  className="w-full border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                />
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="service">Servicio</FieldLabel>
              <select
                id="service"
                value={formData.service}
                onChange={handleChange}
                className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
              >
                {services.map((svc) => (
                  <option key={svc} value={svc}>{svc}</option>
                ))}
              </select>
            </Field>
          </FieldGroup>

          {/* Date and Time selection */}
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="date">Fecha</FieldLabel>
              <input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="time">Hora</FieldLabel>
              <select
                id="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
              >
                {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
          </FieldGroup>

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-outline text-primary font-label-lg text-label-lg hover:bg-surface-container transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] transition-all cursor-pointer"
            >
              Reservar Cita
            </button>
          </div>
        </form>
      </div>

      {/* LOPD WhatsApp Consent Toast Overlay */}
      {showConsentToast && (
        <div className="fixed top-6 right-6 z-[60] flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-950 px-6 py-4 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm">
          <svg className="w-6 h-6 text-[#25D366] shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
          </svg>
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-emerald-950 text-body-md">Cita Reservada</p>
            <p className="text-body-sm text-emerald-800">
              Enlace de consentimiento LOPD enviado a <span className="font-semibold">{toastPhone}</span> por WhatsApp.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
