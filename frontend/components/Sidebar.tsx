"use client";

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
  Plus 
} from "lucide-react";
import { Button } from "@/components/ui/volta-ui";

interface SidebarProps {
  onNewAppointmentClick?: () => void;
}

export default function Sidebar({ onNewAppointmentClick }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const role = session?.user?.role || "EMPLEADO";

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
    );
  }

  return (
    <aside className="h-full w-[240px] hidden md:flex flex-col fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant py-6 z-50">
      {/* Brand logo & styling */}
      <div className="px-4 mb-8">
        <h1 className="font-title-lg text-title-lg font-bold text-primary tracking-tight truncate" title={session?.user?.name || "Volta"}>
          {session?.user?.name || "Volta"}
        </h1>
        <p className="text-label-md font-label-md text-on-surface-variant">
          {role === "ADMIN" ? "Administrador Global" : role === "JEFE" ? "Jefe de Tienda" : "Empleado"}
        </p>
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
              className={`flex items-center gap-4 px-4 py-3 mx-3 rounded-lg active:scale-95 transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container font-medium"
                  : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors"
              }`}
            >
              <Icon data-icon="nav" />
              <span className="font-label-md text-label-md">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Action CTA Button at the bottom */}
      {(role === "JEFE" || role === "EMPLEADO") && onNewAppointmentClick && (
        <div className="px-4 mt-auto">
          <Button
            onClick={onNewAppointmentClick}
            variant="primary"
            size="lg"
            className="w-full py-4 px-6 shadow-sm"
          >
            <Plus data-icon="plus" />
            <span>Nueva Cita</span>
          </Button>
        </div>
      )}
    </aside>
  );
}
