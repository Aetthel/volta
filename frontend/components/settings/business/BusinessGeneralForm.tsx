"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Store,
  Camera,
  Loader2,
  Trash2,
  Globe,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  MapPin,
  Phone,
} from "lucide-react";
import type { BusinessProfile } from "@/types/settings";
import {
  Input,
  Textarea,
  Button,
  Badge,
  FieldGroup,
  Field,
  FieldLabel,
  Avatar,
  toast,
} from "@/components/ui/volta-ui";
import { SectionHeading } from "../SectionHeading";
import { apiClient } from "@/lib/apiClient";

/**
 * Sin tarjetas blancas de fondo, los campos son la única capa interactiva sobre
 * el gris de la página: `Input` y `Textarea` vienen con `bg-surface`, que es
 * justo el color del fondo, así que aquí se les pone blanco.
 */
const FIELD_SURFACE = "bg-surface-container-lowest";

interface BusinessGeneralFormProps {
  profile: BusinessProfile;
  setProfile: React.Dispatch<React.SetStateAction<BusinessProfile>>;
  businessId: string;
}

export const BusinessGeneralForm: React.FC<BusinessGeneralFormProps> = ({
  profile,
  setProfile,
  businessId,
}) => {
  const { data: session, update } = useSession();

  const [businessForm, setBusinessForm] = useState({
    name: profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    address: profile.address || "",
    description: profile.description || "",
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [downloadingQr, setDownloadingQr] = useState(false);

  const businessLogoInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setBusinessForm({
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      address: profile.address || "",
      description: profile.description || "",
    });
  }, [profile]);

  const persistBusiness = useCallback(
    async (nextForm: typeof businessForm) => {
      if (!businessId || businessId === "mock-business-id") return;
      if (!nextForm.name?.trim()) return; // Don't persist empty business name
      setSaveStatus("saving");
      try {
        const res = await apiClient.business.update(businessId, nextForm);
        if (res.error) throw new Error(res.error);

        setProfile((prev) => ({ ...prev, ...nextForm }));
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);

        if (update && res.data) {
          await update({
            ...session,
            user: { ...session?.user, name: res.data.name, email: res.data.email },
          });
        }
      } catch {
        setSaveStatus("idle");
        toast.error("Error al guardar información comercial");
      }
    },
    [businessId, session, update, setProfile]
  );

  const schedulePersistBusiness = (nextForm: typeof businessForm) => {
    setBusinessForm(nextForm);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      persistBusiness(nextForm);
    }, 800);
  };

  const handleBusinessLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no debe superar los 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const logoData = reader.result as string;
        setProfile((prev) => ({ ...prev, logoUrl: logoData }));
        await apiClient.business.update(businessId, { logoUrl: logoData });
        toast.success("Logotipo comercial actualizado");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = async () => {
    setProfile((prev) => ({ ...prev, logoUrl: null }));
    await apiClient.business.update(businessId, { logoUrl: null });
    toast.success("Logotipo eliminado");
  };

  const handleToggleBooking = async () => {
    const newValue = profile.enablePublicBooking === false ? true : false;
    setProfile((prev) => ({ ...prev, enablePublicBooking: newValue }));
    await apiClient.business.update(businessId, { enablePublicBooking: newValue });
    toast.success(newValue ? "Reservas online activadas" : "Reservas online desactivadas");
  };

  const [mountedOrigin, setMountedOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setMountedOrigin(window.location.origin);
    }
  }, []);

  const bookingUrl = mountedOrigin
    ? `${mountedOrigin}/booking/${businessId}`
    : `https://volta.app/booking/${businessId}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=0-0-0&bgcolor=255-255-255&margin=1&data=${encodeURIComponent(bookingUrl)}`;

  const handleDownloadQr = async () => {
    setDownloadingQr(true);
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `qr-reservas-${(profile.name || "volta").toLowerCase().replace(/\s+/g, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success("¡Código QR descargado!");
    } catch {
      window.open(qrImageUrl, "_blank");
    } finally {
      setDownloadingQr(false);
    }
  };

  return (
    <>
      {/* 1. Identidad del negocio — sin contenedor: el logo ancla la página */}
      <section className="pb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Logo with instant upload trigger */}
            <div className="relative group/logo shrink-0">
              <div
                onClick={() => businessLogoInputRef.current?.click()}
                className="relative rounded-2xl cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-primary/40"
                title="Haz clic para cambiar el logotipo comercial"
              >
                <Avatar
                  name={profile.name || "Volta"}
                  src={profile.logoUrl}
                  type="business"
                  size="xl"
                  className="w-20 h-20 rounded-2xl shadow-sm"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity rounded-2xl">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>

              <input
                type="file"
                ref={businessLogoInputRef}
                onChange={handleBusinessLogoChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Business Title, Category & Active Status */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-title-lg text-xl font-bold text-on-surface">
                  {profile.name || "Nombre del Negocio"}
                </h2>
                <Badge
                  variant="default"
                  className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                >
                  {profile.businessType || "Peluquería / Salón"}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-on-surface-variant/80 flex-wrap">
                {profile.address && (
                  <span className="flex items-center gap-1.5 truncate max-w-xs">
                    <MapPin className="w-3.5 h-3.5 text-on-surface-variant/60 shrink-0" />
                    <span className="truncate">{profile.address}</span>
                  </span>
                )}
                {profile.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-on-surface-variant/60 shrink-0" />
                    <span>{profile.phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Logo Actions */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => businessLogoInputRef.current?.click()}
              className="text-xs font-semibold gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Cambiar logo</span>
            </Button>
            {profile.logoUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveLogo}
                className="text-xs text-error hover:bg-error/10 hover:text-error gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Quitar</span>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* 2. Página pública de reservas y QR */}
      <section className="pt-12 pb-10">
        <div className="flex flex-col md:flex-row items-start md:items-start justify-between gap-5">
          <SectionHeading
            icon={Globe}
            title="Página de Reservas Online"
            description="Tus clientes pueden acceder a este enlace o escanear el QR en tu local para agendar citas de forma autónoma las 24 horas."
            className="mb-0"
            trailing={
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  profile.enablePublicBooking !== false
                    ? "bg-secondary-container text-on-secondary-container"
                    : "bg-surface-variant text-on-surface-variant"
                }`}
              >
                {profile.enablePublicBooking !== false ? "Activa" : "Desactivada"}
              </span>
            }
          />

          <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap shrink-0 md:mt-0.5">
            <Button
              type="button"
              variant={profile.enablePublicBooking !== false ? "outline" : "default"}
              size="sm"
              onClick={handleToggleBooking}
              className="text-xs font-semibold"
            >
              {profile.enablePublicBooking !== false ? "Desactivar reservas" : "Activar reservas"}
            </Button>
          </div>
        </div>

        {profile.enablePublicBooking !== false && (
          <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-surface-container-lowest px-3.5 py-2.5 rounded-xl border border-outline-variant/60 w-full md:max-w-md overflow-hidden">
              <Globe className="w-4 h-4 text-primary shrink-0" />
              <span suppressHydrationWarning className="text-xs font-mono text-on-surface truncate flex-1">
                {bookingUrl}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(bookingUrl);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2500);
                }}
                className="h-7 px-2 text-xs font-semibold gap-1 shrink-0"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-secondary" />
                    <span className="text-secondary">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(bookingUrl, "_blank")}
                className="text-xs font-semibold gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver página</span>
              </Button>

              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleDownloadQr}
                disabled={downloadingQr}
                className="text-xs font-semibold gap-1.5"
              >
                {downloadingQr ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <QrCode className="w-3.5 h-3.5" />
                )}
                <span>Descargar QR</span>
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* 3. Información comercial */}
      <section className="pt-12 pb-10">
        <SectionHeading
          icon={Store}
          title="Información Comercial"
          description="Datos visibles para tus clientes en la web de reservas y confirmaciones. Se guardan automáticamente al escribir."
          trailing={
            saveStatus === "saving" ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>Guardando...</span>
              </span>
            ) : saveStatus === "saved" ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Guardado</span>
              </span>
            ) : null
          }
        />

        <div className="space-y-6">
          <FieldGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel>
                  Nombre Comercial <span className="text-error">*</span>
                </FieldLabel>
                <Input
                  placeholder="Ej. Peluquería Volta"
                  className={FIELD_SURFACE}
                  value={businessForm.name}
                  onChange={(e) =>
                    schedulePersistBusiness({ ...businessForm, name: e.target.value })
                  }
                  onBlur={() => persistBusiness(businessForm)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel>Teléfono de Contacto</FieldLabel>
                <Input
                  placeholder="+34 600 000 000"
                  className={FIELD_SURFACE}
                  type="tel"
                  value={businessForm.phone}
                  onChange={(e) =>
                    schedulePersistBusiness({ ...businessForm, phone: e.target.value })
                  }
                  onBlur={() => persistBusiness(businessForm)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Email de Contacto</FieldLabel>
                <Input
                  placeholder="contacto@empresa.com"
                  className={FIELD_SURFACE}
                  type="email"
                  value={businessForm.email}
                  onChange={(e) =>
                    schedulePersistBusiness({ ...businessForm, email: e.target.value })
                  }
                  onBlur={() => persistBusiness(businessForm)}
                />
              </Field>

              <Field>
                <FieldLabel>Dirección Física</FieldLabel>
                <Input
                  placeholder="Calle Mayor 12, Madrid"
                  className={FIELD_SURFACE}
                  value={businessForm.address}
                  onChange={(e) =>
                    schedulePersistBusiness({ ...businessForm, address: e.target.value })
                  }
                  onBlur={() => persistBusiness(businessForm)}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel>Descripción del Negocio / Especialidades</FieldLabel>
              <Textarea
                placeholder="Describe los servicios o especialidades de tu negocio..."
                className={FIELD_SURFACE}
                value={businessForm.description}
                onChange={(e) =>
                  schedulePersistBusiness({ ...businessForm, description: e.target.value })
                }
                onBlur={() => persistBusiness(businessForm)}
                rows={3}
              />
            </Field>
          </FieldGroup>
        </div>
      </section>
    </>
  );
};
