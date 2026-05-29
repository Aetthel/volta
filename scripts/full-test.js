const prisma = require('../src/db');
const { runSentinel } = require('../src/bot');

async function runFullTest() {
  console.log('--- Starting Full Lifecycle Test ---');

  // 1. Get our test business
  const business = await prisma.business.findFirst();
  if (!business) {
    console.error('Error: No business found. Seed the database first.');
    return;
  }
  console.log(`Using Business: ${business.name} (${business.id})`);

  // 2. Create an appointment for TOMORROW
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 30, 0, 0); // 10:30 AM

  console.log(`Creating test appointment for tomorrow: ${tomorrow.toLocaleString()}`);
  
  const appointment = await prisma.appointment.create({
    data: {
      clientName: 'Test Client',
      clientPhone: '34696352940', // Your number
      appointmentDate: tomorrow,
      businessId: business.id,
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
