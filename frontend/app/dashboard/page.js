import { auth } from "@/auth";
import prisma from "backend/db";
import AgendaTimeline from "@/components/dashboard/agenda-timeline";
import QuickAddButton from "@/components/dashboard/quick-add-button";

export default async function BusinessDashboard() {
  const session = await auth();
  
  // Obtener citas de hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      businessId: session.user.id,
      appointmentDate: {
        gte: today,
        lte: endOfDay,
      },
    },
    orderBy: { appointmentDate: "asc" },
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-24">
      <header className="flex items-end justify-between border-b border-neutral-100 dark:border-neutral-900 pb-8">
        <div className="space-y-2">
          <h2 className="text-sm uppercase tracking-[0.3em] text-neutral-400">Hoy</h2>
          <h1 className="text-5xl font-display font-bold">Tu Agenda</h1>
        </div>
        <QuickAddButton businessId={session.user.id} />
      </header>

      <AgendaTimeline initialAppointments={appointments} />
    </div>
  );
}
