"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Settings,
  BarChart3
} from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const role = (session?.user as any)?.role || "BUSINESS";

  const navItems = role === "ADMIN"
    ? [
        { name: "Inicio", href: "/admin", icon: BarChart3 },
        { name: "Sedes", href: "/sedes", icon: Store },
        { name: "Ajustes", href: "/ajustes", icon: Settings },
      ]
    : [
        { name: "Inicio", href: "/inicio", icon: LayoutDashboard },
        { name: "Clientes", href: "/clientes", icon: Users },
        { name: "Ajustes", href: "/ajustes", icon: Settings },
      ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-surface border-t border-outline-variant shadow-lg flex justify-around items-center h-16 pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-20 h-full gap-1 transition-colors duration-150 relative ${
              isActive
                ? "text-primary font-medium"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {isActive && (
              <span className="absolute top-0 w-12 h-1 bg-primary rounded-b-full"></span>
            )}
            <Icon className="w-5 h-5" />
            <span className="text-[10px] tracking-wider uppercase font-semibold">
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
