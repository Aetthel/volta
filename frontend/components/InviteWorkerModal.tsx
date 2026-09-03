"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDraggableModal } from "@/lib/useDraggableModal";
import { X, User, Mail, Key, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/volta-ui";

export interface WorkerToEdit {
  id?: string;
  name: string;
  email: string;
  role: "ADMIN" | "JEFE" | "EMPLEADO" | string;
}

interface InviteWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workerData: {
    id?: string;
    name: string;
    email: string;
    password?: string;
    role: "JEFE" | "EMPLEADO";
  }) => Promise<void>;
  workerToEdit?: WorkerToEdit | null;
  triggerRect?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  } | null;
}

export default function InviteWorkerModal({
  isOpen,
  onClose,
  onSave,
  workerToEdit,
  triggerRect,
}: InviteWorkerModalProps) {
  const isEditMode = !!workerToEdit?.id;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLEADO" as "JEFE" | "EMPLEADO",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg("");
    setIsSubmitting(false);

    if (workerToEdit) {
      setFormData({
        name: workerToEdit.name || "",
        email: workerToEdit.email || "",
        password: "",
        role: (workerToEdit.role === "JEFE" ? "JEFE" : "EMPLEADO") as "JEFE" | "EMPLEADO",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "EMPLEADO",
      });
    }
  }, [isOpen, workerToEdit]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMsg("");

    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMsg("El nombre y el correo electrónico son obligatorios.");
      return;
    }

    if (!isEditMode && (!formData.password || formData.password.length < 6)) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (isEditMode && formData.password && formData.password.length < 6) {
      setErrorMsg("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: workerToEdit?.id,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password ? formData.password : undefined,
        role: formData.role,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Error al guardar el trabajador.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          className="px-5 pt-3.5 pb-3 flex justify-between items-start border-b border-outline-variant/30 bg-surface-container-low/40 cursor-grab active:cursor-grabbing select-none shrink-0"
        >
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-on-surface tracking-tight">
              {isEditMode ? "Editar Miembro del Equipo" : "Invitar Trabajador"}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {isEditMode
                ? "Actualiza los datos o el rol del trabajador"
                : "Añade un nuevo miembro a tu equipo y asígnale su rol"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container-high/60 transition-colors cursor-pointer -mr-1"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {errorMsg && (
            <div className="text-xs bg-error/10 border border-error/20 text-error px-3.5 py-2.5 rounded-lg leading-relaxed">
              {errorMsg}
            </div>
          )}

          {/* Nombre */}
          <div>
            <label
              htmlFor="worker-name"
              className="text-xs font-medium text-on-surface mb-1.5 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-on-surface shrink-0" />
              <span>Nombre y Apellidos <span className="text-error">*</span></span>
            </label>
            <input
              id="worker-name"
              type="text"
              required
              placeholder="Ej: Carlos López"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="worker-email"
              className="text-xs font-medium text-on-surface mb-1.5 flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-on-surface shrink-0" />
              <span>Correo Electrónico <span className="text-error">*</span></span>
            </label>
            <input
              id="worker-email"
              type="email"
              required
              placeholder="carlos@negocio.com"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label
              htmlFor="worker-password"
              className="text-xs font-medium text-on-surface mb-1.5 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-on-surface shrink-0" />
                <span>Contraseña {isEditMode ? "(opcional)" : <span className="text-error">*</span>}</span>
              </span>
              {isEditMode && (
                <span className="text-[11px] text-on-surface-variant/60">
                  Dejar en blanco para mantener
                </span>
              )}
            </label>
            <input
              id="worker-password"
              type="password"
              required={!isEditMode}
              placeholder={isEditMode ? "•••••••• (sin cambios)" : "Mínimo 6 caracteres"}
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all"
            />
          </div>

          {/* Rol */}
          <div>
            <label
              htmlFor="worker-role"
              className="text-xs font-medium text-on-surface mb-1.5 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-on-surface shrink-0" />
              <span>Rol y Permisos</span>
            </label>
            <select
              id="worker-role"
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  role: e.target.value as "JEFE" | "EMPLEADO",
                }))
              }
              className="w-full px-3 py-2 text-sm bg-surface-container-low/60 border border-outline-variant/70 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface-container-lowest transition-all"
            >
              <option value="EMPLEADO">Empleado / Profesional (Acceso a agenda y clientes)</option>
              <option value="JEFE">Jefe / Encargado (Administración completa del negocio)</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/40 mt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="px-4 text-xs font-medium cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="px-5 text-xs font-medium cursor-pointer"
            >
              {isSubmitting
                ? "Guardando..."
                : isEditMode
                ? "Guardar Cambios"
                : "Invitar Trabajador"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
