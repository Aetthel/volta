"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Search, HelpCircle, Settings, LogOut, Phone, MessageSquare, MessageSquareText } from "lucide-react";

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="flex justify-between items-center px-6 py-4 w-full bg-surface sticky top-0 z-40 shrink-0">
      {/* Search Input / Mobile branding */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile-only logo */}
        <div className="md:hidden font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary truncate max-w-[180px]" title={session?.user?.name || "Volta"}>
          {session?.user?.name || "Volta"}
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
        {/* Contact Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsContactOpen(!isContactOpen)}
            className="p-3 hover:bg-surface-variant rounded-full transition-colors cursor-pointer text-on-surface-variant hover:text-primary relative focus:outline-none"
            aria-label="Contacto de soporte"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {isContactOpen && (
            <>
              {/* Backdrop overlay */}
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setIsContactOpen(false)}
              />
              
              <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150 origin-top-right">
                <div className="px-4 py-2 border-b border-outline-variant mb-1">
                  <p className="text-body-sm font-semibold text-on-surface">Contacto de Soporte</p>
                </div>
                
                {/* Call Link */}
                <a 
                  href="tel:+34696352940"
                  onClick={() => setIsContactOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-label-md font-semibold text-on-surface hover:bg-surface-variant hover:text-primary transition-colors cursor-pointer w-full text-left"
                >
                  <Phone className="w-4 h-4 text-on-surface-variant" />
                  <div className="flex flex-col">
                    <span>Llamar por Teléfono</span>
                    <span className="text-body-xs text-on-surface-variant font-normal">+34 696 35 29 40</span>
                  </div>
                </a>
                
                {/* WhatsApp Link */}
                <a 
                  href="https://wa.me/34696352940"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsContactOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-label-md font-semibold text-on-surface hover:bg-surface-variant hover:text-primary transition-colors cursor-pointer w-full text-left"
                >
                  <MessageSquareText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="flex flex-col">
                    <span>Enviar WhatsApp</span>
                    <span className="text-body-xs text-on-surface-variant font-normal">Contactar por chat</span>
                  </div>
                </a>
              </div>
            </>
          )}
        </div>

        {/* Help Icon */}
        <button className="p-3 hover:bg-surface-variant rounded-full transition-colors cursor-pointer text-on-surface-variant hover:text-primary">
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Avatar Profile with Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="relative w-10 h-10 rounded-full overflow-hidden border border-outline-variant cursor-pointer hover:ring-2 hover:ring-primary transition-all shrink-0 focus:outline-none flex items-center justify-center"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4Ec4Zci7RmiQqA_-qTa0tdRpm9Wl1AVZQsYRoqmBCYgu-SrdSAZoK38if-6y3v-fI_rbpjvuXSX1DFFje1tbtmTQt0JTNiO8-dR8-QBSIhw6Ob2_GaRhoHHIUj_ssbabDqhqu3DNXv-QcDPpcQZCs0T6AirCFHbqrAQLOZ9Y-0DTH68gpUFZxyRQx4q2-DKgTBUU6cSPfG6LVM1L9xd3VaAr1PPApcF4Xlu4kLCaLYAbwyfkOOpjFQ234c3SqedBa-PqJ_pywDw"
              alt="Avatar del Estilista"
              className="w-full h-full object-cover"
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              {/* Backdrop overlay */}
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setIsDropdownOpen(false)}
              />
              
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150 origin-top-right">
                <Link 
                  href="/ajustes"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-label-lg font-label-lg font-semibold text-on-surface hover:bg-surface-variant hover:text-primary transition-colors cursor-pointer w-full text-left relative z-50"
                >
                  <Settings className="w-5 h-5 text-on-surface-variant" />
                  <span>Ajustes</span>
                </Link>
                
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    signOut({ callbackUrl: "/login" });
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-label-lg font-label-lg font-semibold text-error hover:bg-error-container/20 transition-colors cursor-pointer w-full text-left border-none"
                >
                  <LogOut className="w-5 h-5 text-error" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
