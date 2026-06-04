"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const menuItems = [
  { name: "Resumen", icon: "[LayoutDashboard]", href: "/admin" },
  { name: "Negocios", icon: "[Users]", href: "/admin/businesses" },
  { name: "Configuración", icon: "[Settings]", href: "/admin/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div>
      <div>
        <h1>Volta</h1>
        <p>Admin Panel</p>
      </div>

      <nav>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div>
        <button
          onClick={() => signOut()}
        >
          <span>[LogOut]</span>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
