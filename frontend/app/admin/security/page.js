import { ShieldCheck, Key, Eye, ShieldAlert, History, Smartphone, Lock } from "lucide-react";

export default function AdminSecurityPage() {
  const securityLogs = [
    { id: 1, event: "Inicio de sesión exitoso", user: "admin@test.com", date: "Hoy, 14:20", status: "success" },
    { id: 2, event: "Cambio de contraseña - Peluquería Elegance", user: "Sistema", date: "Hoy, 12:45", status: "info" },
    { id: 3, event: "Intento de acceso fallido", user: "desconocido", date: "Ayer, 23:10", status: "warning" },
  ];

  return (
    <div className="flex flex-col gap-12 w-full max-w-5xl mx-auto">
      <header className="mb-4">
        <h2 className="text-xs font-semibold text-teal-600 uppercase tracking-[0.4em] mb-3">Administración</h2>
        <h1 className="text-5xl font-semibold text-slate-900 tracking-tight leading-none">Seguridad</h1>
      </header>

      <div className="flex flex-col lg:flex-row gap-10 w-full items-start">
        
        {/* Left Column: Settings */}
        <div className="w-full lg:w-[60%] flex flex-col gap-10">
          {/* Change Password Card */}
          <div className="bg-white rounded-[3rem] p-10 md:p-14 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-6 mb-12">
              <div className="size-16 rounded-[1.5rem] bg-teal-50 text-teal-600 flex items-center justify-center">
                <Key className="size-8 stroke-[1.5]" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">Cambiar Contraseña</h3>
            </div>

            <form className="flex flex-col gap-8">
              <div className="relative group">
                <div className="absolute left-6 -top-3 px-3 bg-white text-[11px] font-semibold text-slate-400 group-focus-within:text-teal-600 transition-colors z-10 uppercase tracking-widest">
                  Contraseña Actual
                </div>
                <div className="relative flex items-center">
                  <ShieldAlert className="absolute left-6 size-6 text-slate-300 stroke-[1.5]" />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full h-20 pl-16 pr-6 rounded-2xl border border-slate-200 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition-all text-xl font-medium text-slate-900 bg-transparent"
                  />
                </div>
              </div>

              <div className="relative group">
                <div className="absolute left-6 -top-3 px-3 bg-white text-[11px] font-semibold text-slate-400 group-focus-within:text-teal-600 transition-colors z-10 uppercase tracking-widest">
                  Nueva Contraseña
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-6 size-6 text-slate-300 stroke-[1.5]" />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full h-20 pl-16 pr-6 rounded-2xl border border-slate-200 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition-all text-xl font-medium text-slate-900 bg-transparent"
                  />
                </div>
              </div>

              <button className="h-20 px-12 bg-slate-900 text-white font-semibold rounded-[2rem] hover:bg-slate-800 transition-all w-full md:w-fit mt-4 text-sm uppercase tracking-[0.2em]">
                Actualizar Seguridad
              </button>
            </form>
          </div>

          {/* Sessions Management */}
          <div className="bg-white rounded-[3rem] p-10 md:p-14 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-6 mb-10">
              <div className="size-16 rounded-[1.5rem] bg-blue-50 text-blue-600 flex items-center justify-center">
                <Smartphone className="size-8 stroke-[1.5]" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">Sesiones Activas</h3>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="flex items-center gap-6">
                  <div className="size-14 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                    <Eye className="size-7 stroke-[1.5]" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-lg leading-tight">Chrome en MacOS</p>
                    <p className="text-[11px] text-emerald-600 font-semibold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                       <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                       Activa ahora
                    </p>
                  </div>
                </div>
                <button className="h-12 px-6 rounded-xl text-xs font-semibold text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all uppercase tracking-widest mr-2">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Logs */}
        <div className="w-full lg:w-[40%]">
          <div className="bg-white rounded-[3rem] p-10 md:p-14 border border-slate-100 shadow-sm min-h-[500px] flex flex-col">
            <div className="flex items-center gap-6 mb-12">
              <div className="size-16 rounded-[1.5rem] bg-amber-50 text-amber-600 flex items-center justify-center">
                <History className="size-8 stroke-[1.5]" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">Actividad</h3>
            </div>

            <div className="flex flex-col gap-10 flex-1">
              {securityLogs.map((log) => (
                <div key={log.id} className="flex gap-6 group">
                  <div className={`size-3 rounded-full mt-2.5 shrink-0 ${
                    log.status === 'success' ? 'bg-emerald-500' : 
                    log.status === 'warning' ? 'bg-red-500' : 'bg-blue-500'
                  } ring-4 ring-slate-50`} />
                  <div className="flex flex-col gap-2">
                    <p className="text-lg font-semibold text-slate-800 leading-tight group-hover:text-teal-600 transition-colors tracking-tight">
                      {log.event}
                    </p>
                    <p className="text-sm text-slate-500 font-medium opacity-60 uppercase tracking-widest">{log.user}</p>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-[0.2em] mt-2">{log.date}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-14 py-6 border-2 border-dashed border-slate-100 rounded-[2rem] text-[11px] font-semibold text-slate-400 hover:border-teal-200 hover:text-teal-600 transition-all uppercase tracking-[0.3em]">
              Historial Completo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
