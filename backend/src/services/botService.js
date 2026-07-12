import prisma from '../config/db.js';
import whatsappManager from './whatsappService.js';
import config from '../config/index.js';
import { computeHmac } from '../utils/crypto.js';

/**
 * Formats a message template by replacing placeholders with actual data
 */
function formatMessage(template, { clientName, appointmentDate, businessName }) {
  if (!template) return null;
  
  const date = new Date(appointmentDate);
  const dateStr = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return template
    .replace(/{{clientName}}/g, clientName)
    .replace(/{{appointmentDate}}/g, dateStr)
    .replace(/{{appointmentTime}}/g, timeStr)
    .replace(/{{businessName}}/g, businessName);
}

/**
 * Sends an immediate welcome/booking confirmation message
 */
async function sendWelcomeMessage(appointmentId) {
  try {
    const appt = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        business: true,
        client: true
      }
    });

    if (!appt || !appt.business.welcomeMessage) return;

    if (!appt.client || appt.client.lopdStatus !== 'Aceptado') {
      console.log(`[Bot] Skipping welcome message to ${appt.clientPhone} (LOPD status: ${appt.client?.lopdStatus || 'unknown'})`);
      return;
    }

    const message = formatMessage(appt.business.welcomeMessage, {
      clientName: appt.clientName,
      appointmentDate: appt.appointmentDate,
      businessName: appt.business.name
    });

    console.log(`[Bot] Sending welcome to ${appt.clientPhone}...`);
    await whatsappManager.initClient(appt.businessId); // Ensure client is init
    await whatsappManager.waitForReady(appt.businessId, 45000);
    await whatsappManager.sendMessage(appt.businessId, appt.clientPhone, message);

  } catch (err) {
    console.error(`[Bot] Error sending welcome message:`, err);
  }
}

/**
 * The Sentinel: Scans for pending appointments for the next day and sends notifications
 */
async function runSentinel() {
  console.log(`[Sentinel] Starting daily scanning process: ${new Date().toLocaleString()}`);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const endOfTomorrow = new Date(tomorrow);
  endOfTomorrow.setHours(23, 59, 59, 999);

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        status: 'PENDING',
        appointmentDate: {
          gte: tomorrow,
          lte: endOfTomorrow
        }
      },
      include: {
        business: true,
        client: true
      }
    });

    console.log(`[Sentinel] Found ${appointments.length} pending appointments for tomorrow.`);

    for (const appt of appointments) {
      try {
        if (!appt.client || appt.client.lopdStatus !== 'Aceptado') {
          console.log(`[Sentinel] Skipping reminder to ${appt.clientPhone} (LOPD status: ${appt.client?.lopdStatus || 'unknown'})`);
          continue;
        }

        if (!appt.business.reminderMessage) {
          console.log(`[Sentinel] No reminder template for ${appt.business.name}, skipping.`);
          continue;
        }

        const message = formatMessage(appt.business.reminderMessage, {
          clientName: appt.clientName,
          appointmentDate: appt.appointmentDate,
          businessName: appt.business.name
        });

        await whatsappManager.initClient(appt.businessId);
        await whatsappManager.waitForReady(appt.businessId, 45000);
        await whatsappManager.sendMessage(appt.businessId, appt.clientPhone, message);

        await prisma.appointment.update({
          where: { id: appt.id },
          data: { status: 'SENT' }
        });

        const delay = Math.floor(Math.random() * (5000 - 2000 + 1) + 2000);
        await new Promise(resolve => setTimeout(resolve, delay));

      } catch (err) {
        console.error(`[Sentinel] Error processing appointment ${appt.id}:`, err);
        await prisma.appointment.update({
          where: { id: appt.id },
          data: { status: 'ERROR' }
        });
      }
    }
  } catch (err) {
    console.error(`[Sentinel] Fatal error:`, err);
  }
}

/**
 * Sends an automatic LOPD consent message to a client.
 *
 * Uses initClient() + waitForReady() so the message is sent only after Puppeteer
 * has fully initialized — previously the message was attempted before the client
 * was ready, causing an 'evaluate' error that silently fell back to simulation.
 */
async function sendConsentMessage(businessId, client) {
  const FRONTEND_URL = config.frontendUrl;
  const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const tokenData = `${client.id}:${expiry}`;
  const token = computeHmac(tokenData, config.backendJwtSecret);
  const consentUrl = `${FRONTEND_URL}/lopd/${client.id}?token=${token}&exp=${expiry}`;
  const message = `¡Hola ${client.name}! Para cumplir con la LOPD y poder enviarte recordatorios de tus citas por WhatsApp, por favor acepta nuestra política de privacidad aquí: ${consentUrl}`;


  console.log(`[Bot] Triggering LOPD consent message for client ${client.name} (${client.phone})...`);

  try {
    // Ensure the client is initialised (restores session from disk after a restart)
    await whatsappManager.initClient(businessId);

    // Wait until Puppeteer is fully ready before attempting to send.
    // If the QR hasn't been scanned yet this will timeout and throw, which is the
    // correct behaviour — we do NOT want to silently simulate the send.
    await whatsappManager.waitForReady(businessId, 45000);

    await whatsappManager.sendMessage(businessId, client.phone, message);
    console.log(`[WhatsApp] LOPD consent message sent to ${client.phone}`);
  } catch (wsErr) {
    console.error(`[WhatsApp] Failed to send LOPD consent message to ${client.phone}:`, wsErr.message);
    console.error(`[WhatsApp] ⚠️  Asegúrate de que el QR de WhatsApp está vinculado en Ajustes → WhatsApp.`);
  }
}


export { runSentinel, sendWelcomeMessage, sendConsentMessage };
