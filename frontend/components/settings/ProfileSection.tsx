"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Calendar,
  QrCode,
  Copy,
  Check,
  Smartphone,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessProfile, ToastState } from "@/types/settings";
import { apiClient } from "@/lib/apiClient";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Button,
  Badge,
  FieldGroup,
  Field,
  FieldLabel,
  Avatar,
  Alert,
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
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // 2FA State & Modal
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [is2faModalOpen, setIs2faModalOpen] = useState(false);
  const [isDisable2faModalOpen, setIsDisable2faModalOpen] = useState(false);
  const [twoFactorSetupData, setTwoFactorSetupData] = useState<{
    secret: string;
    qrCode: string;
    otpAuthUrl: string;
  } | null>(null);
  const [twoFactorCodeInput, setTwoFactorCodeInput] = useState("");
  const [disablePasswordInput, setDisablePasswordInput] = useState("");
  const [twoFactorBackupCodes, setTwoFactorBackupCodes] = useState<string[]>([]);
  const [loading2fa, setLoading2fa] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);

  // User database record
  const [userProfileData, setUserProfileData] = useState<{
    id?: string;
    createdAt?: string;
    twoFactorEnabled?: boolean;
    emailVerified?: boolean;
    status?: string;
  } | null>(null);

  const isEmailVerified = Boolean(
    userProfileData?.emailVerified ?? (session?.user as any)?.emailVerified ?? false
  );

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
      apiClient.team
        .getAll<any[]>(session?.user?.businessId || "")
        .then((res) => {
          if (Array.isArray(res.data)) {
            const current = res.data.find((u: { id?: string }) => u.id === session.user.id);
            if (current) {
              setUserProfileData(current);
              if (typeof current.twoFactorEnabled === "boolean") {
                setTwoFactorEnabled(current.twoFactorEnabled);
              }
            }
          }
        })
        .catch(() => {});
    }
  }, [session?.user?.id, session?.user?.businessId]);

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
      const res = await apiClient.team.update(session.user.id, {
        name: personalForm.name.trim(),
        email: personalForm.email.trim().toLowerCase(),
      });
      if (res.error) throw new Error(res.error);

      if (update && res.data) {
        await update({
          ...session,
          user: { ...session?.user, name: res.data.name, email: res.data.email },
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

    if (!passwordForm.currentPassword) {
      setToast({ show: true, text: "Introduce tu contraseña actual" });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
      return;
    }

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      setToast({ show: true, text: "La nueva contraseña debe tener al menos 8 caracteres" });
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
      const res = await apiClient.auth.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (res.error) throw new Error(res.error);

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setToast({ show: true, text: "¡Contraseña actualizada correctamente!" });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    } catch (err: any) {
      setToast({ show: true, text: err.message || "Error al actualizar la contraseña." });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    } finally {
      setSavingPassword(false);
    }
  };

  // 2FA: Open Setup Modal
  const handleStart2faSetup = async () => {
    setLoading2fa(true);
    try {
      const res = await apiClient.auth.setupTwoFactor();
      if (res.error) throw new Error(res.error);
      if (res.data) {
        setTwoFactorSetupData(res.data);
        setIs2faModalOpen(true);
      }
    } catch (err: any) {
      setToast({ show: true, text: err.message || "Error al preparar 2FA." });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    } finally {
      setLoading2fa(false);
    }
  };

  // 2FA: Confirm Code & Enable
  const handleVerify2faCode = async () => {
    if (!twoFactorSetupData || !twoFactorCodeInput.trim()) return;

    setLoading2fa(true);
    try {
      const res = await apiClient.auth.enableTwoFactor({
        secret: twoFactorSetupData.secret,
        code: twoFactorCodeInput.trim(),
      });

      if (res.error) throw new Error(res.error);

      setTwoFactorEnabled(true);
      if (res.data?.backupCodes) {
        setTwoFactorBackupCodes(res.data.backupCodes);
      } else {
        setIs2faModalOpen(false);
      }
      setToast({ show: true, text: "¡Autenticación en Dos Pasos activada!" });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    } catch (err: any) {
      setToast({ show: true, text: err.message || "Código inválido." });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    } finally {
      setLoading2fa(false);
    }
  };

  // 2FA: Disable
  const handleDisable2fa = async () => {
    if (!disablePasswordInput) return;

    setLoading2fa(true);
    try {
      const res = await apiClient.auth.disableTwoFactor({
        password: disablePasswordInput,
      });

      if (res.error) throw new Error(res.error);

      setTwoFactorEnabled(false);
      setIsDisable2faModalOpen(false);
      setDisablePasswordInput("");
      setToast({ show: true, text: "Autenticación en Dos Pasos desactivada." });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    } catch (err: any) {
      setToast({ show: true, text: err.message || "Error al desactivar 2FA." });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    } finally {
      setLoading2fa(false);
    }
  };

  // Copy secret key helper
  const handleCopySecret = () => {
    if (!twoFactorSetupData?.secret) return;
    navigator.clipboard.writeText(twoFactorSetupData.secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  // Los códigos de respaldo se guardan hasheados, así que esta pantalla es la
  // única vez que se pueden leer. Sin un copiar de golpe había que ir
  // seleccionando los ocho a mano, y quien no lo hiciera se quedaba sin forma
  // de entrar al perder el móvil.
  const handleCopyBackupCodes = () => {
    if (twoFactorBackupCodes.length === 0) return;
    navigator.clipboard.writeText(twoFactorBackupCodes.join("\n"));
    setCopiedBackupCodes(true);
    setTimeout(() => setCopiedBackupCodes(false), 2000);
  };

  // Password strength helper
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
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
                className="relative rounded-full cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-primary/40"
                title="Haz clic para cambiar foto de perfil"
              >
                <Avatar
                  name={personalForm.name || session?.user?.name || "Usuario"}
                  src={hasCustomPhoto ? profile.workerPhoto : null}
                  type="person"
                  size="xl"
                  className="w-20 h-20 shadow-sm"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-full">
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
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card>
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
                    <Input
                      id="userName"
                      placeholder="Nombre y Apellidos"
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
                    <Input
                      id="userEmail"
                      placeholder="correo@empresa.com"
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

          {/* Two-Factor Authentication (2FA) Card */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <h3 className="font-bold text-base text-on-surface">
                      Autenticación en Dos Pasos (2FA)
                    </h3>
                    <Badge
                      variant={twoFactorEnabled ? "default" : "outline"}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        twoFactorEnabled ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" : ""
                      }`}
                    >
                      {twoFactorEnabled ? "ACTIVADO" : "DESACTIVADO"}
                    </Badge>
                  </div>
                  <p className="text-xs text-on-surface-variant/80 leading-relaxed max-w-md">
                    Protege tu cuenta exigiendo un código temporal de tu app autenticadora (Google Authenticator, Authy o 1Password) en cada inicio de sesión.
                  </p>
                </div>
              </div>

              <div className="shrink-0 self-stretch sm:self-auto flex justify-end">
                {twoFactorEnabled ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDisable2faModalOpen(true)}
                    className="text-xs font-semibold text-error border-error/30 hover:bg-error/10"
                  >
                    Desactivar 2FA
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleStart2faSetup}
                    disabled={loading2fa}
                    className="text-xs font-semibold gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Activar 2FA</span>
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Columna Derecha: Seguridad y Contraseña (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-on-surface flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <span>Cambio de Contraseña</span>
              </CardTitle>
              <CardDescription>
                Introduce tu contraseña actual para confirmar tu identidad y define una nueva clave de acceso.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSavePassword}>
              <CardContent className="flex flex-col gap-4 pt-2">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="currentPassword">Contraseña Actual</FieldLabel>
                    <Input
                      id="currentPassword"
                      placeholder="Contraseña actual"
                      type={showPassword ? "text" : "password"}
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      icon={Key}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="newPassword">Nueva Contraseña</FieldLabel>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        placeholder="Mínimo 8 caracteres"
                        type={showPassword ? "text" : "password"}
                        required
                        value={passwordForm.newPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                        }
                        icon={Key}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors p-1 z-20 cursor-pointer"
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
                    <Input
                      id="confirmPassword"
                      placeholder="Repite la nueva contraseña"
                      type={showPassword ? "text" : "password"}
                      required
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
                    !passwordForm.currentPassword ||
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
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {is2faModalOpen && twoFactorSetupData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl animate-in zoom-in-95 duration-200">
            {twoFactorBackupCodes.length === 0 ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-center text-on-surface mb-2">
                  Configurar Autenticación 2FA
                </h3>
                <p className="text-xs text-center text-on-surface-variant/80 mb-5">
                  Escanea este código QR con tu aplicación autenticadora (Google Authenticator, Authy o 1Password).
                </p>

                {/* QR Code */}
                <div className="bg-white p-4 rounded-2xl border border-outline-variant/40 mx-auto w-fit mb-5 shadow-xs">
                  <img src={twoFactorSetupData.qrCode} alt="Código QR 2FA" className="w-48 h-48" />
                </div>

                {/* Secret Key with Copy */}
                <div className="mb-5">
                  <label className="block text-[11px] font-semibold text-on-surface-variant mb-1 text-center">
                    ¿No puedes escanear? Clave manual:
                  </label>
                  <div className="flex items-center gap-2 p-2 bg-surface-container-high/40 border border-outline-variant/50 rounded-xl">
                    <span className="font-mono text-xs text-on-surface font-semibold truncate flex-1 text-center select-all">
                      {twoFactorSetupData.secret}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg transition-colors"
                      title="Copiar clave"
                    >
                      {copiedSecret ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 6 Digit Verification Input */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-on-surface mb-1.5 text-center">
                    Introduce el código de 6 dígitos para verificar:
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    value={twoFactorCodeInput}
                    onChange={(e) => setTwoFactorCodeInput(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full text-center text-xl font-bold tracking-widest px-4 py-2.5 bg-surface-container-high/40 border border-outline-variant/60 rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIs2faModalOpen(false);
                      setTwoFactorCodeInput("");
                    }}
                    className="flex-1 justify-center text-xs font-semibold py-2.5"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    disabled={loading2fa || twoFactorCodeInput.length !== 6}
                    onClick={handleVerify2faCode}
                    className="flex-1 justify-center text-xs font-semibold py-2.5"
                  >
                    {loading2fa ? "Verificando..." : "Activar 2FA"}
                  </Button>
                </div>
              </>
            ) : (
              /* Backup Codes Screen */
              <>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-center text-on-surface mb-2">
                  ¡2FA Activado con Éxito!
                </h3>
                <p className="text-xs text-center text-on-surface-variant/80 mb-4">
                  Guarda estos códigos de respaldo en un lugar seguro. Si pierdes tu móvil, podrás utilizarlos para acceder a tu cuenta.
                </p>

                <div className="grid grid-cols-2 gap-2 p-3 bg-surface-container-high/40 border border-outline-variant/50 rounded-2xl mb-6">
                  {twoFactorBackupCodes.map((code, idx) => (
                    <div key={idx} className="font-mono text-xs font-bold text-center text-on-surface py-1 bg-surface-container-lowest rounded-lg border border-outline-variant/30 select-all">
                      {code}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleCopyBackupCodes}
                  className="w-full flex items-center justify-center gap-1.5 mb-3 py-2 text-xs font-semibold text-on-surface-variant hover:text-primary border border-outline-variant/50 rounded-xl transition-colors"
                >
                  {copiedBackupCodes ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Códigos copiados</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar los 8 códigos</span>
                    </>
                  )}
                </button>

                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    setIs2faModalOpen(false);
                    setTwoFactorBackupCodes([]);
                    setTwoFactorCodeInput("");
                  }}
                  className="w-full justify-center text-xs font-semibold py-2.5"
                >
                  He guardado mis códigos de respaldo
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2FA Disable Modal */}
      {isDisable2faModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-on-surface mb-2">
              Desactivar Autenticación 2FA
            </h3>
            <p className="text-xs text-center text-on-surface-variant/80 mb-5">
              Introduce tu contraseña actual para confirmar la desactivación de la protección en dos pasos.
            </p>

            <div className="mb-6">
              <input
                type="password"
                autoFocus
                value={disablePasswordInput}
                onChange={(e) => setDisablePasswordInput(e.target.value)}
                placeholder="Contraseña actual"
                className="w-full px-3.5 py-2.5 bg-surface-container-high/40 border border-outline-variant/60 rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDisable2faModalOpen(false);
                  setDisablePasswordInput("");
                }}
                className="flex-1 justify-center text-xs font-semibold py-2.5"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={loading2fa || !disablePasswordInput}
                onClick={handleDisable2fa}
                className="flex-1 justify-center text-xs font-semibold py-2.5 text-error border-error/30 hover:bg-error/10"
              >
                {loading2fa ? "Desactivando..." : "Desactivar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
