"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Users, ArrowRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import TrialBanner from "@/components/TrialBanner";
import Header from "@/components/Header";
import { Card, Button } from "@/components/ui/volta-ui";
import dynamicImport from "next/dynamic";

const NewAppointmentModal = dynamicImport(() => import("@/components/NewAppointmentModal"), {
  ssr: false,
});

export default function EquipoPage() {
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
                Gestión de Equipo
              </h1>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Administra los trabajadores, turnos, horarios y permisos de tu negocio.
              </p>
            </div>
            <div className="shrink-0">
              <Header />
            </div>
          </div>

          {/* Clean Placeholder Content */}
          <Card className="flex-1 flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-outline-variant/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[400px]">
            <div className="w-16 h-16 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-on-surface mb-2">
              Panel de Equipo y Empleados
            </h2>
            <p className="text-sm text-on-surface-variant text-center max-w-md mb-6 leading-relaxed">
              Puedes gestionar la lista de trabajadores y sus accesos desde la sección de ajustes de negocio.
            </p>
            <Link href="/ajustes">
              <Button variant="primary" size="md" className="flex items-center gap-2">
                <span>Ir a Ajustes de Trabajadores</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
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
