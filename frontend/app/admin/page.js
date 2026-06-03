export default function AdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h2 className="text-sm uppercase tracking-[0.3em] text-neutral-400">Panel de Control</h2>
        <h1 className="text-5xl font-display font-bold">Resumen Global</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Negocios Activos", value: "1", trend: "Admin inicial" },
          { label: "Bots Online", value: "0", trend: "Pendiente" },
          { label: "Mensajes Enviados", value: "0", trend: "Mes actual" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-neutral-900 p-8 border border-neutral-100 dark:border-neutral-800">
            <p className="text-[10px] uppercase tracking-widest text-neutral-400">{stat.label}</p>
            <p className="text-4xl font-display font-bold mt-2">{stat.value}</p>
            <p className="text-[9px] uppercase tracking-widest text-solar mt-4">{stat.trend}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
