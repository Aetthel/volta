"use client";

import type { ToastState } from "@/types/settings";
import { CalendarClock } from "lucide-react";
import { SectionHeading } from "../SectionHeading";
import { BusinessHoursGrid } from "./BusinessHoursGrid";
import { BusinessHolidaysGrid } from "./BusinessHolidaysGrid";

interface BusinessScheduleCardProps {
  businessId: string;
  setToast: (toast: ToastState) => void;
}

/**
 * Disponibilidad del negocio en un solo bloque: el horario semanal a la
 * izquierda y los festivos a la derecha.
 *
 * Cada panel guarda por su cuenta porque golpean endpoints distintos
 * (`/hours` y `/holidays`), de ahí que cada columna tenga su propio botón.
 */
export const BusinessScheduleCard: React.FC<BusinessScheduleCardProps> = ({
  businessId,
  setToast,
}) => {
  return (
    <section className="w-full pt-12 border-t border-outline-variant/50">
      <SectionHeading
        icon={CalendarClock}
        title="Disponibilidad"
        description="Cuándo atiende tu negocio. Lo que cierres aquí se bloquea en la agenda y en el portal de reservas de clientes."
      />

      <div>
        {/* En pantallas estrechas las columnas se apilan; el separador pasa de
            vertical a horizontal para no dejar una línea suelta a media altura. */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="lg:border-r lg:border-outline-variant/40 lg:pr-8">
            <BusinessHoursGrid businessId={businessId} setToast={setToast} />
          </div>

          <div className="border-t border-outline-variant/40 pt-6 lg:border-t-0 lg:pt-0">
            <BusinessHolidaysGrid businessId={businessId} setToast={setToast} />
          </div>
        </div>
      </div>
    </section>
  );
};
