"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSession } from "next-auth/react";
import dynamicImport from "next/dynamic";
import { Plus } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import QueryActionTrigger from "@/components/QueryActionTrigger";
import { Button, Skeleton, toast } from "@/components/ui/volta-ui";
import { EventManager, Event } from "@/components/EventManager";
import TrialBanner from "@/components/TrialBanner";
import { useBusinessSchedule } from "@/lib/hooks/useBusinessSchedule";

import NewAppointmentModal from "@/components/NewAppointmentModal";
import AddClientModal from "@/components/AddClientModal";
import { getServicePalette } from "@/lib/serviceColors";

interface ServiceItem {
  id?: string;
  name: string;
  duration?: number;
  color?: string;
  price?: number;
}

interface AppointmentItem {
  id?: string;
  clientName?: string;
  appointmentDate?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  status?: string;
  service?: {
    name?: string;
    duration?: number;
    color?: string;
  };
  duration?: number;
  serviceName?: string;
  client?: {
    name?: string;
    frequentService?: string;
  };
}

function getServiceDuration(app: AppointmentItem, servicesList: ServiceItem[]): number {
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

function getServiceColor(app: AppointmentItem, servicesList: ServiceItem[]): string {
  const serviceId = app.service?.name ? undefined : undefined;
  const sName = (app.serviceName || app.service?.name || app.client?.frequentService || "").trim().toLowerCase();

  const matchedIndex = servicesList.findIndex(
    (s) => s.name?.toLowerCase().trim() === sName
  );

  if (matchedIndex !== -1) {
    return getServicePalette(servicesList[matchedIndex], matchedIndex).id;
  }

  if (app.service?.color) {
    return getServicePalette(app.service.color).id;
  }

  return getServicePalette(sName || app.id).id;
}

function formatShortClientName(fullName: string): string {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 2) return fullName.trim();
  // First name + first surname (e.g. Elisa Rodríguez)
  return `${parts[0]} ${parts[1]}`;
}

/**
 * "2026-09-12" -> Date local de ese día.
 *
 * `new Date("2026-09-12")` se interpreta como UTC y en husos negativos cae en
 * el día anterior, así que se construye por componentes.
 */
function parseIsoDay(isoDay: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDay);
  if (!match) return undefined;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default function AgendaPage() {
  const { data: session } = useSession();
  const businessId = session?.user?.businessId || "";

  // Días sin actividad: los cerrados por horario semanal y los festivos que el
  // negocio observa. El calendario los pinta en gris y no deja crear ni
  // arrastrar citas ni clases de grupo.
  const { isDayClosed, getClosedLabel } = useBusinessSchedule(businessId);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  // Día al que ha saltado el usuario desde el buscador global (YYYY-MM-DD).
  const [focusedDay, setFocusedDay] = useState<string>("");
  const [prefilledDate, setPrefilledDate] = useState<string>("");
  const [prefilledTime, setPrefilledTime] = useState<string>("");
  // Sesión de una clase semanal pendiente de decidir si se borra sola o con
  // toda su serie.
  const [seriesDeleteTarget, setSeriesDeleteTarget] = useState<{
    appointmentId: string;
    classScheduleId: string;
    title: string;
  } | null>(null);

  const [rawDbAppointments, setRawDbAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

      let statusTag = "Pendiente";
      if (app.attended === false) {
        statusTag = "Cancelada";
      } else if (app.status === "SENT") {
        statusTag = "Confirmada";
      } else if (app.status === "ERROR") {
        statusTag = "Error";
      } else if (app.status === "PENDING") {
        statusTag = "Pendiente";
      }

      const shortClient = formatShortClientName(app.clientName);

      return {
        id: app.id,
        title: serviceName,
        clientName: shortClient,
        description: app.notes || (shortClient ? `Cliente: ${shortClient}` : undefined),
        startTime,
        endTime,
        color,
        category: serviceName,
        // La etiqueta distingue de un vistazo las sesiones que se repiten solas
        // de las que alguien creó a mano ese día.
        tags: app.classScheduleId ? [statusTag, "Semanal"] : [statusTag],
        rawAppointment: app,
      };
    });
  }, [rawDbAppointments, services]);

  const categories = useMemo(() => {
    return Array.from(new Set(services.map((s) => s.name).filter(Boolean)));
  }, [services]);

  const availableTags = useMemo(() => {
    return ["Pendiente", "Completada", "Cancelada", "Semanal"];
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
          status: newEvent.tags?.[0] || "Pendiente",
          notes: newEvent.description,
        }),
      });

      if (res.ok) {
        toast.success("Cita creada correctamente");
        fetchDashboardData();
      } else {
        toast.error("Error al guardar la cita");
      }
    } catch (e) {
      console.error("Error creating appointment:", e);
      toast.error("Error de conexión al guardar cita");
    }
  };

  const handleEventUpdate = async (id: string, updatedEvent: Partial<Event>) => {
    try {
      const existing = rawDbAppointments.find((a) => a.id === id);
      if (!existing) return;

      const newDate = updatedEvent.startTime
        ? updatedEvent.startTime.toISOString()
        : existing.appointmentDate;

      // El backend expone PUT /appointments/:id; sin el id en la ruta Express
      // no encontraba handler y la reprogramación se perdía en silencio.
      const res = await fetch(`/api/backend/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentDate: newDate,
          clientName: updatedEvent.title?.split("-")[0]?.trim() || existing.clientName,
          serviceName: updatedEvent.category || existing.serviceName,
        }),
      });

      if (res.ok) {
        toast.success("Cita actualizada correctamente");
        fetchDashboardData();
      } else {
        toast.error("Error al actualizar la cita");
      }
    } catch (e) {
      console.error("Error updating appointment:", e);
      toast.error("Error de conexión al actualizar cita");
    }
  };

  const deleteSingleAppointment = async (id: string) => {
    try {
      // Mismo motivo que en el update: el id va en la ruta, no en la query.
      const res = await fetch(`/api/backend/appointments/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Cita eliminada correctamente");
        fetchDashboardData();
      } else {
        toast.error("Error al eliminar la cita");
      }
    } catch (e) {
      console.error("Error deleting appointment:", e);
      toast.error("Error de conexión al eliminar cita");
    }
  };

  /**
   * Borrar una sesión de una clase semanal es ambiguo: puede ser "ese martes no
   * hay clase" o "se acabó la clase de los martes". Se pregunta en vez de decidir,
   * porque el segundo caso borra meses de agenda.
   */
  const handleEventDelete = async (id: string) => {
    const appointment = rawDbAppointments.find((a) => a.id === id);

    if (appointment?.classScheduleId) {
      setSeriesDeleteTarget({
        appointmentId: id,
        classScheduleId: appointment.classScheduleId,
        title: appointment.serviceName || appointment.clientName || "esta clase",
      });
      return;
    }

    await deleteSingleAppointment(id);
  };

  const handleDeleteWholeSeries = async (classScheduleId: string) => {
    try {
      const res = await fetch(`/api/backend/class-schedules/${classScheduleId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const payload = await res.json().catch(() => null);
        const removed = payload?.deletedSessions;
        if (typeof removed === "number") {
          toast.success(`Clase semanal cancelada (${removed} sesiones eliminadas)`);
        } else {
          toast.success("Clase semanal cancelada");
        }
        fetchDashboardData();
      } else {
        toast.error("Error al cancelar la clase semanal");
      }
    } catch (e) {
      console.error("Error deleting class schedule:", e);
      toast.error("Error de conexión al cancelar la clase");
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
    <div className="min-h-screen bg-surface text-on-surface flex flex-col md:flex-row pb-24 md:pb-0">
      {/* onNewAppointmentClick es lo que hace que el Sidebar pinte su botón
          "Nueva Cita" al pie. Se envuelve en una arrow para descartar el evento
          de click: handleOpenNewModalWithDate espera una Date opcional y un
          MouseEvent es truthy, así que pasarlo directo reventaría al leer
          getFullYear(). */}
      <Sidebar onNewAppointmentClick={() => handleOpenNewModalWithDate()} />
      <BottomNav />

      {/* Entradas desde el buscador global (⌘K): "Nueva cita" abre el modal y
          una cita concreta llega con su día en ?fecha=YYYY-MM-DD. */}
      <Suspense fallback={null}>
        <QueryActionTrigger
          value="nueva-cita"
          onTrigger={() => handleOpenNewModalWithDate()}
        />
        <QueryActionTrigger param="fecha" onTrigger={setFocusedDay} />
      </Suspense>

      <div className="flex-1 min-w-0 flex flex-col min-h-screen md:ml-[240px]">
        <TrialBanner />
        <main className="flex-1 flex flex-col w-full">
          {isLoading ? (
            <div className="p-gutter max-w-container-max w-full mx-auto pt-6 space-y-4 flex-1">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-[600px] w-full rounded-2xl" />
            </div>
          ) : (
            <EventManager
              // El calendario fija su fecha al montar: cambiar la key es lo que
              // hace que un salto desde el buscador (?fecha=) surta efecto.
              key={focusedDay || "hoy"}
              initialDate={focusedDay ? parseIsoDay(focusedDay) : undefined}
              events={events}
              onEventCreate={handleEventCreate}
              onEventUpdate={handleEventUpdate}
              onEventDelete={handleEventDelete}
              categories={categories}
              availableTags={availableTags}
              defaultView="week"
              onOpenNewModal={handleOpenNewModalWithDate}
              isDayClosed={isDayClosed}
              getClosedLabel={getClosedLabel}
              className="flex-1 flex flex-col w-full"
            />
          )}
        </main>
      </div>

      {/* FAB solo en móvil, donde el Sidebar no se muestra. Mismas clases que
          clientes, inicio y sedes. */}
      <Button
        variant="primary"
        onClick={() => handleOpenNewModalWithDate()}
        aria-label="Nueva cita"
        className="md:hidden fixed bottom-20 right-6 z-40 p-4 rounded-full shadow-lg"
      >
        <Plus className="w-5 h-5" />
      </Button>

      <NewAppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        initialDate={prefilledDate}
        initialTime={prefilledTime}
        /* El modal ya ha hecho el POST y solo llama aquí cuando el backend ha
           confirmado la cita. Repetir el POST creaba una segunda cita en el
           mismo hueco y el backend la rechazaba con 409, así que la reserva sí
           existía pero la UI daba error y no refrescaba. */
        onSave={(result) => {
          setIsAppointmentModalOpen(false);
          const createdSessions = (result as { createdSessions?: number })?.createdSessions;
          if (typeof createdSessions === "number") {
            toast.success(`Clase semanal programada (${createdSessions} sesiones creadas)`);
          } else {
            toast.success("Cita registrada exitosamente");
          }
          fetchDashboardData();
        }}
      />

      <AddClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={() => {
          toast.success("Cliente registrado correctamente");
          setIsClientModalOpen(false);
          fetchDashboardData();
        }}
      />

      {/* Alcance del borrado de una clase semanal. Se resuelve aquí, y no dentro
        del calendario, porque el calendario solo conoce eventos y esta decisión
        es sobre la programación que hay detrás. */}
      {seriesDeleteTarget && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-scrim/40"
            onClick={() => setSeriesDeleteTarget(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="series-delete-title"
            className="relative w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/60 p-5 animate-in fade-in zoom-in-95 duration-150"
          >
            <h2
              id="series-delete-title"
              className="text-base font-bold text-on-surface tracking-tight"
            >
              Eliminar clase semanal
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              <span className="font-medium text-on-surface">{seriesDeleteTarget.title}</span> se
              repite todas las semanas. ¿Qué quieres eliminar?
            </p>

            <div className="flex flex-col gap-2 mt-4">
              <Button
                variant="outline"
                onClick={async () => {
                  const { appointmentId } = seriesDeleteTarget;
                  setSeriesDeleteTarget(null);
                  await deleteSingleAppointment(appointmentId);
                }}
                className="w-full justify-start text-xs font-medium cursor-pointer"
              >
                Solo esta sesión
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  const { classScheduleId } = seriesDeleteTarget;
                  setSeriesDeleteTarget(null);
                  await handleDeleteWholeSeries(classScheduleId);
                }}
                className="w-full justify-start text-xs font-medium text-error border-error/40 hover:bg-error/10 cursor-pointer"
              >
                Toda la serie y las sesiones futuras
              </Button>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                variant="ghost"
                onClick={() => setSeriesDeleteTarget(null)}
                className="text-xs font-medium cursor-pointer"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
