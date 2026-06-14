"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Store, 
  Clock, 
  CreditCard, 
  Camera, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle,
  Save,
  Scissors,
  Palette,
  Sparkles,
  ShieldCheck,
  Lock,
  Plus,
  MessageSquare,
  Send,
  Loader2,
  Wifi,
  WifiOff,
  RefreshCw,
  Check
} from "lucide-react";


import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import NewAppointmentModal from "@/components/NewAppointmentModal";

export default function AjustesPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState("¡Ajustes guardados correctamente!");
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // Custom tabs
  const [activeTab, setActiveTab] = useState("general");

  // WhatsApp connection states
  const [whatsappStatus, setWhatsappStatus] = useState("DISCONNECTED");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);

  // Message templates states
  const [templates, setTemplates] = useState({
    welcomeMessage: "",
    reminderMessage: ""
  });
  const [isEditingTemplates, setIsEditingTemplates] = useState(false);
  const [savingTemplates, setSavingTemplates] = useState(false);

  const handleSaveAppointment = (data: any) => {
    console.log("Appointment booked from settings:", data);
  };

  const { data: session, update } = useSession();
  const businessId = (session?.user as any)?.id || "mock-business-id";

  // Business profile state
  const [profile, setProfile] = useState({
    name: "Estilo & Spa (Ejemplo)",
    email: "contacto@volta.com",
    phone: "+34 912 345 678",
    address: "Calle de Velázquez, 45, Madrid",
  });

  const fetchProfile = () => {
    if (!businessId) return;
    fetch(`http://localhost:3001/api/business/${businessId}`, {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "your_static_api_key_here"
      }
    })
    .then((res) => res.json())
    .then((data) => {
      if (data && !data.error) {
        setProfile((prev) => ({
          ...prev,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address || prev.address,
        }));
      }
    })
    .catch((e) => {
      console.error("Error loading business profile:", e);
    });
  };

  const fetchWhatsappStatus = () => {
    if (!businessId) return;
    fetch(`http://localhost:3001/api/whatsapp/status?businessId=${businessId}`, {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "your_static_api_key_here"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setWhatsappStatus(data.status);
          setQrCode(data.qrCode);
          if (data.status === "WAITING_QR") {
            setPollingActive(true);
          } else {
            setPollingActive(false);
          }
        }
      })
      .catch((e) => console.error("Error loading whatsapp status:", e));
  };

  const fetchTemplates = () => {
    if (!businessId) return;
    fetch(`http://localhost:3001/api/whatsapp/templates?businessId=${businessId}`, {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "your_static_api_key_here"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setTemplates({
            welcomeMessage: data.welcomeMessage || "",
            reminderMessage: data.reminderMessage || ""
          });
        }
      })
      .catch((e) => console.error("Error loading templates:", e));
  };

  useEffect(() => {
    fetchProfile();
    fetchWhatsappStatus();
    fetchTemplates();
  }, [businessId]);

  useEffect(() => {
    if (!pollingActive || !businessId) return;

    const interval = setInterval(() => {
      fetch(`http://localhost:3001/api/whatsapp/status?businessId=${businessId}`, {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "your_static_api_key_here"
        }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setWhatsappStatus(data.status);
            setQrCode(data.qrCode);
            if (data.status === "CONNECTED") {
              setPollingActive(false);
              setQrCode(null);
            } else if (data.status === "DISCONNECTED") {
              setPollingActive(false);
              setQrCode(null);
            }
          }
        })
        .catch((e) => console.error("Error polling whatsapp status:", e));
    }, 5000);

    return () => clearInterval(interval);
  }, [pollingActive, businessId]);

  useEffect(() => {
    if (session?.user?.name) {
      document.title = `Ajustes - ${session.user.name} - Volta`;
    }
  }, [session]);

  const handleConnectWhatsapp = () => {
    setLoadingQr(true);
    fetch("http://localhost:3001/api/whatsapp/init", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "your_static_api_key_here",
      },
      body: JSON.stringify({ businessId })
    })
      .then((res) => res.json())
      .then(() => {
        setWhatsappStatus("WAITING_QR");
        setPollingActive(true);
        setLoadingQr(false);
      })
      .catch((err) => {
        console.error("Error starting whatsapp:", err);
        setLoadingQr(false);
      });
  };

  const handleDisconnectWhatsapp = () => {
    if (!window.confirm("¿Seguro que deseas desconectar tu cuenta de WhatsApp? Se detendrán los mensajes automáticos.")) return;
    
    fetch("http://localhost:3001/api/whatsapp/disconnect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "your_static_api_key_here",
      },
      body: JSON.stringify({ businessId })
    })
      .then((res) => res.json())
      .then(() => {
        setWhatsappStatus("DISCONNECTED");
        setQrCode(null);
        setPollingActive(false);
        setToastText("WhatsApp desconectado correctamente.");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      })
      .catch((err) => {
        console.error("Error disconnecting whatsapp:", err);
      });
  };

  const handleSaveTemplates = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTemplates(true);
    fetch("http://localhost:3001/api/whatsapp/templates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "your_static_api_key_here",
      },
      body: JSON.stringify({
        businessId,
        welcomeMessage: templates.welcomeMessage,
        reminderMessage: templates.reminderMessage
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save templates");
        return res.json();
      })
      .then(() => {
        setIsEditingTemplates(false);
        setSavingTemplates(false);
        setToastText("Plantillas guardadas correctamente.");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      })
      .catch((err) => {
        console.error("Error saving templates:", err);
        setSavingTemplates(false);
      });
  };


  const [hours, setHours] = useState([
    { days: "Lunes - Viernes", time: "09:00 - 20:00", closed: false },
    { days: "Sábados", time: "10:00 - 18:00", closed: false },
    { days: "Domingos", time: "Cerrado", closed: true },
  ]);

  const services = [
    { name: "Corte & Estilo", duration: "45 min", price: "35€", icon: Scissors },
    { name: "Color Total", duration: "120 min", price: "85€", icon: Palette },
    { name: "Tratamiento Hidratante", duration: "60 min", price: "50€", icon: Sparkles },
  ];

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    fetch(`http://localhost:3001/api/business/${businessId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "your_static_api_key_here",
      },
      body: JSON.stringify({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address
      })
    })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to update business profile");
      return res.json();
    })
    .then(async (data) => {
      setIsEditing(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // Update NextAuth session state so header/sidebar updates automatically
      if (update) {
        await update({
          ...session,
          user: {
            ...session?.user,
            name: data.name,
            email: data.email
          }
        });
      }
    })
    .catch((err) => {
      console.error("Error updating business profile:", err);
      setIsEditing(false);
    });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Sidebar navigation */}
      <Sidebar onNewAppointmentClick={() => setIsAppointmentModalOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-[240px]">
        {/* Top Header */}
        <Header 
          searchPlaceholder="Buscar ajustes..." 
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content Canvas */}
        <main className="p-margin-mobile md:p-gutter max-w-container-max w-full mx-auto flex-1 relative">
          
          {/* Toast Notification Banner */}
          {showToast && (
            <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-secondary-container text-on-secondary-container border border-outline-variant px-6 py-4 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
              <CheckCircle className="w-5 h-5 text-primary shrink-0" />
              <span className="font-label-lg text-label-lg font-semibold">
                {toastText}
              </span>
            </div>
          )}

          {/* Page Title */}
          <div className="mb-6">
            <h1 className="font-display text-headline-lg text-on-surface font-semibold mb-1">
              Configuración
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant font-medium">
              Gestiona tu identidad de marca, horarios, servicios y mensajería automatizada.
            </p>
          </div>

          {/* Tab Navigation (Task 2.1) */}
          <div className="flex border-b border-outline-variant/65 mb-8 gap-6">
            <button
              onClick={() => setActiveTab("general")}
              className={`pb-3 font-label-lg text-label-lg font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "general"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab("mensajeria")}
              className={`pb-3 font-label-lg text-label-lg font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "mensajeria"
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Mensajes y WhatsApp
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === "general" ? (
            /* Bento Grid Layout - General */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
              
              {/* Business Profile Card (Spans 8 cols) */}
              <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-title-md text-title-md text-primary font-semibold flex items-center gap-2">
                      <Store className="w-5 h-5" />
                      <span>Información del Negocio</span>
                    </h3>
                    
                    {!isEditing ? (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="text-primary hover:text-primary-container font-label-lg text-label-lg font-semibold transition-all cursor-pointer hover:underline"
                      >
                        Editar perfil
                      </button>
                    ) : (
                      <button 
                        type="submit"
                        form="profile-form"
                        className="flex items-center gap-1 px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer font-semibold shadow-sm"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Logo container */}
                    <div className="relative group shrink-0">
                      <div className="w-32 h-32 rounded-xl overflow-hidden bg-surface-container border border-outline-variant">
                        <img 
                          src="/logo.png" 
                          alt="Logo de la Peluquería" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-primary/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl cursor-pointer">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Form fields */}
                    <form id="profile-form" onSubmit={handleSave} className="flex-1 w-full">
                      {!isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="flex flex-col gap-1">
                            <span className="font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">
                              Nombre Comercial
                            </span>
                            <p className="font-body-lg text-body-lg font-medium text-on-surface">
                              {profile.name}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">
                              Correo Electrónico
                            </span>
                            <p className="font-body-lg text-body-lg font-medium text-on-surface">
                              {profile.email}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">
                              Teléfono
                            </span>
                            <p className="font-body-lg text-body-lg font-medium text-on-surface">
                              {profile.phone}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">
                              Dirección
                            </span>
                            <p className="font-body-lg text-body-lg font-medium text-on-surface leading-relaxed">
                              {profile.address}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="font-label-md text-label-md text-on-surface-variant px-1" htmlFor="profile-name">
                              Nombre Comercial
                            </label>
                            <input
                              id="profile-name"
                              type="text"
                              required
                              value={profile.name}
                              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="font-label-md text-label-md text-on-surface-variant px-1" htmlFor="profile-email">
                              Correo Electrónico
                            </label>
                            <input
                              id="profile-email"
                              type="email"
                              required
                              value={profile.email}
                              onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                              className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="font-label-md text-label-md text-on-surface-variant px-1" htmlFor="profile-phone">
                              Teléfono
                            </label>
                            <input
                              id="profile-phone"
                              type="tel"
                              required
                              value={profile.phone}
                              onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                              className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="font-label-md text-label-md text-on-surface-variant px-1" htmlFor="profile-address">
                              Dirección
                            </label>
                            <input
                              id="profile-address"
                              type="text"
                              required
                              value={profile.address}
                              onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                              className="w-full border border-outline-variant rounded-lg px-4 py-2 text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                            />
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>

            {/* Account Settings Small Card (Spans 4 cols) */}
            <div className="lg:col-span-4 bg-primary text-on-primary rounded-xl p-6 shadow-md flex flex-col justify-between">
              <div className="flex flex-col gap-2">
                <h3 className="font-title-md text-title-md font-semibold flex items-center gap-1">
                  <CreditCard className="w-5 h-5 text-on-primary" />
                  <span>Plan Profesional</span>
                </h3>
                <p className="font-body-md text-body-md opacity-90 leading-relaxed">
                  Tu suscripción está activa hasta el 12 de Octubre, 2024.
                </p>
              </div>
              <div className="mt-6">
                <button className="bg-on-primary text-primary hover:bg-primary-fixed hover:text-on-primary-fixed font-label-lg text-label-lg font-bold w-full py-2 rounded-lg transition-colors cursor-pointer shadow-sm">
                  Gestionar Facturación
                </button>
              </div>
            </div>

            {/* Operating Hours Card (Spans 4 cols) */}
            <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant flex flex-col justify-between">
              <div>
                <h3 className="font-title-md text-title-md text-primary font-semibold mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Horario de Apertura</span>
                </h3>
                
                <div className="flex flex-col gap-4 font-medium text-body-md text-on-surface-variant">
                  {hours.map((hourRow, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-outline-variant/65">
                      <span>{hourRow.days}</span>
                      <span className={`font-semibold ${hourRow.closed ? "text-error" : "text-primary"}`}>
                        {hourRow.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <button className="mt-8 w-full border border-primary text-primary font-label-lg text-label-lg font-semibold py-2 rounded-lg hover:bg-secondary-container/30 transition-all cursor-pointer">
                Modificar Horarios
              </button>
            </div>

            {/* Featured Services Card (Spans 8 cols) */}
            <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-title-md text-title-md text-primary font-semibold flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-primary" />
                    <span>Servicios Destacados</span>
                  </h3>
                  <a href="#" className="text-primary hover:text-primary-container font-label-lg text-label-lg font-semibold transition-all hover:underline">
                    Ver todos
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {filteredServices.map((service, idx) => {
                    const Icon = service.icon;
                    return (
                      <div key={idx} className="bg-surface-container-low flex items-center gap-4 p-4 rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                            {service.name}
                          </p>
                          <p className="font-body-md text-body-md text-on-surface-variant">
                            {service.duration} · {service.price}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Service (Dashed border button) */}
                  <div className="border border-dashed border-outline-variant hover:border-primary flex items-center justify-center gap-2 p-4 rounded-xl cursor-pointer hover:bg-surface-variant/20 transition-all">
                    <Plus className="w-5 h-5 text-primary" />
                    <span className="font-label-lg text-label-lg font-semibold text-primary">
                      Añadir Servicio
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Security Card (Spans 12 cols) */}
            <div className="lg:col-span-12 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant mt-2">
              <h3 className="font-title-lg text-title-lg text-primary font-semibold mb-6 flex items-center gap-2">
                <span>Seguridad de la Cuenta</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password card */}
                <div className="border border-outline-variant rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Lock className="w-6 h-6 text-on-surface-variant shrink-0" />
                    <div>
                      <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                        Contraseña
                      </p>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Actualizada hace 3 meses
                      </p>
                    </div>
                  </div>
                  <button className="text-primary hover:text-primary-container font-label-lg text-label-lg font-semibold cursor-pointer hover:underline">
                    Cambiar
                  </button>
                </div>

                {/* 2FA card */}
                <div className="border border-outline-variant rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <ShieldCheck className="w-6 h-6 text-on-surface-variant shrink-0" />
                    <div>
                      <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                        Verificación en dos pasos
                      </p>
                      <p className="font-body-md text-body-md text-primary font-semibold">
                        Activada
                      </p>
                    </div>
                  </div>
                  <button className="text-error hover:text-error/80 font-label-lg text-label-lg font-semibold cursor-pointer hover:underline">
                    Desactivar
                  </button>
                </div>
              </div>
            </div>

          </div>
          ) : (
            /* Bento Grid Layout - Messaging & WhatsApp (Task 2.1) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
              
              {/* WhatsApp Connection Card (Spans 5 cols) (Task 2.2) */}
              <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant flex flex-col justify-between min-h-[420px]">
                <div>
                  <h3 className="font-title-md text-title-md text-primary font-semibold mb-6 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <span>Canal de WhatsApp</span>
                  </h3>

                  <div className="flex flex-col gap-6">
                    {/* Status Indicator */}
                    <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-xl border border-outline-variant/50">
                      {whatsappStatus === "CONNECTED" ? (
                        <>
                          <div className="relative flex h-3 w-3 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </div>
                          <div>
                            <p className="font-body-lg text-body-lg font-semibold text-on-surface">Conectado</p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Mensajería activa</p>
                          </div>
                        </>
                      ) : whatsappStatus === "WAITING_QR" ? (
                        <>
                          <div className="relative flex h-3 w-3 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                          </div>
                          <div>
                            <p className="font-body-lg text-body-lg font-semibold text-on-surface">Esperando escaneo</p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Escanea el código QR</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="h-3 w-3 rounded-full bg-on-surface-variant/40 shrink-0"></div>
                          <div>
                            <p className="font-body-lg text-body-lg font-semibold text-on-surface">Desconectado</p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Sin vinculación activa</p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* QR or Instructions block */}
                    {whatsappStatus === "WAITING_QR" ? (
                      <div className="flex flex-col items-center justify-center py-2 animate-in fade-in duration-200">
                        {qrCode ? (
                          <div className="flex flex-col items-center bg-white p-4 rounded-xl border border-outline-variant shadow-sm max-w-[240px]">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`}
                              alt="WhatsApp QR Code"
                              className="w-[180px] h-[180px]"
                            />
                            <span className="text-[11px] font-medium text-on-surface-variant mt-2 text-center">
                              Código QR de sincronización
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[200px] text-center">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                            <p className="font-body-md text-body-md text-on-surface-variant font-medium">
                              Generando código QR...
                            </p>
                            <p className="text-[11px] text-on-surface-variant/80 mt-1 max-w-[200px]">
                              Esto puede tomar hasta 15 segundos mientras se inicia la sesión.
                            </p>
                          </div>
                        )}

                        <div className="mt-4 text-center">
                          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed max-w-[260px] mx-auto">
                            Abre WhatsApp en tu teléfono, ve a <strong>Dispositivos vinculados</strong> y escanea el código QR.
                          </p>
                        </div>
                      </div>
                    ) : whatsappStatus === "CONNECTED" ? (
                      <div className="flex flex-col justify-center py-4 text-center">
                        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-[280px] mx-auto mb-4">
                          Tu cuenta de WhatsApp se encuentra vinculada correctamente. Las confirmaciones de citas y recordatorios se enviarán de forma automática a tus clientes.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col justify-center py-4 text-center">
                        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-[280px] mx-auto mb-4">
                          Vincula tu número de WhatsApp para poder enviar confirmaciones inmediatas al agendar citas y recordatorios automáticos 24 horas antes del servicio.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  {whatsappStatus === "CONNECTED" ? (
                    <button
                      onClick={handleDisconnectWhatsapp}
                      className="w-full py-3 border border-error text-error font-label-lg text-label-lg font-semibold rounded-lg hover:bg-error-container/20 transition-all cursor-pointer text-center"
                    >
                      Desconectar cuenta
                    </button>
                  ) : whatsappStatus === "WAITING_QR" ? (
                    <button
                      onClick={handleDisconnectWhatsapp}
                      className="w-full py-3 border border-outline text-on-surface-variant font-label-lg text-label-lg font-semibold rounded-lg hover:bg-surface-container transition-all cursor-pointer text-center"
                    >
                      Cancelar vinculación
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectWhatsapp}
                      disabled={loadingQr}
                      className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-label-lg text-label-lg font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                    >
                      {loadingQr ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Iniciando...</span>
                        </>
                      ) : (
                        <>
                          <span>Vincular WhatsApp</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Message Templates Editor Card (Spans 7 cols) (Task 2.3) */}
              <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-title-md text-title-md text-primary font-semibold flex items-center gap-2">
                      <Send className="w-5 h-5 text-primary" />
                      <span>Plantillas de Mensajería</span>
                    </h3>

                    {!isEditingTemplates ? (
                      <button
                        onClick={() => setIsEditingTemplates(true)}
                        className="text-primary hover:text-primary-container font-label-lg text-label-lg font-semibold transition-all cursor-pointer hover:underline"
                      >
                        Editar plantillas
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setIsEditingTemplates(false);
                            fetchTemplates();
                          }}
                          className="text-on-surface-variant hover:text-on-surface font-label-md text-label-md font-semibold transition-all cursor-pointer hover:underline"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveTemplates}
                          disabled={savingTemplates}
                          className="flex items-center gap-1 px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer font-semibold shadow-sm disabled:opacity-50"
                        >
                          {savingTemplates ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          <span>Guardar</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <form className="flex flex-col gap-6">
                    {/* Welcome Message Template */}
                    <div className="flex flex-col gap-2">
                      <label className="font-label-lg text-label-lg text-on-surface font-semibold flex justify-between">
                        <span>Mensaje de Bienvenida / Confirmación</span>
                        <span className="text-[11px] font-normal text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                          Inmediato
                        </span>
                      </label>
                      <textarea
                        disabled={!isEditingTemplates}
                        rows={3}
                        value={templates.welcomeMessage}
                        onChange={(e) => setTemplates(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                        className="w-full border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface disabled:opacity-75 disabled:cursor-not-allowed resize-none custom-scrollbar"
                        placeholder="Escribe el mensaje de confirmación..."
                      />
                    </div>

                    {/* Reminder Message Template */}
                    <div className="flex flex-col gap-2">
                      <label className="font-label-lg text-label-lg text-on-surface font-semibold flex justify-between">
                        <span>Mensaje de Recordatorio</span>
                        <span className="text-[11px] font-normal text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                          Sentinel (24h antes)
                        </span>
                      </label>
                      <textarea
                        disabled={!isEditingTemplates}
                        rows={3}
                        value={templates.reminderMessage}
                        onChange={(e) => setTemplates(prev => ({ ...prev, reminderMessage: e.target.value }))}
                        className="w-full border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface disabled:opacity-75 disabled:cursor-not-allowed resize-none custom-scrollbar"
                        placeholder="Escribe el mensaje de recordatorio..."
                      />
                    </div>

                    {/* Variables Helper Box */}
                    <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/50">
                      <p className="font-label-md text-label-md text-on-surface font-semibold mb-2">Variables dinámicas disponibles:</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-surface-container-lowest border border-outline-variant text-[11px] px-2 py-1 rounded font-mono select-all cursor-pointer" title="Nombre del cliente">{"{{clientName}}"}</span>
                        <span className="bg-surface-container-lowest border border-outline-variant text-[11px] px-2 py-1 rounded font-mono select-all cursor-pointer" title="Fecha de la cita (ej. lunes 8 de junio)">{"{{appointmentDate}}"}</span>
                        <span className="bg-surface-container-lowest border border-outline-variant text-[11px] px-2 py-1 rounded font-mono select-all cursor-pointer" title="Hora de la cita (ej. 10:00)">{"{{appointmentTime}}"}</span>
                        <span className="bg-surface-container-lowest border border-outline-variant text-[11px] px-2 py-1 rounded font-mono select-all cursor-pointer" title="Nombre comercial de tu negocio">{"{{businessName}}"}</span>
                      </div>
                    </div>

                    {/* Live Preview Block */}
                    <div>
                      <span className="font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider block mb-2">
                        Vista previa del mensaje de bienvenida:
                      </span>
                      <div className="bg-[#efeae2] p-4 rounded-xl border border-outline-variant font-sans relative">
                        <div className="bg-white rounded-lg p-3 shadow-sm text-body-md text-on-surface max-w-[85%] relative border border-outline-variant/20">
                          <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
                            {templates.welcomeMessage ? (
                              templates.welcomeMessage
                                .replace(/{{clientName}}/g, "Ana García")
                                .replace(/{{appointmentDate}}/g, "lunes 8 de junio")
                                .replace(/{{appointmentTime}}/g, "10:00")
                                .replace(/{{businessName}}/g, profile.name || "Glow")
                            ) : (
                              <span className="text-on-surface-variant italic">No hay plantilla configurada para bienvenida.</span>
                            )}
                          </p>
                          <span className="text-[10px] text-on-surface-variant float-right mt-1">12:00</span>
                          <div className="clear-both" />
                        </div>
                      </div>
                    </div>

                  </form>
                </div>
              </div>

            </div>
          )}

        </main>

        {/* Mobile bottom nav */}
        <BottomNav />
      </div>

      {/* Appointment booking Modal */}
      <NewAppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSave={handleSaveAppointment}
      />
    </div>
  );
}
