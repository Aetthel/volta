import prisma from "../config/db.js";
import { ApiResponse, normalizePhone } from "../utils/index.js";
import { validateBusinessHours, calculateAvailableSlots } from "../utils/businessHours.js";
import { getHolidayForDate, getObservedHolidays } from "../utils/holidays.js";
import * as bookingIdentityService from "../services/bookingIdentityService.js";
import { z } from "zod";
import type { Request, Response } from "express";
import type { BookingRequest } from "../middleware/bookingSession.js";

const createBookingSchema = z.object({
  businessId: z.string().min(1, "businessId es requerido"),
  serviceId: z.string().min(1, "serviceId es requerido"),
  appointmentDate: z.string().min(1, "Fecha de cita no válida"),
  clientEmail: z.string().email("Formato de correo no válido").optional().or(z.literal("")),
});

const isBookingOpen = (business: any) =>
  business &&
  business.enablePublicBooking !== false &&
  business.subscriptionStatus !== "EXPIRED" &&
  business.subscriptionStatus !== "CANCELLED";

const BOOKING_CLOSED_MESSAGE =
  "Las reservas públicas no están disponibles actualmente para este negocio.";

export const getPublicBusinessProfile = async (req: Request, res: Response) => {
  const { businessId } = req.params as { businessId: string };

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

export const getPublicBusinessData = async (req: BookingRequest, res: Response) => {
  const { businessId } = req.params as { businessId: string };

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
      phone: req.bookingIdentity?.phone,
      name: req.bookingIdentity?.name || req.bookingIdentity?.fullName,
    },
  });
};

export const getAvailableSlots = async (req: Request, res: Response) => {
  const { businessId } = req.params as { businessId: string };
  const { serviceId, date } = req.query as { serviceId?: string; date?: string };

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

  const holidayPreferences = await prisma.businessHoliday.findMany({
    where: { businessId },
    select: { holidayKey: true, isObserved: true },
  });

  const [holidayYear, holidayMonth, holidayDay] = String(date).split("-").map(Number);
  const holiday = getHolidayForDate(
    holidayPreferences,
    new Date(holidayYear!, holidayMonth! - 1, holidayDay!)
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
  const dayStart = new Date(year!, month! - 1, day!, 0, 0, 0, 0);
  const dayEnd = new Date(year!, month! - 1, day!, 23, 59, 59, 999);

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

const assertBookingOpen = async (businessId: string) => {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, enablePublicBooking: true, subscriptionStatus: true },
  });

  if (!business) {
    const error: any = new Error("Negocio no encontrado");
    error.statusCode = 404;
    throw error;
  }

  if (!isBookingOpen(business)) {
    const error: any = new Error(BOOKING_CLOSED_MESSAGE);
    error.statusCode = 403;
    throw error;
  }
};

const respondWithError = (res: Response, error: any) => {
  if (error.statusCode) {
    const body: Record<string, any> = { error: error.message };
    if (error.retryAfterSeconds) body.retryAfterSeconds = error.retryAfterSeconds;
    if (error.attemptsLeft !== undefined) body.attemptsLeft = error.attemptsLeft;
    if (error.expired) body.expired = true;
    return res.status(error.statusCode).json(body);
  }
  throw error;
};

export const startIdentity = async (req: Request, res: Response) => {
  const { businessId } = req.params as { businessId: string };
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

export const resendIdentityCode = startIdentity;

export const verifyIdentity = async (req: Request, res: Response) => {
  const { businessId } = req.params as { businessId: string };
  const { phone, code } = req.body;

  try {
    await assertBookingOpen(businessId);

    const result = await bookingIdentityService.verifyCode({ businessId, phone, code });

    return ApiResponse.success(res, result);
  } catch (error) {
    return respondWithError(res, error);
  }
};

export const createPublicBooking = async (req: BookingRequest, res: Response) => {
  const validationResult = createBookingSchema.safeParse(req.body);

  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0]?.message || "Datos de reserva no válidos.";
    return res.status(400).json({ error: firstError, details: validationResult.error.issues });
  }

  const { businessId, serviceId, appointmentDate, clientEmail } = validationResult.data;

  const clientPhone = normalizePhone(req.bookingIdentity?.phone);
  const clientName = (req.bookingIdentity?.name || req.bookingIdentity?.fullName || "").trim();

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

  if (business.hours && business.hours.length > 0) {
    const hoursCheck = validateBusinessHours(business.hours, targetDate, service.duration || 30);
    if (!hoursCheck.valid) {
      return res.status(400).json({ error: hoursCheck.reason });
    }
  }

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
        const error: any = new Error(
          "El horario seleccionado ya está ocupado o no tiene capacidad disponible."
        );
        error.statusCode = 409;
        throw error;
      }

      const client = await tx.client.upsert({
        where: { businessId_phone: { businessId, phone: clientPhone } },
        update: {},
        create: {
          name: firstName!,
          surname: restOfName.join(" "),
          phone: clientPhone,
          email: clientEmail ? clientEmail.trim() : null,
          businessId,
          frequentService: service.name,
          lopdStatus: "Pendiente",
          lastVisit: new Date(),
        },
      });

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
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error al crear la reserva" });
  }
};

export default {
  getPublicBusinessProfile,
  getPublicBusinessData,
  getAvailableSlots,
  startIdentity,
  resendIdentityCode,
  verifyIdentity,
  createPublicBooking,
};
