import { cn } from "@/lib/utils";

export function VoltaCard({ children, className, ...props }) {
  return (
    <div 
      className={cn(
        "bg-white rounded-[3rem] p-10 md:p-14 border border-slate-100 shadow-sm transition-all hover:border-teal-200",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

export function VoltaButton({ children, variant = "primary", className, ...props }) {
  const variants = {
    primary: "bg-teal-600 text-white hover:bg-teal-700",
    secondary: "bg-slate-50 text-slate-600 hover:bg-slate-100",
    outline: "bg-transparent border-2 border-slate-100 text-slate-400 hover:border-teal-200 hover:text-teal-600",
    ghost: "bg-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-900"
  };

  return (
    <button 
      className={cn(
        "h-20 px-12 rounded-[2rem] font-semibold text-sm uppercase tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center gap-4",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function VoltaInput({ label, icon: Icon, className, ...props }) {
  return (
    <div className="relative group w-full">
      {label && (
        <div className="absolute left-6 -top-3 px-3 bg-white text-[11px] font-semibold text-slate-400 group-focus-within:text-teal-600 transition-colors z-10 uppercase tracking-widest">
          {label}
        </div>
      )}
      <div className="relative flex items-center">
        {Icon && <Icon className="absolute left-6 size-6 text-slate-300 stroke-[1.5]" />}
        <input 
          className={cn(
            "w-full h-20 pr-6 rounded-2xl border border-slate-200 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition-all text-xl font-medium text-slate-900 bg-transparent placeholder:text-slate-200",
            Icon ? "pl-16" : "pl-6",
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
}
