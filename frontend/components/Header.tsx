"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Search, HelpCircle, Settings, LogOut, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/volta-ui";

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
  const { data: session } = useSession();
  const [workerPhoto, setWorkerPhoto] = useState<string | null>(null);

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
      <Button
        variant="ghost"
        size="sm"
        className="p-2.5 hover:bg-surface-variant rounded-full text-on-surface-variant hover:text-primary relative shadow-none w-9 h-9 flex items-center justify-center"
        aria-label="Notificaciones"
      >
        <Bell data-icon="bell" className="w-[18px] h-[18px]" />
        {hasNotifications && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-surface"></span>
        )}
      </Button>

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
                onClick={() => {
                  setIsDropdownOpen(false);
                  signOut({ callbackUrl: "/login" });
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
