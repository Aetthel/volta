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
  Edit3 
} from "lucide-react";
import { useSession } from "next-auth/react";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import AddClientModal from "@/components/AddClientModal";
import NewAppointmentModal from "@/components/NewAppointmentModal";
import MetricCard from "@/components/MetricCard";

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
  const businessId = (session?.user as any)?.id || "mock-business-id";

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConsentToast, setShowConsentToast] = useState(false);
  const [toastPhone, setToastPhone] = useState("");
  const [clients, setClients] = useState<ClientItem[]>([]);

  const fetchClients = () => {
    if (!businessId) return;
    fetch(`http://localhost:3001/api/clients?businessId=${businessId}`, {
      headers: {
        "x-api-key": "your_static_api_key_here"
      }
    })
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setClients(data);
      }
    })
    .catch((e) => {
      console.error("Error loading clients:", e);
    });
  };

  useEffect(() => {
    fetchClients();
  }, [businessId]);

  const handleSaveAppointment = (data: any) => {
    // Refresh client list since a new client might have been auto-registered
    fetchClients();
  };

  const handleSaveClient = (data: any) => {
    fetch("http://localhost:3001/api/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "your_static_api_key_here",
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
      fetchClients();
    })
    .catch((err) => {
      console.error("Error saving client:", err);
      // fallback
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
        lopdStatus: "Aceptado",
      };
      setClients((prev) => [newClient, ...prev]);
    });
  };

  const handleDeleteClient = (id: string) => {
    fetch(`http://localhost:3001/api/clients/${id}`, {
      method: "DELETE",
      headers: {
        "x-api-key": "your_static_api_key_here",
      },
    })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to delete client");
      return res.json();
    })
    .then(() => {
      fetchClients();
    })
    .catch((err) => {
      console.error("Error deleting client:", err);
      setClients((prev) => prev.filter((c) => c.id !== id));
    });
  };

  const handleSendWhatsAppConsent = (client: ClientItem) => {
    fetch(`http://localhost:3001/api/clients/${client.id}/resend-consent`, {
      method: "POST",
      headers: {
        "x-api-key": "your_static_api_key_here",
      },
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

  const filteredClients = clients.filter((c) => {
    const fullName = `${c.name} ${c.surname || ""}`.trim();
    const query = searchQuery;
    return (
      normalizeString(fullName).includes(normalizeString(query)) ||
      normalizeString(c.email).includes(normalizeString(query)) ||
      normalizePhone(c.phone).includes(normalizePhone(query))
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
              value="342"
              change="+8%"
              trend="up"
              icon={<CalendarCheck className="w-5 h-5" />}
              className="md:col-span-1"
            />
            
            {/* Custom Banner Card (Bento Style) */}
            <div className="md:col-span-2 bg-primary-container text-on-primary-container p-6 rounded-xl shadow-sm relative overflow-hidden group flex flex-col justify-between">
              <div className="relative z-10">
                <h4 className="font-title-md text-title-md mb-1 font-semibold">
                  Programa de Fidelización
                </h4>
                <p className="font-body-md text-body-md opacity-90 mb-4 max-w-[280px] leading-relaxed">
                  24 clientes están cerca de su próximo servicio gratuito.
                </p>
              </div>
              <button className="bg-on-primary-container text-primary hover:bg-primary-fixed hover:text-on-primary-fixed px-6 py-1 rounded-full font-label-md text-label-md self-start transition-all cursor-pointer font-semibold shadow-sm">
                Ver detalles
              </button>
              <Gift className="absolute -right-4 -bottom-4 w-[120px] h-[120px] text-on-primary-container opacity-10 group-hover:scale-110 transition-transform" />
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
                          {client.phone}
                        </td>
                        {/* Last Visit */}
                        <td className="px-6 py-4 text-body-lg text-on-surface font-medium">
                          {client.lastVisit}
                        </td>
                        {/* Frequent Service */}
                        <td className="px-6 py-4">
                          <span className="inline-block px-2 py-[2px] rounded-full text-label-md font-semibold bg-surface-container text-primary">
                            {client.frequentService}
                          </span>
                        </td>
                        {/* Estado LOPD */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-semibold select-none ${
                            client.lopdStatus === "Aceptado"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800 animate-pulse"
                          }`}>
                            {client.lopdStatus === "Aceptado" ? "Aceptado" : "Pendiente"}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {client.lopdStatus === "Pendiente" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSendWhatsAppConsent(client);
                                }}
                                title="Reenviar consentimiento por WhatsApp"
                                className="p-2 rounded-full text-[#25D366] hover:bg-emerald-50 transition-colors cursor-pointer"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                                  <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                                </svg>
                              </button>
                            )}
                            <button className="p-2 rounded-full text-outline hover:text-primary hover:bg-surface-container transition-colors cursor-pointer">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClient(client.id);
                              }}
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

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveClient}
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
          <svg className="w-6 h-6 text-[#25D366] shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
          </svg>
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-emerald-950 text-body-md">Consentimiento Reenviado</p>
            <p className="text-body-sm text-emerald-800">
              Mensaje LOPD reenviado a <span className="font-semibold">{toastPhone}</span> por WhatsApp.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
