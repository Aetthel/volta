"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Pencil, Scissors, Clock, DollarSign } from "lucide-react";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/volta-ui";

interface ServiceToEdit {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
}

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: any) => void;
  serviceToEdit?: ServiceToEdit | null;
}

const EMPTY_FORM = {
  name: "",
  price: "",
  duration: "45",
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
      description: formData.description,
    });
    setFormData(EMPTY_FORM);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <FieldGroup className="gap-5">
            {/* Service Name */}
            <Field>
              <FieldLabel htmlFor="name">Nombre del Servicio</FieldLabel>
              <div className="relative flex items-center">
                <Scissors className="w-5 h-5 text-on-surface-variant/70 absolute left-4 pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="ej. Corte Caballero, Tinte Completo..."
                  className="block w-full pl-12 pr-4 py-3 bg-surface text-body-lg text-on-surface border border-outline-variant rounded-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-outline-variant/60 shadow-sm"
                />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              {/* Duration (minutes) */}
              <Field>
                <FieldLabel htmlFor="duration">Duración (minutos)</FieldLabel>
                <div className="relative flex items-center">
                  <Clock className="w-5 h-5 text-on-surface-variant/70 absolute left-4 pointer-events-none" />
                  <select
                    id="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-3 bg-surface text-body-lg text-on-surface border border-outline-variant rounded-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">1 hora (60 min)</option>
                    <option value="90">1.5 horas (90 min)</option>
                    <option value="120">2 horas (120 min)</option>
                    <option value="180">3 horas (180 min)</option>
                  </select>
                </div>
              </Field>

              {/* Price (Euros) */}
              <Field>
                <FieldLabel htmlFor="price">Precio (€)</FieldLabel>
                <div className="relative flex items-center">
                  <span className="font-semibold text-on-surface-variant/70 absolute left-4 pointer-events-none">
                    €
                  </span>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="ej. 35.00"
                    className="block w-full pl-9 pr-4 py-3 bg-surface text-body-lg text-on-surface border border-outline-variant rounded-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-outline-variant/60 shadow-sm"
                  />
                </div>
              </Field>
            </div>

            {/* Description */}
            <Field>
              <FieldLabel htmlFor="description">
                Descripción (opcional)
              </FieldLabel>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Breve descripción del servicio o detalles específicos..."
                className="block w-full px-4 py-3 bg-surface text-body-md text-on-surface border border-outline-variant rounded-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-outline-variant/60 shadow-sm resize-none custom-scrollbar"
              />
            </Field>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant/50">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg border border-outline text-on-surface hover:bg-surface-variant/20 transition-all font-semibold cursor-pointer text-label-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all font-semibold cursor-pointer text-label-md shadow-sm"
              >
                {isEditMode ? "Guardar Cambios" : "Añadir Servicio"}
              </button>
            </div>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
