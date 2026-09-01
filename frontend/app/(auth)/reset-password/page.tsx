"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { Button, Alert, Card } from "@/components/ui/volta-ui";
import { defaultThemeStyles } from "@/lib/theme";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isMatch = password && password === confirmPassword;

  const isFormValid = isMinLength && hasLetter && hasNumber && isMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !email) {
      setError("El enlace de restablecimiento es inválido o faltan parámetros.");
      return;
    }

    if (!isFormValid) {
      setError("Por favor, cumple todos los requisitos de seguridad de la contraseña.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await apiClient.auth.resetPassword({
        email,
        token,
        newPassword: password,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login?reset=success");
        }, 2000);
      }
    } catch {
      setError("Error al conectar con el servidor.");
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
            {success ? <ShieldCheck className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-center text-on-surface mb-2 tracking-tight">
            {success ? "¡Contraseña Actualizada!" : "Nueva Contraseña"}
          </h1>

          <p className="text-xs sm:text-sm text-center text-on-surface-variant/80 mb-6 leading-relaxed">
            {success ? (
              "Tu contraseña se ha restablecido correctamente. Redirigiéndote al inicio de sesión..."
            ) : (
              <>
                Define una nueva contraseña segura para tu cuenta{" "}
                <span className="font-semibold text-on-surface">{email}</span>.
              </>
            )}
          </p>

          {error && (
            <Alert variant="error" className="mb-6">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </Alert>
          )}

          {(!token || !email) && !success && (
            <Alert variant="error" className="mb-6">
              <AlertCircle className="w-4 h-4" />
              <span>
                Este enlace de restablecimiento no es válido. Por favor, solicita uno nuevo desde la página de recuperación.
              </span>
            </Alert>
          )}

          {success ? (
            <div className="py-6 flex flex-col items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-primary animate-bounce mb-3" />
              <p className="text-xs text-on-surface-variant font-medium">Redirigiendo a tu cuenta...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-surface-container-high/40 border border-outline-variant/50 rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Confirmar Contraseña
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full px-3.5 py-2.5 bg-surface-container-high/40 border border-outline-variant/50 rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-3 bg-surface-container-high/30 rounded-xl space-y-1.5 text-[11px] text-on-surface-variant">
                <div className={`flex items-center gap-1.5 ${isMinLength ? "text-primary font-semibold" : ""}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isMinLength ? "bg-primary" : "bg-on-surface-variant/40"}`} />
                  <span>Mínimo 8 caracteres</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLetter && hasNumber ? "text-primary font-semibold" : ""}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasLetter && hasNumber ? "bg-primary" : "bg-on-surface-variant/40"}`} />
                  <span>Contiene letras y números</span>
                </div>
                <div className={`flex items-center gap-1.5 ${isMatch && password ? "text-primary font-semibold" : ""}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isMatch && password ? "bg-primary" : "bg-on-surface-variant/40"}`} />
                  <span>Las contraseñas coinciden</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading || !isFormValid || !token || !email}
                className="w-full justify-center text-sm font-semibold py-3 mt-2"
              >
                {loading ? "Actualizando..." : "Restablecer Contraseña"}
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center">Cargando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
