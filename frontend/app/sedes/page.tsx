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
  Search,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { Alert, FieldGroup, Field, FieldLabel, Badge, Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Empty, FloatingInput, Select, PageHeader } from "@/components/ui/volta-ui";

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
        {/* Content Canvas */}
        <main className="p-gutter max-w-container-max w-full mx-auto flex-1">
          <PageHeader
            title="Gestión de Locales"
            description="Registra y administra las cuentas de salones en la plataforma."
            actions={
              <Button
                variant="primary"
                size="lg"
                onClick={handleOpenCreateModal}
                className="flex items-center gap-1 px-6 py-2 self-start"
              >
                <Plus data-icon="plus" />
                <span>Añadir Local</span>
              </Button>
            }
          />

          {/* Grid Layout of Businesses */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {filteredBusinesses.length > 0 ? (
              filteredBusinesses.map((biz) => (
                <Card
                  key={biz.id}
                  className="p-6 flex flex-col justify-between hover:border-primary-fixed-dim transition-colors group"
                >
                  <div>
                    {/* Header: Title and Badge */}
                    <div className="flex justify-between items-start gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-surface-container text-primary rounded-lg shrink-0">
                          <Store data-icon="store" />
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
                        <Mail data-icon="mail" className="text-outline shrink-0 mt-0.5" />
                        <span className="truncate">{biz.email}</span>
                      </div>
                      {biz.phone && (
                        <div className="flex items-center gap-2">
                          <Phone data-icon="phone" className="text-outline shrink-0" />
                          <span>{biz.phone}</span>
                        </div>
                      )}
                      {biz.address && (
                        <div className="flex items-start gap-2 leading-relaxed">
                          <MapPin data-icon="map-pin" className="text-outline shrink-0 mt-0.5" />
                          <span>{biz.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end items-center gap-2 mt-8 pt-6 border-t border-outline-variant/65">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenWorkersModal(biz)}
                      className="p-2 text-outline hover:text-primary hover:bg-primary/10 rounded-full shadow-none w-8 h-8"
                      title="Gestionar trabajadores"
                    >
                      <Users data-icon="users" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditModal(biz)}
                      className="p-2 text-outline hover:text-primary hover:bg-primary/10 rounded-full shadow-none w-8 h-8 animate-none"
                      title="Editar local"
                    >
                      <Pencil data-icon="pencil" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBusiness(biz.id)}
                      className="p-2 text-outline hover:text-error hover:bg-error-container/20 rounded-full shadow-none w-8 h-8"
                      title="Eliminar salón permanentemente"
                    >
                      <Trash2 data-icon="trash" />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Empty
                title="No se encontraron locales"
                description="Prueba a ajustar tu búsqueda o añade un nuevo local de negocio."
                icon={Store}
                action={
                  <Button variant="primary" onClick={handleOpenCreateModal}>
                    Añadir Local
                  </Button>
                }
                className="col-span-full py-12"
              />
            )}
          </section>
        </main>

        {/* Mobile floating FAB action */}
        <Button
          variant="primary"
          onClick={handleOpenCreateModal}
          className="md:hidden fixed bottom-20 right-6 z-40 p-4 rounded-full shadow-lg"
        >
          <Plus data-icon="plus" />
        </Button>

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
          <Card className="relative max-w-md w-full z-10 animate-in fade-in zoom-in-95 duration-200 rounded-md shadow-xl">
            {/* Header */}
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="font-title-lg text-title-lg text-on-surface font-semibold flex items-center gap-2">
                <Sparkles data-icon="sparkles" className="text-primary" />
                <span>{editingBusiness ? "Editar Local" : "Añadir Nuevo Local"}</span>
              </h3>
              <Button
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-on-surface-variant hover:text-on-surface w-8 h-8 active:scale-95 shadow-none"
              >
                <X data-icon="x" />
              </Button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveBusiness} className="p-6">
              <FieldGroup className="gap-4">
                <Field>
                  <FloatingInput
                    id="bizName"
                    label="Nombre Comercial"
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
                  />
                </Field>

                <Field>
                  <FloatingInput
                    id="bizEmail"
                    label={editingBusiness ? "Email de contacto" : "Email de acceso"}
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
                  />
                </Field>

                {!editingBusiness && (
                  <Field>
                    <FloatingInput
                      id="bizPassword"
                      label="Contraseña de acceso"
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
                    />
                  </Field>
                )}

                <Field>
                  <FloatingInput
                    id="bizPhone"
                    label="Teléfono de WhatsApp"
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
                  />
                </Field>

                <Field>
                  <FloatingInput
                    id="bizAddress"
                    label="Dirección Física"
                    type="text"
                    placeholder="Calle de Serrano, 10, Madrid"
                    value={newBusiness.address}
                    onChange={(e) =>
                      setNewBusiness((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                  />
                </Field>
              </FieldGroup>

              {/* Footer Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-primary shadow-none"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="px-6 py-2 font-medium"
                >
                  {editingBusiness ? "Guardar Cambios" : "Crear Local"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
      {/* Workers Management Modal */}
      {isWorkersModalOpen && selectedBusiness && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/35">
              <h2 className="font-title-lg text-title-lg font-semibold text-on-surface flex items-center gap-2">
                <Users data-icon="users" className="text-primary" />
                <span>Trabajadores - {selectedBusiness.name}</span>
              </h2>
              <Button
                variant="ghost"
                onClick={() => setIsWorkersModalOpen(false)}
                className="p-1.5 text-on-surface-variant rounded-full w-8 h-8 shadow-none"
              >
                <X data-icon="x" />
              </Button>
            </div>

            <CardContent className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <p className="font-body-md text-on-surface-variant">
                  Lista de personal que tiene acceso a esta sede.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleOpenCreateWorkerModal}
                  className="flex items-center justify-center gap-2 px-4 py-2 active:scale-95 font-medium"
                >
                  <UserPlus data-icon="user-plus" />
                  <span>Añadir Trabajador</span>
                </Button>
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEditWorkerModal(worker)}
                                className="p-1.5 hover:bg-surface-variant text-on-surface-variant hover:text-on-surface rounded-md cursor-pointer w-8 h-8 shadow-none"
                              >
                                <Pencil data-icon="pencil" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteWorker(worker.id)}
                                disabled={worker.id === session?.user?.id}
                                className="p-1.5 hover:bg-error-container/20 text-on-surface-variant hover:text-error rounded-md cursor-pointer w-8 h-8 shadow-none disabled:opacity-40"
                              >
                                <Trash2 data-icon="trash" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Worker for Selected Business Modal */}
      {isAddWorkerModalOpen && selectedBusiness && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-[2px] z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/35">
              <h2 className="font-title-lg text-title-lg font-semibold text-on-surface flex items-center gap-2">
                <UserPlus data-icon="user-plus" className="text-primary" />
                <span>{editingWorker ? "Editar Trabajador" : "Nuevo Trabajador"}</span>
              </h2>
              <Button
                variant="ghost"
                onClick={() => setIsAddWorkerModalOpen(false)}
                className="p-1.5 text-on-surface-variant rounded-full w-8 h-8 shadow-none"
              >
                <X data-icon="x" />
              </Button>
            </div>

            <form onSubmit={handleSaveWorker} className="p-6 flex flex-col gap-6 overflow-y-auto">
              {workerErrorMsg && (
                <Alert variant="error">
                  {workerErrorMsg}
                </Alert>
              )}

              <FieldGroup>
                <Field>
                  <FloatingInput
                    id="workerName"
                    label="Nombre Completo"
                    type="text"
                    required
                    placeholder="Ej. Sofía Martín"
                    value={workerFormData.name}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, name: e.target.value })}
                  />
                </Field>

                <Field>
                  <FloatingInput
                    id="workerEmail"
                    label="Correo Electrónico"
                    type="email"
                    required
                    placeholder="correo@tienda.com"
                    value={workerFormData.email}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, email: e.target.value })}
                  />
                </Field>

                <Field>
                  <FloatingInput
                    id="workerPassword"
                    label={editingWorker ? "Nueva contraseña (opcional)" : "Contraseña (mínimo 6 caracteres)"}
                    type="password"
                    placeholder={editingWorker ? "Nueva contraseña (opcional)" : "Mínimo 6 caracteres"}
                    value={workerFormData.password}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, password: e.target.value })}
                    required={!editingWorker}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="workerRole">Rol de Usuario</FieldLabel>
                  <Select
                    id="workerRole"
                    value={workerFormData.role}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, role: e.target.value as "JEFE" | "EMPLEADO" })}
                  >
                    <option value="EMPLEADO">Empleado (Staff)</option>
                    <option value="JEFE">Jefe / Encargado</option>
                  </Select>
                </Field>
              </FieldGroup>

              <div className="flex items-center justify-end gap-3 mt-4 border-t border-outline-variant/50 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setIsAddWorkerModalOpen(false)}
                  className="px-4 py-2 text-on-surface-variant active:scale-95 shadow-none font-medium"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="px-5 py-2 active:scale-95 font-medium"
                >
                  {editingWorker ? "Guardar" : "Crear"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
