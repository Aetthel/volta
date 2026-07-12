import prisma from '../config/db.js';
import { sendWelcomeMessage } from './botService.js';

export const getClientConsent = async (id) => {
  return prisma.client.findUnique({
    where: { id },
    include: { business: true }
  });
};

export const acceptConsent = async (id) => {
  // Actualizar el estado LOPD del cliente
  const updatedClient = await prisma.client.update({
    where: { id },
    data: { lopdStatus: 'Aceptado' }
  });

  // Buscar citas futuras pendientes y enviar mensajes de bienvenida
  const futureAppointments = await prisma.appointment.findMany({
    where: {
      clientId: id,
      appointmentDate: { gte: new Date() },
      status: 'PENDING'
    }
  });

  for (const appt of futureAppointments) {
    await sendWelcomeMessage(appt.id);
  }

  return { updatedClient, futureAppointments };
};
