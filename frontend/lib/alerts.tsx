"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/apiClient";

export type AlertCategory = "APPOINTMENT" | "WHATSAPP" | "CLIENT" | "BILLING" | "SYSTEM";

export interface AlertItem {
  id: string;
  type: "EMERGENTE" | "AVISO" | "NOTIFICACION";
  category?: AlertCategory;
  title: string;
  description: string;
  actionUrl?: string | null;
  actionLabel?: string | null;
  isRead: boolean;
  isArchived?: boolean;
  createdAt: string;
}

interface AlertsContextType {
  alerts: AlertItem[];
  isLoading: boolean;
  fetchAlerts: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (category?: string) => Promise<void>;
  archiveAlert: (id: string) => Promise<void>;
  unarchiveAlert: (id: string) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  hasUnread: boolean;
  unreadCount: number;
  categoryCounts: Record<string, number>;
  categoryUnreadCounts: Record<string, number>;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

function AlertsProviderClient({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Silencio deliberado ante un fallo: esto se refresca en intervalo (más abajo),
  // así que avisar en cada vuelta sería spam. Se reintenta en el siguiente tick.
  const fetchAlerts = useCallback(async () => {
    if (status === "unauthenticated") return;
    const res = await apiClient.get<AlertItem[]>("/alerts");
    if (Array.isArray(res.data)) {
      setAlerts(res.data);
    }
  }, [status]);

  // Las cinco mutaciones siguientes actualizan el estado de forma optimista y
  // recargan desde el servidor si la petición falla, para volver al estado real.
  const markAsRead = async (id: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, isRead: true } : alert)));

    const res = await apiClient.put(`/alerts/${id}/read`);
    if (res.error) {
      fetchAlerts();
    }
  };

  const markAllAsRead = async (category?: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        !category || category === "TODAS" || alert.category === category
          ? { ...alert, isRead: true }
          : alert
      )
    );

    const path =
      category && category !== "TODAS"
        ? `/alerts/read-all?category=${encodeURIComponent(category)}`
        : "/alerts/read-all";

    const res = await apiClient.put(path);
    if (res.error) {
      fetchAlerts();
    }
  };

  const archiveAlert = async (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, isArchived: true } : alert))
    );

    const res = await apiClient.put(`/alerts/${id}/archive`);
    if (res.error) {
      fetchAlerts();
    }
  };

  const unarchiveAlert = async (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, isArchived: false } : alert))
    );

    const res = await apiClient.put(`/alerts/${id}/unarchive`);
    if (res.error) {
      fetchAlerts();
    }
  };

  const deleteAlert = async (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));

    const res = await apiClient.delete(`/alerts/${id}`);
    if (res.error) {
      fetchAlerts();
    }
  };

  useEffect(() => {
    if (status !== "unauthenticated") {
      setIsLoading(true);
      fetchAlerts().finally(() => setIsLoading(false));

      const interval = setInterval(() => {
        fetchAlerts();
      }, 20000);

      return () => clearInterval(interval);
    } else {
      setAlerts([]);
    }
  }, [status, fetchAlerts]);

  const activeAlerts = useMemo(() => alerts.filter((a) => !a.isArchived), [alerts]);
  const unreadAlerts = useMemo(() => activeAlerts.filter((a) => !a.isRead), [activeAlerts]);
  const unreadCount = unreadAlerts.length;
  const hasUnread = unreadCount > 0;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      TODAS: activeAlerts.length,
      APPOINTMENT: 0,
      WHATSAPP: 0,
      CLIENT: 0,
      BILLING: 0,
      SYSTEM: 0,
    };
    activeAlerts.forEach((a) => {
      const cat = a.category || "SYSTEM";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [activeAlerts]);

  const categoryUnreadCounts = useMemo(() => {
    const counts: Record<string, number> = {
      TODAS: unreadAlerts.length,
      APPOINTMENT: 0,
      WHATSAPP: 0,
      CLIENT: 0,
      BILLING: 0,
      SYSTEM: 0,
    };
    unreadAlerts.forEach((a) => {
      const cat = a.category || "SYSTEM";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [unreadAlerts]);

  return (
    <AlertsContext.Provider
      value={{
        alerts,
        isLoading,
        fetchAlerts,
        markAsRead,
        markAllAsRead,
        archiveAlert,
        unarchiveAlert,
        deleteAlert,
        hasUnread,
        unreadCount,
        categoryCounts,
        categoryUnreadCounts,
      }}
    >
      {children}
    </AlertsContext.Provider>
  );
}

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  if (typeof window === "undefined") {
    return (
      <AlertsContext.Provider
        value={{
          alerts: [],
          isLoading: false,
          fetchAlerts: async () => {},
          markAsRead: async () => {},
          markAllAsRead: async () => {},
          archiveAlert: async () => {},
          unarchiveAlert: async () => {},
          deleteAlert: async () => {},
          hasUnread: false,
          unreadCount: 0,
          categoryCounts: { TODAS: 0, APPOINTMENT: 0, WHATSAPP: 0, CLIENT: 0, BILLING: 0, SYSTEM: 0 },
          categoryUnreadCounts: { TODAS: 0, APPOINTMENT: 0, WHATSAPP: 0, CLIENT: 0, BILLING: 0, SYSTEM: 0 },
        }}
      >
        {children}
      </AlertsContext.Provider>
    );
  }

  return <AlertsProviderClient>{children}</AlertsProviderClient>;
}

export function useAlerts() {
  const context = useContext(AlertsContext);
  if (context === undefined) {
    return {
      alerts: [],
      isLoading: false,
      fetchAlerts: async () => {},
      markAsRead: async () => {},
      markAllAsRead: async () => {},
      archiveAlert: async () => {},
      unarchiveAlert: async () => {},
      deleteAlert: async () => {},
      hasUnread: false,
      unreadCount: 0,
      categoryCounts: { TODAS: 0, APPOINTMENT: 0, WHATSAPP: 0, CLIENT: 0, BILLING: 0, SYSTEM: 0 },
      categoryUnreadCounts: { TODAS: 0, APPOINTMENT: 0, WHATSAPP: 0, CLIENT: 0, BILLING: 0, SYSTEM: 0 },
    };
  }
  return context;
}

