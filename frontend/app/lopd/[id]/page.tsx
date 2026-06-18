"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/volta-ui";

export default function LOPDConsentPage() {
  const params = useParams();
  const clientId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    clientName: "",
    businessName: "",
    lopdStatus: "",
  });
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!clientId) return;

    fetch(`/api/backend/lopd/${clientId}`)
      .then((res) => {
        if (!res.ok)
          throw new Error("Cliente no encontrado o enlace inválido.");
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        if (resData.lopdStatus === "Aceptado") {
          setAccepted(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching LOPD details:", err);
        setError(
          err.message || "Error al cargar la información del consentimiento.",
        );
        setLoading(false);
      });
  }, [clientId]);

  const handleAccept = () => {
    setSubmitting(true);
    fetch(`/api/backend/lopd/${clientId}/accept`, {
      method: "POST",
    })
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo procesar la aceptación.");
        return res.json();
      })
      .then(() => {
        setAccepted(true);
        setSubmitting(false);
      })
      .catch((err) => {
        console.error("Error accepting LOPD:", err);
        setError(
          "Ocurrió un error al procesar tu aceptación. Por favor, inténtalo de nuevo.",
        );
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
            Por favor, asegúrate de utilizar el enlace completo enviado a tu
            número de WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-surface-container-lowest rounded-md p-8 md:p-10 shadow-md border border-outline-variant relative overflow-hidden">
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

        {accepted ? (
          <div className="text-center py-6 flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-20 h-20 text-primary mb-6" />
            <h2 className="font-display text-headline-lg text-on-surface font-semibold mb-3">
              ¡Muchas gracias, {data.clientName}!
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto leading-relaxed mb-6">
              Has aceptado correctamente la política de privacidad de{" "}
              <strong>{data.businessName}</strong>.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant bg-secondary-container/30 px-6 py-4 rounded-lg border border-outline-variant/50 max-w-sm">
              A partir de ahora recibirás confirmaciones de tus citas y
              recordatorios automáticos directamente por WhatsApp.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-title-lg text-title-lg text-primary font-semibold">
                  Consentimiento de Notificaciones
                </h1>
                <p className="text-label-md font-label-md text-on-surface-variant">
                  Ley Orgánica de Protección de Datos (LOPD)
                </p>
              </div>
            </div>

            <p className="font-body-lg text-body-lg text-on-surface mb-6 leading-relaxed">
              Hola <strong>{data.clientName}</strong>, para poder gestionar tus
              citas y enviarte recordatorios automatizados de tus reservas a
              través de WhatsApp, necesitamos que nos autorices a procesar tus
              datos de contacto.
            </p>

            <div className="bg-surface-container-low rounded-md p-6 mb-8 border border-outline-variant/65 text-on-surface-variant font-body-md text-body-md leading-relaxed h-48 overflow-y-auto custom-scrollbar">
              <h3 className="font-semibold text-on-surface mb-2">
                Información Básica sobre Protección de Datos
              </h3>
              <p className="mb-3">
                <strong>Responsable del Tratamiento:</strong>{" "}
                {data.businessName}.
              </p>
              <p className="mb-3">
                <strong>Finalidad:</strong> Envío de confirmaciones de reserva,
                modificaciones o cancelaciones de tus citas, y recordatorios
                automáticos 24 horas antes del servicio contratado a través del
                canal de WhatsApp.
              </p>
              <p className="mb-3">
                <strong>Legitimación:</strong> Consentimiento expreso del
                interesado al marcar la casilla de aceptación y presionar el
                botón inferior.
              </p>
              <p className="mb-3">
                <strong>Destinatarios:</strong> No se cederán datos a terceros
                salvo obligación legal o para la prestación del servicio técnico
                de envío de mensajes automatizados (Plataforma Volta).
              </p>
              <p>
                <strong>Derechos:</strong> Tienes derecho a acceder, rectificar
                y suprimir los datos, así como otros derechos explicados en la
                política de privacidad detallada, enviando un correo al centro
                de estética {data.businessName}. Puedes revocar este
                consentimiento en cualquier momento solicitándolo directamente
                en tu próxima visita al salón.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleAccept}
              disabled={submitting}
              className="w-full py-4 flex items-center justify-center gap-2 active:scale-[0.98] disabled:scale-100 font-medium"
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
          </div>
        )}
      </div>
    </div>
  );
}
