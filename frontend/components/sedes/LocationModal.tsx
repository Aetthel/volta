"use client";

import React from "react";
import { Store, Mail, Phone, MapPin, Key, X } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Input,
  Button,
  FieldGroup,
  Field,
  FieldLabel,
} from "@/components/ui/volta-ui";
import type { BusinessItem } from "@/lib/hooks/useLocationsList";

interface LocationModalProps {
  isOpen: boolean;
  editingBusiness: BusinessItem | null;
  businessForm: {
    name: string;
    email: string;
    phone: string;
    address: string;
    password?: string;
  };
  setBusinessForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      email: string;
      phone: string;
      address: string;
      password: string;
    }>
  >;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  editingBusiness,
  businessForm,
  setBusinessForm,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const isEdit = !!editingBusiness;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-xs animate-in fade-in duration-200">
      <Card className="w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container"
        >
          <X className="w-5 h-5" />
        </button>

        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            <span>{isEdit ? "Editar Información del Local" : "Registrar Nuevo Local"}</span>
          </CardTitle>
        </CardHeader>

        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <FieldGroup className="grid grid-cols-1 gap-4">
              <Field>
                <FieldLabel htmlFor="biz-name">Nombre Comercial</FieldLabel>
                <Input
                  id="biz-name"
                  placeholder="Nombre del Negocio"
                  type="text"
                  required
                  value={businessForm.name}
                  onChange={(e) =>
                    setBusinessForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  icon={Store}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="biz-email">Correo Electrónico del Local</FieldLabel>
                <Input
                  id="biz-email"
                  placeholder="Email de Notificaciones"
                  type="email"
                  required
                  value={businessForm.email}
                  onChange={(e) =>
                    setBusinessForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  icon={Mail}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="biz-phone">Teléfono de Contacto</FieldLabel>
                  <Input
                    id="biz-phone"
                    placeholder="Teléfono"
                    type="tel"
                    value={businessForm.phone}
                    onChange={(e) =>
                      setBusinessForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    icon={Phone}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="biz-address">Dirección Física</FieldLabel>
                  <Input
                    id="biz-address"
                    placeholder="Dirección"
                    type="text"
                    value={businessForm.address}
                    onChange={(e) =>
                      setBusinessForm((prev) => ({ ...prev, address: e.target.value }))
                    }
                    icon={MapPin}
                  />
                </Field>
              </div>

              {!isEdit && (
                <Field>
                  <FieldLabel htmlFor="biz-pass">Contraseña de Administrador</FieldLabel>
                  <Input
                    id="biz-pass"
                    placeholder="Contraseña inicial"
                    type="password"
                    required
                    value={businessForm.password || ""}
                    onChange={(e) =>
                      setBusinessForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    icon={Key}
                  />
                </Field>
              )}
            </FieldGroup>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 mt-6 border-t border-outline-variant/65 pt-4">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {isEdit ? "Guardar Cambios" : "Crear Local"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
