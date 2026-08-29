"use client";

import React from "react";
import { Users, UserPlus, Pencil, Trash2, Mail, Lock, X } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  FloatingInput,
  Button,
  Select,
  FieldGroup,
  Field,
  FieldLabel,
} from "@/components/ui/volta-ui";
import type { BusinessItem } from "@/lib/hooks/useLocationsList";

interface LocationWorkersModalProps {
  isOpen: boolean;
  selectedBusiness: BusinessItem | null;
  workers: any[];
  isAddWorkerModalOpen: boolean;
  editingWorker: any | null;
  workerFormData: {
    name: string;
    email: string;
    password?: string;
    role: "JEFE" | "EMPLEADO";
  };
  setWorkerFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      email: string;
      password: string;
      role: "JEFE" | "EMPLEADO";
    }>
  >;
  workerErrorMsg: string;
  onClose: () => void;
  onOpenCreateWorker: () => void;
  onOpenEditWorker: (worker: any) => void;
  onCloseAddWorkerModal: () => void;
  onSaveWorker: (e: React.FormEvent) => void;
  onDeleteWorker: (id: string) => void;
}

export const LocationWorkersModal: React.FC<LocationWorkersModalProps> = ({
  isOpen,
  selectedBusiness,
  workers,
  isAddWorkerModalOpen,
  editingWorker,
  workerFormData,
  setWorkerFormData,
  workerErrorMsg,
  onClose,
  onOpenCreateWorker,
  onOpenEditWorker,
  onCloseAddWorkerModal,
  onSaveWorker,
  onDeleteWorker,
}) => {
  if (!isOpen || !selectedBusiness) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-xs animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container"
        >
          <X className="w-5 h-5" />
        </button>

        <CardHeader>
          <div className="flex justify-between items-center pr-8">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span>Trabajadores de {selectedBusiness.name}</span>
            </CardTitle>
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenCreateWorker}
              className="flex items-center gap-1"
            >
              <UserPlus className="w-4 h-4" />
              <span>Añadir Trabajador</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {workers.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant text-body-md">
              No hay trabajadores asignados a esta sede todavía.
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/40">
              {workers.map((w: any) => (
                <div key={w.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-on-surface flex items-center gap-2">
                      <span>{w.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          w.role === "JEFE"
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-surface-container text-on-surface-variant border border-outline-variant/60"
                        }`}
                      >
                        {w.role}
                      </span>
                    </div>
                    <div className="text-xs text-on-surface-variant">{w.email}</div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenEditWorker(w)}
                      className="p-1.5 h-8 w-8 text-outline hover:text-primary hover:bg-primary/10 rounded-full"
                      title="Editar rol"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteWorker(w.id)}
                      className="p-1.5 h-8 w-8 text-outline hover:text-error hover:bg-error/10 rounded-full"
                      title="Eliminar trabajador"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nested Add/Edit Worker Sub-Modal */}
      {isAddWorkerModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-xs animate-in fade-in duration-150">
          <Card className="w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-150">
            <button
              onClick={onCloseAddWorkerModal}
              className="absolute top-4 right-4 text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container"
            >
              <X className="w-5 h-5" />
            </button>

            <CardHeader>
              <CardTitle>
                {editingWorker ? "Editar Trabajador" : "Nuevo Trabajador"}
              </CardTitle>
            </CardHeader>

            <form onSubmit={onSaveWorker}>
              <CardContent className="space-y-4">
                {workerErrorMsg && (
                  <div className="p-3 bg-error/10 text-error border border-error/20 rounded-xl text-xs">
                    {workerErrorMsg}
                  </div>
                )}

                <FieldGroup className="grid grid-cols-1 gap-4">
                  <Field>
                    <FieldLabel htmlFor="worker-name">Nombre Completo</FieldLabel>
                    <FloatingInput
                      id="worker-name"
                      label="Nombre"
                      type="text"
                      required
                      value={workerFormData.name}
                      onChange={(e) =>
                        setWorkerFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      icon={Users}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="worker-email">Correo Electrónico</FieldLabel>
                    <FloatingInput
                      id="worker-email"
                      label="Email"
                      type="email"
                      required
                      value={workerFormData.email}
                      onChange={(e) =>
                        setWorkerFormData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      icon={Mail}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="worker-pass">
                      {editingWorker ? "Nueva Contraseña (opcional)" : "Contraseña"}
                    </FieldLabel>
                    <FloatingInput
                      id="worker-pass"
                      label="Contraseña"
                      type="password"
                      required={!editingWorker}
                      value={workerFormData.password}
                      onChange={(e) =>
                        setWorkerFormData((prev) => ({ ...prev, password: e.target.value }))
                      }
                      icon={Lock}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="worker-role">Rol en el Local</FieldLabel>
                    <Select
                      id="worker-role"
                      value={workerFormData.role}
                      onChange={(e) =>
                        setWorkerFormData((prev) => ({
                          ...prev,
                          role: e.target.value as "JEFE" | "EMPLEADO",
                        }))
                      }
                    >
                      <option value="EMPLEADO">Empleado (Staff)</option>
                      <option value="JEFE">Jefe de Tienda / Encargado</option>
                    </Select>
                  </Field>
                </FieldGroup>
              </CardContent>

              <CardFooter className="flex justify-end gap-3 mt-6 border-t border-outline-variant/65 pt-4">
                <Button variant="ghost" type="button" onClick={onCloseAddWorkerModal}>
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  {editingWorker ? "Actualizar" : "Crear"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
