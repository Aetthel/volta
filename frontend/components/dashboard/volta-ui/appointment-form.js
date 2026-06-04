"use client";

import React from 'react';
import { User, Phone, Sparkles, UserCheck, CalendarDays } from 'lucide-react';

export function VoltaAppointmentForm() {
  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 w-full max-w-xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900">Nueva Cita</h2>
        <p className="text-slate-500 mt-1 font-medium">Completa los detalles del servicio</p>
      </div>

      <form className="flex flex-col gap-6">
        {/* Outlined Input Group */}
        <div className="relative group">
          <div className="absolute left-4 -top-2.5 px-2 bg-white text-xs font-semibold text-teal-600 group-focus-within:text-teal-600 transition-colors z-10">
            Nombre del Cliente
          </div>
          <div className="relative flex items-center">
            <User className="absolute left-4 size-5 text-slate-400 stroke-[1.5]" />
            <input 
              type="text" 
              placeholder="Ej. Juan Pérez"
              className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-slate-900 bg-transparent font-medium"
            />
          </div>
        </div>

        <div className="relative group">
          <div className="absolute left-4 -top-2.5 px-2 bg-white text-xs font-semibold text-slate-500 group-focus-within:text-teal-600 transition-colors z-10">
            Teléfono
          </div>
          <div className="relative flex items-center">
            <Phone className="absolute left-4 size-5 text-slate-400 stroke-[1.5]" />
            <input 
              type="tel" 
              placeholder="+34 600 000 000"
              className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-slate-900 bg-transparent font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative group">
            <div className="absolute left-4 -top-2.5 px-2 bg-white text-xs font-semibold text-slate-500 group-focus-within:text-teal-600 transition-colors z-10">
              Servicio
            </div>
            <div className="relative flex items-center">
              <Sparkles className="absolute left-4 size-5 text-slate-400 stroke-[1.5]" />
              <select className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-slate-900 bg-transparent appearance-none font-medium">
                <option value="">Selecciona servicio</option>
                <option value="general">Servicio General</option>
                <option value="premium">Premium Pro</option>
                <option value="express">Express</option>
              </select>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute left-4 -top-2.5 px-2 bg-white text-xs font-semibold text-slate-500 group-focus-within:text-teal-600 transition-colors z-10">
              Empleado
            </div>
            <div className="relative flex items-center">
              <UserCheck className="absolute left-4 size-5 text-slate-400 stroke-[1.5]" />
              <select className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-slate-900 bg-transparent appearance-none font-medium">
                <option value="">Cualquiera</option>
                <option value="marcos">Marcos</option>
                <option value="elena">Elena</option>
              </select>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute left-4 -top-2.5 px-2 bg-white text-xs font-semibold text-slate-500 group-focus-within:text-teal-600 transition-colors z-10">
            Hora
          </div>
          <div className="relative flex items-center">
            <CalendarDays className="absolute left-4 size-5 text-slate-400 stroke-[1.5]" />
            <input 
              type="time" 
              className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-slate-900 bg-transparent font-medium"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="mt-4 w-full h-14 bg-teal-600 text-white font-semibold rounded-2xl hover:bg-teal-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          Guardar Cita
        </button>
      </form>
    </div>
  );
}
