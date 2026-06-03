"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="rounded-none bg-solar text-white hover:bg-green-600 uppercase tracking-widest text-[10px] px-8 h-12 shadow-lg shadow-green-500/20">
          <Plus className="mr-2 h-4 w-4" /> Agendar Cita
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] sm:h-[60vh] rounded-t-[32px] border-none px-8 py-12">
        <div className="max-w-md mx-auto space-y-8">
          <SheetHeader className="text-left space-y-2">
            <SheetTitle className="text-4xl font-display font-bold">Nueva Cita</SheetTitle>
            <SheetDescription className="text-xs uppercase tracking-widest text-neutral-400">
              Rellena los datos para confirmar la reserva.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-neutral-400">Nombre del Cliente</Label>
              <Input
                {...register("clientName")}
                placeholder="Ej: María García"
                className="rounded-none border-t-0 border-x-0 border-b border-neutral-200 focus-visible:ring-0 focus-visible:border-solar px-0 text-xl font-display"
              />
              {errors.clientName && <p className="text-[10px] text-red-500">{errors.clientName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-neutral-400">Teléfono (WhatsApp)</Label>
              <Input
                {...register("clientPhone")}
                placeholder="34600000000"
                className="rounded-none border-t-0 border-x-0 border-b border-neutral-200 focus-visible:ring-0 focus-visible:border-solar px-0 text-xl font-display"
              />
              {errors.clientPhone && <p className="text-[10px] text-red-500">{errors.clientPhone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-neutral-400">Fecha y Hora</Label>
              <Input
                {...register("appointmentDate")}
                type="datetime-local"
                className="rounded-none border-t-0 border-x-0 border-b border-neutral-200 focus-visible:ring-0 focus-visible:border-solar px-0"
              />
              {errors.appointmentDate && <p className="text-[10px] text-red-500">{errors.appointmentDate.message}</p>}
            </div>

            <div className="pt-8">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-16 rounded-none bg-[#1A1A1A] text-white hover:bg-neutral-800 uppercase tracking-widest text-xs dark:bg-white dark:text-black"
              >
                {loading ? "Confirmando..." : "Confirmar y Enviar WhatsApp"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
