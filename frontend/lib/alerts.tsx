"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface AlertItem {
  id: string;
  type: "EMERGENTE" | "AVISO" | "NOTIFICACION";
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
}

interface AlertsContextType {
  alerts: AlertItem[];
  isLoading: boolean;
  fetchAlerts: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  hasUnread: boolean;
  unreadCount: number;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

function AlertsProviderClient({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    if (status === "unauthenticated") return;
    try {
      const res = await fetch("/api/backend/alerts");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAlerts(data);
        }
      }
    } catch (e) {
      console.error("Error fetching alerts:", e);
    }
  }, [status]);

  const markAsRead = async (id: string) => {
    try {
      setAlerts((prev) =>
        prev.map((alert) => (alert.id === id ? { ...alert, isRead: true } : alert))
      );

      const res = await fetch(`/api/backend/alerts/${id}/read`, {
        method: "PUT",
      });

      if (!res.ok) {
        fetchAlerts();
      }
    } catch (e) {
      console.error("Error marking alert as read:", e);
      fetchAlerts();
    }
  };

  const markAllAsRead = async () => {
    try {
      setAlerts((prev) => prev.map((alert) => ({ ...alert, isRead: true })));

      const res = await fetch("/api/backend/alerts/read-all", {
        method: "PUT",
      });

      if (!res.ok) {
        fetchAlerts();
      }
    } catch (e) {
      console.error("Error marking all alerts as read:", e);
      fetchAlerts();
    }
  };

  useEffect(() => {
    if (status !== "unauthenticated") {
      setIsLoading(true);
      fetchAlerts().finally(() => setIsLoading(false));

      const interval = setInterval(() => {
        fetchAlerts();
      }, 30000);

      return () => clearInterval(interval);
    } else {
      setAlerts([]);
    }
  }, [status, fetchAlerts]);

  const unreadAlerts = alerts.filter((a) => !a.isRead);
  const unreadCount = unreadAlerts.length;
  const hasUnread = unreadCount > 0;

  return (
    <AlertsContext.Provider
      value={{
        alerts,
        isLoading,
        fetchAlerts,
        markAsRead,
        markAllAsRead,
        hasUnread,
        unreadCount,
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
          hasUnread: false,
          unreadCount: 0,
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
      hasUnread: false,
      unreadCount: 0,
    };
  }
  return context;
}
