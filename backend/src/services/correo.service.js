const nodemailer = require('nodemailer');

const ETIQUETAS_TIPO = {
  cotizacion: 'Cotización de proyecto integral',
  asesoria: 'Asesoría técnica y arquitectura',
  general: 'Consulta general',
  consulta: 'Consulta general',
};

let transportadorEnCache = null;
let esCuentaDePrueba = false;

/**
 * Obtiene o inicializa el transportador de Nodemailer.
 * Si SMTP_USER y SMTP_PASS están configurados en .env, usa el servidor SMTP real (ej. Gmail).
 * En caso contrario, crea automáticamente una cuenta de prueba en Ethereal para desarrollo.
 */
async function obtenerTransportador() {
  if (transportadorEnCache) {
    return { transportador: transportadorEnCache, esCuentaDePrueba };
  }

  const tieneCredencialesSmtp = Boolean(
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    !process.env.SMTP_USER.includes('tu_correo')
  );

  if (tieneCredencialesSmtp) {
    transportadorEnCache = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    esCuentaDePrueba = false;
    return { transportador: transportadorEnCache, esCuentaDePrueba };
  }

  // Fallback automático a Ethereal Email para desarrollo local sin credenciales
  const cuentaPrueba = await nodemailer.createTestAccount();
  transportadorEnCache = nodemailer.createTransport({
    host: cuentaPrueba.smtp.host,
    port: cuentaPrueba.smtp.port,
    secure: cuentaPrueba.smtp.secure,
    auth: {
      user: cuentaPrueba.user,
      pass: cuentaPrueba.pass,
    },
  });
  esCuentaDePrueba = true;
  console.log('📧 Modo desarrollo: Usando cuenta de prueba Ethereal para correos:', cuentaPrueba.user);
  return { transportador: transportadorEnCache, esCuentaDePrueba };
}

/**
 * Escapa caracteres HTML para evitar inyecciones XSS en clientes de correo.
 */
function escaparHtml(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Elimina saltos de línea y caracteres de control para prevenir Email Header Injection (CRLF).
 */
function sanitizarValorCabecera(valor) {
  return String(valor)
    .replace(/[\r\n\0]+/g, ' ')
    .trim();
}

/**
 * Envía el correo de notificación al equipo de Quokka con Reply-To seguro configurado al correo del cliente.
 */
async function enviarNotificacionContacto({ id, nombre, email, tipo, mensaje, creado_en }) {
  const { transportador, esCuentaDePrueba: usandoEthereal } = await obtenerTransportador();
  const etiquetaTipo = ETIQUETAS_TIPO[tipo] || tipo;
  const direccionRemitente = process.env.SMTP_USER && !process.env.SMTP_USER.includes('tu_correo')
    ? sanitizarValorCabecera(process.env.SMTP_USER)
    : 'notificaciones@quokka.studio';
  const direccionDestinatario = process.env.CONTACT_RECEIVER_EMAIL && !process.env.CONTACT_RECEIVER_EMAIL.includes('tu_correo')
    ? sanitizarValorCabecera(process.env.CONTACT_RECEIVER_EMAIL)
    : direccionRemitente;

  const nombreCabeceraLimpio = sanitizarValorCabecera(nombre);
  const emailCabeceraLimpio = sanitizarValorCabecera(email);
  const tipoCabeceraLimpio = sanitizarValorCabecera(etiquetaTipo);

  const nombreSeguro = escaparHtml(nombreCabeceraLimpio);
  const emailSeguro = escaparHtml(emailCabeceraLimpio);
  const tipoSeguro = escaparHtml(tipoCabeceraLimpio);
  const mensajeSeguro = escaparHtml(mensaje).replace(/\r?\n/g, '<br />');

  const info = await transportador.sendMail({
    from: {
      name: 'Quokka Studio Web',
      address: direccionRemitente,
    },
    to: direccionDestinatario,
    replyTo: {
      name: nombreCabeceraLimpio,
      address: emailCabeceraLimpio,
    },
    subject: `[Quokka] ${tipoCabeceraLimpio} - ${nombreCabeceraLimpio}`,
    text: [
      `Nueva solicitud recibida en Quokka Studio (#${id || 's/n'})`,
      `----------------------------------------`,
      `Nombre: ${nombreCabeceraLimpio}`,
      `Correo del cliente: ${emailCabeceraLimpio}`,
      `Tipo de consulta: ${tipoCabeceraLimpio}`,
      `Fecha: ${creado_en ? new Date(creado_en).toLocaleString('es-AR') : new Date().toLocaleString('es-AR')}`,
      ``,
      `Mensaje:`,
      mensaje,
      `----------------------------------------`,
      `Podés responder directamente a este correo para escribirle a ${emailCabeceraLimpio}.`,
    ].join('\n'),
    html: `
      <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8faf9; border-radius: 12px; color: #1b2420; border: 1px solid #dce5e0;">
        <p style="font-family: monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #4a6358; margin: 0 0 8px;">
          Quokka Studio · Solicitud #${escaparHtml(id || 'Nueva')}
        </p>
        <h2 style="margin: 0 0 16px; font-size: 22px; color: #121815;">
          ${tipoSeguro}
        </h2>
        <div style="background-color: #ffffff; padding: 16px 20px; border-radius: 8px; border: 1px solid #e4ece8; margin-bottom: 20px;">
          <p style="margin: 0 0 8px;"><strong>Nombre:</strong> ${nombreSeguro}</p>
          <p style="margin: 0 0 8px;"><strong>Correo electrónico:</strong> <a href="mailto:${emailSeguro}" style="color: #2b6cb0;">${emailSeguro}</a></p>
          <p style="margin: 0;"><strong>Categoría:</strong> ${tipoSeguro}</p>
        </div>
        <div style="background-color: #ffffff; padding: 16px 20px; border-radius: 8px; border: 1px solid #e4ece8; margin-bottom: 20px;">
          <p style="margin: 0 0 8px; font-weight: 600;">Mensaje detallado:</p>
          <p style="margin: 0; line-height: 1.6; white-space: normal;">${mensajeSeguro}</p>
        </div>
        <p style="font-size: 13px; color: #5a6b63; margin: 0;">
          💡 <em>Al tocar "Responder" en tu cliente de correo, la respuesta irá dirigida directamente a <strong>${emailSeguro}</strong>.</em>
        </p>
      </div>
    `,
  });

  const urlVistaPrevia = usandoEthereal ? nodemailer.getTestMessageUrl(info) : null;
  if (urlVistaPrevia) {
    console.log(`🔗 Vista previa del correo enviado (Ethereal): ${urlVistaPrevia}`);
  }

  return {
    idMensaje: info.messageId,
  };
}

/**
 * Envía el correo de respuesta del Operador directamente al cliente que realizó la consulta.
 */
async function enviarRespuestaContacto({ id, nombre, email, tipo, mensaje, respuesta, respondido_en }) {
  const { transportador, esCuentaDePrueba: usandoEthereal } = await obtenerTransportador();
  const etiquetaTipo = ETIQUETAS_TIPO[tipo] || tipo;
  const direccionRemitente = process.env.SMTP_USER && !process.env.SMTP_USER.includes('tu_correo')
    ? sanitizarValorCabecera(process.env.SMTP_USER)
    : 'notificaciones@quokka.studio';
  const direccionRespuesta = process.env.CONTACT_RECEIVER_EMAIL && !process.env.CONTACT_RECEIVER_EMAIL.includes('tu_correo')
    ? sanitizarValorCabecera(process.env.CONTACT_RECEIVER_EMAIL)
    : direccionRemitente;

  const nombreCabeceraLimpio = sanitizarValorCabecera(nombre);
  const emailCabeceraLimpio = sanitizarValorCabecera(email);
  const tipoCabeceraLimpio = sanitizarValorCabecera(etiquetaTipo);

  const nombreSeguro = escaparHtml(nombreCabeceraLimpio);
  const tipoSeguro = escaparHtml(tipoCabeceraLimpio);
  const mensajeOriginalSeguro = escaparHtml(mensaje || '').replace(/\r?\n/g, '<br />');
  const respuestaSegura = escaparHtml(respuesta).replace(/\r?\n/g, '<br />');

  const info = await transportador.sendMail({
    from: {
      name: 'Quokka Studio',
      address: direccionRemitente,
    },
    to: {
      name: nombreCabeceraLimpio,
      address: emailCabeceraLimpio,
    },
    replyTo: {
      name: 'Quokka Studio',
      address: direccionRespuesta,
    },
    subject: `Re: [Quokka] ${tipoCabeceraLimpio} (#${id || 's/n'})`,
    text: [
      `Hola ${nombreCabeceraLimpio},`,
      ``,
      `Te escribimos desde Quokka Studio en respuesta a tu consulta (#${id || 's/n'} - ${tipoCabeceraLimpio}):`,
      `----------------------------------------`,
      respuesta,
      `----------------------------------------`,
      ``,
      `Tu consulta original:`,
      mensaje || '',
      ``,
      `Fecha de respuesta: ${respondido_en ? new Date(respondido_en).toLocaleString('es-AR') : new Date().toLocaleString('es-AR')}`,
      `Quokka Studio`,
    ].join('\n'),
    html: `
      <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8faf9; border-radius: 12px; color: #1b2420; border: 1px solid #dce5e0;">
        <p style="font-family: monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #4a6358; margin: 0 0 8px;">
          Quokka Studio · Respuesta a solicitud #${escaparHtml(id || 's/n')}
        </p>
        <h2 style="margin: 0 0 16px; font-size: 22px; color: #121815;">
          Hola ${nombreSeguro}, respondimos tu consulta
        </h2>
        <div style="background-color: #ffffff; padding: 16px 20px; border-radius: 8px; border: 1px solid #e4ece8; margin-bottom: 20px;">
          <p style="margin: 0 0 8px; font-weight: 600;">Nuestra respuesta (${tipoSeguro}):</p>
          <p style="margin: 0; line-height: 1.6; white-space: normal;">${respuestaSegura}</p>
        </div>
        <div style="background-color: #f1f5f3; padding: 14px 18px; border-radius: 8px; border: 1px solid #dce5e0; margin-bottom: 16px;">
          <p style="margin: 0 0 6px; font-size: 13px; font-weight: 600; color: #4a6358;">Tu mensaje original:</p>
          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #3a4a42;">${mensajeOriginalSeguro}</p>
        </div>
        <p style="font-size: 13px; color: #5a6b63; margin: 0;">
          Podés responder directamente a este correo si querés sumar más detalles.
        </p>
      </div>
    `,
  });

  const urlVistaPrevia = usandoEthereal ? nodemailer.getTestMessageUrl(info) : null;
  if (urlVistaPrevia) {
    console.log(`🔗 Vista previa de respuesta enviada al cliente (Ethereal): ${urlVistaPrevia}`);
  }

  return {
    idMensaje: info.messageId,
  };
}

module.exports = {
  enviarNotificacionContacto,
  enviarRespuestaContacto,
  sanitizarValorCabecera,
  escaparHtml,
  ETIQUETAS_TIPO,
};
