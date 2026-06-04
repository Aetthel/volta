import { auth } from "@/auth";
import prisma from "backend/db";
import { VoltaCalendar } from "@/components/dashboard/volta-ui/calendar";
import { VoltaAgenda } from "@/components/dashboard/volta-ui/agenda";
import { VoltaFAB } from "@/components/dashboard/volta-ui/fab";

export default async function BusinessDashboard() {
  const session = await auth();
  
  // Obtener citas de hoy (Server side data fetch)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  // Mantenemos la lógica de negocio pero el UI ahora es Volta
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
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Sidebar Column: Calendar */}
        <div className="lg:col-span-4 flex flex-col gap-8 sticky top-12">
          <VoltaCalendar />
          
          <div className="bg-teal-600 rounded-[2rem] p-8 text-white">
            <h3 className="text-xl font-bold mb-2">Resumen Semanal</h3>
            <p className="text-teal-50 text-sm font-medium opacity-90">
              Tienes 24 citas programadas para esta semana. 
            </p>
            <div className="mt-6 h-2 w-full bg-teal-800/50 rounded-full overflow-hidden">
              <div className="h-full bg-white w-2/3 rounded-full" />
            </div>
            <p className="mt-3 text-xs font-bold text-teal-100 uppercase tracking-wider">
              60% Capacidad alcanzada
            </p>
          </div>
        </div>

        {/* Main Column: Agenda */}
        <div className="lg:col-span-8">
          <VoltaAgenda appointments={appointments} />
        </div>
      </div>

      {/* Floating Action Button */}
      <VoltaFAB />
    </div>
  );
}
