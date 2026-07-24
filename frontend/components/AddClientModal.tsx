"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  User,
  Phone,
  Mail,
  Sparkles,
  Heart,
  Pencil,
  GripHorizontal,
  AlignLeft,
} from "lucide-react";
import {
  FieldGroup,
  Field,
  FloatingInput,
  Button,
  FloatingSelect,
  FloatingTextarea,
  InlineSelect,
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
  triggerRect,
}: AddClientModalProps) {
  const isEditMode = !!clientToEdit;

  const [formData, setFormData] = useState(EMPTY_FORM);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const lastIsOpen = useRef(isOpen);
  const isFirstOpen = useRef(false);

  if (isOpen && !lastIsOpen.current) {
    isFirstOpen.current = true;
    lastIsOpen.current = true;
  } else if (!isOpen && lastIsOpen.current) {
    lastIsOpen.current = false;
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest("input") ||
      (e.target as HTMLElement).closest("textarea")
    )
      return;

    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setPosition({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

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

    // Calculate initial coordinates next to clicked trigger button/space
    if (triggerRect && window.innerWidth >= 768) {
      const modalWidth = 448;
      const modalHeight = 450;

      let targetX = triggerRect.right + 12;
      if (targetX + modalWidth > window.innerWidth) {
        targetX = triggerRect.left - modalWidth - 12;
      }
      targetX = Math.max(12, Math.min(targetX, window.innerWidth - modalWidth - 12));

      let targetY = triggerRect.top;
      if (targetY + modalHeight > window.innerHeight) {
        targetY = Math.max(12, window.innerHeight - modalHeight - 12);
      }

      setPosition({ x: targetX, y: targetY });
    } else {
      // Center modal on screen
      const modalWidth = Math.min(448, window.innerWidth - 32);
      const modalHeight = Math.min(450, window.innerHeight - 32);
      const targetX = (window.innerWidth - modalWidth) / 2;
      const targetY = (window.innerHeight - modalHeight) / 2;
      setPosition({ x: targetX, y: targetY });
    }

    const timer = setTimeout(() => {
      isFirstOpen.current = false;
    }, 50);
    return () => clearTimeout(timer);
  }, [clientToEdit, isOpen, triggerRect]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;
  if (!mounted) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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
      id: clientToEdit?.id,
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
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/5 transition-opacity" onClick={onClose} />

      <div
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: "448px",
          maxWidth: "calc(100vw - 32px)",
          transition: isDragging || isFirstOpen.current ? "none" : undefined,
          animation: isDragging ? "none" : undefined,
        }}
        className="bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant overflow-visible z-10 animate-in fade-in zoom-in-95 duration-200"
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
                  <InlineSelect
                    id="frequency"
                    label="Frecuencia estimada"
                    value={formData.frequency}
                    onChange={(val) => setFormData((prev) => ({ ...prev, frequency: val }))}
                    options={frequencyOptions}
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
