"use client";

import type { BusinessProfile } from "@/types/settings";
import { BusinessGeneralForm } from "./business/BusinessGeneralForm";
import { BusinessScheduleCard } from "./business/BusinessScheduleCard";
import { BusinessServicesCatalog } from "./business/BusinessServicesCatalog";

interface BusinessSectionProps {
  profile: BusinessProfile;
  setProfile: React.Dispatch<React.SetStateAction<BusinessProfile>>;
  businessId: string;
}

export default function BusinessSection({
  profile,
  setProfile,
  businessId,
}: BusinessSectionProps) {
  return (
    <div className="animate-in fade-in duration-200">
      {/* 1. Top Identity, Contact & Public Booking Portal */}
      <BusinessGeneralForm
        profile={profile}
        setProfile={setProfile}
        businessId={businessId}
      />

      {/* 2. Services Catalog */}
      <BusinessServicesCatalog businessId={businessId} />

      {/* 3. Disponibilidad: horario semanal y festivos, lado a lado */}
      <BusinessScheduleCard businessId={businessId} />
    </div>
  );
}
