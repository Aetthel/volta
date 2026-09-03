import config from "../config/index";
import { logger } from "../utils/logger";

interface BaseTemplateOptions {
  title: string;
  preheader?: string;
  contentHtml: string;
}

function renderBaseTemplate({ title, contentHtml }: BaseTemplateOptions): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0f766e; padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 32px 28px; line-height: 1.6; font-size: 15px; }
    .otp-card { background: #f0fdfa; border: 2px dashed #0d9488; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f766e; }
    .btn { display: inline-block; background: #0f766e; color: #ffffff !important; text-decoration: none; font-weight: 600; padding: 14px 28px; border-radius: 10px; text-align: center; margin: 20px 0; font-size: 15px; }
    .footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 4px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Volta</h1>
      <p>Gestión de Citas y Automatización Inteligente</p>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Volta. Todos los derechos reservados.</p>
      <p>Si no has solicitado este correo, puedes ignorarlo con total seguridad.</p>
    </div>
  </div>
</body>
</html>`;
}

const RESEND_TIMEOUT_MS = 10000;

export interface SendRawEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  success: boolean;
  simulated?: boolean;
  id?: string;
  error?: string;
}

async function sendRawEmail({ to, subject, html, text }: SendRawEmailOptions): Promise<SendEmailResult> {
  const resendApiKey = config.resendApiKey;
  const fromEmail = config.emailFrom;

  logger.info(`[EmailService] Preparing email to: ${to} | Subject: "${subject}"`);

  if (!resendApiKey) {
    logger.info(`[EmailService] [LOCAL/DEV SIMULATION]
  ═══════════════════════════════════════════════
  To: ${to}
  Subject: ${subject}
  Content: ${text || html.slice(0, 150)}...
  ═══════════════════════════════════════════════`);

    return { success: true, simulated: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html,
        text,
      }),
      signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
    });

    if (!response.ok) {
      const detail = await response.text();
      logger.error(
        `[EmailService] Resend rechazó el envío a ${to} (HTTP ${response.status}): ${detail}`
      );
      if (response.status === 403 && detail.includes("testing emails")) {
        logger.warn(
          `[EmailService] ℹ️ AVISO MODO TEST RESEND: La clave API de Resend está en modo sandbox (sólo permite enviar a la cuenta propietaria). En desarrollo local se simula el envío con éxito.`
        );
        if (process.env.NODE_ENV !== "production") {
          return { success: true, simulated: true };
        }
      }
      return { success: false, error: `Resend HTTP ${response.status}` };
    }

    const resData = (await response.json()) as { id: string };
    logger.info(`[EmailService] Email sent successfully via Resend. ID: ${resData.id}`);
    return { success: true, id: resData.id };
  } catch (apiErr: any) {
    logger.error(`[EmailService] No se pudo enviar el correo a ${to}: ${apiErr.message}`);
    return { success: false, error: apiErr.message };
  }
}

export async function sendOtpEmail(
  email: string,
  { name, code }: { name?: string | null; code: string }
): Promise<SendEmailResult> {
  const firstName = name ? name.trim().split(" ")[0] : "Usuario";
  const subject = `${code} es tu código de verificación de Volta`;

  const contentHtml = `
    <h2>Hola ${firstName},</h2>
    <p>¡Bienvenido/a a Volta! Para completar la activación de tu cuenta y proteger tu negocio, introduce el siguiente código de verificación de 6 dígitos:</p>
    <div class="otp-card">
      <div class="otp-code">${code}</div>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: #0d9488;">Válido durante los próximos 10 minutos</p>
    </div>
    <p style="font-size: 13px; color: #64748b;">Por motivos de seguridad, nunca compartas este código con nadie.</p>
  `;

  const text = `Hola ${firstName},\n\nTu código de verificación de Volta es: ${code}\nVálido durante 10 minutos.`;
  const html = renderBaseTemplate({ title: subject, contentHtml });

  return sendRawEmail({ to: email, subject, html, text });
}

export async function sendPasswordResetEmail(
  email: string,
  { name, resetUrl }: { name?: string | null; resetUrl: string }
): Promise<SendEmailResult> {
  const firstName = name ? name.trim().split(" ")[0] : "Usuario";
  const subject = `Restablece tu contraseña de Volta`;

  const contentHtml = `
    <h2>Hola ${firstName},</h2>
    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Volta.</p>
    <p>Pulsa el siguiente botón para definir una nueva contraseña:</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="btn" target="_blank">Restablecer mi Contraseña</a>
    </div>
    <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
      Este enlace es de un solo uso y expirará en <strong>1 hora</strong>.<br>
      Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
      <a href="${resetUrl}" style="color: #0f766e; word-break: break-all;">${resetUrl}</a>
    </p>
    <p style="font-size: 13px; color: #64748b;">Si tú no solicitaste este cambio, puedes ignorar este correo; tu contraseña actual continuará siendo la misma.</p>
  `;

  const text = `Hola ${firstName},\n\nPara restablecer tu contraseña de Volta, accede al siguiente enlace (válido por 1 hora):\n${resetUrl}\n\nSi no solicitaste este cambio, ignora este mensaje.`;
  const html = renderBaseTemplate({ title: subject, contentHtml });

  return sendRawEmail({ to: email, subject, html, text });
}

export async function sendSecurityAlertEmail(
  email: string,
  { name, title, description }: { name?: string | null; title: string; description: string }
): Promise<SendEmailResult> {
  const firstName = name ? name.trim().split(" ")[0] : "Usuario";
  const subject = `Aviso de Seguridad en tu cuenta de Volta: ${title}`;

  const contentHtml = `
    <h2>Hola ${firstName},</h2>
    <p>Te informamos de una actividad importante en tu cuenta de Volta:</p>
    <div style="background: #f8fafc; border-left: 4px solid #0f766e; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <strong style="color: #0f766e; font-size: 16px;">${title}</strong>
      <p style="margin: 6px 0 0 0; color: #334155; font-size: 14px;">${description}</p>
    </div>
    <p style="font-size: 13px; color: #64748b;">Fecha y hora: ${new Date().toLocaleString("es-ES")}</p>
    <p style="font-size: 13px; color: #64748b;">Si no reconoces esta acción, por favor cambia tu contraseña inmediatamente o ponte en contacto con nuestro equipo de soporte.</p>
  `;

  const text = `Hola ${firstName},\n\nAviso de seguridad: ${title}\n${description}\nFecha: ${new Date().toLocaleString("es-ES")}`;
  const html = renderBaseTemplate({ title: subject, contentHtml });

  return sendRawEmail({ to: email, subject, html, text });
}

export default {
  sendOtpEmail,
  sendPasswordResetEmail,
  sendSecurityAlertEmail,
};
