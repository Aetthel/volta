import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { logger } from "../utils/logger.js";
import { deleteBusinessCascade } from "./adminService.js";

const DEMO_DURATION_MINUTES = 30;

function generateDemoPassword() {
  return crypto.randomBytes(12).toString("base64url");
}

function generateDemoId() {
  return crypto.randomInt(1000, 9999);
}

export const createDemo = async () => {
  const demoId = generateDemoId();
  const email = `demo-volta-${demoId}@volta.app`;
  const businessName = `Demo Volta #${demoId}`;
  const demoPassword = generateDemoPassword();
  const hashedPass = await bcrypt.hash(demoPassword, 10);
  const expiresAt = new Date(Date.now() + DEMO_DURATION_MINUTES * 60 * 1000);

  return prisma.$transaction(async (tx) => {
    const biz = await tx.business.create({
      data: {
        name: businessName,
        email,
        phone: `+34 600 ${String(demoId).padStart(4, "0")}`,
        address: "Calle de Gran Vía, 28, Madrid",
        welcomeMessage:
          "¡Hola {{clientName}}! Tu cita en {{businessName}} está confirmada para el {{appointmentDate}} a las {{appointmentTime}}.",
        reminderMessage:
          "Hola {{clientName}}, te recordamos tu cita mañana a las {{appointmentTime}} en {{businessName}}.",
        subscriptionPlan: "PRO",
        subscriptionStatus: "DEMO_SANDBOX",
        sandboxExpiresAt: expiresAt,
        users: {
          create: {
            name: "Dueño Demo",
            email,
            password: hashedPass,
            role: "JEFE",
          },
        },
      },
      include: {
        users: true,
      },
    });

    const demoUser = biz.users[0];

    await tx.alert.createMany({
      data: [
        {
          type: "EMERGENTE",
          title: "¡Bienvenido a tu Entorno de Prueba!",
          description:
            "Esta sesión de prueba tiene una duración de 30 minutos. Hemos preparado datos de ejemplo en la agenda y clientes para que puedas explorar todas las funcionalidades de inmediato.",
          userId: demoUser.id,
          isRead: false,
        },
        {
          type: "EMERGENTE",
          title: "Gestión Completa de Clientes",
          description:
            "Visita la sección de Clientes para consultar expedientes, enviar enlaces de firma LOPD y ver estadísticas de visitas recurrentes.",
          userId: demoUser.id,
          isRead: false,
        },
        {
          type: "EMERGENTE",
          title: "Automatización por WhatsApp",
          description:
            "El sistema permite automatizar recordatorios y confirmaciones. Puedes simularlo vinculando un número en la sección de Ajustes.",
          userId: demoUser.id,
          isRead: false,
        },
        {
          type: "AVISO",
          title: "Conexión de WhatsApp pendiente",
          description:
            "Para enviar recordatorios automáticos de citas a tus clientes, recuerda vincular tu cuenta de WhatsApp desde la pantalla de Ajustes.",
          userId: demoUser.id,
          isRead: false,
        },
        {
          type: "NOTIFICACION",
          title: "Asistente Virtual Activado",
          description:
            "El bot de recordatorios diarios se ha iniciado correctamente para la sede Demo Volta.",
          userId: demoUser.id,
          isRead: false,
        },
      ],
    });

    await tx.service.createMany({
      data: [
        { businessId: biz.id, name: "Corte Caballero", duration: 30, price: 35.0 },
        { businessId: biz.id, name: "Corte Dama", duration: 45, price: 45.0 },
        { businessId: biz.id, name: "Coloración Premium", duration: 90, price: 85.0 },
        { businessId: biz.id, name: "Tratamiento Keratina", duration: 60, price: 50.0 },
        { businessId: biz.id, name: "Manicura", duration: 30, price: 20.0 },
        { businessId: biz.id, name: "Spa Facial", duration: 45, price: 40.0 },
      ],
    });

    await tx.businessHours.createMany({
      data: [
        {
          businessId: biz.id,
          dayOfWeek: 1,
          openTime: "09:00",
          closeTime: "20:00",
          isClosed: false,
        },
        {
          businessId: biz.id,
          dayOfWeek: 2,
          openTime: "09:00",
          closeTime: "20:00",
          isClosed: false,
        },
        {
          businessId: biz.id,
          dayOfWeek: 3,
          openTime: "09:00",
          closeTime: "20:00",
          isClosed: false,
        },
        {
          businessId: biz.id,
          dayOfWeek: 4,
          openTime: "09:00",
          closeTime: "20:00",
          isClosed: false,
        },
        {
          businessId: biz.id,
          dayOfWeek: 5,
          openTime: "09:00",
          closeTime: "20:00",
          isClosed: false,
        },
        {
          businessId: biz.id,
          dayOfWeek: 6,
          openTime: "10:00",
          closeTime: "18:00",
          isClosed: false,
        },
        { businessId: biz.id, dayOfWeek: 0, openTime: "09:00", closeTime: "20:00", isClosed: true },
      ],
    });

    const clientsData = [
      {
        name: "Ana",
        surname: "García",
        email: "ana.garcia@email.com",
        phone: "+34 611 234 567",
        lopdStatus: "Aceptado",
        frequentService: "Coloración Premium",
        lastVisit: new Date("2025-06-15T10:00:00Z"),
      },
      {
        name: "Marco",
        surname: "Polo",
        email: "marco.polo@email.com",
        phone: "+34 622 345 678",
        lopdStatus: "Aceptado",
        frequentService: "Corte Caballero",
        lastVisit: new Date("2025-06-20T10:00:00Z"),
      },
      {
        name: "Sofía",
        surname: "Martín",
        email: "sofia.martin@email.com",
        phone: "+34 633 456 789",
        lopdStatus: "Pendiente",
        frequentService: "Manicura",
        lastVisit: new Date("2025-06-22T10:00:00Z"),
      },
      {
        name: "Juan",
        surname: "Herrera",
        email: "juan.herrera@email.com",
        phone: "+34 644 567 890",
        lopdStatus: "Pendiente",
        frequentService: "Tratamiento Keratina",
        lastVisit: new Date("2025-07-01T10:00:00Z"),
      },
    ];

    const createdClients = [];
    for (const c of clientsData) {
      const client = await tx.client.create({
        data: { ...c, businessId: biz.id },
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
          status: "PENDING",
        },
      });
    }

    return {
      email,
      password: demoPassword,
      businessId: biz.id,
      businessName,
      expiresAt: expiresAt.toISOString(),
    };
  });
};

export const deleteDemo = async (businessId) => {
  const biz = await prisma.business.findUnique({ where: { id: businessId } });
  if (!biz || biz.subscriptionStatus !== "DEMO_SANDBOX") {
    return false;
  }

  await prisma.$transaction(async (tx) => {
    await deleteBusinessCascade(businessId, tx);
  });
  return true;
};

export const cleanupExpiredDemos = async () => {
  const now = new Date();
  const expiredDemos = await prisma.business.findMany({
    where: {
      subscriptionStatus: "DEMO_SANDBOX",
      sandboxExpiresAt: { lt: now },
    },
    select: { id: true },
  });

  let deletedCount = 0;
  for (const biz of expiredDemos) {
    try {
      await prisma.$transaction(async (tx) => {
        await deleteBusinessCascade(biz.id, tx);
      });
      deletedCount++;
    } catch (err) {
      logger.error(`[Demo Cleanup] Failed to delete demo ${biz.id}:`, err);
    }
  }

  return { deletedCount, totalExpired: expiredDemos.length };
};
