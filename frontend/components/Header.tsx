"use client";

import { Search, Bell, HelpCircle } from "lucide-react";
import Image from "next/image";

interface HeaderProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  hasNotifications?: boolean;
}

export default function Header({
  searchPlaceholder = "Buscar...",
  searchValue = "",
  onSearchChange,
  hasNotifications = true,
}: HeaderProps) {
  return (
    <header className="flex justify-between items-center px-6 py-2 w-full md:pl-[264px] bg-surface sticky top-0 z-40 shrink-0">
      {/* Search Input / Mobile branding */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile-only logo */}
        <div className="md:hidden font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">
          Glow Studio
        </div>

        {/* Desktop search bar */}
        {onSearchChange && (
          <div className="hidden md:flex items-center bg-surface-container rounded-full px-4 py-1 gap-3 border border-outline-variant focus-within:ring-2 focus-within:ring-primary transition-all max-w-md w-full">
            <Search className="w-5 h-5 text-on-surface-variant shrink-0" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="bg-transparent border-none focus:ring-0 text-body-md font-body-md w-full placeholder-on-surface-variant outline-none"
            />
          </div>
        )}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="p-3 hover:bg-surface-variant rounded-full transition-colors relative cursor-pointer text-on-surface-variant hover:text-primary">
          <Bell className="w-5 h-5" />
          {hasNotifications && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
          )}
        </button>

        {/* Help Icon */}
        <button className="p-3 hover:bg-surface-variant rounded-full transition-colors cursor-pointer text-on-surface-variant hover:text-primary">
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Avatar Profile */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-outline-variant cursor-pointer hover:ring-2 hover:ring-primary transition-all shrink-0">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4Ec4Zci7RmiQqA_-qTa0tdRpm9Wl1AVZQsYRoqmBCYgu-SrdSAZoK38if-6y3v-fI_rbpjvuXSX1DFFje1tbtmTQt0JTNiO8-dR8-QBSIhw6Ob2_GaRhoHHIUj_ssbabDqhqu3DNXv-QcDPpcQZCs0T6AirCFHbqrAQLOZ9Y-0DTH68gpUFZxyRQx4q2-DKgTBUU6cSPfG6LVM1L9xd3VaAr1PPApcF4Xlu4kLCaLYAbwyfkOOpjFQ234c3SqedBa-PqJ_pywDw"
            alt="Avatar del Estilista"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
