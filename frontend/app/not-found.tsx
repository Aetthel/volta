import { HelpCircle, Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen w-screen bg-surface flex flex-col justify-center items-center p-6 select-none">
      <div className="max-w-md w-full bg-surface-container-lowest border border-outline-variant p-8 rounded-2xl shadow-lg flex flex-col gap-6 items-center text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Help Icon */}
        <div className="size-16 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
          <HelpCircle className="size-8" />
        </div>

        {/* Text Header */}
        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-headline-md text-on-surface font-semibold">
            Página no encontrada
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs leading-relaxed">
            La página que buscas no existe, ha sido eliminada o movida a otra ubicación.
          </p>
        </div>

        {/* Action Button */}
        <div className="w-full mt-2">
          <a
            href="/"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] transition-all cursor-pointer font-semibold"
          >
            <Home className="size-4" />
            <span>Volver al Inicio</span>
          </a>
        </div>
      </div>
    </div>
  );
}
