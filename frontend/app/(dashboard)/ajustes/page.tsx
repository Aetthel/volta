"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getThemeColor,
  getFontSizeLevel,
  getBorderRadiusLevel,
  COLOR_PALETTES,
  FONT_SCALES,
  RADIUS_SCALES,
} from "@/lib/theme";
import type { BusinessProfile, ToastState } from "@/types/settings";

import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import TrialBanner from "@/components/TrialBanner";
import Toast from "@/components/settings/Toast";
import PageHeader from "@/components/PageHeader";
import dynamicImport from "next/dynamic";

const ProfileSection = dynamicImport(() => import("@/components/settings/ProfileSection"), {
  loading: () => <div className="p-8 text-center text-xs text-on-surface-variant animate-pulse">Cargando perfil...</div>,
});
const MessagesSection = dynamicImport(() => import("@/components/settings/MessagesSection"), {
  loading: () => <div className="p-8 text-center text-xs text-on-surface-variant animate-pulse">Cargando mensajería...</div>,
});
const BusinessSection = dynamicImport(() => import("@/components/settings/BusinessSection"), {
  loading: () => <div className="p-8 text-center text-xs text-on-surface-variant animate-pulse">Cargando negocio...</div>,
});
const PersonalizationSection = dynamicImport(() => import("@/components/settings/PersonalizationSection"), {
  loading: () => <div className="p-8 text-center text-xs text-on-surface-variant animate-pulse">Cargando personalización...</div>,
});
const BillingSection = dynamicImport(() => import("@/components/settings/BillingSection"), {
  loading: () => <div className="p-8 text-center text-xs text-on-surface-variant animate-pulse">Cargando facturación...</div>,
});
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  FieldGroup,
  Field,
  FieldLabel,
  Input,
} from "@/components/ui/volta-ui";
import {
  User,
  Mail,
  Key,
  Save,
  Loader2,
  MessageSquare,
  Store,
  CreditCard,
  Palette,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

const DEFAULT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD4Ec4Zci7RmiQqA_-qTa0tdRpm9Wl1AVZQsYRoqmBCYgu-SrdSAZoK38if-6y3v-fI_rbpjvuXSX1DFFje1tbtmTQt0JTNiO8-dR8-QBSIhw6Ob2_GaRhoHHIUj_ssbabDqhqu3DNXv-QcDPpcQZCs0T6AirCFHbqrAQLOZ9Y-0DTH68gpUFZxyRQx4q2-DKgTBUU6cSPfG6LVM1L9xd3VaAr1PPApcF4Xlu4kLCaLYAbwyfkOOpjFQ234c3SqedBa-PqJ_pywDw";

export interface SettingsCategory {
  id: string;
  label: string;
  categoryTag: string;
  description: string;
  detailedDescription: string;
  icon: React.ElementType;
  roles: string[];
  features: string[];
  actionLabel: string;
}

const SETTINGS_CATEGORIES: SettingsCategory[] = [
  {
    id: "perfil",
    label: "Perfil y Seguridad",
    categoryTag: "Cuenta de Usuario",
    description: "Datos personales, correo electrónico, foto de perfil, contraseña y verificación en dos pasos.",
    detailedDescription: "Gestiona tu identidad, datos de contacto, foto de perfil, credenciales de acceso y la autenticación en dos pasos.",
    icon: User,
    roles: ["ADMIN", "JEFE", "EMPLEADO"],
    features: [
      "Nombre y correo electrónico",
      "Foto y avatar de usuario",
      "Actualización de contraseña",
      "Autenticación en dos pasos (2FA)",
    ],
    actionLabel: "Configurar Perfil",
  },
  {
    id: "mensajeria",
    label: "Mensajes y WhatsApp",
    categoryTag: "Automatización",
    description: "Vinculación de WhatsApp mediante QR, plantillas personalizadas y recordatorios automáticos.",
    detailedDescription: "Configura la integración con WhatsApp, recordatorios automatizados de citas y plantillas para tus clientes.",
    icon: MessageSquare,
    roles: ["JEFE", "EMPLEADO"],
    features: [
      "Conexión WhatsApp QR en tiempo real",
      "Recordatorios automáticos de citas (24h)",
      "Plantillas de bienvenida y confirmación",
    ],
    actionLabel: "Configurar Mensajería",
  },
  {
    id: "gestion",
    label: "Gestión del Negocio",
    categoryTag: "Establecimiento",
    description: "Horarios comerciales semanales, enlace de reservas online y catálogo de servicios.",
    detailedDescription: "Administra la información de tu establecimiento, horarios semanales, enlace de reservas públicas y catálogo de servicios.",
    icon: Store,
    roles: ["JEFE"],
    features: [
      "Horarios de apertura y cierre por día",
      "Enlace público y código de reservas",
      "Catálogo de servicios, precios y tiempos",
    ],
    actionLabel: "Gestionar Negocio",
  },
  {
    id: "facturacion",
    label: "Facturación y Suscripción",
    categoryTag: "Planes y Pagos",
    description: "Plan activo, detalles del ciclo de suscripción, métodos de pago y facturas descargables.",
    detailedDescription: "Consulta tu plan de suscripción actual, administra métodos de pago y descarga el historial de facturas.",
    icon: CreditCard,
    roles: ["ADMIN", "JEFE"],
    features: [
      "Gestión de Plan Básico y Plan Pro",
      "Método de pago vinculado",
      "Historial de facturas descargables en PDF",
    ],
    actionLabel: "Ver Facturación",
  },
  {
    id: "personalizacion",
    label: "Personalización",
    categoryTag: "Tema & Aspecto",
    description: "Paletas de color de marca, escala tipográfica y curvatura de bordes de la app.",
    detailedDescription: "Personaliza el estilo visual de Volta con colores corporativos, tamaño de letra y curvatura de esquinas.",
    icon: Palette,
    roles: ["JEFE"],
    features: [
      "Paletas de color corporativas",
      "Escala tipográfica adaptable",
      "Radio de bordes y esquinas",
    ],
    actionLabel: "Personalizar Interfaz",
  },
];

function AjustesContent() {
  const { data: session, status } = useSession();
  const role = session?.user?.role;
  const businessId = session?.user?.businessId || "";

  const router = useRouter();
  const searchParams = useSearchParams();

  const [toast, setToast] = useState<ToastState>({ show: false, text: "" });

  // Determine active tab from URL query param (or null for Cards Overview)
  const tabFromUrl = searchParams.get("tab") || searchParams.get("seccion");
  const [activeTab, setActiveTab] = useState<string | null>(tabFromUrl || null);

  // Sync state if URL changes externally
  useEffect(() => {
    const currentParam = searchParams.get("tab") || searchParams.get("seccion");
    setActiveTab(currentParam || null);
  }, [searchParams]);

  // Business profile state (shared across sections)
  const [profile, setProfile] = useState<BusinessProfile>({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    address: "",
    logoUrl: "",
    coverUrl: "",
    description: "",
    ownerName: session?.user?.name || "",
    workerPhoto: DEFAULT_AVATAR,
    themeColor: getThemeColor(session?.user?.themeColor),
    fontSizeLevel: getFontSizeLevel(session?.user?.fontSizeLevel),
    borderRadiusLevel: getBorderRadiusLevel(session?.user?.borderRadiusLevel),
  });

  // Fetch business profile on mount
  useEffect(() => {
    if (!businessId || businessId === "mock-business-id") return;
    fetch(`/api/backend/business/${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          const savedWorkerPhoto =
            typeof window !== "undefined" ? localStorage.getItem("stylist_worker_photo") || "" : "";

          const activeColor = getThemeColor(data.themeColor || session?.user?.themeColor);
          const activeFont = getFontSizeLevel(data.fontSizeLevel || session?.user?.fontSizeLevel);
          const activeRadius = getBorderRadiusLevel(data.borderRadiusLevel || session?.user?.borderRadiusLevel);

          setProfile((prev) => ({
            ...prev,
            name: data.name || prev.name,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            address: data.address || prev.address,
            logoUrl: data.logoUrl || prev.logoUrl,
            coverUrl: data.coverUrl || prev.coverUrl,
            description: data.description || prev.description,
            workerPhoto: savedWorkerPhoto || prev.workerPhoto,
            themeColor: activeColor,
            fontSizeLevel: activeFont,
            borderRadiusLevel: activeRadius,
          }));
        }
      })
      .catch(() => {});
  }, [businessId, session]);

  // Page title
  useEffect(() => {
    if (session?.user?.name) {
      if (activeTab) {
        const cat = SETTINGS_CATEGORIES.find((c) => c.id === activeTab);
        document.title = `${cat ? cat.label : "Ajustes"} - ${session.user.name} - Volta`;
      } else {
        document.title = `Preferencias - ${session.user.name} - Volta`;
      }
    }
  }, [session, activeTab]);

  // Filter categories available for the current user's role
  const visibleCategories = useMemo(() => {
    if (!role) return SETTINGS_CATEGORIES;
    return SETTINGS_CATEGORIES.filter((c) => c.roles.includes(role));
  }, [role]);

  // Handle selecting a category card
  const handleSelectCategory = useCallback(
    (categoryId: string) => {
      setActiveTab(categoryId);
      const url = new URL(window.location.href);
      url.searchParams.set("tab", categoryId);
      url.searchParams.delete("seccion");
      window.history.pushState(null, "", url.pathname + url.search);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  // Handle returning to the Cards Overview
  const handleBackToOverview = useCallback(() => {
    setActiveTab(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("tab");
    url.searchParams.delete("seccion");
    window.history.pushState(null, "", url.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Find active category metadata if one is selected
  const currentCategory = useMemo(() => {
    if (!activeTab) return null;
    return visibleCategories.find((c) => c.id === activeTab) || null;
  }, [activeTab, visibleCategories]);

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      <Sidebar onNewAppointmentClick={() => {}} />
      <div className="flex-1 min-w-0 flex flex-col min-h-screen md:ml-[240px]">
        <TrialBanner />
        <main className="p-gutter max-w-container-max w-full mx-auto flex-1 relative">
          <Toast toast={toast} />

          {/* OVERVIEW VIEW: Cards Grid */}
          {!currentCategory ? (
            <div className="animate-in fade-in duration-200">
              <PageHeader
                title="Preferencias"
                description="Selecciona una sección para configurar tu cuenta, personalizar el sistema o gestionar tu negocio."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
                {visibleCategories.map((cat) => {
                  const IconComponent = cat.icon;
                  return (
                    <div
                      key={cat.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectCategory(cat.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectCategory(cat.id);
                        }
                      }}
                      className="group relative bg-surface-container-lowest border border-outline-variant/60 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 rounded-2xl p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden select-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {/* Subtle accent bar on card hover */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-primary transition-colors duration-200" />

                      <div>
                        {/* Top row: Icon + Category Badge */}
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <div className="text-primary flex items-center justify-center">
                            <IconComponent className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.8} />
                          </div>
                          <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant/80 border border-outline-variant/50 group-hover:border-primary/30 group-hover:text-primary transition-colors">
                            {cat.categoryTag}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h2 className="font-title-lg text-lg font-bold text-on-surface group-hover:text-primary transition-colors mb-1.5 flex items-center gap-2">
                          <span>{cat.label}</span>
                        </h2>
                        <p className="text-sm text-on-surface-variant/85 leading-relaxed mb-5">
                          {cat.description}
                        </p>

                        {/* Feature Highlights */}
                        <div className="flex flex-col gap-2 border-t border-outline-variant/40 pt-4">
                          {cat.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2.5 text-xs text-on-surface-variant/90">
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary/70 shrink-0" strokeWidth={2} />
                              <span className="truncate">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* DETAIL VIEW: Category Settings with Breadcrumb & Back Navigation */
            <div className="animate-in fade-in duration-200">
              {/* Clean Breadcrumb Navigation */}
              <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-3 font-medium select-none">
                <button
                  onClick={handleBackToOverview}
                  className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer group"
                >
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                  <span>Preferencias</span>
                </button>
                <span className="text-outline-variant/60 font-light">/</span>
                <span className="text-on-surface font-semibold">{currentCategory.label}</span>
              </div>

              {/* Section Header */}
              <PageHeader
                title={currentCategory.label}
                description={currentCategory.detailedDescription}
              />

              {/* Section Settings Content */}
              {role === "ADMIN" && activeTab === "perfil" ? (
                <AdminProfileSection toast={toast} setToast={setToast} />
              ) : (
                <>
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
                  {activeTab === "facturacion" && (
                    <BillingSection
                      onShowToast={(text) => {
                        setToast({ show: true, text });
                        setTimeout(() => setToast({ show: false, text: "" }), 3000);
                      }}
                    />
                  )}
                  {activeTab === "personalizacion" && (
                    <PersonalizationSection
                      profile={profile}
                      setProfile={setProfile}
                      businessId={businessId}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

// ADMIN Profile Form Section
function AdminProfileSection({
  toast,
  setToast,
}: {
  toast: ToastState;
  setToast: (t: ToastState) => void;
}) {
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

  return (
    <div className="max-w-xl animate-in fade-in duration-200 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span>Tu Perfil de Administrador</span>
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSaveAdminSettings}>
          <CardContent className="flex flex-col gap-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="adminName">Nombre Completo</FieldLabel>
                <Input
                  id="adminName"
                  placeholder="Nombre y Apellidos"
                  value={adminForm.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAdminForm({ ...adminForm, name: e.target.value })
                  }
                  icon={User}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center justify-between mb-1">
                  <FieldLabel htmlFor="adminEmail">Correo Electrónico</FieldLabel>
                  {Boolean(session?.user?.emailVerified) ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verificado</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/50">
                      <span>No verificado</span>
                    </span>
                  )}
                </div>
                <Input
                  id="adminEmail"
                  placeholder="correo@empresa.com"
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
                <Input
                  id="adminPassword"
                  placeholder="Mínimo 6 caracteres"
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
  );
}

export default function AjustesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
          <Sidebar onNewAppointmentClick={() => {}} />
          <div className="flex-1 min-w-0 flex flex-col min-h-screen md:ml-[240px]">
            <main className="p-gutter max-w-container-max w-full mx-auto flex-1">
              <PageHeader
                title="Preferencias"
                description="Cargando tus ajustes y preferencias..."
              />
            </main>
          </div>
        </div>
      }
    >
      <AjustesContent />
    </Suspense>
  );
}
