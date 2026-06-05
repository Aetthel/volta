"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Store, 
  MapPin, 
  Phone, 
  Plus, 
  X, 
  Trash2, 
  Mail, 
  Lock, 
  Sparkles
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";

interface BusinessItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
}

export default function SedesPage() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newBusiness, setNewBusiness] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);

  const fetchBusinesses = () => {
    fetch("http://localhost:3001/api/admin/businesses", {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "your_static_api_key_here"
      }
    })
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setBusinesses(data);
      }
    })
    .catch((e) => {
      console.error("Error loading businesses:", e);
    });
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (session?.user?.name) {
      document.title = `Locales - ${session.user.name} - Volta`;
    }
  }, [session]);

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    
    fetch("http://localhost:3001/api/admin/businesses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "your_static_api_key_here",
      },
      body: JSON.stringify(newBusiness)
    })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to save business");
      return res.json();
    })
    .then(() => {
      fetchBusinesses();
      setNewBusiness({
        name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
      });
      setIsModalOpen(false);
    })
    .catch((err) => {
      console.error("Error saving business:", err);
      alert("Error al guardar el negocio. Asegúrate de que el email sea único.");
    });
  };

  const handleDeleteBusiness = (id: string) => {
    if (session?.user && (session.user as any).id === id) {
      alert("No puedes eliminar tu propia cuenta de administrador.");
      return;
    }
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este local? Se borrarán de forma permanente todas sus citas y clientes de la base de datos.");
    if (!confirmDelete) return;

    fetch(`http://localhost:3001/api/admin/businesses/${id}`, {
      method: "DELETE",
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "your_static_api_key_here"
      }
    })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to delete business");
      return res.json();
    })
    .then(() => {
      fetchBusinesses();
    })
    .catch((err) => {
      console.error("Error deleting business:", err);
    });
  };

  const filteredBusinesses = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Sidebar navigation */}
      <Sidebar onNewAppointmentClick={() => {}} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-[240px]">
        {/* Top Header */}
        <Header 
          searchPlaceholder="Buscar salones..." 
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content Canvas */}
        <main className="p-margin-mobile md:p-gutter max-w-container-max w-full mx-auto flex-1">
          {/* Header Action Section */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="font-display text-headline-lg text-on-surface font-semibold mb-1">
                Gestión de Locales
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant font-medium">
                Registra y administra las cuentas de salones en la plataforma.
              </p>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 px-6 py-2 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] transition-all cursor-pointer self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Local</span>
            </button>
          </section>

          {/* Grid Layout of Businesses */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.length > 0 ? (
              filteredBusinesses.map((biz) => (
                <div 
                  key={biz.id}
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
                          {biz.name}
                        </h3>
                      </div>
                      <span className={`inline-block px-2 py-[2px] rounded-full text-[11px] font-bold uppercase tracking-wider bg-secondary-container text-on-secondary-container`}>
                        {biz.role}
                      </span>
                    </div>

                    {/* Details list */}
                    <div className="flex flex-col gap-2 text-body-md text-on-surface-variant font-medium mt-6">
                      <div className="flex items-start gap-2 leading-relaxed">
                        <Mail className="w-4 h-4 text-outline shrink-0 mt-0.5" />
                        <span className="truncate">{biz.email}</span>
                      </div>
                      {biz.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-outline shrink-0" />
                          <span>{biz.phone}</span>
                        </div>
                      )}
                      {biz.address && (
                        <div className="flex items-start gap-2 leading-relaxed">
                          <MapPin className="w-4 h-4 text-outline shrink-0 mt-0.5" />
                          <span>{biz.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex justify-end items-center gap-4 mt-8 pt-6 border-t border-outline-variant/65">
                    <button 
                      onClick={() => handleDeleteBusiness(biz.id)}
                      className="p-2 text-outline hover:text-error hover:bg-error-container/20 rounded-full transition-colors cursor-pointer"
                      title="Eliminar salón permanentemente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-on-surface-variant text-body-lg">
                No se encontraron locales de negocio registrados que coincidan con la búsqueda.
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

      {/* Add Business Modal Dialog */}
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
                <span>Añadir Nuevo Local</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveBusiness} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant px-1" htmlFor="bizName">
                  Nombre Comercial
                </label>
                <input
                  id="bizName"
                  type="text"
                  required
                  placeholder="Ej. Glow Estética"
                  value={newBusiness.name}
                  onChange={(e) => setNewBusiness((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant px-1" htmlFor="bizEmail">
                  Email de acceso
                </label>
                <input
                  id="bizEmail"
                  type="email"
                  required
                  placeholder="contacto@glow.com"
                  value={newBusiness.email}
                  onChange={(e) => setNewBusiness((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant px-1" htmlFor="bizPassword">
                  Contraseña de acceso
                </label>
                <input
                  id="bizPassword"
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={newBusiness.password}
                  onChange={(e) => setNewBusiness((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant px-1" htmlFor="bizPhone">
                  Teléfono de WhatsApp
                </label>
                <input
                  id="bizPhone"
                  type="tel"
                  required
                  placeholder="34600000000 (sin símbolos)"
                  value={newBusiness.phone}
                  onChange={(e) => setNewBusiness((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant px-1" htmlFor="bizAddress">
                  Dirección Física
                </label>
                <input
                  id="bizAddress"
                  type="text"
                  placeholder="Calle de Serrano, 10, Madrid"
                  value={newBusiness.address}
                  onChange={(e) => setNewBusiness((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                />
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
                  Crear Local
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
