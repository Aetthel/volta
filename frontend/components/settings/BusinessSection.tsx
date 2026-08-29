"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  Store,
  Clock,
  Briefcase,
  Camera,
  Save,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Globe,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Download,
  Search,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import type { BusinessProfile, BusinessHours, Service, ToastState } from "@/types/settings";
import dynamic from "next/dynamic";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  FloatingInput,
  FloatingTextarea,
  Button,
  Badge,
  FieldGroup,
  Field,
  FieldLabel,
  Skeleton,
} from "@/components/ui/volta-ui";

const AddServiceModal = dynamic(() => import("@/components/AddServiceModal"), {
  ssr: false,
});

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

interface BusinessSectionProps {
  profile: BusinessProfile;
  setProfile: React.Dispatch<React.SetStateAction<BusinessProfile>>;
  businessId: string;
  setToast: (toast: ToastState) => void;
}

export default function BusinessSection({
  profile,
  setProfile,
  businessId,
  setToast,
}: BusinessSectionProps) {
  const { data: session, update } = useSession();

  // Business Info Form State
  const [businessForm, setBusinessForm] = useState({
    name: profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    address: profile.address || "",
    description: profile.description || "",
  });
  const [savingBusiness, setSavingBusiness] = useState(false);

  // Business Hours State
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [loadingHours, setLoadingHours] = useState(false);
  const [savingHours, setSavingHours] = useState(false);

  // Services State
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  const [serviceTriggerRect, setServiceTriggerRect] = useState<{
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Copy URL state
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [downloadingQr, setDownloadingQr] = useState(false);

  const businessLogoInputRef = useRef<HTMLInputElement>(null);

  // Sync businessForm with incoming profile props
  useEffect(() => {
    setBusinessForm({
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      address: profile.address || "",
      description: profile.description || "",
    });
  }, [profile]);

  const fetchHours = useCallback(() => {
    if (!businessId || businessId === "mock-business-id") return;
    setLoadingHours(true);
    fetch(`/api/backend/business/${businessId}/hours`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Sort hours by standard Monday-Sunday order
          const sorted = [...data].sort((a, b) => {
            const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
            const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
            return dayA - dayB;
          });
          setHours(sorted);
        }
        setLoadingHours(false);
      })
      .catch(() => setLoadingHours(false));
  }, [businessId]);

  const fetchServices = useCallback(() => {
    if (!businessId || businessId === "mock-business-id") return;
    setLoadingServices(true);
    fetch(`/api/backend/services?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setServices(data);
        setLoadingServices(false);
      })
      .catch(() => setLoadingServices(false));
  }, [businessId]);

  useEffect(() => {
    fetchHours();
    fetchServices();
  }, [fetchHours, fetchServices]);

  // Handle Logo Upload
  const handleBusinessLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setToast({ show: true, text: "La imagen no debe superar los 5MB" });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const logoData = reader.result as string;
        setProfile((prev) => ({ ...prev, logoUrl: logoData }));
        fetch(`/api/backend/business/${businessId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logoUrl: logoData }),
        });
        setToast({ show: true, text: "Logotipo comercial actualizado" });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setProfile((prev) => ({ ...prev, logoUrl: null }));
    fetch(`/api/backend/business/${businessId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoUrl: null }),
    });
    setToast({ show: true, text: "Logotipo eliminado" });
    setTimeout(() => setToast({ show: false, text: "" }), 3000);
  };

  // Save Business Info
  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBusiness(true);
    try {
      const res = await fetch(`/api/backend/business/${businessId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(businessForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar información");

      setProfile((prev) => ({ ...prev, ...businessForm }));
      setToast({ show: true, text: "¡Datos comerciales guardados con éxito!" });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);

      if (update) {
        await update({
          ...session,
          user: { ...session?.user, name: data.name, email: data.email },
        });
      }
    } catch (err: any) {
      setToast({ show: true, text: err.message || "Error al guardar el negocio." });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    } finally {
      setSavingBusiness(false);
    }
  };

  // Save Operating Hours
  const handleSaveHours = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHours(true);
    try {
      const res = await fetch(`/api/backend/business/${businessId}/hours`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hours),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar horarios");

      setHours(data);
      setToast({ show: true, text: "¡Horario comercial guardado correctamente!" });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    } catch (err: any) {
      setToast({ show: true, text: err.message || "Error al guardar horarios" });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    } finally {
      setSavingHours(false);
    }
  };

  // Copy Monday hours to all weekdays (Tuesday - Friday)
  const applyMondayToWeekdays = () => {
    const monday = hours.find((h) => h.dayOfWeek === 1);
    if (!monday) return;

    setHours((prev) =>
      prev.map((h) => {
        if (h.dayOfWeek >= 1 && h.dayOfWeek <= 5) {
          return {
            ...h,
            openTime: monday.openTime,
            closeTime: monday.closeTime,
            isClosed: monday.isClosed,
          };
        }
        return h;
      })
    );
    setToast({ show: true, text: "Horario de lunes aplicado a todos los días laborables (L-V)" });
    setTimeout(() => setToast({ show: false, text: "" }), 3000);
  };

  // Toggle Public Booking Status
  const handleToggleBooking = () => {
    const newValue = profile.enablePublicBooking === false ? true : false;
    setProfile((prev) => ({ ...prev, enablePublicBooking: newValue }));
    fetch(`/api/backend/business/${businessId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enablePublicBooking: newValue }),
    });
    setToast({
      show: true,
      text: newValue ? "Reservas online activadas" : "Reservas online desactivadas",
    });
    setTimeout(() => setToast({ show: false, text: "" }), 3000);
  };

  // Service Management
  const handleSaveService = (serviceData: {
    id?: string;
    name: string;
    price: number;
    duration: number;
    description?: string;
  }) => {
    const isEdit = !!serviceData.id;
    fetch(isEdit ? `/api/backend/services/${serviceData.id}` : "/api/backend/services", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...serviceData, businessId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then(() => {
        fetchServices();
        setToast({
          show: true,
          text: isEdit ? "Servicio actualizado correctamente." : "Servicio añadido correctamente.",
        });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);
      })
      .catch(() => {});
  };

  const handleDeleteService = (serviceId: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este servicio?")) return;
    fetch(`/api/backend/services/${serviceId}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then(() => {
        fetchServices();
        setToast({ show: true, text: "Servicio eliminado correctamente." });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);
      })
      .catch(() => {});
  };

  const bookingUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/booking/${businessId}`
      : `https://volta.app/booking/${businessId}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(bookingUrl)}`;

  const handleDownloadQr = async () => {
    setDownloadingQr(true);
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `qr-reservas-${(profile.name || "volta").toLowerCase().replace(/\s+/g, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      setToast({ show: true, text: "¡Código QR descargado!" });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    } catch {
      window.open(qrImageUrl, "_blank");
    } finally {
      setDownloadingQr(false);
    }
  };

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return services || [];
    return (services || []).filter((s) =>
      (s?.name || "").toLowerCase().includes(q)
    );
  }, [services, searchQuery]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200 mt-2">
      {/* 1. Top Business Identity Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Logo with instant upload trigger */}
            <div className="relative group/logo shrink-0">
              <div
                onClick={() => businessLogoInputRef.current?.click()}
                className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-outline-variant/60 hover:border-primary bg-surface-container-high shadow-xs flex items-center justify-center cursor-pointer transition-all duration-200"
                title="Haz clic para cambiar el logotipo comercial"
              >
                {profile.logoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={profile.logoUrl}
                    alt="Logo del Negocio"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-2xl">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : "V"}
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity rounded-2xl">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>

              <input
                type="file"
                ref={businessLogoInputRef}
                onChange={handleBusinessLogoChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Business Title, Category & Active Status */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-title-lg text-xl font-bold text-on-surface">
                  {profile.name || "Nombre del Negocio"}
                </h2>
                <Badge
                  variant="default"
                  className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                >
                  {profile.businessType || "Peluquería / Salón"}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-on-surface-variant/80 flex-wrap">
                {profile.address && (
                  <span className="flex items-center gap-1.5 truncate max-w-xs">
                    <MapPin className="w-3.5 h-3.5 text-on-surface-variant/60 shrink-0" />
                    <span className="truncate">{profile.address}</span>
                  </span>
                )}
                {profile.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-on-surface-variant/60 shrink-0" />
                    <span>{profile.phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Logo Actions */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => businessLogoInputRef.current?.click()}
              className="text-xs font-semibold gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Cambiar logo</span>
            </Button>
            {profile.logoUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveLogo}
                className="text-xs font-semibold text-error hover:text-error hover:bg-error/10 gap-1.5"
                title="Eliminar logo"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 2. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Business Details & Services (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Business Details Card */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base font-bold text-on-surface flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" />
                <span>Datos del Establecimiento</span>
              </CardTitle>
              <CardDescription>
                Información de contacto, ubicación y presentación pública de tu negocio.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSaveBusiness}>
              <CardContent className="flex flex-col gap-4 pt-2">
                <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="biz-name">Nombre Comercial</FieldLabel>
                    <FloatingInput
                      id="biz-name"
                      label="Nombre del Negocio"
                      type="text"
                      required
                      value={businessForm.name}
                      onChange={(e) =>
                        setBusinessForm({ ...businessForm, name: e.target.value })
                      }
                      icon={Store}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="biz-phone">Teléfono de Contacto</FieldLabel>
                    <FloatingInput
                      id="biz-phone"
                      label="Teléfono Comercial"
                      type="tel"
                      required
                      value={businessForm.phone}
                      onChange={(e) =>
                        setBusinessForm({ ...businessForm, phone: e.target.value })
                      }
                      icon={Phone}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="biz-email">Correo Electrónico</FieldLabel>
                    <FloatingInput
                      id="biz-email"
                      label="Email de Notificaciones"
                      type="email"
                      required
                      value={businessForm.email}
                      onChange={(e) =>
                        setBusinessForm({ ...businessForm, email: e.target.value })
                      }
                      icon={Mail}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="biz-address">Dirección Física</FieldLabel>
                    <FloatingInput
                      id="biz-address"
                      label="Calle, Ciudad, Código Postal"
                      type="text"
                      value={businessForm.address}
                      onChange={(e) =>
                        setBusinessForm({ ...businessForm, address: e.target.value })
                      }
                      icon={MapPin}
                    />
                  </Field>
                </FieldGroup>

                <Field className="mt-1">
                  <FieldLabel htmlFor="biz-description">Descripción del Salón</FieldLabel>
                  <FloatingTextarea
                    id="biz-description"
                    label="Breve descripción o especialidades del salón..."
                    value={businessForm.description}
                    onChange={(e) =>
                      setBusinessForm({ ...businessForm, description: e.target.value })
                    }
                    rows={3}
                  />
                </Field>
              </CardContent>

              <CardFooter className="border-t border-outline-variant/40 pt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={savingBusiness}
                  variant="primary"
                  size="md"
                  className="flex items-center gap-2 font-medium"
                >
                  {savingBusiness ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Guardar Datos del Negocio</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Services Catalog Card */}
          <Card className="flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold text-on-surface flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary" />
                      <span>Catálogo de Servicios</span>
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5">
                      {services.length} {services.length === 1 ? "servicio" : "servicios"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Servicios disponibles para agendar citas en el salón o por reserva online.
                  </CardDescription>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setServiceTriggerRect(rect);
                    setServiceToEdit(null);
                    setIsAddServiceModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 font-medium shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir Servicio</span>
                </Button>
              </div>

              {/* Quick Search */}
              {services.length > 4 && (
                <div className="relative mt-2">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                  <input
                    type="text"
                    placeholder="Buscar servicio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-container-low border border-outline-variant/60 rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
                  />
                </div>
              )}
            </CardHeader>

            <CardContent className="pt-0">
              {loadingServices ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex items-center gap-3 animate-pulse"
                    >
                      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                      <div className="flex flex-col gap-1.5 flex-1">
                        <Skeleton className="w-2/3 h-4" />
                        <Skeleton className="w-1/3 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : services.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-3 border-2 border-dashed border-outline-variant/50 rounded-2xl bg-surface-container-lowest">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-on-surface">No hay servicios creados aún</p>
                    <p className="text-xs text-on-surface-variant max-w-sm">
                      Crea tu primer servicio con su duración y precio para empezar a agendar citas.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setServiceTriggerRect(rect);
                      setServiceToEdit(null);
                      setIsAddServiceModalOpen(true);
                    }}
                    className="mt-2 text-xs font-semibold gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Crear Primer Servicio</span>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredServices.map((service: Service) => (
                    <div
                      key={service.id}
                      className="bg-surface-container-low hover:bg-surface-container-high/40 transition-colors p-3.5 rounded-xl border border-outline-variant/50 flex items-center justify-between gap-3 group relative"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs">
                          <Briefcase className="w-5 h-5" strokeWidth={1.75} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-on-surface truncate">
                            {service.name}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-on-surface-variant/80">
                            <span className="font-semibold text-primary">
                              {formatCurrency(service.price)}
                            </span>
                            <span>•</span>
                            <span>{service.duration} min</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setServiceTriggerRect(rect);
                            setServiceToEdit(service);
                            setIsAddServiceModalOpen(true);
                          }}
                          className="p-1.5 h-8 w-8 text-on-surface-variant hover:text-primary rounded-lg"
                          title="Editar servicio"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteService(service.id)}
                          className="p-1.5 h-8 w-8 text-on-surface-variant hover:text-error rounded-lg"
                          title="Eliminar servicio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Public Booking Link & Operating Hours (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Public Online Booking Card & QR Code */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-on-surface flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  <span>Portal de Reservas Online</span>
                </CardTitle>
                <button
                  type="button"
                  onClick={handleToggleBooking}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer",
                    profile.enablePublicBooking !== false
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                      : "bg-surface-container text-on-surface-variant border border-outline-variant/60"
                  )}
                >
                  {profile.enablePublicBooking !== false ? "● Activo" : "○ Inactivo"}
                </button>
              </div>
              <CardDescription>
                Enlace web para que tus clientes puedan reservar citas directamente desde su móvil o Instagram.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 pt-1">
              {profile.enablePublicBooking !== false ? (
                <>
                  {/* Link Box */}
                  <div className="flex items-center gap-1.5 p-1.5 bg-surface-container-low border border-outline-variant/60 rounded-xl">
                    <code className="text-xs bg-white dark:bg-black/30 px-2.5 py-1.5 rounded-lg truncate flex-1 font-mono text-on-surface select-all">
                      {bookingUrl}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(bookingUrl);
                        setCopiedUrl(true);
                        setToast({ show: true, text: "¡Enlace copiado al portapapeles!" });
                        setTimeout(() => {
                          setCopiedUrl(false);
                          setToast({ show: false, text: "" });
                        }, 2500);
                      }}
                      className="text-xs text-primary font-semibold hover:bg-primary/10 rounded-lg p-2 shrink-0"
                      title="Copiar enlace"
                    >
                      {copiedUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(bookingUrl, "_blank")}
                      className="text-xs text-on-surface-variant hover:text-primary rounded-lg p-2 shrink-0"
                      title="Abrir en pestaña nueva"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* QR Box */}
                  <div className="p-4 bg-surface-container-low border border-outline-variant/50 rounded-2xl flex items-center gap-4">
                    <div className="bg-white p-2 rounded-xl border border-outline-variant/60 shadow-xs shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrImageUrl}
                        alt="QR Reservas Online"
                        className="w-16 h-16 rounded-md"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-primary" />
                        QR para Mostrador
                      </span>
                      <p className="text-[11px] text-on-surface-variant/80 leading-tight">
                        Imprime el código QR para colocarlo en la recepción o escaparate.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={downloadingQr}
                        onClick={handleDownloadQr}
                        className="text-[11px] font-semibold py-1 h-auto self-start gap-1 mt-0.5"
                      >
                        {downloadingQr ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Download className="w-3 h-3" />
                        )}
                        <span>Descargar QR</span>
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs text-on-surface-variant text-center">
                  El portal de reservas está desactivado. Actívalo para generar tu enlace y código QR.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Operating Hours Card */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-on-surface flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Horario de Apertura</span>
                </CardTitle>
                <button
                  type="button"
                  onClick={applyMondayToWeekdays}
                  className="text-[11px] font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
                  title="Aplica el horario del lunes a martes, miércoles, jueves y viernes"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Copiar L-V</span>
                </button>
              </div>
              <CardDescription>
                Configura los días y turnos de atención comercial de tu salón.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSaveHours}>
              <CardContent className="flex flex-col gap-2.5 pt-1">
                {loadingHours ? (
                  <div className="flex flex-col gap-3 py-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <div key={i} className="flex items-center justify-between py-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-32" />
                      </div>
                    ))}
                  </div>
                ) : (
                  hours.map((h, idx) => (
                    <div
                      key={h.dayOfWeek}
                      className="flex items-center justify-between gap-2 py-1.5 border-b border-outline-variant/30 last:border-0"
                    >
                      <span className="text-xs font-semibold text-on-surface w-24">
                        {DAY_NAMES[h.dayOfWeek]}
                      </span>

                      <div className="flex items-center gap-2 flex-1 justify-end">
                        {h.isClosed ? (
                          <span className="text-xs font-bold text-error bg-error/10 px-2.5 py-0.5 rounded-full">
                            Cerrado
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs">
                            <input
                              type="time"
                              value={h.openTime || "09:00"}
                              onChange={(e) => {
                                const next = [...hours];
                                next[idx] = { ...next[idx], openTime: e.target.value };
                                setHours(next);
                              }}
                              className="bg-surface-container-low border border-outline-variant/60 rounded-lg px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                            />
                            <span className="text-on-surface-variant/60 font-light">-</span>
                            <input
                              type="time"
                              value={h.closeTime || "20:00"}
                              onChange={(e) => {
                                const next = [...hours];
                                next[idx] = { ...next[idx], closeTime: e.target.value };
                                setHours(next);
                              }}
                              className="bg-surface-container-low border border-outline-variant/60 rounded-lg px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                            />
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const next = [...hours];
                            next[idx] = { ...next[idx], isClosed: !next[idx].isClosed };
                            setHours(next);
                          }}
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors cursor-pointer shrink-0 ml-1",
                            h.isClosed
                              ? "text-primary border-primary/30 hover:bg-primary/10"
                              : "text-on-surface-variant/70 border-outline-variant hover:bg-surface-container"
                          )}
                        >
                          {h.isClosed ? "Abrir" : "Cerrar"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>

              <CardFooter className="border-t border-outline-variant/40 pt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={savingHours || loadingHours}
                  variant="primary"
                  size="md"
                  className="flex items-center gap-2 font-medium"
                >
                  {savingHours ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Guardar Horarios</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      <AddServiceModal
        isOpen={isAddServiceModalOpen}
        onClose={() => {
          setIsAddServiceModalOpen(false);
          setServiceToEdit(null);
          setServiceTriggerRect(null);
        }}
        onSave={handleSaveService}
        serviceToEdit={serviceToEdit}
        triggerRect={serviceTriggerRect}
      />
    </div>
  );
}
