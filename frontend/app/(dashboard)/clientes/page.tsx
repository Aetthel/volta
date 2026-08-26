"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import dynamicImport from "next/dynamic";
import {
  Users as UsersIcon,
  Search,
  Plus,
  Download,
  Trash2,
  Edit3,
  ShieldAlert,
  ShieldCheck,
  MessageCircle,
  Copy,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ListFilter,
  Columns,
  CalendarPlus,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import TrialBanner from "@/components/TrialBanner";
import { formatDateTimeParts, cn } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UserAvatar from "@/components/UserAvatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, Empty, Skeleton, PageHeader } from "@/components/ui/volta-ui";

const AddClientModal = dynamicImport(() => import("@/components/AddClientModal"), {
  ssr: false,
});
const NewAppointmentModal = dynamicImport(() => import("@/components/NewAppointmentModal"), {
  ssr: false,
});

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

const ALL_COLUMNS: { key: ClientColumn; label: string }[] = [
  { key: "cliente", label: "Cliente" },
  { key: "contacto", label: "Contacto" },
  { key: "lopd", label: "Estado LOPD" },
  { key: "ultimaVisita", label: "Última Visita" },
  { key: "servicio", label: "Servicio Habitual" },
  { key: "citas", label: "Citas Totales" },
  { key: "acciones", label: "Acciones" },
];

const normalizeString = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ");
};

const normalizePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("34") && digits.length > 9) {
    return digits.slice(2);
  }
  return digits;
};

const formatPhoneForDisplay = (phone: string) => {
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

const getInitials = (name: string, surname?: string) => {
  const first = name ? name.charAt(0).toUpperCase() : "";
  const last = surname ? surname.charAt(0).toUpperCase() : "";
  return `${first}${last}` || "CL";
};

const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "bg-primary/20 text-primary border border-primary/30",
    "bg-secondary/20 text-secondary border border-secondary/30",
    "bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30",
    "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30",
    "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30",
    "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
  ];
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function ClientesPage() {
  const { data: session } = useSession();
  const businessId = session?.user?.businessId || "";

  // Modals & form state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientModalTriggerRect, setClientModalTriggerRect] = useState<DOMRect | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [selectedClientForAppointment, setSelectedClientForAppointment] = useState<ClientItem | null>(null);

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

  // Data state
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(() => {
    if (!businessId) return;
    setIsLoading(true);

    const p1 = fetch(`/api/backend/clients?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClients(data);
        }
      })
      .catch((e) => {
        console.error("Error loading clients:", e);
      });

    const p2 = fetch(`/api/backend/appointments?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAppointments(data);
        }
      })
      .catch((e) => {
        console.error("Error loading appointments:", e);
      });

    Promise.all([p1, p2]).finally(() => {
      setIsLoading(false);
    });
  }, [businessId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (session?.user?.name) {
      document.title = `Clientes - ${session.user.name} - Volta`;
    }
  }, [session]);

  const toggleColumn = (column: ClientColumn) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(column)) {
        if (next.size > 1) next.delete(column);
      } else {
        next.add(column);
      }
      return next;
    });
  };

  const getClientAppointmentsCount = useCallback(
    (clientId: string) => {
      return appointments.filter((a) => a.clientId === clientId).length;
    },
    [appointments]
  );

  const handleSaveClient = (data: any) => {
    if (data.id) {
      // Edit mode
      fetch(`/api/backend/clients/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          surname: data.surname,
          email: data.email,
          phone: data.phone,
          frequentService: data.frequency,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to update client");
          return res.json();
        })
        .then(() => {
          fetchData();
          setEditingClient(null);
          setToastText("Cliente actualizado correctamente");
          setShowGeneralToast(true);
          setTimeout(() => setShowGeneralToast(false), 3000);
        })
        .catch((err) => console.error("Error updating client:", err));
      return;
    }

    // Create mode
    fetch("/api/backend/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        surname: data.surname,
        email: data.email,
        phone: data.phone,
        businessId: businessId,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save client");
        return res.json();
      })
      .then(() => {
        fetchData();
        setToastText("Cliente guardado correctamente");
        setShowGeneralToast(true);
        setTimeout(() => setShowGeneralToast(false), 3000);
      })
      .catch((err) => {
        console.error("Error saving client:", err);
        setToastText("Error al guardar el cliente");
        setShowGeneralToast(true);
        setTimeout(() => setShowGeneralToast(false), 3000);
      });
  };

  const handleDeleteClient = (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${name}?`)) return;

    fetch(`/api/backend/clients/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete client");
        return res.json();
      })
      .then(() => {
        fetchData();
        setToastText("Cliente eliminado correctamente");
        setShowGeneralToast(true);
        setTimeout(() => setShowGeneralToast(false), 3000);
      })
      .catch((err) => {
        console.error("Error deleting client:", err);
        alert("Error al eliminar el cliente");
      });
  };

  const handleSendWhatsAppConsent = (client: ClientItem) => {
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
  };

  const handleSendCustomMessage = (client: ClientItem) => {
    const cleanPhone = client.phone.replace(/\D/g, "");
    const message = encodeURIComponent(`Hola ${client.name}, te escribimos desde nuestro centro.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  const handleExportCSV = () => {
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
  };

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

  // Animation variants for table rows
  const rowVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: Math.min(i * 0.03, 0.25),
        duration: 0.25,
        ease: "easeOut" as const,
      },
    }),
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Dynamic Nav Menu */}
      <Sidebar
        onNewAppointmentClick={() => {
          setSelectedClientForAppointment(null);
          setIsAppointmentModalOpen(true);
        }}
      />

      {/* Main Content Canvas */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen md:ml-[240px]">
        <TrialBanner />
        <main className="p-gutter max-w-container-max w-full mx-auto flex-1">
          <PageHeader
            title="Gestión de Clientes"
            description="Administra tu base de datos, estados de consentimiento LOPD y fidelización."
            actions={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Exportar CSV</span>
                </Button>
                <Button
                  onClick={(e) => {
                    setEditingClient(null);
                    setClientModalTriggerRect(e.currentTarget.getBoundingClientRect());
                    setIsClientModalOpen(true);
                  }}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Cliente</span>
                </Button>
              </div>
            }
          />

          {/* Main Table Container */}
          <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-sm overflow-hidden mt-2">
            {/* Filter Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between p-4 bg-surface-container-low/40 border-b border-outline-variant/40">
              <div className="flex flex-1 flex-wrap items-center gap-3">
                {/* Search input */}
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60 pointer-events-none" />
                  <Input
                    placeholder="Buscar por nombre, teléfono o email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9 bg-surface"
                  />
                </div>

                {/* Status dropdown filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 bg-surface">
                      <ListFilter className="w-4 h-4 text-on-surface-variant" />
                      <span>
                        {statusFilter === "all"
                          ? "Estado LOPD"
                          : statusFilter === "Aceptado"
                            ? "Aceptado"
                            : statusFilter === "Pendiente"
                              ? "Pendiente"
                              : "Rechazado"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Filtrar por Estado LOPD</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={statusFilter === "all"}
                      onCheckedChange={() => {
                        setStatusFilter("all");
                        setCurrentPage(1);
                      }}
                    >
                      Todos los estados
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter === "Aceptado"}
                      onCheckedChange={() => {
                        setStatusFilter("Aceptado");
                        setCurrentPage(1);
                      }}
                    >
                      Consentimiento Aceptado
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter === "Pendiente"}
                      onCheckedChange={() => {
                        setStatusFilter("Pendiente");
                        setCurrentPage(1);
                      }}
                    >
                      Consentimiento Pendiente
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter === "Rechazado"}
                      onCheckedChange={() => {
                        setStatusFilter("Rechazado");
                        setCurrentPage(1);
                      }}
                    >
                      Consentimiento Rechazado
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Quick Activity Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {(
                    [
                      { key: "all", label: "Todos" },
                      { key: "inactive", label: "Sin visita +60d" },
                      { key: "new", label: "Nuevos" },
                    ] as const
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => {
                        setActivityFilter(key);
                        setCurrentPage(1);
                      }}
                      className={`h-8 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                        activityFilter === key
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "border-outline-variant/60 bg-surface text-on-surface-variant hover:bg-surface-container-high"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Column selector toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 bg-surface shrink-0">
                    <Columns className="w-4 h-4 text-on-surface-variant" />
                    <span>Columnas</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Personalizar Columnas</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {ALL_COLUMNS.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.key}
                      checked={visibleColumns.has(column.key)}
                      onCheckedChange={() => toggleColumn(column.key)}
                    >
                      {column.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Table Area */}
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-container-low/40 hover:bg-surface-container-low/40 border-b border-outline-variant/30">
                    {visibleColumns.has("cliente") && (
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 py-3.5">
                        Cliente
                      </TableHead>
                    )}
                    {visibleColumns.has("contacto") && (
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 py-3.5">
                        Contacto
                      </TableHead>
                    )}
                    {visibleColumns.has("lopd") && (
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 py-3.5">
                        Estado LOPD
                      </TableHead>
                    )}
                    {visibleColumns.has("ultimaVisita") && (
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 py-3.5">
                        Última Visita
                      </TableHead>
                    )}
                    {visibleColumns.has("servicio") && (
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 py-3.5">
                        Servicio Habitual
                      </TableHead>
                    )}
                    {visibleColumns.has("citas") && (
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 py-3.5">
                        Citas
                      </TableHead>
                    )}
                    {visibleColumns.has("acciones") && (
                      <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 py-3.5">
                        Acciones
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(6)].map((_, i) => (
                      <TableRow key={i} className="animate-pulse border-b border-outline-variant/20">
                        {visibleColumns.has("cliente") && (
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                              <div className="flex flex-col gap-1.5">
                                <Skeleton className="w-32 h-4" />
                                <Skeleton className="w-24 h-3" />
                              </div>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.has("contacto") && (
                          <TableCell className="py-4">
                            <div className="flex flex-col gap-1">
                              <Skeleton className="w-28 h-4" />
                              <Skeleton className="w-36 h-3" />
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.has("lopd") && (
                          <TableCell className="py-4">
                            <Skeleton className="w-24 h-6 rounded-full" />
                          </TableCell>
                        )}
                        {visibleColumns.has("ultimaVisita") && (
                          <TableCell className="py-4">
                            <Skeleton className="w-24 h-4" />
                          </TableCell>
                        )}
                        {visibleColumns.has("servicio") && (
                          <TableCell className="py-4">
                            <Skeleton className="w-28 h-6 rounded-full" />
                          </TableCell>
                        )}
                        {visibleColumns.has("citas") && (
                          <TableCell className="py-4">
                            <Skeleton className="w-12 h-4" />
                          </TableCell>
                        )}
                        {visibleColumns.has("acciones") && (
                          <TableCell className="text-right py-4">
                            <Skeleton className="w-8 h-8 rounded-lg ml-auto" />
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : paginatedClients.length > 0 ? (
                    paginatedClients.map((client, index) => {
                      const apptCount = getClientAppointmentsCount(client.id);
                      const visit = formatDateTimeParts(client.lastVisit);

                      return (
                        <motion.tr
                          key={client.id}
                          custom={index}
                          initial="hidden"
                          animate="visible"
                          variants={rowVariants}
                          className="border-b border-outline-variant/20 transition-colors hover:bg-surface-container-low/60 group/row"
                        >
                          {/* Cliente Column */}
                          {visibleColumns.has("cliente") && (
                            <TableCell className="py-4 font-medium">
                              <div className="flex items-center gap-3">
                                <UserAvatar
                                  name={client.name}
                                  surname={client.surname}
                                  avatarUrl={client.avatarUrl}
                                  size="md"
                                />
                                <div className="min-w-0">
                                  <p className="font-semibold text-sm text-on-surface truncate">
                                    {client.name} {client.surname || ""}
                                  </p>
                                  <p className="text-xs text-on-surface-variant truncate">
                                    {client.email || "Sin correo"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                          )}

                          {/* Contacto Column */}
                          {visibleColumns.has("contacto") && (
                            <TableCell className="py-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium text-on-surface">
                                  {formatPhoneForDisplay(client.phone)}
                                </span>
                                {client.email && (
                                  <span className="text-xs text-on-surface-variant truncate max-w-[180px]">
                                    {client.email}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                          )}

                          {/* LOPD Column */}
                          {visibleColumns.has("lopd") && (
                            <TableCell className="py-4">
                              {client.lopdStatus === "Aceptado" ? (
                                <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 select-none">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                                  <span>Aceptado</span>
                                </div>
                              ) : client.lopdStatus === "Pendiente" ? (
                                <div
                                  className="inline-flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400 cursor-pointer hover:underline select-none"
                                  onClick={() => handleSendWhatsAppConsent(client)}
                                  title="Haz clic para enviar consentimiento por WhatsApp"
                                >
                                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse"></span>
                                  <span>Pendiente</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-2 text-xs font-medium text-rose-600 dark:text-rose-400 select-none">
                                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                                  <span>Rechazado</span>
                                </div>
                              )}
                            </TableCell>
                          )}

                          {/* Última Visita Column */}
                          {visibleColumns.has("ultimaVisita") && (
                            <TableCell className="whitespace-nowrap py-4">
                              {visit ? (
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-on-surface">
                                    {visit.date}
                                  </span>
                                  {visit.time && (
                                    <span className="text-xs text-on-surface-variant tabular-nums">
                                      {visit.time}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-on-surface-variant/60 font-medium">
                                  Sin visitas aún
                                </span>
                              )}
                            </TableCell>
                          )}

                          {/* Servicio Habitual Column */}
                          {visibleColumns.has("servicio") && (
                            <TableCell className="py-4">
                              {client.frequentService ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-surface-container-high/60 text-on-surface-variant">
                                  {client.frequentService}
                                </span>
                              ) : (
                                <span className="text-xs text-on-surface-variant/50">—</span>
                              )}
                            </TableCell>
                          )}

                          {/* Citas Totales Column */}
                          {visibleColumns.has("citas") && (
                            <TableCell className="py-4">
                              <span className="inline-flex items-center justify-center min-w-6 h-6 px-2.5 rounded-full text-xs font-semibold bg-surface-container-high/60 text-on-surface">
                                {apptCount}
                              </span>
                            </TableCell>
                          )}

                          {/* Acciones Column */}
                          {visibleColumns.has("acciones") && (
                            <TableCell className="text-right py-4">
                              <div className="flex items-center justify-end gap-1">
                                {client.lopdStatus === "Aceptado" && (
                                  <button
                                    type="button"
                                    onClick={() => handleSendCustomMessage(client)}
                                    className="p-1.5 text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200 transition-colors duration-150 cursor-pointer"
                                    title="Enviar WhatsApp"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </button>
                                )}
                                {client.lopdStatus === "Pendiente" && (
                                  <button
                                    type="button"
                                    onClick={() => handleSendWhatsAppConsent(client)}
                                    className="p-1.5 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 transition-colors duration-150 cursor-pointer"
                                    title="Enviar recordatorio LOPD por WhatsApp"
                                  >
                                    <ShieldAlert className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedClientForAppointment(client);
                                    setIsAppointmentModalOpen(true);
                                  }}
                                  className="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors duration-150 cursor-pointer"
                                  title="Agendar cita para este cliente"
                                >
                                  <CalendarPlus className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingClient(client);
                                    setIsClientModalOpen(true);
                                  }}
                                  className="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors duration-150 cursor-pointer"
                                  title="Editar cliente"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteClient(client.id, `${client.name} ${client.surname || ""}`)
                                  }
                                  className="p-1.5 text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-200 transition-colors duration-150 cursor-pointer"
                                  title="Eliminar cliente"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </TableCell>
                          )}
                        </motion.tr>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={visibleColumns.size} className="h-44 text-center">
                        <Empty
                          title="No se encontraron clientes"
                          description="Prueba a ajustar tu búsqueda o añade un nuevo cliente."
                          icon={UsersIcon}
                          action={
                            <Button
                              variant="default"
                              onClick={() => {
                                setEditingClient(null);
                                setIsClientModalOpen(true);
                              }}
                            >
                              Añadir Cliente
                            </Button>
                          }
                          className="border-none bg-transparent py-8"
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Footer */}
            {!isLoading && filteredClients.length > 0 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-outline-variant/40 bg-surface-container-low/20">
                <span className="text-xs text-on-surface-variant">
                  Mostrando <strong className="text-on-surface">{startItem}–{endItem}</strong> de{" "}
                  <strong className="text-on-surface">{filteredClients.length}</strong> clientes
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs font-semibold text-on-surface px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Mobile Floating Action Button */}
        <Button
          onClick={(e) => {
            setEditingClient(null);
            setClientModalTriggerRect(e.currentTarget.getBoundingClientRect());
            setIsClientModalOpen(true);
          }}
          variant="default"
          className="md:hidden fixed bottom-20 right-6 z-40 p-4 rounded-full shadow-lg"
        >
          <Plus className="w-5 h-5" />
        </Button>

        <BottomNav />
      </div>

      {/* Add / Edit Client Modal */}
      <AddClientModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
        clientToEdit={editingClient}
        triggerRect={clientModalTriggerRect}
      />

      {/* Appointment booking Modal */}
      <NewAppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => {
          setIsAppointmentModalOpen(false);
          setSelectedClientForAppointment(null);
        }}
        onSave={() => fetchData()}
      />

      {/* LOPD WhatsApp Consent Toast Overlay */}
      {showConsentToast && (
        <Alert
          variant="info"
          className="fixed top-6 right-6 z-[60] flex items-center gap-3 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm"
        >
          <ShieldCheck className="w-5 h-5 text-secondary shrink-0" />
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-on-secondary-container text-sm">
              Consentimiento Reenviado
            </p>
            <p className="text-xs text-on-secondary-container/80">
              Mensaje LOPD reenviado a <span className="font-semibold">{toastPhone}</span> por WhatsApp.
            </p>
          </div>
        </Alert>
      )}

      {/* General Toast Overlay */}
      {showGeneralToast && (
        <Alert
          variant="info"
          className="fixed top-6 right-6 z-[60] flex items-center gap-3 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm"
        >
          <MessageCircle className="w-5 h-5 text-secondary shrink-0" />
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-on-secondary-container text-sm">
              Información
            </p>
            <p className="text-xs text-on-secondary-container/80">{toastText}</p>
          </div>
        </Alert>
      )}
    </div>
  );
}
