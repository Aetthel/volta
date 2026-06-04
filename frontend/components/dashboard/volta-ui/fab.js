"use client";

import React from 'react';
import { Plus } from 'lucide-react';

export function VoltaFAB() {
  return (
    <button 
      className="fixed bottom-8 right-8 size-16 bg-teal-600 text-white rounded-[1.25rem] hover:scale-105 active:scale-90 transition-all duration-300 flex items-center justify-center z-50 group"
      aria-label="Nueva Cita"
    >
      <Plus className="size-8 stroke-[2.5] group-hover:rotate-90 transition-transform duration-300" />
      
      {/* Tooltip hint on hover (optional Volta touch) */}
      <span className="absolute right-20 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        Nueva Cita
      </span>
    </button>
  );
}
