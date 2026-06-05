"use client";

import { useState } from "react";
import { 
  Users as UsersIcon, 
  CalendarCheck, 
  Gift, 
  Search, 
  Plus, 
  Download, 
  Trash2, 
  Edit3, 
  Filter 
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import AddClientModal from "@/components/AddClientModal";
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
}

export default function ClientesPage() {
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stylistFilter, setStylistFilter] = useState("Todos los estilistas");

  // Mock initial clients database
  const [clients, setClients] = useState<ClientItem[]>([
    {
      id: "1",
      name: "Ana",
      surname: "García López",
      email: "ana.garcia@email.com",
      phone: "+34 600 000 001",
      lastVisit: "12 May 2024",
      frequentService: "Coloración Premium",
      stylist: "Ana García",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "2",
      name: "Marco",
      surname: "Polo Ruiz",
      email: "marco.polo@email.com",
      phone: "+34 600 000 002",
      lastVisit: "18 May 2024",
      frequentService: "Corte Caballero",
      stylist: "Marco Polo",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "3",
      name: "Sofía",
      surname: "Martín Plaza",
      email: "sofia.martin@email.com",
      phone: "+34 600 000 003",
      lastVisit: "22 May 2024",
      frequentService: "Manicura",
      stylist: "Ana García",
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "4",
      name: "Juan",
      surname: "Herrera Sancho",
      email: "juan.herrera@email.com",
      phone: "+34 600 000 004",
      lastVisit: "02 Jun 2024",
      frequentService: "Tratamiento Keratina",
      stylist: "Marco Polo",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    },
  ]);

  const handleSaveClient = (data: any) => {
    const newClient: ClientItem = {
      id: String(Date.now()),
      name: data.name,
      surname: data.surname,
      email: data.email,
      phone: data.phone,
      lastVisit: "Hoy",
      frequentService: "Primera visita",
      stylist: "Sin asignar",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    };
    setClients((prev) => [newClient, ...prev]);
  };

  const handleDeleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  // Filter clients list
  const filteredClients = clients.filter((c) => {
    const fullName = `${c.name} ${c.surname}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      fullName.includes(query) || 
      c.email.toLowerCase().includes(query) || 
      c.phone.includes(query);

    const matchesStylist = 
      stylistFilter === "Todos los estilistas" || 
      c.stylist === stylistFilter;

    return matchesSearch && matchesStylist;
  });

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Sidebar navigation */}
      <Sidebar onNewAppointmentClick={() => {}} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-[240px]">
        {/* Header Search */}
        <Header 
          searchPlaceholder="Buscar clientes por nombre, email o teléfono..." 
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content Canvas */}
        <main className="p-gutter max-w-container-max w-full mx-auto flex-1">
          
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
            
            {/* Table Header / Filters */}
            <div className="p-6 border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-title-md text-title-md text-on-surface font-semibold">
                Base de Datos de Clientes
              </h3>
              <div className="flex items-center gap-2">
                <select 
                  value={stylistFilter}
                  onChange={(e) => setStylistFilter(e.target.value)}
                  className="bg-surface-container border-none rounded-lg text-label-md font-label-md font-semibold focus:ring-2 focus:ring-primary text-on-surface-variant px-4 py-2 focus:outline-none cursor-pointer"
                >
                  <option value="Todos los estilistas">Todos los estilistas</option>
                  <option value="Ana García">Ana García</option>
                  <option value="Marco Polo">Marco Polo</option>
                  <option value="Sin asignar">Sin asignar</option>
                </select>
                <button className="p-2 hover:bg-surface-variant rounded-full text-on-surface-variant transition-colors cursor-pointer bg-surface-container">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
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
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant bg-surface-container shrink-0">
                            <img 
                              src={client.avatarUrl} 
                              alt={client.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
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
                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
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
                      <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant text-body-lg">
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
    </div>
  );
}
