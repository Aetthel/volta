"use client";

import { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  UserPlus, 
  Euro, 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Plus 
} from "lucide-react";

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
  timeSlot: string;  // e.g., "09:00"
  duration: number;  // in slots (1 slot = 1 hour)
  colorClass: string;
}

export default function DashboardPage() {
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock appointments state
  const [appointments, setAppointments] = useState<AppointmentItem[]>([
    {
      id: "1",
      clientName: "Marco R.",
      serviceName: "Corte Caballero",
      dayIndex: 0,
      timeSlot: "09:00",
      duration: 1,
      colorClass: "bg-primary-container text-on-primary-container border-primary",
    },
    {
      id: "2",
      clientName: "Lucía M.",
      serviceName: "Coloración Premium",
      dayIndex: 1,
      timeSlot: "10:00",
      duration: 1,
      colorClass: "bg-tertiary-container text-on-tertiary-container border-tertiary",
    },
    {
      id: "3",
      clientName: "Elena G.",
      serviceName: "Tratamiento Keratina",
      dayIndex: 2,
      timeSlot: "10:00",
      duration: 1,
      colorClass: "bg-secondary-container text-on-secondary-container border-secondary",
    },
    {
      id: "4",
      clientName: "Carla S.",
      serviceName: "Manicura",
      dayIndex: 3,
      timeSlot: "11:00",
      duration: 1,
      colorClass: "bg-primary-container text-on-primary-container border-primary",
    },
  ]);

  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];
  const weekDays = [
    { name: "LUN", num: 16, current: false },
    { name: "MAR", num: 17, current: false },
    { name: "MIÉ", num: 18, current: true }, // Current active day in mockup
    { name: "JUE", num: 19, current: false },
    { name: "VIE", num: 20, current: false },
    { name: "SÁB", num: 21, current: false },
    { name: "DOM", num: 22, current: false },
  ];

  const handleSaveAppointment = (data: any) => {
    // Parse time index and day index
    const dateObj = new Date(data.date);
    // Standard mock date map
    const day = isNaN(dateObj.getDay()) ? 2 : (dateObj.getDay() + 6) % 7; // Convert to Mon-Sun (0-6)

    const colorClasses = [
      "bg-primary-container text-on-primary-container border-primary",
      "bg-secondary-container text-on-secondary-container border-secondary",
      "bg-tertiary-container text-on-tertiary-container border-tertiary"
    ];
    const randomColor = colorClasses[Math.floor(Math.random() * colorClasses.length)];

    const newApp: AppointmentItem = {
      id: String(Date.now()),
      clientName: data.clientName,
      serviceName: data.service,
      dayIndex: day,
      timeSlot: data.time,
      duration: 1,
      colorClass: randomColor,
    };

    setAppointments((prev) => [...prev, newApp]);
  };

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
        <main className="p-gutter max-w-container-max w-full mx-auto flex-1">
          {/* Quick Metrics Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              title="Citas Hoy"
              value="24"
              change="+12%"
              trend="up"
              icon={<CalendarIcon className="w-5 h-5" />}
            />
            <MetricCard
              title="Nuevos Clientes"
              value="8"
              change="+5%"
              trend="up"
              icon={<UserPlus className="w-5 h-5" />}
            />
            <MetricCard
              title="Ingresos Estimados"
              value="€1,420"
              change="+8%"
              trend="up"
              icon={<Euro className="w-5 h-5" />}
            />
            <MetricCard
              title="Ocupación"
              value="88%"
              change="Estable"
              trend="stable"
              icon={<Activity className="w-5 h-5" />}
            />
          </section>

          {/* Calendar Container */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0px_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
            
            {/* Calendar Header Controls */}
            <div className="px-6 py-4 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <h3 className="font-title-lg text-title-lg text-on-surface font-semibold">
                  Septiembre 2024
                </h3>
                <div className="flex items-center bg-surface-container-low rounded-lg p-1 text-on-surface-variant border border-outline-variant/30">
                  <button className="p-1 hover:bg-surface-variant rounded transition-colors cursor-pointer">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="px-2 text-label-md font-label-md font-semibold cursor-pointer">
                    Hoy
                  </button>
                  <button className="p-1 hover:bg-surface-variant rounded transition-colors cursor-pointer">
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
              <div className="min-w-[800px]">
                
                {/* Weekdays Header Row */}
                <div className="grid grid-cols-[80px_repeat(7,_1fr)] bg-surface-container-low border-b border-outline-variant font-medium select-none">
                  {/* Empty left corner */}
                  <div className="p-4 border-r border-outline-variant"></div>
                  {/* Days */}
                  {weekDays.map((day, idx) => {
                    const isToday = day.current;
                    return (
                      <div 
                        key={idx} 
                        className={`p-4 text-center border-r border-outline-variant ${
                          isToday ? "bg-primary-container/10 text-primary" : "text-on-surface-variant"
                        }`}
                      >
                        <p className={`text-label-md font-label-md ${isToday ? "font-bold" : ""}`}>
                          {day.name}
                        </p>
                        <p className={`text-title-md font-title-md ${isToday ? "font-bold text-lg" : ""}`}>
                          {day.num}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Calendar Body Rows */}
                <div className="relative h-[480px] overflow-y-auto custom-scrollbar">
                  {timeSlots.map((time) => {
                    return (
                      <div key={time} className="grid grid-cols-[80px_repeat(7,_1fr)] h-20 border-b border-outline-variant/60 relative">
                        {/* Time labels column */}
                        <div className="text-center py-3 text-label-md font-label-md text-on-surface-variant border-r border-outline-variant font-semibold select-none flex items-center justify-center bg-surface-container-low/35">
                          {time}
                        </div>

                        {/* 7 Day slots columns */}
                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                          // Filter appointments matching this time and day
                          const cellAppointments = appointments.filter(
                            (app) => app.dayIndex === dayIndex && app.timeSlot === time
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
                        })}
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
