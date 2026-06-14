const prisma = require('../src/db');
const { runSentinel } = require('../src/bot');

async function runFullTest() {
  console.log('--- Starting Full Lifecycle Test ---');

  // 1. Get our test business
  const business = await prisma.business.findFirst({
    where: { role: 'BUSINESS' }
  });
  if (!business) {
    console.error('Error: No business found. Seed the database first.');
    return;
  }
  console.log(`Using Business: ${business.name} (${business.id})`);
  
  // Ensure business has templates configured for test
  await prisma.business.update({
    where: { id: business.id },
    data: {
      welcomeMessage: '¡Hola {{clientName}}! Hemos confirmado tu cita para el {{appointmentDate}} a las {{appointmentTime}} en {{businessName}}.',
      reminderMessage: 'Hola {{clientName}}, recordatorio de tu cita mañana en {{businessName}} a las {{appointmentTime}}.'
    }
  });

  // 2. Create an appointment for TOMORROW
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 30, 0, 0); // 10:30 AM

  console.log(`Creating test appointment for tomorrow: ${tomorrow.toLocaleString()}`);
  
  // Ensure we have a client with LOPD status 'Aceptado' to pass the Sentinel check
  let client = await prisma.client.findFirst({
    where: {
      businessId: business.id,
      lopdStatus: 'Aceptado'
    }
  });

  if (!client) {
    console.log('Creating a mock client with LOPD Aceptado status...');
    client = await prisma.client.create({
      data: {
        name: 'Test',
        surname: 'Client',
        email: 'test.client@email.com',
        phone: '34696352940',
        lopdStatus: 'Aceptado',
        businessId: business.id
      }
    });
  }

  const appointment = await prisma.appointment.create({
    data: {
      clientName: `${client.name} ${client.surname}`,
      clientPhone: client.phone,
      appointmentDate: tomorrow,
      businessId: business.id,
      clientId: client.id,
      status: 'PENDING'
    }
  });
  console.log(`Appointment created with ID: ${appointment.id}`);

  // 3. Manually trigger the Sentinel
  console.log('Triggering The Sentinel...');
  await runSentinel();

  // 4. Verify status update
  const updatedAppt = await prisma.appointment.findUnique({
    where: { id: appointment.id }
  });

  console.log('--- Test Results ---');
  console.log(`Final Appointment Status: ${updatedAppt.status}`);
  
  if (updatedAppt.status === 'SENT') {
    console.log('SUCCESS: Full lifecycle verified!');
  } else {
    console.log('FAILED: Appointment status was not updated to SENT.');
  }

  process.exit(0);
}

runFullTest().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
