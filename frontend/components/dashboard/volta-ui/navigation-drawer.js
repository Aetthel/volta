"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Calendar, 
  MessageSquare, 
  Settings, 
  LogOut,
  Zap,
  LayoutDashboard,
  Users,
  ShieldCheck
} from 'lucide-react';
import { signOut } from "next-auth/react";

const ICON_MAP = {
  calendar: Calendar,
  message: MessageSquare,
  settings: Settings,
  layout: LayoutDashboard,
  users: Users,
  shield: ShieldCheck,
};

const DEFAULT_MENU_ITEMS = [
  { name: "Agenda", icon: "calendar", href: "/dashboard" },
  { name: "WhatsApp", icon: "message", href: "/dashboard/whatsapp" },
  { name: "Ajustes", icon: "settings", href: "/dashboard/settings" },
];

export function VoltaNavigationDrawer({ customMenu, brandName = "Volta" }) {
  const pathname = usePathname();
  const items = customMenu || DEFAULT_MENU_ITEMS;

  return (
    <aside className="w-80 h-screen sticky top-0 bg-white border-r border-slate-100 flex flex-col p-8 z-40">
      {/* Brand Header */}
      <div className="px-2 py-12">
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight leading-none">{brandName}</h1>
        <p className="text-xs font-medium text-teal-600 uppercase tracking-[0.2em] mt-3">
          {brandName.includes('Admin') ? 'Panel Maestro' : 'Business Pro'}
        </p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-4 mt-10">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = ICON_MAP[item.icon] || Calendar;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-6 px-8 h-20 rounded-[2rem] font-semibold transition-all duration-200
                ${isActive 
                  ? 'bg-teal-50 text-teal-700' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}
              `}
            >
              <IconComponent className={`size-7 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
              <span className="text-[17px] tracking-wide uppercase">{item.name}</span>
              {isActive && (
                <div className="ml-auto size-1.5 bg-teal-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User / Bottom Actions */}
      <div className="mt-auto pt-4 border-t border-slate-50">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-4 px-6 h-14 w-full rounded-full font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <LogOut className="size-6 group-hover:rotate-12 transition-transform" />
          <span className="text-sm tracking-wide">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
