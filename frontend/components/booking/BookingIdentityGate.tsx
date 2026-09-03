"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, Loader2, MessageCircle, ShieldCheck } from "lucide-react";
import { Alert, Button, Card, Avatar } from "@/components/ui/volta-ui";
import { formatPhoneNumber } from "@/lib/utils";
import type { BookingSession } from "@/hooks/useBookingSession";

const CODE_LENGTH = 6;
/** Antes de esto, reenviar solo gasta uno de los tres códigos disponibles. */
const RESEND_COOLDOWN_SECONDS = 30;

type Phase = "phone" | "name" | "code";

interface BusinessProfile {
  name: string;
  address?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
}

interface BookingIdentityGateProps {
  businessId: string;
  business: BusinessProfile;
  onVerified: (session: BookingSession) => void;
}

const formatCountdown = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

/**
 * Seis casillas en lugar de un input suelto: se ve de un vistazo cuántos
 * dígitos faltan, y el pegado desde la notificación de WhatsApp rellena todas.
 */
function CodeInput({
  value,
  onChange,
  onComplete,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  onComplete: (code: string) => void;
  disabled?: boolean;
}) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const setDigit = (index: number, digit: string) => {
    const next = value.padEnd(CODE_LENGTH, " ").split("");
    next[index] = digit || " ";
    const joined = next.join("").replace(/\s+$/, "");
    onChange(joined.trimEnd());

    if (digit && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }

    const complete = joined.replace(/\s/g, "");
    if (complete.length === CODE_LENGTH) onComplete(complete);
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;

    event.preventDefault();
    onChange(pasted);
    inputs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
    if (pasted.length === CODE_LENGTH) onComplete(pasted);
  };

  const handleKeyDown = (index: number) => (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length: CODE_LENGTH }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          aria-label={`Dígito ${index + 1} de ${CODE_LENGTH}`}
          value={value[index] ?? ""}
          onChange={(event) => setDigit(index, event.target.value.replace(/\D/g, ""))}
          onKeyDown={handleKeyDown(index)}
          className="w-11 h-14 sm:w-12 sm:h-16 text-center text-title-lg font-bold rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all disabled:opacity-50"
        />
      ))}
    </div>
  );
}

export default function BookingIdentityGate({
  businessId,
  business,
  onVerified,
}: BookingIdentityGateProps) {
  const [phase, setPhase] = useState<Phase>("phone");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [code, setCode] = useState("");

  const [maskedPhone, setMaskedPhone] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (secondsLeft <= 0 && cooldown <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [secondsLeft, cooldown]);

  const requestCode = useCallback(
    async (name?: string) => {
      setSubmitting(true);
      setError("");
      setNotice("");

      const cleanPhone = phone.replace(/\s+/g, "");
      try {
        const res = await fetch(`/api/backend/public/booking/${businessId}/identity/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: cleanPhone, fullName: name ?? undefined }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "No hemos podido enviarte el código.");
          return;
        }

        if (data.state === "NAME_REQUIRED") {
          setPhase("name");
          return;
        }

        setMaskedPhone(data.maskedPhone || "");
        setSecondsLeft(data.expiresInSeconds ?? 300);
        setCooldown(RESEND_COOLDOWN_SECONDS);
        setCode("");
        setPhase("code");
      } catch {
        setError("Error de conexión. Comprueba tu cobertura e inténtalo de nuevo.");
      } finally {
        setSubmitting(false);
      }
    },
    [businessId, phone]
  );

  const verify = useCallback(
    async (candidate: string) => {
      setSubmitting(true);
      setError("");

      const cleanPhone = phone.replace(/\s+/g, "");
      try {
        const res = await fetch(`/api/backend/public/booking/${businessId}/identity/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: cleanPhone, code: candidate }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "El código no es válido.");
          setCode("");
          return;
        }

        onVerified({
          token: data.bookingToken,
          expiresAt: data.expiresAt,
          identity: { phone: cleanPhone, name: data.displayName },
        });
      } catch {
        setError("Error de conexión al verificar el código.");
      } finally {
        setSubmitting(false);
      }
    },
    [businessId, phone, onVerified]
  );

  const resend = async () => {
    await requestCode(fullName.trim() || undefined);
    setNotice("Te hemos enviado un código nuevo por WhatsApp.");
  };

  const isPhoneValid = /^\+?[0-9\s-]{9,20}$/.test(phone.trim());
  const isNameValid = fullName.trim().length >= 3;

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between py-8 px-4 sm:px-8">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center">
        {/* Marca del negocio */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <Avatar
              name={business.name}
              src={business.logoUrl || business.coverUrl}
              type="business"
              size="xl"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-sm border border-outline-variant/60 object-cover text-2xl font-bold"
            />
          </div>
          <h1 className="font-display text-headline-md font-bold text-on-surface">
            {business.name}
          </h1>
          {business.address && (
            <p className="text-body-sm text-on-surface-variant mt-1">{business.address}</p>
          )}
        </div>

        <Card className="p-6 sm:p-8">
          {error && (
            <Alert variant="error" className="mb-5 py-2.5 px-4 rounded-xl text-body-sm">
              {error}
            </Alert>
          )}
          {notice && !error && (
            <Alert variant="info" className="mb-5 py-2.5 px-4 rounded-xl text-body-sm">
              {notice}
            </Alert>
          )}

          {phase === "phone" && (
            <form
              className="animate-in fade-in duration-200"
              onSubmit={(event) => {
                event.preventDefault();
                if (isPhoneValid && !submitting) requestCode();
              }}
            >
              <h2 className="text-headline-sm font-bold text-on-surface mb-1">Reserva tu cita</h2>
              <p className="text-body-sm text-on-surface-variant mb-6">
                Identifícate con tu móvil para ver los servicios y las horas disponibles.
              </p>

              <label
                htmlFor="booking-phone"
                className="block text-body-sm font-semibold text-on-surface mb-1"
              >
                Teléfono móvil
              </label>
              <input
                id="booking-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                autoFocus
                value={phone}
                onChange={(event) => setPhone(formatPhoneNumber(event.target.value))}
                placeholder="Ej. 600 11 22 33"
                className="w-full px-4 py-3 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />

              <Button
                type="submit"
                variant="primary"
                disabled={!isPhoneValid || submitting}
                className="w-full py-3.5 rounded-xl font-semibold text-body-md mt-5"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Continuar <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <p className="text-body-xs text-on-surface-variant/80 mt-5 leading-relaxed">
                Usamos tu teléfono para verificar que eres tú y para gestionar tu reserva con{" "}
                {business.name}.
                <br />
                Te enviaremos un código por WhatsApp.
              </p>
            </form>
          )}

          {phase === "name" && (
            <form
              className="animate-in fade-in duration-200"
              onSubmit={(event) => {
                event.preventDefault();
                if (isNameValid && !submitting) requestCode(fullName.trim());
              }}
            >
              <button
                type="button"
                onClick={() => setPhase("phone")}
                className="flex items-center gap-1 text-primary text-body-sm font-medium mb-4 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Cambiar teléfono
              </button>

              <h2 className="text-headline-sm font-bold text-on-surface mb-1">
                Es tu primera vez aquí
              </h2>
              <p className="text-body-sm text-on-surface-variant mb-6">
                Ese número todavía no consta como cliente de {business.name}. Dinos cómo te llamas
                para poder darte de alta al confirmar la reserva.
              </p>

              <label
                htmlFor="booking-name"
                className="block text-body-sm font-semibold text-on-surface mb-1"
              >
                Nombre y apellidos
              </label>
              <input
                id="booking-name"
                type="text"
                autoComplete="name"
                autoFocus
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Ej. María García"
                className="w-full px-4 py-3 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />

              <Button
                type="submit"
                variant="primary"
                disabled={!isNameValid || submitting}
                className="w-full py-3.5 rounded-xl font-semibold text-body-md mt-5"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Enviarme el código <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {phase === "code" && (
            <div className="animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6" />
              </div>

              <h2 className="text-headline-sm font-bold text-on-surface text-center mb-1">
                Introduce el código
              </h2>
              <p className="text-body-sm text-on-surface-variant text-center mb-6">
                Te lo hemos enviado por WhatsApp al {maskedPhone || "número indicado"}.
              </p>

              <CodeInput
                value={code}
                onChange={setCode}
                onComplete={verify}
                disabled={submitting}
              />

              <div className="text-center mt-5 min-h-[1.5rem]">
                {submitting ? (
                  <span className="inline-flex items-center gap-2 text-body-sm text-on-surface-variant">
                    <Loader2 className="w-4 h-4 animate-spin" /> Verificando...
                  </span>
                ) : secondsLeft > 0 ? (
                  <span className="text-body-sm text-on-surface-variant">
                    El código caduca en {formatCountdown(secondsLeft)}
                  </span>
                ) : (
                  <span className="text-body-sm text-error">El código ha caducado.</span>
                )}
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting || cooldown > 0}
                  onClick={resend}
                  className="w-full py-3 rounded-xl font-semibold"
                >
                  {cooldown > 0 ? `Reenviar código (${cooldown}s)` : "Reenviar código"}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setPhase("phone");
                    setCode("");
                    setError("");
                    setNotice("");
                  }}
                  className="text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer py-1"
                >
                  Usar otro número
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <footer className="mt-10 text-center text-body-xs text-on-surface-variant/60 flex items-center justify-center gap-1">
        <ShieldCheck className="w-4 h-4 text-primary" />
        Sistema verificado y seguro · Volta Platform
      </footer>
    </div>
  );
}
