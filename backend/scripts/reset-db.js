import prisma from '../src/config/db.js';

async function clearMockData() {
  console.log('🧹 Eliminando ÚNICAMENTE datos mock/demo y manteniendo cuentas reales...');

  try {
    // 1. Borrar relaciones asociadas a negocios mock/demo
    await prisma.$executeRawUnsafe(`
      DELETE FROM "Appointment" WHERE "businessId" IN (SELECT id FROM "Business" WHERE "isDemo" = true OR id = 'mock-business-id' OR email = 'contacto@glow.com');
      DELETE FROM "Client" WHERE "businessId" IN (SELECT id FROM "Business" WHERE "isDemo" = true OR id = 'mock-business-id' OR email = 'contacto@glow.com');
      DELETE FROM "Service" WHERE "businessId" IN (SELECT id FROM "Business" WHERE "isDemo" = true OR id = 'mock-business-id' OR email = 'contacto@glow.com');
      DELETE FROM "BusinessHours" WHERE "businessId" IN (SELECT id FROM "Business" WHERE "isDemo" = true OR id = 'mock-business-id' OR email = 'contacto@glow.com');
      DELETE FROM "Alert" WHERE "userId" IN (SELECT id FROM "User" WHERE email LIKE '%@test.com' OR "businessId" IN (SELECT id FROM "Business" WHERE "isDemo" = true OR id = 'mock-business-id'));
      DELETE FROM "User" WHERE email LIKE '%@test.com' OR id = 'mock-admin-id' OR "businessId" IN (SELECT id FROM "Business" WHERE "isDemo" = true OR id = 'mock-business-id');
      DELETE FROM "Business" WHERE "isDemo" = true OR id = 'mock-business-id' OR email = 'contacto@glow.com';
    `);

    console.log('✅ Datos mock/demo eliminados con éxito. Las cuentas y negocios reales se conservan intacatas.');
  } catch (error) {
    console.error('❌ Error al eliminar datos mock:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearMockData();
