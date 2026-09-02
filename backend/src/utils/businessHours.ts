/**
 * Business Hours & Time Slot Validation Utility
 */

export interface BusinessHourRecord {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface AppointmentSlotCheck {
  status?: string;
  appointmentDate: string | Date;
  service?: {
    duration?: number;
  } | null;
}

export interface BusinessHoursValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validates if an appointment time falls within business opening hours.
 */
export function validateBusinessHours(
  businessHoursList?: BusinessHourRecord[] | null,
  appointmentDate?: Date | string | null,
  durationMinutes = 30
): BusinessHoursValidationResult {
  if (!businessHoursList || !Array.isArray(businessHoursList) || businessHoursList.length === 0) {
    return { valid: true };
  }

  if (!appointmentDate) {
    return { valid: false, reason: "Fecha de cita no proporcionada" };
  }

  const date = new Date(appointmentDate);
  if (isNaN(date.getTime())) {
    return { valid: false, reason: "Fecha de cita no válida" };
  }

  const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  const dayHours = businessHoursList.find((h) => h.dayOfWeek === dayOfWeek);

  if (!dayHours || dayHours.isClosed) {
    return { valid: false, reason: "El negocio está cerrado en el día seleccionado." };
  }

  const [openHour = 0, openMin = 0] = dayHours.openTime.split(":").map(Number);
  const [closeHour = 0, closeMin = 0] = dayHours.closeTime.split(":").map(Number);

  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  const startMinutes = date.getHours() * 60 + date.getMinutes();
  const endMinutes = startMinutes + Number(durationMinutes || 30);

  if (startMinutes < openMinutes) {
    return {
      valid: false,
      reason: `La cita comienza antes del horario de apertura (${dayHours.openTime}).`,
    };
  }

  if (endMinutes > closeMinutes) {
    return {
      valid: false,
      reason: `La cita finaliza después del horario de cierre (${dayHours.closeTime}).`,
    };
  }

  return { valid: true };
}

/**
 * Calculates available time slots for a given day.
 */
export function calculateAvailableSlots(
  businessHoursList: BusinessHourRecord[] | null | undefined,
  existingAppointments: AppointmentSlotCheck[] | null | undefined,
  dateStr: string,
  durationMinutes = 30,
  capacity = 1,
  intervalMinutes = 30
): string[] {
  const [year = 2026, month = 1, day = 1] = dateStr.split("-").map(Number);
  const targetDate = new Date(year, month - 1, day);
  const dayOfWeek = targetDate.getDay();

  const dayHours = (businessHoursList || []).find((h) => h.dayOfWeek === dayOfWeek);
  if (!dayHours || dayHours.isClosed) {
    return [];
  }

  const [openHour = 0, openMin = 0] = dayHours.openTime.split(":").map(Number);
  const [closeHour = 0, closeMin = 0] = dayHours.closeTime.split(":").map(Number);

  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;
  const duration = Number(durationMinutes || 30);
  const cap = Number(capacity || 1);

  const slots: string[] = [];

  for (let minutes = openMinutes; minutes + duration <= closeMinutes; minutes += intervalMinutes) {
    const slotHour = Math.floor(minutes / 60);
    const slotMin = minutes % 60;

    const slotStart = new Date(year, month - 1, day, slotHour, slotMin, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);

    // Count overlapping active appointments
    const overlappingCount = (existingAppointments || []).filter((appt) => {
      if (appt.status === "ERROR") return false;
      const apptStart = new Date(appt.appointmentDate);
      const apptDuration = appt.service?.duration || 30;
      const apptEnd = new Date(apptStart.getTime() + apptDuration * 60 * 1000);

      return apptStart < slotEnd && apptEnd > slotStart;
    }).length;

    if (overlappingCount < cap) {
      const formattedHour = String(slotHour).padStart(2, "0");
      const formattedMin = String(slotMin).padStart(2, "0");
      slots.push(`${formattedHour}:${formattedMin}`);
    }
  }

  return slots;
}

export default { validateBusinessHours, calculateAvailableSlots };
