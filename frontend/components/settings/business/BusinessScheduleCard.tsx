"use client";

import type { ToastState } from "@/types/settings";
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
    <section className="w-full pt-10">
      <div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <BusinessHoursGrid businessId={businessId} setToast={setToast} />
          </div>

          <div>
            <BusinessHolidaysGrid businessId={businessId} setToast={setToast} />
          </div>
        </div>
      </div>
    </section>
  );
};
