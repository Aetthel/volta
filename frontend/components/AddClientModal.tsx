"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, User, Phone, Mail, Sparkles, Heart, Pencil, GripHorizontal, AlignLeft, ChevronDown } from "lucide-react";
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
  frequency: "",
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
      const fullName = [clientToEdit.name, clientToEdit.surname].filter(Boolean).join(" ");
      setFormData({
        name: fullName,
        surname: "",
        phone: clientToEdit.phone ?? "",
        email: clientToEdit.email ?? "",
        frequency: clientToEdit.frequentService ?? "",
        notes: "",
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [clientToEdit, isOpen]);

  const [mounted, setMounted] = useState(false);
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;
  if (!mounted) return null;

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
    const parts = formData.name.trim().split(/\s+/);
    const parsedName = parts[0] || "";
    const parsedSurname = parts.slice(1).join(" ");
    
    onSave({
      ...formData,
      name: parsedName,
      surname: parsedSurname,
      id: clientToEdit?.id
    });
    setFormData(EMPTY_FORM);
    onClose();
  };

  const frequencyOptions = [
    { value: "Mensual", label: "Mensual" },
    { value: "Cada 2 meses", label: "Cada 2 meses" },
    { value: "Ocasional", label: "Ocasional" },
    { value: "Primera visita", label: "Primera visita" },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/5 transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant max-w-md w-full overflow-visible z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 pt-5 pb-1 flex justify-between items-center bg-transparent">
          <GripHorizontal className="w-5 h-5 text-on-surface-variant/40" />
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-1.5 rounded-full text-on-surface-variant hover:text-on-surface w-8 h-8 active:scale-95 shadow-none"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Title */}
        <div className="px-5 pb-1">
          <h2 className="text-2xl font-medium text-on-surface">
            {isEditMode ? "Editar Cliente" : "Añadir Cliente"}
          </h2>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-5 flex flex-col gap-5"
        >
          <FieldGroup className="flex flex-col gap-5">
            {/* Title / Name */}
            <div className="flex items-start gap-4">
              <div className="w-6 h-10 flex items-center justify-center text-on-surface-variant/40 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <Field>
                  <FloatingInput
                    id="name"
                    label="Nombre Completo"
                    type="text"
                    required
                    variant="borderless"
                    className="text-body-lg font-normal !py-2"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Field>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="w-6 h-10 flex items-center justify-center text-on-surface-variant/40 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <Field>
                  <FloatingInput
                    id="phone"
                    label="Teléfono"
                    type="tel"
                    required
                    variant="borderless"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Field>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-6 h-10 flex items-center justify-center text-on-surface-variant/40 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <Field>
                  <FloatingInput
                    id="email"
                    label="Correo electrónico"
                    type="email"
                    variant="borderless"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Field>
              </div>
            </div>

            {/* Frequency Preference */}
            <div className="flex items-start gap-4">
              <div className="w-6 h-10 flex items-center justify-center text-on-surface-variant/40 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <Field>
                  <div className="relative w-full">
                    <div className="relative">
                      <FloatingInput
                        id="frequency-trigger"
                        label="Frecuencia estimada"
                        type="text"
                        readOnly
                        value={formData.frequency}
                        onClick={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
                        className="cursor-pointer text-body-lg font-normal"
                        variant="borderless"
                      />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                    </div>

                    {showFrequencyDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowFrequencyDropdown(false)}
                        />
                        <div className="absolute left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg max-h-60 overflow-y-auto z-50 p-2 flex flex-col gap-1">
                          {frequencyOptions.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, frequency: opt.value }));
                                setShowFrequencyDropdown(false);
                              }}
                              className="flex items-center justify-between w-full text-left p-3 hover:bg-on-surface/[0.04] rounded-lg transition-colors text-body-lg text-on-surface font-normal cursor-pointer"
                            >
                              <span>{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </Field>
              </div>
            </div>

            {/* Notes */}
            <div className="flex items-start gap-4">
              <div className="w-6 h-10 flex items-center justify-center text-on-surface-variant/40 shrink-0">
                <AlignLeft className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <Field>
                  <FloatingTextarea
                    id="notes"
                    label="Notas de estilo y alergias"
                    rows={3}
                    variant="borderless"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </Field>
              </div>
            </div>
          </FieldGroup>

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 pt-4">
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
    </div>,
    document.body
  );
}
