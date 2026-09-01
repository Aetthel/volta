import prisma from "../config/db.js";
import { ApiResponse, normalizePhone } from "../utils/index.js";
import { validateBusinessHours, calculateAvailableSlots } from "../utils/businessHours.js";
import { getHolidayForDate, getObservedHolidays } from "../utils/holidays.js";
import * as bookingIdentityService from "../services/bookingIdentityService.js";
import { z } from "zod";

const createBookingSchema = z.object({
  businessId: z.string().min(1, "businessId es requerido"),
  serviceId: z.string().min(1, "serviceId es requerido"),
  appointmentDate: z.string().min(1, "Fecha de cita no válida"),
  clientEmail: z.string().email("Formato de correo no válido").optional().or(z.literal("")),
});

/**
 * El portal solo acepta reservas si el negocio las tiene activadas y su
 * suscripción sigue viva.
 */
const isBookingOpen = (business) =>
  business &&
  business.enablePublicBooking !== false &&
  business.subscriptionStatus !== "EXPIRED" &&
  business.subscriptionStatus !== "CANCELLED";

const BOOKING_CLOSED_MESSAGE =
  "Las reservas públicas no están disponibles actualmente para este negocio.";

/**
 * Datos de marca del negocio, sin sesión: es lo único que necesita la pantalla
 * de identificación para pintarse. El catálogo, los horarios y los datos de
 * contacto viven detrás de la verificación del teléfono.
 */
export const getPublicBusinessProfile = async (req, res) => {
  const { businessId } = req.params;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      id: true,
      name: true,
      address: true,
      logoUrl: true,
      coverUrl: true,
      description: true,
      themeColor: true,
      enablePublicBooking: true,
      subscriptionStatus: true,
    },
  });

  if (!business) {
    return res.status(404).json({ error: "Negocio no encontrado" });
  }

  if (!isBookingOpen(business)) {
    return res.status(403).json({ error: BOOKING_CLOSED_MESSAGE });
  }

  const { subscriptionStatus: _status, ...profile } = business;
  return ApiResponse.success(res, profile);
};

/** Catálogo completo. Exige sesión de reserva (`requireBookingSession`). */
export const getPublicBusinessData = async (req, res) => {
  const { businessId } = req.params;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      logoUrl: true,
      coverUrl: true,
      description: true,
      themeColor: true,
      enablePublicBooking: true,
      subscriptionStatus: true,
      hours: {
        orderBy: { dayOfWeek: "asc" },
      },
      services: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!business) {
    return res.status(404).json({ error: "Negocio no encontrado" });
  }

  if (!isBookingOpen(business)) {
    return res.status(403).json({ error: BOOKING_CLOSED_MESSAGE });
  }

  // Los festivos viajan ya resueltos a fechas: el asistente solo tiene que
  // deshabilitarlas, sin duplicar el cálculo de la Pascua en el navegador.
  const holidayPreferences = await prisma.businessHoliday.findMany({
    where: { businessId },
    select: { holidayKey: true, isObserved: true },
  });
  const currentYear = new Date().getFullYear();

  const { subscriptionStatus: _status, ...publicData } = business;
  return ApiResponse.success(res, {
    ...publicData,
    holidays: getObservedHolidays(holidayPreferences, currentYear, currentYear + 1),
    identity: {
      phone: req.bookingIdentity.phone,
      name: req.bookingIdentity.name,
    },
  });
};

export const getAvailableSlots = async (req, res) => {
  const { businessId } = req.params;
  const { serviceId, date } = req.query; // date in YYYY-MM-DD

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
    return res.status(400).json({ error: "Debe proporcionar una fecha válida (YYYY-MM-DD)." });
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { subscriptionStatus: true, enablePublicBooking: true },
  });

  if (!isBookingOpen(business)) {
    return res.status(403).json({ error: "Las reservas públicas no están disponibles." });
  }

  const businessHours = await prisma.businessHours.findMany({
    where: { businessId },
  });

  // Un festivo observado no ofrece ningún hueco, igual que un día cerrado.
  const holidayPreferences = await prisma.businessHoliday.findMany({
    where: { businessId },
    select: { holidayKey: true, isObserved: true },
  });

  const [holidayYear, holidayMonth, holidayDay] = String(date).split("-").map(Number);
  const holiday = getHolidayForDate(
    holidayPreferences,
    new Date(holidayYear, holidayMonth - 1, holidayDay)
  );

  if (holiday.isHoliday) {
    return ApiResponse.success(res, { date, availableSlots: [], holiday: holiday.name });
  }

  let duration = 30;
  let capacity = 1;

  if (serviceId) {
    const service = await prisma.service.findUnique({
      where: { id: String(serviceId) },
    });
    if (service) {
      duration = service.duration || 30;
      capacity = service.capacity || 1;
    }
  }

  const [year, month, day] = String(date).split("-").map(Number);
  const dayStart = new Date(year, month - 1, day, 0, 0, 0, 0);
  const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      businessId,
      status: { not: "ERROR" },
      appointmentDate: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
    include: { service: true },
  });

  const slots = calculateAvailableSlots(
    businessHours,
    existingAppointments,
    String(date),
    duration,
    capacity
  );

  return ApiResponse.success(res, { date, availableSlots: slots });
};

/** Comprueba que el negocio existe y admite reservas antes de gastar un código. */
const assertBookingOpen = async (businessId) => {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, enablePublicBooking: true, subscriptionStatus: true },
  });

  if (!business) {
    const error = new Error("Negocio no encontrado");
    error.statusCode = 404;
    throw error;
  }

  if (!isBookingOpen(business)) {
    const error = new Error(BOOKING_CLOSED_MESSAGE);
    error.statusCode = 403;
    throw error;
  }
};

const respondWithError = (res, error) => {
  if (error.statusCode) {
    const body = { error: error.message };
    if (error.retryAfterSeconds) body.retryAfterSeconds = error.retryAfterSeconds;
    if (error.attemptsLeft !== undefined) body.attemptsLeft = error.attemptsLeft;
    if (error.expired) body.expired = true;
    return res.status(error.statusCode).json(body);
  }
  throw error;
};

/**
 * Paso 1: reconoce el teléfono y envía el código, o pide el nombre completo si
 * ese teléfono no consta como cliente del negocio.
 */
export const startIdentity = async (req, res) => {
  const { businessId } = req.params;
  const { phone, fullName } = req.body;

  try {
    await assertBookingOpen(businessId);

    const result = await bookingIdentityService.startVerification({
      businessId,
      phone,
      fullName,
      ipAddress: req.ip,
    });

    return ApiResponse.success(res, result);
  } catch (error) {
    return respondWithError(res, error);
  }
};

/** Reenvío de código: mismo camino que el alta, con el mismo límite. */
export const resendIdentityCode = startIdentity;

/** Paso 2: valida el código y abre la sesión de reserva. */
export const verifyIdentity = async (req, res) => {
  const { businessId } = req.params;
  const { phone, code } = req.body;

  try {
    await assertBookingOpen(businessId);

    const result = await bookingIdentityService.verifyCode({ businessId, phone, code });

    return ApiResponse.success(res, result);
  } catch (error) {
    return respondWithError(res, error);
  }
};

export const createPublicBooking = async (req, res) => {
  const validationResult = createBookingSchema.safeParse(req.body);

  if (!validationResult.success) {
    const firstError = validationResult.error.errors[0]?.message || "Datos de reserva no válidos.";
    return res.status(400).json({ error: firstError, details: validationResult.error.errors });
  }

  const { businessId, serviceId, appointmentDate, clientEmail } = validationResult.data;

  // La identidad sale siempre del token verificado. Si el cuerpo trae un
  // `clientPhone` o un `clientName`, se ignoran: son los datos que un atacante
  // manipularía para reservar en nombre de otra persona.
  const clientPhone = normalizePhone(req.bookingIdentity.phone);
  const clientName = (req.bookingIdentity.name || "").trim();

  if (!clientPhone || !clientName) {
    return res.status(401).json({
      error: "Tu sesión ha caducado. Vuelve a verificar tu teléfono.",
      code: "BOOKING_SESSION_INVALID",
    });
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { hours: true },
  });

  if (!business) {
    return res.status(404).json({ error: "Negocio no encontrado" });
  }

  if (!isBookingOpen(business)) {
    return res.status(403).json({ error: BOOKING_CLOSED_MESSAGE });
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service || !service.isActive || service.businessId !== businessId) {
    return res.status(404).json({ error: "Servicio no disponible" });
  }

  const targetDate = new Date(appointmentDate);
  if (isNaN(targetDate.getTime())) {
    return res.status(400).json({ error: "Fecha de cita no válida" });
  }

  // 1. Business Hours Validation
  if (business.hours && business.hours.length > 0) {
    const hoursCheck = validateBusinessHours(business.hours, targetDate, service.duration || 30);
    if (!hoursCheck.valid) {
      return res.status(400).json({ error: hoursCheck.reason });
    }
  }

  // 1.b Festivos: el portal no los ofrece, pero una petición directa sí podría
  // colarlos, así que se rechazan aquí igual que un día fuera de horario.
  const holidayPreferences = await prisma.businessHoliday.findMany({
    where: { businessId },
    select: { holidayKey: true, isObserved: true },
  });

  const holiday = getHolidayForDate(holidayPreferences, targetDate);
  if (holiday.isHoliday) {
    return res.status(400).json({
      error: `El negocio está cerrado por festivo (${holiday.name}).`,
    });
  }

  // 2. Slot Collision & Capacity Check in an atomic transaction
  const duration = service.duration || 30;
  const capacity = service.capacity || 1;
  const requestedStart = targetDate;
  const requestedEnd = new Date(requestedStart.getTime() + duration * 60 * 1000);

  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  const [firstName, ...restOfName] = clientName.split(/\s+/);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingAppointments = await tx.appointment.findMany({
        where: {
          businessId,
          status: { not: "ERROR" },
          appointmentDate: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
        include: { service: true },
      });

      const overlappingCount = existingAppointments.filter((appt) => {
        const apptStart = new Date(appt.appointmentDate);
        const apptDuration = appt.service?.duration || 30;
        const apptEnd = new Date(apptStart.getTime() + apptDuration * 60 * 1000);

        return apptStart < requestedEnd && apptEnd > requestedStart;
      }).length;

      if (overlappingCount >= capacity) {
        const error = new Error(
          "El horario seleccionado ya está ocupado o no tiene capacidad disponible."
        );
        error.statusCode = 409;
        throw error;
      }

      // El teléfono es la clave del cliente dentro del negocio: el upsert sobre
      // (businessId, phone) hace el alta idempotente, así que dos reservas
      // simultáneas del mismo número nuevo no crean dos fichas.
      const client = await tx.client.upsert({
        where: { businessId_phone: { businessId, phone: clientPhone } },
        update: {},
        create: {
          name: firstName,
          surname: restOfName.join(" "),
          phone: clientPhone,
          email: clientEmail ? clientEmail.trim() : null,
          businessId,
          frequentService: service.name,
          lopdStatus: "Pendiente",
          lastVisit: new Date(),
        },
      });

      // Un cliente que ya existía sin email aprovecha el que acaba de dar; nunca
      // se pisa un dato que el negocio ya tenía.
      if (clientEmail && !client.email) {
        await tx.client.update({
          where: { id: client.id },
          data: { email: clientEmail.trim() },
        });
      }

      const appointment = await tx.appointment.create({
        data: {
          businessId,
          serviceId,
          clientId: client.id,
          clientName,
          clientPhone,
          serviceName: service.name,
          appointmentDate: targetDate,
          status: "PENDING",
        },
      });

      return { appointment, client, service };
    });

    return ApiResponse.created(res, result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error al crear la reserva" });
  }
};
