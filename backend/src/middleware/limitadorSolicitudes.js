/**
 * Middleware de límite de solicitudes en memoria para prevenir spam, fuerza bruta
 * y abuso del servicio de correo / base de datos.
 */
function crearLimitadorSolicitudes({
  ventanaMs = 15 * 60 * 1000, // 15 minutos por defecto
  maximoSolicitudes = 5,     // Máximo 5 envíos por ventana por IP
  maximoClaves = 5000,       // Tope máximo de IPs en memoria (protección anti-DoS)
  mensaje = 'Realizaste demasiados intentos. Por favor, esperá unos minutos antes de volver a intentar.',
} = {}) {
  const intentos = new Map();

  function limpiarExpirados(ahora) {
    for (const [clave, registro] of intentos.entries()) {
      if (ahora >= registro.reiniciaEn) {
        intentos.delete(clave);
      }
    }
    // Si aún supera el tope tras limpiar expirados, expulsar las entradas más antiguas (FIFO)
    if (intentos.size > maximoClaves) {
      const sobrante = intentos.size - maximoClaves;
      const iterador = intentos.keys();
      for (let i = 0; i < sobrante; i++) {
        intentos.delete(iterador.next().value);
      }
    }
  }

  const middleware = (req, res, next) => {
    const ahora = Date.now();
    if (intentos.size >= 1000) limpiarExpirados(ahora);

    const ip = req.ip || req.socket?.remoteAddress || 'desconocida';
    const actual = intentos.get(ip);

    if (!actual || ahora >= actual.reiniciaEn) {
      intentos.set(ip, { cantidad: 1, reiniciaEn: ahora + ventanaMs });
      res.setHeader('X-RateLimit-Limit', String(maximoSolicitudes));
      res.setHeader('X-RateLimit-Remaining', String(maximoSolicitudes - 1));
      return next();
    }

    if (actual.cantidad >= maximoSolicitudes) {
      const segundosReintento = Math.ceil((actual.reiniciaEn - ahora) / 1000);
      res.setHeader('Retry-After', String(segundosReintento));
      res.setHeader('X-RateLimit-Limit', String(maximoSolicitudes));
      res.setHeader('X-RateLimit-Remaining', '0');
      return res.status(429).json({
        ok: false,
        error: mensaje,
      });
    }

    actual.cantidad += 1;
    res.setHeader('X-RateLimit-Limit', String(maximoSolicitudes));
    res.setHeader('X-RateLimit-Remaining', String(maximoSolicitudes - actual.cantidad));
    return next();
  };

  middleware.reiniciar = () => intentos.clear();
  return middleware;
}

module.exports = { crearLimitadorSolicitudes };
