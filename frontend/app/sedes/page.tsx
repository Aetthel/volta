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
  Sparkles,
  Pencil,
  Users,
  UserPlus,
  Key,
  Loader2,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { FieldGroup, Field, FieldLabel, Badge } from "@/components/ui/volta-ui";

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
  const [editingBusiness, setEditingBusiness] = useState<BusinessItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newBusiness, setNewBusiness] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);

  // States and CRUD for managing workers of a specific business
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessItem | null>(null);
  const [isWorkersModalOpen, setIsWorkersModalOpen] = useState(false);
  const [workers, setWorkers] = useState<any[]>([]);
  const [isAddWorkerModalOpen, setIsAddWorkerModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any | null>(null);
  const [workerFormData, setWorkerFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLEADO" as "JEFE" | "EMPLEADO",
  });
  const [workerErrorMsg, setWorkerErrorMsg] = useState("");

  const fetchWorkers = (bizId: string) => {
    fetch(`/api/backend/users?businessId=${bizId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setWorkers(data);
        }
      })
      .catch((err) => console.error("Error loading business workers:", err));
  };

  const handleOpenWorkersModal = (biz: BusinessItem) => {
    setSelectedBusiness(biz);
    setWorkers([]);
    fetchWorkers(biz.id);
    setIsWorkersModalOpen(true);
  };

  const handleOpenCreateWorkerModal = () => {
    setEditingWorker(null);
    setWorkerFormData({
      name: "",
      email: "",
      password: "",
      role: "EMPLEADO",
    });
    setWorkerErrorMsg("");
    setIsAddWorkerModalOpen(true);
  };

  const handleOpenEditWorkerModal = (worker: any) => {
    setEditingWorker(worker);
    setWorkerFormData({
      name: worker.name,
      email: worker.email,
      password: "",
      role: worker.role,
    });
    setWorkerErrorMsg("");
    setIsAddWorkerModalOpen(true);
  };

  const handleSaveWorker = (e: React.FormEvent) => {
    e.preventDefault();
    setWorkerErrorMsg("");
    if (!selectedBusiness) return;

    if (!workerFormData.name || !workerFormData.email) {
      setWorkerErrorMsg("El nombre y el correo son obligatorios.");
      return;
    }
    if (!editingWorker && !workerFormData.password) {
      setWorkerErrorMsg("La contraseña es obligatoria para nuevos trabajadores.");
      return;
    }

    const isEdit = !!editingWorker;
    const url = isEdit ? `/api/backend/users/${editingWorker.id}` : "/api/backend/users";
    const method = isEdit ? "PUT" : "POST";

    const payload: any = {
      name: workerFormData.name,
      email: workerFormData.email,
      role: workerFormData.role,
      businessId: selectedBusiness.id,
    };
    if (workerFormData.password) {
      payload.password = workerFormData.password;
    }

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al guardar trabajador.");
        return data;
      })
      .then(() => {
        setIsAddWorkerModalOpen(false);
        fetchWorkers(selectedBusiness.id);
      })
      .catch((err) => {
        setWorkerErrorMsg(err.message);
      });
  };

  const handleDeleteWorker = (id: string) => {
    if (!selectedBusiness) return;
    if (!window.confirm("¿Estás seguro de que deseas eliminar este trabajador?")) {
      return;
    }
    fetch(`/api/backend/users/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al eliminar");
        return res.json();
      })
      .then(() => {
        fetchWorkers(selectedBusiness.id);
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  const fetchBusinesses = () => {
    fetch("/api/backend/admin/businesses")
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

  const handleOpenCreateModal = () => {
    setEditingBusiness(null);
    setNewBusiness({
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (biz: BusinessItem) => {
    setEditingBusiness(biz);
    setNewBusiness({
      name: biz.name,
      email: biz.email || "",
      phone: biz.phone || "",
      address: biz.address || "",
      password: "",
    });
    setIsModalOpen(true);
  };

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();

    const isEdit = !!editingBusiness;
    const url = isEdit ? `/api/backend/business/${editingBusiness.id}` : "/api/backend/admin/businesses";
    const method = isEdit ? "PUT" : "POST";

    const payload = isEdit ? {
      name: newBusiness.name,
      email: newBusiness.email,
      phone: newBusiness.phone,
      address: newBusiness.address,
    } : newBusiness;

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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
        setEditingBusiness(null);
        setIsModalOpen(false);
      })
      .catch((err) => {
        console.error("Error saving business:", err);
        alert(
          "Error al guardar el negocio. Asegúrate de que el email sea único y el teléfono tenga formato válido.",
        );
      });
  };

  const handleDeleteBusiness = (id: string) => {
    if (session?.user && session.user.id === id) {
      alert("No puedes eliminar tu propia cuenta de administrador.");
      return;
    }
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este local? Se borrarán de forma permanente todas sus citas y clientes de la base de datos.",
    );
    if (!confirmDelete) return;

    fetch(`/api/backend/admin/businesses/${id}`, {
      method: "DELETE",
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
      b.address.toLowerCase().includes(searchQuery.toLowerCase()),
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
              onClick={handleOpenCreateModal}
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
                  className="bg-surface-container-lowest p-6 rounded-md border border-outline-variant shadow-[0px_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:border-primary-fixed-dim transition-colors group"
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
                      <Badge variant="secondary">{biz.role}</Badge>
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

                  <div className="flex justify-end items-center gap-2 mt-8 pt-6 border-t border-outline-variant/65">
                    <button
                      onClick={() => handleOpenWorkersModal(biz)}
                      className="p-2 text-outline hover:text-primary hover:bg-primary/10 rounded-full transition-colors cursor-pointer"
                      title="Gestionar trabajadores"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(biz)}
                      className="p-2 text-outline hover:text-primary hover:bg-primary/10 rounded-full transition-colors cursor-pointer animate-none"
                      title="Editar local"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
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
                No se encontraron locales de negocio registrados que coincidan
                con la búsqueda.
              </div>
            )}
          </section>
        </main>

        {/* Mobile floating FAB action */}
        <button
          onClick={handleOpenCreateModal}
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
          <div className="relative bg-surface-container-lowest rounded-md shadow-xl border border-outline-variant max-w-md w-full z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="font-title-lg text-title-lg text-on-surface font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>{editingBusiness ? "Editar Local" : "Añadir Nuevo Local"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveBusiness} className="p-6">
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="bizName">Nombre Comercial</FieldLabel>
                  <input
                    id="bizName"
                    type="text"
                    required
                    placeholder="Ej. Glow Estética"
                    value={newBusiness.name}
                    onChange={(e) =>
                      setNewBusiness((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="bizEmail">
                    {editingBusiness ? "Email de contacto" : "Email de acceso"}
                  </FieldLabel>
                  <input
                    id="bizEmail"
                    type="email"
                    required
                    placeholder="contacto@glow.com"
                    value={newBusiness.email}
                    onChange={(e) =>
                      setNewBusiness((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                  />
                </Field>

                {!editingBusiness && (
                  <Field>
                    <FieldLabel htmlFor="bizPassword">
                      Contraseña de acceso
                    </FieldLabel>
                    <input
                      id="bizPassword"
                      type="password"
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={newBusiness.password}
                      onChange={(e) =>
                        setNewBusiness((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                    />
                  </Field>
                )}

                <Field>
                  <FieldLabel htmlFor="bizPhone">
                    Teléfono de WhatsApp
                  </FieldLabel>
                  <input
                    id="bizPhone"
                    type="tel"
                    required
                    placeholder="34600000000 (sin símbolos)"
                    value={newBusiness.phone}
                    onChange={(e) =>
                      setNewBusiness((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="bizAddress">Dirección Física</FieldLabel>
                  <input
                    id="bizAddress"
                    type="text"
                    placeholder="Calle de Serrano, 10, Madrid"
                    value={newBusiness.address}
                    onChange={(e) =>
                      setNewBusiness((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                  />
                </Field>
              </FieldGroup>

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
                  {editingBusiness ? "Guardar Cambios" : "Crear Local"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Workers Management Modal */}
      {isWorkersModalOpen && selectedBusiness && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/35">
              <h2 className="font-title-lg text-title-lg font-semibold text-on-surface flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span>Trabajadores - {selectedBusiness.name}</span>
              </h2>
              <button
                onClick={() => setIsWorkersModalOpen(false)}
                className="p-1.5 hover:bg-surface-variant text-on-surface-variant rounded-full cursor-pointer active:scale-90 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <p className="font-body-md text-on-surface-variant">
                  Lista de personal que tiene acceso a esta sede.
                </p>
                <button
                  onClick={handleOpenCreateWorkerModal}
                  className="py-2 px-4 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer font-semibold shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Añadir Trabajador</span>
                </button>
              </div>

              <div className="border border-outline-variant rounded-xl overflow-hidden">
                {workers.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant font-medium">
                    No hay trabajadores registrados en este local.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant bg-surface-container-low/35">
                        <th className="p-3 font-label-md text-label-md text-on-surface-variant font-semibold">Nombre</th>
                        <th className="p-3 font-label-md text-label-md text-on-surface-variant font-semibold">Email</th>
                        <th className="p-3 font-label-md text-label-md text-on-surface-variant font-semibold">Rol</th>
                        <th className="p-3 font-label-md text-label-md text-on-surface-variant font-semibold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workers.map((worker) => (
                        <tr key={worker.id} className="border-b border-outline-variant/30 last:border-0 hover:bg-surface-container-low/20">
                          <td className="p-3 font-body-md text-on-surface font-semibold">{worker.name}</td>
                          <td className="p-3 font-body-md text-on-surface-variant">{worker.email}</td>
                          <td className="p-3">
                            <Badge variant={worker.role === "JEFE" ? "secondary" : "outline"}>
                              {worker.role === "JEFE" ? "Jefe" : "Empleado"}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditWorkerModal(worker)}
                                className="p-1.5 hover:bg-surface-variant text-on-surface-variant hover:text-on-surface rounded-md cursor-pointer transition-all"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteWorker(worker.id)}
                                disabled={worker.id === session?.user?.id}
                                className="p-1.5 hover:bg-error-container/20 text-on-surface-variant hover:text-error rounded-md cursor-pointer transition-all disabled:opacity-40"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Worker for Selected Business Modal */}
      {isAddWorkerModalOpen && selectedBusiness && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-[2px] z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/35">
              <h2 className="font-title-lg text-title-lg font-semibold text-on-surface flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                <span>{editingWorker ? "Editar Trabajador" : "Nuevo Trabajador"}</span>
              </h2>
              <button
                onClick={() => setIsAddWorkerModalOpen(false)}
                className="p-1.5 hover:bg-surface-variant text-on-surface-variant rounded-full cursor-pointer active:scale-90 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWorker} className="p-6 flex flex-col gap-6 overflow-y-auto">
              {workerErrorMsg && (
                <div className="bg-error-container border border-error-container/45 text-on-error-container p-4 rounded-xl font-medium text-body-md">
                  {workerErrorMsg}
                </div>
              )}

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="workerName">Nombre Completo</FieldLabel>
                  <input
                    id="workerName"
                    type="text"
                    required
                    placeholder="Ej. Sofía Martín"
                    value={workerFormData.name}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, name: e.target.value })}
                    className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="workerEmail">Correo Electrónico</FieldLabel>
                  <input
                    id="workerEmail"
                    type="email"
                    required
                    placeholder="correo@tienda.com"
                    value={workerFormData.email}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, email: e.target.value })}
                    className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="workerPassword">
                    Contraseña {editingWorker && <span className="text-on-surface-variant/50 font-normal">(dejar vacío para mantener)</span>}
                  </FieldLabel>
                  <input
                    id="workerPassword"
                    type="password"
                    placeholder={editingWorker ? "Nueva contraseña (opcional)" : "Mínimo 6 caracteres"}
                    value={workerFormData.password}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, password: e.target.value })}
                    required={!editingWorker}
                    className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="workerRole">Rol de Usuario</FieldLabel>
                  <select
                    id="workerRole"
                    value={workerFormData.role}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, role: e.target.value as "JEFE" | "EMPLEADO" })}
                    className="w-full bg-transparent text-body-lg text-on-surface border border-outline rounded-md p-3.5 focus:border-primary focus:border-2 focus:outline-none transition-all bg-surface"
                  >
                    <option value="EMPLEADO">Empleado (Staff)</option>
                    <option value="JEFE">Jefe / Encargado</option>
                  </select>
                </Field>
              </FieldGroup>

              <div className="flex items-center justify-end gap-3 mt-4 border-t border-outline-variant/50 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddWorkerModalOpen(false)}
                  className="py-2 px-4 text-on-surface-variant hover:bg-surface-variant rounded-lg font-medium text-body-md active:scale-95 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-primary text-on-primary rounded-lg font-medium text-body-md active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  {editingWorker ? "Guardar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
