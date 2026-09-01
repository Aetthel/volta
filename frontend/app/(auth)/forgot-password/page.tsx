"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { Button, Alert, Card } from "@/components/ui/volta-ui";
import { defaultThemeStyles } from "@/lib/theme";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Por favor, introduce tu correo electrónico.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await apiClient.auth.forgotPassword({ email: email.trim() });
      if (res.error) {
        setError(res.error);
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
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
            {submitted ? <CheckCircle2 className="w-7 h-7" /> : <KeyRound className="w-7 h-7" />}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-center text-on-surface mb-2 tracking-tight">
            {submitted ? "Revisa tu Correo" : "¿Has olvidado tu contraseña?"}
          </h1>

          <p className="text-xs sm:text-sm text-center text-on-surface-variant/80 mb-6 leading-relaxed">
            {submitted ? (
              <>
                Hemos enviado un enlace de recuperación a{" "}
                <span className="font-semibold text-on-surface">{email}</span>. Sigue las instrucciones del correo para restablecer tu clave.
              </>
            ) : (
              "Introduce el correo electrónico asociado a tu cuenta y te enviaremos un enlace seguro para restablecer tu contraseña."
            )}
          </p>

          {error && (
            <Alert variant="error" className="mb-6">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </Alert>
          )}

          {submitted ? (
            <div className="space-y-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setSubmitted(false)}
                className="w-full justify-center text-sm font-semibold py-3"
              >
                Reenviar o usar otro correo
              </Button>
              <div className="text-center">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Regresar al login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-on-surface-variant/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@negocio.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-surface-container-high/40 border border-outline-variant/50 rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading || !email.trim()}
                className="w-full justify-center text-sm font-semibold py-3"
              >
                {loading ? "Enviando enlace..." : "Enviar Enlace de Recuperación"}
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
