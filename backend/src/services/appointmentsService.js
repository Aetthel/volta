import prisma from "../config/db.js";
import { sendWelcomeMessage, sendConsentMessage } from "./botService.js";
import { normalizeString, normalizePhone } from "../utils/index.js";
import { validateBusinessHours } from "../utils/businessHours.js";
import { logger } from "../utils/logger.js";

export const getAppointmentsByBusiness = async (businessId) => {
  return await prisma.appointment.findMany({
    where: { businessId },
    include: { client: true, service: true },
    orderBy: { appointmentDate: "asc" },
  });
};

export const createAppointment = async (appointmentData) => {
  const {
    clientName,
    clientPhone,
    appointmentDate,
    businessId,
    service: reqService,
  } = appointmentData;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { hours: true },
  });

  if (!business) {
    const error = new Error("Business not found");
    error.statusCode = 404;
    throw error;
  }

  // Look up service by name or ID to get duration and capacity
  let serviceId = null;
  let serviceName = reqService || null;
  let duration = 30;
  let capacity = 1;

  if (serviceName) {
    const dbService = await prisma.service.findFirst({
      where: {
        businessId,
        name: serviceName,
        isActive: true,
      },
    });
    if (dbService) {
      serviceId = dbService.id;
      serviceName = dbService.name;
      duration = dbService.duration || 30;
      capacity = dbService.capacity || 1;
    }
  }

  const reqDate = new Date(appointmentDate);
  if (isNaN(reqDate.getTime())) {
    const error = new Error("Fecha de cita no válida");
    error.statusCode = 400;
    throw error;
  }

  // 1. Business Hours Validation
  if (business.hours && business.hours.length > 0) {
    const hoursCheck = validateBusinessHours(business.hours, reqDate, duration);
    if (!hoursCheck.valid) {
      const error = new Error(hoursCheck.reason);
      error.statusCode = 400;
      throw error;
    }
  }

  // 2. Slot Collision & Capacity Check
  const requestedStart = reqDate;
  const requestedEnd = new Date(requestedStart.getTime() + duration * 60 * 1000);

  // Fetch active appointments on the same day for overlap checking
  const dayStart = new Date(reqDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(reqDate);
  dayEnd.setHours(23, 59, 59, 999);

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

  const inputPhone = normalizePhone(clientPhone);

  // 3. Try to find client by exact phone number first
  let client = await prisma.client.findFirst({
    where: {
      businessId,
      phone: inputPhone,
    },
  });

  // 4. Fall back to searching by name and surname if phone didn't match
  if (!client) {
    const parts = clientName.trim().split(/\s+/);
    const firstName = parts[0];
    const surname = parts.slice(1).join(" ");

    client = await prisma.client.findFirst({
      where: {
        businessId,
        name: { equals: firstName, mode: "insensitive" },
        surname: { equals: surname || "", mode: "insensitive" },
      },
    });
  }

  if (!client) {
    const parts = clientName.trim().split(" ");
    const firstName = parts[0];
    const surname = parts.slice(1).join(" ");

    client = await prisma.client.create({
      data: {
        name: firstName,
        surname: surname || "",
        email: `${normalizeString(firstName)}${surname ? "." + normalizeString(surname).split(" ")[0] : ""}@email.com`,
        phone: inputPhone,
        lopdStatus: "Pendiente",
        businessId,
        frequentService: reqService || null,
        lastVisit: new Date(),
      },
    });
    logger.info(`[Service] Automatically registered new LOPD-pending client: ${client.id}`);
  }

  const appointment = await prisma.appointment.create({
    data: {
      clientName,
      clientPhone: inputPhone,
      appointmentDate: reqDate,
      businessId,
      clientId: client.id,
      serviceId,
      serviceName,
      status: "PENDING",
    },
  });

  if (client.lopdStatus === "Aceptado") {
    sendWelcomeMessage(appointment.id).catch((err) => {
      logger.error("[Service] Error sending welcome message on appointment creation:", err);
    });
  } else {
    sendConsentMessage(businessId, client).catch((err) => {
      logger.error("[Service] Error sending LOPD consent request:", err);
    });
  }

  return appointment;
};

export const updateAppointment = async (id, updateData, businessId) => {
  const data = {};
  if (updateData.clientName) data.clientName = updateData.clientName;
  if (updateData.clientPhone) data.clientPhone = updateData.clientPhone;
  if (updateData.appointmentDate) data.appointmentDate = new Date(updateData.appointmentDate);
  if (updateData.status) data.status = updateData.status;

  if (updateData.serviceName !== undefined) {
    data.serviceName = updateData.serviceName;
    if (updateData.serviceName) {
      const dbService = await prisma.service.findFirst({
        where: {
          businessId,
          name: updateData.serviceName,
          isActive: true,
        },
      });
      if (dbService) {
        data.serviceId = dbService.id;
      } else {
        data.serviceId = null;
      }
    } else {
      data.serviceId = null;
    }
  }

  return await prisma.appointment.update({
    where: { id },
    data,
  });
};

export const deleteAppointment = async (id) => {
  return await prisma.appointment.delete({
    where: { id },
  });
};

export const getAppointmentById = async (id) => {
  return await prisma.appointment.findUnique({
    where: { id },
  });
};
