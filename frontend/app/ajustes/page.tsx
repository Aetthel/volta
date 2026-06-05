"use client";

import { useState } from "react";
import { 
  Store, 
  Clock, 
  CreditCard, 
  Camera, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle,
  Save
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";

export default function AjustesPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Business profile state
  const [profile, setProfile] = useState({
    name: "Glow Studio & Spa",
    email: "contacto@glowstudio.com",
    phone: "+34 912 345 678",
    address: "Calle de Velázquez, 45, Madrid",
  });

  const [hours, setHours] = useState([
    { days: "Lunes - Viernes", time: "09:00 - 20:00", closed: false },
    { days: "Sábados", time: "10:00 - 18:00", closed: false },
    { days: "Domingos", time: "Cerrado", closed: true },
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Sidebar navigation */}
      <Sidebar onNewAppointmentClick={() => {}} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-[240px]">
        {/* Top Header */}
        <Header 
          searchPlaceholder="Buscar ajustes..." 
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content Canvas */}
        <main className="p-gutter max-w-container-max w-full mx-auto flex-1 relative">
          
          {/* Toast Notification Banner */}
          {showToast && (
            <div className="fixed top-6 right-6 z-50 flex items-center gap-sm bg-secondary-container text-on-secondary-container border border-outline-variant px-lg py-md rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
              <CheckCircle className="w-5 h-5 text-primary shrink-0" />
              <span className="font-label-lg text-label-lg font-semibold">
                ¡Ajustes guardados correctamente!
              </span>
            </div>
          )}

          {/* Page Title */}
          <div className="mb-xl">
            <h1 className="font-display text-headline-lg text-on-surface font-semibold mb-xs">
              Configuración General
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant font-medium">
              Gestiona tu identidad de marca, horarios y servicios.
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
            
            {/* Business Profile Card (Spans 8 cols) */}
            <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-xl shadow-sm border border-outline-variant flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-lg">
                  <h3 className="font-title-md text-title-md text-primary font-semibold flex items-center gap-sm">
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
                      className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer font-semibold shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-xl items-start">
                  {/* Logo container */}
                  <div className="relative group shrink-0">
                    <div className="w-32 h-32 rounded-xl overflow-hidden bg-surface-container border border-outline-variant">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmGwl5sSkDjII2ExHnKM-5w4xy8w1SwV7jmU_AGtfMYMvJW92nfb7_P7sIs2RY5k0DpUodJhZQawwXknszPW1dRn4WZy17eaeYxtkOsozqAt9hGy18BfqOOeJaTKGSOUt6bBtJgWSIHUz2gL0oLZx73xl_FnxP-NJGfQycadSFiOb12mX-M3ABJyV8kHWcJlTwP8ZeRW5oyzCgynNR8DICpqxU4Zj22rfcnl257Yv9jclsPc_2_mUFmRbnRbF4azoHbXRqq-Fb5Q" 
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                        <div className="flex flex-col gap-xs">
                          <span className="font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">
                            Nombre Comercial
                          </span>
                          <p className="font-body-lg text-body-lg font-medium text-on-surface">
                            {profile.name}
                          </p>
                        </div>
                        <div className="flex flex-col gap-xs">
                          <span className="font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">
                            Correo Electrónico
                          </span>
                          <p className="font-body-lg text-body-lg font-medium text-on-surface">
                            {profile.email}
                          </p>
                        </div>
                        <div className="flex flex-col gap-xs">
                          <span className="font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">
                            Teléfono
                          </span>
                          <p className="font-body-lg text-body-lg font-medium text-on-surface">
                            {profile.phone}
                          </p>
                        </div>
                        <div className="flex flex-col gap-xs">
                          <span className="font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">
                            Dirección
                          </span>
                          <p className="font-body-lg text-body-lg font-medium text-on-surface leading-relaxed">
                            {profile.address}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                        <div className="flex flex-col gap-xs">
                          <label className="font-label-md text-label-md text-on-surface-variant px-xs" htmlFor="profile-name">
                            Nombre Comercial
                          </label>
                          <input
                            id="profile-name"
                            type="text"
                            required
                            value={profile.name}
                            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full border border-outline-variant rounded-lg px-md py-sm text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                          />
                        </div>
                        <div className="flex flex-col gap-xs">
                          <label className="font-label-md text-label-md text-on-surface-variant px-xs" htmlFor="profile-email">
                            Correo Electrónico
                          </label>
                          <input
                            id="profile-email"
                            type="email"
                            required
                            value={profile.email}
                            onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full border border-outline-variant rounded-lg px-md py-sm text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                          />
                        </div>
                        <div className="flex flex-col gap-xs">
                          <label className="font-label-md text-label-md text-on-surface-variant px-xs" htmlFor="profile-phone">
                            Teléfono
                          </label>
                          <input
                            id="profile-phone"
                            type="tel"
                            required
                            value={profile.phone}
                            onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full border border-outline-variant rounded-lg px-md py-sm text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                          />
                        </div>
                        <div className="flex flex-col gap-xs">
                          <label className="font-label-md text-label-md text-on-surface-variant px-xs" htmlFor="profile-address">
                            Dirección
                          </label>
                          <input
                            id="profile-address"
                            type="text"
                            required
                            value={profile.address}
                            onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                            className="w-full border border-outline-variant rounded-lg px-md py-sm text-body-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-surface"
                          />
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>

            {/* Account Settings Small Card (Spans 4 cols) */}
            <div className="lg:col-span-4 bg-primary text-on-primary rounded-xl p-xl shadow-md flex flex-col justify-between">
              <div className="flex flex-col gap-sm">
                <h3 className="font-title-md text-title-md font-semibold flex items-center gap-xs">
                  <CreditCard className="w-5 h-5 text-on-primary" />
                  <span>Plan Admin Pro</span>
                </h3>
                <p className="font-body-md text-body-md opacity-90 leading-relaxed">
                  Tu suscripción está activa hasta el 12 de Octubre, 2024.
                </p>
              </div>
              <div className="mt-lg">
                <button className="bg-on-primary text-primary hover:bg-primary-fixed hover:text-on-primary-fixed font-label-lg text-label-lg font-bold w-full py-sm rounded-lg transition-colors cursor-pointer shadow-sm">
                  Gestionar Facturación
                </button>
              </div>
            </div>

            {/* Operating Hours Card (Spans 5 cols) */}
            <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-xl shadow-sm border border-outline-variant">
              <h3 className="font-title-md text-title-md text-primary font-semibold mb-lg flex items-center gap-sm">
                <Clock className="w-5 h-5" />
                <span>Horario de Apertura</span>
              </h3>
              
              <div className="space-y-md font-medium text-body-md text-on-surface-variant">
                {hours.map((hourRow, idx) => (
                  <div key={idx} className="flex items-center justify-between py-xs border-b border-outline-variant/65">
                    <span>{hourRow.days}</span>
                    <span className={`font-semibold ${hourRow.closed ? "text-error" : "text-primary"}`}>
                      {hourRow.time}
                    </span>
                  </div>
                ))}
              </div>
              
              <button className="mt-xl w-full border border-primary text-primary font-label-lg text-label-lg font-semibold py-sm rounded-lg hover:bg-secondary-container/30 transition-all cursor-pointer">
                Editar horario de apertura
              </button>
            </div>

          </div>
        </main>

        {/* Mobile bottom nav */}
        <BottomNav />
      </div>
    </div>
  );
}
