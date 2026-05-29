const prisma = require('./db');
const whatsappManager = require('./whatsapp');

/**
 * Test script to verify WhatsApp initialization for the seeded business
 */
async function test() {
  const business = await prisma.business.findFirst();
  if (!business) {
    console.error('No business found in database. Run seed script first.');
    return;
  }

  console.log(`Testing WhatsApp init for: ${business.name} (${business.id})`);
  try {
    await whatsappManager.initClient(business.id);
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
