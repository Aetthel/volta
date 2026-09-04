"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getThemeColor,
  getFontSizeLevel,
  getBorderRadiusLevel,
  COLOR_PALETTES,
  FONT_SCALES,
  RADIUS_SCALES,
} from "@/lib/theme";
import type { BusinessProfile } from "@/types/settings";
import { toast } from "@/components/ui/volta-ui";

import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import TrialBanner from "@/components/TrialBanner";
import PageHeader from "@/components/PageHeader";
import dynamicImport from "next/dynamic";

function SectionLoader({ message }: { message?: string }) {
  return (
    <div className="w-full py-16 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-200">
      <div className="w-44 h-1 bg-on-surface/15 rounded-full overflow-hidden relative">
        <div
          className="absolute top-0 bottom-0 w-1/2 rounded-full animate-indeterminate-slide"
          style={{ backgroundColor: "var(--color-primary, #006565)" }}
        />
      </div>
      {message && (
        <p className="text-xs text-on-surface-variant font-medium animate-fade-in">
          {message}
        </p>
      )}
    </div>
  );
}

const ProfileSection = dynamicImport(() => import("@/components/settings/ProfileSection"), {
  loading: () => <SectionLoader message="Cargando perfil..." />,
});
const MessagesSection = dynamicImport(() => import("@/components/settings/MessagesSection"), {
  loading: () => <SectionLoader message="Cargando mensajería..." />,
});
const BusinessSection = dynamicImport(() => import("@/components/settings/BusinessSection"), {
  loading: () => <SectionLoader message="Cargando negocio..." />,
});
const PersonalizationSection = dynamicImport(() => import("@/components/settings/PersonalizationSection"), {
  loading: () => <SectionLoader message="Cargando personalización..." />,
});
const BillingSection = dynamicImport(() => import("@/components/settings/BillingSection"), {
  loading: () => <SectionLoader message="Cargando facturación..." />,
});
import {
  Button,
  FieldGroup,
  Field,
  FieldLabel,
  FloatingInput,
} from "@/components/ui/volta-ui";
import NewAppointmentModal from "@/components/NewAppointmentModal";
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
  CheckCircle2,
  ShieldCheck,
  Plus,
  Lock,
  ArrowRight,
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
            enablePublicBooking: data.enablePublicBooking !== false,
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
      router.push(`/ajustes?tab=${categoryId}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router]
  );

  // Handle returning to the Cards Overview
  const handleBackToOverview = useCallback(() => {
    setActiveTab(null);
    router.push("/ajustes", { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [router]);

  // Find active category metadata if one is selected
  const currentCategory = useMemo(() => {
    if (!activeTab) return null;
    return visibleCategories.find((c) => c.id === activeTab) || null;
  }, [activeTab, visibleCategories]);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentModalTriggerRect, setAppointmentModalTriggerRect] = useState<DOMRect | null>(null);

  const handleOpenNewAppointment = (e?: React.MouseEvent) => {
    setAppointmentModalTriggerRect(e ? e.currentTarget.getBoundingClientRect() : null);
    setIsAppointmentModalOpen(true);
  };

  const isDemoSandbox = session?.user?.subscriptionStatus === "DEMO_SANDBOX";

  if (isDemoSandbox) {
    return (
      <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
        <Sidebar onNewAppointmentClick={handleOpenNewAppointment} />
        <div className="flex-1 min-w-0 flex flex-col min-h-screen md:ml-[240px]">
          <TrialBanner />
          <Header />
          <main className="p-gutter max-w-xl w-full mx-auto flex-1 flex flex-col items-center justify-center text-center py-20 animate-in fade-in duration-200">
            <div className="text-primary flex items-center justify-center mb-4">
              <Lock className="w-10 h-10 text-primary" strokeWidth={1.75} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
              Modo Demostración
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mb-3">
              Ajustes bloqueados en modo demo
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-8 max-w-md">
              Estás explorando Volta en una sesión de prueba efímera. Para configurar tus propios horarios, servicios, datos comerciales y WhatsApp, regístrate gratis.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
              <button
                type="button"
                onClick={async () => {
                  await signOut({ callbackUrl: "/register" });
                }}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold shadow-md bg-primary text-white hover:bg-primary/90 py-3 px-5 rounded-xl transition-colors cursor-pointer"
              >
                <span>Registrarse Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/inicio"
                className="w-full flex items-center justify-center text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container py-3 px-5 rounded-xl transition-colors"
              >
                Volver al Inicio
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      <Sidebar onNewAppointmentClick={handleOpenNewAppointment} />
      <div className="flex-1 min-w-0 flex flex-col min-h-screen md:ml-[240px]">
        <TrialBanner />
        <main className="p-gutter max-w-container-max w-full mx-auto flex-1 relative">
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
                <AdminProfileSection />
              ) : (
                <>
                  {activeTab === "perfil" && (
                    <ProfileSection profile={profile} setProfile={setProfile} />
                  )}
                  {activeTab === "mensajeria" && (
                    <MessagesSection
                      businessId={businessId}
                      profileName={profile.name}
                    />
                  )}
                  {activeTab === "gestion" && (
                    <BusinessSection
                      profile={profile}
                      setProfile={setProfile}
                      businessId={businessId}
                    />
                  )}
                  {activeTab === "facturacion" && (
                    <BillingSection />
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
        {/* Mobile floating button */}
        <Button
          onClick={handleOpenNewAppointment}
          variant="ghost"
          className="md:hidden fixed bottom-20 right-6 z-40 p-4 bg-primary text-white rounded-full shadow-lg border-none"
        >
          <Plus className="w-6 h-6" />
        </Button>

        <BottomNav />
      </div>

      <NewAppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => {
          setIsAppointmentModalOpen(false);
          setAppointmentModalTriggerRect(null);
        }}
        onSave={() => {
          setIsAppointmentModalOpen(false);
          toast.success("Cita registrada exitosamente");
        }}
        triggerRect={appointmentModalTriggerRect}
      />
    </div>
  );
}

// ADMIN Profile Form Section
function AdminProfileSection() {
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
        toast.success("¡Ajustes de administrador guardados!");
        setAdminForm((prev) => ({ ...prev, password: "" }));
      })
      .catch((err) => toast.error(err.message || "Error al guardar ajustes"))
      .finally(() => setSavingAdmin(false));
  };

  return (
    <div className="max-w-xl animate-in fade-in duration-200 pt-6">
      <div className="flex flex-col gap-1.5 mb-6">
        <h3 className="flex items-center gap-2.5 text-base font-bold text-on-surface">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" strokeWidth={2.2} />
          <span>Tu Perfil de Administrador</span>
        </h3>
        <p className="text-sm text-on-surface-variant/85 leading-relaxed">
          Datos de acceso de la cuenta con la que administras toda la plataforma.
        </p>
      </div>

      <form onSubmit={handleSaveAdminSettings}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="adminName">Nombre Completo</FieldLabel>
            <FloatingInput
              id="adminName"
              value={adminForm.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setAdminForm({ ...adminForm, name: e.target.value })
              }
              icon={User}
              className="bg-surface-container-lowest"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="adminEmail">Correo Electrónico</FieldLabel>
            <FloatingInput
              id="adminEmail"
              type="email"
              value={adminForm.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setAdminForm({ ...adminForm, email: e.target.value })
              }
              icon={Mail}
              className="bg-surface-container-lowest"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="adminPassword">
              Nueva Contraseña (dejar en blanco para mantener)
            </FieldLabel>
            <FloatingInput
              id="adminPassword"
              type="password"
              value={adminForm.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setAdminForm({ ...adminForm, password: e.target.value })
              }
              icon={Key}
              className="bg-surface-container-lowest"
            />
          </Field>
        </FieldGroup>

        <div className="flex justify-end mt-6">
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
        </div>
      </form>
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
