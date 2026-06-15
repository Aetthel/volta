"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  UserPlus,
  Euro,
  Activity,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
} from "lucide-react";
import { useSession } from "next-auth/react";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import MetricCard from "@/components/MetricCard";
import NewAppointmentModal from "@/components/NewAppointmentModal";
import AddClientModal from "@/components/AddClientModal";

// Interface for calendar appointment item
interface AppointmentItem {
  id: string;
  clientName: string;
  serviceName: string;
  dayIndex: number; // 0: Mon, 1: Tue, etc.
  timeSlot: string; // e.g., "09:00"
  duration: number; // in slots (1 slot = 1 hour)
  colorClass: string;
}

const getWeekDates = () => {
  const today = new Date();
  const currentDay = today.getDay(); // 0: Sun, 1: Mon, etc.
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + distanceToMonday);

  const days = [];
  const dayNames = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    days.push({
      name: dayNames[i],
      num: date.getDate(),
      dateString: date.toISOString().split("T")[0],
      current: date.toDateString() === today.toDateString(),
      closed: i === 6, // Sunday is closed
    });
  }
  return days;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const businessId = session?.user?.id || "mock-business-id";

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"week" | "day">("week");

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  const colorClasses = [
    "bg-primary-container text-on-primary-container border-primary",
    "bg-secondary-container text-on-secondary-container border-secondary",
    "bg-tertiary-container text-on-tertiary-container border-tertiary",
  ];

  const mapDbAppointments = (dbApps: any[]) => {
    const weekDates = getWeekDates();
    const startOfWeekStr = weekDates[0].dateString;
    const endOfWeekStr = weekDates[6].dateString;

    return dbApps
      .filter((app) => {
        const dateStr = app.appointmentDate.split("T")[0];
        return dateStr >= startOfWeekStr && dateStr <= endOfWeekStr;
      })
      .map((app) => {
        const dateObj = new Date(app.appointmentDate);
        const day = (dateObj.getDay() + 6) % 7; // Convert Sun=0, Mon=1... to Mon=0, Tue=1... Sun=6

        let hoursVal = dateObj.getHours();
        // Clamp to standard calendar time slots: 09:00 to 14:00
        if (hoursVal < 9) hoursVal = 9;
        if (hoursVal > 14) hoursVal = 14;
        const timeSlot = `${hoursVal.toString().padStart(2, "0")}:00`;

        const service = app.client?.frequentService || "Corte Caballero";
        let hash = 0;
        for (let i = 0; i < service.length; i++) {
          hash = service.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colorClass = colorClasses[Math.abs(hash) % colorClasses.length];

        return {
          id: app.id,
          clientName: app.clientName,
          serviceName: service,
          dayIndex: day,
          timeSlot: timeSlot,
          duration: 1,
          colorClass: colorClass,
        };
      });
  };

  const fetchDashboardData = () => {
    if (!businessId) return;

    // Fetch Appointments
    fetch(`/api/backend/appointments?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAppointments(mapDbAppointments(data));
        }
      })
      .catch((e) => {
        console.error("Error loading appointments:", e);
        setAppointments([]);
      });

    // Fetch Clients
    fetch(`/api/backend/clients?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClients(data);
        }
      })
      .catch((e) => {
        console.error("Error loading clients:", e);
        setClients([]);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, [businessId]);

  useEffect(() => {
    if (session?.user?.name) {
      document.title = `Inicio - ${session.user.name} - Volta`;
    }
  }, [session]);

  const handlePrev = () => {
    if (viewMode === "day") {
      setSelectedDayIndex((prev) => (prev === 0 ? 6 : prev - 1));
    }
  };

  const handleNext = () => {
    if (viewMode === "day") {
      setSelectedDayIndex((prev) => (prev === 6 ? 0 : prev + 1));
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const todayDayIndex = (new Date().getDay() + 6) % 7;
    setSelectedDayIndex(todayDayIndex);
  }, []);

  const handleGoToday = () => {
    const todayDayIndex = (new Date().getDay() + 6) % 7;
    setSelectedDayIndex(todayDayIndex);
  };

  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];
  const weekDays = getWeekDates();

  const handleSaveAppointment = (data: any) => {
    fetchDashboardData();
  };

  // Dynamic stats calculation
  const appointmentsTodayCount = appointments.filter(
    (app) => app.dayIndex === selectedDayIndex,
  ).length;

  const newClientsCount = clients.filter((c) => {
    const createdDate = new Date(c.createdAt);
    const diffTime = Math.abs(new Date().getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30; // registered in the last 30 days
  }).length;

  const servicePrices: Record<string, number> = {
    "Corte Caballero": 35,
    "Corte Dama": 45,
    "Coloración Premium": 85,
    "Tratamiento Keratina": 50,
    Manicura: 20,
    "Spa Facial": 40,
  };

  const estimatedIncome = appointments
    .filter((app) => app.dayIndex === selectedDayIndex)
    .reduce((acc, app) => acc + (servicePrices[app.serviceName] || 35), 0);

  const occupiedSlots = new Set(
    appointments
      .filter((app) => app.dayIndex === selectedDayIndex)
      .map((app) => app.timeSlot),
  ).size;
  const occupancyPercentage =
    timeSlots.length > 0
      ? Math.round((occupiedSlots / timeSlots.length) * 100)
      : 0;

  const todayDate = new Date();
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const currentMonthYear = `${monthNames[todayDate.getMonth()]} ${todayDate.getFullYear()}`;

  const gridColsClass =
    viewMode === "week"
      ? "grid-cols-[80px_repeat(7,_1fr)]"
      : "grid-cols-[80px_1fr]";
  const minWidthClass =
    viewMode === "week" ? "min-w-[800px]" : "min-w-0 w-full";

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Sidebar Navigation */}
      <Sidebar onNewAppointmentClick={() => setIsAppointmentModalOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-[240px]">
        {/* Header Bar */}
        <Header
          searchPlaceholder="Buscar citas o clientes..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Inner Content Canvas */}
        <main className="p-margin-mobile md:p-gutter max-w-container-max w-full mx-auto flex-1">
          {/* Quick Metrics Grid */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <MetricCard
              title="Citas Hoy"
              value={String(appointmentsTodayCount)}
              change={`${appointmentsTodayCount > 0 ? "+" : ""}${appointmentsTodayCount * 10}%`}
              trend={appointmentsTodayCount > 0 ? "up" : "stable"}
              icon={<CalendarIcon className="w-5 h-5" />}
            />
            <MetricCard
              title="Nuevos Clientes"
              value={String(newClientsCount)}
              change={`${newClientsCount > 0 ? "+" : ""}${newClientsCount * 5}%`}
              trend={newClientsCount > 0 ? "up" : "stable"}
              icon={<UserPlus className="w-5 h-5" />}
            />
            <MetricCard
              title="Ingresos Estimados"
              value={`€${estimatedIncome}`}
              change={estimatedIncome > 0 ? "+15%" : "Estable"}
              trend={estimatedIncome > 0 ? "up" : "stable"}
              icon={<Euro className="w-5 h-5" />}
            />
            <MetricCard
              title="Ocupación"
              value={`${occupancyPercentage}%`}
              change={occupancyPercentage > 50 ? "Alta" : "Estable"}
              trend={occupancyPercentage > 50 ? "up" : "stable"}
              icon={<Activity className="w-5 h-5" />}
            />
          </section>

          {/* Calendar Container */}
          <section className="bg-surface-container-lowest rounded-md border border-outline-variant shadow-[0px_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
            {/* Calendar Header Controls */}
            <div className="px-6 py-4 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <h3 className="font-title-lg text-title-lg text-on-surface font-semibold">
                  {currentMonthYear}
                </h3>
                <div className="flex items-center bg-surface-container-low rounded-lg p-1 text-on-surface-variant border border-outline-variant/30">
                  <button
                    onClick={handlePrev}
                    className="p-1 hover:bg-surface-variant rounded transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleGoToday}
                    className="px-2 text-label-md font-label-md font-semibold cursor-pointer"
                  >
                    Hoy
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-1 hover:bg-surface-variant rounded transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* View Switches */}
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg overflow-hidden border border-outline-variant bg-surface-container-low p-[2px]">
                  <button
                    onClick={() => setViewMode("week")}
                    className={`px-4 py-1 text-label-md font-label-md font-semibold rounded-md transition-all cursor-pointer ${
                      viewMode === "week"
                        ? "bg-secondary-container text-on-secondary-container shadow-sm"
                        : "text-on-surface-variant hover:bg-surface-variant"
                    }`}
                  >
                    Semana
                  </button>
                  <button
                    onClick={() => setViewMode("day")}
                    className={`px-4 py-1 text-label-md font-label-md font-semibold rounded-md transition-all cursor-pointer ${
                      viewMode === "day"
                        ? "bg-secondary-container text-on-secondary-container shadow-sm"
                        : "text-on-surface-variant hover:bg-surface-variant"
                    }`}
                  >
                    Día
                  </button>
                </div>
                <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer bg-surface-container-low">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Calendar Calendar Content */}
            <div className="overflow-x-auto custom-scrollbar">
              <div className={minWidthClass}>
                {/* Main Scroll Container containing both Header and Body */}
                <div className="relative h-auto md:h-[560px] overflow-y-visible md:overflow-y-auto custom-scrollbar">
                  {/* Weekdays Header Row (Sticky at the top) */}
                  <div
                    className={`grid ${gridColsClass} bg-surface-container-low border-b border-outline-variant font-medium select-none sticky top-0 z-20`}
                  >
                    {/* Empty left corner */}
                    <div className="p-4 border-r border-outline-variant bg-surface-container-low"></div>
                    {/* Days */}
                    {viewMode === "week"
                      ? weekDays.map((day, idx) => {
                          const isToday = isMounted && day.current;
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                setSelectedDayIndex(idx);
                                setViewMode("day");
                              }}
                              className={`p-4 text-center border-r border-outline-variant cursor-pointer hover:bg-surface-variant/40 transition-colors ${
                                isToday
                                  ? "bg-primary-container/10 text-primary"
                                  : day.closed
                                    ? "bg-error-container/10"
                                    : "text-on-surface-variant bg-surface-container-low"
                              }`}
                            >
                              <p
                                className={`text-label-md font-label-md ${isToday ? "font-bold" : ""} ${day.closed && !isToday ? "text-error/70" : ""}`}
                              >
                                {day.name}
                              </p>
                              <p
                                className={`text-title-md font-title-md ${isToday ? "font-bold text-lg" : ""} ${day.closed && !isToday ? "text-error font-medium" : ""}`}
                              >
                                {day.num}
                              </p>
                            </div>
                          );
                        })
                      : (() => {
                          const day = weekDays[selectedDayIndex];
                          const isToday = isMounted && day.current;
                          return (
                            <div
                              className={`p-4 text-center border-r border-outline-variant ${
                                isToday
                                  ? "bg-primary-container/10 text-primary"
                                  : day.closed
                                    ? "bg-error-container/10"
                                    : "text-on-surface-variant bg-surface-container-low"
                              }`}
                            >
                              <p
                                className={`text-label-md font-label-md ${isToday ? "font-bold" : ""} ${day.closed && !isToday ? "text-error/70" : ""}`}
                              >
                                {day.name}
                              </p>
                              <p
                                className={`text-title-md font-title-md ${isToday ? "font-bold text-lg" : ""} ${day.closed && !isToday ? "text-error font-medium" : ""}`}
                              >
                                {day.num}
                              </p>
                            </div>
                          );
                        })()}
                  </div>

                  {/* Calendar Body Rows */}
                  {timeSlots.map((time) => {
                    return (
                      <div
                        key={time}
                        className={`grid ${gridColsClass} h-20 border-b border-outline-variant/60 relative`}
                      >
                        {/* Time labels column */}
                        <div className="text-center py-3 text-label-md font-label-md text-on-surface-variant border-r border-outline-variant font-semibold select-none flex items-center justify-center bg-surface-container-low/35">
                          {time}
                        </div>

                        {/* Day slots columns */}
                        {viewMode === "week"
                          ? Array.from({ length: 7 }).map((_, dayIndex) => {
                              const cellAppointments = appointments.filter(
                                (app) =>
                                  app.dayIndex === dayIndex &&
                                  app.timeSlot === time &&
                                  (searchQuery === "" ||
                                    app.clientName
                                      .toLowerCase()
                                      .includes(searchQuery.toLowerCase()) ||
                                    app.serviceName
                                      .toLowerCase()
                                      .includes(searchQuery.toLowerCase())),
                              );

                              return (
                                <div
                                  key={dayIndex}
                                  className="border-r border-outline-variant/60 relative p-1 group hover:bg-surface-container-low/20 transition-all"
                                >
                                  {cellAppointments.map((app) => (
                                    <div
                                      key={app.id}
                                      className={`absolute inset-x-2 top-2 bottom-2 rounded-lg p-2 border-l-4 shadow-[0_2px_6px_rgba(0,0,0,0.03)] cursor-pointer hover:scale-[1.01] hover:shadow-md transition-all z-10 flex flex-col justify-between ${app.colorClass}`}
                                    >
                                      <div>
                                        <p className="text-label-md font-bold truncate">
                                          {app.serviceName}
                                        </p>
                                        <p className="text-[10px] opacity-80 font-medium">
                                          {app.clientName}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })
                          : (() => {
                              const cellAppointments = appointments.filter(
                                (app) =>
                                  app.dayIndex === selectedDayIndex &&
                                  app.timeSlot === time &&
                                  (searchQuery === "" ||
                                    app.clientName
                                      .toLowerCase()
                                      .includes(searchQuery.toLowerCase()) ||
                                    app.serviceName
                                      .toLowerCase()
                                      .includes(searchQuery.toLowerCase())),
                              );

                              return (
                                <div className="border-r border-outline-variant/60 relative p-1 group hover:bg-surface-container-low/20 transition-all">
                                  {cellAppointments.map((app) => (
                                    <div
                                      key={app.id}
                                      className={`absolute inset-x-2 top-2 bottom-2 rounded-lg p-2 border-l-4 shadow-[0_2px_6px_rgba(0,0,0,0.03)] cursor-pointer hover:scale-[1.01] hover:shadow-md transition-all z-10 flex flex-col justify-between ${app.colorClass}`}
                                    >
                                      <div>
                                        <p className="text-label-md font-bold truncate">
                                          {app.serviceName}
                                        </p>
                                        <p className="text-[10px] opacity-80 font-medium">
                                          {app.clientName}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Mobile floating FAB action */}
        <button
          onClick={() => setIsAppointmentModalOpen(true)}
          className="md:hidden fixed bottom-20 right-6 z-40 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container p-4 rounded-full shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Responsive Bottom Menu Bar */}
        <BottomNav />
      </div>

      {/* Appointment booking Modal */}
      <NewAppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSave={handleSaveAppointment}
      />

      {/* Client Addition Modal */}
      <AddClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={(client) => console.log("New client saved: ", client)}
      />
    </div>
  );
}
