"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Scissors,
  Heart,
  Stethoscope,
  SmilePlus,
  Dumbbell,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import FaceIcon from "@/components/FaceIcon";
import { signIn } from "next-auth/react";
import { Alert, Button } from "@/components/ui/volta-ui";

/* ── Business types with icons ── */
const BUSINESS_TYPES = [
  {
    id: "peluqueria",
    label: "Peluquería / Barbería",
    description: "Cortes, peinados, coloración",
    icon: Scissors,
  },
  {
    id: "estetica",
    label: "Estética / Belleza / Uñas",
    description: "Tratamientos faciales, manicura",
    icon: Heart,
  },
  {
    id: "clinica",
    label: "Clínica / Fisioterapia",
    description: "Rehabilitación, salud, bienestar",
    icon: Stethoscope,
  },
  {
    id: "odontologia",
    label: "Odontología",
    description: "Clínica dental, ortodoncia",
    icon: SmilePlus,
  },
  {
    id: "fitness",
    label: "Personal Trainer / Fitness",
    description: "Entrenamiento personal, gym",
    icon: Dumbbell,
  },
  {
    id: "consultoria",
    label: "Consultoría / Servicios",
    description: "Asesoría, servicios profesionales",
    icon: Briefcase,
  },
];

const TOTAL_STEPS = 4;

/* ── Step indicator component ── */
function StepIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const labels = ["Sector", "Negocio", "Cuenta", "Confirmar"];

  return (
    <div className="flex items-center w-full max-w-md mx-auto mb-8">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isCompleted = currentStep > stepNum;
        const isActive = currentStep === stepNum;

        return (
          <div key={stepNum} className="flex items-center flex-1 last:flex-none">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-label-md font-bold
                  transition-all duration-400 ease-out
                  ${isCompleted
                    ? "bg-primary text-on-primary scale-90"
                    : isActive
                    ? "bg-primary text-on-primary ring-4 ring-primary/20 scale-105"
                    : "bg-surface-container-high text-on-surface-variant/50"
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`
                  text-[0.65rem] font-semibold tracking-wide uppercase transition-colors duration-300
                  ${isActive ? "text-primary" : isCompleted ? "text-on-surface-variant" : "text-on-surface-variant/40"}
                `}
              >
                {labels[i]}
              </span>
            </div>

            {/* Connector line */}
            {i < totalSteps - 1 && (
              <div className="flex-1 mx-2 mt-[-1.25rem]">
                <div className="h-[2px] bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: isCompleted ? "100%" : isActive ? "50%" : "0%",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Step wrapper with animation ── */
function StepContent({
  isVisible,
  direction,
  children,
}: {
  isVisible: boolean;
  direction: "forward" | "backward";
  children: React.ReactNode;
}) {
  if (!isVisible) return null;

  return (
    <div
      className="w-full animate-in fade-in duration-300"
      style={{
        animation: `stepSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Main page ── */
export default function RegisterPage() {
  const router = useRouter();

  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  // Form data
  const [businessType, setBusinessType] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const goNext = useCallback(() => {
    setDirection("forward");
    setError("");
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, []);

  const goBack = useCallback(() => {
    setDirection("backward");
    setError("");
    setCurrentStep((s) => Math.max(s - 1, 1));
  }, []);

  // Validation per step
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return businessType !== "";
      case 2:
        return businessName.trim().length >= 2 && phone.trim().length >= 6;
      case 3:
        return (
          name.trim().length >= 2 &&
          email.includes("@") &&
          password.length >= 6
        );
      default:
        return true;
    }
  }, [currentStep, businessType, businessName, phone, name, email, password]);

  const selectedBusiness = BUSINESS_TYPES.find((t) => t.id === businessType);

  const handleSubmit = async () => {
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
          businessType: selectedBusiness?.label || businessType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al registrar la cuenta");
        setIsLoading(false);
        return;
      }

      setSuccess(true);

      // Auto sign-in
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/inicio",
      });

      if (signInResult?.error) {
        router.push("/login?registered=true");
      } else {
        router.push(signInResult?.url || "/inicio");
      }
    } catch (err) {
      setError("Error de conexión al servidor");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between p-4 sm:p-10 select-none overflow-y-auto">
      {/* Spacer */}
      <div className="hidden sm:block flex-1" />

      {/* Main container */}
      <div className="w-full max-w-[560px] mx-auto flex flex-col items-center">
        {/* Brand + title */}
        <div className="flex items-center justify-center w-14 h-14 bg-primary/10 text-primary rounded-2xl mb-3">
          <FaceIcon className="w-9 h-9" />
        </div>

        <h1 className="font-display text-headline-lg text-on-surface font-bold mb-1 text-center">
          Crear Cuenta
        </h1>

        {/* Trial badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-label-md rounded-full font-semibold mb-6">
          <Sparkles className="w-4 h-4" />
          <span>10 Días de Prueba Gratis — Plan Pro 25€</span>
        </div>

        {/* Step indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        {/* ═══════════════ STEP 1 — Business Type ═══════════════ */}
        <StepContent isVisible={currentStep === 1} direction={direction}>
          <div className="text-center mb-5">
            <h2 className="text-title-lg font-semibold text-on-surface mb-1">
              ¿Cuál es tu sector?
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Selecciona el tipo de negocio que mejor te represente
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {BUSINESS_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = businessType === type.id;

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setBusinessType(type.id)}
                  className={`
                    group relative flex items-center gap-3.5 p-4 rounded-xl border-2 text-left cursor-pointer
                    transition-all duration-200 ease-out
                    ${isSelected
                      ? "border-primary bg-primary/[0.06] shadow-sm"
                      : "border-outline-variant/60 bg-surface-container-lowest hover:border-outline hover:bg-surface-container-low"
                    }
                  `}
                >
                  {/* Icon */}
                  <div
                    className={`
                      flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200
                      ${isSelected
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-high text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-body-md font-semibold truncate transition-colors ${
                        isSelected ? "text-primary" : "text-on-surface"
                      }`}
                    >
                      {type.label}
                    </div>
                    <div className="text-body-sm text-on-surface-variant/70 truncate">
                      {type.description}
                    </div>
                  </div>

                  {/* Check indicator */}
                  {isSelected && (
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            disabled={!canProceed()}
            onClick={goNext}
            variant="primary"
            className="w-full py-3 px-6 font-semibold shadow-md rounded-lg"
          >
            Continuar
            <ArrowRight className="w-4 h-4" />
          </Button>
        </StepContent>

        {/* ═══════════════ STEP 2 — Business Details ═══════════════ */}
        <StepContent isVisible={currentStep === 2} direction={direction}>
          <div className="text-center mb-5">
            <h2 className="text-title-lg font-semibold text-on-surface mb-1">
              Datos de tu negocio
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Cuéntanos sobre{" "}
              {selectedBusiness
                ? `tu ${selectedBusiness.label.split("/")[0].trim().toLowerCase()}`
                : "tu negocio"}
            </p>
          </div>

          <div className="flex flex-col gap-4 mb-6 w-full">
            {/* Business Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="businessName"
                className="text-body-sm font-semibold text-on-surface-variant"
              >
                Nombre del Negocio / Centro
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-on-surface-variant/50" />
                <input
                  id="businessName"
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ej. Clínica Volta / Peluquería Studio"
                  className="block w-full pl-11 pr-4 py-3 bg-surface-container-lowest text-body-md text-on-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-outline-variant/60 shadow-sm"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="phone"
                className="text-body-sm font-semibold text-on-surface-variant"
              >
                Teléfono de Contacto
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-on-surface-variant/50" />
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34 600 000 000"
                  className="block w-full pl-11 pr-4 py-3 bg-surface-container-lowest text-body-md text-on-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-outline-variant/60 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              onClick={goBack}
              variant="outline"
              className="py-3 px-5 font-semibold rounded-lg border-outline-variant"
            >
              <ArrowLeft className="w-4 h-4" />
              Atrás
            </Button>
            <Button
              type="button"
              disabled={!canProceed()}
              onClick={goNext}
              variant="primary"
              className="flex-1 py-3 px-6 font-semibold shadow-md rounded-lg"
            >
              Continuar
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </StepContent>

        {/* ═══════════════ STEP 3 — Account ═══════════════ */}
        <StepContent isVisible={currentStep === 3} direction={direction}>
          <div className="text-center mb-5">
            <h2 className="text-title-lg font-semibold text-on-surface mb-1">
              Crea tu cuenta
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Estos serán tus datos de acceso a Volta
            </p>
          </div>

          {error && (
            <Alert
              variant="error"
              className="py-2.5 px-4 text-body-md rounded-lg mb-4"
            >
              {error}
            </Alert>
          )}

          <div className="flex flex-col gap-4 mb-6 w-full">
            {/* Owner name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name"
                className="text-body-sm font-semibold text-on-surface-variant"
              >
                Tu Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-on-surface-variant/50" />
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. María García"
                  className="block w-full pl-11 pr-4 py-3 bg-surface-container-lowest text-body-md text-on-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-outline-variant/60 shadow-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-body-sm font-semibold text-on-surface-variant"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-on-surface-variant/50" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@negocio.com"
                  className="block w-full pl-11 pr-4 py-3 bg-surface-container-lowest text-body-md text-on-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-outline-variant/60 shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-body-sm font-semibold text-on-surface-variant"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-on-surface-variant/50" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="block w-full pl-11 pr-12 py-3 bg-surface-container-lowest text-body-md text-on-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-outline-variant/60 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer p-1 rounded-full"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-[18px] h-[18px]" />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
              {/* Password strength hint */}
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          password.length >= level * 3
                            ? password.length >= 10
                              ? "bg-primary"
                              : password.length >= 6
                              ? "bg-yellow-500"
                              : "bg-error"
                            : "bg-surface-container-high"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[0.65rem] font-medium text-on-surface-variant/60">
                    {password.length < 6
                      ? "Débil"
                      : password.length < 10
                      ? "Aceptable"
                      : "Fuerte"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              onClick={goBack}
              variant="outline"
              className="py-3 px-5 font-semibold rounded-lg border-outline-variant"
            >
              <ArrowLeft className="w-4 h-4" />
              Atrás
            </Button>
            <Button
              type="button"
              disabled={!canProceed()}
              onClick={goNext}
              variant="primary"
              className="flex-1 py-3 px-6 font-semibold shadow-md rounded-lg"
            >
              Revisar y Confirmar
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </StepContent>

        {/* ═══════════════ STEP 4 — Confirm ═══════════════ */}
        <StepContent isVisible={currentStep === 4} direction={direction}>
          <div className="text-center mb-5">
            <h2 className="text-title-lg font-semibold text-on-surface mb-1">
              Todo listo — Revisa tus datos
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Confirma que todo está correcto antes de crear tu cuenta
            </p>
          </div>

          {error && (
            <Alert
              variant="error"
              className="py-2.5 px-4 text-body-md rounded-lg mb-4"
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              variant="success"
              className="py-2.5 px-4 text-body-md rounded-lg mb-4"
            >
              ¡Cuenta creada correctamente! Iniciando sesión...
            </Alert>
          )}

          {/* Summary card */}
          <div className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-lowest overflow-hidden mb-6">
            {/* Section: Business */}
            <div className="p-4 border-b border-outline-variant/40">
              <div className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant/50 mb-2.5">
                Tu Negocio
              </div>
              <div className="flex items-center gap-3">
                {selectedBusiness && (
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <selectedBusiness.icon className="w-[18px] h-[18px]" />
                  </div>
                )}
                <div>
                  <div className="text-body-md font-semibold text-on-surface">
                    {businessName}
                  </div>
                  <div className="text-body-sm text-on-surface-variant">
                    {selectedBusiness?.label} · {phone}
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Account */}
            <div className="p-4 border-b border-outline-variant/40">
              <div className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant/50 mb-2.5">
                Tu Cuenta
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-body-md text-on-surface">
                  <User className="w-4 h-4 text-on-surface-variant/50 flex-shrink-0" />
                  {name}
                </div>
                <div className="flex items-center gap-2 text-body-md text-on-surface">
                  <Mail className="w-4 h-4 text-on-surface-variant/50 flex-shrink-0" />
                  {email}
                </div>
              </div>
            </div>

            {/* Section: Plan */}
            <div className="p-4 bg-primary/[0.04]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-body-md font-semibold text-primary">
                    Plan Pro — 10 días gratis
                  </span>
                </div>
                <span className="text-label-md font-bold text-primary">
                  25€/mes
                </span>
              </div>
              <p className="text-body-sm text-on-surface-variant mt-1 ml-6">
                Sin tarjeta de crédito · Cancela cuando quieras
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              onClick={goBack}
              disabled={isLoading || success}
              variant="outline"
              className="py-3 px-5 font-semibold rounded-lg border-outline-variant"
            >
              <ArrowLeft className="w-4 h-4" />
              Atrás
            </Button>
            <Button
              type="button"
              disabled={isLoading || success}
              onClick={handleSubmit}
              variant="primary"
              className="flex-1 py-3 px-6 font-semibold shadow-md rounded-lg"
            >
              {isLoading
                ? "Creando cuenta..."
                : success
                ? "¡Cuenta creada!"
                : "Empezar 10 Días Gratis"}
              {!isLoading && !success && <Sparkles className="w-4 h-4" />}
            </Button>
          </div>
        </StepContent>

        {/* Login link */}
        <div className="mt-6 w-full flex items-center justify-center gap-2 text-body-md text-on-surface-variant">
          <span>¿Ya tienes una cuenta?</span>
          <Link
            href="/login"
            className="font-semibold text-primary hover:text-primary-container transition-colors hover:underline"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>

      {/* Spacer */}
      <div className="hidden sm:block flex-1" />

      {/* Step slide-in animation */}
      <style jsx global>{`
        @keyframes stepSlideIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
