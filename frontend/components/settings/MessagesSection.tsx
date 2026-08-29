"use client";

import { useSession } from "next-auth/react";
import type { ToastState } from "@/types/settings";
import { hasFeatureAccess } from "@/lib/permissions";
import { WhatsAppConnectionCard } from "./messages/WhatsAppConnectionCard";
import { WhatsAppTemplatesEditor } from "./messages/WhatsAppTemplatesEditor";

interface MessagesSectionProps {
  businessId: string;
  profileName: string;
  setToast: (toast: ToastState) => void;
}

export default function MessagesSection({
  businessId,
  profileName,
  setToast,
}: MessagesSectionProps) {
  const { data: session } = useSession();
  const subscriptionPlan = session?.user?.subscriptionPlan || "BASIC";
  const subscriptionStatus = session?.user?.subscriptionStatus || "ACTIVE";
  const hasWhatsApp = hasFeatureAccess(subscriptionPlan, subscriptionStatus, "whatsappTwoWayBot");

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200 mt-2">
      {/* 1. WhatsApp Instance Connection & QR Scanner */}
      <WhatsAppConnectionCard
        businessId={businessId}
        hasWhatsApp={hasWhatsApp}
        setToast={setToast}
      />

      {/* 2. Message Templates Editor & Live Phone Simulator */}
      <WhatsAppTemplatesEditor
        businessId={businessId}
        profileName={profileName}
        setToast={setToast}
      />
    </div>
  );
}
