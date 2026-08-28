"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import dynamic from "next/dynamic";
import {
  Search,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Inbox,
  Calendar,
  Activity,
  Globe,
  Plus,
  Command,
  X,
  Lock,
  Store,
  BarChart3,
  UserCheck,
  FileText,
} from "lucide-react";
import { hasFeatureAccess, PlanFeature } from "@/lib/permissions";

const UpgradeProModal = dynamic(() => import("@/components/UpgradeProModal"), {
  ssr: false,
});

export type NavItemData = {
  id: string;
  title: string;
  href?: string;
  icon: React.ElementType;
  badge?: number | string;
  shortcut?: string;
  requiresFeature?: PlanFeature;
  lockedTitle?: string;
  lockedDescription?: string;
  children?: NavItemData[];
};

export type NavGroupData = {
  heading?: string;
  items: NavItemData[];
};

interface SidebarProps {
  onNewAppointmentClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const MIN_WIDTH = 80;
const MAX_WIDTH = 340;
const SNAP_THRESHOLD = 120;
const DEFAULT_WIDTH = 260;

function WorkspaceSwitcher({
  businessName,
  businessLogo,
  planLabel,
  isCollapsed,
}: {
  businessName: string;
  businessLogo?: string | null;
  planLabel: string;
  isCollapsed: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const initial = businessName.trim().charAt(0).toUpperCase() || "B";

  return (
    <div className="relative">
      <div
        onClick={() => !isCollapsed && setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-2.5 py-2.5 mb-2 rounded-xl hover:bg-primary/5 cursor-pointer transition-colors select-none group ${
          isCollapsed ? "justify-center" : ""
        }`}
        title={businessName}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 overflow-hidden">
            {businessLogo ? (
              <img
                src={businessLogo}
                alt={businessName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="text-sm font-semibold leading-tight text-on-surface truncate max-w-[140px]">
                {businessName}
              </span>
              <span className="text-xs font-medium text-on-surface-variant/80 leading-tight mt-0.5">
                {planLabel}
              </span>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <ChevronDown
            className="w-4 h-4 text-on-surface-variant/60 group-hover:text-primary transition-colors shrink-0"
            strokeWidth={1.75}
          />
        )}
      </div>

      {isOpen && !isCollapsed && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[58px] left-0 w-full bg-white border border-outline-variant/60 rounded-xl shadow-xl z-50 py-1.5 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3.5 py-2 mx-1 text-sm rounded-lg bg-primary/10 text-primary font-semibold">
              {businessName} ({planLabel})
            </div>
            <div className="h-px bg-outline-variant/40 my-1 mx-2" />
            <Link
              href="/ajustes"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-2 mx-1 text-sm text-on-surface-variant hover:bg-primary/5 hover:text-primary rounded-lg cursor-pointer flex items-center gap-2 transition-colors font-medium"
            >
              <Settings className="w-4 h-4" />
              <span>Ajustes de Cuenta</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function renderBadge(badge?: number | string) {
  if (badge === undefined || badge === null) return null;

  return (
    <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-primary/10 text-primary border border-primary/20 shadow-2xs whitespace-nowrap leading-tight">
      {badge}
    </span>
  );
}

function NavItem({
  item,
  activeHref,
  isCollapsed,
  subscriptionPlan,
  subscriptionStatus,
  onOpenUpgrade,
  onOpenSearch,
  level = 0,
}: {
  item: NavItemData;
  activeHref: string;
  isCollapsed: boolean;
  subscriptionPlan: string;
  subscriptionStatus: string;
  onOpenUpgrade: (info: { title?: string; description?: string }) => void;
  onOpenSearch: () => void;
  level?: number;
}) {
  const isActive = item.href ? activeHref === item.href : false;
  const isLocked = item.requiresFeature
    ? !hasFeatureAccess(subscriptionPlan, subscriptionStatus, item.requiresFeature)
    : false;
  const hasChildren = !!item.children;
  const [isOpen, setIsOpen] = useState(false);

  const isClickable = !!item.href || isLocked || item.id === "search" || hasChildren;

  const handleClick = (e: React.MouseEvent) => {
    if (!isClickable) {
      e.preventDefault();
      return;
    }
    if (item.id === "search") {
      e.preventDefault();
      onOpenSearch();
      return;
    }
    if (isLocked) {
      e.preventDefault();
      onOpenUpgrade({
        title: item.lockedTitle || "Desbloquea esta función",
        description: item.lockedDescription,
      });
      return;
    }
    if (hasChildren) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const content = (
    <div
      className={`group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 select-none ${
        isClickable ? "cursor-pointer" : "cursor-default"
      } ${
        isCollapsed ? "justify-center px-1.5" : ""
      } ${
        isActive && !isLocked
          ? "bg-primary/10 text-primary font-semibold shadow-2xs"
          : isLocked
            ? "text-on-surface-variant/60 hover:bg-primary/5 hover:text-on-surface"
            : isClickable
              ? "text-on-surface-variant hover:bg-primary/5 hover:text-primary"
              : "text-on-surface-variant/70 hover:bg-primary/5"
      }`}
      style={{ paddingLeft: !isCollapsed ? `${level * 12 + 12}px` : undefined }}
      onClick={handleClick}
      title={
        isCollapsed
          ? isLocked
            ? `${item.title} (Plan Pro)`
            : item.title
          : undefined
      }
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative flex items-center justify-center shrink-0">
          <item.icon
            className={`w-[18px] h-[18px] transition-colors ${
              isActive && !isLocked
                ? "text-primary"
                : "text-on-surface-variant/80 group-hover:text-primary"
            }`}
            strokeWidth={isActive ? 2 : 1.75}
          />
        </div>
        {!isCollapsed && (
          <span className="text-sm font-medium tracking-normal truncate">
            {item.title}
          </span>
        )}
      </div>

      {!isCollapsed && (
        <div className="flex items-center gap-1.5 shrink-0">
          {item.shortcut && (
            <kbd className="hidden group-hover:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium font-mono text-on-surface-variant/70 bg-white border border-outline-variant/60 rounded shadow-2xs">
              {item.shortcut}
            </kbd>
          )}
          {renderBadge(item.badge)}
          {hasChildren && (
            <ChevronRight
              className={`w-4 h-4 text-on-surface-variant/60 group-hover:text-primary transition-transform duration-200 ${
                isOpen ? "rotate-90" : ""
              }`}
              strokeWidth={2}
            />
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col w-full">
      {item.href && !isLocked && item.id !== "search" ? (
        <Link href={item.href} className="w-full">
          {content}
        </Link>
      ) : (
        content
      )}

      {hasChildren && !isCollapsed && (
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden min-h-0 relative flex flex-col gap-0.5 mt-0.5">
            <div
              className="absolute top-0 bottom-0 border-l border-outline-variant/40"
              style={{ left: `${level * 12 + 20}px` }}
            />
            {item.children!.map((child) => (
              <NavItem
                key={child.id}
                item={child}
                activeHref={activeHref}
                isCollapsed={isCollapsed}
                subscriptionPlan={subscriptionPlan}
                subscriptionStatus={subscriptionStatus}
                onOpenUpgrade={onOpenUpgrade}
                onOpenSearch={onOpenSearch}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ onNewAppointmentClick }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = session?.user?.role || "EMPLEADO";
  const subscriptionPlan = session?.user?.subscriptionPlan || "BASIC";
  const subscriptionStatus = session?.user?.subscriptionStatus || "ACTIVE";
  const planLabel = subscriptionPlan === "BASIC" ? "Plan Básico" : "Plan Pro";

  const [businessData, setBusinessData] = useState<{
    name?: string;
    logoUrl?: string | null;
  }>({});

  useEffect(() => {
    const businessId = (session?.user as any)?.businessId;
    if (!businessId || businessId === "mock-business-id") return;
    fetch(`/api/backend/business/${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setBusinessData({
            name: data.name,
            logoUrl: data.logoUrl,
          });
        }
      })
      .catch((err) => console.error("Error loading business in sidebar:", err));
  }, [(session?.user as any)?.businessId]);

  const businessName =
    businessData.name ||
    (session?.user as any)?.businessName ||
    "Mi Negocio";
  const businessLogo =
    businessData.logoUrl ||
    (session?.user as any)?.businessLogoUrl ||
    null;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInputVal, setSearchInputVal] = useState("");

  const [upgradeModalInfo, setUpgradeModalInfo] = useState<{
    open: boolean;
    title?: string;
    description?: string;
  }>({ open: false });

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

  // Keyboard shortcut listener: ⌘K or Ctrl+K for Search, ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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

  const navGroups: NavGroupData[] = [];

  if (role === "ADMIN") {
    navGroups.push({
      heading: "Principal",
      items: [
        { id: "search", title: "Buscar", icon: Search, shortcut: "⌘K", badge: "Nuevo" },
        { id: "admin", title: "Control Global", href: "/admin", icon: BarChart3 },
        { id: "sedes", title: "Locales", href: "/sedes", icon: Store },
      ],
    });
    navGroups.push({
      heading: "Ajustes",
      items: [
        { id: "settings", title: "Preferencias", href: "/ajustes", icon: Settings },
      ],
    });
  } else {
    // 1. Categoría: Principal
    navGroups.push({
      heading: "Principal",
      items: [
        { id: "search", title: "Buscar", icon: Search, shortcut: "⌘K", badge: "Nuevo" },
        { id: "home", title: "Inicio", href: "/inicio", icon: LayoutDashboard },
        {
          id: "inbox",
          title: "Inbox",
          icon: Inbox,
          badge: "Próximamente",
        },
        {
          id: "analytics",
          title: "Analítica",
          icon: Activity,
          badge: "Próximamente",
        },
      ],
    });

    // 2. Categoría: General
    navGroups.push({
      heading: "General",
      items: [
        { id: "calendar", title: "Agenda", href: "/agenda", icon: Calendar },
        { id: "customers", title: "Clientes", href: "/clientes", icon: UserCheck },
        {
          id: "team",
          title: "Equipo",
          href: "/equipo",
          icon: Users,
          requiresFeature: "multiCalendar",
          lockedTitle: "Gestión de Equipo Multi-Calendario",
          lockedDescription:
            "Organiza múltiples trabajadores, turnos y calendarios independientes actualizando a Plan Pro (40€/mes).",
        },
      ],
    });

    // 3. Categoría: Ajustes
    navGroups.push({
      heading: "Ajustes",
      items: [
        { id: "settings", title: "Preferencias", href: "/ajustes", icon: Settings },
        {
          id: "reports",
          title: "Reportes",
          icon: FileText,
          badge: "Próximamente",
        },
      ],
    });
  }

  const displayCollapsed = mounted ? isCollapsed : false;

  return (
    <>
      <aside
        style={{ width: "var(--sidebar-width)" }}
        className={`h-full hidden md:flex flex-col fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant/60 p-3.5 z-50 select-none font-sans ${
          isResizing ? "transition-none" : "transition-all duration-300"
        }`}
      >
        {/* Workspace Switcher */}
        <WorkspaceSwitcher
          businessName={businessName}
          businessLogo={businessLogo}
          planLabel={planLabel}
          isCollapsed={displayCollapsed}
        />

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-4 mt-2">
          {navGroups.map((group, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              {group.heading && !displayCollapsed && (
                <span className="px-3 mb-1 text-[11px] font-bold tracking-wider text-on-surface-variant/60 uppercase">
                  {group.heading}
                </span>
              )}
              {group.items.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  activeHref={pathname}
                  isCollapsed={displayCollapsed}
                  subscriptionPlan={subscriptionPlan}
                  subscriptionStatus={subscriptionStatus}
                  onOpenUpgrade={(info) => setUpgradeModalInfo({ open: true, ...info })}
                  onOpenSearch={() => setIsSearchOpen(true)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Bottom Action CTA: Nueva Cita Button */}
        {(role === "JEFE" || role === "EMPLEADO") && onNewAppointmentClick && (
          <div className="mt-auto pt-3.5 border-t border-outline-variant/50 px-0.5">
            <button
              onClick={onNewAppointmentClick}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 active:scale-[0.98] shadow-xs transition-all cursor-pointer ${
                displayCollapsed ? "!p-2.5 !w-10 !h-10 !rounded-full mx-auto" : ""
              }`}
              title="Nueva Cita"
            >
              <Plus className="w-4 h-4 shrink-0" strokeWidth={2} />
              {!displayCollapsed && <span>Nueva Cita</span>}
            </button>
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

      {/* Quick Search Modal Overlay */}
      {mounted && isSearchOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 sm:pt-28 p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
          <div
            className="fixed inset-0"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-surface border border-outline-variant/60 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 select-none">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-outline-variant/40 bg-surface">
              <Search
                className="w-5 h-5 text-primary shrink-0"
                strokeWidth={2}
              />
              <input
                autoFocus
                type="text"
                value={searchInputVal}
                onChange={(e) => setSearchInputVal(e.target.value)}
                className="flex-1 bg-transparent border-0 outline-none text-sm text-on-surface placeholder:text-on-surface-variant/60 font-medium min-w-0"
                placeholder="Buscar clientes, servicios o citas..."
              />
              {searchInputVal && (
                <button
                  onClick={() => setSearchInputVal("")}
                  className="p-1 rounded-md text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container transition-colors text-xs font-medium cursor-pointer"
                >
                  Borrar
                </button>
              )}
              <kbd
                onClick={() => setIsSearchOpen(false)}
                className="hidden sm:inline-flex items-center justify-center h-6 px-2 text-[11px] font-semibold font-mono text-on-surface-variant/70 bg-surface-container-high border border-outline-variant/60 rounded cursor-pointer hover:text-primary transition-colors"
              >
                ESC
              </kbd>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant/70 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                aria-label="Cerrar búsqueda"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
            <div className="p-6 py-10 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3 shadow-inner">
                <Command className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <p className="text-sm font-semibold text-on-surface mb-1">
                Búsqueda rápida en Volta
              </p>
              <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
                Escribe el nombre de un cliente, servicio, cita o comando rápido.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Embedded Upgrade Modal for Pro features */}
      <UpgradeProModal
        isOpen={upgradeModalInfo.open}
        onClose={() => setUpgradeModalInfo((prev) => ({ ...prev, open: false }))}
        title={upgradeModalInfo.title}
        description={upgradeModalInfo.description}
      />
    </>
  );
}
