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
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/volta-ui";
import { useAlerts } from "@/lib/alerts";

interface HeaderProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  hasNotifications?: boolean;
}

const DEFAULT_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuD4Ec4Zci7RmiQqA_-qTa0tdRpm9Wl1AVZQsYRoqmBCYgu-SrdSAZoK38if-6y3v-fI_rbpjvuXSX1DFFje1tbtmTQt0JTNiO8-dR8-QBSIhw6Ob2_GaRhoHHIUj_ssbabDqhqu3DNXv-QcDPpcQZCs0T6AirCFHbqrAQLOZ9Y-0DTH68gpUFZxyRQx4q2-DKgTBUU6cSPfG6LVM1L9xd3VaAr1PPApcF4Xlu4kLCaLYAbwyfkOOpjFQ234c3SqedBa-PqJ_pywDw";

export default function Header({
  searchPlaceholder = "Buscar...",
  searchValue = "",
  onSearchChange,
  hasNotifications = true,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [emergenteIndex, setEmergenteIndex] = useState(0);

  const { data: session } = useSession();
  const [workerPhoto, setWorkerPhoto] = useState<string | null>(null);
  const { alerts, markAsRead, markAllAsRead, hasUnread } = useAlerts();

  const emergenteAlerts = alerts.filter((a) => a.type === "EMERGENTE" && !a.isRead);
  const standardAlerts = alerts.filter((a) => a.type !== "EMERGENTE");
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

  return (
    <div className="flex items-center gap-3 shrink-0">
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className="p-2.5 hover:bg-surface-variant rounded-full text-on-surface-variant hover:text-primary relative shadow-none w-9 h-9 flex items-center justify-center"
          aria-label="Notificaciones"
        >
          <Bell data-icon="bell" className="w-[18px] h-[18px]" />
          {hasUnread && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-surface"></span>
          )}
        </Button>

        {isNotificationsOpen && (
          <>
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsNotificationsOpen(false)}
            />

            {/* Notification Dropdown (matches NewAppointmentModal style) */}
            <div className="absolute right-0 mt-2 w-[420px] bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl z-40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 origin-top-right">
              {/* Pinned Emergente Carousel */}
              {totalEmergentes > 0 && currentEmergente && (
                <div className="p-4 bg-primary/5 border-b border-outline-variant">
                  <div className="bg-surface-container-lowest border border-primary/20 rounded-xl p-4 shadow-sm relative flex flex-col">
                    
                    {/* Close / Mark as Read Button */}
                    <button
                      onClick={() => markAsRead(currentEmergente.id)}
                      className="absolute top-3 right-3 p-1 rounded-lg text-on-surface-variant hover:bg-surface-variant/80 hover:text-primary transition-colors border border-transparent hover:border-outline-variant/40"
                      aria-label="Marcar como leído"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 pr-6">
                        <div>
                          <div className="text-body-md font-semibold text-on-surface leading-tight">
                            {currentEmergente.title}
                          </div>
                          <div className="text-body-sm text-on-surface-variant mt-1.5 leading-relaxed">
                            {currentEmergente.description}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      {/* Carousel Dots */}
                      <div className="flex gap-1.5">
                        {emergenteAlerts.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setEmergenteIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              idx === emergenteIndex ? "bg-primary" : "bg-outline-variant"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Carousel actions */}
                      <div className="flex items-center gap-3.5">
                        {totalEmergentes > 1 && (
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="ghost"
                              onClick={() =>
                                setEmergenteIndex((prev) => (prev === 0 ? totalEmergentes - 1 : prev - 1))
                              }
                              className="p-1 rounded hover:bg-surface-variant w-6 h-6 flex items-center justify-center border-none shadow-none"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() =>
                                setEmergenteIndex((prev) => (prev === totalEmergentes - 1 ? 0 : prev + 1))
                              }
                              className="p-1 rounded hover:bg-surface-variant w-6 h-6 flex items-center justify-center border-none shadow-none"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scrollable Avisos and Notificaciones */}
              <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/40">
                {standardAlerts.length === 0 ? (
                  <div className="p-8 text-center text-body-sm text-on-surface-variant/70">
                    No tienes avisos ni notificaciones.
                  </div>
                ) : (
                  standardAlerts.map((alert) => {
                    const isAviso = alert.type === "AVISO";
                    return (
                      <div
                        key={alert.id}
                        onClick={() => !alert.isRead && markAsRead(alert.id)}
                        className={`p-4 text-left transition-colors relative flex gap-3 cursor-pointer ${
                          alert.isRead ? "opacity-60 bg-surface/30" : "hover:bg-surface-variant/40"
                        } ${isAviso ? "border-l-4 border-amber-500 bg-amber-500/[0.02]" : "border-l-4 border-primary bg-primary/[0.02]"}`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isAviso ? (
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                          ) : (
                            <Info className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-body-md font-semibold text-on-surface leading-tight flex items-center justify-between gap-2">
                            <span className="truncate">{alert.title}</span>
                            {!alert.isRead && (
                              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                            )}
                          </div>
                          <div className="text-body-sm text-on-surface-variant/90 mt-1 leading-relaxed line-clamp-2">
                            {alert.description}
                          </div>
                          <div className="text-xs text-on-surface-variant/50 mt-1.5">
                            {new Date(alert.createdAt).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {hasUnread && (
                <div className="p-3 border-t border-outline-variant bg-surface-container-low flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllAsRead()}
                    className="text-xs text-primary hover:bg-primary/5 py-2 px-4 h-auto font-semibold w-full text-center border-none shadow-none active:scale-[0.98]"
                  >
                    Marcar todo como leído
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Help Icon */}
      <Button
        variant="ghost"
        size="sm"
        className="p-2.5 hover:bg-surface-variant rounded-full text-on-surface-variant hover:text-primary w-9 h-9 shadow-none flex items-center justify-center"
        aria-label="Ayuda"
      >
        <HelpCircle data-icon="help" className="w-[18px] h-[18px]" />
      </Button>

      {/* Avatar Profile with Dropdown */}
      <div className="relative">
        <Button
          variant="ghost"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="relative w-9 h-9 rounded-full overflow-hidden border border-outline-variant hover:ring-2 hover:ring-primary p-0 bg-surface-container shadow-none active:scale-95 flex items-center justify-center"
        >
          {workerPhoto && workerPhoto !== DEFAULT_AVATAR ? (
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
        </Button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <>
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsDropdownOpen(false)}
            />

            <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-md shadow-lg py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150 origin-top-right">
              <Link
                href="/ajustes"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-label-md font-label-md font-medium text-on-surface hover:bg-surface-variant hover:text-primary transition-colors cursor-pointer w-full text-left relative z-50"
              >
                <Settings data-icon="settings" className="text-on-surface-variant w-4 h-4" />
                <span>Ajustes</span>
              </Link>

              <Button
                variant="ghost"
                onClick={async () => {
                  setIsDropdownOpen(false);
                  if (session?.user?.businessId && session?.user?.isDemo) {
                    try {
                      await fetch(`/api/backend/demo?businessId=${session.user.businessId}`, {
                        method: "DELETE",
                      });
                    } catch (e) {
                      // Best-effort cleanup
                    }
                  }
                  signOut();
                }}
                className="flex items-center gap-3 px-4 py-2.5 text-label-md font-label-md font-medium text-error hover:bg-error-container/20 transition-colors w-full justify-start border-none shadow-none active:scale-100 rounded-none h-auto"
              >
                <LogOut data-icon="logout" className="text-error w-4 h-4" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
