"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Key,
  Mail,
  Camera,
  Save,
  Loader2,
  ShieldCheck,
  Lock,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessProfile, ToastState } from "@/types/settings";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  FloatingInput,
  Button,
  Badge,
  FieldGroup,
  Field,
  FieldLabel,
} from "@/components/ui/volta-ui";

const DEFAULT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD4Ec4Zci7RmiQqA_-qTa0tdRpm9Wl1AVZQsYRoqmBCYgu-SrdSAZoK38if-6y3v-fI_rbpjvuXSX1DFFje1tbtmTQt0JTNiO8-dR8-QBSIhw6Ob2_GaRhoHHIUj_ssbabDqhqu3DNXv-QcDPpcQZCs0T6AirCFHbqrAQLOZ9Y-0DTH68gpUFZxyRQx4q2-DKgTBUU6cSPfG6LVM1L9xd3VaAr1PPApcF4Xlu4kLCaLYAbwyfkOOpjFQ234c3SqedBa-PqJ_pywDw";

interface ProfileSectionProps {
  profile: BusinessProfile;
  setProfile: React.Dispatch<React.SetStateAction<BusinessProfile>>;
  setToast: (toast: ToastState) => void;
}

export default function ProfileSection({ profile, setProfile, setToast }: ProfileSectionProps) {
  const { data: session, update } = useSession();
  const role = session?.user?.role || "EMPLEADO";

  // Personal Info Form State
  const [personalForm, setPersonalForm] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  });
  const [savingInfo, setSavingInfo] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // User database record
  const [userProfileData, setUserProfileData] = useState<{
    id?: string;
    createdAt?: string;
  } | null>(null);

  const workerPhotoInputRef = useRef<HTMLInputElement>(null);

  // Initialize form when session loads
  useEffect(() => {
    if (session?.user) {
      setPersonalForm({
        name: session.user.name || "",
        email: session.user.email || "",
      });
    }
  }, [session]);

  // Fetch full user record from backend
  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/backend/users`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const current = data.find((u: { id?: string }) => u.id === session.user.id);
            if (current) setUserProfileData(current);
          }
        })
        .catch(() => {});
    }
  }, [session?.user?.id]);

  const formatProfileDate = (dateString: string) => {
    if (!dateString) return "Fecha no disponible";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Avatar upload handler
  const handleWorkerPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setToast({ show: true, text: "La imagen no debe superar los 5MB" });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoData = reader.result as string;
        setProfile((prev) => ({ ...prev, workerPhoto: photoData }));
        if (typeof window !== "undefined") {
          localStorage.setItem("stylist_worker_photo", photoData);
          window.dispatchEvent(new Event("stylist_worker_photo_changed"));
        }
        setToast({ show: true, text: "Foto de perfil actualizada correctamente" });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Avatar delete handler
  const handleRemovePhoto = () => {
    setProfile((prev) => ({ ...prev, workerPhoto: DEFAULT_AVATAR }));
    if (typeof window !== "undefined") {
      localStorage.removeItem("stylist_worker_photo");
      window.dispatchEvent(new Event("stylist_worker_photo_changed"));
    }
    setToast({ show: true, text: "Foto de perfil eliminada" });
    setTimeout(() => setToast({ show: false, text: "" }), 3000);
  };

  // Save Personal Info
  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    if (!personalForm.name.trim() || !personalForm.email.trim()) {
      setToast({ show: true, text: "Por favor, completa el nombre y el correo electrónico" });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
      return;
    }

    setSavingInfo(true);
    try {
      const res = await fetch(`/api/backend/users/${session.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: personalForm.name.trim(),
          email: personalForm.email.trim().toLowerCase(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar la información.");

      if (update) {
        await update({
          ...session,
          user: { ...session?.user, name: data.name, email: data.email },
        });
      }

      setToast({ show: true, text: "¡Información personal guardada con éxito!" });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    } catch (err: any) {
      setToast({ show: true, text: err.message || "Error al guardar los cambios." });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    } finally {
      setSavingInfo(false);
    }
  };

  // Save Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    if (!passwordForm.newPassword) {
      setToast({ show: true, text: "Introduce una nueva contraseña" });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setToast({ show: true, text: "La contraseña debe tener al menos 6 caracteres" });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({ show: true, text: "Las contraseñas no coinciden" });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch(`/api/backend/users/${session.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar la contraseña.");

      setPasswordForm({ newPassword: "", confirmPassword: "" });
      setToast({ show: true, text: "¡Contraseña actualizada correctamente!" });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    } catch (err: any) {
      setToast({ show: true, text: err.message || "Error al actualizar la contraseña." });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    } finally {
      setSavingPassword(false);
    }
  };

  // Password strength helper
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: "Débil", color: "bg-error" };
    if (score === 2) return { score: 2, label: "Aceptable", color: "bg-amber-500" };
    if (score === 3) return { score: 3, label: "Buena", color: "bg-primary" };
    return { score: 4, label: "Muy segura", color: "bg-emerald-500" };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);
  const hasCustomPhoto = profile.workerPhoto && profile.workerPhoto !== DEFAULT_AVATAR;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200 mt-2">
      {/* 1. Top Identity Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar with instant upload trigger */}
            <div className="relative group/avatar shrink-0">
              <div
                onClick={() => workerPhotoInputRef.current?.click()}
                className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-outline-variant/60 hover:border-primary bg-surface-container-high shadow-xs flex items-center justify-center cursor-pointer transition-all duration-200"
                title="Haz clic para cambiar foto de perfil"
              >
                {hasCustomPhoto ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={profile.workerPhoto}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-2xl">
                    {personalForm.name ? personalForm.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-2xl">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>

              <input
                type="file"
                ref={workerPhotoInputRef}
                onChange={handleWorkerPhotoChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Name, Role & Metadata */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-title-lg text-xl font-bold text-on-surface">
                  {personalForm.name || session?.user?.name || "Usuario de Volta"}
                </h2>
                <Badge
                  variant="default"
                  className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                >
                  {role === "ADMIN"
                    ? "Administrador Global"
                    : role === "JEFE"
                      ? "Jefe de Tienda"
                      : "Especialista / Empleado"}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-on-surface-variant/80 flex-wrap">
                <span className="font-medium">
                  ID: #GS-{userProfileData?.id?.slice(-3).toUpperCase() || "001"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-on-surface-variant/60" />
                  Miembro desde {formatProfileDate(userProfileData?.createdAt || "")}
                </span>
              </div>
            </div>
          </div>

          {/* Avatar Actions */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => workerPhotoInputRef.current?.click()}
              className="text-xs font-semibold gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Cambiar foto</span>
            </Button>
            {hasCustomPhoto && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemovePhoto}
                className="text-xs font-semibold text-error hover:text-error hover:bg-error/10 gap-1.5"
                title="Eliminar foto de perfil"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 2. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Información Personal (7 cols) */}
        <Card className="lg:col-span-7 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold text-on-surface flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span>Información Personal</span>
            </CardTitle>
            <CardDescription>
              Actualiza tu nombre público y el correo electrónico con el que accedes a la plataforma.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSavePersonalInfo}>
            <CardContent className="flex flex-col gap-5 pt-2">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="userName">Nombre Completo</FieldLabel>
                  <FloatingInput
                    id="userName"
                    label="Nombre y Apellidos"
                    type="text"
                    required
                    value={personalForm.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPersonalForm({ ...personalForm, name: e.target.value })
                    }
                    icon={User}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="userEmail">Correo Electrónico</FieldLabel>
                  <FloatingInput
                    id="userEmail"
                    label="correo@empresa.com"
                    type="email"
                    required
                    value={personalForm.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPersonalForm({ ...personalForm, email: e.target.value })
                    }
                    icon={Mail}
                  />
                </Field>
              </FieldGroup>
            </CardContent>

            <CardFooter className="border-t border-outline-variant/40 pt-4 flex justify-end">
              <Button
                type="submit"
                disabled={savingInfo}
                variant="primary"
                size="md"
                className="flex items-center gap-2 font-medium"
              >
                {savingInfo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Columna Derecha: Seguridad y Contraseña (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-on-surface flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <span>Seguridad y Contraseña</span>
              </CardTitle>
              <CardDescription>
                Cambia tu contraseña de acceso para mantener protegida tu cuenta.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSavePassword}>
              <CardContent className="flex flex-col gap-4 pt-2">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="newPassword">Nueva Contraseña</FieldLabel>
                    <div className="relative">
                      <FloatingInput
                        id="newPassword"
                        label="Mínimo 6 caracteres"
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                        }
                        icon={Key}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors p-1"
                        tabIndex={-1}
                        aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {passwordForm.newPassword && (
                      <div className="flex flex-col gap-1 mt-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold">
                          <span className="text-on-surface-variant/70">Seguridad:</span>
                          <span
                            className={
                              passwordStrength.score >= 3
                                ? "text-primary font-bold"
                                : passwordStrength.score === 2
                                  ? "text-amber-600 font-bold"
                                  : "text-error font-bold"
                            }
                          >
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden flex gap-1">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={cn(
                                "h-full flex-1 rounded-full transition-all duration-300",
                                step <= passwordStrength.score
                                  ? passwordStrength.color
                                  : "bg-transparent"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirmar Contraseña</FieldLabel>
                    <FloatingInput
                      id="confirmPassword"
                      label="Repite la nueva contraseña"
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      icon={Key}
                    />
                  </Field>
                </FieldGroup>
              </CardContent>

              <CardFooter className="border-t border-outline-variant/40 pt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={
                    savingPassword ||
                    !passwordForm.newPassword ||
                    passwordForm.newPassword !== passwordForm.confirmPassword
                  }
                  variant="outline"
                  size="md"
                  className="flex items-center gap-2 font-medium"
                >
                  {savingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Actualizando...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Actualizar Contraseña</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Account Status Pill Card */}
          <Card className="p-5 bg-surface-container-low border border-outline-variant/50">
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5 text-xs">
                <span className="font-semibold text-on-surface text-sm">
                  Cuenta y Acceso Protegido
                </span>
                <p className="text-on-surface-variant/80 leading-relaxed">
                  Tus datos personales y credenciales de acceso están cifrados y asegurados bajo la normativa de protección de datos.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
