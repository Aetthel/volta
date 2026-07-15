import prisma from '../config/db.js';
import { sendWelcomeMessage, sendConsentMessage } from './botService.js';
import { normalizeString, normalizePhone } from '../utils/index.js';
import logger from '../utils/logger.js';

export const getAppointmentsByBusiness = async (businessId) => {
  return await prisma.appointment.findMany({
    where: { businessId },
    include: { client: true },
    orderBy: { appointmentDate: 'asc' }
  });
};

export const createAppointment = async (appointmentData) => {
  const { clientName, clientPhone, appointmentDate, businessId, service: reqService } = appointmentData;

  const business = await prisma.business.findUnique({
    where: { id: businessId }
  });

  if (!business) {
    const error = new Error('Business not found');
    error.statusCode = 404;
    throw error;
  }

  const clients = await prisma.client.findMany({
    where: { businessId }
  });

  const inputName = normalizeString(clientName);
  const inputPhone = normalizePhone(clientPhone);

  let client = clients.find((c) => {
    const existingName = normalizeString(`${c.name} ${c.surname || ""}`);
    const existingPhone = normalizePhone(c.phone);
    return existingName === inputName || existingPhone === inputPhone;
  });

  if (!client) {
    const parts = clientName.trim().split(" ");
    const firstName = parts[0];
    const surname = parts.slice(1).join(" ");

    client = await prisma.client.create({
      data: {
        name: firstName,
        surname: surname || "",
        email: `${normalizeString(firstName)}${surname ? "." + normalizeString(surname).split(" ")[0] : ""}@email.com`,
        phone: clientPhone,
        lopdStatus: "Pendiente",
        businessId,
        frequentService: reqService || null,
        lastVisit: "Hoy"
      }
    });
    logger.info(`[Service] Automatically registered new LOPD-pending client: ${client.id}`);
  }

  // Look up service by name to store ID and Name
  let serviceId = null;
  let serviceName = reqService || null;

  if (serviceName) {
    const dbService = await prisma.service.findFirst({
      where: {
        businessId,
        name: serviceName,
        isActive: true
      }
    });
    if (dbService) {
      serviceId = dbService.id;
      serviceName = dbService.name;
    }
  }

  const appointment = await prisma.appointment.create({
    data: {
      clientName,
      clientPhone,
      appointmentDate: new Date(appointmentDate),
      businessId,
      clientId: client.id,
      serviceId,
      serviceName,
      status: 'PENDING'
    }
  });

  if (client.lopdStatus === 'Aceptado') {
    sendWelcomeMessage(appointment.id).catch((err) => {
      logger.error('[Service] Error sending welcome message on appointment creation:', err);
    });
  } else {
    sendConsentMessage(businessId, client).catch((err) => {
      logger.error('[Service] Error sending LOPD consent request:', err);
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
          isActive: true
        }
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
    data
  });
};

export const deleteAppointment = async (id) => {
  return await prisma.appointment.delete({
    where: { id }
  });
};

export const getAppointmentById = async (id) => {
  return await prisma.appointment.findUnique({
    where: { id }
  });
};
