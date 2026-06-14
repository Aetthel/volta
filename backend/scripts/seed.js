const prisma = require('../src/db');
const bcrypt = require('bcryptjs');

async function main() {
  // Clear existing data to allow fresh seeds and avoid unique constraint failures
  await prisma.appointment.deleteMany();
  await prisma.client.deleteMany();
  await prisma.business.deleteMany();

  // 1. Create ADMIN User
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.business.create({
    data: {
      id: 'mock-admin-id',
      name: 'Volta Admin',
      phone: '34600000000',
      email: 'admin@test.com',
      password: hashedAdminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Admin user created:', admin);

  // 2. Create BUSINESS User (Test Salon)
  const hashedBusinessPassword = await bcrypt.hash('123456', 10);
  const business = await prisma.business.create({
    data: {
      id: 'mock-business-id',
      name: 'Salón Glow de Prueba',
      phone: '34612345678',
      email: 'contacto@glow.com',
      password: hashedBusinessPassword,
      role: 'BUSINESS',
    },
  });
  console.log('Business user created:', business);

  // 3. Create default Services
  await prisma.service.createMany({
    data: [
      { businessId: 'mock-business-id', name: 'Corte & Estilo', duration: 45, price: 35.0 },
      { businessId: 'mock-business-id', name: 'Color Total', duration: 120, price: 85.0 },
      { businessId: 'mock-business-id', name: 'Tratamiento Hidratante', duration: 60, price: 50.0 },
    ]
  });
  console.log('Default services created for mock business');

  // 4. Create default Business Hours
  await prisma.businessHours.createMany({
    data: [
      { businessId: 'mock-business-id', dayOfWeek: 1, openTime: '09:00', closeTime: '20:00', isClosed: false },
      { businessId: 'mock-business-id', dayOfWeek: 2, openTime: '09:00', closeTime: '20:00', isClosed: false },
      { businessId: 'mock-business-id', dayOfWeek: 3, openTime: '09:00', closeTime: '20:00', isClosed: false },
      { businessId: 'mock-business-id', dayOfWeek: 4, openTime: '09:00', closeTime: '20:00', isClosed: false },
      { businessId: 'mock-business-id', dayOfWeek: 5, openTime: '09:00', closeTime: '20:00', isClosed: false },
      { businessId: 'mock-business-id', dayOfWeek: 6, openTime: '10:00', closeTime: '18:00', isClosed: false },
      { businessId: 'mock-business-id', dayOfWeek: 0, openTime: '09:00', closeTime: '20:00', isClosed: true },
    ]
  });
  console.log('Default operating hours created for mock business');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
