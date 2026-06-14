"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Check } from "lucide-react";
import { signIn } from "next-auth/react";
import {
  FieldGroup,
  Field,
  FieldLabel,
  Alert
} from "@/components/ui/volta-ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const callbackUrl = email === "admin@volta.com" ? "/admin" : "/inicio";
      
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Correo electrónico o contraseña incorrectos");
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError("Error de conexión al servidor de autenticación");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col sm:flex-row bg-surface overflow-hidden">
      
      {/* Left Column: Welcome & Branding Banner (Hidden on mobile) */}
      <div className="hidden sm:flex flex-col w-1/2 h-full bg-surface-container-low p-10 lg:p-14 select-none overflow-y-auto">
        {/* Top welcome message */}
        <div className="font-display text-display-lg font-medium text-primary tracking-tight">
          ¡Bienvenido!
        </div>

        {/* Content Group (Illustration + Card) centered */}
        <div className="flex-1 flex flex-col justify-center items-center gap-8 my-auto">
          {/* Vector Illustration representing productivity */}
          <div className="w-full flex justify-center">
            <img
              src="/person-laptop.svg"
              alt="Persona trabajando con ordenador portátil"
              className="w-full max-w-[500px] lg:max-w-[580px] h-auto object-contain select-none"
              draggable={false}
            />
          </div>

          {/* Features Checklist Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/60 p-6 rounded-2xl w-full max-w-md shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex flex-col gap-3.5">
            <div className="flex items-center gap-2.5 text-primary font-semibold text-label-md uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              Panel de Gestión Volta
            </div>
            <ul className="flex flex-col gap-2.5 text-body-md text-on-surface-variant leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="text-primary font-bold">✓</span>
                <span>Agenda clínica inteligente y control de citas interactivo.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary font-bold">✓</span>
                <span>Mensajería automática e integración con WhatsApp Gateway.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary font-bold">✓</span>
                <span>Fichas de clientes y gestión de consentimientos LOPD.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Column: Clean Login Form */}
      <div className="w-full sm:w-1/2 h-full bg-surface-container-lowest flex flex-col justify-center items-center p-8 sm:p-10 lg:p-16 overflow-y-auto relative">
        {/* Top-Right Register Link */}
        <div className="absolute top-6 right-8 md:top-8 md:right-12 text-body-sm text-on-surface-variant font-medium">
          ¿Aún no eres miembro?{" "}
          <a href="#" className="text-primary hover:text-primary-container hover:underline font-semibold transition-all">
            Regístrate ahora
          </a>
        </div>
        <div className="max-w-sm w-full py-8 flex flex-col gap-8">
          
          {/* Header */}
          <div>
            <h2 className="font-display text-headline-lg text-on-surface font-semibold">
              Iniciar Sesión
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full">
            <FieldGroup className="gap-6">
              {error && (
                <Alert variant="error" className="py-3 px-4 text-body-md rounded-xl">
                  {error}
                </Alert>
              )}

              {/* Email Input */}
              <Field>
                <FieldLabel className="font-label-sm text-label-sm text-on-surface-variant/80 tracking-wider uppercase mb-1.5">
                  Correo Electrónico o Usuario
                </FieldLabel>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="refero.john.doe@gmail.com"
                    className="block w-full px-5 py-4 bg-surface-container-lowest text-body-lg text-on-surface border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-outline-variant/60 shadow-sm"
                  />
                </div>
              </Field>

              {/* Password Input */}
              <Field>
                <div className="flex justify-between items-center mb-1.5">
                  <FieldLabel className="font-label-sm text-label-sm text-on-surface-variant/80 tracking-wider uppercase">
                    Contraseña
                  </FieldLabel>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••••••"
                    className="block w-full pl-5 pr-12 py-4 bg-surface-container-lowest text-body-lg text-on-surface border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-outline-variant/60 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none cursor-pointer"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </Field>

              {/* Keep me logged in */}
              <div className="flex items-center py-1">
                <label className="flex items-center gap-3 cursor-pointer select-none group/checkbox">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                      rememberMe 
                        ? "bg-primary border-primary text-on-primary scale-105" 
                        : "border-outline-variant group-hover/checkbox:border-primary bg-transparent"
                    }`}>
                      {rememberMe && <Check className="w-3.5 h-3.5 stroke-[3.5px]" />}
                    </div>
                  </div>
                  <span className="font-body-md text-body-md text-on-surface-variant group-hover/checkbox:text-on-surface transition-colors">
                    Mantener la sesión iniciada
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4.5 px-6 rounded-xl bg-primary text-on-primary hover:bg-primary-container disabled:opacity-50 focus:outline-none transition-all active:scale-[0.99] font-title-md text-title-md font-semibold cursor-pointer shadow-sm text-center mt-2"
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión ahora"}
              </button>
            </FieldGroup>
          </form>

          {/* Forgot Password Link */}
          <div className="flex justify-end -mt-2">
            <a 
              href="#" 
              className="font-label-md text-label-md text-primary hover:text-primary-container font-semibold transition-colors hover:underline decoration-1"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <span className="text-label-md font-semibold text-on-surface-variant/70 tracking-wider">
              O iniciar sesión con
            </span>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex justify-center items-center py-3.5 px-4 border border-outline-variant rounded-xl hover:bg-surface-container font-label-lg text-label-lg text-on-surface font-semibold transition-all active:scale-[0.98] cursor-pointer gap-2.5 bg-surface-container-lowest"
            >
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex justify-center items-center py-3.5 px-4 border border-outline-variant rounded-xl hover:bg-surface-container font-label-lg text-label-lg text-on-surface font-semibold transition-all active:scale-[0.98] cursor-pointer gap-2.5 bg-surface-container-lowest"
            >
              <svg className="h-5 w-5 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.51-.64.73-1.2 1.87-1.05 2.98 1.1.09 2.22-.57 2.98-1.43z"></path>
              </svg>
              Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
