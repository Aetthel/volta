"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
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

interface SidebarNavProps {
  navGroups: NavGroupData[];
  pathname: string;
  isCollapsed: boolean;
  subscriptionPlan: string;
  subscriptionStatus: string;
  onOpenUpgrade: (info: { title?: string; description?: string }) => void;
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
