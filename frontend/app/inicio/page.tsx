"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  UserPlus,
  Euro,
  Activity,
  Plus,
  Clock,
  Check,
  AlertCircle,
  MessageSquare,
  Smartphone,
  ChevronRight,
  TrendingUp,
  Award,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { useSession } from "next-auth/react";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import MetricCard from "@/components/MetricCard";
import NewAppointmentModal from "@/components/NewAppointmentModal";
import AddClientModal from "@/components/AddClientModal";
import { Alert, Badge, Button, Card, CardHeader, CardTitle, Empty, Separator, ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from "@/components/ui/volta-ui";
import { cn } from "@/lib/utils";

interface AppointmentItem {
  id: string;
  clientName: string;
  clientPhone: string;
  appointmentDate: string;
  status: "PENDING" | "SENT" | "ERROR";
  serviceName: string;
}

const DEFAULT_SERVICES = [
  { name: "Corte Caballero", price: 35 },
  { name: "Corte Dama", price: 45 },
  { name: "Coloración Premium", price: 85 },
  { name: "Tratamiento Keratina", price: 50 },
  { name: "Manicura", price: 20 },
  { name: "Spa Facial", price: 40 }
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const businessId = session?.user?.businessId || "mock-business-id";

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [whatsappStatus, setWhatsappStatus] = useState("DISCONNECTED");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("¡Hola!");

  useEffect(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) setGreeting("¡Buenos días!");
    else if (hrs < 20) setGreeting("¡Buenas tardes!");
    else setGreeting("¡Buenas noches!");
  }, []);

  const fetchData = () => {
    if (!businessId) return;

    // Fetch Appointments
    fetch(`/api/backend/appointments?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAppointments(data);
        }
      })
      .catch((e) => console.error("Error loading appointments:", e));

    // Fetch Clients
    fetch(`/api/backend/clients?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClients(data);
        }
      })
      .catch((e) => console.error("Error loading clients:", e));

    // Fetch Services
    fetch(`/api/backend/services?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setServices(data);
        }
      })
      .catch((e) => console.error("Error loading services:", e));

    // Fetch WhatsApp & Business Status
    fetch(`/api/backend/business/${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (data.whatsappStatus) setWhatsappStatus(data.whatsappStatus);
          if (data.qrCode) setQrCode(data.qrCode);
        }
      })
      .catch((e) => console.error("Error loading business status:", e));
  };

  useEffect(() => {
    fetchData();
  }, [businessId]);

  useEffect(() => {
    if (session?.user?.name) {
      document.title = `Inicio - ${session.user.name} - Volta`;
    }
  }, [session]);

  const handleUpdateStatus = (id: string, newStatus: "PENDING" | "SENT" | "ERROR") => {
    fetch(`/api/backend/appointments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error updating status");
        return res.json();
      })
      .then(() => fetchData())
      .catch((err) => console.error("Error updating appointment status:", err));
  };

  const handleDeleteAppointment = (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta cita? Esta acción no se puede deshacer.")) return;
    fetch(`/api/backend/appointments/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error deleting appointment");
        return res.json();
      })
      .then(() => fetchData())
      .catch((err) => console.error("Error deleting appointment:", err));
  };

  const handleSaveAppointment = () => {
    fetchData();
  };

  // 1. Filter Today's appointments
  const todayDateStr = new Date().toISOString().split("T")[0];
  const todayApps = appointments.filter((app) => {
    if (!app.appointmentDate) return false;
    return app.appointmentDate.split("T")[0] === todayDateStr;
  });

  const sortedTodayApps = [...todayApps].sort((a, b) => {
    return new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime();
  });

  // Filtered by Search query
  const filteredTodayApps = sortedTodayApps.filter((app) => {
    const q = searchQuery.toLowerCase();
    return (
      app.clientName.toLowerCase().includes(q) ||
      (app.serviceName && app.serviceName.toLowerCase().includes(q))
    );
  });

  // 2. Metrics calculation
  const newClientsCount = clients.filter((c) => {
    const createdDate = new Date(c.createdAt);
    const diffTime = Math.abs(new Date().getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }).length;

  const dynamicPrices: Record<string, number> = {
    ...DEFAULT_SERVICES.reduce((acc, s) => {
      acc[s.name] = s.price;
      return acc;
    }, {} as Record<string, number>),
    ...services.reduce((acc, s) => {
      acc[s.name] = s.price;
      return acc;
    }, {} as Record<string, number>),
  };

  const estimatedIncome = todayApps.reduce((acc, app) => {
    const serviceName = app.serviceName || "Corte Caballero";
    const price = dynamicPrices[serviceName] || 35;
    return acc + price;
  }, 0);

  const timeSlotsCount = 12; // 09:00 to 20:00 slots
  const bookedSlotsCount = new Set(
    todayApps.map((app) => {
      const d = new Date(app.appointmentDate);
      return `${d.getHours().toString().padStart(2, "0")}:00`;
    })
  ).size;
  const occupancyPercentage = timeSlotsCount > 0 ? Math.round((bookedSlotsCount / timeSlotsCount) * 100) : 0;

  // 3. Most requested services ranking
  const serviceCounts = appointments.reduce((acc, app) => {
    const sName = app.serviceName || "Servicio General";
    acc[sName] = (acc[sName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const popularServices = Object.entries(serviceCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const maxPopularServiceReservations = popularServices.reduce((max, s) => Math.max(max, s.count), 1);

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Sidebar navigation */}
      <Sidebar onNewAppointmentClick={() => setIsAppointmentModalOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-[240px]">
        {/* Header Bar */}
        <Header
          searchPlaceholder="Buscar citas por cliente o servicio..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content Canvas */}
        <main className="p-margin-mobile md:p-gutter max-w-container-max w-full mx-auto flex-1">
          {/* Header Action Section */}
          <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-[0_4px_20px_rgba(0,0,0,0.01)] mb-gutter">
            <div>
              <h1 className="font-display text-headline-lg text-on-surface font-semibold mb-1.5 flex items-center gap-2">
                <span>{greeting}</span>
                {session?.user?.name && (
                  <span className="text-primary font-medium">
                    {session.user.name.split(" ")[0]}
                  </span>
                )}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant/90 font-medium">
                Hoy tienes <strong className="text-on-surface">{todayApps.length}</strong> citas programadas.
                {todayApps.length > 0 && (
                  <>
                    {" "}
                    <strong className="text-emerald-700">{todayApps.filter(a => a.status === "SENT").length}</strong> notificadas y{" "}
                    <strong className={todayApps.filter(a => a.status === "ERROR").length > 0 ? "text-error" : "text-on-surface-variant"}>
                      {todayApps.filter(a => a.status === "ERROR").length}
                    </strong> con error.
                  </>
                )}
              </p>
            </div>
          </section>

          {/* Quick Metrics Bento Grid */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-gutter mb-gutter">
            <MetricCard
              title="Citas Hoy"
              value={String(todayApps.length)}
              change={`${todayApps.length > 0 ? "+" : ""}${todayApps.length * 10}%`}
              trend={todayApps.length > 0 ? "up" : "stable"}
              icon={<CalendarIcon className="w-5 h-5" />}
              iconClassName="bg-primary-container/20 text-primary"
            />
            <MetricCard
              title="Nuevos Clientes"
              value={String(newClientsCount)}
              change={`${newClientsCount > 0 ? "+" : ""}${newClientsCount * 5}%`}
              trend={newClientsCount > 0 ? "up" : "stable"}
              icon={<UserPlus className="w-5 h-5" />}
              iconClassName="bg-secondary-container/40 text-secondary"
            />
            <MetricCard
              title="Ingresos Estimados"
              value={`€${estimatedIncome}`}
              change={estimatedIncome > 0 ? "+12%" : "Estable"}
              trend={estimatedIncome > 0 ? "up" : "stable"}
              icon={<Euro className="w-5 h-5" />}
              iconClassName="bg-emerald-500/10 text-emerald-600"
            />
            <MetricCard
              title="Ocupación"
              value={`${occupancyPercentage}%`}
              change={occupancyPercentage > 50 ? "Alta" : "Estable"}
              trend={occupancyPercentage > 50 ? "up" : "stable"}
              icon={<Activity className="w-5 h-5" />}
              iconClassName="bg-amber-500/10 text-amber-600"
              progress={occupancyPercentage}
            />
          </section>

          {/* Main Dashboard Widgets Row */}
          <section className="grid grid-cols-1 md:grid-cols-10 gap-gutter">
            {/* Today's Appointments List Widget */}
            <div className="md:col-span-6 flex flex-col gap-gutter">
              <Card>
                <CardHeader className="flex-row items-center justify-between gap-4 border-b border-outline-variant/40 pb-4">
                  <div>
                    <CardTitle className="font-semibold text-title-md">
                      Citas de Hoy
                    </CardTitle>
                    <p className="text-body-sm text-on-surface-variant font-medium mt-0.5">
                      {new Date().toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {`${todayApps.length} citas en total`}
                  </Badge>
                </CardHeader>

                <div className="p-6 flex flex-col gap-4">
                  {filteredTodayApps.length > 0 ? (
                    <div className="relative pl-6 border-l border-outline-variant/60 ml-3 py-2 flex flex-col gap-4">
                      {filteredTodayApps.map((app) => {
                        const appTime = new Date(app.appointmentDate).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <div key={app.id} className="relative group">
                            {/* Timeline bullet node */}
                            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-0 h-0 flex items-center justify-center z-10">
                              <div className="w-2.5 h-2.5 rounded-full bg-outline-variant group-hover:bg-primary transition-colors ring-4 ring-surface shrink-0" />
                            </div>
                            
                            <ContextMenu>
                              <ContextMenuTrigger>
                                <div
                                  className="flex items-center justify-between p-4 rounded-md border border-outline-variant/60 bg-surface-container-low hover:bg-surface-container/60 hover:border-primary-fixed-dim transition-all cursor-context-menu gap-4"
                                >
                                  <div className="flex items-center gap-4 min-w-0">
                                    <div className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-bold text-label-md select-none shrink-0 text-center">
                                      {appTime}
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="font-body-lg text-body-lg font-semibold text-on-surface truncate">
                                        {app.clientName}
                                      </h4>
                                      <p className="text-body-sm text-on-surface-variant font-medium truncate">
                                        {app.serviceName || "Servicio General"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    {/* Status Badge */}
                                    {app.status !== "PENDING" && (
                                      <Badge
                                        variant={app.status === "SENT" ? "default" : "error"}
                                      >
                                        {app.status === "SENT" ? "Enviada" : "Error"}
                                      </Badge>
                                    )}

                                    {/* Figma-style trigger visual cue */}
                                    <MoreVertical className="w-5 h-5 text-on-surface-variant/40 group-hover:text-on-surface transition-colors cursor-pointer" />
                                  </div>
                                </div>
                              </ContextMenuTrigger>

                              <ContextMenuContent>
                                <div className="px-3 py-1.5 text-xs font-semibold text-on-surface-variant/80 border-b border-outline-variant/30 select-none">
                                  Acciones de Cita
                                </div>
                                <ContextMenuItem onClick={() => handleUpdateStatus(app.id, "SENT")} className="text-emerald-700 hover:bg-emerald-50">
                                  <Check className="w-4 h-4 mr-2 inline" /> Marcar como Enviada
                                </ContextMenuItem>
                                <ContextMenuItem onClick={() => handleUpdateStatus(app.id, "ERROR")} className="text-error hover:bg-error-container/10">
                                  <AlertCircle className="w-4 h-4 mr-2 inline" /> Marcar con Error
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem onClick={() => handleDeleteAppointment(app.id)} className="text-error hover:bg-error-container/20">
                                  <Trash2 className="w-4 h-4 mr-2 inline" /> Eliminar Cita
                                </ContextMenuItem>
                              </ContextMenuContent>
                            </ContextMenu>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Empty
                      title="No hay citas para hoy"
                      description={
                        searchQuery
                          ? "Prueba a ajustar tu búsqueda de clientes o servicios."
                          : "No hay citas programadas para el día de hoy."
                      }
                      icon={CalendarIcon}
                      className="border-none bg-transparent py-8"
                    />
                  )}
                </div>
              </Card>
            </div>

            {/* Utility Widgets */}
            <div className="md:col-span-4 flex flex-col gap-gutter">
              {/* WhatsApp Connection Widget */}
              <Card>
                <CardHeader className="pb-3 border-b border-outline-variant/30">
                  <CardTitle className="text-title-md font-semibold flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-primary" />
                    <span>WhatsApp Bot</span>
                  </CardTitle>
                </CardHeader>
                <div className="p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Pulsing live status indicator */}
                      <span className="relative flex h-3 w-3">
                        {whatsappStatus === "CONNECTED" ? (
                          <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </>
                        ) : whatsappStatus === "WAITING_QR" ? (
                          <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                          </>
                        ) : (
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-outline-variant"></span>
                        )}
                      </span>
                      <span className="text-body-md text-on-surface-variant font-medium">
                        Estado de Conexión
                      </span>
                    </div>
                    <Badge
                      variant={
                        whatsappStatus === "CONNECTED"
                          ? "default"
                          : whatsappStatus === "WAITING_QR"
                            ? "secondary"
                            : "error"
                      }
                    >
                      {whatsappStatus === "CONNECTED"
                        ? "Conectado"
                        : whatsappStatus === "WAITING_QR"
                          ? "Esperando QR"
                          : "Desconectado"}
                    </Badge>
                  </div>

                  {whatsappStatus === "CONNECTED" ? (
                    <div className="flex flex-col gap-3">
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
                        <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <p className="text-body-sm text-emerald-800 leading-relaxed font-medium">
                          El bot está activo y enviando recordatorios automáticos de citas a los clientes.
                        </p>
                      </div>
                      <div className="px-3 py-2 bg-surface-container/60 rounded-lg border border-outline-variant/40 flex items-center justify-between text-xs text-on-surface-variant font-medium select-none">
                        <span>Mensajes hoy:</span>
                        <span className="font-bold text-on-surface">
                          {appointments.filter(a => a.status === "SENT").length} enviados | 0 fallidos
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-body-sm text-amber-800 leading-relaxed font-medium">
                          WhatsApp está desconectado. Los clientes no recibirán alertas hasta emparejar tu teléfono.
                        </p>
                      </div>

                      {whatsappStatus === "WAITING_QR" && qrCode && (
                        <div className="flex flex-col items-center gap-2 p-4 bg-surface-container-low rounded-xl border border-outline-variant/50">
                          <img src={qrCode} alt="WhatsApp Pairing QR" className="w-40 h-40 object-contain" />
                          <span className="text-xs text-on-surface-variant font-medium">
                            Escanea este código desde WhatsApp
                          </span>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        onClick={() => window.location.href = "/ajustes"}
                        className="w-full justify-center flex items-center gap-2"
                      >
                        <span>Configurar WhatsApp</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Popular Services Ranking */}
              <Card>
                <CardHeader className="pb-3 border-b border-outline-variant/30">
                  <CardTitle className="text-title-md font-semibold flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    <span>Servicios Solicitados</span>
                  </CardTitle>
                </CardHeader>
                <div className="p-6 flex flex-col gap-4">
                  {popularServices.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {popularServices.map(({ name, count }, index) => {
                        const percentage = Math.round((count / maxPopularServiceReservations) * 100);
                        const colors = [
                          "from-primary to-primary-container",
                          "from-secondary to-secondary/80",
                          "from-tertiary to-tertiary/80",
                          "from-amber-500/80 to-amber-600/80"
                        ];
                        const gradient = colors[index % colors.length];

                        return (
                          <div key={name} className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-on-surface shrink-0">
                                  {index + 1}
                                </span>
                                <span className="text-body-md text-on-surface font-semibold truncate">
                                  {name}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-on-surface-variant shrink-0">
                                {`${count} reservas`}
                              </span>
                            </div>
                            
                            {/* Horizontal relative progress bar */}
                            <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden ml-8.5 max-w-[calc(100%-2.5rem)]">
                              <div
                                className={cn("h-full rounded-full transition-all duration-500 bg-gradient-to-r", gradient)}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-body-md text-on-surface-variant font-medium text-center py-4">
                      No hay suficientes datos de servicios.
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </section>
        </main>

        <Button
          onClick={() => setIsAppointmentModalOpen(true)}
          variant="primary"
          className="md:hidden fixed bottom-20 right-6 z-40 p-4 rounded-full shadow-lg"
        >
          <Plus data-icon="plus" />
        </Button>

        {/* Mobile bottom nav */}
        <BottomNav />
      </div>

      {/* Booking and registration Modals */}
      <NewAppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSave={handleSaveAppointment}
      />

      <AddClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={() => fetchData()}
      />
    </div>
  );
}
