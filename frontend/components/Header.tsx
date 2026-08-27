"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  Search,
  HelpCircle,
  Settings,
  LogOut,
  Bell,
  User,
  X,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  FileText,
  ArrowRight,
} from "lucide-react";
import { useAlerts } from "@/lib/alerts";

interface HeaderProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  hasNotifications?: boolean;
}

const DEFAULT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD4Ec4Zci7RmiQqA_-qTa0tdRpm9Wl1AVZQsYRoqmBCYgu-SrdSAZoK38if-6y3v-fI_rbpjvuXSX1DFFje1tbtmTQt0JTNiO8-dR8-QBSIhw6Ob2_GaRhoHHIUj_ssbabDqhqu3DNXv-QcDPpcQZCs0T6AirCFHbqrAQLOZ9Y-0DTH68gpUFZxyRQx4q2-DKgTBUU6cSPfG6LVM1L9xd3VaAr1PPApcF4Xlu4kLCaLYAbwyfkOOpjFQ234c3SqedBa-PqJ_pywDw";

function HeaderContent({
  searchPlaceholder = "Buscar...",
  searchValue = "",
  onSearchChange,
  hasNotifications = true,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [emergenteIndex, setEmergenteIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const { data: session } = useSession();
  const [workerPhoto, setWorkerPhoto] = useState<string | null>(null);
  const { alerts, markAsRead, markAllAsRead, hasUnread } = useAlerts();

  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const emergenteAlerts = safeAlerts.filter((a) => a.type === "EMERGENTE" && !a.isRead);
  const standardAlerts = safeAlerts.filter((a) => a.type !== "EMERGENTE");
  const totalEmergentes = emergenteAlerts.length;
  const currentEmergente = emergenteAlerts[emergenteIndex];

  useEffect(() => {
    if (emergenteIndex >= totalEmergentes && totalEmergentes > 0) {
      setEmergenteIndex(totalEmergentes - 1);
    }
  }, [totalEmergentes, emergenteIndex]);

  useEffect(() => {
    const loadPhoto = () => {
      if (typeof window !== "undefined") {
        const savedPhoto = localStorage.getItem("stylist_worker_photo");
        setWorkerPhoto(savedPhoto || null);
      }
    };
    loadPhoto();
    window.addEventListener("stylist_worker_photo_changed", loadPhoto);
    return () => {
      window.removeEventListener("stylist_worker_photo_changed", loadPhoto);
    };
  }, []);

  const displayName = session?.user?.name
    ? session.user.name.replace(/\s*\([^)]*\)/g, "")
    : "Volta";

  // Grouping helper functions
  const getGroupTitle = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  const getRelativeTime = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHrs = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Justo ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHrs < 24) return `Hace ${diffHrs} h`;
    return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  };

  const unreadCount = standardAlerts.filter((a) => !a.isRead).length;
  const filteredAlerts = standardAlerts.filter((a) => activeTab === "all" || !a.isRead);

  const groupKeys: string[] = [];
  const groupedAlerts: { [key: string]: typeof standardAlerts } = {};

  filteredAlerts.forEach((alert) => {
    const title = getGroupTitle(alert.createdAt);
    if (!groupKeys.includes(title)) {
      groupKeys.push(title);
    }
    if (!groupedAlerts[title]) {
      groupedAlerts[title] = [];
    }
    groupedAlerts[title].push(alert);
  });

  return (
    <div className="flex items-center gap-3 shrink-0">
      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className="p-2.5 hover:bg-surface-variant rounded-full text-on-surface-variant hover:text-primary relative shadow-none w-9 h-9 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Notificaciones"
        >
          <Bell data-icon="bell" className="w-[18px] h-[18px]" />
          {hasUnread && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-surface"></span>
          )}
        </button>

        {isNotificationsOpen && (
          <>
            {/* Backdrop overlay */}
            <div className="fixed inset-0 z-30" onClick={() => setIsNotificationsOpen(false)} />

            {/* Notification Dropdown (redesigned matching the screenshot) */}
            <div className="absolute right-0 mt-2 w-[min(380px,calc(100vw-24px))] max-h-[min(520px,calc(100dvh-200px))] bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl z-40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 origin-top-right">
              {/* Header */}
              <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-outline-variant/30">
                <h2 className="font-display text-headline-sm font-bold text-on-surface">
                  Notificaciones
                </h2>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-variant/80 hover:text-primary transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Segmented control tabs */}
              <div className="shrink-0 px-5 py-2.5 border-b border-outline-variant/20">
                <div className="flex bg-surface-container-low rounded-xl p-1 border border-outline-variant/40">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      activeTab === "all"
                        ? "bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/30"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setActiveTab("unread")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      activeTab === "unread"
                        ? "bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/30"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    No leídas {unreadCount > 0 && `(${unreadCount})`}
                  </button>
                </div>
              </div>

              {/* Pinned Emergente Carousel */}
              {totalEmergentes > 0 && currentEmergente && (
                <div className="shrink-0 p-3 bg-primary/[0.03] border-b border-outline-variant/40">
                  <div className="bg-surface-container-lowest border border-primary/15 rounded-xl p-4 shadow-sm relative flex flex-col gap-3">
                    {/* Top row: icon + title + close */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Info className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-body-md font-semibold text-on-surface leading-tight">
                            {currentEmergente.title}
                          </div>
                          <div className="text-body-sm text-on-surface-variant mt-1 leading-relaxed line-clamp-2">
                            {currentEmergente.description}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => markAsRead(currentEmergente.id)}
                        className="p-1 rounded-lg text-on-surface-variant/50 hover:bg-surface-variant/80 hover:text-primary transition-colors shrink-0"
                        aria-label="Marcar como leído"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Bottom row: dots + nav */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex gap-1.5">
                        {emergenteAlerts.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setEmergenteIndex(idx)}
                            className={`rounded-full transition-all duration-300 ${
                              idx === emergenteIndex
                                ? "bg-primary w-4 h-1.5"
                                : "bg-outline-variant hover:bg-outline w-1.5 h-1.5"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        {totalEmergentes > 1 && (
                          <span className="text-[11px] text-on-surface-variant/50 font-medium">
                            {emergenteIndex + 1}/{totalEmergentes}
                          </span>
                        )}
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() =>
                              setEmergenteIndex((prev) =>
                                prev === 0 ? totalEmergentes - 1 : prev - 1
                              )
                            }
                            className="p-1 rounded-md hover:bg-surface-variant text-on-surface-variant hover:text-primary transition-colors"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setEmergenteIndex((prev) =>
                                prev === totalEmergentes - 1 ? 0 : prev + 1
                              )
                            }
                            className="p-1 rounded-md hover:bg-surface-variant text-on-surface-variant hover:text-primary transition-colors"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scrollable Avisos and Notificaciones grouped by date */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-3 divide-y divide-outline-variant/10">
                {groupKeys.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant/40">
                      <Bell className="w-6 h-6" />
                    </div>
                    <div className="text-body-sm text-on-surface-variant/70 font-medium">
                      No tienes avisos ni notificaciones.
                    </div>
                  </div>
                ) : (
                  groupKeys.map((groupKey) => (
                    <div key={groupKey} className="py-3 first:pt-0 last:pb-0">
                      {/* Group Title Header */}
                      <div className="text-[11px] font-bold text-on-surface-variant/50 uppercase tracking-wider mb-3 mt-1 first:mt-0">
                        {groupKey === "Today"
                          ? "Hoy"
                          : groupKey === "Yesterday"
                            ? "Ayer"
                            : groupKey}
                      </div>

                      {/* Group Items */}
                      <div className="flex flex-col gap-4">
                        {groupedAlerts[groupKey].map((alert) => {
                          const isAviso = alert.type === "AVISO";
                          const timeText = getRelativeTime(alert.createdAt);
                          const timestamp =
                            groupKey === "Today"
                              ? `Hoy • ${timeText}`
                              : groupKey === "Yesterday"
                                ? `Ayer • ${timeText}`
                                : `${groupKey} • ${new Date(alert.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`;

                          return (
                            <div
                              key={alert.id}
                              className={`flex gap-3 text-left transition-all ${alert.isRead ? "opacity-60" : ""}`}
                            >
                              {/* Left Icon Container with unread badge */}
                              <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low border border-outline-variant/30">
                                  {isAviso ? (
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                  ) : (
                                    <FileText className="w-5 h-5 text-primary" />
                                  )}
                                </div>
                                {!alert.isRead && (
                                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-surface-container-lowest"></span>
                                )}
                              </div>

                              {/* Content area */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-body-md font-semibold text-on-surface leading-tight">
                                  {alert.title}
                                </h4>
                                <p className="text-body-sm text-on-surface-variant/90 mt-1 leading-relaxed">
                                  {alert.description}
                                </p>
                                <div className="text-xs text-on-surface-variant/50 mt-1.5">
                                  {timestamp}
                                </div>

                                {!alert.isRead && (
                                  <div className="flex gap-4 mt-3">
                                    <button
                                      onClick={() => markAsRead(alert.id)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary rounded-lg hover:bg-primary/15 transition-colors"
                                    >
                                      Revisar
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => markAsRead(alert.id)}
                                      className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
                                    >
                                      Marcar como leído
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="shrink-0 p-3 border-t border-outline-variant/30 bg-surface-container-lowest flex items-center justify-between">
                <Link
                  href="/ajustes"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors px-3 py-2 hover:bg-surface-variant/40 rounded-xl"
                >
                  Ir a Ajustes
                </Link>
                {hasUnread && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="px-3.5 py-2 text-xs font-semibold border border-outline-variant hover:border-outline rounded-xl hover:bg-surface-variant/40 text-on-surface transition-all active:scale-[0.98] shadow-sm"
                  >
                    Marcar todo como leído
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Help Icon */}
      <button
        className="p-2.5 hover:bg-surface-variant rounded-full text-on-surface-variant hover:text-primary w-9 h-9 shadow-none flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Ayuda"
      >
        <HelpCircle data-icon="help" className="w-[18px] h-[18px]" />
      </button>

      {/* Avatar Profile with Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="relative w-9 h-9 rounded-full overflow-hidden border border-outline-variant hover:ring-2 hover:ring-primary p-0 bg-surface-container shadow-none active:scale-95 flex items-center justify-center transition-all cursor-pointer"
        >
          {workerPhoto && workerPhoto !== DEFAULT_AVATAR ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={workerPhoto}
              alt="Avatar del Estilista"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#b0c4de]/30 text-slate-600">
              <User data-icon="user" className="w-[18px] h-[18px]" />
            </div>
          )}
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <>
            {/* Backdrop overlay */}
            <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)} />

            <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-md shadow-lg py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150 origin-top-right">
              <Link
                href="/ajustes"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-label-md font-label-md font-medium text-on-surface hover:bg-surface-variant hover:text-primary transition-colors cursor-pointer w-full text-left relative z-50"
              >
                <Settings data-icon="settings" className="text-on-surface-variant w-4 h-4" />
                <span>Ajustes</span>
              </Link>

              <button
                onClick={async () => {
                  setIsDropdownOpen(false);
                  if (
                    session?.user?.businessId &&
                    session?.user?.subscriptionStatus === "DEMO_SANDBOX"
                  ) {
                    try {
                      await fetch(`/api/backend/demo?businessId=${session.user.businessId}`, {
                        method: "DELETE",
                      });
                    } catch (e) {
                      // Best-effort cleanup
                    }
                  }
                  signOut({ callbackUrl: "/login" });
                  localStorage.removeItem("stylist_worker_photo");
                }}
                className="flex items-center gap-3 px-4 py-2.5 text-label-md font-label-md font-medium text-error hover:bg-error-container/20 transition-colors w-full justify-start border-none shadow-none cursor-pointer rounded-none h-auto"
              >
                <LogOut data-icon="logout" className="text-error w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Header(props: HeaderProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof window === "undefined") return null;
  return <HeaderContent {...props} />;
}
