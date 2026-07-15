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

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    if (status !== "authenticated") return;
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
      // Optimistic update
      setAlerts((prev) =>
        prev.map((alert) => (alert.id === id ? { ...alert, isRead: true } : alert))
      );

      const res = await fetch(`/api/backend/alerts/${id}/read`, {
        method: "PUT",
      });

      if (!res.ok) {
        // Rollback if request fails
        fetchAlerts();
      }
    } catch (e) {
      console.error("Error marking alert as read:", e);
      fetchAlerts();
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic update
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

  // Initial load and periodic polling
  useEffect(() => {
    if (status === "authenticated") {
      setIsLoading(true);
      fetchAlerts().finally(() => setIsLoading(false));

      // Poll every 30 seconds
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

export function useAlerts() {
  const context = useContext(AlertsContext);
  if (context === undefined) {
    throw new Error("useAlerts must be used within an AlertsProvider");
  }
  return context;
}
