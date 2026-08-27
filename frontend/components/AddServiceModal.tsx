"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDraggableModal } from "@/lib/useDraggableModal";
import {
  X,
  Briefcase,
  Clock,
  Euro,
  Users,
  User,
  FileText,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/volta-ui";
import { useAddServiceForm, ServiceToEdit } from "@/hooks/useAddServiceForm";

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: {
    id?: string;
    name: string;
    price: number;
    duration: number;
    description?: string;
    capacity?: number;
    type?: "INDIVIDUAL" | "GROUP";
    color?: string;
  }) => void;
  serviceToEdit?: ServiceToEdit | null;
  triggerRect?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  } | null;
}

const COLOR_OPTIONS = [
  { id: "TEAL", bg: "bg-[#377E7F]", ring: "ring-[#377E7F]", label: "Teal Volta" },
  { id: "PURPLE", bg: "bg-purple-600", ring: "ring-purple-600", label: "Púrpura" },
  { id: "ROSE", bg: "bg-rose-500", ring: "ring-rose-500", label: "Rosa" },
  { id: "AMBER", bg: "bg-amber-500", ring: "ring-amber-500", label: "Ámbar" },
  { id: "INDIGO", bg: "bg-indigo-600", ring: "ring-indigo-600", label: "Índigo" },
  { id: "EMERALD", bg: "bg-emerald-500", ring: "ring-emerald-500", label: "Esmeralda" },
  { id: "SKY", bg: "bg-sky-500", ring: "ring-sky-500", label: "Azul Cielo" },
];

export default function AddServiceModal({
  isOpen,
  onClose,
  onSave,
  serviceToEdit,
  triggerRect,
}: AddServiceModalProps) {
  const {
    formData,
    isEditMode,
    handleChange,
    handleTypeChange,
    handleColorSelect,
    handleSubmit,
  } = useAddServiceForm(isOpen, serviceToEdit, onSave, onClose);

  const { position, handleMouseDown } = useDraggableModal({
    isOpen,
    triggerRect,
    modalWidth: 500,
    modalHeight: 560,
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
          width: "500px",
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
            <h2 className="text-xl font-bold text-on-surface tracking-tight flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <span>{isEditMode ? "Editar Servicio" : "Añadir Nuevo Servicio"}</span>
            </h2>
            <p className="text-sm text-on-surface-variant mt-0.5">
              {isEditMode
                ? "Modifica los datos, duración y precio del servicio"
                : "Define las características de este servicio para tu agenda"}
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
          {/* Tipo de Servicio Toggle */}
          <div>
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5">
              Tipo de Servicio
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container-low/80 rounded-xl border border-outline-variant/50">
              <button
                type="button"
                onClick={() => handleTypeChange("INDIVIDUAL")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  formData.type === "INDIVIDUAL"
                    ? "bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/40"
                    : "text-on-surface-variant/70 hover:text-on-surface"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Cita Individual (1 a 1)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange("GROUP")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  formData.type === "GROUP"
                    ? "bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/40"
                    : "text-on-surface-variant/70 hover:text-on-surface"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Clase Grupal (Aforo)</span>
              </button>
            </div>
          </div>

          {/* Nombre del Servicio */}
          <div>
            <label htmlFor="name" className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-on-surface shrink-0" />
              <span>Nombre del Servicio <span className="text-error">*</span></span>
            </label>
            <input
              id="name"
              type="text"
              required
              placeholder="Ej. Corte de Cabello + Lavado"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all"
            />
          </div>

          {/* Color de Tarjeta en Agenda */}
          <div>
            <label className="text-sm font-medium text-on-surface mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-on-surface shrink-0" />
              <span>Color en Agenda</span>
            </label>
            <div className="flex items-center gap-2.5">
              {COLOR_OPTIONS.map((c) => {
                const isSelected = formData.color === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    title={c.label}
                    onClick={() => handleColorSelect(c.id)}
                    className={`w-7 h-7 rounded-full ${c.bg} cursor-pointer transition-transform hover:scale-110 flex items-center justify-center ${
                      isSelected ? "ring-2 ring-offset-2 ring-primary scale-110" : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-white block shadow-xs" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duración, Precio y Aforo Máx (3 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label htmlFor="duration" className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-on-surface shrink-0" />
                <span>Duración (min) <span className="text-error">*</span></span>
              </label>
              <input
                id="duration"
                type="number"
                min="5"
                step="5"
                required
                placeholder="45"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
            </div>

            <div>
              <label htmlFor="price" className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5">
                <Euro className="w-3.5 h-3.5 text-on-surface shrink-0" />
                <span>Precio (€) <span className="text-error">*</span></span>
              </label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.5"
                required
                placeholder="25.00"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
            </div>

            <div>
              <label htmlFor="capacity" className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-on-surface shrink-0" />
                <span>Aforo Máx.</span>
              </label>
              <input
                id="capacity"
                type="number"
                min="1"
                disabled={formData.type === "INDIVIDUAL"}
                value={formData.type === "INDIVIDUAL" ? "1" : formData.capacity}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg transition-all ${
                  formData.type === "INDIVIDUAL"
                    ? "bg-surface-container-low/30 border-outline-variant/40 text-on-surface-variant/50 cursor-not-allowed"
                    : "bg-surface-container-low/60 border-outline-variant/70 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest"
                }`}
              />
            </div>
          </div>

          {/* Descripción (opcional) */}
          <div>
            <label htmlFor="description" className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-on-surface shrink-0" />
              <span>Descripción (opcional)</span>
            </label>
            <textarea
              id="description"
              rows={2}
              placeholder="Detalles sobre el procedimiento, productos incluidos..."
              value={formData.description}
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
              {isEditMode ? "Guardar cambios" : "Guardar Servicio"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
