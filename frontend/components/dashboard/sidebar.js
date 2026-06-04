"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const menuItems = [
  { name: "Agenda", icon: "[Calendar]", href: "/dashboard" },
  { name: "WhatsApp", icon: "[Smartphone]", href: "/dashboard/whatsapp" },
  { name: "Ajustes", icon: "[Settings]", href: "/dashboard/settings" },
];

export default function BusinessSidebar() {
  const pathname = usePathname();

  return (
    <div>
      <div>
        <h1>Volta</h1>
        <p>Business Panel</p>
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
