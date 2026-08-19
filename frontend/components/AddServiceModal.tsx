"use client";

import { X, Sparkles, Pencil, Briefcase, Clock, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FieldGroup,
  Field,
  FloatingInput,
  Button,
  FloatingTextarea,
  SegmentedControl,
} from "@/components/ui/volta-ui";
import { useAddServiceForm, ServiceToEdit } from "@/hooks/useAddServiceForm";

const EuroIcon = ({ className }: { className?: string }) => (
  <span
    className={cn("font-semibold text-on-surface-variant/70 text-body-lg", className)}
    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
  >
    €
  </span>
);

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
}

const COLOR_OPTIONS = [
  { id: "TEAL", bg: "bg-[#377E7F]", label: "Teal Volta" },
  { id: "PURPLE", bg: "bg-purple-600", label: "Púrpura" },
  { id: "ROSE", bg: "bg-rose-500", label: "Rosa" },
  { id: "AMBER", bg: "bg-amber-500", label: "Ámbar" },
  { id: "INDIGO", bg: "bg-indigo-600", label: "Índigo" },
  { id: "EMERALD", bg: "bg-emerald-500", label: "Esmeralda" },
  { id: "SKY", bg: "bg-sky-500", label: "Azul Cielo" },
];

export default function AddServiceModal({
  isOpen,
  onClose,
  onSave,
  serviceToEdit,
}: AddServiceModalProps) {
  const {
    formData,
    isEditMode,
    handleChange,
    handleTypeChange,
    handleColorSelect,
    handleSubmit,
  } = useAddServiceForm(isOpen, serviceToEdit, onSave, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content Card */}
      <div className="relative bg-surface-container-lowest rounded-md shadow-xl border border-outline-variant max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h3 className="font-title-lg text-title-lg text-on-surface font-semibold flex items-center gap-3">
            {isEditMode ? (
              <Pencil className="w-5 h-5 text-primary" />
            ) : (
              <Sparkles className="w-5 h-5 text-primary" />
            )}
            <span>{isEditMode ? "Editar Servicio" : "Añadir Nuevo Servicio"}</span>
          </h3>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-1.5 rounded-full text-on-surface-variant hover:text-on-surface w-8 h-8 active:scale-95 shadow-none"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <FieldGroup className="gap-5">
            {/* Service Type Toggle (Individual vs Group) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface-variant">
                Tipo de Servicio
              </label>
              <SegmentedControl
                value={formData.type}
                onChange={handleTypeChange}
                options={[
                  { value: "INDIVIDUAL", label: "Cita Individual (1 a 1)", icon: User },
                  { value: "GROUP", label: "Clase de Grupo (Yoga / Gym)", icon: Users },
                ]}
              />
            </div>

            {/* Service Name */}
            <Field>
              <FloatingInput
                id="name"
                label="Nombre del Servicio"
                type="text"
                required
                icon={Briefcase}
                value={formData.name}
                onChange={handleChange}
              />
            </Field>

            {/* Color Palette Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-on-surface-variant">
                Color de Tarjeta en Agenda
              </label>
              <div className="flex items-center gap-2.5">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    title={c.label}
                    onClick={() => handleColorSelect(c.id)}
                    className={`w-7 h-7 rounded-full ${c.bg} transition-all duration-150 flex items-center justify-center ${
                      formData.color === c.id
                        ? "ring-2 ring-offset-2 ring-primary scale-110 shadow-md"
                        : "opacity-80 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    {formData.color === c.id && (
                      <span className="w-2 h-2 rounded-full bg-white shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Duration (minutes) */}
              <Field>
                <FloatingInput
                  id="duration"
                  label="Duración (min)"
                  type="number"
                  min="1"
                  required
                  icon={Clock}
                  value={formData.duration}
                  onChange={handleChange}
                />
              </Field>

              {/* Price (Euros) */}
              <Field>
                <FloatingInput
                  id="price"
                  label="Precio (€)"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  icon={EuroIcon}
                  value={formData.price}
                  onChange={handleChange}
                />
              </Field>

              {/* Capacity */}
              <Field>
                <FloatingInput
                  id="capacity"
                  label={formData.type === "GROUP" ? "Aforo Alumnos" : "Aforo Máx."}
                  type="number"
                  min="1"
                  required
                  disabled={formData.type === "INDIVIDUAL"}
                  icon={formData.type === "GROUP" ? Users : Briefcase}
                  value={formData.capacity}
                  onChange={handleChange}
                />
              </Field>
            </div>

            {/* Description */}
            <Field>
              <FloatingTextarea
                id="description"
                label="Descripción (opcional)"
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </Field>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant/50">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                size="lg"
                className="text-on-surface"
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="lg">
                {isEditMode ? "Guardar Cambios" : "Añadir Servicio"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
