"use client";

import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const DUMMY_APPOINTMENTS = [
  { id: 1, appointmentDate: new Date(), clientName: "Ana García", serviceName: "Corte + Hidratación", status: "confirmed" },
  { id: 2, appointmentDate: new Date(), clientName: "Roberto Sanz", serviceName: "Barba completa", status: "pending" },
];

export function VoltaAgenda({ appointments = [] }) {
  const displayAppointments = appointments.length > 0 ? appointments : DUMMY_APPOINTMENTS;
  const today = format(new Date(), "d 'de' MMMM", { locale: es });

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl bg-slate-50 p-4 md:p-8 rounded-3xl border border-slate-200/60">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Hoy</h2>
        <div className="flex items-center gap-2 text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
          <Clock className="size-4" />
          <span className="text-sm font-medium">{today}</span>
        </div>
      </div>

      <div className="relative flex flex-col gap-8">
        {/* Vertical Timeline Line */}
        <div className="absolute left-[2.25rem] top-2 bottom-2 w-px bg-slate-200 hidden md:block" />

        {displayAppointments.map((appt) => {
          const time = format(new Date(appt.appointmentDate), 'HH:mm');
          
          // Map backend status to UI color/label
          const statusConfig = {
            'SENT': { label: 'Enviado', color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
            'PENDING': { label: 'Pendiente', color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
            'ERROR': { label: 'Error', color: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
          };

          const config = statusConfig[appt.status] || statusConfig['PENDING'];

          return (
            <div key={appt.id} className="flex gap-4 md:gap-8 group">
              {/* Time slot */}
              <div className="min-w-[4rem] pt-4 text-sm font-bold text-slate-400 text-right group-hover:text-teal-600 transition-colors">
                {time}
              </div>

              {/* Appointment Card */}
              <div className="relative flex-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-0.5 group-active:scale-[0.98]">
                {/* Status Indicator Bar */}
                <div 
                  className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${config.color}`} 
                />
                
                <div className="pl-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                      {appt.clientName}
                    </h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
                    <span className="size-1.5 bg-slate-200 rounded-full" />
                    {appt.serviceName || "Servicio General"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
