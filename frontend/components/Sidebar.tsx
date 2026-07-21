"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

const MIN_WIDTH = 80;
const MAX_WIDTH = 320;
const SNAP_THRESHOLD = 120;
const DEFAULT_WIDTH = 240;

interface SidebarProps {
  onNewAppointmentClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function Sidebar({ onNewAppointmentClick }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const role = session?.user?.role || "EMPLEADO";
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const lastWidthRef = useRef(DEFAULT_WIDTH);

  const applyWidth = (width: number, collapsed: boolean) => {
    const effectiveWidth = collapsed ? MIN_WIDTH : width;
    document.documentElement.style.setProperty("--sidebar-width", `${effectiveWidth}px`);
  };

  const applyCollapsedClass = (collapsed: boolean) => {
    if (collapsed) {
      document.documentElement.classList.add("sidebar-collapsed");
    } else {
      document.documentElement.classList.remove("sidebar-collapsed");
    }
  };

  useEffect(() => {
    setMounted(true);
    const collapsed = localStorage.getItem("sidebar-collapsed") === "true";
    const savedWidth = parseInt(localStorage.getItem("sidebar-width") || String(DEFAULT_WIDTH), 10);
    const width = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, savedWidth));

    setIsCollapsed(collapsed);
    setSidebarWidth(width);
    lastWidthRef.current = collapsed ? DEFAULT_WIDTH : width;
    applyWidth(width, collapsed);
    applyCollapsedClass(collapsed);
  }, []);

  const handleToggle = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("sidebar-collapsed", String(nextState));

    if (nextState) {
      lastWidthRef.current = sidebarWidth;
      applyWidth(sidebarWidth, true);
      applyCollapsedClass(true);
    } else {
      const restoreWidth = lastWidthRef.current || DEFAULT_WIDTH;
      setSidebarWidth(restoreWidth);
      applyWidth(restoreWidth, false);
      applyCollapsedClass(false);
    }

    window.dispatchEvent(new Event("sidebar_toggle"));
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta));
      setSidebarWidth(newWidth);
      applyWidth(newWidth, false);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      setSidebarWidth((currentWidth) => {
        if (currentWidth < SNAP_THRESHOLD) {
          setIsCollapsed(true);
          localStorage.setItem("sidebar-collapsed", "true");
          applyWidth(currentWidth, true);
          applyCollapsedClass(true);
          lastWidthRef.current = DEFAULT_WIDTH;
          return currentWidth;
        } else {
          localStorage.setItem("sidebar-width", String(currentWidth));
          lastWidthRef.current = currentWidth;
          return currentWidth;
        }
      });

      window.dispatchEvent(new Event("sidebar_toggle"));
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
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
  } else {
    navigationItems.push(
      { name: "Inicio", href: "/inicio", icon: LayoutDashboard },
      { name: "Agenda", href: "/agenda", icon: Calendar },
      { name: "Clientes", href: "/clientes", icon: Users },
      { name: "Ajustes", href: "/ajustes", icon: Settings },
    );
  }

  const displayCollapsed = mounted ? isCollapsed : false;

  return (
    <aside 
      style={{ width: "var(--sidebar-width)" }}
      className={`h-full hidden md:flex flex-col fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant py-6 z-50 ${isResizing ? "transition-none" : "transition-all duration-300"}`}
    >
      {/* Brand logo & styling */}
      <div className={`flex items-center mb-8 px-4 ${displayCollapsed ? 'flex-col gap-3 justify-center' : 'gap-3'}`}>
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

      {/* Resize Handle */}
      {!displayCollapsed && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize group/resize z-10"
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-transparent group-hover/resize:bg-primary/30 transition-colors duration-150" />
        </div>
      )}
    </aside>
  );
}
