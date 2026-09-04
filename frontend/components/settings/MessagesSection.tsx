"use client";

import { useSession } from "next-auth/react";
import { hasFeatureAccess } from "@/lib/permissions";
import { WhatsAppConnectionCard } from "./messages/WhatsAppConnectionCard";
import { WhatsAppTemplatesEditor } from "./messages/WhatsAppTemplatesEditor";

interface MessagesSectionProps {
  businessId: string;
  profileName: string;
}

export default function MessagesSection({
  businessId,
  profileName,
}: MessagesSectionProps) {
  const { data: session } = useSession();
  const subscriptionPlan = session?.user?.subscriptionPlan || "BASIC";
  const subscriptionStatus = session?.user?.subscriptionStatus || "ACTIVE";
  const hasWhatsApp = hasFeatureAccess(subscriptionPlan, subscriptionStatus, "whatsappTwoWayBot");

  return (
    <div className="animate-in fade-in duration-200">
      {/* 1. WhatsApp Instance Connection & QR Scanner */}
      <WhatsAppConnectionCard
        businessId={businessId}
        hasWhatsApp={hasWhatsApp}
      />

      {/* 2. Message Templates Editor & Live Phone Simulator */}
      <WhatsAppTemplatesEditor
        businessId={businessId}
        profileName={profileName}
      />
    </div>
  );
}
