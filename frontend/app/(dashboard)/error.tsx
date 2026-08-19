"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-md shadow-xl flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center font-bold text-xl">
          !
        </div>
        <h2 className="text-xl font-semibold text-on-surface">Ha ocurrido un problema al cargar esta vista</h2>
        <p className="text-sm text-on-surface-variant">
          No se pudieron sincronizar los datos del servidor. Por favor, reintente la conexión.
        </p>
        <button
          onClick={() => reset()}
          className="mt-2 px-5 py-2.5 bg-primary text-on-primary font-medium rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-md"
        >
          Reintentar Carga
        </button>
      </div>
    </div>
  );
}
