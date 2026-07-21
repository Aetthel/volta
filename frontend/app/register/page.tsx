"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Building2, User, Mail, Phone, Lock, Sparkles } from "lucide-react";
import FaceIcon from "@/components/FaceIcon";
import { signIn } from "next-auth/react";
import { FieldGroup, Field, FieldLabel, Alert, Button, InputGroup } from "@/components/ui/volta-ui";

const BUSINESS_TYPES = [
  "Peluquería / Barbería",
  "Estética / Belleza / Uñas",
  "Clínica / Fisioterapia / Salud",
  "Odontología",
  "Personal Trainer / Fitness",
  "Consultoría / Servicios Profesionales",
];

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          businessType,
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
        // Fallback to login page if auto sign-in fails
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
    <div className="min-h-screen bg-surface flex flex-col justify-between p-6 sm:p-10 select-none overflow-y-auto">
      {/* Spacer */}
      <div className="hidden sm:block flex-1"></div>

      {/* Centered Container */}
      <div className="w-full max-w-[480px] mx-auto p-6 sm:p-8 flex flex-col items-center">
        {/* Brand Icon Logo */}
        <div className="flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-2xl mb-4">
          <FaceIcon className="w-10 h-10" />
        </div>

        {/* Title */}
        <h2 className="font-display text-headline-lg text-on-surface font-bold mb-2 text-center">
          Crear Cuenta de Negocio
        </h2>

        {/* Subtitle Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-label-md rounded-full font-semibold mb-6">
          <Sparkles className="w-4 h-4" />
          <span>10 Días de Prueba Gratis (Plan Pro 25€)</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full">
          <FieldGroup className="gap-4">
            {error && (
              <Alert variant="error" className="py-2.5 px-4 text-body-md rounded-lg">
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success" className="py-2.5 px-4 text-body-md rounded-lg">
                ¡Cuenta creada correctamente! Iniciando sesión...
              </Alert>
            )}

            {/* Owner Name */}
            <Field>
              <FieldLabel htmlFor="name" className="text-body-sm font-semibold text-on-surface-variant mb-1">
                Nombre del Responsable
              </FieldLabel>
              <InputGroup>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. María García"
                  className="block w-full px-4 py-3 bg-surface-container-lowest text-body-md text-on-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-outline-variant/60 shadow-sm"
                />
              </InputGroup>
            </Field>

            {/* Email Input */}
            <Field>
              <FieldLabel htmlFor="email" className="text-body-sm font-semibold text-on-surface-variant mb-1">
                Correo Electrónico
              </FieldLabel>
              <InputGroup>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@negocio.com"
                  className="block w-full px-4 py-3 bg-surface-container-lowest text-body-md text-on-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-outline-variant/60 shadow-sm"
                />
              </InputGroup>
            </Field>

            {/* Business Name */}
            <Field>
              <FieldLabel htmlFor="businessName" className="text-body-sm font-semibold text-on-surface-variant mb-1">
                Nombre del Negocio / Centro
              </FieldLabel>
              <InputGroup>
                <input
                  id="businessName"
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ej. Clínica Volta / Peluquería Studio"
                  className="block w-full px-4 py-3 bg-surface-container-lowest text-body-md text-on-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-outline-variant/60 shadow-sm"
                />
              </InputGroup>
            </Field>

            {/* Phone */}
            <Field>
              <FieldLabel htmlFor="phone" className="text-body-sm font-semibold text-on-surface-variant mb-1">
                Teléfono de Contacto
              </FieldLabel>
              <InputGroup>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34 600 000 000"
                  className="block w-full px-4 py-3 bg-surface-container-lowest text-body-md text-on-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-outline-variant/60 shadow-sm"
                />
              </InputGroup>
            </Field>

            {/* Business Type Dropdown */}
            <Field>
              <FieldLabel htmlFor="businessType" className="text-body-sm font-semibold text-on-surface-variant mb-1">
                Tipo / Sector de Negocio
              </FieldLabel>
              <select
                id="businessType"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="block w-full px-4 py-3 bg-surface-container-lowest text-body-md text-on-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-sm cursor-pointer"
              >
                {BUSINESS_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>

            {/* Password Input */}
            <Field>
              <FieldLabel htmlFor="password" className="text-body-sm font-semibold text-on-surface-variant mb-1">
                Contraseña
              </FieldLabel>
              <InputGroup className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="block w-full pl-4 pr-12 py-3 bg-surface-container-lowest text-body-md text-on-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-outline-variant/60 shadow-sm"
                />
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-on-surface-variant hover:text-on-surface transition-colors shadow-none p-0 w-8 h-8 rounded-full justify-center"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
              </InputGroup>
            </Field>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || success}
              variant="primary"
              className="w-full py-3 px-6 mt-3 font-semibold shadow-md rounded-lg"
            >
              {isLoading ? "Creando cuenta de prueba..." : "Empezar 10 Días Gratis"}
            </Button>
          </FieldGroup>
        </form>

        {/* Login Link Area */}
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
      <div className="hidden sm:block flex-1"></div>
    </div>
  );
}
