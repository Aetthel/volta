"use client";

import type { BusinessProfile, ToastState } from "@/types/settings";
import { BusinessGeneralForm } from "./business/BusinessGeneralForm";
import { BusinessScheduleCard } from "./business/BusinessScheduleCard";
import { BusinessServicesCatalog } from "./business/BusinessServicesCatalog";

interface BusinessSectionProps {
  profile: BusinessProfile;
  setProfile: React.Dispatch<React.SetStateAction<BusinessProfile>>;
  businessId: string;
  setToast: (toast: ToastState) => void;
}

export default function BusinessSection({
  profile,
  setProfile,
  businessId,
  setToast,
}: BusinessSectionProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200 mt-2">
      {/* 1. Top Identity, Contact & Public Booking Portal */}
      <BusinessGeneralForm
        profile={profile}
        setProfile={setProfile}
        businessId={businessId}
        setToast={setToast}
      />

      {/* 2. Services Catalog */}
      <BusinessServicesCatalog businessId={businessId} setToast={setToast} />

      {/* 3. Disponibilidad: horario semanal y festivos, lado a lado */}
      <BusinessScheduleCard businessId={businessId} setToast={setToast} />
    </div>
  );
}
