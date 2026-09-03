"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import {
  Search,
  LayoutDashboard,
  Users,
  Settings,
  Inbox,
  Calendar,
  Activity,
  Plus,
  Store,
  BarChart3,
  UserCheck,
  FileText,
  User,
  MessageSquare,
  Palette,
  CreditCard,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { useAlerts } from "@/lib/alerts";
import { WorkspaceSwitcher } from "./sidebar/WorkspaceSwitcher";
import { SidebarNav, type NavGroupData, type NavItemData } from "./sidebar/SidebarNav";
import { CommandPaletteModal } from "./sidebar/CommandPaletteModal";

import UpgradeProModal from "@/components/UpgradeProModal";

interface SidebarProps {
  onNewAppointmentClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const MIN_WIDTH = 80;
const MAX_WIDTH = 340;
const SNAP_THRESHOLD = 120;
const DEFAULT_WIDTH = 260;

export default function Sidebar({ onNewAppointmentClick }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || searchParams.get("seccion");
  const fullActiveHref = currentTab ? `${pathname}?tab=${currentTab}` : pathname;

  const { data: session } = useSession();
  const { unreadCount } = useAlerts();

  const role = session?.user?.role || "EMPLEADO";
  const subscriptionPlan = session?.user?.subscriptionPlan || "BASIC";
  const subscriptionStatus = session?.user?.subscriptionStatus || "ACTIVE";
  const planLabel = subscriptionPlan === "BASIC" ? "Plan Básico" : "Plan Pro";
  const businessId = session?.user?.businessId;

  const [businessData, setBusinessData] = useState<{
    name?: string;
    logoUrl?: string | null;
  }>({});

  useEffect(() => {
    if (!businessId || businessId === "mock-business-id") return;
    apiClient.business
      .getById<any>(businessId)
      .then((res) => {
        if (res.data && !res.data.error) {
          setBusinessData({
            name: res.data.name,
            logoUrl: res.data.logoUrl,
          });
        }
      })
      .catch((err) => console.error("Error loading business in sidebar:", err));
  }, [businessId]);

  const businessName =
    businessData.name ||
    session?.user?.businessName ||
    "Mi Negocio";
  const businessLogo =
    businessData.logoUrl ||
    session?.user?.businessLogoUrl ||
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
    mode?: "pro" | "register";
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

  const settingsChildren: NavItemData[] = [
    {
      id: "settings-perfil",
      title: "Perfil y Seguridad",
      href: "/ajustes?tab=perfil",
      icon: User,
    },
  ];

  if (role === "JEFE" || role === "EMPLEADO") {
    settingsChildren.push({
      id: "settings-mensajeria",
      title: "Mensajes y WhatsApp",
      href: "/ajustes?tab=mensajeria",
      icon: MessageSquare,
    });
  }

  if (role === "JEFE") {
    settingsChildren.push({
      id: "settings-gestion",
      title: "Gestión del Negocio",
      href: "/ajustes?tab=gestion",
      icon: Store,
    });
    settingsChildren.push({
      id: "settings-personalizacion",
      title: "Personalización",
      href: "/ajustes?tab=personalizacion",
      icon: Palette,
    });
  }

  if (role === "ADMIN" || role === "JEFE") {
    settingsChildren.push({
      id: "settings-facturacion",
      title: "Facturación",
      href: "/ajustes?tab=facturacion",
      icon: CreditCard,
    });
  }

  const isDemoSandbox = subscriptionStatus === "DEMO_SANDBOX";

  const settingsItem: NavItemData = {
    id: "settings",
    title: "Ajustes",
    href: isDemoSandbox ? undefined : "/ajustes",
    icon: Settings,
    isDemoLocked: isDemoSandbox,
    lockedTitle: "Regístrate para acceder a Ajustes",
    lockedDescription:
      "Estás explorando Volta en modo demo efímero. Crea tu cuenta gratuita para configurar los horarios, servicios, datos comerciales y WhatsApp de tu negocio.",
    children: isDemoSandbox ? undefined : settingsChildren,
  };

  const navGroups: NavGroupData[] = [];

  if (role === "ADMIN") {
    navGroups.push({
      heading: "Principal",
      items: [
        { id: "search", title: "Buscar", icon: Search, shortcut: "⌘K", badge: "Nuevo" },
        { id: "admin", title: "Control Global", href: "/admin", icon: BarChart3 },
        { id: "sedes", title: "Locales", href: "/sedes", icon: Store },
        {
          id: "inbox",
          title: "Inbox",
          href: "/inbox",
          icon: Inbox,
          badge: unreadCount > 0 ? (unreadCount > 99 ? "+99" : `+${unreadCount}`) : undefined,
        },
      ],
    });
    navGroups.push({
      heading: "Ajustes",
      items: [settingsItem],
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
          href: "/inbox",
          icon: Inbox,
          badge: unreadCount > 0 ? (unreadCount > 99 ? "+99" : `+${unreadCount}`) : undefined,
        },
        { id: "analytics", title: "Analítica", icon: Activity, badge: "Próximamente" },
      ],
    });

    // 2. Categoría: General
    navGroups.push({
      heading: "General",
      items: [
        { id: "calendar", title: "Agenda", href: "/agenda", icon: Calendar },
        { id: "customers", title: "Clientes", href: "/clientes", icon: UserCheck },
        { id: "team", title: "Equipo", href: "/equipo", icon: Users },
      ],
    });

    // 3. Categoría: Ajustes
    navGroups.push({
      heading: "Ajustes",
      items: [
        settingsItem,
        { id: "reports", title: "Reportes", icon: FileText, badge: "Próximamente" },
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
        <SidebarNav
          navGroups={navGroups}
          pathname={fullActiveHref}
          isCollapsed={displayCollapsed}
          subscriptionPlan={subscriptionPlan}
          subscriptionStatus={subscriptionStatus}
          onOpenUpgrade={(info) => setUpgradeModalInfo({ open: true, ...info })}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

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
      <CommandPaletteModal
        isOpen={mounted && isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchInputVal={searchInputVal}
        setSearchInputVal={setSearchInputVal}
      />

      {/* Embedded Upgrade Modal for Pro features or Demo Registration */}
      <UpgradeProModal
        isOpen={upgradeModalInfo.open}
        onClose={() => setUpgradeModalInfo((prev) => ({ ...prev, open: false }))}
        title={upgradeModalInfo.title}
        description={upgradeModalInfo.description}
        mode={upgradeModalInfo.mode}
      />
    </>
  );
}
