"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDraggableModal } from "@/lib/useDraggableModal";
import {
  X,
  User,
  Phone,
  Mail,
  Sparkles,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/volta-ui";
import { useAddClientForm, ClientToEdit } from "@/hooks/useAddClientForm";

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: {
    id?: string;
    name: string;
    surname: string;
    phone: string;
    email?: string;
    frequency?: string;
    notes?: string;
  }) => void;
  /** Pass a client object to activate edit mode */
  clientToEdit?: ClientToEdit | null;
  triggerRect?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  } | null;
}

const FREQUENCY_OPTIONS = [
  { value: "", label: "Seleccionar frecuencia..." },
  { value: "Mensual", label: "Mensual" },
  { value: "Cada 2 meses", label: "Cada 2 meses" },
  { value: "Ocasional", label: "Ocasional" },
  { value: "Primera visita", label: "Primera visita" },
];

export default function AddClientModal({
  isOpen,
  onClose,
  onSave,
  clientToEdit,
  triggerRect,
}: AddClientModalProps) {
  const { formData, isEditMode, handleChange, handleFrequencyChange, handleSubmit } =
    useAddClientForm(isOpen, clientToEdit, onSave, onClose);

  const { position, handleMouseDown } = useDraggableModal({
    isOpen,
    triggerRect,
    modalWidth: 480,
    modalHeight: 520,
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Backdrop — transparent without blur or darkening */}
      <div className="absolute inset-0 bg-transparent pointer-events-auto" onClick={onClose} />

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
        {/* Header */}
        <div
          onMouseDown={handleMouseDown}
          className="px-6 pt-5 pb-4 flex justify-between items-start border-b border-outline-variant/30 bg-surface-container-low/40 cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-on-surface tracking-tight">
              {isEditMode ? "Editar Cliente" : "Añadir Nuevo Cliente"}
            </h2>
            <p className="text-sm text-on-surface-variant mt-0.5">
              {isEditMode
                ? "Modifica los datos personales y de contacto"
                : "Completa la ficha para registrar al cliente"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container-high/60 transition-colors cursor-pointer -mr-1"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Nombre y Apellidos (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-2">
                <User className="w-4 h-4 text-on-surface shrink-0" />
                <span>Nombre <span className="text-error">*</span></span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Ej. Ana"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
            </div>
            <div>
              <label htmlFor="surname" className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-2">
                <User className="w-4 h-4 text-on-surface shrink-0" />
                <span>Apellidos</span>
              </label>
              <input
                id="surname"
                name="surname"
                type="text"
                placeholder="Ej. García López"
                value={formData.surname}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
            </div>
          </div>

          {/* Teléfono y Email (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="phone" className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-2">
                <Phone className="w-4 h-4 text-on-surface shrink-0" />
                <span>Teléfono <span className="text-error">*</span></span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="612 34 56 78"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-2">
                <Mail className="w-4 h-4 text-on-surface shrink-0" />
                <span>Correo electrónico</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="cliente@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
            </div>
          </div>

          {/* Frecuencia Estimada */}
          <div>
            <label htmlFor="frequency" className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-on-surface shrink-0" />
              <span>Frecuencia estimada de visita</span>
            </label>
            <select
              id="frequency"
              name="frequency"
              value={formData.frequency}
              onChange={(e) => handleFrequencyChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all cursor-pointer"
            >
              {FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notas y Alergias */}
          <div>
            <label htmlFor="notes" className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-2">
              <FileText className="w-4 h-4 text-on-surface shrink-0" />
              <span>Notas, preferencias y alergias</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="Preferencias de corte, fórmulas de tinte, alergias a productos..."
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/30">
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
              {isEditMode ? "Guardar cambios" : "Guardar Cliente"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
