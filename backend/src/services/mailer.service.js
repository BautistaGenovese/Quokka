const nodemailer = require('nodemailer');

const TYPE_LABELS = {
  cotizacion: 'Cotización de proyecto integral',
  asesoria: 'Asesoría técnica y arquitectura',
  general: 'Consulta general',
};

let cachedTransporter = null;
let isTestAccount = false;

/**
 * Obtiene o inicializa el transporter de Nodemailer.
 * Si SMTP_USER y SMTP_PASS están configurados en .env, usa el servidor SMTP real (ej. Gmail).
 * En caso contrario, crea automáticamente una cuenta de prueba en Ethereal para desarrollo.
 */
async function getTransporter() {
  if (cachedTransporter) {
    return { transporter: cachedTransporter, isTestAccount };
  }

  const hasSmtpCredentials = Boolean(
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    !process.env.SMTP_USER.includes('tu_correo')
  );

  if (hasSmtpCredentials) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    isTestAccount = false;
    return { transporter: cachedTransporter, isTestAccount };
  }

  // Fallback automático a Ethereal Email para desarrollo local sin credenciales
  const testAccount = await nodemailer.createTestAccount();
  cachedTransporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  isTestAccount = true;
  console.log('📧 Modo desarrollo: Usando cuenta de prueba Ethereal para correos:', testAccount.user);
  return { transporter: cachedTransporter, isTestAccount };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Envía el correo de notificación al equipo de Quokka con Reply-To configurado al correo del cliente.
 */
async function sendContactNotification({ id, name, email, type, message, createdAt }) {
  const { transporter, isTestAccount: usingEthereal } = await getTransporter();
  const typeLabel = TYPE_LABELS[type] || type;
  const senderAddress = process.env.SMTP_USER && !process.env.SMTP_USER.includes('tu_correo')
    ? process.env.SMTP_USER
    : 'notificaciones@quokka.studio';
  const receiverAddress = process.env.CONTACT_RECEIVER_EMAIL && !process.env.CONTACT_RECEIVER_EMAIL.includes('tu_correo')
    ? process.env.CONTACT_RECEIVER_EMAIL
    : senderAddress;

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeType = escapeHtml(typeLabel);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

  const info = await transporter.sendMail({
    from: `"Quokka Studio Web" <${senderAddress}>`,
    to: receiverAddress,
    replyTo: `"${name}" <${email}>`,
    subject: `[Quokka] ${typeLabel} - ${name}`,
    text: [
      `Nueva solicitud recibida en Quokka Studio (#${id || 's/n'})`,
      `----------------------------------------`,
      `Nombre: ${name}`,
      `Correo del cliente: ${email}`,
      `Tipo de consulta: ${typeLabel}`,
      `Fecha: ${createdAt ? new Date(createdAt).toLocaleString('es-AR') : new Date().toLocaleString('es-AR')}`,
      ``,
      `Mensaje:`,
      message,
      `----------------------------------------`,
      `Podés responder directamente a este correo para escribirle a ${email}.`,
    ].join('\n'),
    html: `
      <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8faf9; border-radius: 12px; color: #1b2420; border: 1px solid #dce5e0;">
        <p style="font-family: monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #4a6358; margin: 0 0 8px;">
          Quokka Studio · Solicitud #${id || 'Nueva'}
        </p>
        <h2 style="margin: 0 0 16px; font-size: 22px; color: #121815;">
          ${safeType}
        </h2>
        <div style="background-color: #ffffff; padding: 16px 20px; border-radius: 8px; border: 1px solid #e4ece8; margin-bottom: 20px;">
          <p style="margin: 0 0 8px;"><strong>Nombre:</strong> ${safeName}</p>
          <p style="margin: 0 0 8px;"><strong>Correo electrónico:</strong> <a href="mailto:${safeEmail}" style="color: #2b6cb0;">${safeEmail}</a></p>
          <p style="margin: 0;"><strong>Categoría:</strong> ${safeType}</p>
        </div>
        <div style="background-color: #ffffff; padding: 16px 20px; border-radius: 8px; border: 1px solid #e4ece8; margin-bottom: 20px;">
          <p style="margin: 0 0 8px; font-weight: 600;">Mensaje detallado:</p>
          <p style="margin: 0; line-height: 1.6; white-space: normal;">${safeMessage}</p>
        </div>
        <p style="font-size: 13px; color: #5a6b63; margin: 0;">
          💡 <em>Al tocar "Responder" en tu cliente de correo, la respuesta irá dirigida directamente a <strong>${safeEmail}</strong>.</em>
        </p>
      </div>
    `,
  });

  const previewUrl = usingEthereal ? nodemailer.getTestMessageUrl(info) : null;
  if (previewUrl) {
    console.log(`🔗 Vista previa del correo enviado (Ethereal): ${previewUrl}`);
  }

  return {
    messageId: info.messageId,
    previewUrl,
  };
}

module.exports = {
  sendContactNotification,
  TYPE_LABELS,
};
