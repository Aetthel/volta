import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import { formatCurrency } from "../utils/formatters.js";

/**
 * Cascade-delete a business and all its related data within a transaction.
 * Accepts an optional `tx` (Prisma transaction client) to compose with callers.
 */
export const deleteBusinessCascade = async (businessId, tx) => {
  const executor = tx || prisma;
  await executor.alert.deleteMany({ where: { user: { businessId } } });
  await executor.appointment.deleteMany({ where: { businessId } });
  await executor.client.deleteMany({ where: { businessId } });
  await executor.service.deleteMany({ where: { businessId } });
  await executor.businessHours.deleteMany({ where: { businessId } });
  await executor.user.deleteMany({ where: { businessId } });
  await executor.business.delete({ where: { id: businessId } });
};

export const getAllBusinesses = async () => {
  return prisma.business.findMany({
    orderBy: { name: "asc" },
  });
};

export const createBusiness = async ({ name, email, phone, address }, password) => {
  return prisma.$transaction(async (tx) => {
    const hashedPass = await bcrypt.hash(password, 10);

    const biz = await tx.business.create({
      data: {
        name,
        email,
        phone,
        address: address || "",
        users: {
          create: {
            name: `${name} Encargado`,
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

    // Seed default services for this business
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

    // Seed default business hours
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

    return biz;
  });
};

export const deleteBusiness = async (id) => {
  return prisma.$transaction(async (tx) => {
    await deleteBusinessCascade(id, tx);
  });
};

export const getDashboardData = async () => {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const businesses = await prisma.business.findMany({
    select: { id: true, name: true },
  });

  const totalClients = await prisma.client.count();

  const servicePrices = {
    "Corte Caballero": 35,
    "Corte Dama": 45,
    "Coloración Premium": 85,
    "Tratamiento Keratina": 50,
    Manicura: 20,
    "Spa Facial": 40,
  };

  const [allAppointments, allServices, clientCountsGrouped] = await Promise.all([
    prisma.appointment.findMany({
      select: {
        businessId: true,
        appointmentDate: true,
        serviceName: true,
        service: { select: { price: true } },
        client: { select: { frequentService: true } },
      },
    }),
    prisma.service.findMany({
      select: { businessId: true, name: true, price: true },
    }),
    prisma.client.groupBy({
      by: ["businessId"],
      _count: { id: true },
    }),
  ]);

  // Index data by businessId
  const appointmentsByBiz = new Map();
  for (const app of allAppointments) {
    if (!app.businessId) continue;
    if (!appointmentsByBiz.has(app.businessId)) {
      appointmentsByBiz.set(app.businessId, []);
    }
    appointmentsByBiz.get(app.businessId).push(app);
  }

  const servicesByBiz = new Map();
  for (const s of allServices) {
    if (!s.businessId) continue;
    if (!servicesByBiz.has(s.businessId)) {
      servicesByBiz.set(s.businessId, []);
    }
    servicesByBiz.get(s.businessId).push(s);
  }

  const clientCountMap = new Map(
    clientCountsGrouped.map((item) => [item.businessId, item._count.id])
  );

  const rankings = [];
  let totalRevenue = 0;
  let totalThisMonth = 0;
  let totalLastMonth = 0;

  for (const biz of businesses) {
    const appointments = appointmentsByBiz.get(biz.id) || [];
    const services = servicesByBiz.get(biz.id) || [];
    const clientsCount = clientCountMap.get(biz.id) || 0;

    let bizRevenue = 0;
    let bizThisMonth = 0;
    let bizLastMonth = 0;

    for (const app of appointments) {
      let price = null;

      if (app.service && typeof app.service.price === "number") {
        price = app.service.price;
      }

      if (price === null && app.serviceName) {
        const match = services.find((s) => s.name === app.serviceName);
        if (match && typeof match.price === "number") {
          price = match.price;
        }
      }

      if (price === null && app.client && app.client.frequentService) {
        const match = services.find((s) => s.name === app.client.frequentService);
        if (match && typeof match.price === "number") {
          price = match.price;
        }
      }

      if (price === null) {
        const serviceName = app.serviceName || app.client?.frequentService || "Corte Caballero";
        price = servicePrices[serviceName] || 35;
      }

      bizRevenue += price;
      const apptDate = new Date(app.appointmentDate);
      if (apptDate >= startOfThisMonth) bizThisMonth++;
      else if (apptDate >= startOfLastMonth) bizLastMonth++;
    }

    totalRevenue += bizRevenue;
    totalThisMonth += bizThisMonth;
    totalLastMonth += bizLastMonth;

    const changePercent =
      bizLastMonth === 0
        ? bizThisMonth > 0
          ? "+100%"
          : "0%"
        : `${bizThisMonth >= bizLastMonth ? "+" : ""}${Math.round(((bizThisMonth - bizLastMonth) / bizLastMonth) * 100)}%`;

    rankings.push({
      name: biz.name,
      revenue: bizRevenue,
      clientsCount,
      change: changePercent,
    });
  }

  rankings.sort((a, b) => b.revenue - a.revenue);

  const formattedRankings = rankings.map((r, idx) => ({
    rank: idx + 1,
    name: r.name,
    revenue: formatCurrency(r.revenue),
    change: r.change,
  }));

  const totalAppointments = await prisma.appointment.count();
  const averageTicket = totalAppointments > 0 ? totalRevenue / totalAppointments : 35;

  const globalGrowth =
    totalLastMonth === 0
      ? totalThisMonth > 0
        ? "+100%"
        : "0%"
      : `${totalThisMonth >= totalLastMonth ? "+" : ""}${Math.round(((totalThisMonth - totalLastMonth) / totalLastMonth) * 100)}%`;

  return {
    totalRevenue: formatCurrency(totalRevenue),
    totalClients: totalClients.toLocaleString("es-ES"),
    averageTicket: formatCurrency(averageTicket),
    growth: globalGrowth,
    rankings: formattedRankings,
  };
};
