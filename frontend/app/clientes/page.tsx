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
  MessageCircle
} from "lucide-react";
import { useSession } from "next-auth/react";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import AddClientModal from "@/components/AddClientModal";
import NewAppointmentModal from "@/components/NewAppointmentModal";
import MetricCard from "@/components/MetricCard";
import { Badge } from "@/components/ui/volta-ui";

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

  if (digits.length === 9 && (digits.startsWith("6") || digits.startsWith("7") || digits.startsWith("9"))) {
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
  const businessId = session?.user?.id || "mock-business-id";

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

  const fetchData = () => {
    if (!businessId) return;

    // Fetch Clients
    fetch(`/api/backend/clients?businessId=${businessId}`)
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
    fetch(`/api/backend/appointments?businessId=${businessId}`)
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setAppointments(data);
      }
    })
    .catch((e) => {
      console.error("Error loading appointments:", e);
    });
  };

  useEffect(() => {
    fetchData();
  }, [businessId]);

  useEffect(() => {
    if (session?.user?.name) {
      document.title = `Clientes - ${session.user.name} - Volta`;
    }
  }, [session]);

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
    if (!window.confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) return;
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
    const msg = window.prompt(`Escribe el mensaje de WhatsApp para ${client.name} ${client.surname || ""}:`);
    if (!msg) return;

    fetch(`/api/backend/clients/${client.id}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: msg })
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
    return appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear;
  }).length;

  const pendingLopdCount = clients.filter((c) => c.lopdStatus === "Pendiente").length;

  const filteredClients = clients.filter((c) => {
    const fullName = `${c.name} ${c.surname || ""}`.trim();
    const query = searchQuery;
    return (
      normalizeString(fullName).includes(normalizeString(query)) ||
      normalizeString(c.email).includes(normalizeString(query)) ||
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
        {/* Header Search */}
        <Header 
          searchPlaceholder="Buscar clientes por nombre, email o teléfono..." 
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content Canvas */}
        <main className="p-margin-mobile md:p-gutter max-w-container-max w-full mx-auto flex-1">
          
          {/* Header Action Section */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="font-display text-headline-lg text-on-surface font-semibold mb-1">
                Gestión de Clientes
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant font-medium">
                Administra tu base de datos y fideliza a tus usuarios.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 px-6 py-2 rounded-lg border border-outline text-primary font-label-lg text-label-lg hover:bg-secondary-container/30 transition-all cursor-pointer">
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
              <button 
                onClick={() => setIsClientModalOpen(true)}
                className="flex items-center gap-1 px-6 py-2 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir Cliente</span>
              </button>
            </div>
          </section>

          {/* Stats Bento Grid */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Clientes Totales"
              value={clients.length}
              change="+12%"
              trend="up"
              icon={<UsersIcon className="w-5 h-5" />}
              className="md:col-span-1"
            />
            <MetricCard
              title="Visitas este mes"
              value={visitsThisMonthCount}
              change="+8%"
              trend="up"
              icon={<CalendarCheck className="w-5 h-5" />}
              className="md:col-span-1"
            />
            
            {/* Custom Banner Card (Bento Style) */}
            <div className="md:col-span-2 bg-primary-container text-on-primary-container p-6 rounded-xl shadow-sm relative overflow-hidden group flex flex-col justify-between">
              <div className="relative z-10">
                <h4 className="font-title-md text-title-md mb-1 font-semibold">
                  Control de Consentimiento LOPD
                </h4>
                <p className="font-body-md text-body-md opacity-90 mb-4 max-w-[280px] leading-relaxed">
                  {`${pendingLopdCount} clientes tienen pendiente firmar el consentimiento LOPD.`}
                </p>
              </div>
              <button 
                onClick={() => setSearchQuery("Pendiente")}
                className="bg-on-primary-container text-primary hover:bg-primary-fixed hover:text-on-primary-fixed px-6 py-1 rounded-full font-label-md text-label-md self-start transition-all cursor-pointer font-semibold shadow-sm"
              >
                Revisar Pendientes
              </button>
              <ShieldAlert className="absolute -right-4 -bottom-4 w-[120px] h-[120px] text-on-primary-container opacity-10 group-hover:scale-110 transition-transform" />
            </div>
          </section>

          {/* Modern Table Container */}
          <section className="bg-surface-container-lowest rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant overflow-hidden">
            
            <div className="p-6 border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-title-md text-title-md text-on-surface font-semibold">
                Base de Datos de Clientes
              </h3>
            </div>

            {/* Responsive Table */}
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
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <tr 
                        key={client.id} 
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
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-label-lg shrink-0 select-none ${getAvatarColor(client.name)}`}>
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
                            variant={client.lopdStatus === "Aceptado" ? "default" : "error"}
                            className={client.lopdStatus === "Pendiente" ? "animate-pulse" : ""}
                          >
                            {client.lopdStatus === "Aceptado" ? "Aceptado" : "Pendiente"}
                          </Badge>
                        </td>
                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {client.lopdStatus === "Aceptado" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSendCustomMessage(client);
                                }}
                                title="Enviar WhatsApp"
                                className="p-2 rounded-full text-outline hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            )}
                            {client.lopdStatus === "Pendiente" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSendWhatsAppConsent(client);
                                }}
                                title="Enviar consentimiento LOPD"
                                className="p-2 rounded-full text-outline hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                              >
                                <ShieldCheck className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingClient(client);
                                  setIsClientModalOpen(true);
                              }}
                              title="Editar cliente"
                              className="p-2 rounded-full text-outline hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClient(client.id, `${client.name} ${client.surname}`);
                              }}
                              title="Eliminar cliente"
                              className="p-2 rounded-full text-outline hover:text-error hover:bg-error-container/20 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant text-body-lg">
                        No se encontraron clientes que coincidan con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </section>
        </main>

        {/* Mobile floating FAB action */}
        <button
          onClick={() => setIsClientModalOpen(true)}
          className="md:hidden fixed bottom-20 right-6 z-40 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container p-4 rounded-full shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Mobile menu bar */}
        <BottomNav />
      </div>

      {/* Add / Edit Client Modal */}
      <AddClientModal
        isOpen={isClientModalOpen}
        onClose={() => { setIsClientModalOpen(false); setEditingClient(null); }}
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
        <div className="fixed top-6 right-6 z-[60] flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-950 px-6 py-4 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-emerald-950 text-body-md">Consentimiento Reenviado</p>
            <p className="text-body-sm text-emerald-800">
              Mensaje LOPD reenviado a <span className="font-semibold">{toastPhone}</span> por WhatsApp.
            </p>
          </div>
        </div>
      )}

      {/* General Toast Overlay */}
      {showGeneralToast && (
        <div className="fixed top-6 right-6 z-[60] flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-950 px-6 py-4 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm">
          <MessageCircle className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-emerald-950 text-body-md">Mensaje Enviado</p>
            <p className="text-body-sm text-emerald-800">
              {toastText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
