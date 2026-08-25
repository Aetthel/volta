"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
  Briefcase,
  X,
  Sparkles,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useAlerts } from "@/lib/alerts";
import FaceIcon from "@/components/FaceIcon";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import dynamicImport from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import TrialBanner from "@/components/TrialBanner";
import MetricCard from "@/components/MetricCard";
import { WeeklyPerformanceChart } from "@/components/WeeklyPerformanceChart";
import { FeaturedServicesList } from "@/components/FeaturedServicesList";
import { UpcomingAppointmentsList } from "@/components/UpcomingAppointmentsList";

const NewAppointmentModal = dynamicImport(() => import("@/components/NewAppointmentModal"), {
  ssr: false,
});
const AddClientModal = dynamicImport(() => import("@/components/AddClientModal"), {
  ssr: false,
});
import {
  Alert,
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  Empty,
  Separator,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  PageHeader,
  Skeleton,
} from "@/components/ui/volta-ui";
import { cn, formatCurrency, toAmount } from "@/lib/utils";

interface AppointmentItem {
  id: string;
  clientId?: string;
  clientName: string;
  clientPhone: string;
  appointmentDate: string;
  status: "PENDING" | "SENT" | "ERROR";
  serviceName: string;
  duration?: string;
  price?: number;
  service?: {
    name?: string;
    price?: number;
    duration?: number;
    color?: string;
  };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const businessId = session?.user?.businessId || "";

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [appointmentModalTriggerRect, setAppointmentModalTriggerRect] = useState<DOMRect | null>(
    null
  );
  const [clientModalTriggerRect, setClientModalTriggerRect] = useState<DOMRect | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [whatsappStatus, setWhatsappStatus] = useState("DISCONNECTED");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState("¡Hola!");

  useEffect(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) setGreeting("¡Buenos días!");
    else if (hrs < 20) setGreeting("¡Buenas tardes!");
    else setGreeting("¡Buenas noches!");
  }, []);

  const fetchData = useCallback(() => {
    if (!businessId) return;
    setIsLoading(true);

    const p1 = fetch(`/api/backend/appointments?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAppointments(data);
        }
      })
      .catch((e) => console.error("Error loading appointments:", e));

    const p2 = fetch(`/api/backend/clients?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClients(data);
        }
      })
      .catch((e) => console.error("Error loading clients:", e));

    const p3 = fetch(`/api/backend/services?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setServices(data);
        }
      })
      .catch((e) => console.error("Error loading services:", e));

    const p4 = fetch(`/api/backend/business/${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (data.whatsappStatus) setWhatsappStatus(data.whatsappStatus);
          if (data.qrCode) setQrCode(data.qrCode);
        }
      })
      .catch((e) => console.error("Error loading business status:", e));

    Promise.all([p1, p2, p3, p4]).finally(() => {
      setIsLoading(false);
    });
  }, [businessId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    if (!window.confirm("¿Seguro que deseas eliminar esta cita? Esta acción no se puede deshacer."))
      return;
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

  // 2. Real 7-Day Analytics Calculation for Metric Cards & Sparklines
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const dynamicPrices: Record<string, number> = services.reduce(
    (acc, s) => {
      if (s.name) {
        acc[s.name.trim().toLowerCase()] = toAmount(s.price);
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const getAppointmentPrice = (app: any) => {
    if (typeof app.service?.price === "number") return app.service.price;
    if (typeof app.price === "number") return app.price;
    const sName = (app.serviceName || app.service?.name || "").trim().toLowerCase();
    return dynamicPrices[sName] || 0;
  };

  // 1. Citas (daily appointment counts for last 7 days)
  const appointmentsSparkline = last7Days.map((dateStr) => {
    return appointments.filter(
      (app) => app.appointmentDate && app.appointmentDate.split("T")[0] === dateStr
    ).length;
  });

  const todayCount = appointmentsSparkline[6] || 0;
  const yesterdayCount = appointmentsSparkline[5] || 0;
  const appsDiff = todayCount - yesterdayCount;
  const appsPct =
    yesterdayCount > 0
      ? `${Math.abs(Math.round((appsDiff / yesterdayCount) * 100))}%`
      : todayCount > 0
        ? "100%"
        : "0.0%";
  const appsTrend = appsDiff > 0 ? "up" : appsDiff < 0 ? "down" : "neutral";

  // 2. Nuevos Clientes (daily new client counts for last 7 days)
  const newClientsCount = clients.filter((c) => {
    const createdDate = new Date(c.createdAt);
    const diffTime = Math.abs(new Date().getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }).length;

  const clientsSparkline = last7Days.map((dateStr) => {
    return clients.filter(
      (c) => c.createdAt && c.createdAt.split("T")[0] === dateStr
    ).length;
  });

  const thisWeekClients = clientsSparkline.reduce((a, b) => a + b, 0);
  const prevWeekClients = clients.filter((c) => {
    if (!c.createdAt) return false;
    const createdDate = new Date(c.createdAt);
    const diffTime = new Date().getTime() - createdDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 7 && diffDays <= 14;
  }).length;

  const clientsDiff = thisWeekClients - prevWeekClients;
  const clientsPct =
    prevWeekClients > 0
      ? `${Math.abs(Math.round((clientsDiff / prevWeekClients) * 100))}%`
      : thisWeekClients > 0
        ? "100%"
        : "0.0%";
  const clientsTrend = clientsDiff > 0 ? "up" : clientsDiff < 0 ? "down" : "neutral";

  // 3. Ingresos Est. (daily estimated revenue for last 7 days)
  const estimatedIncome = todayApps.reduce((acc, app) => {
    return acc + getAppointmentPrice(app);
  }, 0);

  const incomeSparkline = last7Days.map((dateStr) => {
    const dayApps = appointments.filter(
      (app) => app.appointmentDate && app.appointmentDate.split("T")[0] === dateStr
    );
    return dayApps.reduce((sum, app) => sum + getAppointmentPrice(app), 0);
  });

  const todayIncomeVal = incomeSparkline[6] || 0;
  const yesterdayIncomeVal = incomeSparkline[5] || 0;
  const incomeDiff = todayIncomeVal - yesterdayIncomeVal;
  const incomePct =
    yesterdayIncomeVal > 0
      ? `${Math.abs(Math.round((incomeDiff / yesterdayIncomeVal) * 100))}%`
      : todayIncomeVal > 0
        ? "100%"
        : "0.0%";
  const incomeTrend = incomeDiff > 0 ? "up" : incomeDiff < 0 ? "down" : "neutral";

  // 4. Ocupación (daily occupancy percentages for last 7 days)
  const timeSlotsCount = 12; // 09:00 to 20:00 slots
  const bookedSlotsCount = new Set(
    todayApps.map((app) => {
      const d = new Date(app.appointmentDate);
      return `${d.getHours().toString().padStart(2, "0")}:00`;
    })
  ).size;
  const occupancyPercentage =
    timeSlotsCount > 0 ? Math.round((bookedSlotsCount / timeSlotsCount) * 100) : 0;

  const occupancySparkline = last7Days.map((dateStr) => {
    const dayApps = appointments.filter(
      (app) => app.appointmentDate && app.appointmentDate.split("T")[0] === dateStr
    );
    const bookedCount = new Set(
      dayApps.map((app) => {
        const d = new Date(app.appointmentDate);
        return `${d.getHours().toString().padStart(2, "0")}:00`;
      })
    ).size;
    return Math.min(100, Math.round((bookedCount / 12) * 100));
  });

  const todayOcc = occupancySparkline[6] || 0;
  const yesterdayOcc = occupancySparkline[5] || 0;
  const occDiff = todayOcc - yesterdayOcc;
  const occPct =
    yesterdayOcc > 0
      ? `${Math.abs(Math.round((occDiff / yesterdayOcc) * 100))}%`
      : todayOcc > 0
        ? `${todayOcc}%`
        : "0.0%";
  const occTrend = occDiff > 0 ? "up" : occDiff < 0 ? "down" : "neutral";

  // 3. Most requested services ranking
  const serviceCounts = appointments.reduce(
    (acc, app) => {
      const sName = app.serviceName || "Servicio General";
      acc[sName] = (acc[sName] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

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
    const dayApps = appointments.filter((app) => {
      if (!app.appointmentDate) return false;
      return app.appointmentDate.split("T")[0] === dayStr;
    });

    const clientsCount = dayApps.length;
    const incomeAmount = dayApps.reduce((sum, app) => sum + getAppointmentPrice(app), 0);

    return {
      name: dayNames[idx],
      income: incomeAmount,
      clients: clientsCount,
      isCurrent: idx === currentDayIndex,
    };
  });

  // 5. Featured services calculation (top 4 services based strictly on business services and bookings)
  const displayServiceShares = (() => {
    const totalAppointments = appointments.length;

    // Create a map of all services initialized to 0
    const serviceMap: Record<string, { count: number; pct: number }> = {};

    // Pre-populate with actual business services
    services.forEach((s) => {
      if (s.name) serviceMap[s.name] = { count: 0, pct: 0 };
    });

    // Populate with actual counts
    appointments.forEach((app) => {
      const sName = app.serviceName || app.service?.name || "Servicio General";
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

    // Sort: services with bookings first
    list.sort((a, b) => b.count - a.count);

    // Return top 4
    return list.slice(0, 4).map((s) => ({
      name: s.name,
      pct: s.pct,
      count: s.count,
      icon: Briefcase,
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
      const mins = typeof app.duration === "number" ? app.duration : parseInt(app.duration, 10);
      if (!isNaN(mins)) {
        if (mins >= 60) {
          const hrs = Math.floor(mins / 60);
          const rMins = mins % 60;
          durationStr = rMins > 0 ? `${hrs}h ${rMins}m` : `${hrs}h`;
        } else {
          durationStr = `${mins}m`;
        }
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

  const todayFormatter = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const formattedDate = todayFormatter.format(new Date());
  const dateString = "Hoy es " + formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Sidebar navigation */}
      <Sidebar
        onNewAppointmentClick={(e) => {
          setAppointmentModalTriggerRect(e ? e.currentTarget.getBoundingClientRect() : null);
          setIsAppointmentModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen md:ml-[240px]">
        <TrialBanner />
        <main className="p-gutter max-w-container-max w-full mx-auto flex-1 flex flex-col">
          <PageHeader
            title={greeting + (session?.user?.name ? ` ${session.user.name.split(" ")[0]}` : "")}
            description={
              <>
                Tienes <strong className="text-on-surface">{todayApps.length}</strong> citas
                programadas.
                {todayApps.length > 0 && (
                  <>
                    {" "}
                    <strong className="text-primary">
                      {todayApps.filter((a) => a.status === "SENT").length}
                    </strong>{" "}
                    notificadas y{" "}
                    <strong
                      className={
                        todayApps.filter((a) => a.status === "ERROR").length > 0
                          ? "text-error"
                          : "text-on-surface-variant"
                      }
                    >
                      {todayApps.filter((a) => a.status === "ERROR").length}
                    </strong>{" "}
                    con error.
                  </>
                )}
              </>
            }
          />

          {/* Metrics Bento Grid */}
          {isLoading ? (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-gutter">
              {[...Array(4)].map((_, i) => (
                <Card
                  key={i}
                  className="p-5 flex flex-col justify-between bg-white border border-outline-variant/60 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] h-[160px]"
                >
                  <div className="flex justify-between items-center w-full">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-4 h-4 rounded-full" />
                  </div>
                  <div className="flex justify-between items-end my-2">
                    <div>
                      <Skeleton className="w-16 h-8" />
                      <Skeleton className="w-24 h-3 mt-1.5" />
                    </div>
                    <Skeleton className="w-14 h-7" />
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-outline-variant/20">
                    <Skeleton className="w-12 h-3" />
                    <Skeleton className="w-10 h-3" />
                  </div>
                </Card>
              ))}
            </section>
          ) : (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-gutter">
              <MetricCard
                title="Citas Hoy"
                value={String(todayApps.length)}
                change={appsPct}
                trend={appsTrend}
                caption="Comparado con ayer"
                infoText="Total de citas agendadas para el día de hoy y porcentaje de variación respecto al día anterior."
                sparklineData={appointmentsSparkline}
                icon={<CalendarIcon className="w-4 h-4 text-on-surface-variant/80" />}
              />
              <MetricCard
                title="Nuevos Clientes"
                value={String(newClientsCount)}
                change={clientsPct}
                trend={clientsTrend}
                caption="Últimos 30 días"
                infoText="Clientes registrados por primera vez en la plataforma durante este mes frente al período previo."
                sparklineData={clientsSparkline}
                icon={<UserPlus className="w-4 h-4 text-on-surface-variant/80" />}
              />
              <MetricCard
                title="Ingresos Est."
                value={formatCurrency(estimatedIncome)}
                change={incomePct}
                trend={incomeTrend}
                caption="Citas confirmadas hoy"
                infoText="Suma estimada de los precios de los servicios agendados para las citas programadas para hoy."
                sparklineData={incomeSparkline}
                icon={<Euro className="w-4 h-4 text-on-surface-variant/80" />}
              />
              <MetricCard
                title="Ocupación"
                value={`${occupancyPercentage}%`}
                change={occPct}
                trend={occTrend}
                caption="Capacidad diaria asignada"
                infoText="Porcentaje de franjas horarias reservadas sobre el horario laboral total configurado para hoy."
                sparklineData={occupancySparkline}
                icon={<Activity className="w-4 h-4 text-on-surface-variant/80" />}
              />
            </section>
          )}

          {/* Middle Row (Weekly Performance + Featured Services) */}
          {isLoading ? (
            <section className="grid grid-cols-1 lg:grid-cols-10 gap-gutter mb-gutter">
              <Card className="col-span-12 lg:col-span-6 p-6 flex flex-col h-[340px] justify-between bg-white border border-outline-variant/60 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-center mb-6">
                  <Skeleton className="w-40 h-6" />
                  <Skeleton className="w-24 h-8" />
                </div>
                <div className="flex-1 flex items-end gap-4 h-[200px] px-2 pb-4">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <Skeleton
                        className="w-full rounded-t-sm"
                        style={{ height: `${30 + (i % 3) * 40}px` }}
                      />
                      <Skeleton className="w-8 h-4" />
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="col-span-12 lg:col-span-4 p-6 flex flex-col bg-white border border-outline-variant/60 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <Skeleton className="w-44 h-6 mb-6" />
                <div className="flex flex-col gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <Skeleton className="w-28 h-4" />
                        <Skeleton className="w-12 h-4" />
                      </div>
                      <Skeleton className="w-full h-2 rounded-full" />
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          ) : (
            <section className="grid grid-cols-1 lg:grid-cols-10 gap-gutter mb-gutter">
              {/* Weekly Performance Area Chart */}
              <Card className="col-span-12 lg:col-span-6 p-6 flex flex-col justify-between bg-white border border-outline-variant/60 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <WeeklyPerformanceChart data={weeklyData} />
              </Card>

              {/* Featured Services Radial Donut Chart */}
              <Card className="col-span-12 lg:col-span-4 p-6 flex flex-col justify-between bg-white border border-outline-variant/60 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <FeaturedServicesList services={displayServiceShares} totalCount={appointments.length || 1260} />
              </Card>
            </section>
          )}

          {/* Upcoming Appointments section */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-xl text-on-surface">Próximas Citas</h3>
              <Link
                href="/agenda"
                className="text-body-sm font-bold text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Ver todas
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                {[...Array(3)].map((_, i) => (
                  <Card
                    key={i}
                    className="p-4 flex items-center justify-between bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] h-[84px]"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="w-24 h-4" />
                        <Skeleton className="w-32 h-3" />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Skeleton className="w-12 h-5 rounded-md" />
                      <Skeleton className="w-14 h-3" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <UpcomingAppointmentsList appointments={displayUpcomingApps} />
            )}
          </section>
        </main>

        {/* Mobile floating button */}
        <Button
          onClick={(e) => {
            setAppointmentModalTriggerRect(e.currentTarget.getBoundingClientRect());
            setIsAppointmentModalOpen(true);
          }}
          variant="ghost"
          className="md:hidden fixed bottom-20 right-6 z-40 p-4 bg-primary text-white rounded-full shadow-lg border-none"
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
        triggerRect={appointmentModalTriggerRect}
      />

      <AddClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={() => fetchData()}
        triggerRect={clientModalTriggerRect}
      />
    </div>
  );
}

function DemoCountdown({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const TOTAL_DURATION = 30 * 60 * 1000;
    const calculateTime = () => {
      const difference = new Date(expiresAt).getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft("Expirado");
        setProgress(0);
        return;
      }
      const mins = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);
      setProgress(Math.max(0, (difference / TOTAL_DURATION) * 100));
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const variant = progress <= 20 ? "error" : progress <= 40 ? "warning" : "primary";

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-1.5 bg-surface-container-low border border-outline-variant/40 rounded-lg px-2.5 py-1">
        <Clock className="w-3 h-3 text-on-surface-variant" />
        <span className="font-mono text-xs font-semibold text-on-surface">{timeLeft}</span>
      </div>
      <div className="h-1.5 w-16 rounded-full bg-outline-variant/30 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-linear",
            variant === "error" ? "bg-error" : variant === "warning" ? "bg-amber-500" : "bg-primary"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
