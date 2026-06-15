"use client";

import { useState, useEffect } from "react";
import { X, Phone, Mail, Pencil, Sparkles } from "lucide-react";
import {
  FieldGroup,
  Field,
  FieldLabel,
  InputGroup,
} from "@/components/ui/volta-ui";

interface ClientToEdit {
  id: string;
  name: string;
  surname: string;
  phone: string;
  email?: string;
  frequentService?: string;
}

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: any) => void;
  /** Pass a client object to activate edit mode */
  clientToEdit?: ClientToEdit | null;
}

const EMPTY_FORM = {
  name: "",
  surname: "",
  phone: "",
  email: "",
  frequency: "Mensual",
  notes: "",
};

export default function AddClientModal({
  isOpen,
  onClose,
  onSave,
  clientToEdit,
}: AddClientModalProps) {
  const isEditMode = !!clientToEdit;

  const [formData, setFormData] = useState(EMPTY_FORM);

  // Sync form when clientToEdit changes (open in edit mode)
  useEffect(() => {
    if (clientToEdit) {
      setFormData({
        name: clientToEdit.name ?? "",
        surname: clientToEdit.surname ?? "",
        phone: clientToEdit.phone ?? "",
        email: clientToEdit.email ?? "",
        frequency: clientToEdit.frequentService ?? "Mensual",
        notes: "",
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [clientToEdit, isOpen]);

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
    onSave({ ...formData, id: clientToEdit?.id });
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
      <div className="relative bg-surface-container-lowest rounded-md shadow-xl border border-outline-variant max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h3 className="font-title-lg text-title-lg text-on-surface font-semibold flex items-center gap-3">
            {isEditMode ? (
              <Pencil className="w-5 h-5 text-primary" />
            ) : (
              <Sparkles className="w-5 h-5 text-primary" />
            )}
            <span>
              {isEditMode ? "Editar Cliente" : "Añadir Nuevo Cliente"}
            </span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 md:p-8 flex flex-col gap-6"
        >
          {/* Section: Contact info */}
          <div>
            <div className="border-b border-outline-variant pb-1 mb-4">
              <span className="text-primary font-label-lg text-label-lg uppercase tracking-wider font-semibold">
                Información de contacto
              </span>
            </div>
            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="name">Nombre</FieldLabel>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Ej. Ana"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="surname">Apellidos</FieldLabel>
                <input
                  id="surname"
                  type="text"
                  required
                  placeholder="Ej. García López"
                  value={formData.surname}
                  onChange={handleChange}
                  className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
                <InputGroup>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    required
                    placeholder="+34 600 000 000"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                  />
                </InputGroup>
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                <InputGroup>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="ana.garcia@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                  />
                </InputGroup>
              </Field>
            </FieldGroup>
          </div>

          {/* Section: Preferences */}
          <div>
            <div className="border-b border-outline-variant pb-1 mb-4">
              <span className="text-primary font-label-lg text-label-lg uppercase tracking-wider font-semibold">
                Perfil y Preferencias
              </span>
            </div>
            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="frequency">Frecuencia estimada</FieldLabel>
                <select
                  id="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                >
                  <option value="Mensual">Mensual</option>
                  <option value="Cada 2 meses">Cada 2 meses</option>
                  <option value="Ocasional">Ocasional</option>
                  <option value="Primera visita">Primera visita</option>
                </select>
              </Field>

              <Field className="md:col-span-2">
                <FieldLabel htmlFor="notes">
                  Notas de estilo y alergias
                </FieldLabel>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Cabello fino, prefiere tintes orgánicos, alergia al níquel..."
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface resize-none"
                />
              </Field>
            </FieldGroup>
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
              {isEditMode ? "Guardar cambios" : "Guardar Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
