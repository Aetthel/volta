/**
 * Business Hours & Time Slot Validation Utility
 */

/**
 * Validates if an appointment time falls within business opening hours.
 *
 * @param {Array} businessHoursList - Array of BusinessHours records from database
 * @param {Date|string} appointmentDate - The requested appointment start date/time
 * @param {number} durationMinutes - Duration of the service in minutes (default 30)
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateBusinessHours(businessHoursList, appointmentDate, durationMinutes = 30) {
  if (!businessHoursList || !Array.isArray(businessHoursList) || businessHoursList.length === 0) {
    // If no business hours configured, default to open
    return { valid: true };
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

  const [openHour, openMin] = dayHours.openTime.split(":").map(Number);
  const [closeHour, closeMin] = dayHours.closeTime.split(":").map(Number);

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
 *
 * @param {Array} businessHoursList - Array of BusinessHours records
 * @param {Array} existingAppointments - Array of existing active appointments for the day
 * @param {string} dateStr - Target date in YYYY-MM-DD format
 * @param {number} durationMinutes - Duration of the requested service
 * @param {number} capacity - Capacity limit per slot (default 1)
 * @param {number} intervalMinutes - Granularity of slot start times (default 30)
 * @returns {Array<string>} Array of available time strings ("HH:MM")
 */
export function calculateAvailableSlots(
  businessHoursList,
  existingAppointments,
  dateStr,
  durationMinutes = 30,
  capacity = 1,
  intervalMinutes = 30
) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const targetDate = new Date(year, month - 1, day);
  const dayOfWeek = targetDate.getDay();

  const dayHours = (businessHoursList || []).find((h) => h.dayOfWeek === dayOfWeek);
  if (!dayHours || dayHours.isClosed) {
    return [];
  }

  const [openHour, openMin] = dayHours.openTime.split(":").map(Number);
  const [closeHour, closeMin] = dayHours.closeTime.split(":").map(Number);

  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;
  const duration = Number(durationMinutes || 30);
  const cap = Number(capacity || 1);

  const slots = [];

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
