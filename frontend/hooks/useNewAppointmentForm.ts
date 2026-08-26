"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

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

export interface NewAppointmentFormData {
  clientName: string;
  clientPhone: string;
  service: string;
  date: string;
  time: string;
  stylist: string;
}

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
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showConsentToast, setShowConsentToast] = useState(false);
  const [toastPhone, setToastPhone] = useState("");

  // Prefill date and time when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      clientName: "",
      clientPhone: "",
      service: "",
      date: initialDate || new Date().toISOString().split("T")[0],
      time: initialTime || "10:00",
      stylist: "Volta",
    });
  }, [isOpen, initialDate, initialTime]);

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
          setServices([]);
          setFormData((prev) => ({
            ...prev,
            service: "",
          }));
        }
      })
      .catch((e) => {
        console.error("Error loading services:", e);
        setServices([]);
      });
  }, [isOpen, businessId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
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
    onClose?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const [h, m] = (formData.time || "10:00").split(":");
    const cleanH = (h || "10").padStart(2, "0");
    const cleanM = (m || "00").padStart(2, "0");
    const formattedTime = `${cleanH}:${cleanM}`;

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
        onSave?.({
          ...savedApp,
          service: formData.service,
        });

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
        onSave?.({
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
    const paddedH = h.padStart(2, "0") || "10";
    setFormData((prev) => ({
      ...prev,
      time: `${paddedH}:${m}`,
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

  const filteredServices = services.filter((srv) => {
    if (bookingType === "GROUP") {
      return srv.type === "GROUP" || (srv.capacity && srv.capacity > 1);
    }
    return srv.type === "INDIVIDUAL" || !srv.type || srv.capacity === 1;
  });

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
  };
}
