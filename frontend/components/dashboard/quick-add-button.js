"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

const appointmentSchema = z.object({
  clientName: z.string().min(2, "El nombre es muy corto"),
  clientPhone: z.string().min(9, "Formato: 34600000000"),
  appointmentDate: z.string().min(10, "Selecciona una fecha y hora"),
});

export default function QuickAddButton({ businessId }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      appointmentDate: new Date().toISOString().slice(0, 16),
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          businessId,
        }),
      });

      if (!response.ok) throw new Error("Error al agendar");

      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div open={open} onOpenChange={setOpen}>
      <button asChild>
        <button >
          <span>[Plus]</span> Agendar Cita
        </button>
      </button>
      <div side="bottom" >
        <div >
          <div >
            <h2 >Nueva Cita</h2>
            <p >
              Rellena los datos para confirmar la reserva.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} >
            <div >
              <label >Nombre del Cliente</label>
              <input
                {...register("clientName")}
                placeholder="Ej: María García"
                
              />
              {errors.clientName && <p >{errors.clientName.message}</p>}
            </div>

            <div >
              <label >Teléfono (WhatsApp)</label>
              <input
                {...register("clientPhone")}
                placeholder="34600000000"
                
              />
              {errors.clientPhone && <p >{errors.clientPhone.message}</p>}
            </div>

            <div >
              <label >Fecha y Hora</label>
              <input
                {...register("appointmentDate")}
                type="datetime-local"
                
              />
              {errors.appointmentDate && <p >{errors.appointmentDate.message}</p>}
            </div>

            <div >
              <button
                type="submit"
                disabled={loading}
                
              >
                {loading ? "Confirmando..." : "Confirmar y Enviar WhatsApp"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
