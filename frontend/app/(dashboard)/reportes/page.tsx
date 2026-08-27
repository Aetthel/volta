"use client";

export const dynamic = "force-dynamic";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { FileText, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ReportesPage() {
  return (
    <div className="flex h-screen w-full bg-surface-container-lowest text-on-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto pl-0 md:pl-(--sidebar-width) transition-all duration-300">
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-300 mb-6 shadow-inner">
            <FileText className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#92400E] border border-amber-200 mb-4">
            <Clock className="w-3.5 h-3.5" />
            <span>Próximamente</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface mb-3">
            Módulo de Reportes
          </h1>

          <p className="text-sm text-on-surface-variant leading-relaxed mb-8">
            Estamos diseñando herramientas avanzadas de informes fiscales, exportación contable y balances de facturación periódica para optimizar la gestión de tu negocio.
          </p>

          <Link
            href="/inicio"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <span>Volver al Inicio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
