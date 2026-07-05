"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  ChevronDown,
  TrendingUp,
  Award,
  Trash2,
  MoreVertical,
  Search,
  Scissors,
} from "lucide-react";
import { useSession } from "next-auth/react";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import MetricCard from "@/components/MetricCard";
import NewAppointmentModal from "@/components/NewAppointmentModal";
import { WeeklyPerformanceChart } from "@/components/WeeklyPerformanceChart";
import { FeaturedServicesList } from "@/components/FeaturedServicesList";
import { UpcomingAppointmentsList } from "@/components/UpcomingAppointmentsList";
import AddClientModal from "@/components/AddClientModal";
import { Alert, Badge, Button, Card, CardHeader, CardTitle, Empty, Separator, ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, PageHeader } from "@/components/ui/volta-ui";
import { cn } from "@/lib/utils";

interface AppointmentItem {
  id: string;
  clientId?: string;
  clientName: string;
  clientPhone: string;
  appointmentDate: string;
  status: "PENDING" | "SENT" | "ERROR";
  serviceName: string;
  duration?: string;
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

  // 4. Bar chart weekly performance data (Monday to Sunday)
  const getStartOfWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const startOfWeek = getStartOfWeek();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const currentDayIndex = (new Date().getDay() + 6) % 7; // Mon=0, Sun=6

  const weeklyData = weekDays.map((day, idx) => {
    const dayStr = day.toISOString().split("T")[0];
    const count = appointments.filter((app) => {
      if (!app.appointmentDate) return false;
      return app.appointmentDate.split("T")[0] === dayStr;
    }).length;
    return {
      name: dayNames[idx],
      count,
      isCurrent: idx === currentDayIndex,
    };
  });

  const maxWeeklyCount = Math.max(...weeklyData.map((d) => d.count), 1);

  // 5. Featured services calculation (top 4 services, listing unused business/default services as 0%)
  const displayServiceShares = (() => {
    const totalAppointments = appointments.length;
    
    // Create a map of all services initialized to 0
    const serviceMap: Record<string, { count: number; pct: number }> = {};
    
    // Pre-populate with all business services
    services.forEach((s) => {
      if (s.name) serviceMap[s.name] = { count: 0, pct: 0 };
    });
    
    // Pre-populate with default services if list is empty
    DEFAULT_SERVICES.forEach((s) => {
      if (!(s.name in serviceMap)) {
        serviceMap[s.name] = { count: 0, pct: 0 };
      }
    });

    // Populate with actual counts
    appointments.forEach((app) => {
      const sName = app.serviceName || "Servicio General";
      if (sName in serviceMap) {
        serviceMap[sName].count += 1;
      } else {
        serviceMap[sName] = { count: 1, pct: 0 };
      }
    });

    // Calculate percentages
    const list = Object.entries(serviceMap).map(([name, data]) => {
      const pct = totalAppointments > 0 ? Math.round((data.count / totalAppointments) * 100) : 0;
      return {
        name,
        pct,
        count: data.count,
      };
    });

    // Sort: services with bookings first, then alphabetically or by ID
    list.sort((a, b) => b.count - a.count);
    
    // Return top 4 with Scissors icon
    return list.slice(0, 4).map((s) => ({
      name: s.name,
      pct: s.pct,
      icon: Scissors,
    }));
  })();

  const upcomingApps = appointments
    .filter((app) => {
      if (!app.appointmentDate) return false;
      return new Date(app.appointmentDate).getTime() >= new Date().setHours(0, 0, 0, 0);
    })
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
    .slice(0, 3);

  const displayUpcomingApps = upcomingApps.map((app) => {
    const appTime = new Date(app.appointmentDate).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    let durationStr = "1h";
    if (app.duration) {
      const mins = parseFloat(app.duration) * 60;
      if (mins >= 60) {
        const hrs = Math.floor(mins / 60);
        const rMins = mins % 60;
        durationStr = rMins > 0 ? `${hrs}h ${rMins}m` : `${hrs}h`;
      } else {
        durationStr = `${mins}m`;
      }
    }
    
    // Find the client in clients list to retrieve their real details from database
    const clientRecord = clients.find((c) => c.id === app.clientId || c.phone === app.clientPhone);

    return {
      id: app.id,
      clientName: app.clientName,
      clientSurname: clientRecord?.surname || undefined,
      serviceName: app.serviceName || "Servicio General",
      time: appTime,
      duration: durationStr,
      avatarUrl: clientRecord?.avatarUrl || undefined,
    };
  });

  const todayFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const dateString = "Today is " + todayFormatter.format(new Date());

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Sidebar navigation */}
      <Sidebar onNewAppointmentClick={() => setIsAppointmentModalOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-[240px]">
        {/* Content Canvas */}
        <main className="p-gutter max-w-container-max w-full mx-auto flex-1 flex flex-col gap-gutter">
          <PageHeader
            title={greeting + (session?.user?.name ? ` ${session.user.name.split(" ")[0]}` : "")}
            description={
              <>
                Tienes <strong className="text-on-surface">{todayApps.length}</strong> citas programadas.
                {todayApps.length > 0 && (
                  <>
                    {" "}
                    <strong className="text-emerald-700">{todayApps.filter(a => a.status === "SENT").length}</strong> notificadas y{" "}
                    <strong className={todayApps.filter(a => a.status === "ERROR").length > 0 ? "text-error" : "text-on-surface-variant"}>
                      {todayApps.filter(a => a.status === "ERROR").length}
                    </strong> con error.
                  </>
                )}
              </>
            }
          />

          {/* Metrics Bento Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            <MetricCard
              title="Citas Hoy"
              value={String(todayApps.length)}
              change={`${todayApps.length > 0 ? "+" : ""}${todayApps.length * 10}%`}
              trend={todayApps.length > 0 ? "up" : "down"}
              icon={<CalendarIcon className="w-5 h-5 text-[#005d63]" />}
              iconClassName="bg-[#b2f1e8]/30"
            />
            <MetricCard
              title="Nuevos Clientes"
              value={String(newClientsCount)}
              change={`${newClientsCount > 0 ? "+" : ""}${newClientsCount * 5}%`}
              trend={newClientsCount > 0 ? "up" : "down"}
              icon={<UserPlus className="w-5 h-5 text-[#005d63]" />}
              iconClassName="bg-[#b2f1e8]/30"
            />
            <MetricCard
              title="Ingresos Est."
              value={`€${estimatedIncome}`}
              change={estimatedIncome > 0 ? "+12%" : "Estable"}
              trend={estimatedIncome > 0 ? "up" : "down"}
              icon={<Euro className="w-5 h-5 text-[#005d63]" />}
              iconClassName="bg-[#b2f1e8]/30"
            />
            <MetricCard
              title="Ocupación"
              value={
                <div className="flex items-baseline gap-1.5 mt-0.5 sm:mt-1">
                  <span className="text-2xl sm:text-3xl font-bold text-slate-800">
                    {occupancyPercentage}%
                  </span>
                  <span className="text-body-sm font-medium text-slate-400">
                    de capacidad
                  </span>
                </div>
              }
              icon={<Activity className="w-5 h-5 text-[#005d63]" />}
              iconClassName="bg-[#b2f1e8]/30"
              progress={occupancyPercentage}
            />
          </section>

          {/* Middle Row (Weekly Performance + Featured Services) */}
          <section className="grid grid-cols-1 lg:grid-cols-10 gap-gutter">
            {/* Weekly Performance Bar Chart */}
            <Card className="col-span-12 lg:col-span-6 p-6 flex flex-col justify-between bg-white border border-outline-variant/60 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-medium text-xl text-slate-800">
                    Rendimiento Semanal
                  </h3>
                  <div className="flex items-center text-body-sm font-semibold text-slate-500 border border-slate-100 rounded-lg px-3 py-1.5 bg-slate-50/50 cursor-pointer hover:bg-slate-100 transition-colors">
                    <span>Esta Semana</span>
                    <ChevronDown className="w-4 h-4 ml-1.5 text-slate-400" />
                  </div>
                </div>

                <WeeklyPerformanceChart
                  data={weeklyData}
                  maxCount={maxWeeklyCount}
                />
              </div>
            </Card>

            {/* Featured Services */}
            <Card className="col-span-12 lg:col-span-4 p-6 flex flex-col bg-white border border-outline-variant/60 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <h3 className="font-medium text-xl text-slate-800 mb-6">
                Servicios Destacados
              </h3>
              <FeaturedServicesList services={displayServiceShares} />
            </Card>
          </section>

          {/* Upcoming Appointments section */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-xl text-slate-800">
                Próximas Citas
              </h3>
              <Link href="/agenda" className="text-body-sm font-bold text-[#005d63] hover:text-[#00474b] hover:underline transition-colors">
                Ver todas
              </Link>
            </div>

            <UpcomingAppointmentsList appointments={displayUpcomingApps} />
          </section>
        </main>

        {/* Mobile floating button */}
        <Button
          onClick={() => setIsAppointmentModalOpen(true)}
          variant="ghost"
          className="md:hidden fixed bottom-20 right-6 z-40 p-4 bg-[#005d63] text-white rounded-full shadow-lg border-none"
        >
          <Plus className="w-6 h-6" />
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
