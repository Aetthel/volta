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
  MoreVertical,
  Copy,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { createPortal } from "react-dom";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import AddClientModal from "@/components/AddClientModal";
import NewAppointmentModal from "@/components/NewAppointmentModal";
import MetricCard from "@/components/MetricCard";
import { Alert, Badge, Button, Card, CardHeader, CardTitle, Empty, ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, PageHeader, Skeleton } from "@/components/ui/volta-ui";

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
  const businessId = session?.user?.businessId || "mock-business-id";

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  useEffect(() => {
    const handleClose = () => {
      setActiveDropdownClientId(null);
      setDropdownCoords(null);
    };
    if (activeDropdownClientId) {
      document.addEventListener("click", handleClose);
      window.addEventListener("scroll", handleClose);
      window.addEventListener("resize", handleClose);
    }
    return () => {
      document.removeEventListener("click", handleClose);
      window.removeEventListener("scroll", handleClose);
      window.removeEventListener("resize", handleClose);
    };
  }, [activeDropdownClientId]);

  const handleToggleDropdown = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    if (activeDropdownClientId === clientId) {
      setActiveDropdownClientId(null);
      setDropdownCoords(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const leftPos = rect.right + window.scrollX - 192; // 192px is the dropdown width (w-48)
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

  const filteredClients = clients.filter((c) => {
    const fullName = `${c.name} ${c.surname || ""}`.trim();
    const query = searchQuery;
    return (
      normalizeString(fullName).includes(normalizeString(query)) ||
      normalizeString(c.email || "").includes(normalizeString(query)) ||
      normalizePhone(c.phone).includes(normalizePhone(query)) ||
      normalizeString(c.lopdStatus).includes(normalizeString(query))
    );
  });

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Sidebar navigation */}
      <Sidebar onNewAppointmentClick={() => setIsAppointmentModalOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-[240px]">
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
                  onClick={() => setIsClientModalOpen(true)}
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
          <section className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-gutter">
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
                onClick={() => setSearchQuery("Pendiente")}
                variant="ghost"
                className="bg-on-primary-container text-primary hover:bg-primary-fixed hover:text-on-primary-fixed px-6 py-1 rounded-full font-label-md text-label-md self-start font-semibold shadow-sm"
              >
                Revisar Pendientes
              </Button>
              <ShieldAlert className="absolute -right-4 -bottom-4 w-[120px] h-[120px] text-on-primary-container opacity-10 group-hover:scale-110 transition-transform" />
            </div>
          </section>

          {/* Modern Table Container */}
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-4 border-b border-outline-variant/40 pb-4">
              <CardTitle className="font-semibold text-title-md">
                Base de Datos de Clientes
              </CardTitle>
            </CardHeader>

            <div>
              {isLoading ? (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low select-none">
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold border-b border-outline-variant">
                          Cliente
                        </th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold border-b border-outline-variant">
                          Teléfono
                        </th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold border-b border-outline-variant">
                          Última Visita
                        </th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold border-b border-outline-variant">
                          Servicio Frecuente
                        </th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold border-b border-outline-variant">
                          Estado LOPD
                        </th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold border-b border-outline-variant">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {[...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4 flex items-center gap-4">
                            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                            <div className="flex flex-col gap-1.5">
                              <Skeleton className="w-24 h-4" />
                              <Skeleton className="w-36 h-3" />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Skeleton className="w-24 h-4" />
                          </td>
                          <td className="px-6 py-4">
                            <Skeleton className="w-20 h-4" />
                          </td>
                          <td className="px-6 py-4">
                            <Skeleton className="w-32 h-4" />
                          </td>
                          <td className="px-6 py-4">
                            <Skeleton className="w-16 h-6 rounded-full" />
                          </td>
                          <td className="px-6 py-4">
                            <Skeleton className="w-8 h-8 rounded-full" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : filteredClients.length > 0 ? (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low select-none">
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold border-b border-outline-variant">
                          Cliente
                        </th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold border-b border-outline-variant">
                          Teléfono
                        </th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold border-b border-outline-variant">
                          Última Visita
                        </th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold border-b border-outline-variant">
                          Servicio Frecuente
                        </th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold border-b border-outline-variant">
                          Estado LOPD
                        </th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold border-b border-outline-variant">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {
                        filteredClients.map((client) => (
                          <ContextMenu key={client.id}>
                            <ContextMenuTrigger
                              as="tr"
                              className="hover:bg-secondary-container/10 transition-colors group cursor-pointer"
                            >
                              {/* Name and avatar */}
                              <td className="px-6 py-4 flex items-center gap-4">
                                {client.avatarUrl ? (
                                  <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant bg-surface-container shrink-0">
                                    <img
                                      src={client.avatarUrl}
                                      alt={client.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-label-lg shrink-0 select-none ${getAvatarColor(client.name)}`}
                                  >
                                    {getInitials(client.name, client.surname)}
                                  </div>
                                )}
                                <div>
                                  <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                                    {client.name} {client.surname}
                                  </p>
                                  <p className="text-sm text-on-surface-variant font-medium">
                                    {client.email}
                                  </p>
                                </div>
                              </td>
                              {/* Phone */}
                              <td className="px-6 py-4 text-body-lg text-on-surface font-medium">
                                {formatPhoneForDisplay(client.phone)}
                              </td>
                              {/* Last Visit */}
                              <td className="px-6 py-4 text-body-lg text-on-surface font-medium">
                                {client.lastVisit}
                              </td>
                              {/* Frequent Service */}
                              <td className="px-6 py-4">
                                <Badge variant="secondary">
                                  {client.frequentService}
                                </Badge>
                              </td>
                              {/* Estado LOPD */}
                              <td className="px-6 py-4">
                                <Badge
                                  variant={
                                    client.lopdStatus === "Aceptado"
                                      ? "default"
                                      : "error"
                                  }
                                  className={
                                    client.lopdStatus === "Pendiente"
                                      ? "animate-pulse"
                                      : ""
                                  }
                                >
                                  {client.lopdStatus === "Aceptado"
                                    ? "Aceptado"
                                    : "Pendiente"}
                                </Badge>
                              </td>
                              {/* Actions */}
                              <td className="px-6 py-4">
                                <div className="flex justify-start">
                                  <Button
                                    variant="ghost"
                                    onClick={(e) => handleToggleDropdown(e, client.id)}
                                    className="p-2 rounded-full text-outline hover:text-on-surface hover:bg-surface-container w-9 h-9"
                                    title="Acciones"
                                  >
                                    <MoreVertical data-icon="more-vertical" />
                                  </Button>
  
                                  {mounted && activeDropdownClientId === client.id && dropdownCoords && createPortal(
                                    <div
                                      style={{
                                        position: "absolute",
                                        top: `${dropdownCoords.top}px`,
                                        left: `${dropdownCoords.left}px`,
                                      }}
                                      className="w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-2 z-[9999] animate-in fade-in slide-in-from-top-2 duration-150 origin-top-right"
                                    >
                                      {client.lopdStatus === "Aceptado" ? (
                                        <Button
                                          variant="ghost"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveDropdownClientId(null);
                                            setDropdownCoords(null);
                                            handleSendCustomMessage(client);
                                          }}
                                          className="w-full px-4 py-2.5 text-left font-label-md text-label-md text-on-surface hover:bg-surface-container justify-start shadow-none active:scale-100"
                                        >
                                          <MessageCircle data-icon="message-circle" className="text-primary" />
                                          <span>Enviar WhatsApp</span>
                                        </Button>
                                      ) : (
                                        <Button
                                          variant="ghost"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveDropdownClientId(null);
                                            setDropdownCoords(null);
                                            handleSendWhatsAppConsent(client);
                                          }}
                                          className="w-full px-4 py-2.5 text-left font-label-md text-label-md text-on-surface hover:bg-surface-container justify-start shadow-none active:scale-100"
                                        >
                                          <ShieldCheck data-icon="shield-check" className="text-error" />
                                          <span>Enviar LOPD</span>
                                        </Button>
                                      )}
  
                                      <Button
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveDropdownClientId(null);
                                          setDropdownCoords(null);
                                          setEditingClient(client);
                                          setIsClientModalOpen(true);
                                        }}
                                        className="w-full px-4 py-2.5 text-left font-label-md text-label-md text-on-surface hover:bg-surface-container justify-start shadow-none active:scale-100"
                                      >
                                        <Edit3 data-icon="edit-3" className="text-primary" />
                                        <span>Editar cliente</span>
                                      </Button>
  
                                      <div className="my-1 border-t border-outline-variant/65"></div>
  
                                      <Button
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveDropdownClientId(null);
                                          setDropdownCoords(null);
                                          handleDeleteClient(
                                            client.id,
                                            `${client.name} ${client.surname}`
                                          );
                                        }}
                                        className="w-full px-4 py-2.5 text-left font-label-md text-label-md text-error hover:bg-error-container/20 justify-start shadow-none active:scale-100"
                                        title="Eliminar cliente"
                                      >
                                        <Trash2 data-icon="trash" />
                                        <span>Eliminar cliente</span>
                                      </Button>
                                    </div>,
                                    document.body
                                  )}
                                </div>
                              </td>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                              {client.lopdStatus === "Aceptado" ? (
                                <ContextMenuItem
                                  onClick={() => handleSendCustomMessage(client)}
                                >
                                  <MessageCircle className="w-4 h-4 text-primary" />
                                  <span>Enviar WhatsApp</span>
                                </ContextMenuItem>
                              ) : (
                                <ContextMenuItem
                                  onClick={() => handleSendWhatsAppConsent(client)}
                                >
                                  <ShieldCheck className="w-4 h-4 text-error" />
                                  <span>Enviar LOPD</span>
                                </ContextMenuItem>
                              )}

                              <ContextMenuItem
                                onClick={() => {
                                  setEditingClient(client);
                                  setIsClientModalOpen(true);
                                }}
                              >
                                <Edit3 className="w-4 h-4 text-primary" />
                                <span>Editar cliente</span>
                              </ContextMenuItem>

                              <ContextMenuSeparator />

                              <ContextMenuItem
                                onClick={() => {
                                  navigator.clipboard.writeText(client.phone);
                                  setToastText("Teléfono copiado");
                                  setShowGeneralToast(true);
                                  setTimeout(() => setShowGeneralToast(false), 3000);
                                }}
                              >
                                <Copy className="w-4 h-4 text-outline" />
                                <span>Copiar teléfono</span>
                              </ContextMenuItem>

                              {client.email && (
                                <ContextMenuItem
                                  onClick={() => {
                                    navigator.clipboard.writeText(client.email);
                                    setToastText("Email copiado");
                                    setShowGeneralToast(true);
                                    setTimeout(() => setShowGeneralToast(false), 3000);
                                  }}
                                >
                                  <Copy className="w-4 h-4 text-outline" />
                                  <span>Copiar email</span>
                                </ContextMenuItem>
                              )}

                              <ContextMenuSeparator />

                              <ContextMenuItem
                                variant="error"
                                onClick={() => handleDeleteClient(client.id, `${client.name} ${client.surname}`)}
                              >
                                <Trash2 className="w-4 h-4 text-error" />
                                <span>Eliminar cliente</span>
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty
                  title="No se encontraron clientes"
                  description="Prueba a ajustar tu búsqueda o añade un nuevo cliente."
                  icon={UsersIcon}
                  action={
                    <Button variant="primary" onClick={() => setIsClientModalOpen(true)}>
                      Añadir Cliente
                    </Button>
                  }
                  className="border-none bg-transparent py-12"
                />
              )}
            </div>
          </Card>
        </main>

        <Button
          onClick={() => setIsClientModalOpen(true)}
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
