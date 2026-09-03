"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { hasFeatureAccess, PlanFeature } from "@/lib/permissions";

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
  isDemoLocked?: boolean;
  children?: NavItemData[];
};

export type NavGroupData = {
  heading?: string;
  items: NavItemData[];
};

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
  onOpenUpgrade: (info: { title?: string; description?: string; mode?: "pro" | "register" }) => void;
  onOpenSearch: () => void;
  level?: number;
}) {
  const isSubtopic = level > 0;
  const hasChildren = !!(item.children && item.children.length > 0);

  const isChildActive = !!(
    hasChildren &&
    item.children?.some(
      (child) => child.href && activeHref === child.href
    )
  );

  const isExactActive = item.href ? activeHref === item.href : false;

  const isParentRouteActive = item.href
    ? activeHref.split("?")[0] === item.href.split("?")[0]
    : false;

  // Active state:
  // Top-level item is active if exact match, or if on its parent route / has active child
  // Subtopic is active only when exact match
  const isActive = isSubtopic
    ? isExactActive
    : isExactActive || isParentRouteActive || isChildActive;

  // Auto-expand if child is active or user is on this parent route
  const [isOpen, setIsOpen] = useState(isChildActive || isParentRouteActive);

  React.useEffect(() => {
    if (isChildActive || isParentRouteActive) {
      setIsOpen(true);
    }
  }, [isChildActive, isParentRouteActive]);

  const isDemoSandbox = subscriptionStatus === "DEMO_SANDBOX";
  const isLocked =
    (item.isDemoLocked && isDemoSandbox) ||
    (item.requiresFeature
      ? !hasFeatureAccess(subscriptionPlan, subscriptionStatus, item.requiresFeature)
      : false);

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
        title:
          item.lockedTitle ||
          (item.isDemoLocked && isDemoSandbox
            ? "Regístrate para acceder a Ajustes"
            : "Desbloquea esta función"),
        description:
          item.lockedDescription ||
          (item.isDemoLocked && isDemoSandbox
            ? "En el modo demostración los ajustes están bloqueados. Regístrate gratis para personalizar tu negocio."
            : undefined),
        mode: item.isDemoLocked && isDemoSandbox ? "register" : "pro",
      });
      return;
    }
    if (hasChildren) {
      setIsOpen((prev) => !prev);
      // If it has href, do not preventDefault to allow navigation
    }
  };

  const content = (
    <div
      className={`group flex items-center justify-between px-3 rounded-lg transition-all duration-150 select-none ${
        isSubtopic ? "py-2" : "py-2.5 min-h-[40px]"
      } ${
        isClickable ? "cursor-pointer" : "cursor-default"
      } ${
        isCollapsed ? "justify-center px-1.5" : ""
      } ${
        isActive && !isLocked
          ? isSubtopic
            ? "bg-primary/15 text-primary font-bold shadow-2xs"
            : "bg-primary/10 text-primary font-semibold shadow-2xs"
          : isLocked
            ? "text-on-surface-variant/60 hover:bg-primary/5 hover:text-on-surface"
            : isClickable
              ? "text-on-surface-variant hover:bg-primary/5 hover:text-primary"
              : "text-on-surface-variant/70 hover:bg-primary/5"
      }`}
      style={{ paddingLeft: !isCollapsed ? (isSubtopic ? `${level * 16 + 16}px` : undefined) : undefined }}
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
            className={`${
              isSubtopic ? "w-4 h-4" : "w-[18px] h-[18px]"
            } transition-colors ${
              isActive && !isLocked
                ? "text-primary"
                : "text-on-surface-variant/80 group-hover:text-primary"
            }`}
            strokeWidth={isActive ? 2 : 1.75}
          />
          {isCollapsed && item.badge !== undefined && item.badge !== null && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-surface" />
          )}
        </div>
        {!isCollapsed && (
          <span className={`${isSubtopic ? "text-[13px]" : "text-sm"} font-medium tracking-normal truncate`}>
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
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              } ${
                isActive && !isLocked
                  ? "text-primary"
                  : "text-on-surface-variant/60 group-hover:text-primary"
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
        <Link href={item.href} className="w-full block">
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

interface SidebarNavProps {
  navGroups: NavGroupData[];
  pathname: string;
  isCollapsed: boolean;
  subscriptionPlan: string;
  subscriptionStatus: string;
  onOpenUpgrade: (info: { title?: string; description?: string; mode?: "pro" | "register" }) => void;
  onOpenSearch: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  navGroups,
  pathname,
  isCollapsed,
  subscriptionPlan,
  subscriptionStatus,
  onOpenUpgrade,
  onOpenSearch,
}) => {
  return (
    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-4 mt-2">
      {navGroups.map((group, idx) => (
        <div key={idx} className="flex flex-col gap-1">
          {group.heading && !isCollapsed && (
            <span className="px-3 mb-1 text-[11px] font-bold tracking-wider text-on-surface-variant/60 uppercase">
              {group.heading}
            </span>
          )}
          {group.items.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              activeHref={pathname}
              isCollapsed={isCollapsed}
              subscriptionPlan={subscriptionPlan}
              subscriptionStatus={subscriptionStatus}
              onOpenUpgrade={onOpenUpgrade}
              onOpenSearch={onOpenSearch}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
