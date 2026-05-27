const prisma = require('../src/db');

async function main() {
  const business = await prisma.business.create({
    data: {
      name: 'Test Business',
      phone: '34600000000',
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
