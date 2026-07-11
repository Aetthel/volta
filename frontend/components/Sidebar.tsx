"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import FaceIcon from "@/components/FaceIcon";
import { useSession } from "next-auth/react";
import { 
  LayoutDashboard, 
  Calendar,
  Users, 
  Store, 
  Settings, 
  BarChart3, 
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/volta-ui";

interface SidebarProps {
  onNewAppointmentClick?: () => void;
}

export default function Sidebar({ onNewAppointmentClick }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const role = session?.user?.role || "EMPLEADO";
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const collapsed = localStorage.getItem("sidebar-collapsed") === "true";
    setIsCollapsed(collapsed);
    if (collapsed) {
      document.documentElement.classList.add("sidebar-collapsed");
    } else {
      document.documentElement.classList.remove("sidebar-collapsed");
    }
  }, []);

  const handleToggle = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("sidebar-collapsed", String(nextState));
    if (nextState) {
      document.documentElement.classList.add("sidebar-collapsed");
    } else {
      document.documentElement.classList.remove("sidebar-collapsed");
    }
    // Dispatch a custom event to trigger window resize handlers (charts, calendar, etc.)
    window.dispatchEvent(new Event("sidebar_toggle"));
  };

  const navigationItems = [];
  if (role === "ADMIN") {
    navigationItems.push(
      { name: "Control Global", href: "/admin", icon: BarChart3 },
      { name: "Locales", href: "/sedes", icon: Store },
      { name: "Ajustes", href: "/ajustes", icon: Settings },
    );
  } else if (role === "JEFE") {
    navigationItems.push(
      { name: "Inicio", href: "/inicio", icon: LayoutDashboard },
      { name: "Agenda", href: "/agenda", icon: Calendar },
      { name: "Clientes", href: "/clientes", icon: Users },
      { name: "Ajustes", href: "/ajustes", icon: Settings },
    );
  } else { // EMPLEADO
    navigationItems.push(
      { name: "Inicio", href: "/inicio", icon: LayoutDashboard },
      { name: "Agenda", href: "/agenda", icon: Calendar },
      { name: "Clientes", href: "/clientes", icon: Users },
      { name: "Ajustes", href: "/ajustes", icon: Settings },
    );
  }

  // Prevent flicker during SSR before reading localStorage
  const displayCollapsed = mounted ? isCollapsed : false;

  return (
    <aside 
      style={{ width: "var(--sidebar-width)" }}
      className="h-full hidden md:flex flex-col fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant py-6 z-50 transition-all duration-300"
    >
      {/* Brand logo & styling */}
      <div className={`flex items-center mb-8 px-4 ${displayCollapsed ? 'flex-col gap-3 justify-center' : 'gap-3'}`}>
        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-xl">
          <FaceIcon className="w-8 h-8" />
        </div>
        {!displayCollapsed && (
          <div className="min-w-0 flex-1">
            <h1 className="font-title-sm text-title-sm font-bold text-primary tracking-tight truncate" title={session?.user?.name || "Volta"}>
              {session?.user?.name || "Volta"}
            </h1>
            <p className="text-label-sm font-label-sm text-on-surface-variant truncate">
              {role === "ADMIN" ? "Administrador Global" : role === "JEFE" ? "Jefe de Tienda" : "Empleado"}
            </p>
          </div>
        )}
        <button 
          onClick={handleToggle}
          className={`p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-variant/80 hover:text-primary transition-colors cursor-pointer border-none bg-transparent ${displayCollapsed ? 'mt-1' : 'ml-auto'}`}
          aria-label={displayCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
          title={displayCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {displayCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation links list */}
      <nav className="flex-1 flex flex-col gap-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center ${displayCollapsed ? 'justify-center py-3.5 mx-3' : 'gap-4 px-4 py-3 mx-3'} rounded-lg active:scale-95 transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container font-medium"
                  : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors"
              }`}
              title={displayCollapsed ? item.name : undefined}
            >
              <Icon data-icon="nav" />
              {!displayCollapsed && <span className="font-label-md text-label-md">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Action CTA Button at the bottom */}
      {(role === "JEFE" || role === "EMPLEADO") && onNewAppointmentClick && (
        <div className={`px-4 mt-auto ${displayCollapsed ? 'flex justify-center' : ''}`}>
          <Button
            onClick={onNewAppointmentClick}
            variant="primary"
            className={displayCollapsed ? "!w-12 !h-12 !rounded-full !p-0 shadow-sm flex items-center justify-center shrink-0" : "w-full py-4 px-6 shadow-sm"}
            title={displayCollapsed ? "Nueva Cita" : undefined}
          >
            <Plus data-icon="plus" className={displayCollapsed ? "w-5 h-5" : ""} />
            {!displayCollapsed && <span>Nueva Cita</span>}
          </Button>
        </div>
      )}
    </aside>
  );
}
