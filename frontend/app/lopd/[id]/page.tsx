import { Suspense } from "react";
import LOPDConsentClient from "./LOPDConsentClient";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function LOPDConsentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="font-body-lg text-body-lg text-on-surface-variant font-medium">
            Cargando política de privacidad...
          </p>
        </div>
      }
    >
      <LOPDConsentClient />
    </Suspense>
  );
}
