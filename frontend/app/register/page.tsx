"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { signIn } from "next-auth/react";
import { Alert, Button } from "@/components/ui/volta-ui";

/* ── Sector options matching Screenshot 1 ── */
const SECTORS = [
  {
    id: "peluqueria",
    label: "Peluquería",
    description: "Cortes, peinados, coloración y tratamientos capilares para todos los públicos.",
  },
  {
    id: "estetica",
    label: "Centro de Estética",
    description: "Tratamientos faciales, corporales, depilación, manicura y pedicura avanzada.",
  },
  {
    id: "barberia",
    label: "Barbería",
    description: "Corte masculino clásico y moderno, arreglo de barba y afeitado tradicional.",
  },
  {
    id: "spa",
    label: "Spa & Wellness",
    description: "Masajes, circuitos termales, aromaterapia y relajación integral profunda.",
  },
  {
    id: "clinica",
    label: "Clínica / Fisioterapia",
    description: "Rehabilitación, salud, bienestar y consultas especializadas.",
  },
  {
    id: "fitness",
    label: "Personal Trainer / Fitness",
    description: "Entrenamiento personal, preparación física y seguimiento deportivo.",
  },
];

const TOTAL_STEPS = 4;

/* ── Top Step Indicator matching Screenshots 1, 2, 3, 4 ── */
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: "Sector" },
    { num: 2, label: "Detalles" },
    { num: 3, label: "Cuenta" },
    { num: 4, label: "Listo" },
  ];

  return (
    <div className="flex items-center justify-start gap-3 sm:gap-6 mb-10 text-body-sm">
      {steps.map((step, idx) => {
        const isCompleted = currentStep > step.num;
        const isActive = currentStep === step.num;

        return (
          <div key={step.num} className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <div
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${
                    isCompleted
                      ? "bg-primary text-white"
                      : isActive
                      ? "bg-primary text-white ring-4 ring-primary/20"
                      : "bg-surface-container-high text-on-surface-variant/60"
                  }
                `}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.num}
              </div>
              <span
                className={`font-medium transition-colors duration-200 ${
                  isActive || isCompleted
                    ? "text-primary font-semibold"
                    : "text-on-surface-variant/60"
                }`}
              >
                {step.label}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={`h-[2px] w-8 sm:w-14 rounded-full transition-colors duration-300 ${
                  currentStep > step.num ? "bg-primary" : "bg-outline-variant/30"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main Registration Component ── */
export default function RegisterPage() {
  const router = useRouter();

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
      if (confirmPassword && password !== confirmPassword) {
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
    } catch (err) {
      setError("Error de conexión al servidor");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface select-none py-12 px-6 md:px-16 lg:px-24 max-w-4xl mx-auto flex flex-col justify-between">
      <div>
        {/* Step Indicator Bar */}
        <StepIndicator currentStep={currentStep} />

        {/* ═══════════════ STEP 1 — Sector ═══════════════ */}
        {currentStep === 1 && (
          <div className="animate-in fade-in duration-300">
            {/* Header with top margin from progress bar */}
            <div className="mt-8 sm:mt-12 mb-8">
              <h1 className="font-display text-[2.75rem] sm:text-[3.5rem] lg:text-[3.75rem] font-bold text-on-surface leading-[1.08] mb-3 tracking-tight">
                ¿A qué sector pertenece tu negocio?
              </h1>
              <p className="text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
                Personalizaremos tu experiencia en Volta basándonos en tu tipo de establecimiento. Podrás cambiar esto más adelante en la configuración.
              </p>
            </div>

            {error && (
              <Alert variant="error" className="py-2.5 px-4 text-body-md rounded-xl mb-6">
                {error}
              </Alert>
            )}

            {/* Grid of sector cards — NO icons as requested */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {SECTORS.map((item) => {
                const isSelected = sector === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSector(item.id);
                      setError("");
                    }}
                    className={`
                      relative text-left p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between
                      ${
                        isSelected
                          ? "border-primary bg-primary/[0.03] shadow-sm"
                          : "border-outline-variant/40 bg-surface-container-lowest hover:border-outline-variant hover:bg-surface-container-low"
                      }
                    `}
                  >
                    <div>
                      <h3 className="font-display text-title-md font-bold text-on-surface mb-1.5">
                        {item.label}
                      </h3>
                      <p className="text-body-sm text-on-surface-variant/80 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="mt-4 flex justify-end">
                        <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════ STEP 2 — Detalles del Negocio ═══════════════ */}
        {currentStep === 2 && (
          <div className="animate-in fade-in duration-300">
            {/* Header with top margin from progress bar */}
            <div className="mt-8 sm:mt-12 mb-8">
              <h1 className="font-display text-[2.75rem] sm:text-[3.5rem] lg:text-[3.75rem] font-bold text-on-surface leading-[1.08] mb-3 tracking-tight">
                Detalles del Negocio
              </h1>
              <p className="text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
                Ingresa la información pública de tu negocio para que los clientes puedan encontrarte.
              </p>
            </div>

            {error && (
              <Alert variant="error" className="py-2.5 px-4 text-body-md rounded-xl mb-6">
                {error}
              </Alert>
            )}

            {/* Form Fields — NO icons inside inputs as requested */}
            <div className="flex flex-col gap-6 sm:gap-8 mb-10">
              {/* Nombre del Negocio */}
              <div className="flex flex-col gap-2">
                <label htmlFor="businessName" className="text-body-sm font-semibold text-on-surface">
                  Nombre del Negocio <span className="text-primary">*</span>
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
                  placeholder="Ej. Studio 54 Hair & Beauty"
                  className="w-full px-4 py-3.5 bg-surface-container-lowest text-body-md text-on-surface border border-outline-variant/60 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder-outline-variant/50 shadow-sm"
                />
              </div>

              {/* Dirección */}
              <div className="flex flex-col gap-2">
                <label htmlFor="address" className="text-body-sm font-semibold text-on-surface">
                  Dirección
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle Principal 123, Ciudad"
                  className="w-full px-4 py-3.5 bg-surface-container-lowest text-body-md text-on-surface border border-outline-variant/60 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder-outline-variant/50 shadow-sm"
                />
              </div>

              {/* 2 Columns: Phone & Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="text-body-sm font-semibold text-on-surface">
                    Teléfono de Contacto <span className="text-primary">*</span>
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
                    placeholder="+34 600 000 000"
                    className="w-full px-4 py-3.5 bg-surface-container-lowest text-body-md text-on-surface border border-outline-variant/60 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder-outline-variant/50 shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="website" className="text-body-sm font-semibold text-on-surface">
                    Sitio Web (Opcional)
                  </label>
                  <input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="www.misalon.com"
                    className="w-full px-4 py-3.5 bg-surface-container-lowest text-body-md text-on-surface border border-outline-variant/60 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder-outline-variant/50 shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ STEP 3 — Crear Cuenta / Detalles del Usuario ═══════════════ */}
        {currentStep === 3 && (
          <div className="animate-in fade-in duration-300">
            {/* Header with top margin from progress bar */}
            <div className="mt-8 sm:mt-12 mb-8">
              <h1 className="font-display text-[2.75rem] sm:text-[3.5rem] lg:text-[3.75rem] font-bold text-on-surface leading-[1.08] mb-3 tracking-tight">
                Crear Cuenta
              </h1>
              <p className="text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
                Por favor, completa la información del usuario para continuar con el registro.
              </p>
            </div>

            {error && (
              <Alert variant="error" className="py-2.5 px-4 text-body-md rounded-xl mb-6">
                {error}
              </Alert>
            )}

            {/* Form Fields — NO icons inside inputs as requested */}
            <div className="flex flex-col gap-6 sm:gap-8 mb-10">
              {/* Nombre Completo */}
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-body-sm font-semibold text-on-surface">
                  Nombre Completo <span className="text-primary">*</span>
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
                  placeholder="Ej. Ana García"
                  className="w-full px-4 py-3.5 bg-surface-container-lowest text-body-md text-on-surface border border-outline-variant/60 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder-outline-variant/50 shadow-sm"
                />
              </div>

              {/* Correo Electrónico */}
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-body-sm font-semibold text-on-surface">
                  Correo Electrónico <span className="text-primary">*</span>
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
                  placeholder="ana@ejemplo.com"
                  className="w-full px-4 py-3.5 bg-surface-container-lowest text-body-md text-on-surface border border-outline-variant/60 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder-outline-variant/50 shadow-sm"
                />
              </div>

              {/* 2 Columns: Contraseña & Confirmar Contraseña */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className="text-body-sm font-semibold text-on-surface">
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
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 bg-surface-container-lowest text-body-md text-on-surface border border-outline-variant/60 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder-outline-variant/50 shadow-sm"
                  />
                  <span className="text-[0.7rem] text-on-surface-variant/60">
                    Mínimo 6 caracteres
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="confirmPassword" className="text-body-sm font-semibold text-on-surface">
                    Confirmar Contraseña <span className="text-primary">*</span>
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
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 bg-surface-container-lowest text-body-md text-on-surface border border-outline-variant/60 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder-outline-variant/50 shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ STEP 4 — ¡Todo listo! ═══════════════ */}
        {currentStep === 4 && (
          <div className="animate-in fade-in duration-300">
            {/* Header with top margin from progress bar */}
            <div className="mt-8 sm:mt-12 mb-8">
              <h1 className="font-display text-[2.75rem] sm:text-[3.5rem] lg:text-[3.75rem] font-bold text-on-surface leading-[1.08] mb-3 tracking-tight">
                ¡Todo listo!
              </h1>
              <p className="text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
                Tu negocio ha sido configurado correctamente. Ya puedes empezar a gestionar tus citas, clientes y servicios desde tu nuevo panel de control.
              </p>
            </div>

            {/* Summary Box matching Screenshot 4 */}
            <div className="w-full rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 mb-8 space-y-4 shadow-sm">
              <div className="flex justify-between items-center py-2 border-b border-outline-variant/20">
                <span className="text-body-md text-on-surface-variant">Sector</span>
                <span className="text-body-md font-bold text-on-surface">
                  {selectedSector?.label || "Peluquería y Estética"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-outline-variant/20">
                <span className="text-body-md text-on-surface-variant">Negocio</span>
                <span className="text-body-md font-bold text-on-surface">
                  {businessName || "Volta Studio"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-body-md text-on-surface-variant">Usuario</span>
                <span className="text-body-md font-bold text-on-surface">
                  {email || "admin@negocio.com"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ Bottom Navigation Bar (No horizontal rule line) ═══════════════ */}
        <div className="flex items-center justify-between w-full mt-16 sm:mt-24 pt-4">
          {/* Back button */}
          {currentStep > 1 && currentStep < 4 ? (
            <Button
              type="button"
              onClick={goBack}
              disabled={isLoading}
              variant="outline"
              className="px-6 py-3 rounded-xl font-semibold border-outline-variant/60 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </Button>
          ) : (
            <div />
          )}

          {/* Next / Submit / Dashboard button */}
          {currentStep < 3 && (
            <Button
              type="button"
              onClick={goNext}
              variant="primary"
              className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 cursor-pointer"
            >
              Siguiente
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}

          {currentStep === 3 && (
            <Button
              type="button"
              disabled={isLoading}
              onClick={handleRegisterSubmit}
              variant="primary"
              className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? "Creando cuenta..." : "Siguiente"}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </Button>
          )}

          {currentStep === 4 && (
            <Button
              type="button"
              onClick={() => {
                window.location.href = "/inicio";
              }}
              variant="primary"
              className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 cursor-pointer"
            >
              Ir al Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Footer note matching Screenshot 4 */}
        {currentStep === 4 && (
          <p className="text-body-xs text-on-surface-variant/50 mt-6 text-left">
            Sistema seguro verificado · Volta Platform
          </p>
        )}

        {/* Link to login if on steps 1-3 */}
        {currentStep < 4 && (
          <div className="mt-8 text-left text-body-md text-on-surface-variant">
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
    </div>
  );
}

