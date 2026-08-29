"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { apiClient } from "@/lib/apiClient";

export type LopdStatus = "Aceptado" | "Pendiente" | "Rechazado";

export interface ClientItem {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  lastVisit: string;
  frequentService: string;
  stylist: string;
  avatarUrl: string;
  lopdStatus: LopdStatus;
  notes?: string;
  createdAt?: string;
}

export type ClientColumn =
  | "cliente"
  | "contacto"
  | "lopd"
  | "ultimaVisita"
  | "servicio"
  | "citas"
  | "acciones";

export const ALL_COLUMNS: { key: ClientColumn; label: string }[] = [
  { key: "cliente", label: "Cliente" },
  { key: "contacto", label: "Contacto" },
  { key: "lopd", label: "Estado LOPD" },
  { key: "ultimaVisita", label: "Última Visita" },
  { key: "servicio", label: "Servicio Habitual" },
  { key: "citas", label: "Citas Totales" },
  { key: "acciones", label: "Acciones" },
];

export const normalizeString = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ");
};

export const normalizePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("34") && digits.length > 9) {
    return digits.slice(2);
  }
  return digits;
};

export const formatPhoneForDisplay = (phone: string) => {
  if (!phone) return "";
  const clean = phone.replace(/\s+/g, "");
  const digits = clean.replace(/\D/g, "");

  if (
    digits.length === 9 &&
    (digits.startsWith("6") || digits.startsWith("7") || digits.startsWith("9"))
  ) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  }

  if (digits.length === 11 && digits.startsWith("34")) {
    return `+34 ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
  }

  if (clean.startsWith("+34") && digits.length === 11) {
    return `+34 ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
  }

  return phone;
};

export function useClientsList(businessId: string) {
  // Data state
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Table Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activityFilter, setActivityFilter] = useState<"all" | "inactive" | "new">("all");
  const [visibleColumns, setVisibleColumns] = useState<Set<ClientColumn>>(
    new Set(["cliente", "contacto", "lopd", "ultimaVisita", "servicio", "citas", "acciones"])
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Feedback Toasts
  const [showConsentToast, setShowConsentToast] = useState(false);
  const [toastPhone, setToastPhone] = useState("");
  const [showGeneralToast, setShowGeneralToast] = useState(false);
  const [toastText, setToastText] = useState("");

  const fetchData = useCallback(async () => {
    if (!businessId) return;
    setIsLoading(true);

    try {
      const [clientsRes, appointmentsRes] = await Promise.all([
        apiClient.clients.getAll<ClientItem[]>(businessId),
        apiClient.appointments.getAll<any[]>(businessId),
      ]);

      if (Array.isArray(clientsRes.data)) {
        setClients(clientsRes.data);
      }
      if (Array.isArray(appointmentsRes.data)) {
        setAppointments(appointmentsRes.data);
      }
    } catch (e) {
      console.error("Error loading clients data:", e);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleColumn = useCallback((column: ClientColumn) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(column)) {
        if (next.size > 1) next.delete(column);
      } else {
        next.add(column);
      }
      return next;
    });
  }, []);

  const getClientAppointmentsCount = useCallback(
    (clientId: string) => {
      return appointments.filter((a) => a.clientId === clientId).length;
    },
    [appointments]
  );

  const handleSaveClient = useCallback(
    async (data: any, onSuccess?: () => void) => {
      if (data.id) {
        // Edit mode
        const res = await apiClient.clients.update(data.id, {
          name: data.name,
          surname: data.surname,
          email: data.email,
          phone: data.phone,
          frequentService: data.frequency,
        });

        if (res.error) {
          setToastText("Error al actualizar el cliente");
          setShowGeneralToast(true);
          setTimeout(() => setShowGeneralToast(false), 3000);
          return;
        }

        fetchData();
        onSuccess?.();
        setToastText("Cliente actualizado correctamente");
        setShowGeneralToast(true);
        setTimeout(() => setShowGeneralToast(false), 3000);
        return;
      }

      // Create mode
      const res = await apiClient.clients.create({
        name: data.name,
        surname: data.surname,
        email: data.email,
        phone: data.phone,
        businessId,
      });

      if (res.error) {
        setToastText(res.error || "Error al guardar el cliente");
        setShowGeneralToast(true);
        setTimeout(() => setShowGeneralToast(false), 3000);
        return;
      }

      fetchData();
      onSuccess?.();
      setToastText("Cliente guardado correctamente");
      setShowGeneralToast(true);
      setTimeout(() => setShowGeneralToast(false), 3000);
    },
    [businessId, fetchData]
  );

  const handleDeleteClient = useCallback(
    async (id: string, name: string) => {
      if (!confirm(`¿Estás seguro de que deseas eliminar a ${name}?`)) return;

      const res = await apiClient.clients.delete(id);
      if (res.error) {
        alert(res.error || "Error al eliminar el cliente");
        return;
      }

      fetchData();
      setToastText("Cliente eliminado correctamente");
      setShowGeneralToast(true);
      setTimeout(() => setShowGeneralToast(false), 3000);
    },
    [fetchData]
  );

  const handleSendWhatsAppConsent = useCallback((client: ClientItem) => {
    const rawOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const cleanOrigin = rawOrigin.replace(/\/+$/, "");
    const consentUrl = `${cleanOrigin}/lopd/${client.id}`;
    const cleanPhone = client.phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Hola ${client.name}, para cumplir con la normativa de protección de datos (LOPD) y poder gestionar tus citas, por favor confirma tu consentimiento en el siguiente enlace:\n${consentUrl}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
    setToastPhone(client.phone);
    setShowConsentToast(true);
    setTimeout(() => setShowConsentToast(false), 4000);
  }, []);

  const handleSendCustomMessage = useCallback((client: ClientItem) => {
    const cleanPhone = client.phone.replace(/\D/g, "");
    const message = encodeURIComponent(`Hola ${client.name}, te escribimos desde nuestro centro.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  }, []);

  const handleExportCSV = useCallback(() => {
    if (clients.length === 0) return;
    const headers = "Nombre,Apellidos,Email,Teléfono,Estado LOPD,Última Visita,Servicio Habitual\n";
    const rows = clients
      .map((c) =>
        [
          `"${c.name}"`,
          `"${c.surname || ""}"`,
          `"${c.email || ""}"`,
          `"${c.phone || ""}"`,
          `"${c.lopdStatus}"`,
          `"${c.lastVisit || ""}"`,
          `"${c.frequentService || ""}"`,
        ].join(",")
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `clientes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [clients]);

  // Filtered dataset
  const filteredClients = useMemo(() => {
    const now = new Date();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return clients.filter((client) => {
      // Search matching (name, surname, phone, email, service)
      const q = normalizeString(searchQuery);
      const qPhone = normalizePhone(searchQuery);
      const clientPhoneNorm = normalizePhone(client.phone);

      const matchesSearch =
        !q ||
        normalizeString(client.name).includes(q) ||
        normalizeString(client.surname || "").includes(q) ||
        normalizeString(`${client.name} ${client.surname || ""}`).includes(q) ||
        normalizeString(client.email || "").includes(q) ||
        normalizeString(client.frequentService || "").includes(q) ||
        (qPhone.length > 0 && clientPhoneNorm.includes(qPhone));

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter !== "all" && client.lopdStatus !== statusFilter) {
        return false;
      }

      // Activity filter
      if (activityFilter === "inactive") {
        if (!client.lastVisit) return true;
        const lastVisitDate = new Date(client.lastVisit);
        if (isNaN(lastVisitDate.getTime()) || lastVisitDate > sixtyDaysAgo) return false;
      } else if (activityFilter === "new") {
        if (!client.createdAt) return false;
        const createdDate = new Date(client.createdAt);
        if (isNaN(createdDate.getTime()) || createdDate < thirtyDaysAgo) return false;
      }

      return true;
    });
  }, [clients, searchQuery, statusFilter, activityFilter]);

  // Paginated records
  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE) || 1;
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredClients.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredClients, currentPage]);

  const startItem = filteredClients.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredClients.length);

  return {
    clients,
    isLoading,
    fetchData,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    activityFilter,
    setActivityFilter,
    visibleColumns,
    toggleColumn,
    currentPage,
    setCurrentPage,
    totalPages,
    startItem,
    endItem,
    filteredClients,
    paginatedClients,
    getClientAppointmentsCount,
    handleSaveClient,
    handleDeleteClient,
    handleSendWhatsAppConsent,
    handleSendCustomMessage,
    handleExportCSV,
    showConsentToast,
    toastPhone,
    showGeneralToast,
    toastText,
  };
}
