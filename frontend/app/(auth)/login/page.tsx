"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Check, ArrowLeft } from "lucide-react";
import FaceIcon from "@/components/FaceIcon";
import { signIn } from "next-auth/react";
import { FieldGroup, Field, FieldLabel, Alert, Button, InputGroup } from "@/components/ui/volta-ui";
import { COLOR_PALETTES, applyThemeColors } from "@/lib/theme";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Enforce default Volta theme on login page
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      applyThemeColors(root, COLOR_PALETTES.CLINICAL_ELEGANCE);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/inicio",
      });

      if (result?.error) {
        setError("Correo electrónico o contraseña incorrectos");
        setIsLoading(false);
      } else {
        window.location.href = "/inicio";
      }
    } catch (err) {
      setError("Error de conexión al servidor de autenticación");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-surface flex flex-col justify-between p-4 sm:p-10 pt-16 sm:pt-10 select-none overflow-y-auto">
      {/* Top Left Back to Landing Button */}
      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-10 inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-body-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-high/60 transition-all duration-200 z-10"
      >
        <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>Volver al inicio</span>
      </Link>
      {/* Spacer to push content down on desktop */}
      <div className="hidden sm:block flex-1"></div>

      {/* Centered Login Container */}
      <div className="w-full max-w-[440px] mx-auto p-6 sm:p-10 flex flex-col items-center">
        {/* Brand Icon Logo */}
        <div className="flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-2xl mb-4">
          <FaceIcon className="w-10 h-10" />
        </div>

        {/* Title */}
        <h2 className="font-display text-headline-lg text-on-surface font-bold mb-8 text-center">
          Iniciar Sesión
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full">
          <FieldGroup className="gap-5">
            {error && (
              <Alert variant="error" className="py-2.5 px-4 text-body-md rounded-lg">
                {error}
              </Alert>
            )}

            {/* Email Input */}
            <Field>
              <InputGroup>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  className="block w-full px-4 py-3 bg-surface-container-lowest text-body-md text-on-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-outline-variant/60 shadow-sm"
                />
              </InputGroup>
            </Field>

            {/* Password Input */}
            <Field>
              <InputGroup>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="block w-full pl-4 pr-12 py-3 bg-surface-container-lowest text-body-md text-on-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-outline-variant/60 shadow-sm"
                />
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-on-surface-variant hover:text-on-surface transition-colors shadow-none p-0 w-8 h-8 rounded-full justify-center"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeOff data-icon="eye-off" className="w-5 h-5" />
                  ) : (
                    <Eye data-icon="eye" className="w-5 h-5" />
                  )}
                </Button>
              </InputGroup>
            </Field>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
              className="w-full py-3 px-6 mt-2 font-semibold shadow-md rounded-lg"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </FieldGroup>
        </form>

        {/* Forgot Password Link */}
        <div className="mt-4 w-full text-center">
          <a
            href="#"
            className="font-label-md text-label-md text-primary hover:text-primary-container font-semibold transition-colors hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Register Link Area */}
        <div className="mt-8 w-full flex flex-col items-center gap-3">
          <span className="text-body-md text-on-surface-variant font-medium text-center">
            ¿No tienes una cuenta de Volta?
          </span>
          <Link href="/register" className="w-full">
            <Button
              variant="outline"
              size="md"
              className="w-full py-3 border-outline-variant bg-white text-on-surface font-semibold hover:bg-surface-container-low rounded-lg shadow-sm"
            >
              Crear Cuenta Nueva
            </Button>
          </Link>
        </div>
      </div>

      {/* Spacer to push content up on desktop */}
      <div className="hidden sm:block flex-1"></div>

      {/* Disclaimer Footer */}
      <div className="text-center text-[0.65rem] text-on-surface-variant/60 leading-relaxed max-w-sm mx-auto mt-6">
        Este sitio está protegido por reCAPTCHA y se aplican la{" "}
        <a href="#" className="underline hover:text-primary transition-colors">
          Política de Privacidad
        </a>{" "}
        y los{" "}
        <a href="#" className="underline hover:text-primary transition-colors">
          Términos de Servicio
        </a>{" "}
        de Google.
      </div>
    </div>
  );
}
