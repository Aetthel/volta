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
} from "lucide-react";
import { Button, SegmentedControl } from "@/components/ui/volta-ui";
import { useAddServiceForm, ServiceToEdit } from "@/hooks/useAddServiceForm";
import { cn } from "@/lib/utils";

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
    handleSubmit,
  } = useAddServiceForm(isOpen, serviceToEdit, onSave, onClose);

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
              {isEditMode ? "Editar Servicio" : "Añadir Nuevo Servicio"}
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

        {/* Mode Switcher */}
        <div className="px-6 pt-4 pb-1">
          <SegmentedControl
            value={formData.type || "INDIVIDUAL"}
            onChange={(val) => handleTypeChange(val as "INDIVIDUAL" | "GROUP")}
            options={[
              { value: "INDIVIDUAL", label: "Cita Individual", icon: User },
              { value: "GROUP", label: "Clase de Grupo", icon: Users },
            ]}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-3 flex flex-col gap-4">
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

          {/* Duración, Precio y Aforo Máx */}
          <div className={cn("grid gap-3.5", formData.type === "GROUP" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2")}>
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

            {formData.type === "GROUP" && (
              <div>
                <label htmlFor="capacity" className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-on-surface shrink-0" />
                  <span>Aforo Máx.</span>
                </label>
                <input
                  id="capacity"
                  type="number"
                  min="2"
                  value={formData.capacity || 10}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all"
                />
              </div>
            )}
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
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/30 mt-1">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              size="md"
              className="cursor-pointer font-medium"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="cursor-pointer font-medium"
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
