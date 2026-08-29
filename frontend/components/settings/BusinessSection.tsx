"use client";

import type { BusinessProfile, ToastState } from "@/types/settings";
import { BusinessGeneralForm } from "./business/BusinessGeneralForm";
import { BusinessHoursGrid } from "./business/BusinessHoursGrid";
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

      {/* 2. Main 2-Column Grid: Services & Operating Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Services Catalog (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <BusinessServicesCatalog
            businessId={businessId}
            setToast={setToast}
          />
        </div>

        {/* Right Column: Operating Hours (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <BusinessHoursGrid
            businessId={businessId}
            setToast={setToast}
          />
        </div>
      </div>
    </div>
  );
}
