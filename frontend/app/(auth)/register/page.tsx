"use client";

import { useState, useCallback, FormEvent, Fragment, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Store,
  Scissors,
  Sparkles,
  HeartPulse,
  Flower2,
  MoreHorizontal,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Building,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";
import { Alert, Button, Field, FieldLabel, FieldError, Input } from "@/components/ui/volta-ui";
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
    <nav aria-label="Progreso del registro" className="w-full flex items-center justify-between gap-3 sm:gap-6 mb-8 sm:mb-10">
      {STEPS.map((step, index) => {
        const isCompleted = currentStep > step.num;
        const isCurrent = currentStep === step.num;

        return (
          <Fragment key={step.num}>
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <span
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-200 ${
                  isCompleted
                    ? "bg-primary text-on-primary shadow-xs"
                    : isCurrent
                    ? "bg-primary text-on-primary ring-4 ring-primary/20 shadow-xs"
                    : "bg-surface-container-high text-on-surface-variant/60"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : step.num}
              </span>
              <span
                className={`text-xs sm:text-sm font-medium transition-colors duration-200 ${
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

            {/* Connecting line that stretches to fill full width */}
            {index < STEPS.length - 1 && (
              <div
                className={`h-[2px] flex-1 rounded-full transition-colors duration-200 min-w-4 ${
                  currentStep > step.num ? "bg-primary" : "bg-outline-variant/30"
                }`}
              />
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}

/* ── Password Strength Calculator ── */
type PasswordStrength = "empty" | "weak" | "medium" | "strong";

function getPasswordStrength(pwd: string): {
  strength: PasswordStrength;
  label: string;
  score: number;
  color: string;
  bgSegments: string[];
} {
  if (!pwd) {
    return {
      strength: "empty",
      label: "",
      score: 0,
      color: "text-on-surface-variant/40",
      bgSegments: ["bg-outline-variant/30", "bg-outline-variant/30", "bg-outline-variant/30"],
    };
  }

  let points = 0;
  if (pwd.length >= 6) points++;
  if (pwd.length >= 8) points++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) points++;
  if (/[0-9]/.test(pwd)) points++;
  if (/[^A-Za-z0-9]/.test(pwd)) points++;

  if (pwd.length < 6 || points <= 2) {
    return {
      strength: "weak",
      label: "Poco segura",
      score: 1,
      color: "text-amber-500 dark:text-amber-400",
      bgSegments: ["bg-amber-500", "bg-outline-variant/30", "bg-outline-variant/30"],
    };
  }

  if (points <= 3) {
    return {
      strength: "medium",
      label: "Segura",
      score: 2,
      color: "text-emerald-500 dark:text-emerald-400",
      bgSegments: ["bg-emerald-500", "bg-emerald-500", "bg-outline-variant/30"],
    };
  }

  return {
    strength: "strong",
    label: "Muy segura",
    score: 3,
    color: "text-primary",
    bgSegments: ["bg-primary", "bg-primary", "bg-primary"],
  };
}

interface FieldErrors {
  sector?: string;
  businessName?: string;
  phone?: string;
  address?: string;
  website?: string;
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
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

  // UI & Validation state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(true);

  const pwdStrength = useMemo(() => getPasswordStrength(password), [password]);

  const validateField = useCallback(
    (fieldName: string, value: string, currentValues?: { password?: string }) => {
      let errorMsg = "";

      switch (fieldName) {
        case "sector":
          if (!value) errorMsg = "Por favor, selecciona un sector para continuar.";
          break;
        case "businessName":
          if (!value.trim()) {
            errorMsg = "El nombre del negocio es obligatorio.";
          } else if (value.trim().length < 2) {
            errorMsg = "El nombre debe tener al menos 2 caracteres.";
          }
          break;
        case "phone":
          if (!value.trim()) {
            errorMsg = "El teléfono de contacto es obligatorio.";
          } else if (!/^[+0-9\s-]{6,20}$/.test(value.trim())) {
            errorMsg = "Introduce un número de teléfono válido (mínimo 6 dígitos).";
          }
          break;
        case "name":
          if (!value.trim()) {
            errorMsg = "Tu nombre completo es obligatorio.";
          } else if (value.trim().length < 2) {
            errorMsg = "El nombre debe tener al menos 2 caracteres.";
          }
          break;
        case "email":
          if (!value.trim()) {
            errorMsg = "El correo electrónico es obligatorio.";
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
            errorMsg = "Introduce un correo electrónico válido.";
          }
          break;
        case "password":
          if (!value) {
            errorMsg = "La contraseña es obligatoria.";
          } else if (value.length < 6) {
            errorMsg = "La contraseña debe tener al menos 6 caracteres.";
          }
          break;
        case "confirmPassword": {
          const pwdToCompare = currentValues?.password ?? password;
          if (!value) {
            errorMsg = "Por favor, confirma tu contraseña.";
          } else if (value !== pwdToCompare) {
            errorMsg = "Las contraseñas no coinciden.";
          }
          break;
        }
      }

      setFieldErrors((prev) => ({ ...prev, [fieldName]: errorMsg }));
      return !errorMsg;
    },
    [password]
  );

  const handleBlur = (fieldName: string, value: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, value);
  };

  // Step validation check
  const validateStep = (step: number) => {
    setError("");
    const errors: FieldErrors = {};

    if (step === 1) {
      if (!sector) {
        errors.sector = "Por favor, selecciona un sector para continuar.";
      }
    } else if (step === 2) {
      if (!businessName.trim()) {
        errors.businessName = "El nombre del negocio es obligatorio.";
      } else if (businessName.trim().length < 2) {
        errors.businessName = "El nombre debe tener al menos 2 caracteres.";
      }

      if (!phone.trim()) {
        errors.phone = "El teléfono de contacto es obligatorio.";
      } else if (!/^[+0-9\s-]{6,20}$/.test(phone.trim())) {
        errors.phone = "Introduce un número de teléfono válido (mínimo 6 dígitos).";
      }
    } else if (step === 3) {
      if (!name.trim()) {
        errors.name = "Tu nombre completo es obligatorio.";
      } else if (name.trim().length < 2) {
        errors.name = "El nombre debe tener al menos 2 caracteres.";
      }

      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.email = "Introduce un correo electrónico válido.";
      }

      if (!password || password.length < 6) {
        errors.password = "La contraseña debe tener al menos 6 caracteres.";
      }

      if (!confirmPassword || confirmPassword !== password) {
        errors.confirmPassword = "Las contraseñas no coinciden.";
      }
    }

    setFieldErrors((prev) => ({ ...prev, ...errors }));

    if (step === 1) setTouched((prev) => ({ ...prev, sector: true }));
    if (step === 2) setTouched((prev) => ({ ...prev, businessName: true, phone: true }));
    if (step === 3) setTouched((prev) => ({ ...prev, name: true, email: true, password: true, confirmPassword: true }));

    const isValid = Object.keys(errors).length === 0;
    if (!isValid) {
      setError("Por favor, revisa los campos requeridos antes de continuar.");
    }
    return isValid;
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

      setEmailSent(data?.emailSent !== false);
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

        <form onSubmit={handleFormSubmit} className="w-full">
          {/* Error Alert */}
          {error && (
            <Alert variant="error" className="py-2.5 px-4 text-xs sm:text-sm rounded-xl mb-6">
              {error}
            </Alert>
          )}

          {/* ═══════════════ STEP 1 — Sector ═══════════════ */}
          {currentStep === 1 && (
            <div className="animate-in fade-in duration-200">
              <div className="mb-8 sm:mb-10">
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-on-surface tracking-tight mb-2 sm:mb-3">
                  ¿A qué sector pertenece tu negocio?
                </h1>
                <p className="text-base sm:text-lg text-on-surface-variant font-normal leading-relaxed">
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
                        setFieldErrors((prev) => ({ ...prev, sector: undefined }));
                        if (error) setError("");
                      }}
                      className={`
                        relative text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between
                        ${
                          isSelected
                            ? "border-primary bg-primary/[0.04] shadow-xs ring-1 ring-primary/40"
                            : "border-outline-variant/40 hover:border-outline-variant hover:bg-surface-container-high/20"
                        }
                      `}
                    >
                      <div>
                        <div className="mb-3">
                          <Icon
                            className={`w-5 h-5 transition-colors duration-200 ${
                              isSelected ? "text-primary" : "text-on-surface-variant/70"
                            }`}
                          />
                        </div>
                        <h3 className="font-medium text-base text-on-surface mb-1">
                          {item.label}
                        </h3>
                        <p className="text-xs text-on-surface-variant/80 leading-relaxed font-normal">
                          {item.description}
                        </p>
                      </div>

                      <div
                        className={`
                          w-4 h-4 rounded-full border mt-3 self-end flex items-center justify-center transition-all duration-200
                          ${
                            isSelected
                              ? "border-primary bg-primary text-on-primary"
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

              {touched.sector && fieldErrors.sector && (
                <div className="mb-6">
                  <FieldError>{fieldErrors.sector}</FieldError>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ STEP 2 — Business Details ═══════════════ */}
          {currentStep === 2 && (
            <div className="animate-in fade-in duration-200">
              <div className="mb-8 sm:mb-10">
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-on-surface tracking-tight mb-2 sm:mb-3">
                  Detalles de tu establecimiento
                </h1>
                <p className="text-base sm:text-lg text-on-surface-variant font-normal leading-relaxed">
                  Información básica para configurar tu perfil comercial y recordatorios por WhatsApp.
                </p>
              </div>

              <div className="flex flex-col gap-5 w-full mb-6">
                <Field data-invalid={touched.businessName && !!fieldErrors.businessName}>
                  <FieldLabel htmlFor="businessName">
                    Nombre del negocio <span className="text-error">*</span>
                  </FieldLabel>
                  <Input
                    id="businessName"
                    type="text"
                    required
                    aria-invalid={touched.businessName && !!fieldErrors.businessName}
                    value={businessName}
                    onChange={(e) => {
                      setBusinessName(e.target.value);
                      if (touched.businessName) validateField("businessName", e.target.value);
                      if (error) setError("");
                    }}
                    onBlur={(e) => handleBlur("businessName", e.target.value)}
                    placeholder="Ej. Salón Volta, Barbería Gran Vía..."
                    icon={Building}
                  />
                  {touched.businessName && fieldErrors.businessName && (
                    <FieldError>{fieldErrors.businessName}</FieldError>
                  )}
                </Field>

                <Field data-invalid={touched.phone && !!fieldErrors.phone}>
                  <FieldLabel htmlFor="phone">
                    Teléfono de contacto / WhatsApp <span className="text-error">*</span>
                  </FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    aria-invalid={touched.phone && !!fieldErrors.phone}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (touched.phone) validateField("phone", e.target.value);
                      if (error) setError("");
                    }}
                    onBlur={(e) => handleBlur("phone", e.target.value)}
                    placeholder="Ej. +34 600 000 000"
                    icon={Phone}
                  />
                  {touched.phone && fieldErrors.phone && (
                    <FieldError>{fieldErrors.phone}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="address">
                    Dirección física (opcional)
                  </FieldLabel>
                  <Input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ej. Calle Gran Vía 28, Madrid"
                    icon={MapPin}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="website">
                    Sitio web o redes sociales (opcional)
                  </FieldLabel>
                  <Input
                    id="website"
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="Ej. instagram.com/tubarberia"
                    icon={Globe}
                  />
                </Field>
              </div>
            </div>
          )}

          {/* ═══════════════ STEP 3 — Create Account ═══════════════ */}
          {currentStep === 3 && (
            <div className="animate-in fade-in duration-200">
              <div className="mb-8 sm:mb-10">
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-on-surface tracking-tight mb-2 sm:mb-3">
                  Crea tu cuenta de administrador
                </h1>
                <p className="text-base sm:text-lg text-on-surface-variant font-normal leading-relaxed">
                  Estos datos serán tus credenciales de acceso para entrar a la plataforma Volta.
                </p>
              </div>

              <div className="flex flex-col gap-5 w-full mb-6">
                <Field data-invalid={touched.name && !!fieldErrors.name}>
                  <FieldLabel htmlFor="name">
                    Tu nombre completo <span className="text-error">*</span>
                  </FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    required
                    aria-invalid={touched.name && !!fieldErrors.name}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (touched.name) validateField("name", e.target.value);
                      if (error) setError("");
                    }}
                    onBlur={(e) => handleBlur("name", e.target.value)}
                    placeholder="Ej. Laura García"
                    icon={User}
                  />
                  {touched.name && fieldErrors.name && (
                    <FieldError>{fieldErrors.name}</FieldError>
                  )}
                </Field>

                <Field data-invalid={touched.email && !!fieldErrors.email}>
                  <FieldLabel htmlFor="email">
                    Correo electrónico <span className="text-error">*</span>
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    required
                    aria-invalid={touched.email && !!fieldErrors.email}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched.email) validateField("email", e.target.value);
                      if (error) setError("");
                    }}
                    onBlur={(e) => handleBlur("email", e.target.value)}
                    placeholder="ejemplo@negocio.com"
                    icon={Mail}
                  />
                  {touched.email && fieldErrors.email && (
                    <FieldError>{fieldErrors.email}</FieldError>
                  )}
                </Field>

                <Field data-invalid={touched.password && !!fieldErrors.password}>
                  <FieldLabel htmlFor="password">
                    Contraseña <span className="text-error">*</span>
                  </FieldLabel>
                  <div className="relative w-full">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      aria-invalid={touched.password && !!fieldErrors.password}
                      value={password}
                      onChange={(e) => {
                        const newPwd = e.target.value;
                        setPassword(newPwd);
                        if (touched.password) validateField("password", newPwd);
                        if (touched.confirmPassword && confirmPassword) {
                          validateField("confirmPassword", confirmPassword, { password: newPwd });
                        }
                        if (error) setError("");
                      }}
                      onBlur={(e) => handleBlur("password", e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      icon={Lock}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors p-1 z-20 cursor-pointer"
                      tabIndex={-1}
                      aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {password && (
                    <div className="flex flex-col gap-1.5 mt-1.5 animate-in fade-in duration-150">
                      <div className="flex items-center gap-1.5 w-full">
                        <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${pwdStrength.bgSegments[0]}`} />
                        <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${pwdStrength.bgSegments[1]}`} />
                        <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${pwdStrength.bgSegments[2]}`} />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-on-surface-variant/70 text-[11px]">Seguridad de la contraseña</span>
                        <span className={`font-semibold text-xs transition-colors duration-200 ${pwdStrength.color}`}>
                          {pwdStrength.label}
                        </span>
                      </div>
                    </div>
                  )}

                  {touched.password && fieldErrors.password && (
                    <FieldError>{fieldErrors.password}</FieldError>
                  )}
                </Field>

                <Field data-invalid={touched.confirmPassword && !!fieldErrors.confirmPassword}>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirmar contraseña <span className="text-error">*</span>
                  </FieldLabel>
                  <div className="relative w-full">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      aria-invalid={touched.confirmPassword && !!fieldErrors.confirmPassword}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (touched.confirmPassword) validateField("confirmPassword", e.target.value);
                        if (error) setError("");
                      }}
                      onBlur={(e) => handleBlur("confirmPassword", e.target.value)}
                      placeholder="Repite la contraseña"
                      icon={Lock}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors p-1 z-20 cursor-pointer"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {touched.confirmPassword && fieldErrors.confirmPassword && (
                    <FieldError>{fieldErrors.confirmPassword}</FieldError>
                  )}
                </Field>
              </div>
            </div>
          )}

          {/* ═══════════════ STEP 4 — ¡Todo listo! ═══════════════ */}
          {currentStep === 4 && (
            <div className="animate-in fade-in duration-200">
              <div className="mb-8 sm:mb-10">
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-on-surface tracking-tight mb-2 sm:mb-3">
                  ¡Casi todo listo!
                </h1>
                <p className="text-base sm:text-lg text-on-surface-variant font-normal leading-relaxed">
                  Tu negocio ha sido creado. Hemos enviado un código de 6 dígitos a tu correo{" "}
                  <strong className="text-on-surface font-semibold">{email}</strong>. Necesitas
                  introducirlo para activar la cuenta y entrar al panel.
                </p>
              </div>

              {!emailSent && (
                <Alert variant="error" className="py-2.5 px-4 text-xs sm:text-sm rounded-xl mb-5">
                  No hemos podido enviar el correo con el código. Tu cuenta está creada: entra en la
                  pantalla de verificación y pulsa &laquo;Reenviar nuevo código&raquo;.
                </Alert>
              )}

              <div className="w-full rounded-2xl border border-outline-variant/30 p-4 mb-6 space-y-3">
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
          <div className="flex items-center justify-between w-full pt-8">
            {currentStep > 1 && currentStep < 4 ? (
              <Button
                type="button"
                onClick={goBack}
                disabled={isLoading}
                variant="outline"
                size="md"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border-outline-variant/60 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 3 && (
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 ml-auto"
              >
                <span>Siguiente</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}

            {currentStep === 3 && (
              <Button
                type="submit"
                disabled={isLoading}
                variant="primary"
                size="md"
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 ml-auto"
              >
                <span>{isLoading ? "Creando cuenta..." : "Crear Cuenta"}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </Button>
            )}

            {currentStep === 4 && (
              <Button
                type="button"
                onClick={() => {
                  window.location.href = `/verify-email?email=${encodeURIComponent(email)}&sent=1`;
                }}
                variant="primary"
                size="md"
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 ml-auto"
              >
                <span>Verificar Mi Correo</span>
                <ArrowRight className="w-4 h-4" />
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
