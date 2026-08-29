"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Store,
  Camera,
  Save,
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
import type { BusinessProfile, ToastState } from "@/types/settings";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  FloatingInput,
  FloatingTextarea,
  Button,
  Badge,
  FieldGroup,
  Field,
} from "@/components/ui/volta-ui";
import { apiClient } from "@/lib/apiClient";

interface BusinessGeneralFormProps {
  profile: BusinessProfile;
  setProfile: React.Dispatch<React.SetStateAction<BusinessProfile>>;
  businessId: string;
  setToast: (toast: ToastState) => void;
}

export const BusinessGeneralForm: React.FC<BusinessGeneralFormProps> = ({
  profile,
  setProfile,
  businessId,
  setToast,
}) => {
  const { data: session, update } = useSession();

  const [businessForm, setBusinessForm] = useState({
    name: profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    address: profile.address || "",
    description: profile.description || "",
  });
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [downloadingQr, setDownloadingQr] = useState(false);

  const businessLogoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBusinessForm({
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      address: profile.address || "",
      description: profile.description || "",
    });
  }, [profile]);

  const handleBusinessLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setToast({ show: true, text: "La imagen no debe superar los 5MB" });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const logoData = reader.result as string;
        setProfile((prev) => ({ ...prev, logoUrl: logoData }));
        await apiClient.business.update(businessId, { logoUrl: logoData });
        setToast({ show: true, text: "Logotipo comercial actualizado" });
        setTimeout(() => setToast({ show: false, text: "" }), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = async () => {
    setProfile((prev) => ({ ...prev, logoUrl: null }));
    await apiClient.business.update(businessId, { logoUrl: null });
    setToast({ show: true, text: "Logotipo eliminado" });
    setTimeout(() => setToast({ show: false, text: "" }), 3000);
  };

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBusiness(true);
    try {
      const res = await apiClient.business.update(businessId, businessForm);
      if (res.error) throw new Error(res.error);

      setProfile((prev) => ({ ...prev, ...businessForm }));
      setToast({ show: true, text: "¡Datos comerciales guardados con éxito!" });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);

      if (update && res.data) {
        await update({
          ...session,
          user: { ...session?.user, name: res.data.name, email: res.data.email },
        });
      }
    } catch (err: any) {
      setToast({ show: true, text: err.message || "Error al guardar el negocio." });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    } finally {
      setSavingBusiness(false);
    }
  };

  const handleToggleBooking = async () => {
    const newValue = profile.enablePublicBooking === false ? true : false;
    setProfile((prev) => ({ ...prev, enablePublicBooking: newValue }));
    await apiClient.business.update(businessId, { enablePublicBooking: newValue });
    setToast({
      show: true,
      text: newValue ? "Reservas online activadas" : "Reservas online desactivadas",
    });
    setTimeout(() => setToast({ show: false, text: "" }), 3000);
  };

  const bookingUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/booking/${businessId}`
      : `https://volta.app/booking/${businessId}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(bookingUrl)}`;

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
      setToast({ show: true, text: "¡Código QR descargado!" });
      setTimeout(() => setToast({ show: false, text: "" }), 3000);
    } catch {
      window.open(qrImageUrl, "_blank");
    } finally {
      setDownloadingQr(false);
    }
  };

  return (
    <>
      {/* 1. Top Business Identity Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Logo with instant upload trigger */}
            <div className="relative group/logo shrink-0">
              <div
                onClick={() => businessLogoInputRef.current?.click()}
                className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-outline-variant/60 hover:border-primary bg-surface-container-high shadow-xs flex items-center justify-center cursor-pointer transition-all duration-200"
                title="Haz clic para cambiar el logotipo comercial"
              >
                {profile.logoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={profile.logoUrl}
                    alt="Logo del Negocio"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-2xl">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : "V"}
                  </div>
                )}

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
      </Card>

      {/* 2. Public Booking Portal & QR Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary-container/50 border border-secondary-container flex items-center justify-center shrink-0">
              <Globe className="w-6 h-6 text-on-secondary-container" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h3 className="font-title-md font-bold text-on-surface">Página de Reservas Online</h3>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    profile.enablePublicBooking !== false
                      ? "bg-secondary-container text-on-secondary-container"
                      : "bg-surface-variant text-on-surface-variant"
                  }`}
                >
                  {profile.enablePublicBooking !== false ? "Activa" : "Desactivada"}
                </span>
              </div>
              <p className="text-body-sm text-on-surface-variant max-w-xl">
                Tus clientes pueden acceder a este enlace o escanear el QR en tu local para agendar
                citas de forma autónoma las 24 horas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
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
          <div className="mt-6 pt-6 border-t border-outline-variant/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-surface-container px-3.5 py-2.5 rounded-xl border border-outline-variant/60 w-full md:max-w-md overflow-hidden">
              <Globe className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-mono text-on-surface truncate flex-1">{bookingUrl}</span>
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
      </Card>

      {/* 3. General Information Form Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Información Comercial</CardTitle>
              <CardDescription>
                Datos visibles para tus clientes en la web de reservas y confirmaciones.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSaveBusiness}>
          <CardContent className="space-y-6">
            <FieldGroup>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FloatingInput
                    label="Nombre Comercial *"
                    value={businessForm.name}
                    onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                    required
                  />
                </Field>

                <Field>
                  <FloatingInput
                    label="Teléfono de Contacto"
                    type="tel"
                    value={businessForm.phone}
                    onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FloatingInput
                    label="Email de Contacto"
                    type="email"
                    value={businessForm.email}
                    onChange={(e) => setBusinessForm({ ...businessForm, email: e.target.value })}
                  />
                </Field>

                <Field>
                  <FloatingInput
                    label="Dirección Física"
                    value={businessForm.address}
                    onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })}
                  />
                </Field>
              </div>

              <Field>
                <FloatingTextarea
                  label="Descripción del Negocio / Especialidades"
                  value={businessForm.description}
                  onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })}
                  rows={3}
                />
              </Field>
            </FieldGroup>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 border-t border-outline-variant/30 pt-4">
            <Button
              type="submit"
              variant="default"
              disabled={savingBusiness}
              className="gap-2"
            >
              {savingBusiness ? (
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
    </>
  );
};
