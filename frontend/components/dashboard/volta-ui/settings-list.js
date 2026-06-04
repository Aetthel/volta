"use client";

import React, { useState } from 'react';
import { 
  Bell, 
  Clock, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  Smartphone,
  ChevronRight
} from 'lucide-react';

const SETTINGS_GROUPS = [
  {
    title: "Notificaciones",
    items: [
      { id: 'whatsapp', icon: Smartphone, label: "Recordatorios WhatsApp", description: "Enviar automáticamente 24h antes", type: "toggle", default: true },
      { id: 'push', icon: Bell, label: "Alertas Push", description: "Nuevas citas y cancelaciones", type: "toggle", default: false },
    ]
  },
  {
    title: "Gestión del Local",
    items: [
      { id: 'hours', icon: Clock, label: "Horario Comercial", description: "Lunes a Sábado de 09:00 a 20:00", type: "link" },
      { id: 'services', icon: Sparkles, label: "Catálogo de Servicios", description: "12 servicios activos", type: "link" },
      { id: 'location', icon: MapPin, label: "Ubicación y Datos", description: "Calle Principal 123, Madrid", type: "link" },
    ]
  },
  {
    title: "Seguridad",
    items: [
      { id: 'privacy', icon: ShieldCheck, label: "Privacidad", description: "Gestionar datos de clientes", type: "link" },
    ]
  }
];

export function VoltaSettingsList() {
  const [toggles, setToggles] = useState({ whatsapp: true, push: false });

  const handleToggle = (id) => {
    setToggles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 w-full max-w-2xl overflow-hidden">
      <div className="p-8 border-b border-slate-50">
        <h2 className="text-2xl font-semibold text-slate-900 leading-tight">Ajustes</h2>
        <p className="text-slate-500 mt-1 font-medium">Personaliza tu experiencia y la de tus clientes</p>
      </div>

      <div className="flex flex-col">
        {SETTINGS_GROUPS.map((group, gIndex) => (
          <div key={group.title} className="flex flex-col">
            <h3 className="px-8 pt-6 pb-2 text-xs font-semibold uppercase tracking-[0.15em] text-teal-600/80">
              {group.title}
            </h3>
            
            <div className="flex flex-col">
              {group.items.map((item) => (
                <div 
                  key={item.id}
                  className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer group border-b border-slate-50 last:border-0"
                >
                  <div className="flex items-center gap-5">
                    <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:text-teal-600 group-hover:bg-white transition-all border border-slate-100">
                      <item.icon className="size-5 stroke-[1.5]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 leading-tight">{item.label}</h4>
                      <p className="text-sm text-slate-500 font-medium">{item.description}</p>
                    </div>
                  </div>

                  {item.type === 'toggle' ? (
                    <button 
                      onClick={() => handleToggle(item.id)}
                      className={`
                        relative w-12 h-6 rounded-full transition-colors duration-200 outline-none
                        ${toggles[item.id] ? 'bg-teal-600' : 'bg-slate-200'}
                      `}
                    >
                      <div className={`
                        absolute top-1 left-1 size-4 bg-white rounded-full transition-transform duration-200 shadow-sm
                        ${toggles[item.id] ? 'translate-x-6' : 'translate-x-0'}
                      `} />
                    </button>
                  ) : (
                    <ChevronRight className="size-5 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
