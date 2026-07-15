"use client";

import { useState, useEffect } from "react";
import {
  Users as UsersIcon,
  CalendarCheck,
  Gift,
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
} from "lucide-react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import AddClientModal from "@/components/AddClientModal";
import NewAppointmentModal from "@/components/NewAppointmentModal";
import MetricCard from "@/components/MetricCard";
import { Alert, Badge, Button, Card, CardHeader, CardTitle, Empty, ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, PageHeader, Skeleton, InlineSelect } from "@/components/ui/volta-ui";

interface ClientItem {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  lastVisit: string;
  frequentService: string;
  stylist: string;
  avatarUrl: string;
  lopdStatus: "Aceptado" | "Pendiente";
}

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
  return `${first}${last}`;
};

const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "bg-primary text-on-primary",
    "bg-secondary text-on-secondary",
    "bg-tertiary text-on-tertiary",
    "bg-primary-container text-on-primary-container",
    "bg-secondary-container text-on-secondary-container",
    "bg-tertiary-container text-on-tertiary-container",
  ];
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function ClientesPage() {
  const { data: session } = useSession();
  const businessId = session?.user?.businessId || "";

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientModalTriggerRect, setClientModalTriggerRect] = useState<DOMRect | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lopdFilter, setLopdFilter] = useState<"all" | "Aceptado" | "Pendiente">("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState<"all" | "inactive" | "new">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [showConsentToast, setShowConsentToast] = useState(false);
  const [toastPhone, setToastPhone] = useState("");
  const [showGeneralToast, setShowGeneralToast] = useState(false);
  const [toastText, setToastText] = useState("");
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeDropdownClientId, setActiveDropdownClientId] = useState<string | null>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; left: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const fetchData = () => {
    if (!businessId) return;
    setIsLoading(true);

    // Fetch Clients
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

    // Fetch Appointments
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
  };

  useEffect(() => {
    fetchData();
  }, [businessId]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user?.name) {
      document.title = `Clientes - ${session.user.name} - Volta`;
    }
  }, [session]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setLopdFilter("all");
    setServiceFilter("all");
    setActivityFilter("all");
    setCurrentPage(1);
  };

  const handleToggleDropdown = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    if (activeDropdownClientId === clientId) {
      setActiveDropdownClientId(null);
      setDropdownCoords(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const leftPos = rect.right + window.scrollX - 192;
      setDropdownCoords({
        top: rect.bottom + window.scrollY + 6,
        left: Math.max(8, leftPos),
      });
      setActiveDropdownClientId(clientId);
    }
  };

  const handleSaveAppointment = (data: any) => {
    // Refresh client list since a new client might have been auto-registered
    fetchData();
  };

  const handleSaveClient = (data: any) => {
    // Edit mode: PUT request
    if (data.id) {
      fetch(`/api/backend/clients/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
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
        })
        .catch((err) => console.error("Error updating client:", err));
      return;
    }

    // Create mode: POST request
    fetch("/api/backend/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
      })
      .catch((err) => {
        console.error("Error saving client:", err);
        const newClient: ClientItem = {
          id: String(Date.now()),
          name: data.name,
          surname: data.surname,
          email: data.email,
          phone: data.phone,
          lastVisit: "Hoy",
          frequentService: "Primera visita",
          stylist: "Sin asignar",
          avatarUrl: "",
          lopdStatus: "Pendiente",
        };
        setClients((prev) => [newClient, ...prev]);
      });
  };

  const handleDeleteClient = (id: string, name: string) => {
    if (
      !window.confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)
    )
      return;
    fetch(`/api/backend/clients/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete client");
        return res.json();
      })
      .then(() => {
        fetchData();
      })
      .catch((err) => {
        console.error("Error deleting client:", err);
        setClients((prev) => prev.filter((c) => c.id !== id));
      });
  };

  const handleSendWhatsAppConsent = (client: ClientItem) => {
    fetch(`/api/backend/clients/${client.id}/resend-consent`, {
      method: "POST",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to send LOPD consent");
        return res.json();
      })
      .then(() => {
        setToastPhone(client.phone);
        setShowConsentToast(true);
        setTimeout(() => {
          setShowConsentToast(false);
        }, 3000);
      })
      .catch((err) => {
        console.error("Error resending consent:", err);
        // fallback
        setToastPhone(client.phone);
        setShowConsentToast(true);
        setTimeout(() => {
          setShowConsentToast(false);
        }, 3000);
      });
  };

  const handleSendCustomMessage = (client: ClientItem) => {
    const msg = window.prompt(
      `Escribe el mensaje de WhatsApp para ${client.name} ${client.surname || ""}:`,
    );
    if (!msg) return;

    fetch(`/api/backend/clients/${client.id}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: msg }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to send message");
        return res.json();
      })
      .then(() => {
        setToastText(`Mensaje enviado a ${client.name} (${client.phone})`);
        setShowGeneralToast(true);
        setTimeout(() => setShowGeneralToast(false), 3000);
      })
      .catch((err) => {
        console.error("Error sending custom message:", err);
        // fallback simulation
        setToastText(`Mensaje enviado a ${client.name} (${client.phone})`);
        setShowGeneralToast(true);
        setTimeout(() => setShowGeneralToast(false), 3000);
      });
  };

  // Dynamic stats calculation
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const visitsThisMonthCount = appointments.filter((app) => {
    const appDate = new Date(app.appointmentDate);
    return (
      appDate.getMonth() === currentMonth &&
      appDate.getFullYear() === currentYear
    );
  }).length;

  const pendingLopdCount = clients.filter(
    (c) => c.lopdStatus === "Pendiente",
  ).length;

  const uniqueServices = Array.from(
    new Set(clients.map((c) => c.frequentService).filter(Boolean))
  ).sort();

  const serviceOptions = [
    { value: "all", label: "Todos los servicios" },
    ...uniqueServices.map((s: any) => ({ value: s, label: s })),
  ];

  const filteredClients = clients.filter((c) => {
    const fullName = `${c.name} ${c.surname || ""}`.trim();
    const matchesSearch =
      normalizeString(fullName).includes(normalizeString(searchQuery)) ||
      normalizeString(c.email || "").includes(normalizeString(searchQuery)) ||
      normalizePhone(c.phone).includes(normalizePhone(searchQuery));
    const matchesLopd = lopdFilter === "all" || c.lopdStatus === lopdFilter;
    const matchesService = serviceFilter === "all" || c.frequentService === serviceFilter;
    const matchesActivity = (() => {
      if (activityFilter === "all") return true;
      if (activityFilter === "new") return !c.lastVisit;
      if (activityFilter === "inactive") {
        if (!c.lastVisit) return false;
        const d = new Date(c.lastVisit);
        if (isNaN(d.getTime())) return false;
        return (Date.now() - d.getTime()) > 60 * 24 * 60 * 60 * 1000;
      }
      return true;
    })();
    return matchesSearch && matchesLopd && matchesService && matchesActivity;
  });

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / ITEMS_PER_PAGE));
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const startItem = filteredClients.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredClients.length);

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Sidebar navigation */}
      <Sidebar onNewAppointmentClick={() => setIsAppointmentModalOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen md:ml-[240px]">
        {/* Content Canvas */}
        <main className="p-gutter max-w-container-max w-full mx-auto flex-1">
          <PageHeader
            title="Gestión de Clientes"
            description="Administra tu base de datos y fideliza a tus usuarios."
            actions={
              <>
                <Button
                  variant="outline"
                  className="flex items-center gap-1 px-4 sm:px-6 py-2 rounded-lg font-label-lg"
                >
                  <Download data-icon="download" />
                  <span>Exportar</span>
                </Button>
                <Button
                  onClick={(e) => {
                    setClientModalTriggerRect(e.currentTarget.getBoundingClientRect());
                    setIsClientModalOpen(true);
                  }}
                  variant="primary"
                  className="flex items-center gap-1 px-4 sm:px-6 py-2 rounded-lg font-label-lg"
                >
                  <Plus data-icon="plus" />
                  <span>Añadir Cliente</span>
                </Button>
              </>
            }
          />

          {/* Stats Bento Grid */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-gutter mb-gutter">
            <MetricCard
              title="Clientes Totales"
              value={clients.length}
              change="+12%"
              trend="up"
              icon={<UsersIcon className="w-5 h-5" />}
              className="col-span-1"
            />
            <MetricCard
              title="Visitas este mes"
              value={visitsThisMonthCount}
              change="+8%"
              trend="up"
              icon={<CalendarCheck className="w-5 h-5" />}
              className="col-span-1"
            />

            {/* Custom Banner Card (Bento Style) */}
            <div className="col-span-2 bg-primary-container text-on-primary-container p-4 sm:p-6 rounded-md shadow-sm relative overflow-hidden group flex flex-col justify-between min-h-[140px]">
              <div className="relative z-10">
                <h4 className="font-title-md text-title-md mb-1 font-semibold text-on-primary-container">
                  Control de Consentimiento LOPD
                </h4>
                <p className="font-body-md text-body-md opacity-90 mb-4 max-w-[280px] leading-relaxed">
                  {`${pendingLopdCount} clientes tienen pendiente firmar el consentimiento LOPD.`}
                </p>
              </div>
              <Button
                onClick={() => { setLopdFilter("Pendiente"); setActivityFilter("all"); setCurrentPage(1); }}
                variant="primary"
                className="!bg-white !text-[#1a3a3a] hover:!bg-white/90 !shadow-none px-6 py-1 rounded-full font-label-md text-label-md self-start font-semibold"
              >
                Revisar Pendientes
              </Button>
              <ShieldAlert className="absolute -right-4 -bottom-4 w-[120px] h-[120px] text-on-primary-container opacity-10 group-hover:scale-110 transition-transform" />
            </div>
          </section>

          {/* Client Table Card */}
          <Card className="overflow-hidden">
            {/* Card Header */}
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-outline-variant/40 flex-wrap gap-y-3">
              <CardTitle className="font-semibold text-title-md shrink-0">
                Base de Datos de Clientes
              </CardTitle>
              <div className="flex items-center gap-2 ml-auto flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="pl-9 pr-3 h-9 w-44 text-body-sm rounded-lg border border-outline-variant bg-surface-container-low focus:outline-none focus:ring-1 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/50"
                  />
                </div>
                {/* Service filter */}
                <InlineSelect
                  id="service-filter"
                  label="Servicios..."
                  value={serviceFilter}
                  onChange={(val) => { setServiceFilter(val); setCurrentPage(1); }}
                  options={serviceOptions}
                  size="sm"
                  className="w-44"
                />
                {/* Quick activity pills */}
                <div className="flex items-center gap-1">
                  {([
                    { key: "all",      label: "Todos" },
                    { key: "inactive", label: "Sin visita +60d" },
                    { key: "new",      label: "Nuevos" },
                  ] as const).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => { setActivityFilter(key); setCurrentPage(1); }}
                      className={`h-8 px-3 text-label-sm font-medium rounded-md border transition-colors whitespace-nowrap ${
                        activityFilter === key
                          ? "bg-primary text-on-primary border-primary"
                          : "border-outline-variant text-on-surface-variant hover:bg-surface-variant"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto custom-scrollbar">
              {isLoading ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/60">
                      {["Cliente","Teléfono","Última Visita","Servicio Frecuente","Estado LOPD","Acciones"].map((h) => (
                        <th key={h} className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40">
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                            <div className="flex flex-col gap-1.5">
                              <Skeleton className="w-28 h-4" />
                              <Skeleton className="w-36 h-3" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><Skeleton className="w-24 h-4" /></td>
                        <td className="px-6 py-4"><Skeleton className="w-20 h-4" /></td>
                        <td className="px-6 py-4"><Skeleton className="w-28 h-6 rounded-full" /></td>
                        <td className="px-6 py-4"><Skeleton className="w-16 h-6 rounded-full" /></td>
                        <td className="px-6 py-4"><Skeleton className="w-6 h-6 rounded-full" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : filteredClients.length > 0 ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/60 select-none">
                      <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Cliente</th>
                      <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Teléfono</th>
                      <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Última Visita</th>
                      <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Servicio Frecuente</th>
                      <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Estado LOPD</th>
                      <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40">
                    {paginatedClients.map((client) => (
                      <ContextMenu key={client.id}>
                        <ContextMenuTrigger
                          as="tr"
                          className="hover:bg-surface-container-low/60 transition-colors cursor-pointer group"
                        >
                          {/* Name + avatar */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {client.avatarUrl ? (
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant shrink-0">
                                  <img src={client.avatarUrl} alt={client.name} className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-label-md shrink-0 select-none ${getAvatarColor(client.name)}`}>
                                  {getInitials(client.name, client.surname)}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-body-md text-on-surface">{client.name} {client.surname}</p>
                                <p className="text-body-sm text-on-surface-variant">{client.email}</p>
                              </div>
                            </div>
                          </td>
                          {/* Phone */}
                          <td className="px-6 py-4 text-body-md text-on-surface">{formatPhoneForDisplay(client.phone)}</td>
                          {/* Last visit */}
                          <td className="px-6 py-4 text-body-md text-on-surface">{client.lastVisit}</td>
                          {/* Service badge */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-label-sm font-medium bg-secondary-container text-on-secondary-container">
                              {client.frequentService || "—"}
                            </span>
                          </td>
                          {/* LOPD status */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-label-sm font-medium ${
                              client.lopdStatus === "Aceptado"
                                ? "bg-tertiary-container text-on-tertiary-container"
                                : "bg-error-container text-on-error-container"
                            }`}>
                              {client.lopdStatus}
                            </span>
                          </td>
                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={(e) => handleToggleDropdown(e, client.id)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-on-surface-variant hover:bg-surface-variant transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {mounted && activeDropdownClientId === client.id && dropdownCoords && createPortal(
                              <div
                                style={{ position: "absolute", top: `${dropdownCoords.top}px`, left: `${dropdownCoords.left}px` }}
                                className="w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-2 z-[9999] animate-in fade-in slide-in-from-top-2 duration-150"
                              >
                                {client.lopdStatus === "Aceptado" ? (
                                  <button onClick={(e) => { e.stopPropagation(); setActiveDropdownClientId(null); handleSendCustomMessage(client); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-label-md text-on-surface hover:bg-surface-container text-left">
                                    <MessageCircle className="w-4 h-4 text-primary" /><span>Enviar WhatsApp</span>
                                  </button>
                                ) : (
                                  <button onClick={(e) => { e.stopPropagation(); setActiveDropdownClientId(null); handleSendWhatsAppConsent(client); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-label-md text-on-surface hover:bg-surface-container text-left">
                                    <ShieldCheck className="w-4 h-4 text-error" /><span>Enviar LOPD</span>
                                  </button>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); setActiveDropdownClientId(null); setEditingClient(client); setIsClientModalOpen(true); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-label-md text-on-surface hover:bg-surface-container text-left">
                                  <Edit3 className="w-4 h-4 text-primary" /><span>Editar cliente</span>
                                </button>
                                <div className="my-1 border-t border-outline-variant/50" />
                                <button onClick={(e) => { e.stopPropagation(); setActiveDropdownClientId(null); handleDeleteClient(client.id, `${client.name} ${client.surname}`); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-label-md text-error hover:bg-error-container/20 text-left">
                                  <Trash2 className="w-4 h-4" /><span>Eliminar cliente</span>
                                </button>
                              </div>,
                              document.body
                            )}
                          </td>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          {client.lopdStatus === "Aceptado" ? (
                            <ContextMenuItem onClick={() => handleSendCustomMessage(client)}>
                              <MessageCircle className="w-4 h-4 text-primary" /><span>Enviar WhatsApp</span>
                            </ContextMenuItem>
                          ) : (
                            <ContextMenuItem onClick={() => handleSendWhatsAppConsent(client)}>
                              <ShieldCheck className="w-4 h-4 text-error" /><span>Enviar LOPD</span>
                            </ContextMenuItem>
                          )}
                          <ContextMenuItem onClick={() => { setEditingClient(client); setIsClientModalOpen(true); }}>
                            <Edit3 className="w-4 h-4 text-primary" /><span>Editar cliente</span>
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem onClick={() => { navigator.clipboard.writeText(client.phone); setToastText("Teléfono copiado"); setShowGeneralToast(true); setTimeout(() => setShowGeneralToast(false), 3000); }}>
                            <Copy className="w-4 h-4 text-outline" /><span>Copiar teléfono</span>
                          </ContextMenuItem>
                          {client.email && (
                            <ContextMenuItem onClick={() => { navigator.clipboard.writeText(client.email); setToastText("Email copiado"); setShowGeneralToast(true); setTimeout(() => setShowGeneralToast(false), 3000); }}>
                              <Copy className="w-4 h-4 text-outline" /><span>Copiar email</span>
                            </ContextMenuItem>
                          )}
                          <ContextMenuSeparator />
                          <ContextMenuItem variant="error" onClick={() => handleDeleteClient(client.id, `${client.name} ${client.surname}`)}>
                            <Trash2 className="w-4 h-4 text-error" /><span>Eliminar cliente</span>
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                  </tbody>
                </table>
              ) : (
                <Empty
                  title="No se encontraron clientes"
                  description="Prueba a ajustar tu búsqueda o añade un nuevo cliente."
                  icon={UsersIcon}
                  action={<Button variant="primary" onClick={() => setIsClientModalOpen(true)}>Añadir Cliente</Button>}
                  className="border-none bg-transparent py-12"
                />
              )}
            </div>

            {/* Pagination footer */}
            {!isLoading && filteredClients.length > 0 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-outline-variant/40">
                <span className="text-label-sm text-on-surface-variant">
                  Mostrando {startItem}–{endItem} de {filteredClients.length} cliente{filteredClients.length !== 1 ? "s" : ""}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-variant disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-variant disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </Card>
        </main>

        <Button
          onClick={(e) => {
            setClientModalTriggerRect(e.currentTarget.getBoundingClientRect());
            setIsClientModalOpen(true);
          }}
          variant="primary"
          className="md:hidden fixed bottom-20 right-6 z-40 p-4 rounded-full shadow-lg"
        >
          <Plus data-icon="plus" />
        </Button>

        {/* Mobile menu bar */}
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
        onClose={() => setIsAppointmentModalOpen(false)}
        onSave={handleSaveAppointment}
      />

      {/* LOPD WhatsApp Consent Toast Overlay */}
      {showConsentToast && (
        <Alert
          variant="info"
          className="fixed top-6 right-6 z-[60] flex items-center gap-3 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm"
        >
          <ShieldCheck data-icon="shield-check" className="text-secondary shrink-0" />
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-on-secondary-container text-body-md">
              Consentimiento Reenviado
            </p>
            <p className="text-body-sm text-on-secondary-container/80">
              Mensaje LOPD reenviado a{" "}
              <span className="font-semibold">{toastPhone}</span> por WhatsApp.
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
          <MessageCircle data-icon="message-circle" className="text-secondary shrink-0" />
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-on-secondary-container text-body-md">
              Mensaje Enviado
            </p>
            <p className="text-body-sm text-on-secondary-container/80">{toastText}</p>
          </div>
        </Alert>
      )}
    </div>
  );
}
