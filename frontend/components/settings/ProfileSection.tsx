"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { User, Key, Mail, Camera, Save, Loader2, ShieldCheck, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessProfile, UserForm, ToastState } from "@/types/settings";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  FloatingInput,
  Button,
  Badge,
  FieldGroup,
  Field,
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

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [userForm, setUserForm] = useState<UserForm>({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    password: "",
  });
  const [userProfileData, setUserProfileData] = useState<{
    id?: string;
    createdAt?: string;
  } | null>(null);

  const workerPhotoInputRef = useRef<HTMLInputElement>(null);

  // Fetch user profile data
  useState(() => {
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
  });

  const formatProfileDate = (dateString: string) => {
    if (!dateString) return "Fecha no disponible";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleWorkerPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, workerPhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (!session?.user?.id) return;
    setSavingProfile(true);

    if (typeof window !== "undefined" && profile.workerPhoto) {
      localStorage.setItem("stylist_worker_photo", profile.workerPhoto);
      window.dispatchEvent(new Event("stylist_worker_photo_changed"));
    }

    const payload: Record<string, string> = { name: userForm.name, email: userForm.email };
    if (userForm.password) payload.password = userForm.password;

    fetch(`/api/backend/users/${session.user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al actualizar perfil.");
        return data;
      })
      .then(async (updatedUser) => {
        setIsEditingProfile(false);
        setToast({ show: true, text: "¡Tu perfil personal ha sido guardado!" });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);
        if (update) {
          await update({
            ...session,
            user: { ...session?.user, name: updatedUser.name, email: updatedUser.email },
          });
        }
        setUserForm((prev) => ({ ...prev, password: "" }));
      })
      .catch((err) => {
        setToast({ show: true, text: err.message || "Error al guardar el perfil." });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);
        setIsEditingProfile(false);
      })
      .finally(() => setSavingProfile(false));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mt-gutter animate-in fade-in duration-200">
      {/* Profile Card */}
      <Card className="lg:col-span-12">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-primary flex items-center gap-2">
            <User />
            <span>Perfil de Usuario</span>
          </CardTitle>
          {!isEditingProfile ? (
            <Button
              variant="ghost"
              onClick={() => setIsEditingProfile(true)}
              className="text-primary hover:text-primary-container font-label-lg text-label-lg transition-all hover:underline p-0 shadow-none active:scale-100 font-medium"
            >
              Editar perfil
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditingProfile(false);
                  if (session?.user)
                    setUserForm({
                      name: session.user.name || "",
                      email: session.user.email || "",
                      password: "",
                    });
                }}
                className="text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all hover:underline px-0 shadow-none active:scale-100 font-medium"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex items-center gap-1.5 px-4 py-2"
              >
                {savingProfile ? <Loader2 className="animate-spin" /> : <Save />}
                <span>Guardar</span>
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 shrink-0 relative">
                <div
                  onClick={
                    isEditingProfile ? () => workerPhotoInputRef.current?.click() : undefined
                  }
                  className={cn(
                    "w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30 bg-surface-container shadow-sm flex items-center justify-center transition-all duration-200 relative group/avatar",
                    isEditingProfile ? "cursor-pointer hover:opacity-90" : "cursor-default"
                  )}
                >
                  {profile.workerPhoto && profile.workerPhoto !== DEFAULT_AVATAR ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={profile.workerPhoto}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary-container/50 text-on-secondary-container">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                  {isEditingProfile && (
                    <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white animate-in zoom-in-90 duration-150" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={workerPhotoInputRef}
                  onChange={handleWorkerPhotoChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-2xl font-semibold text-on-surface">
                  {userForm.name || "Sin nombre"}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="default"
                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                  >
                    {role === "ADMIN"
                      ? "Administrador Global"
                      : role === "JEFE"
                        ? "Jefe de Tienda"
                        : "Empleado"}
                  </Badge>
                  <span className="text-on-surface-variant/70 text-xs">
                    • ID: #GS-{userProfileData?.id?.slice(-3).toUpperCase() || "001"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-outline-variant/60 my-6" />

          {isEditingProfile ? (
            <FieldGroup className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Field>
                <FloatingInput
                  id="user-name"
                  label="Nombre Completo"
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                />
              </Field>
              <Field>
                <FloatingInput
                  id="user-email"
                  label="Correo Electrónico"
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                />
              </Field>
              <Field>
                <FloatingInput
                  id="user-password"
                  label="Nueva Contraseña (opcional)"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                />
              </Field>
            </FieldGroup>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider block mb-1">
                  Nombre Completo
                </span>
                <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                  {userForm.name || "Sin nombre"}
                </p>
              </div>
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider block mb-1">
                  Correo Electrónico
                </span>
                <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                  {userForm.email || "Sin email"}
                </p>
              </div>
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider block mb-1">
                  Fecha de Ingreso
                </span>
                <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                  {formatProfileDate(userProfileData?.createdAt || "")}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Security Card */}
      <Card className="lg:col-span-12">
        <CardHeader className="pb-4">
          <CardTitle className="text-primary flex items-center gap-2">
            <ShieldCheck />
            <span>Seguridad de la Cuenta</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="border border-outline-variant rounded-md p-3 sm:p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <Lock className="text-on-surface-variant shrink-0" />
                <div>
                  <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                    Contraseña
                  </p>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Actualizada hace 3 meses
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-primary hover:text-primary-container font-label-lg text-label-lg transition-all hover:underline p-0 shadow-none active:scale-100 font-medium"
              >
                Cambiar
              </Button>
            </div>
            <div className="border border-outline-variant rounded-md p-3 sm:p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <ShieldCheck className="text-on-surface-variant shrink-0" />
                <div>
                  <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                    Verificación en dos pasos
                  </p>
                  <p className="font-body-md text-body-md text-primary font-semibold">Activada</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-error hover:text-error/80 font-label-lg text-label-lg transition-all hover:underline p-0 shadow-none active:scale-100 font-medium"
              >
                Desactivar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
