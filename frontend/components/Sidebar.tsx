"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Sparkles,
  Store,
  BarChart3,
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
const MAX_WIDTH = 320;
const SNAP_THRESHOLD = 120;
const DEFAULT_WIDTH = 240;

function WorkspaceSwitcher({
  businessName,
  planLabel,
  isCollapsed,
}: {
  businessName: string;
  planLabel: string;
  isCollapsed: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const initial = businessName.trim().charAt(0).toUpperCase() || "V";

  return (
    <div className="relative">
      <div
        onClick={() => !isCollapsed && setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-2 py-2 mb-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors select-none group ${
          isCollapsed ? "justify-center" : ""
        }`}
        title={businessName}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-[6px] bg-primary text-primary-foreground flex items-center justify-center font-semibold text-[13px] shadow-sm shrink-0">
            {initial}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="text-[13px] font-medium leading-none mb-1 text-foreground truncate max-w-[130px]">
                {businessName}
              </span>
              <span className="text-[11px] text-muted-foreground leading-none">
                {planLabel}
              </span>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <ChevronDown
            className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground/70 transition-colors shrink-0"
            strokeWidth={1.5}
          />
        )}
      </div>

      {isOpen && !isCollapsed && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[52px] left-0 w-full bg-white border border-border/50 rounded-lg shadow-xl z-50 py-1 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-2 mx-1 text-[13px] rounded-md bg-primary/10 text-primary font-medium">
              {businessName} ({planLabel})
            </div>
            <div className="h-px bg-border/50 my-1 mx-2" />
            <Link
              href="/ajustes"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 mx-1 text-[13px] text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-md cursor-pointer flex items-center gap-2 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Ajustes de Cuenta</span>
            </Link>
          </div>
        </>
      )}
    </div>
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

  const handleClick = (e: React.MouseEvent) => {
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
      className={`group flex items-center justify-between px-2.5 py-[7px] rounded-[6px] cursor-pointer transition-all duration-200 select-none ${
        isCollapsed ? "justify-center px-1" : ""
      } ${
        isActive && !isLocked
          ? "bg-black/5 dark:bg-white/10 text-foreground font-medium"
          : isLocked
            ? "text-muted-foreground/60 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground/80"
            : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground/90"
      }`}
      style={{ paddingLeft: !isCollapsed ? `${level * 12 + 10}px` : undefined }}
      onClick={handleClick}
      title={
        isCollapsed
          ? isLocked
            ? `${item.title} (Plan Pro)`
            : item.title
          : undefined
      }
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="relative flex items-center justify-center shrink-0">
          <item.icon
            className={`w-[16px] h-[16px] transition-colors ${
              isActive && !isLocked
                ? "text-foreground"
                : "text-muted-foreground/70 group-hover:text-foreground/70"
            }`}
            strokeWidth={1.5}
          />
          {isCollapsed && isLocked && (
            <Lock className="w-2.5 h-2.5 text-primary absolute -top-1 -right-1" />
          )}
        </div>
        {!isCollapsed && (
          <span className="text-[13px] tracking-wide truncate">
            {item.title}
          </span>
        )}
      </div>

      {!isCollapsed && (
        <div className="flex items-center gap-1.5 shrink-0">
          {item.shortcut && (
            <kbd className="hidden group-hover:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium font-mono text-muted-foreground/60 bg-background/50 border border-border/50 rounded-[4px] shadow-xs">
              {item.shortcut}
            </kbd>
          )}
          {item.badge !== undefined && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">
              {item.badge}
            </span>
          )}
          {isLocked && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-bold rounded bg-primary/10 text-primary border border-primary/20">
              <Lock className="w-2.5 h-2.5" />
              <span>PRO</span>
            </span>
          )}
          {hasChildren && (
            <ChevronRight
              className={`w-3.5 h-3.5 text-muted-foreground/50 transition-transform duration-200 ${
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
              className="absolute top-0 bottom-0 border-l border-black/5 dark:border-white/5"
              style={{ left: `${level * 12 + 17.5}px` }}
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
  const businessName = session?.user?.name || "Volta";
  const planLabel = subscriptionPlan === "BASIC" ? "Plan Básico" : "Plan Pro";

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
      items: [
        { id: "search", title: "Search", icon: Search, shortcut: "⌘K" },
        { id: "admin", title: "Control Global", href: "/admin", icon: BarChart3 },
        { id: "sedes", title: "Locales", href: "/sedes", icon: Store },
      ],
    });
  } else {
    // Primary Group
    navGroups.push({
      items: [
        { id: "search", title: "Search", icon: Search, shortcut: "⌘K" },
        { id: "home", title: "Home", href: "/inicio", icon: LayoutDashboard },
        { id: "inbox", title: "Inbox", href: "/inbox", icon: Inbox, badge: 12 },
        {
          id: "analytics",
          title: "Analytics",
          href: "/analitica",
          icon: Activity,
          requiresFeature: "businessAnalytics",
          lockedTitle: "Analítica de Negocio",
          lockedDescription:
            "Visualiza informes detallados de ingresos, retención de clientes y crecimiento actualizando al Plan Pro (40€/mes).",
        },
      ],
    });

    // Workspace / Management Group
    navGroups.push({
      heading: "Workspace",
      items: [
        { id: "calendar", title: "Calendar", href: "/agenda", icon: Calendar },
        { id: "team", title: "Team", href: "/equipo", icon: Users },
        { id: "customers", title: "Customers", href: "/clientes", icon: Globe },
      ],
    });
  }

  const bottomItems: NavItemData[] = [
    { id: "settings", title: "Settings", href: "/ajustes", icon: Settings, shortcut: "⌘," },
    { id: "logout", title: "Log out", icon: LogOut },
  ];

  const displayCollapsed = mounted ? isCollapsed : false;

  return (
    <>
      <aside
        style={{ width: "var(--sidebar-width)" }}
        className={`h-full hidden md:flex flex-col fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant/60 p-3 z-50 select-none ${
          isResizing ? "transition-none" : "transition-all duration-300"
        }`}
      >
        {/* Workspace Switcher */}
        <WorkspaceSwitcher
          businessName={businessName}
          planLabel={planLabel}
          isCollapsed={displayCollapsed}
        />

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-4 mt-2">
          {navGroups.map((group, idx) => (
            <div key={idx} className="flex flex-col gap-0.5">
              {group.heading && !displayCollapsed && (
                <span className="px-2.5 mb-1 text-[11px] font-semibold tracking-wider text-muted-foreground/50 uppercase">
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

        {/* Bottom Area with Action CTA, Settings & Log out */}
        <div className="mt-auto pt-4 border-t border-outline-variant/50 flex flex-col gap-0.5">
          {/* Action CTA: Nueva Cita Button */}
          {(role === "JEFE" || role === "EMPLEADO") && onNewAppointmentClick && (
            <div className="mb-2 px-1">
              <button
                onClick={onNewAppointmentClick}
                className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[6px] text-[13px] font-medium bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] shadow-xs transition-all cursor-pointer ${
                  displayCollapsed ? "!p-2 !w-8 !h-8 !rounded-full mx-auto" : ""
                }`}
                title="Nueva Cita"
              >
                <Plus className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                {!displayCollapsed && <span>Nueva Cita</span>}
              </button>
            </div>
          )}

          {bottomItems.map((item) => {
            if (item.id === "logout") {
              return (
                <button
                  key={item.id}
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className={`group flex items-center justify-between px-2.5 py-[7px] rounded-[6px] cursor-pointer transition-all duration-200 select-none text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-error border-none bg-transparent w-full text-left ${
                    displayCollapsed ? "justify-center px-1" : ""
                  }`}
                  title={displayCollapsed ? "Log out" : undefined}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <LogOut
                      className="w-[16px] h-[16px] text-muted-foreground/70 group-hover:text-error shrink-0 transition-colors"
                      strokeWidth={1.5}
                    />
                    {!displayCollapsed && (
                      <span className="text-[13px] tracking-wide truncate">
                        Log out
                      </span>
                    )}
                  </div>
                </button>
              );
            }

            return (
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
            );
          })}
        </div>

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
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-xs px-4 animate-in fade-in duration-150">
          <div
            className="absolute inset-0"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-white border border-outline-variant/60 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center px-4 border-b border-outline-variant/40">
              <Search
                className="w-[18px] h-[18px] text-muted-foreground mr-3 shrink-0"
                strokeWidth={1.5}
              />
              <input
                autoFocus
                value={searchInputVal}
                onChange={(e) => setSearchInputVal(e.target.value)}
                className="flex-1 bg-transparent py-4 outline-none text-[14px] text-foreground placeholder:text-muted-foreground/50"
                placeholder="Buscar clientes, servicios o citas..."
              />
              <kbd
                onClick={() => setIsSearchOpen(false)}
                className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 ml-2 text-[10px] font-medium font-mono text-muted-foreground/70 bg-black/5 border border-black/10 rounded-[4px] cursor-pointer hover:text-foreground hover:bg-black/10 transition-colors"
              >
                ESC
              </kbd>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="ml-3 p-1 rounded-md text-muted-foreground hover:bg-black/5 hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>
            </div>
            <div className="p-2 py-8 flex flex-col items-center justify-center">
              <Command
                className="w-6 h-6 text-muted-foreground/30 mb-2"
                strokeWidth={1.5}
              />
              <p className="text-[13px] text-muted-foreground font-medium">
                Escribe para buscar en Volta...
              </p>
            </div>
          </div>
        </div>
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
