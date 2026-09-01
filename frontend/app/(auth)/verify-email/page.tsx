"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { Button, Alert, Card } from "@/components/ui/volta-ui";
import { defaultThemeStyles } from "@/lib/theme";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);

    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits filled, trigger auto-submit
    const fullCode = newDigits.join("");
    if (fullCode.length === 6 && email) {
      submitOtp(email, fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setDigits(newDigits);

    if (pasted.length === 6 && email) {
      submitOtp(email, pasted);
    } else {
      const nextEmpty = newDigits.findIndex((d) => !d);
      if (nextEmpty !== -1) {
        inputRefs.current[nextEmpty]?.focus();
      }
    }
  };

  const submitOtp = async (targetEmail: string, code: string) => {
    if (!targetEmail.trim()) {
      setError("Por favor, introduce tu correo electrónico.");
      return;
    }
    if (code.length !== 6) {
      setError("Introduce el código completo de 6 dígitos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await apiClient.auth.verifyOtp({
        email: targetEmail.trim(),
        code,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/login?verified=true&email=${encodeURIComponent(targetEmail)}`);
        }, 1500);
      }
    } catch {
      setError("Error al conectar con el servidor.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim() || cooldown > 0 || resending) return;

    setResending(true);
    setError("");

    try {
      const res = await apiClient.auth.resendOtp({ email: email.trim() });
      if (res.error) {
        setError(res.error);
      } else {
        setCooldown(60);
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError("Error al reenviar el código.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-surface flex flex-col justify-center items-center px-4 sm:px-6 py-12 select-none"
      style={defaultThemeStyles}
    >
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio de sesión</span>
        </Link>

        <Card className="p-6 sm:p-8 bg-surface-container-lowest border border-outline-variant/40 rounded-3xl shadow-sm">
          {/* Header Icon */}
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
            {success ? <ShieldCheck className="w-7 h-7" /> : <Mail className="w-7 h-7" />}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-center text-on-surface mb-2 tracking-tight">
            {success ? "¡Cuenta Verificada!" : "Verifica tu Correo"}
          </h1>

          <p className="text-xs sm:text-sm text-center text-on-surface-variant/80 mb-6 leading-relaxed">
            {success ? (
              "Tu correo ha sido confirmado con éxito. Redirigiéndote..."
            ) : (
              <>
                Hemos enviado un código de 6 dígitos a{" "}
                <span className="font-semibold text-on-surface">{email || "tu correo"}</span>.
              </>
            )}
          </p>

          {error && (
            <Alert variant="error" className="mb-6">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </Alert>
          )}

          {success ? (
            <div className="py-6 flex flex-col items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-primary animate-bounce mb-3" />
              <p className="text-xs text-on-surface-variant font-medium">Accediendo a Volta...</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitOtp(email, digits.join(""));
              }}
              className="space-y-6"
            >
              {!emailParam && (
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@negocio.com"
                    className="w-full px-3.5 py-2.5 bg-surface-container-high/40 border border-outline-variant/50 rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              )}

              {/* 6 Digit Inputs */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant text-center mb-3">
                  Código de 6 dígitos
                </label>
                <div className="flex justify-center items-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e.target.value ? e : e)}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold bg-surface-container-high/50 border border-outline-variant/60 rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading || digits.join("").length !== 6}
                className="w-full justify-center text-sm font-semibold py-3"
              >
                {loading ? "Verificando..." : "Confirmar Código"}
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>

              {/* Resend Cooldown */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || resending}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                  {cooldown > 0
                    ? `Reenviar código en (${cooldown}s)`
                    : "Reenviar nuevo código"}
                </button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center">Cargando...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
