const prisma = require('./db');
const bcrypt = require('bcryptjs');

/**
 * Ensures that mock businesses, admin, jefe, and employee users exist in the database,
 * and seeds example clients and appointments for local demonstration.
 */
async function ensureMockBusinessesExist() {
  try {
    const hashedPass = await bcrypt.hash('123456', 10);
    
    // Upsert Business account
    await prisma.business.upsert({
      where: { id: 'mock-business-id' },
      update: {
        name: 'Glow (Ejemplo)',
        address: 'Calle de Velázquez, 45, Madrid',
        email: 'contacto@glow.com'
      },
      create: {
        id: 'mock-business-id',
        name: 'Glow (Ejemplo)',
        phone: '34696352940',
        email: 'contacto@glow.com',
        address: 'Calle de Velázquez, 45, Madrid',
        welcomeMessage: '¡Hola {{clientName}}! Hemos confirmado tu cita para el {{appointmentDate}} a las {{appointmentTime}} en {{businessName}}.',
        reminderMessage: 'Hola {{clientName}}, recordatorio de tu cita mañana en {{businessName}} a las {{appointmentTime}}.'
      }
    });

    // Upsert Admin User
    const hashedAdminPass = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: {},
      create: {
        id: 'mock-admin-id',
        name: 'Admin Global',
        email: 'admin@test.com',
        password: hashedAdminPass,
        role: 'ADMIN',
      }
    });

    // Upsert Jefe User
    await prisma.user.upsert({
      where: { email: 'jefe@test.com' },
      update: {},
      create: {
        name: 'Jefe Glow',
        email: 'jefe@test.com',
        password: hashedPass,
        role: 'JEFE',
        businessId: 'mock-business-id',
      }
    });

    // Upsert Empleado User
    await prisma.user.upsert({
      where: { email: 'empleado@test.com' },
      update: {},
      create: {
        name: 'Empleado Glow',
        email: 'empleado@test.com',
        password: hashedPass,
        role: 'EMPLEADO',
        businessId: 'mock-business-id',
      }
    });

    console.log('[API] Mock users and businesses verified/created in database.');

    // Seed example clients and appointments for demonstration if they don't exist yet
    const clientCount = await prisma.client.count({
      where: { businessId: 'mock-business-id' }
    });

    if (clientCount === 0) {
      console.log('[API] Seeding demonstration clients and appointments...');
      
      const c1 = await prisma.client.create({
        data: {
          name: 'Ana',
          surname: 'García (Ejemplo)',
          email: 'ana.garcia@email.com',
          phone: '+34 600 000 001',
          lopdStatus: 'Aceptado',
          frequentService: 'Coloración (Demo)',
          lastVisit: '12 May 2024',
          businessId: 'mock-business-id'
        }
      });

      const c2 = await prisma.client.create({
        data: {
          name: 'Marco',
          surname: 'Polo (Ejemplo)',
          email: 'marco.polo@email.com',
          phone: '+34 600 000 002',
          lopdStatus: 'Aceptado',
          frequentService: 'Corte (Demo)',
          lastVisit: '18 May 2024',
          businessId: 'mock-business-id'
        }
      });

      const c3 = await prisma.client.create({
        data: {
          name: 'Sofía',
          surname: 'Martín (Ejemplo)',
          email: 'sofia.martin@email.com',
          phone: '+34 600 000 003',
          lopdStatus: 'Pendiente',
          frequentService: 'Manicura (Demo)',
          lastVisit: '22 May 2024',
          businessId: 'mock-business-id'
        }
      });

      const c4 = await prisma.client.create({
        data: {
          name: 'Juan',
          surname: 'Herrera (Ejemplo)',
          email: 'juan.herrera@email.com',
          phone: '+34 600 000 004',
          lopdStatus: 'Pendiente',
          frequentService: 'Keratina (Demo)',
          lastVisit: '02 Jun 2024',
          businessId: 'mock-business-id'
        }
      });

      // Calculate dates of the current week for appointments calendar view
      const today = new Date();
      const currentDay = today.getDay(); // 0: Sun, 1: Mon, etc.
      const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(today);
      monday.setDate(today.getDate() + distanceToMonday);

      const dateMon = new Date(monday);
      dateMon.setHours(9, 0, 0, 0);

      const dateTue = new Date(monday);
      dateTue.setDate(monday.getDate() + 1);
      dateTue.setHours(10, 0, 0, 0);

      const dateWed = new Date(monday);
      dateWed.setDate(monday.getDate() + 2);
      dateWed.setHours(10, 0, 0, 0);

      const dateThu = new Date(monday);
      dateThu.setDate(monday.getDate() + 3);
      dateThu.setHours(11, 0, 0, 0);

      await prisma.appointment.createMany({
        data: [
          {
            clientName: 'Marco Polo (Ejemplo)',
            clientPhone: '+34 600 000 002',
            appointmentDate: dateMon,
            businessId: 'mock-business-id',
            clientId: c2.id,
            status: 'PENDING'
          },
          {
            clientName: 'Ana García (Ejemplo)',
            clientPhone: '+34 600 000 001',
            appointmentDate: dateTue,
            businessId: 'mock-business-id',
            clientId: c1.id,
            status: 'PENDING'
          },
          {
            clientName: 'Sofía Martín (Ejemplo)',
            clientPhone: '+34 600 000 003',
            appointmentDate: dateWed,
            businessId: 'mock-business-id',
            clientId: c3.id,
            status: 'PENDING'
          },
          {
            clientName: 'Juan Herrera (Ejemplo)',
            clientPhone: '+34 600 000 004',
            appointmentDate: dateThu,
            businessId: 'mock-business-id',
            clientId: c4.id,
            status: 'PENDING'
          }
        ]
      });

      console.log('[API] Demonstration clients and appointments seeded successfully.');
    }
  } catch (err) {
    console.error('[API] Error ensuring mock businesses:', err);
    throw err; // Propagate error so bootstrap sequence knows it failed
  }
}

module.exports = {
  ensureMockBusinessesExist
};
