"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Briefcase, Plus, Pencil, Trash2, Search } from "lucide-react";
import type { Service, ToastState } from "@/types/settings";
import dynamic from "next/dynamic";
import { formatCurrency } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Skeleton,
} from "@/components/ui/volta-ui";
import { apiClient } from "@/lib/apiClient";

const AddServiceModal = dynamic(() => import("@/components/AddServiceModal"), {
  ssr: false,
});

interface BusinessServicesCatalogProps {
  businessId: string;
  setToast: (toast: ToastState) => void;
}

export const BusinessServicesCatalog: React.FC<BusinessServicesCatalogProps> = ({
  businessId,
  setToast,
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  const [serviceTriggerRect, setServiceTriggerRect] = useState<{
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchServices = useCallback(async () => {
    if (!businessId || businessId === "mock-business-id") return;
    setLoadingServices(true);
    try {
      const res = await apiClient.services.getAll<Service[]>(businessId);
      if (Array.isArray(res.data)) setServices(res.data);
    } finally {
      setLoadingServices(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleSaveService = async (serviceData: {
    id?: string;
    name: string;
    price: number;
    duration: number;
    description?: string;
  }) => {
    const isEdit = !!serviceData.id;
    const res = isEdit
      ? await apiClient.services.update(serviceData.id!, { ...serviceData, businessId })
      : await apiClient.services.create({ ...serviceData, businessId });

    if (res.error) {
      setToast({ show: true, text: "Error al guardar el servicio" });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
      return;
    }

    fetchServices();
    setToast({
      show: true,
      text: isEdit ? "Servicio actualizado correctamente." : "Servicio añadido correctamente.",
    });
    setTimeout(() => setToast({ show: false, text: "" }), 3000);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este servicio?")) return;
    const res = await apiClient.services.delete(serviceId);
    if (res.error) {
      setToast({ show: true, text: "Error al eliminar el servicio" });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
      return;
    }
    fetchServices();
    setToast({ show: true, text: "Servicio eliminado correctamente." });
    setTimeout(() => setToast({ show: false, text: "" }), 3000);
  };

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return services || [];
    return (services || []).filter((s) => (s?.name || "").toLowerCase().includes(q));
  }, [services, searchQuery]);

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-on-surface flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span>Catálogo de Servicios</span>
                </CardTitle>
                <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5">
                  {services.length} {services.length === 1 ? "servicio" : "servicios"}
                </Badge>
              </div>
              <CardDescription>
                Servicios disponibles para agendar citas en el salón o por reserva online.
              </CardDescription>
            </div>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setServiceTriggerRect(rect);
                setServiceToEdit(null);
                setIsAddServiceModalOpen(true);
              }}
              className="flex items-center gap-1.5 font-medium shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Servicio</span>
            </Button>
          </div>

          {services.length > 4 && (
            <div className="relative mt-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
              <input
                type="text"
                placeholder="Buscar servicio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-container-low border border-outline-variant/60 rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
              />
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          {loadingServices ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex items-center gap-3 animate-pulse"
                >
                  <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Skeleton className="w-2/3 h-4" />
                    <Skeleton className="w-1/3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-3 border-2 border-dashed border-outline-variant/50 rounded-2xl bg-surface-container-lowest">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-on-surface">No hay servicios creados aún</p>
                <p className="text-xs text-on-surface-variant max-w-sm">
                  Crea tu primer servicio con su duración y precio para empezar a agendar citas.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setServiceTriggerRect(rect);
                  setServiceToEdit(null);
                  setIsAddServiceModalOpen(true);
                }}
                className="mt-2 text-xs font-semibold gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Primer Servicio</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredServices.map((service: Service) => (
                <div
                  key={service.id}
                  className="bg-surface-container-low hover:bg-surface-container-high/40 transition-colors p-3.5 rounded-xl border border-outline-variant/50 flex items-center justify-between gap-3 group relative"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs">
                      <Briefcase className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-on-surface truncate">
                        {service.name}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant/80">
                        <span className="font-semibold text-primary">
                          {formatCurrency(service.price)}
                        </span>
                        <span>•</span>
                        <span>{service.duration} min</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setServiceTriggerRect(rect);
                        setServiceToEdit(service);
                        setIsAddServiceModalOpen(true);
                      }}
                      className="p-1.5 h-8 w-8 text-on-surface-variant hover:text-primary rounded-lg"
                      title="Editar servicio"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                      className="p-1.5 h-8 w-8 text-on-surface-variant hover:text-error rounded-lg"
                      title="Eliminar servicio"
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

      <AddServiceModal
        isOpen={isAddServiceModalOpen}
        onClose={() => {
          setIsAddServiceModalOpen(false);
          setServiceToEdit(null);
          setServiceTriggerRect(null);
        }}
        onSave={handleSaveService}
        serviceToEdit={serviceToEdit}
        triggerRect={serviceTriggerRect}
      />
    </>
  );
};
