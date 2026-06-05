"use client";

import { useState } from "react";
import { X, Calendar, Clock, User, Phone, Sparkles } from "lucide-react";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointmentData: any) => void;
}

export default function NewAppointmentModal({ isOpen, onClose, onSave }: NewAppointmentModalProps) {
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    service: "Corte Caballero",
    date: "",
    time: "10:00",
    stylist: "Ana García",
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      clientName: "",
      clientPhone: "",
      service: "Corte Caballero",
      date: "",
      time: "10:00",
      stylist: "Ana García",
    });
    onClose();
  };

  const services = [
    "Corte Caballero",
    "Corte Dama",
    "Coloración Premium",
    "Tratamiento Keratina",
    "Manicura",
    "Spa Facial",
  ];

  const stylists = [
    "Ana García",
    "Marco Polo",
    "Lucía M.",
    "Elena G.",
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
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant px-1" htmlFor="clientName">
                Nombre del Cliente
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="clientName"
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={formData.clientName}
                  onChange={handleChange}
                  className="w-full border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant px-1" htmlFor="clientPhone">
                Teléfono
              </label>
              <div className="relative">
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
              </div>
            </div>
          </div>

          {/* Service and Stylist selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant px-1" htmlFor="service">
                Servicio
              </label>
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
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant px-1" htmlFor="stylist">
                Estilista
              </label>
              <select
                id="stylist"
                value={formData.stylist}
                onChange={handleChange}
                className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
              >
                {stylists.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date and Time selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant px-1" htmlFor="date">
                Fecha
              </label>
              <div className="relative">
                <input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant px-1" htmlFor="time">
                Hora
              </label>
              <div className="relative">
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
              </div>
            </div>
          </div>

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
    </div>
  );
}
