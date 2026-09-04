import prisma from "../config/db.js";
import { Prisma } from "../generated/client/index.js";
// @ts-ignore - botService is an existing JS module
import { sendConsentMessage } from "./botService.js";
import { resolveOrCreateClient } from "./clientsService.js";
import { normalizePhone } from "../utils/index.js";
import { getObservedHolidays } from "../utils/holidays.js";
import type { BusinessHourRecord } from "../utils/businessHours.js";
import { logger } from "../utils/logger.js";
import {
  addCivilDays,
  civilDateKey,
  civilDateToUtcMidnight,
  civilDayOfWeek,
  compareCivilDates,
  parseCivilDate,
  parseTimeOfDay,
  todayCivilDate,
  utcMidnightToCivilDate,
  zonedTimeToUtc,
  type CivilDate,
} from "../utils/timezone.js";

/**
 * Clases de grupo recurrentes: "los martes a las 11:30" se programa una vez y las
 * sesiones concretas se van creando solas.
 *
 * La programación (`ClassSchedule`) es la fuente de verdad y las sesiones se
 * materializan como citas normales hasta un horizonte móvil de HORIZON_WEEKS
 * semanas, que se extiende cada vez que alguien abre la agenda. Así el resto del
 * producto —aforo, arrastrar y soltar, recordatorios, reserva online— sigue
 * trabajando con citas y no necesita saber nada de recurrencias.
 */
const HORIZON_WEEKS = 16;

const WEEKDAY_LABELS = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
] as const;

export interface ScheduleAttendee {
  name: string;
  phone?: string | null;
  clientId?: string | null;
}

export interface CreateClassScheduleInput {
  businessId: string;
  service?: string | null;
  serviceId?: string | null;
  daysOfWeek: number[];
  startTime: string;
  startDate: string;
  endDate?: string | null;
  repeatClients?: boolean;
  attendees?: ScheduleAttendee[];
}

export interface UpdateClassScheduleInput {
  daysOfWeek?: number[];
  startTime?: string;
  endDate?: string | null;
  repeatClients?: boolean;
  attendees?: ScheduleAttendee[];
  isActive?: boolean;
}

interface GenerationContext {
  hours: BusinessHourRecord[];
  holidayDates: Set<string>;
}

const badRequest = (message: string, statusCode = 400) => {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = statusCode;
  return error;
};

const readAttendees = (value: unknown): ScheduleAttendee[] => {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is ScheduleAttendee =>
      !!item && typeof item === "object" && typeof (item as ScheduleAttendee).name === "string"
  );
};

/**
 * Horario semanal y festivos observados del negocio, resueltos una sola vez por
 * pasada: materializar meses de clases no debe recalcular el catálogo de festivos
 * (que incluye la Pascua) en cada día del horizonte.
 */
const loadGenerationContext = async (businessId: string): Promise<GenerationContext> => {
  const [hours, holidayPreferences] = await Promise.all([
    prisma.businessHours.findMany({
      where: { businessId },
      select: { dayOfWeek: true, openTime: true, closeTime: true, isClosed: true },
    }),
    prisma.businessHoliday.findMany({
      where: { businessId },
      select: { holidayKey: true, isObserved: true },
    }),
  ]);

  const currentYear = todayCivilDate().year;
  const holidays = getObservedHolidays(holidayPreferences, currentYear, currentYear + 1);

  return {
    hours: hours as BusinessHourRecord[],
    holidayDates: new Set(holidays.map((holiday) => holiday.date)),
  };
};

/**
 * Comprueba que la clase cabe en el horario de apertura de cada día elegido.
 *
 * Se valida al programarla y no en cada sesión: si el jefe pide los domingos a las
 * 11:30 y los domingos cierra, es mejor decírselo en el momento que generar en
 * silencio una serie vacía.
 */
const findScheduleConflicts = (
  hours: BusinessHourRecord[],
  daysOfWeek: number[],
  startMinutes: number,
  durationMinutes: number
): string[] => {
  if (!hours.length) return [];

  const conflicts: string[] = [];
  const endMinutes = startMinutes + durationMinutes;

  for (const dayOfWeek of daysOfWeek) {
    const dayHours = hours.find((entry) => entry.dayOfWeek === dayOfWeek);
    if (!dayHours || dayHours.isClosed) {
      conflicts.push(`el negocio cierra los ${WEEKDAY_LABELS[dayOfWeek]}`);
      continue;
    }

    const [openHour = 0, openMin = 0] = dayHours.openTime.split(":").map(Number);
    const [closeHour = 0, closeMin = 0] = dayHours.closeTime.split(":").map(Number);
    const open = openHour * 60 + openMin;
    const close = closeHour * 60 + closeMin;

    if (startMinutes < open || endMinutes > close) {
      conflicts.push(
        `los ${WEEKDAY_LABELS[dayOfWeek]} el horario es ${dayHours.openTime}-${dayHours.closeTime}`
      );
    }
  }

  return conflicts;
};

/** Días de calendario en los que toca clase, ya descontados cierres y festivos. */
const buildOccurrenceDates = (
  from: CivilDate,
  to: CivilDate,
  daysOfWeek: Set<number>,
  ctx: GenerationContext
): CivilDate[] => {
  const dates: CivilDate[] = [];

  for (let day = from; compareCivilDates(day, to) <= 0; day = addCivilDays(day, 1)) {
    const dayOfWeek = civilDayOfWeek(day);
    if (!daysOfWeek.has(dayOfWeek)) continue;

    // Un festivo o un día de cierre no cancela la clase semanal: solo se salta esa
    // fecha, y la serie continúa a la semana siguiente.
    if (ctx.holidayDates.has(civilDateKey(day))) continue;
    const dayHours = ctx.hours.find((entry) => entry.dayOfWeek === dayOfWeek);
    if (dayHours?.isClosed) continue;

    dates.push(day);
  }

  return dates;
};

type ScheduleWithService = {
  id: string;
  businessId: string;
  serviceId: string;
  daysOfWeek: number[];
  startTime: string;
  startDate: Date;
  endDate: Date | null;
  repeatClients: boolean;
  attendees: unknown;
  generatedUntil: Date | null;
  service: { name: string; duration: number; capacity: number } | null;
};

/**
 * Crea las sesiones que faltan de una clase hasta el horizonte y avanza su marca
 * de agua.
 *
 * `generatedUntil` avanza aunque una fecha se descarte (festivo, aforo lleno), de
 * modo que una sesión borrada a mano no vuelve a aparecer en la siguiente pasada.
 */
const materializeSchedule = async (
  schedule: ScheduleWithService,
  ctx: GenerationContext
): Promise<number> => {
  const time = parseTimeOfDay(schedule.startTime);
  if (!time || !schedule.daysOfWeek.length) return 0;

  const today = todayCivilDate();
  const horizonEnd = addCivilDays(today, HORIZON_WEEKS * 7);
  const scheduleEnd = schedule.endDate ? utcMidnightToCivilDate(schedule.endDate) : null;

  let from = utcMidnightToCivilDate(schedule.startDate);
  if (schedule.generatedUntil) {
    const afterWatermark = addCivilDays(utcMidnightToCivilDate(schedule.generatedUntil), 1);
    if (compareCivilDates(afterWatermark, from) > 0) from = afterWatermark;
  }
  // Nunca se rellena hacia atrás: una clase programada hoy no inventa el pasado.
  if (compareCivilDates(today, from) > 0) from = today;

  let to = horizonEnd;
  if (scheduleEnd && compareCivilDates(scheduleEnd, to) < 0) to = scheduleEnd;

  if (compareCivilDates(from, to) > 0) {
    if (scheduleEnd && compareCivilDates(scheduleEnd, today) < 0) {
      await prisma.classSchedule.update({
        where: { id: schedule.id },
        data: { isActive: false, generatedUntil: civilDateToUtcMidnight(scheduleEnd) },
      });
    }
    return 0;
  }

  const dates = buildOccurrenceDates(from, to, new Set(schedule.daysOfWeek), ctx);
  const duration = schedule.service?.duration || 30;
  const capacity = schedule.service?.capacity || 1;

  let created = 0;

  if (dates.length > 0) {
    const starts = dates.map((date) =>
      zonedTimeToUtc(date.year, date.month, date.day, time.hours, time.minutes)
    );
    const windowStart = starts[0]!;
    const windowEnd = new Date(starts[starts.length - 1]!.getTime() + duration * 60 * 1000);

    // Una única lectura para todo el horizonte: comprobar el aforo sesión a sesión
    // dispararía cientos de consultas al abrir la agenda.
    const existing = await prisma.appointment.findMany({
      where: {
        businessId: schedule.businessId,
        status: { not: "ERROR" },
        appointmentDate: { gte: windowStart, lte: windowEnd },
      },
      select: {
        appointmentDate: true,
        classScheduleId: true,
        service: { select: { duration: true } },
      },
    });

    const attendees = readAttendees(schedule.attendees);
    const roster = schedule.repeatClients ? attendees : [];
    const clientName = roster.length
      ? roster.map((attendee) => attendee.name).join(", ")
      : schedule.service?.name || "Clase de grupo";
    const clientPhone = roster.find((attendee) => attendee.phone)?.phone || "";
    const clientId = roster.find((attendee) => attendee.clientId)?.clientId || null;

    const rows = starts
      .filter((start) => {
        const end = new Date(start.getTime() + duration * 60 * 1000);
        const overlapping = existing.filter((appointment) => {
          // Una sesión ya materializada de esta misma clase no compite consigo
          // misma: el índice único la descartará como duplicada.
          if (appointment.classScheduleId === schedule.id) return false;
          const otherStart = new Date(appointment.appointmentDate);
          const otherEnd = new Date(
            otherStart.getTime() + (appointment.service?.duration || 30) * 60 * 1000
          );
          return otherStart < end && otherEnd > start;
        }).length;

        return overlapping < capacity;
      })
      .map((start) => ({
        clientName,
        clientPhone,
        appointmentDate: start,
        businessId: schedule.businessId,
        clientId,
        serviceId: schedule.serviceId,
        serviceName: schedule.service?.name || null,
        classScheduleId: schedule.id,
        status: "PENDING" as const,
      }));

    if (rows.length > 0) {
      const result = await prisma.appointment.createMany({ data: rows, skipDuplicates: true });
      created = result.count;
    }
  }

  await prisma.classSchedule.update({
    where: { id: schedule.id },
    data: { generatedUntil: civilDateToUtcMidnight(to) },
  });

  return created;
};

const scheduleSelection = {
  id: true,
  businessId: true,
  serviceId: true,
  daysOfWeek: true,
  startTime: true,
  startDate: true,
  endDate: true,
  repeatClients: true,
  attendees: true,
  generatedUntil: true,
  isActive: true,
  createdAt: true,
  service: { select: { id: true, name: true, duration: true, capacity: true, color: true } },
} satisfies Prisma.ClassScheduleSelect;

/**
 * Extiende el horizonte de todas las clases activas del negocio.
 *
 * Se dispara al listar la agenda, así que no hace falta un proceso programado: la
 * clase de los martes sigue apareciendo mientras alguien use el panel.
 */
export const ensureSchedulesMaterialized = async (businessId: string): Promise<number> => {
  const horizonEnd = civilDateToUtcMidnight(addCivilDays(todayCivilDate(), HORIZON_WEEKS * 7));

  const pending = await prisma.classSchedule.findMany({
    where: {
      businessId,
      isActive: true,
      OR: [{ generatedUntil: null }, { generatedUntil: { lt: horizonEnd } }],
    },
    select: scheduleSelection,
  });

  if (pending.length === 0) return 0;

  const ctx = await loadGenerationContext(businessId);

  let created = 0;
  for (const schedule of pending) {
    created += await materializeSchedule(schedule as ScheduleWithService, ctx);
  }

  if (created > 0) {
    logger.info(`[ClassSchedules] ${created} sesiones generadas para el negocio ${businessId}`);
  }

  return created;
};

export const listClassSchedules = async (businessId: string) => {
  return prisma.classSchedule.findMany({
    where: { businessId },
    select: scheduleSelection,
    orderBy: [{ isActive: "desc" }, { startTime: "asc" }],
  });
};

export const getClassScheduleById = async (id: string) => {
  return prisma.classSchedule.findUnique({ where: { id }, select: scheduleSelection });
};

/**
 * Da de alta el grupo fijo de alumnos y les pide el consentimiento LOPD una sola
 * vez, no una por sesión: la serie puede tener decenas y el WhatsApp del alumno no
 * es un buzón de pruebas.
 *
 * Solo se crea ficha de cliente para quien trae teléfono. El teléfono es la clave
 * funcional del cliente dentro del negocio (`@@unique([businessId, phone])`), así
 * que apuntar a dos alumnos sin él chocaría entre sí; quien va sin teléfono se
 * queda en la lista por nombre, que es lo que se ve en la agenda, y además no hay
 * a dónde mandarle el consentimiento.
 */
const resolveRoster = async (
  businessId: string,
  attendees: ScheduleAttendee[],
  serviceName: string
): Promise<ScheduleAttendee[]> => {
  const roster: ScheduleAttendee[] = [];

  for (const attendee of attendees) {
    const name = attendee.name.trim();
    if (!name) continue;

    const phone = attendee.phone ? normalizePhone(attendee.phone) : "";
    if (!phone) {
      roster.push({ name, phone: null, clientId: null });
      continue;
    }

    const client = await resolveOrCreateClient(businessId, name, phone, serviceName);
    roster.push({ name, phone: client.phone || phone, clientId: client.id });

    if (client.lopdStatus === "Pendiente") {
      sendConsentMessage(businessId, client).catch((err: unknown) => {
        logger.error("[ClassSchedules] Error solicitando consentimiento LOPD:", err);
      });
    }
  }

  return roster;
};

export const createClassSchedule = async (input: CreateClassScheduleInput) => {
  const {
    businessId,
    service: serviceNameInput,
    serviceId,
    daysOfWeek,
    startTime,
    startDate,
    endDate,
    repeatClients = true,
    attendees = [],
  } = input;

  const service = serviceId
    ? await prisma.service.findFirst({ where: { id: serviceId, businessId, isActive: true } })
    : await prisma.service.findFirst({
        where: { businessId, name: serviceNameInput || "", isActive: true },
      });

  if (!service) {
    throw badRequest("No se ha encontrado la clase de grupo seleccionada.", 404);
  }

  if (service.type !== "GROUP" && service.capacity <= 1) {
    throw badRequest("La repetición semanal solo está disponible para clases de grupo.");
  }

  const time = parseTimeOfDay(startTime);
  if (!time) throw badRequest("La hora de la clase no es válida.");

  const uniqueDays = Array.from(new Set(daysOfWeek)).sort((a, b) => a - b);
  if (uniqueDays.length === 0 || uniqueDays.some((day) => day < 0 || day > 6)) {
    throw badRequest("Selecciona al menos un día de la semana para repetir la clase.");
  }

  const start = parseCivilDate(startDate);
  if (!start) throw badRequest("La fecha de inicio de la clase no es válida.");

  const end = endDate ? parseCivilDate(endDate) : null;
  if (endDate && !end) throw badRequest("La fecha de fin de la clase no es válida.");
  if (end && compareCivilDates(end, start) < 0) {
    throw badRequest("La fecha de fin no puede ser anterior a la de inicio.");
  }

  const ctx = await loadGenerationContext(businessId);
  const conflicts = findScheduleConflicts(
    ctx.hours,
    uniqueDays,
    time.hours * 60 + time.minutes,
    service.duration || 30
  );
  if (conflicts.length > 0) {
    throw badRequest(`La clase no cabe en tu horario de apertura: ${conflicts.join("; ")}.`);
  }

  const roster = await resolveRoster(businessId, attendees, service.name);

  const created = await prisma.classSchedule.create({
    data: {
      businessId,
      serviceId: service.id,
      daysOfWeek: uniqueDays,
      startTime: `${String(time.hours).padStart(2, "0")}:${String(time.minutes).padStart(2, "0")}`,
      startDate: civilDateToUtcMidnight(start),
      endDate: end ? civilDateToUtcMidnight(end) : null,
      repeatClients,
      attendees: roster,
    },
    select: { id: true },
  });

  const schedule = await getClassScheduleById(created.id);
  const createdSessions = schedule
    ? await materializeSchedule(schedule as ScheduleWithService, ctx)
    : 0;

  logger.info(
    `[ClassSchedules] Clase semanal ${created.id} creada con ${createdSessions} sesiones iniciales`
  );

  return { schedule: await getClassScheduleById(created.id), createdSessions };
};

/** Sesiones aún no celebradas de una serie. Las pasadas son histórico y no se tocan. */
const deleteFutureSessions = async (scheduleId: string) => {
  const { count } = await prisma.appointment.deleteMany({
    where: { classScheduleId: scheduleId, appointmentDate: { gte: new Date() } },
  });
  return count;
};

export const updateClassSchedule = async (id: string, input: UpdateClassScheduleInput) => {
  const current = await prisma.classSchedule.findUnique({ where: { id }, select: scheduleSelection });
  if (!current) throw badRequest("Clase semanal no encontrada.", 404);

  const data: Record<string, unknown> = {};
  // Cambiar días u hora reescribe la serie: hay que rehacer las sesiones futuras.
  let needsRegeneration = false;

  if (input.daysOfWeek) {
    const uniqueDays = Array.from(new Set(input.daysOfWeek)).sort((a, b) => a - b);
    if (uniqueDays.length === 0 || uniqueDays.some((day) => day < 0 || day > 6)) {
      throw badRequest("Selecciona al menos un día de la semana para repetir la clase.");
    }
    data.daysOfWeek = uniqueDays;
    needsRegeneration = true;
  }

  if (input.startTime) {
    const time = parseTimeOfDay(input.startTime);
    if (!time) throw badRequest("La hora de la clase no es válida.");
    data.startTime = `${String(time.hours).padStart(2, "0")}:${String(time.minutes).padStart(2, "0")}`;
    needsRegeneration = true;
  }

  if (input.endDate !== undefined) {
    const end = input.endDate ? parseCivilDate(input.endDate) : null;
    if (input.endDate && !end) throw badRequest("La fecha de fin de la clase no es válida.");
    data.endDate = end ? civilDateToUtcMidnight(end) : null;
    needsRegeneration = true;
  }

  if (input.repeatClients !== undefined) data.repeatClients = input.repeatClients;

  if (input.attendees) {
    data.attendees = await resolveRoster(
      current.businessId,
      input.attendees,
      current.service?.name || ""
    );
    needsRegeneration = true;
  }

  if (input.isActive !== undefined) {
    data.isActive = input.isActive;
    if (!input.isActive) await deleteFutureSessions(id);
  }

  if (needsRegeneration && data.isActive !== false) {
    await deleteFutureSessions(id);
    data.generatedUntil = null;
  }

  await prisma.classSchedule.update({ where: { id }, data });

  const updated = await getClassScheduleById(id);
  if (updated?.isActive) {
    const ctx = await loadGenerationContext(updated.businessId);
    await materializeSchedule(updated as ScheduleWithService, ctx);
    return getClassScheduleById(id);
  }

  return updated;
};

/**
 * Cancela la serie: borra las sesiones futuras y elimina la programación.
 *
 * Las sesiones ya celebradas se conservan sin vínculo (la relación es SET NULL),
 * para no borrar de la historia clases que sí ocurrieron.
 */
export const deleteClassSchedule = async (id: string) => {
  const deletedSessions = await deleteFutureSessions(id);
  await prisma.classSchedule.delete({ where: { id } });
  return { deletedSessions };
};

export default {
  ensureSchedulesMaterialized,
  listClassSchedules,
  getClassScheduleById,
  createClassSchedule,
  updateClassSchedule,
  deleteClassSchedule,
};
