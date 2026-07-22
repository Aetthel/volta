import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';

export const createSandboxDemo = async (req, res) => {
  try {
    const sandboxId = `sandbox-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const sandboxExpiresAt = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes

    // 1. Create Ephemeral Business
    const business = await prisma.business.create({
      data: {
        id: sandboxId,
        name: 'Salón Volta Demo (20 min)',
        phone: '34600000000',
        email: `${sandboxId}@demo.volta.es`,
        businessType: 'Peluquería / Barbería',
        subscriptionPlan: 'PRO',
        subscriptionStatus: 'DEMO_SANDBOX',
        sandboxExpiresAt
      }
    });

    // 2. Create Ephemeral User
    const hashedPassword = await bcrypt.hash('sandbox123', 10);
    const user = await prisma.user.create({
      data: {
        name: 'Invitado Demo',
        email: `${sandboxId}@demo.volta.es`,
        password: hashedPassword,
        role: 'JEFE',
        businessId: business.id
      }
    });

    // 3. Create Sample Services
    await prisma.service.createMany({
      data: [
        { businessId: business.id, name: 'Corte de Pelo', duration: 30, price: 20.0 },
        { businessId: business.id, name: 'Tinte & Peinado', duration: 90, price: 55.0 },
        { businessId: business.id, name: 'Tratamiento Capilar', duration: 45, price: 35.0 }
      ]
    });

    // 4. Create Sample Clients
    const client1 = await prisma.client.create({
      data: {
        businessId: business.id,
        name: 'Laura',
        surname: 'García',
        phone: '34611223344',
        email: 'laura@ejemplo.com',
        frequentService: 'Corte de Pelo'
      }
    });

    const client2 = await prisma.client.create({
      data: {
        businessId: business.id,
        name: 'Carlos',
        surname: 'Martínez',
        phone: '34655667788',
        email: 'carlos@ejemplo.com',
        frequentService: 'Tinte & Peinado'
      }
    });

    // 5. Create Sample Appointments
    const today = new Date();
    await prisma.appointment.createMany({
      data: [
        {
          businessId: business.id,
          clientId: client1.id,
          clientName: `${client1.name} ${client1.surname}`,
          clientPhone: client1.phone,
          serviceName: 'Corte de Pelo',
          appointmentDate: new Date(today.setHours(10, 0, 0, 0)),
          status: 'PENDING'
        },
        {
          businessId: business.id,
          clientId: client2.id,
          clientName: `${client2.name} ${client2.surname}`,
          clientPhone: client2.phone,
          serviceName: 'Tinte & Peinado',
          appointmentDate: new Date(today.setHours(16, 30, 0, 0)),
          status: 'SENT'
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Demo Sandbox de 20 minutos creada.',
      credentials: {
        email: `${sandboxId}@demo.volta.es`,
        password: 'sandbox123'
      },
      expiresAt: sandboxExpiresAt
    });
  } catch (error) {
    console.error('Error al crear demo sandbox:', error);
    return res.status(500).json({ error: 'No se pudo generar la demo efímera.' });
  }
};
