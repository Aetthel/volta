"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Search, HelpCircle, Settings, LogOut, Phone, MessageSquare } from "lucide-react";

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
                  <svg className="w-4 h-4 text-[#25D366] shrink-0" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                  </svg>
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
