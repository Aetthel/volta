"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  XCircle,
  Bell,
  Lock,
  Sparkles,
  ChevronDown,
  Building2,
  ArrowRight,
} from "lucide-react";

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
  const [showLegalDetails, setShowLegalDetails] = useState(false);
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
      window.history.replaceState({}, "", `/lopd/${clientId}`);
    }

    const token = sessionStorage.getItem("lopd_token");
    const exp = sessionStorage.getItem("lopd_exp");

    if (!token || !exp) {
      setError("El enlace de verificación no es válido o ha caducado.");
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
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 selection:bg-teal-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-zinc-500">Cargando verificación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 selection:bg-red-100">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm border border-zinc-200/80 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">Enlace no válido</h2>
          <p className="text-sm text-zinc-600 mb-6 leading-relaxed">{error}</p>
          <p className="text-xs text-zinc-400">
            Asegúrate de acceder desde el enlace original enviado a tu WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-teal-100 font-sans antialiased">
      <main className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-zinc-100 relative transition-all duration-300">
        {/* State 1: Accepted Confirmation */}
        {accepted ? (
          <div className="text-center py-6 flex flex-col items-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-5 shadow-inner">
              <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-2">
              Verificado
            </span>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">
              ¡Todo listo, {data.clientName}!
            </h1>
            <p className="text-sm text-zinc-600 max-w-sm mx-auto leading-relaxed mb-6">
              Has autorizado el envío de recordatorios de citas por WhatsApp para{" "}
              <strong className="text-zinc-900">{data.businessName}</strong>.
            </p>

            <div className="w-full bg-zinc-50 rounded-2xl p-4 border border-zinc-100 text-left text-xs text-zinc-600 flex items-start gap-3 mb-6">
              <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Tus datos quedan protegidos conforme a la normativa RGPD y LOPD-GDD. Podrás cancelar
                esta suscripción en cualquier momento respondiendo a los mensajes.
              </p>
            </div>

            <p className="text-xs text-zinc-400">Ya puedes cerrar esta ventana con seguridad.</p>
          </div>
        ) : rejected ? (
          /* State 2: Rejected Confirmation */
          <div className="text-center py-6 flex flex-col items-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 text-zinc-600 flex items-center justify-center mb-5">
              <XCircle className="w-8 h-8 stroke-[2.2]" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">
              Preferencia guardada
            </h1>
            <p className="text-sm text-zinc-600 max-w-sm mx-auto leading-relaxed mb-6">
              No recibirás recordatorios automáticos por WhatsApp por parte de{" "}
              <strong className="text-zinc-900">{data.businessName}</strong>.
            </p>
            <div className="w-full bg-zinc-50 rounded-2xl p-4 border border-zinc-100 text-left text-xs text-zinc-600 mb-6">
              <p className="leading-relaxed">
                Tus citas y reservas siguen activas en el centro. Si cambias de opinión en el
                futuro, puedes volver a abrir este enlace para activarlos.
              </p>
            </div>
            <p className="text-xs text-zinc-400">Ya puedes cerrar esta ventana.</p>
          </div>
        ) : (
          /* State 3: Main Consent Form */
          <div className="flex flex-col">
            {/* Business Header Pill */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100/80 flex items-center justify-center text-teal-700">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-medium leading-none mb-1">Negocio</p>
                  <p className="text-sm font-semibold text-zinc-900 leading-none">
                    {data.businessName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-50 border border-zinc-200/60 text-[11px] font-medium text-zinc-600">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>RGPD Seguro</span>
              </div>
            </div>

            {/* Title & Greeting */}
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight mb-2">
                Avisos y recordatorios de cita
              </h1>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Hola <strong className="text-zinc-900">{data.clientName}</strong>, confirma si
                deseas recibir avisos y recordatorios de tus próximas reservas por WhatsApp.
              </p>
            </div>

            {/* 3 Key Benefits Cards */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-zinc-50/70 border border-zinc-100">
                <div className="w-8 h-8 rounded-xl bg-white text-teal-700 flex items-center justify-center shrink-0 shadow-xs border border-zinc-100">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-zinc-900 mb-0.5">
                    Recordatorios automáticos
                  </h2>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Te notificaremos 24 horas antes para que nunca olvides una cita reservada.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-zinc-50/70 border border-zinc-100">
                <div className="w-8 h-8 rounded-xl bg-white text-teal-700 flex items-center justify-center shrink-0 shadow-xs border border-zinc-100">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-zinc-900 mb-0.5">
                    Privacidad y protección (RGPD)
                  </h2>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Tu teléfono solo se utiliza para gestionar tus servicios en {data.businessName}.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-zinc-50/70 border border-zinc-100">
                <div className="w-8 h-8 rounded-xl bg-white text-teal-700 flex items-center justify-center shrink-0 shadow-xs border border-zinc-100">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-zinc-900 mb-0.5">
                    Cero spam, control total
                  </h2>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Sin publicidad molesta. Puedes darte de baja en cualquier momento con un mensaje.
                  </p>
                </div>
              </div>
            </div>

            {/* Legal Terms Expandable Section */}
            <div className="mb-6 border-t border-zinc-100 pt-4">
              <button
                type="button"
                onClick={() => setShowLegalDetails(!showLegalDetails)}
                className="w-full flex items-center justify-between text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors py-1 cursor-pointer"
              >
                <span>Ver política legal completa (Art. 13 RGPD)</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                    showLegalDetails ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showLegalDetails && (
                <div className="mt-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 text-xs text-zinc-600 leading-relaxed max-h-56 overflow-y-auto space-y-2.5 animate-in fade-in duration-200">
                  <h3 className="font-semibold text-zinc-900">{data.policy?.title}</h3>
                  {data.policy?.sections.map((sec) => (
                    <div key={sec.heading}>
                      <strong className="text-zinc-800">{sec.heading}:</strong> {sec.body}
                    </div>
                  ))}
                  {data.policy && (
                    <p className="text-[10px] text-zinc-400 pt-2 border-t border-zinc-200/50 text-right">
                      Versión {data.policy.version} · En vigor desde{" "}
                      {new Date(data.policy.effectiveDate).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            {confirmingReject ? (
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80 animate-in fade-in duration-200">
                <p className="text-xs text-zinc-700 text-center font-medium mb-3">
                  Si no aceptas, no podremos avisarte de tus citas por WhatsApp. ¿Deseas continuar?
                </p>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setConfirmingReject(false)}
                    disabled={submitting}
                    className="flex-1 py-3 px-4 rounded-xl bg-white border border-zinc-200 text-zinc-700 text-xs font-semibold hover:bg-zinc-50 cursor-pointer transition-all"
                  >
                    Volver
                  </button>
                  <button
                    type="button"
                    onClick={() => submitDecision("reject")}
                    disabled={submitting}
                    className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-black cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Confirmar rechazo</span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => submitDecision("accept")}
                  disabled={submitting}
                  className="w-full py-3.5 px-5 rounded-2xl bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white text-sm font-semibold shadow-xs hover:shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span>Aceptar y permitir recordatorios</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmingReject(true)}
                  disabled={submitting}
                  className="w-full py-2.5 text-xs text-zinc-400 hover:text-zinc-700 cursor-pointer transition-colors text-center"
                >
                  No deseo recibir avisos
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modern Footer Note */}
      <footer className="mt-6 text-center text-xs text-zinc-400 flex items-center gap-1.5">
        <Lock className="w-3 h-3 text-zinc-400" />
        <span>Garantía de privacidad · Cumplimiento RGPD & LOPD-GDD</span>
      </footer>
    </div>
  );
}

