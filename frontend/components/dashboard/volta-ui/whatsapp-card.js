"use client";

import React from 'react';
import { Smartphone, CheckCircle2, AlertCircle, RefreshCw, Link as LinkIcon } from 'lucide-react';

export function VoltaWhatsAppCard({ status, qrCode }) {
  const isConnected = status === 'CONNECTED';
  
  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden max-w-xl">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="size-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Smartphone className="size-7" />
          </div>
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 
            ${isConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}
          `}>
            <div className={`size-2 rounded-full animate-pulse ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {isConnected ? 'Conectado' : 'Desconectado'}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 leading-tight">WhatsApp Business</h2>
        <p className="text-slate-500 mt-2 font-medium">
          {isConnected 
            ? "Tu cuenta está vinculada y enviando recordatorios automáticos correctamente." 
            : "Vincula tu cuenta de WhatsApp para automatizar el envío de recordatorios y confirmaciones."}
        </p>

        {!isConnected && qrCode && (
          <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              {/* Simplified QR Placeholder */}
              <div className="size-48 bg-slate-100 flex items-center justify-center relative overflow-hidden group">
                <img src={qrCode} alt="QR Code" className="w-full h-full" />
                <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <RefreshCw className="size-8 text-teal-600 animate-spin-slow" />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-6 text-center">
              Escanea este código con tu móvil <br/> en Ajustes {'>'} Dispositivos vinculados
            </p>
          </div>
        )}

        {isConnected && (
          <div className="mt-8 flex flex-col gap-3">
            <div className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <CheckCircle2 className="size-5 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-800">Citas sincronizadas: 24 hoy</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <LinkIcon className="size-5 text-slate-400" />
              <span className="text-sm font-bold text-slate-700">Número: +34 6** *** *89</span>
            </div>
          </div>
        )}

        <button 
          className={`mt-8 w-full h-14 rounded-2xl font-bold transition-all flex items-center justify-center gap-2
            ${isConnected ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-teal-600 text-white hover:bg-teal-700'}
          `}
        >
          {isConnected ? 'Desvincular Dispositivo' : 'Generar Nuevo QR'}
        </button>
      </div>
    </div>
  );
}
