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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
