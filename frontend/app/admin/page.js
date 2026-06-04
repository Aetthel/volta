import { Users, Smartphone, MessageCircle, TrendingUp, Building2, Layers, Zap } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { label: "Negocios Activos", value: "1", trend: "SISTEMA", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Bots Online", value: "0", trend: "RED", icon: Smartphone, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Mensajes Enviados", value: "0", trend: "WHATSAPP", icon: MessageCircle, color: "text-teal-600", bg: "bg-teal-50" },
  ];

  return (
    <div className="flex flex-col gap-12 w-full max-w-5xl mx-auto">
      <header>
        <h2 className="text-xs font-semibold text-teal-600 uppercase tracking-[0.3em] mb-3">Panel Maestro</h2>
        <h1 className="text-5xl font-semibold text-slate-900 tracking-tight leading-tight">Resumen Global</h1>
      </header>

      {/* Row 1: Strict 3-column Grid for uniform stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="bg-white p-10 rounded-[3rem] border border-slate-100 flex flex-col gap-8 group hover:border-teal-200 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className={`size-16 rounded-[1.5rem] ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                <stat.icon className="size-8 stroke-[1.5]" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full uppercase tracking-widest">
                <TrendingUp className="size-4 stroke-[2]" />
                <span>+0%</span>
              </div>
            </div>
            
            <div>
              <p className="text-6xl font-medium text-slate-900 tracking-tight leading-none">{stat.value}</p>
              <p className="text-sm font-medium text-slate-400 mt-4 uppercase tracking-[0.1em]">{stat.label}</p>
            </div>

            <div className="pt-6 border-t border-slate-50 mt-auto">
              <p className="text-[10px] font-medium text-slate-300 uppercase tracking-[0.2em]">{stat.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Two Columns to fill horizontal space and height */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Growth Metrics (Takes 8/12) */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] p-12 border border-slate-100 flex flex-col items-center justify-center border-dashed min-h-[500px]">
           <div className="size-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-8">
              <Layers className="size-10 text-slate-200 stroke-[1.5]" />
           </div>
           <p className="text-slate-400 font-medium uppercase tracking-[0.25em] text-sm">Métricas de Crecimiento</p>
           <p className="text-slate-200 text-xs font-medium uppercase mt-4 tracking-widest">(Próximamente disponible)</p>
        </div>

        {/* Secondary Info (Takes 4/12) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="flex-1 bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col justify-center border border-slate-800">
            <div className="flex items-center gap-2 mb-6">
               <Zap className="size-5 text-teal-400 fill-teal-400" />
               <h4 className="text-teal-400 text-sm font-medium uppercase tracking-widest">Estado del Sistema</h4>
            </div>
            <div className="flex items-center gap-5">
              <div className="size-5 rounded-full bg-emerald-500 animate-pulse ring-8 ring-emerald-500/10" />
              <p className="text-4xl font-semibold tracking-tight leading-none">Operativo</p>
            </div>
            <p className="text-slate-500 text-xs font-medium uppercase mt-8 tracking-[0.2em]">Todos los núcleos online</p>
          </div>
          
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 flex flex-col gap-6 group hover:bg-slate-50 transition-colors cursor-pointer min-h-[200px] justify-center text-center items-center">
              <div className="size-16 rounded-[1.5rem] bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                 <Building2 className="size-8 stroke-[1.5]" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900 leading-tight uppercase tracking-widest">Configurar Nuevo</p>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-2 leading-relaxed opacity-60">Añadir instancia de negocio</p>
              </div>
          </div>
        </div>

      </div>
    </div>
  );
}
