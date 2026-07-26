"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  UserPlus,
  Euro,
  Activity,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Trash2,
  Edit3,
  Clock,
  Check,
  AlertCircle,
  Search,
} from "lucide-react";
import { useSession } from "next-auth/react";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import NewAppointmentModal from "@/components/NewAppointmentModal";
import AddClientModal from "@/components/AddClientModal";
import {
  Button,
  Card,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  PageHeader,
  Skeleton,
  InlineSelect,
} from "@/components/ui/volta-ui";

// Interface for calendar appointment item
interface AppointmentItem {
  id: string;
  clientName: string;
  serviceName: string;
  dayIndex: number; // 0: Mon, 1: Tue, etc.
  timeSlot: string; // e.g., "09:00"
  duration: number; // in slots (1 slot = 1 hour)
  colorClass: string;
  dateObj?: Date;
  stylistName?: string;
  workerId?: string;
}

const defaultServiceDurations: Record<string, number> = {
  "Corte Caballero": 30,
  "Corte Dama": 45,
  "Coloración Premium": 90,
  "Tratamiento Keratina": 60,
  Manicura: 30,
  "Spa Facial": 45,
};

function calculateOverlaps(dayApps: any[], serviceDurations: Record<string, number>) {
  if (dayApps.length === 0) return [];

  // 1. Calculate top and height for each appointment
  const apps = dayApps.map((app) => {
    const date = new Date(app.dateObj);
    let h = date.getHours();
    let m = date.getMinutes();

    // Clamp hours to calendar range: 09:00 to 21:00
    if (h < 9) {
      h = 9;
      m = 0;
    } else if (h >= 21) {
      h = 20;
      m = 59;
    }

    // Total minutes since 09:00
    const startMinutes = (h - 9) * 60 + m;
    const duration = serviceDurations[app.serviceName] || 45;

    // Clamp endMinutes to calendar max (21:00 is 12 hours * 60 mins = 720 mins from 09:00)
    const endMinutes = Math.min(720, startMinutes + duration);
    const finalDuration = endMinutes - startMinutes;

    const top = startMinutes * 1.5; // 1 hour = 90px (h-20 = 5rem = 90px), 1 min = 1.5px
    const height = Math.max(32, finalDuration * 1.5); // Min height of 32px

    const formattedTime = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")} (${duration} min)`;

    return {
      ...app,
      top,
      height,
      endTop: top + height,
      formattedTime,
    };
  });

  // Sort appointments by top (start time)
  apps.sort((a, b) => a.top - b.top);

  // 2. Group into independent clusters
  const clusters: any[][] = [];
  let currentCluster: any[] = [];
  let currentClusterEndTop = 0;

  for (const app of apps) {
    if (currentCluster.length === 0) {
      currentCluster.push(app);
      currentClusterEndTop = app.endTop;
    } else if (app.top >= currentClusterEndTop) {
      // No overlap with the active cluster, push the old one and start a new one
      clusters.push(currentCluster);
      currentCluster = [app];
      currentClusterEndTop = app.endTop;
    } else {
      // Overlaps with the active cluster, add to it and expand the end boundary if needed
      currentCluster.push(app);
      currentClusterEndTop = Math.max(currentClusterEndTop, app.endTop);
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  // 3. For each cluster, distribute into columns and calculate positions
  const positionedApps: any[] = [];

  for (const cluster of clusters) {
    const columns: any[][] = [];

    for (const app of cluster) {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const lastApp = columns[i][columns[i].length - 1];
        if (app.top >= lastApp.endTop) {
          columns[i].push(app);
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([app]);
      }
    }

    const numCols = columns.length;
    for (let colIdx = 0; colIdx < numCols; colIdx++) {
      for (const app of columns[colIdx]) {
        // Calculate how many columns to the right this app can expand into
        let colspan = 1;
        for (let c = colIdx + 1; c < numCols; c++) {
          // Check if there is any collision with apps in column 'c' during this app's duration
          const hasCollision = columns[c].some((otherApp) => {
            return !(app.endTop <= otherApp.top || app.top >= otherApp.endTop);
          });
          if (hasCollision) {
            break;
          }
          colspan++;
        }

        // Calculate left position and width with a 30% overlap factor (numCols + 0.3)
        let left = 0;
        let width = 100;
        if (numCols > 1) {
          const step = 100 / (numCols + 0.3);
          left = colIdx * step;
          width = colspan * step + step * 0.3;
        }

        positionedApps.push({
          ...app,
          width: width,
          left: left,
          colspan: colspan,
        });
      }
    }
  }

  return positionedApps;
}

const getWeekDates = (anchorDate: Date) => {
  const currentDay = anchorDate.getDay(); // 0: Sun, 1: Mon, etc.
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(anchorDate);
  monday.setDate(anchorDate.getDate() + distanceToMonday);

  const days = [];
  const dayNames = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    days.push({
      name: dayNames[i],
      num: date.getDate(),
      dateString: date.toISOString().split("T")[0],
      current: date.toDateString() === today.toDateString(),
      closed: i === 6, // Sunday is closed
      fullDate: date,
    });
  }
  return days;
};

const COLOR_CLASSES = [
  // 0: Turquesa (Cortes / Estilo)
  "bg-teal-500/15 text-teal-950 dark:bg-teal-950/50 dark:text-teal-100 font-semibold shadow-xs border border-teal-500/20",
  // 1: Violeta (Coloración / Tintes)
  "bg-purple-500/15 text-purple-950 dark:bg-purple-950/50 dark:text-purple-100 font-semibold shadow-xs border border-purple-500/20",
  // 2: Rosa (Manicura / Spa / Belleza)
  "bg-rose-500/15 text-rose-950 dark:bg-rose-950/50 dark:text-rose-100 font-semibold shadow-xs border border-rose-500/20",
  // 3: Ámbar (Tratamientos / Keratina)
  "bg-amber-500/15 text-amber-950 dark:bg-amber-950/50 dark:text-amber-100 font-semibold shadow-xs border border-amber-500/20",
  // 4: Índigo (Barbería / General)
  "bg-indigo-500/15 text-indigo-950 dark:bg-indigo-950/50 dark:text-indigo-100 font-semibold shadow-xs border border-indigo-500/20",
  // 5: Esmeralda (Facial / Masajes)
  "bg-emerald-500/15 text-emerald-950 dark:bg-emerald-950/50 dark:text-emerald-100 font-semibold shadow-xs border border-emerald-500/20",
  // 6: Azul Cielo (Depilación / Otros)
  "bg-sky-500/15 text-sky-950 dark:bg-sky-950/50 dark:text-sky-100 font-semibold shadow-xs border border-sky-500/20",
];

export default function AgendaPage() {
  const { data: session } = useSession();
  const businessId = session?.user?.businessId || "";

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [appointmentModalTriggerRect, setAppointmentModalTriggerRect] = useState<DOMRect | null>(
    null
  );
  const [clientModalTriggerRect, setClientModalTriggerRect] = useState<DOMRect | null>(null);

  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [nowDate, setNowDate] = useState<Date | null>(null);
  const [hoverGuide, setHoverGuide] = useState<{
    dayIndex: number;
    timeString: string;
    top: number;
  } | null>(null);

  const [prefilledDate, setPrefilledDate] = useState<string>("");
  const [prefilledTime, setPrefilledTime] = useState<string>("");

  const [weekAnchorDate, setWeekAnchorDate] = useState<Date>(new Date());

  const [services, setServices] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("all");

  const [draggedAppt, setDraggedAppt] = useState<AppointmentItem | null>(null);
  const [dragOverDayIndex, setDragOverDayIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<{ show: boolean; text: string; type: "success" | "error" }>({
    show: false,
    text: "",
    type: "success",
  });

  const mapDbAppointments = useCallback(
    (dbApps: any[], currentWorkers: any[] = []) => {
      const weekDates = getWeekDates(weekAnchorDate);
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

          const hoursVal = dateObj.getHours();
          const minsVal = dateObj.getMinutes();
          const timeSlot = `${hoursVal.toString().padStart(2, "0")}:${minsVal.toString().padStart(2, "0")}`;

          const service = app.serviceName || app.client?.frequentService || "Servicio General";
          let hash = 0;
          for (let i = 0; i < service.length; i++) {
            hash = service.charCodeAt(i) + ((hash << 5) - hash);
          }
          const colorClass = COLOR_CLASSES[Math.abs(hash) % COLOR_CLASSES.length];

          // Stylist assignment (falls back to static names for Luxe Salon)
          let stylistName = "Todos";
          let workerId = "all";
          if (currentWorkers.length > 0) {
            const w = currentWorkers[Math.abs(hash) % currentWorkers.length];
            stylistName = w.name;
            workerId = w.id;
          } else {
            const staticStylists = [
              { name: "Ana García", id: "1" },
              { name: "Marta Ruiz", id: "2" },
            ];
            const st = staticStylists[Math.abs(hash) % staticStylists.length];
            stylistName = st.name;
            workerId = st.id;
          }

          return {
            id: app.id,
            clientName: app.clientName,
            serviceName: service,
            dayIndex: day,
            timeSlot: timeSlot,
            duration: 1,
            colorClass: colorClass,
            dateObj: dateObj,
            stylistName,
            workerId,
          };
        });
    },
    [weekAnchorDate]
  );

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
      .then(([usersData, appsData, clientsData, servicesData]) => {
        const activeWorkers = Array.isArray(usersData) ? usersData : [];
        setWorkers(activeWorkers);

        if (Array.isArray(appsData)) {
          setAppointments(mapDbAppointments(appsData, activeWorkers));
        }
        if (Array.isArray(clientsData)) {
          setClients(clientsData);
        }
        if (Array.isArray(servicesData) && servicesData.length > 0) {
          setServices(servicesData);
        }
      })
      .catch((e) => {
        console.error("Error fetching dashboard data:", e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [businessId, mapDbAppointments]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, weekAnchorDate]);

  useEffect(() => {
    if (session?.user?.name) {
      document.title = `Agenda - ${session.user.name} - Volta`;
    }
  }, [session]);

  const handlePrev = () => {
    if (viewMode === "week") {
      setWeekAnchorDate((prev) => {
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() - 7);
        return newDate;
      });
    } else {
      setSelectedDayIndex((prev) => {
        if (prev === 0) {
          setWeekAnchorDate((anchor) => {
            const newAnchor = new Date(anchor);
            newAnchor.setDate(anchor.getDate() - 7);
            return newAnchor;
          });
          return 6;
        }
        return prev - 1;
      });
    }
  };

  const handleNext = () => {
    if (viewMode === "week") {
      setWeekAnchorDate((prev) => {
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() + 7);
        return newDate;
      });
    } else {
      setSelectedDayIndex((prev) => {
        if (prev === 6) {
          setWeekAnchorDate((anchor) => {
            const newAnchor = new Date(anchor);
            newAnchor.setDate(anchor.getDate() + 7);
            return newAnchor;
          });
          return 0;
        }
        return prev + 1;
      });
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const todayDayIndex = (new Date().getDay() + 6) % 7;
    setSelectedDayIndex(todayDayIndex);
  }, []);

  // Set up clock update interval for current time red line
  useEffect(() => {
    setNowDate(new Date());
    const interval = setInterval(() => {
      setNowDate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Smooth scroll to current time or first appointment on mount
  useEffect(() => {
    if (isMounted && scrollContainerRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();

      // Filter appointments for the selected day
      const todayApps = appointments.filter((app) => app.dayIndex === selectedDayIndex);
      let targetScrollTop = 0;

      if (todayApps.length > 0) {
        // Find top position of the earliest appointment
        const earliestTop = Math.min(
          ...todayApps.map((app) => {
            const date = new Date(app.dateObj || "");
            const h = date.getHours();
            const m = date.getMinutes();
            return Math.max(0, (h - 9) * 60 + m) * 1.5;
          })
        );
        targetScrollTop = Math.max(0, earliestTop - 60); // Scroll to 60px above earliest
      } else if (currentHour >= 9 && currentHour < 21) {
        // Center the current time indicator line
        const currentMinutesSinceStart = (currentHour - 9) * 60 + currentMin;
        targetScrollTop = Math.max(0, currentMinutesSinceStart * 1.5 - 150);
      } else {
        // Default start position slightly scrolled (e.g. 30px)
        targetScrollTop = 30;
      }

      scrollContainerRef.current.scrollTo({
        top: targetScrollTop,
        behavior: "smooth",
      });
    }
  }, [isMounted, appointments, selectedDayIndex]);

  const renderGlobalTimeLine = () => {
    if (!nowDate || !isMounted) return null;

    // Check if current day of week is visible on screen
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const isTodayVisible = weekDays.some((day) => day.dateString === todayStr);

    if (!isTodayVisible) return null;

    const currentHour = today.getHours();
    const currentMin = today.getMinutes();

    if (currentHour < 9 || currentHour >= 21) return null;

    const totalMinutes = (currentHour - 9) * 60 + currentMin;
    const topPx = totalMinutes * 1.5;

    return (
      <div
        style={{ top: `${topPx}px` }}
        className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
      >
        {/* Red circle dot right at the left axis of the columns */}
        <div className="w-2.5 h-2.5 rounded-full bg-red-600 absolute -left-[5px] shadow-[0_0_6px_rgba(220,38,38,0.6)]" />
        {/* Red line */}
        <div className="w-full h-[1.5px] bg-red-600/80" />
      </div>
    );
  };

  const handleGridClick = (dayIdx: number, topPx: number, e?: React.MouseEvent) => {
    const totalMinutes = Math.round(topPx / 1.5);
    const hour = 9 + Math.floor(totalMinutes / 60);
    const minute = Math.round((totalMinutes % 60) / 5) * 5;

    let finalHour = hour;
    let finalMin = minute;
    if (finalMin === 60) {
      finalHour += 1;
      finalMin = 0;
    }

    const timeString = `${finalHour.toString().padStart(2, "0")}:${finalMin.toString().padStart(2, "0")}`;
    const dateString = weekDays[dayIdx]?.dateString || new Date().toISOString().split("T")[0];

    setPrefilledDate(dateString);
    setPrefilledTime(timeString);
    setHoverGuide({
      dayIndex: dayIdx,
      timeString: timeString,
      top: topPx,
    });
    if (e) {
      setAppointmentModalTriggerRect({
        left: e.clientX,
        top: e.clientY,
        right: e.clientX,
        bottom: e.clientY,
        width: 0,
        height: 0,
      } as DOMRect);
    } else {
      setAppointmentModalTriggerRect(null);
    }
    setIsAppointmentModalOpen(true);
  };

  const handleGoToday = () => {
    const today = new Date();
    setWeekAnchorDate(today);
    const todayDayIndex = (today.getDay() + 6) % 7;
    setSelectedDayIndex(todayDayIndex);
  };

  const timeSlots = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];
  const weekDays = getWeekDates(weekAnchorDate);

  const handleSaveAppointment = (data: any) => {
    fetchDashboardData();
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
      .then(() => {
        fetchDashboardData();
      })
      .catch((err) => console.error("Error deleting appointment:", err));
  };

  const handleUpdateAppointmentStatus = (id: string, status: "PENDING" | "SENT" | "ERROR") => {
    fetch(`/api/backend/appointments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error updating appointment status");
        return res.json();
      })
      .then(() => {
        fetchDashboardData();
      })
      .catch((err) => console.error("Error updating status:", err));
  };

  const handleDropReschedule = (appointmentId: string, dayIdx: number, targetTimeStr: string) => {
    const targetDay = weekDays[dayIdx];
    if (!targetDay) return;

    const [hours, minutes] = targetTimeStr.split(":").map(Number);
    const newDate = new Date(targetDay.fullDate);
    newDate.setHours(hours, minutes, 0, 0);

    const isoDate = newDate.toISOString();

    // Optimistic update locally
    setAppointments((prev) =>
      prev.map((app) =>
        app.id === appointmentId
          ? { ...app, dayIndex: dayIdx, timeSlot: targetTimeStr, dateObj: newDate }
          : app
      )
    );

    fetch(`/api/backend/appointments/${appointmentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentDate: isoDate }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.error || "No se pudo mover la cita");
          });
        }
        return res.json();
      })
      .then(() => {
        setToast({
          show: true,
          text: `Cita reprogramada a ${targetDay.name} ${targetDay.num} a las ${targetTimeStr}`,
          type: "success",
        });
        setTimeout(() => setToast({ show: false, text: "", type: "success" }), 4000);
        fetchDashboardData();
      })
      .catch((err) => {
        setToast({ show: true, text: err.message || "Error al mover la cita", type: "error" });
        setTimeout(() => setToast({ show: false, text: "", type: "error" }), 4000);
        fetchDashboardData(); // Revert local optimistic change on error
      });
  };

  const handleDragStart = (e: React.DragEvent, app: AppointmentItem) => {
    e.dataTransfer.setData("application/json", JSON.stringify(app));
    e.dataTransfer.effectAllowed = "move";
    setDraggedAppt(app);
  };

  const handleDragEnd = () => {
    setDraggedAppt(null);
    setDragOverDayIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, dayIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverDayIndex !== dayIdx) {
      setDragOverDayIndex(dayIdx);
    }
  };

  const handleDrop = (e: React.DragEvent, dayIdx: number) => {
    e.preventDefault();
    setDragOverDayIndex(null);

    try {
      const rawData = e.dataTransfer.getData("application/json");
      const app = rawData ? JSON.parse(rawData) : draggedAppt;
      setDraggedAppt(null); // Instantly restore normal card opacity upon drop
      if (!app || !app.id) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const totalMinutes = Math.round(y / 1.5);
      let hour = 9 + Math.floor(totalMinutes / 60);
      let minute = Math.round((totalMinutes % 60) / 15) * 15;

      if (minute === 60) {
        hour += 1;
        minute = 0;
      }

      if (hour < 9) hour = 9;
      if (hour > 20) hour = 20;

      const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      handleDropReschedule(app.id, dayIdx, timeStr);
    } catch (err) {
      setDraggedAppt(null);
      console.error("Drop error:", err);
    }
  };

  // Dynamic stats calculation
  const appointmentsTodayCount = appointments.filter(
    (app) => app.dayIndex === selectedDayIndex
  ).length;

  const newClientsCount = clients.filter((c) => {
    const createdDate = new Date(c.createdAt);
    const diffTime = Math.abs(new Date().getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30; // registered in the last 30 days
  }).length;

  const dynamicDurations: Record<string, number> = {
    ...defaultServiceDurations,
    ...services.reduce(
      (acc, s) => {
        acc[s.name] = s.duration;
        return acc;
      },
      {} as Record<string, number>
    ),
  };

  const dynamicPrices: Record<string, number> = {
    "Corte Caballero": 35,
    "Corte Dama": 45,
    "Coloración Premium": 85,
    "Tratamiento Keratina": 50,
    Manicura: 20,
    "Spa Facial": 40,
    ...services.reduce(
      (acc, s) => {
        acc[s.name] = s.price;
        return acc;
      },
      {} as Record<string, number>
    ),
  };

  const estimatedIncome = appointments
    .filter((app) => app.dayIndex === selectedDayIndex)
    .reduce((acc, app) => acc + (dynamicPrices[app.serviceName] || 35), 0);

  const occupiedSlots = new Set(
    appointments.filter((app) => app.dayIndex === selectedDayIndex).map((app) => app.timeSlot)
  ).size;
  const occupancyPercentage =
    timeSlots.length > 0 ? Math.round((occupiedSlots / timeSlots.length) * 100) : 0;

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
  const displayedDate = weekDays[3]?.fullDate || new Date();
  const currentMonthYear = `${monthNames[displayedDate.getMonth()]} ${displayedDate.getFullYear()}`;

  const todayStr = new Date().toISOString().split("T")[0];
  const isViewingToday =
    viewMode === "week"
      ? weekDays.some((day) => day.dateString === todayStr)
      : weekDays[selectedDayIndex]?.dateString === todayStr;

  const gridColsClass =
    viewMode === "week" ? "grid-cols-[80px_repeat(7,_1fr)]" : "grid-cols-[80px_1fr]";
  const minWidthClass = viewMode === "week" ? "min-w-[800px]" : "min-w-0 w-full";

  // Calculate active and next appointments for today to assign colors
  const now = nowDate || new Date();
  const nowMs = now.getTime();

  // Find all appointments for the current real-world date
  const todayApps = appointments.filter((app) => {
    if (!app.dateObj) return false;
    const dateStr = new Date(app.dateObj).toISOString().split("T")[0];
    return dateStr === todayStr;
  });

  let activeAppId: string | null = null;
  let nextAppId: string | null = null;

  // Find if there is an appointment active right now
  const activeApp = todayApps.find((app) => {
    if (!app.dateObj) return false;
    const startTime = new Date(app.dateObj).getTime();
    const duration = dynamicDurations[app.serviceName] || 45;
    const endTime = startTime + duration * 60000;
    return nowMs >= startTime && nowMs <= endTime;
  });

  if (activeApp) {
    activeAppId = activeApp.id;
  } else {
    // If none are active, find the next upcoming one today
    const upcomingApps = todayApps
      .filter((app) => {
        if (!app.dateObj) return false;
        const startTime = new Date(app.dateObj).getTime();
        return startTime > nowMs;
      })
      .sort((a, b) => new Date(a.dateObj || "").getTime() - new Date(b.dateObj || "").getTime());

    if (upcomingApps.length > 0) {
      nextAppId = upcomingApps[0].id;
    }
  }

  const workerOptions = [
    { value: "all", label: "Todos los Estilistas" },
    ...workers.map((w: any) => ({ value: w.id, label: w.name })),
  ];

  return (
    <div className="h-screen bg-surface flex flex-col md:flex-row overflow-hidden pb-16 md:pb-0">
      {/* Sidebar Navigation */}
      <Sidebar
        onNewAppointmentClick={(e) => {
          setAppointmentModalTriggerRect(e ? e.currentTarget.getBoundingClientRect() : null);
          setIsAppointmentModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden md:ml-[240px]">
        {/* Floating Toast Notification */}
        {toast.show && (
          <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div
              className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-label-md font-medium ${
                toast.type === "success"
                  ? "bg-secondary-container text-on-secondary-container border border-secondary/30"
                  : "bg-error-container text-on-error-container border border-error/30"
              }`}
            >
              {toast.type === "success" ? (
                <Check className="w-5 h-5 text-primary" />
              ) : (
                <AlertCircle className="w-5 h-5 text-error" />
              )}
              <span>{toast.text}</span>
            </div>
          </div>
        )}
        <main className="flex-1 overflow-hidden flex flex-col min-h-0 w-full h-full bg-surface">
          {/* Calendar Header Controls — Luxe Salon style */}
          <div className="px-6 py-3 border-b border-outline-variant flex items-center justify-between gap-3 bg-surface">
            {/* Left: Month + week navigation */}
            <div className="flex items-center gap-3">
              <span className="text-on-surface-variant text-label-lg font-medium whitespace-nowrap">
                {currentMonthYear}
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrev}
                  className="p-1.5 rounded-lg w-8 h-8 text-on-surface-variant hover:bg-surface-variant active:scale-[0.97]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {/* Week range pill */}
                <span className="px-3 py-1 rounded-full border border-outline-variant text-label-md font-medium text-on-surface bg-surface-container-low whitespace-nowrap select-none">
                  {viewMode === "week"
                    ? `${weekDays[0]?.name} ${weekDays[0]?.num} — ${weekDays[6]?.name} ${weekDays[6]?.num}`
                    : `${weekDays[selectedDayIndex]?.name} ${weekDays[selectedDayIndex]?.num}`}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  className="p-1.5 rounded-lg w-8 h-8 text-on-surface-variant hover:bg-surface-variant active:scale-[0.97]"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Hoy outline button */}
              {!isViewingToday && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGoToday}
                  className="px-3 py-1 h-8 rounded-full border-primary text-primary text-label-md font-medium hover:bg-primary-container/20 active:scale-[0.97]"
                >
                  Hoy
                </Button>
              )}
            </div>

            {/* Right: Stylist dropdown + view switcher + actions */}
            <div className="flex items-center gap-2">
              {/* Stylist selector */}
              <InlineSelect
                id="stylist-selector"
                label="Estilistas..."
                value={selectedWorkerId}
                onChange={(val) => setSelectedWorkerId(val)}
                options={workerOptions}
                size="sm"
                className="w-44"
              />

              {/* Week / Day toggle */}
              <div className="flex rounded-lg overflow-hidden border border-outline-variant bg-surface-container-low p-[2px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("week")}
                  className={`px-3 py-1 h-7 rounded-md text-label-sm font-medium transition-all shadow-none active:scale-100 ${
                    viewMode === "week"
                      ? "bg-secondary-container text-on-secondary-container shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-variant"
                  }`}
                >
                  Semana
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("day")}
                  className={`px-3 py-1 h-7 rounded-md text-label-sm font-medium transition-all shadow-none active:scale-100 ${
                    viewMode === "day"
                      ? "bg-secondary-container text-on-secondary-container shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-variant"
                  }`}
                >
                  Día
                </Button>
              </div>
            </div>
          </div>
          {/* Calendar Calendar Content */}
          <div className="overflow-x-auto custom-scrollbar flex-1 flex flex-col min-h-0 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-surface/70 backdrop-blur-[1px] z-30 flex items-center justify-center select-none pointer-events-auto">
                <div className="flex flex-col items-center gap-2.5">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-body-sm font-semibold text-primary animate-pulse">
                    Cargando agenda...
                  </span>
                </div>
              </div>
            )}
            <div className={`${minWidthClass} flex-1 flex flex-col min-h-0`}>
              {/* Main Scroll Container containing both Header and Body */}
              <div
                ref={scrollContainerRef}
                className="relative flex-1 overflow-y-auto custom-scrollbar min-h-0"
              >
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
                            className={`py-3 px-2 text-center border-r border-outline-variant cursor-pointer hover:bg-surface-variant/40 transition-colors relative ${
                              isToday
                                ? "bg-surface"
                                : day.closed
                                  ? "bg-error-container/10"
                                  : "bg-surface-container-low"
                            }`}
                          >
                            <p
                              className={`text-label-sm font-semibold uppercase tracking-wide mb-1 ${
                                isToday
                                  ? "text-primary"
                                  : day.closed
                                    ? "text-error/70"
                                    : "text-on-surface-variant"
                              }`}
                            >
                              {day.name}
                            </p>
                            {/* Day number — circle for today */}
                            <div
                              className={`w-8 h-8 flex items-center justify-center mx-auto rounded-full text-body-md font-bold transition-all ${
                                isToday
                                  ? "bg-primary text-on-primary"
                                  : day.closed
                                    ? "text-error"
                                    : "text-on-surface"
                              }`}
                            >
                              {day.num}
                            </div>
                            {/* Teal bottom accent for today */}
                            {isToday && (
                              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
                            )}
                          </div>
                        );
                      })
                    : (() => {
                        const day = weekDays[selectedDayIndex];
                        const isToday = isMounted && day.current;
                        return (
                          <div
                            className={`py-3 px-2 text-center border-r border-outline-variant relative ${
                              isToday
                                ? "bg-surface"
                                : day.closed
                                  ? "bg-error-container/10"
                                  : "bg-surface-container-low"
                            }`}
                          >
                            <p
                              className={`text-label-sm font-semibold uppercase tracking-wide mb-1 ${
                                isToday
                                  ? "text-primary"
                                  : day.closed
                                    ? "text-error/70"
                                    : "text-on-surface-variant"
                              }`}
                            >
                              {day.name}
                            </p>
                            <div
                              className={`w-8 h-8 flex items-center justify-center mx-auto rounded-full text-body-md font-bold ${
                                isToday
                                  ? "bg-primary text-on-primary"
                                  : day.closed
                                    ? "text-error"
                                    : "text-on-surface"
                              }`}
                            >
                              {day.num}
                            </div>
                            {isToday && (
                              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
                            )}
                          </div>
                        );
                      })()}
                </div>

                {/* Calendar Grid Container (Relative to contain the absolute overlay) */}
                <div className="relative" style={{ minHeight: `${timeSlots.length * 90}px` }}>
                  {/* Calendar Body Rows */}
                  {timeSlots.map((time) => {
                    return (
                      <div
                        key={time}
                        className={`grid ${gridColsClass} h-[90px] border-b border-outline-variant/60 relative`}
                      >
                        {/* Time labels column */}
                        <div className="text-center pt-1 text-label-md font-label-md text-on-surface-variant border-r border-outline-variant font-semibold select-none flex items-start justify-center bg-surface-container-low/35 h-[90px]">
                          {time}
                        </div>

                        {/* Day slots columns (empty now, just borders with subdivision guides) */}
                        {viewMode === "week" ? (
                          Array.from({ length: 7 }).map((_, dayIndex) => (
                            <div
                              key={dayIndex}
                              className="border-r border-outline-variant/60 relative"
                            >
                              {/* Sub-hour horizontal guides */}
                              <div className="absolute top-[22.5px] left-0 right-0 border-t border-dashed border-outline-variant/20 pointer-events-none" />
                              <div className="absolute top-[45px] left-0 right-0 border-t border-dashed border-outline-variant/35 pointer-events-none" />
                              <div className="absolute top-[67.5px] left-0 right-0 border-t border-dashed border-outline-variant/20 pointer-events-none" />
                            </div>
                          ))
                        ) : (
                          <div className="border-r border-outline-variant/60 relative">
                            {/* Sub-hour horizontal guides */}
                            <div className="absolute top-[22.5px] left-0 right-0 border-t border-dashed border-outline-variant/20 pointer-events-none" />
                            <div className="absolute top-[45px] left-0 right-0 border-t border-dashed border-outline-variant/35 pointer-events-none" />
                            <div className="absolute top-[67.5px] left-0 right-0 border-t border-dashed border-outline-variant/20 pointer-events-none" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Appointments Overlay Container */}
                  <div
                    className={`absolute inset-y-0 left-[80px] right-0 grid ${viewMode === "week" ? "grid-cols-7" : "grid-cols-1"}`}
                    onMouseMove={(e) => {
                      if (isAppointmentModalOpen) return; // Freeze guide line while modal is open

                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;

                      // Calculate day index based on column width
                      const colWidth = rect.width / (viewMode === "week" ? 7 : 1);
                      const hoveredColIdx = Math.floor(x / colWidth);
                      const actualDayIndex = viewMode === "week" ? hoveredColIdx : selectedDayIndex;

                      // Calculate time
                      const totalMinutes = Math.round(y / 1.5);
                      const hour = 9 + Math.floor(totalMinutes / 60);
                      const minute = Math.round((totalMinutes % 60) / 5) * 5;

                      let finalHour = hour;
                      let finalMin = minute;
                      if (finalMin === 60) {
                        finalHour += 1;
                        finalMin = 0;
                      }

                      // Clamp bounds
                      if (finalHour >= 9 && finalHour <= 21) {
                        const timeStr = `${finalHour.toString().padStart(2, "0")}:${finalMin.toString().padStart(2, "0")}`;
                        const roundedMinutes = (finalHour - 9) * 60 + finalMin;

                        setHoverGuide({
                          dayIndex: actualDayIndex,
                          timeString: timeStr,
                          top: roundedMinutes * 1.5,
                        });
                      } else {
                        setHoverGuide(null);
                      }
                    }}
                    onMouseLeave={() => {
                      if (isAppointmentModalOpen) return;
                      setHoverGuide(null);
                    }}
                    onClick={(e) => {
                      if (hoverGuide) {
                        handleGridClick(hoverGuide.dayIndex, hoverGuide.top, e);
                      }
                    }}
                  >
                    {/* Global current-time red line spanning all columns */}
                    <div
                      className={`absolute inset-y-0 left-0 right-0 pointer-events-none z-30 col-span-full`}
                      style={{ gridColumn: "1 / -1" }}
                    >
                      {renderGlobalTimeLine()}
                    </div>
                    {Array.from({ length: viewMode === "week" ? 7 : 1 }).map((_, dayIndex) => {
                      const actualDayIndex = viewMode === "week" ? dayIndex : selectedDayIndex;
                      const dayAppointments = appointments.filter(
                        (app) =>
                          app.dayIndex === actualDayIndex &&
                          (selectedWorkerId === "all" || app.workerId === selectedWorkerId) &&
                          (searchQuery === "" ||
                            app.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            app.serviceName.toLowerCase().includes(searchQuery.toLowerCase()))
                      );

                      const positionedApps = calculateOverlaps(dayAppointments, dynamicDurations);
                      const isColHovered = hoverGuide && hoverGuide.dayIndex === actualDayIndex;

                      return (
                        <div
                          key={dayIndex}
                          onDragOver={(e) => handleDragOver(e, actualDayIndex)}
                          onDragLeave={() => setDragOverDayIndex(null)}
                          onDrop={(e) => handleDrop(e, actualDayIndex)}
                          className={`relative h-full border-r border-outline-variant/60 pointer-events-auto transition-colors duration-150 ${
                            dragOverDayIndex === actualDayIndex
                              ? "bg-primary/10 border-primary ring-2 ring-primary/30"
                              : ""
                          }`}
                        >
                          {/* Hover & Locked Guide Line */}
                          {isColHovered && hoverGuide && (
                            <div
                              style={{ top: `${hoverGuide.top}px` }}
                              className="absolute left-0 right-0 z-25 border-t-2 border-primary/30 pointer-events-none flex items-center"
                            >
                              <span className="bg-primary text-on-primary text-[9px] font-bold px-1.5 py-0.5 rounded shadow absolute left-1 -translate-y-1/2">
                                {hoverGuide.timeString}
                              </span>
                            </div>
                          )}

                          {positionedApps.map((app) => {
                            const isActive = app.id === activeAppId;
                            const isNext = app.id === nextAppId;
                            const isBeingDragged = draggedAppt?.id === app.id;

                            const isShort = app.height <= 45;
                            const cardPadding = isShort ? "py-[2px] px-2" : "py-2 px-3";
                            const cardRounded = isShort ? "rounded-[4px]" : "rounded-[6px]";
                            const justifyClass = isShort ? "justify-center" : "justify-start";

                            const serviceTextClass = isShort
                              ? "text-[11.5px] font-bold leading-none"
                              : "text-label-lg font-semibold";
                            const clientTextClass = isShort
                              ? "text-[10px] font-medium leading-none"
                              : "text-body-sm font-medium";

                            // Clean solid card highlights (Google Calendar vibe)
                            const activeClasses = isActive
                              ? "ring-2 ring-primary ring-offset-1 z-15 shadow-[0_3px_12px_rgba(55,126,127,0.2)]"
                              : isNext
                                ? "ring-1 ring-primary/60 ring-offset-1 z-12 shadow-[0_2px_8px_rgba(55,126,127,0.1)]"
                                : "shadow-[0_1px_3px_rgba(0,0,0,0.02)]";

                            return (
                              <ContextMenu key={app.id}>
                                <ContextMenuTrigger
                                  as="div"
                                  draggable={true}
                                  onDragStart={(e) => handleDragStart(e, app)}
                                  onDragEnd={handleDragEnd}
                                  style={{
                                    position: "absolute",
                                    top: `${app.top}px`,
                                    height: `${app.height}px`,
                                    width: `calc(${app.width}% - 8px)`,
                                    left: `calc(${app.left}% + 4px)`,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent creating a new appointment
                                  }}
                                  className={`${cardRounded} ${cardPadding} ${app.colorClass} ${activeClasses} ${
                                    isBeingDragged ? "opacity-30 border-dashed border-2 border-primary scale-95" : ""
                                  } cursor-grab active:cursor-grabbing hover:scale-[1.03] hover:z-30 hover:shadow-lg transition-transform transition-shadow duration-150 flex flex-col ${justifyClass} pointer-events-auto overflow-hidden`}
                                >
                                  {isShort ? (
                                    <div className="flex items-center gap-1.5 min-w-0 select-none">
                                      <span className={`${serviceTextClass} truncate shrink-0`}>
                                        {app.serviceName}
                                      </span>
                                      <span className={`${clientTextClass} opacity-85 truncate`}>
                                        - {app.clientName}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="min-w-0 flex flex-col gap-0.5">
                                      <p className={`${serviceTextClass} truncate`}>
                                        {app.serviceName}
                                      </p>
                                      <p className={`${clientTextClass} opacity-85 truncate`}>
                                        {app.clientName}
                                      </p>
                                    </div>
                                  )}
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                  <ContextMenuItem
                                    onClick={() => {
                                      if (app.dateObj) {
                                        const dateStr = app.dateObj.toISOString().split("T")[0];
                                        const h = app.dateObj
                                          .getHours()
                                          .toString()
                                          .padStart(2, "0");
                                        const m = app.dateObj
                                          .getMinutes()
                                          .toString()
                                          .padStart(2, "0");
                                        setPrefilledDate(dateStr);
                                        setPrefilledTime(`${h}:${m}`);
                                        setIsAppointmentModalOpen(true);
                                      }
                                    }}
                                  >
                                    <Edit3 className="w-4 h-4 text-primary" />
                                    <span>Editar/Ver cita</span>
                                  </ContextMenuItem>

                                  <ContextMenuSeparator />

                                  <ContextMenuItem
                                    onClick={() => handleUpdateAppointmentStatus(app.id, "PENDING")}
                                  >
                                    <Clock className="w-4 h-4 text-error" />
                                    <span>Marcar Pendiente</span>
                                  </ContextMenuItem>

                                  <ContextMenuItem
                                    onClick={() => handleUpdateAppointmentStatus(app.id, "SENT")}
                                  >
                                    <Check className="w-4 h-4 text-primary" />
                                    <span>Marcar Enviada</span>
                                  </ContextMenuItem>

                                  <ContextMenuItem
                                    onClick={() => handleUpdateAppointmentStatus(app.id, "ERROR")}
                                  >
                                    <AlertCircle className="w-4 h-4 text-error" />
                                    <span>Marcar con Error</span>
                                  </ContextMenuItem>

                                  <ContextMenuSeparator />

                                  <ContextMenuItem
                                    variant="error"
                                    onClick={() => handleDeleteAppointment(app.id)}
                                  >
                                    <Trash2 className="w-4 h-4 text-error" />
                                    <span>Eliminar cita</span>
                                  </ContextMenuItem>
                                </ContextMenuContent>
                              </ContextMenu>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile floating FAB action */}
        <Button
          variant="primary"
          onClick={(e) => {
            setAppointmentModalTriggerRect(e.currentTarget.getBoundingClientRect());
            setIsAppointmentModalOpen(true);
          }}
          className="md:hidden fixed bottom-20 right-6 z-40 p-4 rounded-full shadow-lg active:scale-95"
        >
          <Plus data-icon="plus" />
        </Button>

        {/* Responsive Bottom Menu Bar */}
        <BottomNav />
      </div>

      {/* Appointment booking Modal */}
      <NewAppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => {
          setIsAppointmentModalOpen(false);
          setHoverGuide(null);
        }}
        onSave={handleSaveAppointment}
        initialDate={prefilledDate}
        initialTime={prefilledTime}
        triggerRect={appointmentModalTriggerRect}
      />

      {/* Client Addition Modal */}
      <AddClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={() => setIsClientModalOpen(false)}
        triggerRect={clientModalTriggerRect}
      />
    </div>
  );
}
