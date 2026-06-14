const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticate, validateId, validateBody } = require('../middleware');
const bcrypt = require('bcryptjs');
const { z } = require('zod');

const createBusinessSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Formato de email no válido"),
  phone: z.string().regex(/^\+?[0-9\s-]{9,20}$/, "Formato de teléfono no válido"),
  address: z.string().optional().nullable(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").regex(/[0-9]/, "La contraseña debe contener al menos un número")
});

router.get('/businesses', authenticate, async (req, res) => {
  try {
    const businesses = await prisma.business.findMany({
      where: { role: 'BUSINESS' },
      orderBy: { name: 'asc' }
    });
    res.json(businesses);
  } catch (err) {
    console.error('[API] Error fetching admin businesses:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/businesses', authenticate, validateBody(createBusinessSchema), async (req, res) => {
  const { name, email, phone, address, password } = req.body;
  try {
    const hashedPass = await bcrypt.hash(password, 10);
    const business = await prisma.business.create({
      data: {
        name,
        email,
        phone,
        address: address || '',
        password: hashedPass,
        role: 'BUSINESS',
      }
    });
    res.json(business);
  } catch (err) {
    console.error('[API] Error creating business account:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/businesses/:id', authenticate, validateId('id'), async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.appointment.deleteMany({ where: { businessId: id } });
    await prisma.client.deleteMany({ where: { businessId: id } });
    await prisma.business.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('[API] Error deleting business:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const servicePrices = {
      "Corte Caballero": 35,
      "Corte Dama": 45,
      "Coloración Premium": 85,
      "Tratamiento Keratina": 50,
      "Manicura": 20,
      "Spa Facial": 40,
    };

    // Date ranges for growth calculation
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const businesses = await prisma.business.findMany({
      where: { role: 'BUSINESS' },
      include: {
        appointments: {
          include: { client: true }
        },
        clients: true,
      }
    });

    const totalClients = await prisma.client.count();
    
    let totalRevenue = 0;
    let totalThisMonth = 0;
    let totalLastMonth = 0;

    const rankings = businesses.map((b) => {
      let bizThisMonth = 0;
      let bizLastMonth = 0;

      const bizRevenue = b.appointments.reduce((acc, app) => {
        const serviceName = app.client?.frequentService || "Corte Caballero";
        const price = servicePrices[serviceName] || 35;

        const apptDate = new Date(app.appointmentDate);
        if (apptDate >= startOfThisMonth) bizThisMonth++;
        else if (apptDate >= startOfLastMonth) bizLastMonth++;

        return acc + price;
      }, 0);
      
      totalRevenue += bizRevenue;
      totalThisMonth += bizThisMonth;
      totalLastMonth += bizLastMonth;

      // Real growth: percentage change from last month to this month
      const changePercent = bizLastMonth === 0
        ? (bizThisMonth > 0 ? '+100%' : '0%')
        : `${bizThisMonth >= bizLastMonth ? '+' : ''}${Math.round(((bizThisMonth - bizLastMonth) / bizLastMonth) * 100)}%`;

      return {
        name: b.name,
        revenue: bizRevenue,
        clientsCount: b.clients.length,
        change: changePercent,
      };
    });

    rankings.sort((a, b) => b.revenue - a.revenue);

    const formattedRankings = rankings.map((r, idx) => ({
      rank: idx + 1,
      name: r.name,
      revenue: `€${r.revenue.toLocaleString()}`,
      change: r.change,
    }));

    const totalAppointments = await prisma.appointment.count();
    const averageTicket = totalAppointments > 0 ? Math.round(totalRevenue / totalAppointments) : 35;

    // Real global growth
    const globalGrowth = totalLastMonth === 0
      ? (totalThisMonth > 0 ? '+100%' : '0%')
      : `${totalThisMonth >= totalLastMonth ? '+' : ''}${Math.round(((totalThisMonth - totalLastMonth) / totalLastMonth) * 100)}%`;

    res.json({
      totalRevenue: `€${totalRevenue.toLocaleString()}`,
      totalClients: totalClients.toLocaleString(),
      averageTicket: `€${averageTicket}`,
      growth: globalGrowth,
      rankings: formattedRankings,
    });
  } catch (err) {
    console.error('[API] Error fetching admin dashboard:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
