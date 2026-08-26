"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import dynamicImport from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { Skeleton } from "@/components/ui/volta-ui";
import { EventManager, Event } from "@/components/EventManager";
import TrialBanner from "@/components/TrialBanner";

const NewAppointmentModal = dynamicImport(() => import("@/components/NewAppointmentModal"), {
  ssr: false,
});
const AddClientModal = dynamicImport(() => import("@/components/AddClientModal"), {
  ssr: false,
});

const VALID_COLORS = ["TEAL", "PURPLE", "ROSE", "AMBER", "INDIGO", "EMERALD", "SKY"];

function getServiceDuration(app: any, servicesList: any[]): number {
  if (app.service?.duration && typeof app.service.duration === "number") {
    return app.service.duration;
  }
  if (app.duration && typeof app.duration === "number") {
    return app.duration;
  }
  const sName = (app.serviceName || app.service?.name || "").trim().toLowerCase();
  const dbService = servicesList.find(
    (s) => s.name?.toLowerCase().trim() === sName
  );
  if (dbService?.duration) return dbService.duration;
  return 30; // default 30 min duration
}

function getServiceColor(app: any, servicesList: any[]): string {
  if (app.service?.color && VALID_COLORS.includes(app.service.color.toUpperCase())) {
    return app.service.color.toUpperCase();
  }

  const serviceName = (app.serviceName || app.client?.frequentService || "Servicio General").trim();

  const dbService = servicesList.find(
    (s) => s.name?.toLowerCase().trim() === serviceName.toLowerCase()
  );
  if (dbService?.color && VALID_COLORS.includes(dbService.color.toUpperCase())) {
    return dbService.color.toUpperCase();
  }

  let hash = 0;
  for (let i = 0; i < serviceName.length; i++) {
    hash = serviceName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return VALID_COLORS[Math.abs(hash) % VALID_COLORS.length];
}

export default function AgendaPage() {
  const { data: session } = useSession();
  const businessId = session?.user?.businessId || "";

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<string>("");
  const [prefilledTime, setPrefilledTime] = useState<string>("");

  const [rawDbAppointments, setRawDbAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [toast, setToast] = useState<{ show: boolean; text: string; type: "success" | "error" }>({
    show: false,
    text: "",
    type: "success",
  });

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ show: true, text, type });
    setTimeout(() => setToast({ show: false, text: "", type: "success" }), 3500);
  };

  const fetchDashboardData = useCallback(() => {
    if (!businessId) return;
    setIsLoading(true);

    Promise.all([
      fetch(`/api/backend/users?businessId=${businessId}`)
        .then((res) => res.json())
        .catch(() => []),
      fetch(`/api/backend/appointments?businessId=${businessId}`)
        .then((res) => res.json())
        .catch(() => []),
      fetch(`/api/backend/clients?businessId=${businessId}`)
        .then((res) => res.json())
        .catch(() => []),
      fetch(`/api/backend/services?businessId=${businessId}`)
        .then((res) => res.json())
        .catch(() => []),
    ])
      .then(([usersData, appointmentsData, clientsData, servicesData]) => {
        if (Array.isArray(appointmentsData)) {
          setRawDbAppointments(appointmentsData);
        }
        if (Array.isArray(clientsData)) {
          setClients(clientsData);
        }
        if (Array.isArray(servicesData)) {
          setServices(servicesData);
        }
        if (Array.isArray(usersData)) {
          setWorkers(usersData);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [businessId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (session?.user?.name) {
      document.title = `Agenda - ${session.user.name} - Volta`;
    }
  }, [session]);

  const events: Event[] = useMemo(() => {
    return rawDbAppointments.map((app) => {
      const startTime = new Date(app.appointmentDate);
      const serviceName = app.serviceName || app.client?.frequentService || app.service?.name || "Servicio General";
      const durationMinutes = getServiceDuration(app, services);
      const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

      const color = getServiceColor(app, services);

      return {
        id: app.id,
        title: `${app.clientName} - ${serviceName}`,
        description: app.notes || `Servicio: ${serviceName}`,
        startTime,
        endTime,
        color,
        category: serviceName,
        tags: [app.status || "Confirmada"],
        rawAppointment: app,
      };
    });
  }, [rawDbAppointments, services]);

  const categories = useMemo(() => {
    return Array.from(new Set(services.map((s) => s.name).filter(Boolean)));
  }, [services]);

  const availableTags = useMemo(() => {
    return ["Confirmada", "Pendiente", "Completada", "Cancelada"];
  }, []);

  const handleEventCreate = async (newEvent: Omit<Event, "id">) => {
    try {
      const res = await fetch("/api/backend/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: newEvent.title.split("-")[0]?.trim() || newEvent.title,
          serviceName: newEvent.category || "Servicio General",
          appointmentDate: newEvent.startTime.toISOString(),
          businessId,
          status: newEvent.tags?.[0] || "Confirmada",
          notes: newEvent.description,
        }),
      });

      if (res.ok) {
        showToast("Cita creada correctamente", "success");
        fetchDashboardData();
      } else {
        showToast("Error al guardar la cita", "error");
      }
    } catch (e) {
      console.error("Error creating appointment:", e);
      showToast("Error de conexión al guardar cita", "error");
    }
  };

  const handleEventUpdate = async (id: string, updatedEvent: Partial<Event>) => {
    try {
      const existing = rawDbAppointments.find((a) => a.id === id);
      if (!existing) return;

      const newDate = updatedEvent.startTime
        ? updatedEvent.startTime.toISOString()
        : existing.appointmentDate;

      const res = await fetch("/api/backend/appointments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...existing,
          appointmentDate: newDate,
          clientName: updatedEvent.title?.split("-")[0]?.trim() || existing.clientName,
          serviceName: updatedEvent.category || existing.serviceName,
          notes: updatedEvent.description !== undefined ? updatedEvent.description : existing.notes,
        }),
      });

      if (res.ok) {
        showToast("Cita actualizada correctamente", "success");
        fetchDashboardData();
      } else {
        showToast("Error al actualizar la cita", "error");
      }
    } catch (e) {
      console.error("Error updating appointment:", e);
      showToast("Error de conexión al actualizar cita", "error");
    }
  };

  const handleEventDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/backend/appointments?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Cita eliminada correctamente", "success");
        fetchDashboardData();
      } else {
        showToast("Error al eliminar la cita", "error");
      }
    } catch (e) {
      console.error("Error deleting appointment:", e);
      showToast("Error de conexión al eliminar cita", "error");
    }
  };

  const handleOpenNewModalWithDate = (date?: Date) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dStr = `${year}-${month}-${day}`;
      const hStr = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
      setPrefilledDate(dStr);
      setPrefilledTime(hStr);
    } else {
      setPrefilledDate("");
      setPrefilledTime("");
    }
    setIsAppointmentModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      <Sidebar />
      <BottomNav />

      <div className="md:ml-[240px] flex-1 flex flex-col transition-all duration-300 min-h-screen">
        <TrialBanner />
        <main className="flex-1 flex flex-col p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-[600px] w-full rounded-2xl" />
            </div>
          ) : (
            <EventManager
              events={events}
              onEventCreate={handleEventCreate}
              onEventUpdate={handleEventUpdate}
              onEventDelete={handleEventDelete}
              categories={categories}
              availableTags={availableTags}
              defaultView="week"
              onOpenNewModal={handleOpenNewModalWithDate}
              className="flex-1 flex flex-col"
            />
          )}
        </main>
      </div>

      <NewAppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        initialDate={prefilledDate}
        initialTime={prefilledTime}
        onSave={async (appointmentData) => {
          try {
            const res = await fetch("/api/backend/appointments", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...appointmentData,
                businessId,
              }),
            });
            if (res.ok) {
              showToast("Cita registrada exitosamente", "success");
              setIsAppointmentModalOpen(false);
              fetchDashboardData();
            } else {
              showToast("Error al guardar la cita", "error");
            }
          } catch (err) {
            console.error("Error saving appointment from modal:", err);
            showToast("Error de servidor al guardar la cita", "error");
          }
        }}
      />

      <AddClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={() => {
          showToast("Cliente registrado correctamente", "success");
          setIsClientModalOpen(false);
          fetchDashboardData();
        }}
      />

      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl text-sm font-medium border flex items-center gap-2 ${
              toast.type === "success"
                ? "bg-emerald-500 text-white border-emerald-600"
                : "bg-error text-on-error border-red-600"
            }`}
          >
            <span>{toast.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
