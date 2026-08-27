"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Inbox } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import TrialBanner from "@/components/TrialBanner";
import Header from "@/components/Header";
import { Card } from "@/components/ui/volta-ui";
import dynamicImport from "next/dynamic";

const NewAppointmentModal = dynamicImport(() => import("@/components/NewAppointmentModal"), {
  ssr: false,
});

export default function InboxPage() {
  const { data: session } = useSession();
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  const handleSaveAppointment = async (appointmentData: any) => {
    try {
      await fetch("/api/backend/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...appointmentData,
          businessId: session?.user?.businessId,
        }),
      });
      setIsAppointmentModalOpen(false);
    } catch (err) {
      console.error("Error saving appointment:", err);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-24 md:pb-0">
      <Sidebar onNewAppointmentClick={() => setIsAppointmentModalOpen(true)} />
      <BottomNav />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen md:ml-[240px]">
        <TrialBanner />
        <main className="p-gutter max-w-container-max w-full mx-auto flex-1 flex flex-col pt-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-headline-lg text-on-surface font-semibold tracking-tight">
                Bandeja de Entrada
              </h1>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Centraliza las notificaciones, solicitudes de reserva y comunicaciones con tus clientes.
              </p>
            </div>
            <div className="shrink-0">
              <Header />
            </div>
          </div>

          {/* Clean Placeholder Content */}
          <Card className="flex-1 flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-outline-variant/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[400px]">
            <div className="w-16 h-16 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-on-surface mb-2">
              Bandeja de Entrada limpia
            </h2>
            <p className="text-sm text-on-surface-variant text-center max-w-md mb-6 leading-relaxed">
              No tienes mensajes ni notificaciones pendientes en este momento. Las respuestas a recordatorios y confirmaciones automáticas aparecerán aquí.
            </p>
          </Card>
        </main>
      </div>

      <NewAppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSave={handleSaveAppointment}
      />
    </div>
  );
}
