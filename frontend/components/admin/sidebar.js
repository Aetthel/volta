"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, MessageSquare, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const menuItems = [
  { name: "Resumen", icon: LayoutDashboard, href: "/admin" },
  { name: "Negocios", icon: Users, href: "/admin/businesses" },
  { name: "Configuración", icon: Settings, href: "/admin/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full w-64 bg-white dark:bg-[#0A0A0A] border-r border-neutral-100 dark:border-neutral-900">
      <div className="p-8">
        <h1 className="text-3xl font-display font-bold tracking-tight">Volta</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-xs uppercase tracking-widest transition-colors group",
                isActive 
                  ? "bg-[#1A1A1A] text-white dark:bg-white dark:text-black" 
                  : "text-neutral-500 hover:text-[#1A1A1A] dark:hover:text-white"
              )}
            >
              <item.icon className={cn("mr-3 h-4 w-4", isActive ? "text-white dark:text-black" : "text-neutral-400 group-hover:text-[#1A1A1A] dark:group-hover:text-white")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-100 dark:border-neutral-900">
        <button
          onClick={() => signOut()}
          className="flex items-center w-full px-4 py-3 text-xs uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
