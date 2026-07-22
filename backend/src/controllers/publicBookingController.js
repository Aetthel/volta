import prisma from '../config/db.js';
import { ApiResponse } from '../utils/index.js';

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
      hours: {
        orderBy: { dayOfWeek: 'asc' }
      },
      services: {
        where: { isActive: true },
        orderBy: { name: 'asc' }
      }
    }
  });

  if (!business) {
    return res.status(404).json({ error: 'Negocio no encontrado' });
  }

  if (business.enablePublicBooking === false) {
    return res.status(403).json({ error: 'Las reservas públicas están desactivadas para este negocio.' });
  }

  return ApiResponse.success(res, business);
};

export const createPublicBooking = async (req, res) => {
  const { businessId, serviceId, appointmentDate, clientName, clientPhone, clientEmail } = req.body;

  if (!businessId || !serviceId || !appointmentDate || !clientName || !clientPhone) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados.' });
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId }
  });

  if (!business) {
    return res.status(404).json({ error: 'Negocio no encontrado' });
  }

  if (business.enablePublicBooking === false) {
    return res.status(403).json({ error: 'Las reservas públicas están desactivadas para este negocio.' });
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId }
  });

  if (!service || !service.isActive || service.businessId !== businessId) {
    return res.status(404).json({ error: 'Servicio no disponible' });
  }

  const targetDate = new Date(appointmentDate);

  // Check group service capacity
  if (service.capacity > 0) {
    const existingBookings = await prisma.appointment.count({
      where: {
        businessId,
        serviceId,
        appointmentDate: targetDate,
        status: { in: ['PENDING', 'SENT'] }
      }
    });

    if (existingBookings >= service.capacity) {
      return res.status(400).json({ error: 'Este horario ha alcanzado su aforo máximo.' });
    }
  }

  // Client recognition by phone number
  const cleanPhone = clientPhone.trim();
  let client = await prisma.client.findFirst({
    where: {
      businessId,
      phone: cleanPhone
    }
  });

  if (!client) {
    client = await prisma.client.create({
      data: {
        name: clientName,
        surname: '',
        phone: cleanPhone,
        email: clientEmail ? clientEmail.trim() : null,
        businessId,
        frequentService: service.name
      }
    });
  }

  const appointment = await prisma.appointment.create({
    data: {
      businessId,
      serviceId,
      clientId: client.id,
      clientName: clientName,
      clientPhone: cleanPhone,
      serviceName: service.name,
      appointmentDate: targetDate,
      status: 'PENDING'
    }
  });

  return ApiResponse.created(res, {
    appointment,
    client,
    service
  });
};
