import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const DEMO_DURATION_MINUTES = 30;
const DEMO_PASSWORD = 'Demo1234';

function generateDemoId() {
  return crypto.randomInt(1000, 9999);
}

export const createDemo = async () => {
  const demoId = generateDemoId();
  const email = `demo-volta-${demoId}@volta.app`;
  const businessName = `Demo Volta #${demoId}`;
  const hashedPass = await bcrypt.hash(DEMO_PASSWORD, 10);
  const expiresAt = new Date(Date.now() + DEMO_DURATION_MINUTES * 60 * 1000);

  return prisma.$transaction(async (tx) => {
    const biz = await tx.business.create({
      data: {
        name: businessName,
        email,
        phone: `+34 600 ${String(demoId).padStart(4, '0')}`,
        address: 'Calle de Gran Vía, 28, Madrid',
        ownerName: 'Dueño Demo',
        welcomeMessage: '¡Hola {{clientName}}! Tu cita en {{businessName}} está confirmada para el {{appointmentDate}} a las {{appointmentTime}}.',
        reminderMessage: 'Hola {{clientName}}, te recordamos tu cita mañana a las {{appointmentTime}} en {{businessName}}.',
        isDemo: true,
        demoExpiresAt: expiresAt,
      }
    });

    await tx.user.create({
      data: {
        name: 'Dueño Demo',
        email,
        password: hashedPass,
        role: 'JEFE',
        businessId: biz.id,
      }
    });

    await tx.service.createMany({
      data: [
        { businessId: biz.id, name: 'Corte Caballero', duration: 30, price: 35.0 },
        { businessId: biz.id, name: 'Corte Dama', duration: 45, price: 45.0 },
        { businessId: biz.id, name: 'Coloración Premium', duration: 90, price: 85.0 },
        { businessId: biz.id, name: 'Tratamiento Keratina', duration: 60, price: 50.0 },
        { businessId: biz.id, name: 'Manicura', duration: 30, price: 20.0 },
        { businessId: biz.id, name: 'Spa Facial', duration: 45, price: 40.0 },
      ]
    });

    await tx.businessHours.createMany({
      data: [
        { businessId: biz.id, dayOfWeek: 1, openTime: '09:00', closeTime: '20:00', isClosed: false },
        { businessId: biz.id, dayOfWeek: 2, openTime: '09:00', closeTime: '20:00', isClosed: false },
        { businessId: biz.id, dayOfWeek: 3, openTime: '09:00', closeTime: '20:00', isClosed: false },
        { businessId: biz.id, dayOfWeek: 4, openTime: '09:00', closeTime: '20:00', isClosed: false },
        { businessId: biz.id, dayOfWeek: 5, openTime: '09:00', closeTime: '20:00', isClosed: false },
        { businessId: biz.id, dayOfWeek: 6, openTime: '10:00', closeTime: '18:00', isClosed: false },
        { businessId: biz.id, dayOfWeek: 0, openTime: '09:00', closeTime: '20:00', isClosed: true },
      ]
    });

    const clientsData = [
      { name: 'Ana', surname: 'García', email: 'ana.garcia@email.com', phone: '+34 611 234 567', lopdStatus: 'Aceptado', frequentService: 'Coloración Premium', lastVisit: '15 Jun 2025' },
      { name: 'Marco', surname: 'Polo', email: 'marco.polo@email.com', phone: '+34 622 345 678', lopdStatus: 'Aceptado', frequentService: 'Corte Caballero', lastVisit: '20 Jun 2025' },
      { name: 'Sofía', surname: 'Martín', email: 'sofia.martin@email.com', phone: '+34 633 456 789', lopdStatus: 'Pendiente', frequentService: 'Manicura', lastVisit: '22 Jun 2025' },
      { name: 'Juan', surname: 'Herrera', email: 'juan.herrera@email.com', phone: '+34 644 567 890', lopdStatus: 'Pendiente', frequentService: 'Tratamiento Keratina', lastVisit: '01 Jul 2025' },
    ];

    const createdClients = [];
    for (const c of clientsData) {
      const client = await tx.client.create({
        data: { ...c, businessId: biz.id }
      });
      createdClients.push(client);
    }

    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);

    const services = await tx.service.findMany({ where: { businessId: biz.id } });

    const appointmentsData = [
      { day: 0, hour: 9, clientIdx: 1, serviceIdx: 0 },
      { day: 1, hour: 10, clientIdx: 0, serviceIdx: 2 },
      { day: 2, hour: 10, clientIdx: 2, serviceIdx: 4 },
      { day: 3, hour: 11, clientIdx: 3, serviceIdx: 3 },
    ];

    for (const appt of appointmentsData) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + appt.day);
      date.setHours(appt.hour, 0, 0, 0);

      const client = createdClients[appt.clientIdx];
      const service = services[appt.serviceIdx];

      await tx.appointment.create({
        data: {
          clientName: `${client.name} ${client.surname}`,
          clientPhone: client.phone,
          appointmentDate: date,
          businessId: biz.id,
          clientId: client.id,
          serviceId: service.id,
          serviceName: service.name,
          status: 'PENDING',
        }
      });
    }

    return {
      email,
      password: DEMO_PASSWORD,
      businessId: biz.id,
      businessName,
      expiresAt: expiresAt.toISOString(),
    };
  });
};

export const deleteDemo = async (businessId) => {
  const biz = await prisma.business.findUnique({ where: { id: businessId } });
  if (!biz || !biz.isDemo) {
    return false;
  }

  await prisma.appointment.deleteMany({ where: { businessId } });
  await prisma.client.deleteMany({ where: { businessId } });
  await prisma.business.delete({ where: { id: businessId } });
  return true;
};

export const cleanupExpiredDemos = async () => {
  const now = new Date();
  const expiredDemos = await prisma.business.findMany({
    where: {
      isDemo: true,
      demoExpiresAt: { lt: now },
    },
    select: { id: true },
  });

  let deletedCount = 0;
  for (const biz of expiredDemos) {
    try {
      await prisma.appointment.deleteMany({ where: { businessId: biz.id } });
      await prisma.client.deleteMany({ where: { businessId: biz.id } });
      await prisma.business.delete({ where: { id: biz.id } });
      deletedCount++;
    } catch (err) {
      console.error(`[Demo Cleanup] Failed to delete demo ${biz.id}:`, err);
    }
  }

  return { deletedCount, totalExpired: expiredDemos.length };
};
