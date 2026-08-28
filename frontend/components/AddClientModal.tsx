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
  GripHorizontal,
  AlignLeft,
} from "lucide-react";
import {
  FieldGroup,
  Field,
  FloatingInput,
  Button,
  FloatingTextarea,
  InlineSelect,
} from "@/components/ui/volta-ui";
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
    modalWidth: 448,
    modalHeight: 450,
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-transparent pointer-events-auto" onClick={onClose} />

      <div
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: "448px",
          maxWidth: "calc(100vw - 32px)",
          transition: "none",
        }}
        className="bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant overflow-visible z-10 pointer-events-auto animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div
          onMouseDown={handleMouseDown}
          className="px-5 pt-5 pb-1 flex justify-between items-center bg-transparent cursor-grab active:cursor-grabbing select-none"
        >
          <GripHorizontal className="w-5 h-5 text-on-surface-variant/40 pointer-events-none" />
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
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
          <FieldGroup className="flex flex-col gap-5">
            {/* Name */}
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
                  <InlineSelect
                    id="frequency"
                    label="Frecuencia estimada"
                    value={formData.frequency}
                    onChange={handleFrequencyChange}
                    options={FREQUENCY_OPTIONS}
                    variant="borderless"
                  />
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
            <Button type="button" onClick={onClose} variant="outline" size="lg">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="lg">
              {isEditMode ? "Guardar cambios" : "Guardar Cliente"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
