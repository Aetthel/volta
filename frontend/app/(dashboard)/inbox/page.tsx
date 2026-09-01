"use client";

export const dynamic = "force-dynamic";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Inbox,
  Calendar,
  MessageSquare,
  Users,
  CreditCard,
  Bell,
  Search,
  Check,
  CheckCheck,
  Archive,
  ArchiveRestore,
  Trash2,
  ArrowUpRight,
  X,
  Filter,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import TrialBanner from "@/components/TrialBanner";
import PageHeader from "@/components/PageHeader";
import { SegmentedControl } from "@/components/ui/volta-ui";
import { useAlerts, type AlertCategory, type AlertItem } from "@/lib/alerts";

function getCategoryIcon(category?: AlertCategory) {
  switch (category) {
    case "APPOINTMENT":
      return Calendar;
    case "WHATSAPP":
      return MessageSquare;
    case "CLIENT":
      return Users;
    case "BILLING":
      return CreditCard;
    case "SYSTEM":
    default:
      return Bell;
  }
}

function getRelativeTime(dateStr: string | Date) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHrs < 24) return `${diffHrs} h`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `${diffDays} d`;

  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

export default function InboxPage() {
  const {
    alerts,
    fetchAlerts,
    markAsRead,
    markAllAsRead,
    archiveAlert,
    unarchiveAlert,
    deleteAlert,
  } = useAlerts();

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<AlertCategory | "TODAS">("TODAS");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Filtered Alert List
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (showArchived) {
        if (!alert.isArchived) return false;
      } else {
        if (alert.isArchived) return false;
      }

      if (selectedCategory !== "TODAS") {
        const cat = alert.category || "SYSTEM";
        if (cat !== selectedCategory) return false;
      }

      if (onlyUnread && alert.isRead) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = alert.title?.toLowerCase().includes(query);
        const matchesDesc = alert.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });
  }, [alerts, selectedCategory, onlyUnread, showArchived, searchQuery]);

  const totalArchivedCount = useMemo(() => {
    return alerts.filter((a) => a.isArchived).length;
  }, [alerts]);

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0 select-none">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen md:ml-[240px]">
        <TrialBanner />

        <main className="p-gutter max-w-container-max w-full mx-auto flex-1 flex flex-col">
          {/* Header */}
          <PageHeader
            title="Inbox"
            description="Centro de notificaciones y actividad de tu negocio"
            actions={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => markAllAsRead(selectedCategory !== "TODAS" ? selectedCategory : undefined)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-variant/50 rounded-xl transition-colors cursor-pointer"
                  title="Marcar todas como leídas"
                >
                  <CheckCheck className="w-4 h-4 text-primary" />
                  <span className="hidden sm:inline">Marcar leídas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowArchived(!showArchived)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                    showArchived
                      ? "bg-primary/10 text-primary"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50"
                  }`}
                  title={showArchived ? "Ver activas" : "Ver archivadas"}
                >
                  <Archive className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {showArchived ? "Activas" : `Archivadas (${totalArchivedCount})`}
                  </span>
                </button>
              </div>
            }
          />

          {/* Minimalist Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
            {/* Category Segmented Control (Screenshot 1 style) */}
            {!showArchived ? (
              <div className="overflow-x-auto no-scrollbar">
                <SegmentedControl
                  value={selectedCategory}
                  onChange={(val) => setSelectedCategory(val as AlertCategory | "TODAS")}
                  options={[
                    { value: "TODAS", label: "Todas" },
                    { value: "APPOINTMENT", label: "Citas", icon: Calendar },
                    { value: "WHATSAPP", label: "WhatsApp", icon: MessageSquare },
                    { value: "CLIENT", label: "Clientes", icon: Users },
                    { value: "BILLING", label: "Facturación", icon: CreditCard },
                    { value: "SYSTEM", label: "Sistema", icon: Bell },
                  ]}
                />
              </div>
            ) : (
              <div className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                <Archive className="w-4 h-4 text-primary" />
                <span>Notificaciones Archivadas</span>
              </div>
            )}

            {/* Quick Search & Filter */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative flex items-center bg-surface-variant/40 hover:bg-surface-variant/60 focus-within:bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-3 py-1.5 transition-all w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-on-surface-variant/60 shrink-0 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="bg-transparent border-0 outline-none text-xs text-on-surface placeholder:text-on-surface-variant/50 w-full"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-0.5 text-on-surface-variant/50 hover:text-on-surface"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setOnlyUnread(!onlyUnread)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  onlyUnread
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "text-on-surface-variant/60 hover:text-on-surface border-outline-variant/40 hover:bg-surface-variant/40"
                }`}
                title={onlyUnread ? "Mostrando solo no leídas" : "Filtrar por no leídas"}
                aria-label="Solo no leídas"
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Minimalist Unified Notification Feed */}
          {filteredAlerts.length > 0 ? (
            <div className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl divide-y divide-outline-variant/20 overflow-hidden shadow-xs">
              {filteredAlerts.map((alert) => {
                const IconComponent = getCategoryIcon(alert.category);

                return (
                  <div
                    key={alert.id}
                    className={`
                      group flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4 transition-colors hover:bg-surface-container-low/40 gap-3 sm:gap-4
                      ${!alert.isRead ? "bg-primary/[0.02]" : "opacity-75 hover:opacity-100"}
                    `}
                  >
                    {/* Left: Unread dot + Category Icon + Content */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Unread Status Dot */}
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                          !alert.isRead ? "bg-primary" : "bg-transparent"
                        }`}
                      />

                      {/* Icon */}
                      <div className="w-8 h-8 rounded-xl bg-surface-container-high/60 flex items-center justify-center text-on-surface-variant shrink-0 group-hover:text-primary transition-colors">
                        <IconComponent className="w-4 h-4" />
                      </div>

                      {/* Title & Description */}
                      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2.5">
                        <span
                          className={`text-sm truncate leading-snug ${
                            !alert.isRead
                              ? "font-semibold text-on-surface"
                              : "font-medium text-on-surface/80"
                          }`}
                        >
                          {alert.title}
                        </span>

                        <span className="hidden sm:inline text-on-surface-variant/30">•</span>

                        <span className="text-xs text-on-surface-variant/70 truncate flex-1 leading-normal">
                          {alert.description}
                        </span>
                      </div>
                    </div>

                    {/* Right: Action link, Relative time & Subtle hover actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Action Link */}
                      {alert.actionUrl && (
                        <Link
                          href={alert.actionUrl}
                          onClick={() => {
                            if (!alert.isRead) markAsRead(alert.id);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0"
                        >
                          <span>{alert.actionLabel || "Ver"}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      {/* Relative Time */}
                      <span className="text-[11px] text-on-surface-variant/50 font-medium whitespace-nowrap">
                        {getRelativeTime(alert.createdAt)}
                      </span>

                      {/* Quick Hover Action Icons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => markAsRead(alert.id)}
                          className="p-1 text-on-surface-variant/60 hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors"
                          title={alert.isRead ? "Ya leída" : "Marcar como leída"}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (alert.isArchived) {
                              unarchiveAlert(alert.id);
                            } else {
                              archiveAlert(alert.id);
                            }
                          }}
                          className="p-1 text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors"
                          title={alert.isArchived ? "Desarchivar" : "Archivar"}
                        >
                          {alert.isArchived ? (
                            <ArchiveRestore className="w-3.5 h-3.5" />
                          ) : (
                            <Archive className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteAlert(alert.id)}
                          className="p-1 text-on-surface-variant/40 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Minimalist Empty State */
            <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-surface-container-lowest border border-outline-variant/30 rounded-2xl">
              <Inbox className="w-8 h-8 text-on-surface-variant/40 mb-2.5" />
              <p className="text-sm font-semibold text-on-surface">
                {showArchived
                  ? "No hay notificaciones archivadas"
                  : onlyUnread
                    ? "No tienes notificaciones sin leer"
                    : "Todo al día"}
              </p>
              <p className="text-xs text-on-surface-variant/60 max-w-xs mt-0.5">
                {showArchived
                  ? "Las notificaciones que archives aparecerán en esta sección."
                  : "Te avisaremos cuando haya nuevas reservas o actividad."}
              </p>
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
