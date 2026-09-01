"use client";

import { useState, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Check, Store, Scissors, Sparkles, HeartPulse, Flower2, MoreHorizontal } from "lucide-react";
import { signIn } from "next-auth/react";
import { Alert, Button } from "@/components/ui/volta-ui";
import { COLOR_PALETTES, getThemeInlineStyles } from "@/lib/theme";

/* ── Sector options ── */
const SECTORS = [
  {
    id: "peluqueria",
    label: "Peluquería",
    description: "Cortes, peinados, coloración y tratamientos capilares.",
    icon: Scissors,
  },
  {
    id: "estetica",
    label: "Centro de Estética",
    description: "Faciales, corporales, manicura, pedicura y depilación.",
    icon: Sparkles,
  },
  {
    id: "barberia",
    label: "Barbería Tradicional",
    description: "Afeitados a navaja, arreglo de barba y cortes masculinos.",
    icon: Store,
  },
  {
    id: "salud",
    label: "Salud y Fisioterapia",
    description: "Fisioterapia, osteopatía, quiromasaje y bienestar físico.",
    icon: HeartPulse,
  },
  {
    id: "bienestar",
    label: "Spa y Bienestar",
    description: "Masajes relajantes, circuitos termales y aromaterapia.",
    icon: Flower2,
  },
  {
    id: "otro",
    label: "Otro Sector",
    description: "Entrenamiento, consultoría o cualquier negocio con cita.",
    icon: MoreHorizontal,
  },
];

const TOTAL_STEPS = 4;

/* ── Step Indicator Bar ── */
const STEPS = [
  { num: 1, label: "Sector" },
  { num: 2, label: "Tu Negocio" },
  { num: 3, label: "Cuenta de Acceso" },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <nav aria-label="Progreso del registro" className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
      {STEPS.map((step, index) => {
        const isCompleted = currentStep > step.num;
        const isCurrent = currentStep === step.num;

        return (
          <div key={step.num} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-200 ${
                  isCompleted
                    ? "bg-primary text-on-primary shadow-xs"
                    : isCurrent
                    ? "bg-primary text-on-primary ring-4 ring-primary/20 shadow-xs"
                    : "bg-surface-container-high text-on-surface-variant/60"
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" /> : step.num}
              </span>
              <span
                className={`text-xs sm:text-sm font-medium transition-colors duration-200 hidden sm:inline ${
                  isCurrent
                    ? "text-on-surface font-bold"
                    : isCompleted
                    ? "text-primary font-semibold"
                    : "text-on-surface-variant/60"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connecting line */}
            {index < STEPS.length - 1 && (
              <div
                className={`h-[2px] w-4 sm:w-10 rounded-full transition-colors duration-200 ${
                  currentStep > step.num ? "bg-primary" : "bg-outline-variant/30"
                }`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

/* ── Main Registration Component ── */
export default function RegisterPage() {
  const router = useRouter();

  const defaultThemeStyles = getThemeInlineStyles(
    COLOR_PALETTES.CLINICAL_ELEGANCE,
    "1.0",
    "1.0"
  ) as React.CSSProperties;

  // Form State
  const [currentStep, setCurrentStep] = useState(1);
  const [sector, setSector] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Step validation check
  const validateStep = (step: number) => {
    setError("");
    if (step === 1) {
      if (!sector) {
        setError("Por favor, selecciona un sector para continuar.");
        return false;
      }
    } else if (step === 2) {
      if (!businessName.trim()) {
        setError("Por favor, introduce el nombre de tu negocio.");
        return false;
      }
      if (businessName.trim().length < 2) {
        setError("El nombre del negocio debe tener al menos 2 caracteres.");
        return false;
      }
      if (!phone.trim()) {
        setError("Por favor, introduce un teléfono de contacto.");
        return false;
      }
      if (phone.trim().length < 6) {
        setError("Por favor, introduce un teléfono de contacto válido.");
        return false;
      }
    } else if (step === 3) {
      if (!name.trim()) {
        setError("Por favor, introduce tu nombre completo.");
        return false;
      }
      if (!email.trim() || !email.includes("@")) {
        setError("Por favor, introduce un correo electrónico válido.");
        return false;
      }
      if (!password || password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return false;
      }
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden.");
        return false;
      }
    }
    return true;
  };

  const goNext = () => {
    if (validateStep(currentStep)) {
      setError("");
      setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
    }
  };

  const goBack = useCallback(() => {
    setError("");
    setCurrentStep((s) => Math.max(s - 1, 1));
  }, []);

  const selectedSector = SECTORS.find((s) => s.id === sector);

  // Submit registration at step 3
  const handleRegisterSubmit = async () => {
    if (!validateStep(3)) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/backend/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          businessName,
          phone,
          businessType: selectedSector?.label || sector,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al registrar la cuenta");
        setIsLoading(false);
        return;
      }

      // Auto sign-in
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      setIsLoading(false);
      setCurrentStep(4);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error de conexión al servidor";
      setError(message);
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      goNext();
    } else if (currentStep === 3) {
      handleRegisterSubmit();
    }
  };

  return (
    <div
      className="min-h-screen bg-surface py-6 sm:py-10 px-4 sm:px-8 flex flex-col justify-between select-none"
      style={defaultThemeStyles}
    >
      {/* Header Bar */}
      <div className="w-full max-w-3xl mx-auto flex items-center justify-between mb-4 sm:mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-high/60 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>
        <span className="text-xs text-on-surface-variant font-medium">
          Paso {Math.min(currentStep, 3)} de 3
        </span>
      </div>

      {/* Main Form Container */}
      <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col justify-center">
        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} />

        <form onSubmit={handleFormSubmit} className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 sm:p-8 shadow-xs">
          {/* Error Alert */}
          {error && (
            <Alert variant="error" className="py-2.5 px-4 text-xs sm:text-sm rounded-xl mb-5">
              {error}
            </Alert>
          )}

          {/* ═══════════════ STEP 1 — Sector ═══════════════ */}
          {currentStep === 1 && (
            <div className="animate-in fade-in duration-200">
              <div className="mb-6">
                <h1 className="font-display text-xl sm:text-2xl font-bold text-on-surface tracking-tight mb-1.5">
                  ¿A qué sector pertenece tu negocio?
                </h1>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  Personalizaremos tu experiencia en Volta basándonos en tu tipo de establecimiento.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {SECTORS.map((item) => {
                  const isSelected = sector === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSector(item.id);
                        setError("");
                      }}
                      className={`
                        relative text-left p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between
                        ${
                          isSelected
                            ? "border-primary bg-primary/[0.04] shadow-xs ring-2 ring-primary/20"
                            : "border-outline-variant/40 bg-surface-container-low hover:border-outline-variant hover:bg-surface-container-high/40"
                        }
                      `}
                    >
                      <div>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${
                          isSelected ? "bg-primary text-white" : "bg-surface-container-high text-on-surface-variant"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-sm text-on-surface mb-1">
                          {item.label}
                        </h3>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div
                        className={`
                          w-4 h-4 rounded-full border-2 mt-3 self-end flex items-center justify-center transition-all duration-200
                          ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-outline-variant/60 bg-transparent"
                          }
                        `}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════════ STEP 2 — Business Details ═══════════════ */}
          {currentStep === 2 && (
            <div className="animate-in fade-in duration-200">
              <div className="mb-6">
                <h1 className="font-display text-xl sm:text-2xl font-bold text-on-surface tracking-tight mb-1.5">
                  Detalles de tu establecimiento
                </h1>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  Información básica para configurar tu perfil comercial y recordatorios por WhatsApp.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="businessName"
                    className="text-xs font-semibold text-on-surface"
                  >
                    Nombre del negocio <span className="text-primary">*</span>
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => {
                      setBusinessName(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Ej. Salón Volta, Barbería Gran Vía..."
                    className="w-full px-3.5 py-2.5 bg-surface-container-high/40 text-sm text-on-surface border border-outline-variant/60 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder-outline-variant/50 shadow-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-xs font-semibold text-on-surface">
                    Teléfono de contacto / WhatsApp <span className="text-primary">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Ej. +34 600 000 000"
                    className="w-full px-3.5 py-2.5 bg-surface-container-high/40 text-sm text-on-surface border border-outline-variant/60 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder-outline-variant/50 shadow-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="address" className="text-xs font-semibold text-on-surface">
                    Dirección física (opcional)
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ej. Calle Gran Vía 28, Madrid"
                    className="w-full px-3.5 py-2.5 bg-surface-container-high/40 text-sm text-on-surface border border-outline-variant/60 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder-outline-variant/50 shadow-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="website" className="text-xs font-semibold text-on-surface">
                    Sitio web o redes sociales (opcional)
                  </label>
                  <input
                    id="website"
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="Ej. instagram.com/tubarberia"
                    className="w-full px-3.5 py-2.5 bg-surface-container-high/40 text-sm text-on-surface border border-outline-variant/60 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder-outline-variant/50 shadow-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ STEP 3 — Create Account ═══════════════ */}
          {currentStep === 3 && (
            <div className="animate-in fade-in duration-200">
              <div className="mb-6">
                <h1 className="font-display text-xl sm:text-2xl font-bold text-on-surface tracking-tight mb-1.5">
                  Crea tu cuenta de administrador
                </h1>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  Estos datos serán tus credenciales de acceso para entrar a la plataforma Volta.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-on-surface">
                    Tu nombre completo <span className="text-primary">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Ej. Laura García"
                    className="w-full px-3.5 py-2.5 bg-surface-container-high/40 text-sm text-on-surface border border-outline-variant/60 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder-outline-variant/50 shadow-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-on-surface">
                    Correo electrónico <span className="text-primary">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="ejemplo@negocio.com"
                    className="w-full px-3.5 py-2.5 bg-surface-container-high/40 text-sm text-on-surface border border-outline-variant/60 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder-outline-variant/50 shadow-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-xs font-semibold text-on-surface">
                    Contraseña <span className="text-primary">*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3.5 py-2.5 bg-surface-container-high/40 text-sm text-on-surface border border-outline-variant/60 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder-outline-variant/50 shadow-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="text-xs font-semibold text-on-surface"
                  >
                    Confirmar contraseña <span className="text-primary">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Repite la contraseña"
                    className="w-full px-3.5 py-2.5 bg-surface-container-high/40 text-sm text-on-surface border border-outline-variant/60 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder-outline-variant/50 shadow-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ STEP 4 — ¡Todo listo! ═══════════════ */}
          {currentStep === 4 && (
            <div className="animate-in fade-in duration-200">
              <div className="mb-6">
                <h1 className="font-display text-xl sm:text-2xl font-bold text-on-surface tracking-tight mb-1.5">
                  ¡Casi todo listo!
                </h1>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  Tu negocio ha sido creado. Hemos enviado un código de 6 dígitos a tu correo{" "}
                  <strong className="text-on-surface font-semibold">{email}</strong> para verificar tu cuenta y activar todas las funciones.
                </p>
              </div>

              <div className="w-full rounded-2xl border border-outline-variant/40 bg-surface-container-high/30 p-4 mb-6 space-y-3 shadow-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-outline-variant/20">
                  <span className="text-xs text-on-surface-variant font-medium">Sector</span>
                  <span className="text-xs font-bold text-on-surface">
                    {selectedSector?.label || "Peluquería y Estética"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-outline-variant/20">
                  <span className="text-xs text-on-surface-variant font-medium">Negocio</span>
                  <span className="text-xs font-bold text-on-surface">
                    {businessName || "Volta Studio"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-xs text-on-surface-variant font-medium">Usuario</span>
                  <span className="text-xs font-bold text-on-surface">
                    {email || "admin@negocio.com"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ Bottom Navigation Bar ═══════════════ */}
          <div className="flex items-center justify-between w-full pt-4 border-t border-outline-variant/30">
            {currentStep > 1 && currentStep < 4 ? (
              <Button
                type="button"
                onClick={goBack}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="px-4 py-2 rounded-xl text-xs font-semibold border-outline-variant/60 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 3 && (
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ml-auto"
              >
                <span>Siguiente</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}

            {currentStep === 3 && (
              <Button
                type="submit"
                disabled={isLoading}
                variant="primary"
                size="sm"
                className="px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ml-auto"
              >
                <span>{isLoading ? "Creando cuenta..." : "Crear Cuenta"}</span>
                {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
              </Button>
            )}

            {currentStep === 4 && (
              <Button
                type="button"
                onClick={() => {
                  window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;
                }}
                variant="primary"
                size="sm"
                className="px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ml-auto"
              >
                <span>Verificar Mi Correo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </form>

        {/* Footer Login Link */}
        {currentStep < 4 && (
          <div className="mt-4 text-center text-xs text-on-surface-variant">
            <span>¿Ya tienes una cuenta? </span>
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline transition-all"
            >
              Iniciar Sesión
            </Link>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <p className="text-[11px] text-on-surface-variant/50 text-center mt-6">
        Plataforma segura Volta · Registro en 3 sencillos pasos
      </p>
    </div>
  );
}
