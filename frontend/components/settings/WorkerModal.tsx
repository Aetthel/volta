"use client";

import { X, Users, User, Mail, Key } from "lucide-react";
import type { WorkerFormData } from "@/types/settings";
import {
  Button,
  FieldGroup,
  Field,
  FieldLabel,
  FloatingInput,
  InlineSelect,
} from "@/components/ui/volta-ui";

interface WorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  formData: WorkerFormData;
  setFormData: React.Dispatch<React.SetStateAction<WorkerFormData>>;
  errorMsg: string;
  isEditing: boolean;
}

export default function WorkerModal({
  isOpen,
  onClose,
  onSave,
  formData,
  setFormData,
  errorMsg,
  isEditing,
}: WorkerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/55 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl overflow-visible flex flex-col">
        <div className="p-6 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/35">
          <h2 className="font-title-lg text-title-lg font-semibold text-on-surface flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {isEditing ? "Editar Trabajador" : "Nuevo Trabajador"}
          </h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-1.5 text-on-surface-variant rounded-full w-8 h-8 active:scale-90 shadow-none"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={onSave} className="p-6 flex flex-col gap-6">
          {errorMsg && (
            <div className="bg-error-container border border-error-container/45 text-on-error-container p-4 rounded-xl font-medium text-body-md">
              {errorMsg}
            </div>
          )}

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="workerName">Nombre Completo</FieldLabel>
              <FloatingInput
                id="workerName"
                label="Nombre y Apellidos"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                icon={User}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="workerEmail">Correo Electrónico</FieldLabel>
              <FloatingInput
                id="workerEmail"
                label="correo@empresa.com"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                icon={Mail}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="workerPassword">
                Contraseña{" "}
                {isEditing && (
                  <span className="text-on-surface-variant/50 font-normal">
                    (dejar en blanco para mantener)
                  </span>
                )}
              </FieldLabel>
              <FloatingInput
                id="workerPassword"
                label={isEditing ? "Nueva contraseña (opcional)" : "Mínimo 6 caracteres"}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                icon={Key}
                required={!isEditing}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="workerRole">Rol de Usuario</FieldLabel>
              <InlineSelect
                id="workerRole"
                label="Seleccionar rol"
                value={formData.role}
                onChange={(val) => setFormData({ ...formData, role: val as "JEFE" | "EMPLEADO" })}
                options={[
                  { value: "EMPLEADO", label: "Empleado (Staff)" },
                  { value: "JEFE", label: "Jefe / Encargado" },
                ]}
                variant="outlined"
              />
            </Field>
          </FieldGroup>

          <div className="flex items-center justify-end gap-3 mt-4 border-t border-outline-variant/50 pt-4">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onClose}
              className="px-4 py-2.5 text-on-surface-variant active:scale-95 shadow-none font-medium"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="px-5 py-2.5 active:scale-95 font-medium"
            >
              {isEditing ? "Guardar Cambios" : "Crear Trabajador"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
