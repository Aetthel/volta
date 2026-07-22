"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Pencil, Briefcase, Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldGroup, Field, FloatingInput, Button, FloatingSelect, FloatingTextarea } from "@/components/ui/volta-ui";

const EuroIcon = ({ className }: { className?: string }) => (
  <span className={cn("font-semibold text-on-surface-variant/70 text-body-lg", className)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
    €
  </span>
);

interface ServiceToEdit {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  capacity?: number;
}

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: { id?: string; name: string; price: number; duration: number; description?: string; capacity?: number }) => void;
  serviceToEdit?: ServiceToEdit | null;
}

const EMPTY_FORM = {
  name: "",
  price: "",
  duration: "45",
  capacity: "1",
  description: "",
};

export default function AddServiceModal({
  isOpen,
  onClose,
  onSave,
  serviceToEdit,
}: AddServiceModalProps) {
  const isEditMode = !!serviceToEdit;

  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (serviceToEdit) {
      setFormData({
        name: serviceToEdit.name ?? "",
        price: String(serviceToEdit.price) ?? "",
        duration: String(serviceToEdit.duration) ?? "45",
        capacity: String(serviceToEdit.capacity ?? 1),
        description: serviceToEdit.description ?? "",
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [serviceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: serviceToEdit?.id,
      name: formData.name,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration, 10),
      capacity: parseInt(formData.capacity, 10) || 1,
      description: formData.description,
    });
    setFormData(EMPTY_FORM);
    onClose();
  };

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
            <span>
              {isEditMode ? "Editar Servicio" : "Añadir Nuevo Servicio"}
            </span>
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
                  label="Aforo (Máx.)"
                  type="number"
                  min="1"
                  required
                  icon={Briefcase}
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
              <Button
                type="submit"
                variant="primary"
                size="lg"
              >
                {isEditMode ? "Guardar Cambios" : "Añadir Servicio"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
