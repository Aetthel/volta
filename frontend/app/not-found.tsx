"use client";

import { HelpCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/volta-ui";

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
          <Button
            onClick={() => window.location.href = "/"}
            variant="primary"
            size="lg"
            className="w-full py-3 px-6 active:scale-[0.98]"
          >
            <Home data-icon="home" />
            <span>Volver al Inicio</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
