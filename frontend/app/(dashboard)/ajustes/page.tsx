"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  getThemeColor,
  applyThemeColors,
  COLOR_PALETTES,
  FONT_SCALES,
  RADIUS_SCALES,
} from "@/lib/theme";
import type { BusinessProfile, ToastState } from "@/types/settings";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import TrialBanner from "@/components/TrialBanner";
import Toast from "@/components/settings/Toast";
import ProfileSection from "@/components/settings/ProfileSection";
import MessagesSection from "@/components/settings/MessagesSection";
import BusinessSection from "@/components/settings/BusinessSection";
import PersonalizationSection from "@/components/settings/PersonalizationSection";
import { Button, PageHeader } from "@/components/ui/volta-ui";

const TAB_KEY = "volta-settings-active-tab";

const DEFAULT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD4Ec4Zci7RmiQqA_-qTa0tdRpm9Wl1AVZQsYRoqmBCYgu-SrdSAZoK38if-6y3v-fI_rbpjvuXSX1DFFje1tbtmTQt0JTNiO8-dR8-QBSIhw6Ob2_GaRhoHHIUj_ssbabDqhqu3DNXv-QcDPpcQZCs0T6AirCFHbqrAQLOZ9Y-0DTH68gpUFZxyRQx4q2-DKgTBUU6cSPfG6LVM1L9xd3VaAr1PPApcF4Xlu4kLCaLYAbwyfkOOpjFQ234c3SqedBa-PqJ_pywDw";

export default function AjustesPage() {
  const { data: session, update } = useSession();
  const role = session?.user?.role || "EMPLEADO";
  const businessId = session?.user?.businessId || "mock-business-id";

  const [toast, setToast] = useState<ToastState>({ show: false, text: "" });

  // Restore last active tab from localStorage (default: "perfil")
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TAB_KEY) || "perfil";
    }
    return "perfil";
  });

  // Persist tab changes
  useEffect(() => {
    localStorage.setItem(TAB_KEY, activeTab);
  }, [activeTab]);

  // Business profile state (shared across sections)
  const [profile, setProfile] = useState<BusinessProfile>({
    name: "Estilo & Spa (Ejemplo)",
    email: "contacto@volta.com",
    phone: "+34 912 345 678",
    address: "Calle de Velázquez, 45, Madrid",
    logoUrl: "",
    coverUrl: "",
    description: "Espacio de belleza profesional dedicado al estilismo y cuidado personal.",
    ownerName: "Sofía Martín",
    workerPhoto: DEFAULT_AVATAR,
    themeColor: "TEAL",
    fontSizeLevel: "MEDIUM",
    borderRadiusLevel: "MEDIUM",
  });

  // Fetch business profile and apply theme on mount
  useEffect(() => {
    if (!businessId) return;
    fetch(`/api/backend/business/${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          const savedWorkerPhoto =
            typeof window !== "undefined" ? localStorage.getItem("stylist_worker_photo") || "" : "";
          const localColor =
            typeof window !== "undefined" ? localStorage.getItem("volta_theme_color") : null;
          const localFont =
            typeof window !== "undefined" ? localStorage.getItem("volta_font_size") : null;
          const localRadius =
            typeof window !== "undefined" ? localStorage.getItem("volta_border_radius") : null;

          const activeColor = getThemeColor(localColor || data.themeColor);
          const activeFont = localFont || data.fontSizeLevel || "MEDIUM";
          const activeRadius = localRadius || data.borderRadiusLevel || "MEDIUM";

          setProfile((prev) => ({
            ...prev,
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address || prev.address,
            logoUrl: data.logoUrl || prev.logoUrl,
            coverUrl: data.coverUrl || prev.coverUrl,
            description: data.description || prev.description,
            workerPhoto: savedWorkerPhoto || prev.workerPhoto,
            themeColor: activeColor,
            fontSizeLevel: activeFont,
            borderRadiusLevel: activeRadius,
          }));

          // Apply theme CSS variables
          const root = document.documentElement;
          const palette = COLOR_PALETTES[activeColor] || COLOR_PALETTES.CLINICAL_ELEGANCE;
          applyThemeColors(root, palette);
          root.style.setProperty(
            "--font-scale",
            FONT_SCALES[activeFont as keyof typeof FONT_SCALES]?.scale || FONT_SCALES.MEDIUM.scale
          );
          root.style.setProperty(
            "--radius-scale",
            RADIUS_SCALES[activeRadius as keyof typeof RADIUS_SCALES]?.scale ||
              RADIUS_SCALES.MEDIUM.scale
          );
        }
      })
      .catch(() => {});
  }, [businessId]);

  // Page title
  useEffect(() => {
    if (session?.user?.name) document.title = `Ajustes - ${session.user.name} - Volta`;
  }, [session]);

  // Define which tabs each role can see
  const tabs = [
    { id: "perfil", label: "Perfil y Seguridad", roles: ["ADMIN", "JEFE", "EMPLEADO"] },
    { id: "mensajeria", label: "Mensajes y WhatsApp", roles: ["JEFE", "EMPLEADO"] },
    { id: "gestion", label: "Gestión del Negocio", roles: ["JEFE"] },
    { id: "personalizacion", label: "Personalización", roles: ["JEFE"] },
  ];

  const visibleTabs = tabs.filter((t) => t.roles.includes(role));

  // Ensure active tab is valid for this role
  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.find((t) => t.id === activeTab)) {
      setActiveTab(visibleTabs[0].id);
    }
  }, [role, activeTab, visibleTabs]);

  // ADMIN keeps its own separate render (not touched per user request)
  if (role === "ADMIN") {
    return <AdminView toast={toast} setToast={setToast} />;
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      <Sidebar onNewAppointmentClick={() => {}} />
      <div className="flex-1 min-w-0 flex flex-col min-h-screen md:ml-[240px]">
        <TrialBanner />
        <main className="p-gutter max-w-container-max w-full mx-auto flex-1 relative">
          <Toast toast={toast} />

          <PageHeader
            title="Configuración"
            description="Gestiona tu identidad de marca, horarios, servicios y mensajería automatizada."
          />

          {/* Tab Navigation */}
          {visibleTabs.length > 1 && (
            <div className="flex border-b border-outline-variant/65 mb-gutter gap-gutter">
              {visibleTabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 font-label-lg text-label-lg font-medium border-b-2 rounded-none shadow-none p-0 active:scale-100 ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          )}

          {/* Tab Content */}
          {activeTab === "perfil" && (
            <ProfileSection profile={profile} setProfile={setProfile} setToast={setToast} />
          )}
          {activeTab === "mensajeria" && (
            <MessagesSection
              businessId={businessId}
              profileName={profile.name}
              setToast={setToast}
            />
          )}
          {activeTab === "gestion" && (
            <BusinessSection
              profile={profile}
              setProfile={setProfile}
              businessId={businessId}
              setToast={setToast}
            />
          )}
          {activeTab === "personalizacion" && (
            <PersonalizationSection
              profile={profile}
              setProfile={setProfile}
              businessId={businessId}
            />
          )}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

// ADMIN view (kept as-is per user request)
function AdminView({ toast, setToast }: { toast: ToastState; setToast: (t: ToastState) => void }) {
  const { data: session, update } = useSession();
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "" });
  const [savingAdmin, setSavingAdmin] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setAdminForm({
        name: session.user.name || "",
        email: session.user.email || "",
        password: "",
      });
    }
  }, [session]);

  const handleSaveAdminSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    setSavingAdmin(true);
    const payload: Record<string, string> = { name: adminForm.name, email: adminForm.email };
    if (adminForm.password) payload.password = adminForm.password;

    fetch(`/api/backend/users/${session.user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al guardar");
        return data;
      })
      .then(async (updatedUser) => {
        update({ name: updatedUser.name, email: updatedUser.email });
        setToast({ show: true, text: "¡Ajustes de administrador guardados!" });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);
        setAdminForm((prev) => ({ ...prev, password: "" }));
      })
      .catch((err) => alert(err.message))
      .finally(() => setSavingAdmin(false));
  };

  const {
    FloatingInput,
    FieldGroup,
    Field,
    FieldLabel,
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
  } = require("@/components/ui/volta-ui");
  const { User, Mail, Key, Save, Loader2, CheckCircle } = require("lucide-react");

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      <Sidebar onNewAppointmentClick={() => {}} />
      <div className="flex-1 min-w-0 flex flex-col min-h-screen md:ml-[240px]">
        <TrialBanner />
        <main className="p-gutter max-w-container-max w-full mx-auto flex-1 relative">
          <Toast toast={toast} />
          <PageHeader
            title="Ajustes de Administrador"
            description="Gestiona tus credenciales de acceso y perfil de administrador."
          />
          <div className="max-w-xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <User />
                  <span>Tu Perfil de Administrador</span>
                </CardTitle>
              </CardHeader>
              <form onSubmit={handleSaveAdminSettings}>
                <CardContent className="flex flex-col gap-6">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="adminName">Nombre Completo</FieldLabel>
                      <FloatingInput
                        id="adminName"
                        label="Nombre y Apellidos"
                        value={adminForm.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setAdminForm({ ...adminForm, name: e.target.value })
                        }
                        icon={User}
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="adminEmail">Correo Electrónico</FieldLabel>
                      <FloatingInput
                        id="adminEmail"
                        label="correo@empresa.com"
                        type="email"
                        value={adminForm.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setAdminForm({ ...adminForm, email: e.target.value })
                        }
                        icon={Mail}
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="adminPassword">
                        Nueva Contraseña (dejar en blanco para mantener)
                      </FieldLabel>
                      <FloatingInput
                        id="adminPassword"
                        label="Mínimo 6 caracteres"
                        type="password"
                        value={adminForm.password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setAdminForm({ ...adminForm, password: e.target.value })
                        }
                        icon={Key}
                      />
                    </Field>
                  </FieldGroup>
                </CardContent>
                <CardFooter className="border-t border-outline-variant/40 pt-4 flex justify-end gap-3">
                  <Button
                    type="submit"
                    disabled={savingAdmin}
                    variant="primary"
                    size="lg"
                    className="flex items-center gap-2 px-5 py-2.5 active:scale-95 font-medium"
                  >
                    {savingAdmin ? (
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
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
