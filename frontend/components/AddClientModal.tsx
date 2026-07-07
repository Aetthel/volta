"use client";

import { useState, useEffect } from "react";
import { X, Phone, Mail, Pencil, Sparkles } from "lucide-react";
import {
  FieldGroup,
  Field,
  FloatingInput,
  Button,
  FloatingSelect,
  FloatingTextarea,
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
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-1.5 rounded-full text-on-surface-variant hover:text-on-surface w-8 h-8 active:scale-95 shadow-none"
          >
            <X className="w-5 h-5" />
          </Button>
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
                <FloatingInput
                  id="name"
                  label="Nombre"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </Field>

              <Field>
                <FloatingInput
                  id="surname"
                  label="Apellidos"
                  type="text"
                  required
                  value={formData.surname}
                  onChange={handleChange}
                />
              </Field>

              <Field>
                <FloatingInput
                  id="phone"
                  label="Teléfono"
                  type="tel"
                  required
                  icon={Phone}
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Field>

              <Field>
                <FloatingInput
                  id="email"
                  label="Correo electrónico"
                  type="email"
                  icon={Mail}
                  value={formData.email}
                  onChange={handleChange}
                />
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
                <FloatingSelect
                  id="frequency"
                  label="Frecuencia estimada"
                  value={formData.frequency}
                  onChange={handleChange}
                >
                  <option value="Mensual">Mensual</option>
                  <option value="Cada 2 meses">Cada 2 meses</option>
                  <option value="Ocasional">Ocasional</option>
                  <option value="Primera visita">Primera visita</option>
                </FloatingSelect>
              </Field>

              <Field className="md:col-span-2">
                <FloatingTextarea
                  id="notes"
                  label="Notas de estilo y alergias"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                />
              </Field>
            </FieldGroup>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              size="lg"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
            >
              {isEditMode ? "Guardar cambios" : "Guardar Cliente"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
