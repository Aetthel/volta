"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Store, Clock, Briefcase, Camera, Save, Loader2, Plus, Pencil, X,
  Users, UserPlus, Edit2, Trash2, User,
} from "lucide-react";
import type { BusinessProfile, BusinessHours, Service, Worker, ToastState } from "@/types/settings";
import AddServiceModal from "@/components/AddServiceModal";
import WorkerModal from "@/components/settings/WorkerModal";
import {
  Card, CardHeader, CardTitle, CardContent, CardFooter,
  FloatingInput, FloatingTextarea, Button, FieldGroup, Field, Skeleton,
} from "@/components/ui/volta-ui";

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

interface BusinessSectionProps {
  profile: BusinessProfile;
  setProfile: React.Dispatch<React.SetStateAction<BusinessProfile>>;
  businessId: string;
  setToast: (toast: ToastState) => void;
}

export default function BusinessSection({ profile, setProfile, businessId, setToast }: BusinessSectionProps) {
  const { data: session, update } = useSession();
  const role = session?.user?.role || "EMPLEADO";

  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [loadingHours, setLoadingHours] = useState(false);
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [savingHours, setSavingHours] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [showWorkers, setShowWorkers] = useState(false);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [workerFormData, setWorkerFormData] = useState({ name: "", email: "", password: "", role: "EMPLEADO" as "JEFE" | "EMPLEADO" });
  const [workerErrorMsg, setWorkerErrorMsg] = useState("");

  const businessLogoInputRef = useRef<HTMLInputElement>(null);

  const fetchHours = useCallback(() => {
    if (!businessId) return;
    setLoadingHours(true);
    fetch(`/api/backend/business/${businessId}/hours`)
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setHours(data); setLoadingHours(false); })
      .catch(() => setLoadingHours(false));
  }, [businessId]);

  const fetchServices = useCallback(() => {
    if (!businessId) return;
    setLoadingServices(true);
    fetch(`/api/backend/services?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setServices(data); setLoadingServices(false); })
      .catch(() => setLoadingServices(false));
  }, [businessId]);

  const fetchWorkers = useCallback(() => {
    if (!businessId || businessId === "mock-business-id" || role === "ADMIN") return;
    fetch(`/api/backend/users?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) { setWorkers(data); setShowWorkers(data.length > 1); } })
      .catch(() => {});
  }, [businessId, role]);

  useEffect(() => { fetchHours(); fetchServices(); fetchWorkers(); }, [fetchHours, fetchServices, fetchWorkers]);

  const handleBusinessLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfile((prev) => ({ ...prev, logoUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`/api/backend/business/${businessId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: profile.name, email: profile.email, phone: profile.phone, address: profile.address, coverUrl: profile.coverUrl, logoUrl: profile.logoUrl, description: profile.description }),
    })
      .then((res) => { if (!res.ok) throw new Error("Failed"); return res.json(); })
      .then(async (data) => {
        setIsEditingBusiness(false);
        setToast({ show: true, text: "¡Información del negocio guardada!" });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);
        if (update) await update({ ...session, user: { ...session?.user, name: data.name, email: data.email } });
      })
      .catch(() => {
        setToast({ show: true, text: "Error al guardar los ajustes." });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);
        setIsEditingBusiness(false);
      });
  };

  const handleSaveHours = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHours(true);
    fetch(`/api/backend/business/${businessId}/hours`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hours),
    })
      .then((res) => { if (!res.ok) throw new Error("Failed"); return res.json(); })
      .then((data) => {
        setHours(data); setIsEditingHours(false); setSavingHours(false);
        setToast({ show: true, text: "Horario de apertura guardado correctamente." });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);
      })
      .catch(() => setSavingHours(false));
  };

  const handleSaveService = (serviceData: { id?: string; name: string; price: number; duration: number; description?: string }) => {
    const isEdit = !!serviceData.id;
    fetch(isEdit ? `/api/backend/services/${serviceData.id}` : "/api/backend/services", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...serviceData, businessId }),
    })
      .then((res) => { if (!res.ok) throw new Error("Failed"); return res.json(); })
      .then(() => {
        fetchServices();
        setToast({ show: true, text: isEdit ? "Servicio actualizado correctamente." : "Servicio añadido correctamente." });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);
      })
      .catch(() => {});
  };

  const handleDeleteService = (serviceId: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este servicio?")) return;
    fetch(`/api/backend/services/${serviceId}`, { method: "DELETE" })
      .then((res) => { if (!res.ok) throw new Error("Failed"); return res.json(); })
      .then(() => {
        fetchServices();
        setToast({ show: true, text: "Servicio eliminado correctamente." });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);
      })
      .catch(() => {});
  };

  const handleSaveWorker = (e: React.FormEvent) => {
    e.preventDefault();
    setWorkerErrorMsg("");
    if (!workerFormData.name || !workerFormData.email) { setWorkerErrorMsg("El nombre y el correo son obligatorios."); return; }
    if (!editingWorker && !workerFormData.password) { setWorkerErrorMsg("La contraseña es obligatoria para nuevos trabajadores."); return; }

    const isEdit = !!editingWorker;
    fetch(isEdit ? `/api/backend/users/${editingWorker.id}` : "/api/backend/users", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...workerFormData, businessId }),
    })
      .then(async (res) => { const data = await res.json(); if (!res.ok) throw new Error(data.error || "Error al guardar trabajador."); return data; })
      .then(() => {
        setToast({ show: true, text: isEdit ? "¡Trabajador actualizado!" : "¡Trabajador creado!" });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);
        setIsWorkerModalOpen(false);
        fetchWorkers();
      })
      .catch((err) => setWorkerErrorMsg(err.message));
  };

  const handleDeleteWorker = (id: string) => {
    if (id === session?.user?.id) { alert("No puedes eliminar tu propia cuenta activa."); return; }
    if (!window.confirm("¿Estás seguro de que deseas eliminar este trabajador?")) return;
    fetch(`/api/backend/users/${id}`, { method: "DELETE" })
      .then((res) => { if (!res.ok) throw new Error("Error al eliminar"); return res.json(); })
      .then(() => {
        setToast({ show: true, text: "¡Trabajador eliminado!" });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);
        fetchWorkers();
      })
      .catch((err) => alert(err.message));
  };

  const filteredServices = services.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-gutter animate-in fade-in duration-200">
      {/* Business Profile Card */}
      {isEditingBusiness ? (
        <Card className="col-span-1 sm:col-span-2 lg:col-span-8 flex flex-col justify-between">
          <form onSubmit={handleSaveBusiness} className="h-full flex flex-col justify-between">
            <div>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-primary flex items-center gap-2"><Store /><span>Información del Negocio</span></CardTitle>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="md" onClick={() => { setIsEditingBusiness(false); }}
                    className="px-4 py-2 hover:bg-surface-variant/20 text-on-surface font-medium shadow-none">Cancelar</Button>
                  <Button type="submit" variant="primary" size="md" className="flex items-center gap-1.5 px-4 py-2 font-medium">
                    <Save /><span>Guardar</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative group shrink-0">
                    <div className="w-20 h-20 rounded-md overflow-hidden bg-surface-container border border-outline-variant shadow-sm">
                      {profile.logoUrl ? (
                        <img src={profile.logoUrl} alt="Foto del Negocio" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#b0c4de]/30 text-slate-600">
                          <Store className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <input type="file" ref={businessLogoInputRef} onChange={handleBusinessLogoChange} accept="image/*" className="hidden" />
                    <Button type="button" variant="ghost" onClick={() => businessLogoInputRef.current?.click()}
                      className="absolute inset-0 bg-primary/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md border border-primary/20 w-full h-full p-0 shadow-none hover:bg-primary/50 text-white rounded-none">
                      <Camera className="text-white" />
                    </Button>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">Foto del Negocio</span>
                    <p className="text-[11px] text-on-surface-variant/85 leading-normal">Esta es la imagen de perfil de tu negocio o logotipo comercial.</p>
                  </div>
                </div>
                <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field><FloatingInput id="profile-name" label="Nombre Comercial" type="text" required value={profile.name}
                    onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))} /></Field>
                  <Field><FloatingInput id="profile-email" label="Correo Electrónico" type="email" required value={profile.email}
                    onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))} /></Field>
                  <Field><FloatingInput id="profile-phone" label="Teléfono" type="tel" required value={profile.phone}
                    onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))} /></Field>
                  <Field><FloatingInput id="profile-address" label="Dirección" type="text" required value={profile.address}
                    onChange={(e) => setProfile((prev) => ({ ...prev, address: e.target.value }))} /></Field>
                </FieldGroup>
                <Field className="mt-4">
                  <FloatingTextarea id="profile-description" label="Descripción del Negocio" value={profile.description || ""}
                    onChange={(e) => setProfile((prev) => ({ ...prev, description: e.target.value }))} rows={3} />
                </Field>
              </CardContent>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="col-span-1 sm:col-span-2 lg:col-span-8 flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-primary flex items-center gap-2"><Store /><span>Información del Negocio</span></CardTitle>
              <Button type="button" variant="ghost" onClick={() => setIsEditingBusiness(true)}
                className="text-primary hover:text-primary-container font-label-lg text-label-lg transition-all hover:underline p-0 shadow-none active:scale-100 font-medium">
                Editar negocio
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="shrink-0">
                  <div className="w-20 h-20 rounded-md overflow-hidden bg-surface-container border border-outline-variant shadow-sm">
                    {profile.logoUrl ? (
                      <img src={profile.logoUrl} alt="Foto del Negocio" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#b0c4de]/30 text-slate-600">
                        <Store className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">Foto del Negocio</span>
                  <p className="text-[11px] text-on-surface-variant/85 leading-normal">Logotipo comercial o imagen principal de tu salón.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                {[
                  { label: "Nombre Comercial", value: profile.name },
                  { label: "Correo Electrónico", value: profile.email },
                  { label: "Teléfono", value: profile.phone },
                  { label: "Dirección", value: profile.address },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-1">
                    <span className="font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">{item.label}</span>
                    <p className="font-body-lg text-body-lg font-medium text-on-surface">{item.value}</p>
                  </div>
                ))}
                <div className="flex flex-col gap-1 sm:col-span-2 border-t border-outline-variant/35 pt-4">
                  <span className="font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Descripción del Negocio</span>
                  <p className="font-body-lg text-body-lg font-medium text-on-surface leading-relaxed whitespace-pre-wrap">{profile.description || "Sin descripción disponible."}</p>
                </div>

                <div className="flex flex-col sm:col-span-2 border-t border-outline-variant/35 pt-4 gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-label-md text-label-md text-on-surface font-semibold">Reserva Online Pública</span>
                      <p className="text-body-xs text-on-surface-variant">Permite a tus clientes reservar cita directamente desde un enlace web público sin necesidad de crear cuenta.</p>
                    </div>
                    <Button
                      variant={profile.enablePublicBooking !== false ? "primary" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newValue = profile.enablePublicBooking === false ? true : false;
                        setProfile(prev => ({ ...prev, enablePublicBooking: newValue }));
                        fetch(`/api/backend/business/${businessId}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ enablePublicBooking: newValue })
                        });
                        setToast({ show: true, text: newValue ? "Reservas públicas activadas" : "Reservas públicas desactivadas" });
                        setTimeout(() => setToast({ show: false, text: "" }), 3000);
                      }}
                    >
                      {profile.enablePublicBooking !== false ? "Activado" : "Desactivado"}
                    </Button>
                  </div>
                  {profile.enablePublicBooking !== false && (
                    <div className="flex items-center gap-2 p-3 bg-surface-container-low border border-outline-variant/60 rounded-lg text-body-sm text-on-surface">
                      <span className="font-medium text-primary shrink-0">Enlace Público:</span>
                      <code className="text-xs bg-surface-container px-2 py-1 rounded truncate flex-1">
                        {typeof window !== "undefined" ? `${window.location.origin}/booking/${businessId}` : `/booking/${businessId}`}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const url = `${window.location.origin}/booking/${businessId}`;
                          navigator.clipboard.writeText(url);
                          setToast({ show: true, text: "¡Enlace copiado al portapapeles!" });
                          setTimeout(() => setToast({ show: false, text: "" }), 3000);
                        }}
                        className="text-xs text-primary font-semibold hover:underline shadow-none"
                      >
                        Copiar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      )}

      {/* Operating Hours Card */}
      <Card className="col-span-1 sm:col-span-1 lg:col-span-4 flex flex-col justify-between">
        <div>
          <CardHeader className="pb-4">
            <CardTitle className="text-primary flex items-center gap-2"><Clock /><span>Horario de Apertura</span></CardTitle>
          </CardHeader>
          <CardContent>
            {loadingHours ? (
              <div className="flex flex-col gap-4 py-2">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-outline-variant/30">
                    <Skeleton className="h-5 w-24" /><Skeleton className="h-5 w-32" />
                  </div>
                ))}
              </div>
            ) : !isEditingHours ? (
              <div className="flex flex-col gap-2.5 sm:gap-4 font-medium text-body-md text-on-surface-variant">
                {hours.map((h) => (
                  <div key={h.dayOfWeek} className="flex items-center justify-between py-1 border-b border-outline-variant/65">
                    <span>{DAY_NAMES[h.dayOfWeek]}</span>
                    <span className={`font-semibold ${h.isClosed ? "text-error" : "text-primary"}`}>
                      {h.isClosed ? "Cerrado" : `${h.openTime} - ${h.closeTime}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSaveHours} className="flex flex-col gap-4">
                {hours.map((h, idx) => (
                  <div key={h.dayOfWeek} className="flex flex-col gap-2 pb-2 border-b border-outline-variant/40">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-body-md text-on-surface">{DAY_NAMES[h.dayOfWeek]}</span>
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-on-surface-variant select-none">
                        <input type="checkbox" checked={h.isClosed}
                          onChange={(e) => { const u = [...hours]; u[idx] = { ...u[idx], isClosed: e.target.checked }; setHours(u); }}
                          className="rounded border-outline-variant text-primary focus:ring-primary" />
                        Cerrado
                      </label>
                    </div>
                    {!h.isClosed && (
                      <div className="flex items-center gap-2 w-full mt-2">
                        <div className="flex-1 min-w-0">
                          <FloatingInput type="time" id={`open-${idx}`} label="Apertura" value={h.openTime}
                            onChange={(e) => { const u = [...hours]; u[idx] = { ...u[idx], openTime: e.target.value }; setHours(u); }} />
                        </div>
                        <span className="text-xs text-on-surface-variant font-medium shrink-0">a</span>
                        <div className="flex-1 min-w-0">
                          <FloatingInput type="time" id={`close-${idx}`} label="Cierre" value={h.closeTime}
                            onChange={(e) => { const u = [...hours]; u[idx] = { ...u[idx], closeTime: e.target.value }; setHours(u); }} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-outline-variant/35">
                  <Button variant="outline" size="sm" type="button" onClick={() => { setIsEditingHours(false); fetchHours(); }}
                    className="px-3 py-1.5 font-medium shadow-none">Cancelar</Button>
                  <Button variant="primary" size="sm" type="submit" disabled={savingHours}
                    className="px-3 py-1.5 font-medium flex items-center gap-1">
                    {savingHours && <Loader2 className="animate-spin" />}<span>Guardar</span>
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </div>
        {!isEditingHours && !loadingHours && (
          <CardFooter className="pt-0">
            <Button variant="outline" size="md" onClick={() => setIsEditingHours(true)}
              className="w-full py-2 shadow-none font-medium">Modificar Horarios</Button>
          </CardFooter>
        )}
      </Card>

      {/* Services Card */}
      <Card className="col-span-1 sm:col-span-2 lg:col-span-12 flex flex-col justify-between">
        <div>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-primary flex items-center gap-2"><Briefcase /><span>Servicios Destacados</span></CardTitle>
          </CardHeader>
          <CardContent>
            {loadingServices ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-surface-container-low flex items-center justify-between p-4 rounded-md animate-pulse">
                    <div className="flex items-center gap-4 w-full">
                      <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                      <div className="flex flex-col gap-2 w-full"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-1/3" /></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {filteredServices.map((service) => (
                  <div key={service.id} className="bg-surface-container-low flex items-center justify-between p-4 rounded-md group/service relative">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0"><Briefcase /></div>
                      <div>
                        <p className="font-body-lg text-body-lg font-semibold text-on-surface">{service.name}</p>
                        <p className="font-body-md text-body-md text-on-surface-variant">{service.duration} min · {service.price}€</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover/service:opacity-100 transition-opacity absolute right-4 top-1/2 -translate-y-1/2 bg-surface-container-low pl-2">
                      <Button variant="ghost" size="sm" onClick={() => { setServiceToEdit(service); setIsAddServiceModalOpen(true); }}
                        className="p-2 hover:bg-surface-variant rounded-lg text-primary shadow-none active:scale-[0.98] w-9 h-9" title="Editar servicio">
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteService(service.id)}
                        className="p-2 hover:bg-surface-variant rounded-lg text-error shadow-none active:scale-[0.98] w-9 h-9" title="Eliminar servicio">
                        <X />
                      </Button>
                    </div>
                  </div>
                ))}
                <div onClick={() => { setServiceToEdit(null); setIsAddServiceModalOpen(true); }}
                  className="border border-dashed border-outline-variant hover:border-primary flex items-center justify-center gap-2 p-4 rounded-md cursor-pointer hover:bg-surface-variant/20 transition-all min-h-[80px]">
                  <Plus /><span className="font-label-lg text-label-lg font-semibold text-primary">Añadir Servicio</span>
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </Card>

      {/* Workers Management Card */}
      {showWorkers && (
        <Card className="col-span-1 sm:col-span-2 lg:col-span-12">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-primary flex items-center gap-2"><Users className="w-5 h-5 text-primary" /><span className="text-primary">Gestión de Trabajadores</span></CardTitle>
            <Button variant="primary" size="md"
              onClick={() => { setEditingWorker(null); setWorkerFormData({ name: "", email: "", password: "", role: "EMPLEADO" }); setWorkerErrorMsg(""); setIsWorkerModalOpen(true); }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 active:scale-95 font-medium">
              <UserPlus /><span>Añadir Empleado</span>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              {workers.map((worker) => (
                <div key={worker.id} className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-4 flex items-center gap-4 relative group/worker transition-all hover:shadow-sm">
                  <div className="shrink-0">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center border border-outline-variant/40 bg-secondary-container text-on-secondary-container">
                      <User className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-body-lg truncate text-on-surface">{worker.name}</span>
                    <span className="text-body-md truncate text-on-surface-variant">{worker.role === "JEFE" ? "Jefe de Tienda" : "Estilista"}</span>
                  </div>
                  <div className="absolute right-3 top-3 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover/worker:opacity-100 transition-opacity bg-surface-container-low pl-2">
                    <Button variant="ghost" size="sm"
                      onClick={() => { setEditingWorker(worker); setWorkerFormData({ name: worker.name, email: worker.email, password: "", role: worker.role as "JEFE" | "EMPLEADO" }); setWorkerErrorMsg(""); setIsWorkerModalOpen(true); }}
                      className="p-1.5 hover:bg-surface-variant text-on-surface-variant hover:text-on-surface rounded-md active:scale-95 shadow-none w-8 h-8" title="Editar trabajador">
                      <Edit2 />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteWorker(worker.id)} disabled={worker.id === session?.user?.id}
                      className="p-1.5 hover:bg-error-container/20 text-on-surface-variant hover:text-error rounded-md active:scale-95 disabled:opacity-40 shadow-none w-8 h-8" title="Eliminar trabajador">
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <AddServiceModal isOpen={isAddServiceModalOpen} onClose={() => { setIsAddServiceModalOpen(false); setServiceToEdit(null); }}
        onSave={handleSaveService} serviceToEdit={serviceToEdit} />
      <WorkerModal isOpen={isWorkerModalOpen} onClose={() => setIsWorkerModalOpen(false)} onSave={handleSaveWorker}
        formData={workerFormData} setFormData={setWorkerFormData} errorMsg={workerErrorMsg} isEditing={!!editingWorker} />
    </div>
  );
}
