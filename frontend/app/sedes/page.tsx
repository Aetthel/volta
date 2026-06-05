"use client";

import { useState } from "react";
import { 
  Store, 
  MapPin, 
  Phone, 
  Clock, 
  Plus, 
  X, 
  ExternalLink, 
  Sparkles, 
  Search, 
  Trash2 
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";

interface BranchItem {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  status: "Activa" | "Mantenimiento" | "Cerrada";
}

export default function SedesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newBranch, setNewBranch] = useState({
    name: "",
    address: "",
    phone: "",
    hours: "Lunes - Sábado: 09:00 - 20:00",
    status: "Activa" as const,
  });

  // Mock branches database
  const [branches, setBranches] = useState<BranchItem[]>([
    {
      id: "1",
      name: "Sede Centro - Madrid",
      address: "Calle Mayor, 14, 28013 Madrid",
      phone: "+34 911 234 567",
      hours: "Lunes - Sábado: 09:00 - 20:00",
      status: "Activa",
    },
    {
      id: "2",
      name: "Sede Velázquez - Madrid",
      address: "Calle de Velázquez, 45, 28001 Madrid",
      phone: "+34 912 345 678",
      hours: "Lunes - Sábado: 09:00 - 20:00",
      status: "Activa",
    },
    {
      id: "3",
      name: "Sede Sarrià - Barcelona",
      address: "Carrer de Major de Sarrià, 22, 08017 Barcelona",
      phone: "+34 931 987 654",
      hours: "Lunes - Viernes: 10:00 - 19:30",
      status: "Mantenimiento",
    },
  ]);

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    const branch: BranchItem = {
      id: String(Date.now()),
      ...newBranch,
    };
    setBranches((prev) => [...prev, branch]);
    setNewBranch({
      name: "",
      address: "",
      phone: "",
      hours: "Lunes - Sábado: 09:00 - 20:00",
      status: "Activa",
    });
    setIsModalOpen(false);
  };

  const handleDeleteBranch = (id: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
  };

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: BranchItem["status"]) => {
    switch (status) {
      case "Activa":
        return "bg-secondary-container text-on-secondary-container";
      case "Mantenimiento":
        return "bg-error-container text-on-error-container";
      case "Cerrada":
      default:
        return "bg-surface-container text-on-surface-variant";
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Sidebar navigation */}
      <Sidebar onNewAppointmentClick={() => {}} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-[240px]">
        {/* Top Header */}
        <Header 
          searchPlaceholder="Buscar sedes..." 
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content Canvas */}
        <main className="p-margin-mobile md:p-gutter max-w-container-max w-full mx-auto flex-1">
          {/* Header Action Section */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="font-display text-headline-lg text-on-surface font-semibold mb-1">
                Gestión de Sedes
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant font-medium">
                Administra las sucursales de tu negocio de forma centralizada.
              </p>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 px-6 py-2 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] transition-all cursor-pointer self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Sede</span>
            </button>
          </section>

          {/* Grid Layout of Branches */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBranches.length > 0 ? (
              filteredBranches.map((branch) => (
                <div 
                  key={branch.id}
                  className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-[0px_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:border-primary-fixed-dim transition-colors group"
                >
                  <div>
                    {/* Header: Title and Badge */}
                    <div className="flex justify-between items-start gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-surface-container text-primary rounded-lg shrink-0">
                          <Store className="w-5 h-5" />
                        </div>
                        <h3 className="font-title-md text-title-md text-on-surface font-semibold">
                          {branch.name}
                        </h3>
                      </div>
                      <span className={`inline-block px-2 py-[2px] rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusBadge(branch.status)}`}>
                        {branch.status}
                      </span>
                    </div>

                    {/* Details list */}
                    <div className="flex flex-col gap-2 text-body-md text-on-surface-variant font-medium mt-6">
                      <div className="flex items-start gap-2 leading-relaxed">
                        <MapPin className="w-4 h-4 text-outline shrink-0 mt-0.5" />
                        <span>{branch.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-outline shrink-0" />
                        <span>{branch.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-outline shrink-0" />
                        <span>{branch.hours}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex justify-between items-center gap-4 mt-8 pt-6 border-t border-outline-variant/65">
                    <button className="flex items-center gap-1 text-primary font-label-md text-label-md font-semibold hover:underline transition-all cursor-pointer">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Gestionar Sede</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteBranch(branch.id)}
                      className="p-2 text-outline hover:text-error hover:bg-error-container/20 rounded-full transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-on-surface-variant text-body-lg">
                No se encontraron sedes activas que coincidan con la búsqueda.
              </div>
            )}
          </section>
        </main>

        {/* Mobile floating FAB action */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="md:hidden fixed bottom-20 right-6 z-40 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container p-4 rounded-full shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Mobile bottom nav */}
        <BottomNav />
      </div>

      {/* Add Branch Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Card */}
          <div className="relative bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant max-w-md w-full z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="font-title-lg text-title-lg text-on-surface font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>Añadir Nueva Sede</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveBranch} className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant px-1" htmlFor="branchName">
                  Nombre de la Sede
                </label>
                <input
                  id="branchName"
                  type="text"
                  required
                  placeholder="Ej. Sede Retiro - Madrid"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant px-1" htmlFor="branchAddress">
                  Dirección
                </label>
                <input
                  id="branchAddress"
                  type="text"
                  required
                  placeholder="Calle de Alcalá, 12, Madrid"
                  value={newBranch.address}
                  onChange={(e) => setNewBranch((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant px-1" htmlFor="branchPhone">
                  Teléfono de contacto
                </label>
                <input
                  id="branchPhone"
                  type="tel"
                  required
                  placeholder="+34 913 456 789"
                  value={newBranch.phone}
                  onChange={(e) => setNewBranch((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant px-1" htmlFor="branchStatus">
                  Estado Inicial
                </label>
                <select
                  id="branchStatus"
                  value={newBranch.status}
                  onChange={(e) => setNewBranch((prev) => ({ ...prev, status: e.target.value as any }))}
                  className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface cursor-pointer"
                >
                  <option value="Activa">Activa</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Cerrada">Cerrada</option>
                </select>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-lg border border-outline text-primary font-label-lg text-label-lg hover:bg-surface-container transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] transition-all cursor-pointer font-semibold"
                >
                  Crear Sede
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
