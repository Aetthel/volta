"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Mail, Lock, Phone, Save, AlertCircle } from "lucide-react";

export default function NewBusinessPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear el negocio");
      }

      router.push("/admin/businesses");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <Link 
          href="/admin/businesses" 
          className="flex items-center gap-2 text-sm font-bold text-teal-600 hover:translate-x-[-4px] transition-transform w-fit"
        >
          <ArrowLeft className="size-4 stroke-[3]" />
          VOLVER A LA LISTA
        </Link>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Nuevo Negocio</h1>
      </header>

      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 max-w-3xl">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 leading-tight">Información del Cliente</h2>
          <p className="text-slate-500 mt-2 font-medium">Configura los detalles de acceso y contacto para el nuevo salón.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Outlined Input: Name */}
          <div className="relative group">
            <div className="absolute left-4 -top-2.5 px-2 bg-white text-xs font-semibold text-teal-600 group-focus-within:text-teal-600 transition-colors z-10">
              Nombre del Negocio
            </div>
            <div className="relative flex items-center">
              <Building2 className="absolute left-4 size-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Ej. Peluquería Elegance"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-slate-900 bg-transparent font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Outlined Input: Email */}
            <div className="relative group">
              <div className="absolute left-4 -top-2.5 px-2 bg-white text-xs font-semibold text-slate-500 group-focus-within:text-teal-600 transition-colors z-10">
                Email de Acceso
              </div>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 size-5 text-slate-400" />
                <input 
                  type="email" 
                  placeholder="contacto@negocio.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-slate-900 bg-transparent font-medium"
                />
              </div>
            </div>

            {/* Outlined Input: Password */}
            <div className="relative group">
              <div className="absolute left-4 -top-2.5 px-2 bg-white text-xs font-semibold text-slate-500 group-focus-within:text-teal-600 transition-colors z-10">
                Contraseña Temporal
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 size-5 text-slate-400" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-slate-900 bg-transparent font-medium"
                />
              </div>
            </div>
          </div>

          {/* Outlined Input: Phone */}
          <div className="relative group">
            <div className="absolute left-4 -top-2.5 px-2 bg-white text-xs font-semibold text-slate-500 group-focus-within:text-teal-600 transition-colors z-10">
              Teléfono (WhatsApp)
            </div>
            <div className="relative flex items-center">
              <Phone className="absolute left-4 size-5 text-slate-400" />
              <input 
                type="tel" 
                placeholder="34600000000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-slate-900 bg-transparent font-medium"
              />
            </div>
            <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Formato internacional sin el símbolo +</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100 text-red-700 text-sm font-bold">
              <AlertCircle className="size-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto h-16 px-10 bg-teal-600 text-white font-black rounded-2xl hover:bg-teal-700 active:scale-[0.98] disabled:bg-slate-200 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
            >
              {loading ? (
                <div className="size-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="size-5 stroke-[2.5]" />
              )}
              {loading ? "Procesando..." : "Dar de Alta Negocio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
