"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Settings, 
  BarChart3, 
  Plus 
} from "lucide-react";

interface SidebarProps {
  onNewAppointmentClick?: () => void;
}

export default function Sidebar({ onNewAppointmentClick }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const role = (session?.user as any)?.role || "BUSINESS";

  const navigationItems = role === "ADMIN"
    ? [
        { name: "Control Global", href: "/admin", icon: BarChart3 },
        { name: "Sedes", href: "/sedes", icon: Store },
        { name: "Ajustes", href: "/ajustes", icon: Settings },
      ]
    : [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Clientes", href: "/clientes", icon: Users },
        { name: "Ajustes", href: "/ajustes", icon: Settings },
      ];

  return (
    <aside className="h-full w-[240px] hidden md:flex flex-col fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant py-6 z-50">
      {/* Brand logo & styling */}
      <div className="px-4 mb-8">
        <h1 className="font-title-lg text-title-lg font-bold text-primary tracking-tight">
          Volta
        </h1>
        <p className="text-label-md font-label-md text-on-surface-variant">
          Admin Pro
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
              <Icon className="w-5 h-5" />
              <span className="font-label-md text-label-md">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Action CTA Button at the bottom */}
      {role === "BUSINESS" && onNewAppointmentClick && (
        <div className="px-4 mt-auto">
          <button
            onClick={onNewAppointmentClick}
            className="w-full py-4 px-6 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container rounded-lg font-label-lg text-label-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Cita</span>
          </button>
        </div>
      )}
    </aside>
  );
}
