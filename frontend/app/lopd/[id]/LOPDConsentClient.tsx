"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/volta-ui";

// La política llega servida por el backend, que es quien registra qué versión
// aceptó el cliente. Mantenerla aquí como JSX permitiría editar el texto sin
// que cambiara la versión firmada en el registro de auditoría.
type PolicyDocument = {
  version: string;
  effectiveDate: string;
  title: string;
  sections: { heading: string; body: string }[];
};

type ConsentData = {
  clientName: string;
  businessName: string;
  lopdStatus: string;
  policy: PolicyDocument | null;
};

export default function LOPDConsentClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const clientId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<ConsentData>({
    clientName: "",
    businessName: "",
    lopdStatus: "",
    policy: null,
  });
  const [accepted, setAccepted] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [confirmingReject, setConfirmingReject] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!clientId) return;

    // Extract token from URL on first load and store in sessionStorage
    const urlToken = searchParams?.get("token");
    const urlExp = searchParams?.get("exp");
    if (urlToken && urlExp) {
      sessionStorage.setItem("lopd_token", urlToken);
      sessionStorage.setItem("lopd_exp", urlExp);
      // Clean URL to remove token from address bar / history
      window.history.replaceState({}, "", `/lopd/${clientId}`);
    }

    const token = sessionStorage.getItem("lopd_token");
    const exp = sessionStorage.getItem("lopd_exp");

    if (!token || !exp) {
      setError("Enlace de consentimiento inválido o expirado.");
      setLoading(false);
      return;
    }

    fetch(`/api/backend/lopd/${clientId}`, {
      headers: { "x-lopd-token": token, "x-lopd-exp": exp },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Cliente no encontrado o enlace inválido.");
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        if (resData.lopdStatus === "Aceptado") {
          setAccepted(true);
        }
        if (resData.lopdStatus === "Rechazado") {
          setRejected(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching LOPD details:", err);
        setError(err.message || "Error al cargar la información del consentimiento.");
        setLoading(false);
      });
  }, [clientId, searchParams]);

  // Aceptar y rechazar son la misma operación con distinto destino: una decisión
  // del cliente que el backend registra. Comparten flujo para que ninguna de las
  // dos quede como el "camino secundario" con menos garantías que la otra.
  const submitDecision = (action: "accept" | "reject") => {
    setSubmitting(true);
    const token = sessionStorage.getItem("lopd_token");
    const exp = sessionStorage.getItem("lopd_exp");

    fetch(`/api/backend/lopd/${clientId}/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-lopd-token": token || "",
        "x-lopd-exp": exp || "",
      },
      // Se devuelve la versión que esta página tiene renderizada, para que el
      // registro refleje el texto que el cliente vio y no el vigente al pulsar.
      body: JSON.stringify({ policyVersion: data.policy?.version }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo procesar tu respuesta.");
        return res.json();
      })
      .then(() => {
        if (action === "accept") setAccepted(true);
        else setRejected(true);
        setSubmitting(false);
      })
      .catch((err) => {
        console.error(`Error submitting LOPD decision (${action}):`, err);
        setError("Ocurrió un error al procesar tu respuesta. Por favor, inténtalo de nuevo.");
        setSubmitting(false);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="font-body-lg text-body-lg text-on-surface-variant font-medium">
          Cargando política de privacidad...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface-container-lowest rounded-md p-8 shadow-sm border border-outline-variant text-center flex flex-col items-center">
          <AlertCircle className="w-16 h-16 text-error mb-4" />
          <h2 className="font-title-lg text-title-lg text-on-surface font-semibold mb-2">
            Enlace no válido
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
            {error}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Por favor, asegúrate de utilizar el enlace completo enviado a tu número de WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-xl w-full bg-surface-container-lowest rounded-md p-6 sm:p-8 shadow-sm border border-outline-variant">
        {accepted ? (
          <div className="text-center py-8 flex flex-col items-center animate-in fade-in duration-300">
            <CheckCircle2 className="w-16 h-16 text-primary mb-4" />
            <h2 className="font-display text-headline-lg text-on-surface font-semibold mb-2">
              ¡Muchas gracias, {data.clientName}!
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto leading-relaxed mb-6">
              Has aceptado correctamente la política de privacidad de{" "}
              <strong>{data.businessName}</strong>.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant bg-surface-container-low px-5 py-3 rounded-lg border border-outline-variant/40 max-w-sm">
              A partir de ahora recibirás confirmaciones de tus citas y recordatorios automáticos
              directamente por WhatsApp.
            </p>
          </div>
        ) : rejected ? (
          <div className="text-center py-8 flex flex-col items-center animate-in fade-in duration-300">
            <XCircle className="w-16 h-16 text-on-surface-variant mb-4" />
            <h2 className="font-display text-headline-lg text-on-surface font-semibold mb-2">
              Entendido, {data.clientName}
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto leading-relaxed mb-6">
              Hemos registrado que <strong>no autorizas</strong> el envío de mensajes automáticos
              por parte de <strong>{data.businessName}</strong>.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant bg-surface-container-low px-5 py-3 rounded-lg border border-outline-variant/40 max-w-sm">
              No recibirás confirmaciones ni recordatorios por WhatsApp. Tus citas siguen siendo
              válidas y el salón te atenderá con normalidad.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4">
              <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
              <div>
                <h1 className="font-title-lg text-title-lg text-primary font-semibold leading-tight">
                  Consentimiento de Notificaciones
                </h1>
                <p className="text-label-md font-label-md text-on-surface-variant">
                  {data.businessName} · Ley Orgánica de Protección de Datos (LOPD)
                </p>
              </div>
            </div>

            {/* Intro */}
            <p className="font-body-md text-body-md text-on-surface mb-5 leading-relaxed">
              Hola <strong>{data.clientName}</strong>, para poder gestionar tus citas y enviarte
              recordatorios automatizados de tus reservas a través de WhatsApp, necesitamos tu
              autorización para procesar tus datos de contacto conforme al RGPD.
            </p>

            {/* Content Container: Legal Policy */}
            <div className="bg-surface-container-low rounded-md p-5 mb-5 border border-outline-variant/65 text-on-surface-variant font-body-sm text-body-sm leading-relaxed space-y-3">
              {data.policy?.title && (
                <h2 className="font-semibold text-on-surface text-body-md mb-1">
                  {data.policy.title}
                </h2>
              )}
              {data.policy?.sections.map((section) => (
                <div key={section.heading} className="space-y-0.5">
                  <strong className="text-on-surface block font-medium">
                    {section.heading}:
                  </strong>
                  <p>{section.body}</p>
                </div>
              ))}

              {data.policy && (
                <p className="text-label-xs font-label-xs text-on-surface-variant/70 pt-2 text-right border-t border-outline-variant/40">
                  Versión {data.policy.version} · en vigor desde{" "}
                  {new Date(data.policy.effectiveDate).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>

            {/* Actions */}
            {confirmingReject ? (
              <div className="flex flex-col gap-3 animate-in fade-in duration-200">
                <p className="font-body-md text-body-md text-on-surface text-center leading-relaxed">
                  Si no aceptas, <strong>no recibirás recordatorios de tus citas</strong> por
                  WhatsApp. ¿Confirmas tu decisión?
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => setConfirmingReject(false)}
                    disabled={submitting}
                    className="flex-1 py-3 font-medium"
                  >
                    Volver
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={() => submitDecision("reject")}
                    disabled={submitting}
                    className="flex-1 py-3 flex items-center justify-center gap-2 font-medium"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <span>Sí, no acepto</span>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={() => submitDecision("accept")}
                  disabled={submitting}
                  className="w-full py-3.5 flex items-center justify-center gap-2 active:scale-[0.99] disabled:scale-100 font-medium text-body-md"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <span>Aceptar y permitir recordatorios</span>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setConfirmingReject(true)}
                  disabled={submitting}
                  className="w-full py-2 text-label-md font-label-md text-on-surface-variant hover:text-on-surface underline underline-offset-4 disabled:opacity-50 transition-colors"
                >
                  No acepto
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
