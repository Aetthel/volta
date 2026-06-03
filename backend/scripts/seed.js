const prisma = require('../src/db');
const bcrypt = require('bcryptjs');

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const business = await prisma.business.create({
    data: {
      name: 'Test Business',
      phone: '34600000000',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Test Business created:', business);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
