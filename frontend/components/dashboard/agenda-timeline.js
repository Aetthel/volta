"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Phone, Trash2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function AgendaTimeline({ initialAppointments }) {
  const router = useRouter();

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      router.refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  if (initialAppointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 border border-dashed border-neutral-200 dark:border-neutral-800">
        <p className="text-sm text-neutral-400 font-sans italic">No hay citas programadas para hoy.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-200 before:to-transparent dark:before:via-neutral-800">
      {initialAppointments.map((appt) => (
        <div key={appt.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
          {/* Dot */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 text-neutral-400 group-hover:bg-solar group-hover:text-white transition-colors shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm">
            <Clock className="h-4 w-4" />
          </div>

          {/* Content */}
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-none hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <time className="text-xl font-display font-bold">
                {format(new Date(appt.appointmentDate), "HH:mm")}
              </time>
              <Badge className={cn(
                "rounded-none text-[9px] uppercase tracking-widest font-normal px-2 py-0.5",
                appt.status === "SENT" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                appt.status === "ERROR" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
              )}>
                {appt.status === "SENT" ? "Enviado" : appt.status === "ERROR" ? "Error" : "Pendiente"}
              </Badge>
            </div>
            
            <div className="flex items-end justify-between">
              <div className="space-y-2">
                <div className="flex items-center text-sm font-sans">
                  <User className="mr-2 h-4 w-4 text-neutral-300" />
                  <span className="font-medium">{appt.clientName}</span>
                </div>
                <div className="flex items-center text-xs text-neutral-500 font-mono">
                  <Phone className="mr-2 h-3.5 w-3.5 text-neutral-300" />
                  {appt.clientPhone}
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-none border-none">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display text-2xl">¿Eliminar cita?</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-neutral-500 font-sans">
                      Esta acción no se puede deshacer. Se eliminará el registro de la cita de **{appt.clientName}**.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel className="rounded-none uppercase tracking-widest text-[10px]">Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDelete(appt.id)}
                      className="rounded-none bg-red-500 text-white hover:bg-red-600 uppercase tracking-widest text-[10px]"
                    >
                      Eliminar permanentemente
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}
