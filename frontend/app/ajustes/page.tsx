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
    name: "Volta",
    email: "contacto@volta.com",
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
            <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-secondary-container text-on-secondary-container border border-outline-variant px-6 py-4 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
              <CheckCircle className="w-5 h-5 text-primary shrink-0" />
              <span className="font-label-lg text-label-lg font-semibold">
                ¡Ajustes guardados correctamente!
              </span>
            </div>
          )}

          {/* Page Title */}
          <div className="mb-8">
            <h1 className="font-display text-headline-lg text-on-surface font-semibold mb-1">
              Configuración General
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant font-medium">
              Gestiona tu identidad de marca, horarios y servicios.
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
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
                  <span>Plan Admin Pro</span>
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

            {/* Operating Hours Card (Spans 5 cols) */}
            <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant">
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
              
              <button className="mt-8 w-full border border-primary text-primary font-label-lg text-label-lg font-semibold py-2 rounded-lg hover:bg-secondary-container/30 transition-all cursor-pointer">
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
