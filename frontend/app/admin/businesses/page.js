import prisma from "backend/db";
import Link from "next/link";
import { Plus, Building2, Mail, Phone, Shield, User, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function BusinessListPage() {
  const businesses = await prisma.business.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-12 w-full max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-xs font-semibold text-teal-600 uppercase tracking-[0.3em] mb-3">Administración</h2>
          <h1 className="text-5xl font-semibold text-slate-900 tracking-tight leading-none">Negocios</h1>
        </div>
        
        <Link href="/admin/businesses/new">
          <button className="h-20 px-10 bg-teal-600 text-white font-semibold rounded-[2rem] hover:bg-teal-700 active:scale-[0.98] transition-all flex items-center gap-4 text-sm uppercase tracking-widest">
            <Plus className="size-6 stroke-[2]" />
            Nuevo Negocio
          </button>
        </Link>
      </header>

      <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/30">
                <th className="px-10 py-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Negocio</th>
                <th className="px-10 py-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Contacto</th>
                <th className="px-10 py-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Rol</th>
                <th className="px-10 py-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 text-right">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {businesses.map((business) => (
                <tr key={business.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className="size-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-teal-600 transition-all border border-transparent group-hover:border-slate-100 shadow-sm shrink-0">
                        <Building2 className="size-8 stroke-[1.5]" />
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-slate-900 leading-tight tracking-tight">{business.name}</p>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1.5 opacity-60">ID: {business.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                        <Mail className="size-4 text-teal-600/30 stroke-[2]" />
                        {business.email}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                        <Phone className="size-4 text-teal-600/30 stroke-[2]" />
                        {business.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex">
                      <div className={cn(
                        "inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] min-w-fit whitespace-nowrap",
                        business.role === "ADMIN" 
                          ? "bg-slate-900 text-white" 
                          : "bg-teal-50 text-teal-700"
                      )}>
                        {business.role === "ADMIN" ? <Shield className="size-4 stroke-[2]" /> : <User className="size-4 stroke-[2]" />}
                        {business.role}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button className="h-14 px-6 rounded-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 font-semibold text-xs uppercase tracking-widest transition-all inline-flex items-center gap-2">
                      Configurar
                      <ChevronRight className="size-4 stroke-[2]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {businesses.length === 0 && (
          <div className="p-32 flex flex-col items-center justify-center text-center">
            <div className="size-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-8 border border-slate-100">
              <Building2 className="size-12 stroke-[1.5]" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">No hay negocios registrados</h3>
            <p className="text-slate-400 mt-3 font-medium uppercase tracking-widest text-[10px] max-w-xs leading-loose">Comienza creando el primer negocio para desplegar el sistema.</p>
          </div>
        )}
      </div>
    </div>
  );
}
