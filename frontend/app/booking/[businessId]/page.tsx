"use client";

import { useCallback, useEffect, useState, use } from "react";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { COLOR_PALETTES, getThemeColor, applyThemeColors } from "@/lib/theme";
import { Card } from "@/components/ui/volta-ui";
import { useBookingSession, type BookingSession } from "@/hooks/useBookingSession";
import BookingIdentityGate from "@/components/booking/BookingIdentityGate";
import BookingWizard, {
  type BookingBusinessData,
  type WizardSelection,
} from "@/components/booking/BookingWizard";

interface PublicBusinessProfile {
  id: string;
  name: string;
  address?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  themeColor?: string;
  enablePublicBooking?: boolean;
}

const applyBusinessTheme = (themeColor?: string) => {
  if (typeof document === "undefined") return;
  const palette = COLOR_PALETTES[getThemeColor(themeColor)] || COLOR_PALETTES.CLINICAL_ELEGANCE;
  applyThemeColors(document.documentElement, palette);
};

export default function PublicBookingPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = use(params);

  const { identity, isVerified, isRestoring, startSession, authFetch } =
    useBookingSession(businessId);

  const [profile, setProfile] = useState<PublicBusinessProfile | null>(null);
  const [catalogue, setCatalogue] = useState<BookingBusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // La selección vive por encima del gate y del asistente: si la sesión caduca
  // a mitad del flujo, el visitante vuelve a verificarse y recupera el servicio,
  // la fecha y la hora que ya había elegido.
  const [selection, setSelection] = useState<WizardSelection>({
    service: null,
    date: new Date().toISOString().split("T")[0],
    time: "",
  });

  // 1. Marca del negocio: es lo único público, y pinta ya la pantalla de acceso.
  useEffect(() => {
    if (!businessId) return;

    fetch(`/api/backend/public/booking/${businessId}/profile`)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok || data.error) {
          setError(data.error || "No se ha podido encontrar el negocio solicitado.");
        } else {
          setProfile(data);
          applyBusinessTheme(data.themeColor);
        }
      })
      .catch(() => setError("Error al cargar la información del negocio."))
      .finally(() => setLoading(false));
  }, [businessId]);

  // 2. Catálogo: solo con una sesión de reserva verificada.
  useEffect(() => {
    if (!isVerified) {
      setCatalogue(null);
      return;
    }

    let cancelled = false;

    authFetch(`/api/backend/public/booking/${businessId}`)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok) {
          // Un 401 ya ha cerrado la sesión: el gate vuelve solo.
          if (data?.error && !data?.code) setError(data.error);
          return;
        }
        setCatalogue(data);
        applyBusinessTheme(data.themeColor);
      })
      .catch(() => {
        if (!cancelled) setError("Error al cargar los servicios del negocio.");
      });

    return () => {
      cancelled = true;
    };
  }, [businessId, isVerified, authFetch]);

  const handleVerified = useCallback(
    (session: BookingSession) => {
      setError("");
      startSession(session);
    },
    [startSession]
  );

  if (loading || isRestoring) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-body-md text-on-surface-variant font-medium">
            Cargando reservas...
          </span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-6 text-center">
          <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
          <h2 className="text-headline-sm font-bold text-on-surface mb-2">
            Reservas No Disponibles
          </h2>
          <p className="text-body-md text-on-surface-variant mb-6">
            {error || "No se ha podido encontrar el negocio solicitado."}
          </p>
        </Card>
      </div>
    );
  }

  if (!isVerified || !identity) {
    return (
      <BookingIdentityGate
        businessId={businessId}
        business={{
          name: profile.name,
          address: profile.address,
          description: profile.description,
          logoUrl: profile.logoUrl,
          coverUrl: profile.coverUrl,
        }}
        onVerified={handleVerified}
      />
    );
  }

  if (!catalogue) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-body-md text-on-surface-variant font-medium">
            Cargando servicios...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <BookingWizard
        business={catalogue}
        identity={identity}
        selection={selection}
        onSelectionChange={setSelection}
        authFetch={authFetch}
      />

      <footer className="pb-8 text-center text-body-xs text-on-surface-variant/60 flex items-center justify-center gap-1">
        <ShieldCheck className="w-4 h-4 text-primary" />
        Sistema verificado y seguro · Volta Platform
      </footer>
    </div>
  );
}
