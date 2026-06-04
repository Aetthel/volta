"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";

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
      <div>
        <p>No hay citas programadas para hoy.</p>
      </div>
    );
  }

  return (
    <div>
      {initialAppointments.map((appt) => (
        <div key={appt.id}>
          {/* Dot */}
          <div>
            <span>[Clock]</span>
          </div>

          {/* Content */}
          <div>
            <div>
              <time>
                {format(new Date(appt.appointmentDate), "HH:mm")}
              </time>
              <span>
                {appt.status === "SENT" ? "Enviado" : appt.status === "ERROR" ? "Error" : "Pendiente"}
              </span>
            </div>
            
            <div>
              <div>
                <div>
                  <span>[User]</span>
                  <span>{appt.clientName}</span>
                </div>
                <div>
                  <span>[Phone]</span>
                  {appt.clientPhone}
                </div>
              </div>

              <div>
                <button onClick={() => {
                  if (confirm("¿Eliminar cita? Esta acción no se puede deshacer.")) {
                    handleDelete(appt.id);
                  }
                }}>
                  <span>[Trash2]</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
