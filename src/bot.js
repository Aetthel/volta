const prisma = require('./db');
const whatsappManager = require('./whatsapp');

/**
 * The Sentinel: Scans for pending appointments for the next day and sends notifications
 */
async function runSentinel() {
  console.log(`[Sentinel] Starting daily scanning process: ${new Date().toLocaleString()}`);

  // Calculate the time window for tomorrow (00:00:00 to 23:59:59)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const endOfTomorrow = new Date(tomorrow);
  endOfTomorrow.setHours(23, 59, 59, 999);

  try {
    // Find all pending appointments for tomorrow
    const appointments = await prisma.appointment.findMany({
      where: {
        status: 'PENDING',
        appointmentDate: {
          gte: tomorrow,
          lte: endOfTomorrow
        }
      },
      include: {
        business: true
      }
    });

    console.log(`[Sentinel] Found ${appointments.length} pending appointments for tomorrow.`);

    for (const appt of appointments) {
      try {
        // Initialize or get the business WhatsApp client
        const client = await whatsappManager.initClient(appt.businessId);

        // Wait for client to be ready if it's new
        // (In a real scenario, we might want to ensure they are pre-initialized)
        
        const timeStr = appt.appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const message = `Hello ${appt.clientName}, reminder of your appointment tomorrow at ${timeStr} at ${appt.business.name}.`;

        console.log(`[Sentinel] Sending message to ${appt.clientPhone} for business ${appt.business.name}...`);

        // whatsapp-web.js requires number@c.us format
        const chatId = `${appt.clientPhone}@c.us`;
        await client.sendMessage(chatId, message);

        // Update status to SENT
        await prisma.appointment.update({
          where: { id: appt.id },
          data: { status: 'SENT' }
        });

        console.log(`[Sentinel] Message sent successfully to ${appt.clientPhone}`);

        // Anti-ban safety delay: 30 to 60 seconds
        const delay = Math.floor(Math.random() * (60000 - 30000 + 1) + 30000);
        console.log(`[Sentinel] Waiting ${delay / 1000}s before next message...`);
        await new Promise(resolve => setTimeout(resolve, delay));

      } catch (err) {
        console.error(`[Sentinel] Error processing appointment ${appt.id}:`, err);
        await prisma.appointment.update({
          where: { id: appt.id },
          data: { status: 'ERROR' }
        });
      }
    }

    console.log(`[Sentinel] Scanning process finished.`);
  } catch (err) {
    console.error(`[Sentinel] Fatal error in Sentinel process:`, err);
  }
}

module.exports = { runSentinel };
