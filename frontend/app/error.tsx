"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Next.js Error Boundary caught an exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen w-screen bg-surface flex flex-col justify-center items-center p-6 select-none">
      <div className="max-w-md w-full bg-surface-container-lowest border border-outline-variant p-8 rounded-2xl shadow-lg flex flex-col gap-6 items-center text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Error Icon */}
        <div className="size-16 rounded-full bg-error-container flex items-center justify-center text-error">
          <AlertTriangle className="size-8" />
        </div>

        {/* Text Header */}
        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-headline-md text-on-surface font-semibold">
            Algo ha salido mal
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs leading-relaxed">
            Ha ocurrido un problema inesperado al cargar esta vista de Volta.
          </p>
        </div>

        {/* Technical details Alert */}
        <div className="p-4 rounded-md text-body-md font-medium border flex gap-3 items-start bg-error-container border-error-container/60 text-on-error-container text-left w-full">
          <span className="font-mono text-body-sm break-all">
            {error.message || "Error desconocido del sistema"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row w-full gap-3 mt-2">
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar</span>
          </button>

          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-outline-variant text-on-surface font-medium rounded-xl hover:bg-surface-variant transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Ir al Inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
