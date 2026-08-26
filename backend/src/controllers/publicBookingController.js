import prisma from "../config/db.js";
import { ApiResponse } from "../utils/index.js";
import { validateBusinessHours, calculateAvailableSlots } from "../utils/businessHours.js";
import { z } from "zod";

const createBookingSchema = z.object({
  businessId: z.string().min(1, "businessId es requerido"),
  serviceId: z.string().min(1, "serviceId es requerido"),
  appointmentDate: z.string().min(1, "Fecha de cita no válida"),
  clientName: z.string().min(1, "El nombre del cliente es obligatorio").trim(),
  clientPhone: z.string().min(6, "El teléfono del cliente es obligatorio").trim(),
  clientEmail: z.string().email("Formato de correo no válido").optional().or(z.literal("")),
});

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

  if (
    business.enablePublicBooking === false ||
    business.subscriptionStatus === "EXPIRED" ||
    business.subscriptionStatus === "CANCELLED"
  ) {
    return res
      .status(403)
      .json({ error: "Las reservas públicas no están disponibles actualmente para este negocio." });
  }

  const { subscriptionStatus: _, ...publicData } = business;
  return ApiResponse.success(res, publicData);
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

  if (
    !business ||
    business.enablePublicBooking === false ||
    business.subscriptionStatus === "EXPIRED" ||
    business.subscriptionStatus === "CANCELLED"
  ) {
    return res.status(403).json({ error: "Las reservas públicas no están disponibles." });
  }

  const businessHours = await prisma.businessHours.findMany({
    where: { businessId },
  });

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

export const createPublicBooking = async (req, res) => {
  const validationResult = createBookingSchema.safeParse(req.body);

  if (!validationResult.success) {
    const firstError = validationResult.error.errors[0]?.message || "Datos de reserva no válidos.";
    return res.status(400).json({ error: firstError, details: validationResult.error.errors });
  }

  const { businessId, serviceId, appointmentDate, clientName, clientPhone, clientEmail } =
    validationResult.data;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { hours: true },
  });

  if (!business) {
    return res.status(404).json({ error: "Negocio no encontrado" });
  }

  if (
    business.enablePublicBooking === false ||
    business.subscriptionStatus === "EXPIRED" ||
    business.subscriptionStatus === "CANCELLED"
  ) {
    return res
      .status(403)
      .json({ error: "Las reservas públicas no están disponibles actualmente para este negocio." });
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

  // 2. Slot Collision & Capacity Check in an atomic transaction
  const duration = service.duration || 30;
  const capacity = service.capacity || 1;
  const requestedStart = targetDate;
  const requestedEnd = new Date(requestedStart.getTime() + duration * 60 * 1000);

  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  const cleanPhone = clientPhone.trim();

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

      // Client recognition by phone number
      let client = await tx.client.findFirst({
        where: {
          businessId,
          phone: cleanPhone,
        },
      });

      if (!client) {
        client = await tx.client.create({
          data: {
            name: clientName,
            surname: "",
            phone: cleanPhone,
            email: clientEmail ? clientEmail.trim() : null,
            businessId,
            frequentService: service.name,
            lopdStatus: "Pendiente",
            lastVisit: new Date(),
          },
        });
      }

      const appointment = await tx.appointment.create({
        data: {
          businessId,
          serviceId,
          clientId: client.id,
          clientName: clientName,
          clientPhone: cleanPhone,
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
