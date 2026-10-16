/**
 * Middleware de Rate Limiting en memoria para prevenir spam, fuerza bruta
 * y abuso del servicio de correo / base de datos.
 */
function createRateLimiter({
  windowMs = 15 * 60 * 1000, // 15 minutos por defecto
  maxRequests = 5,           // Máximo 5 envíos por ventana por IP
  message = 'Realizaste demasiados intentos. Por favor, esperá unos minutos antes de volver a intentar.',
} = {}) {
  const hits = new Map();

  function cleanup(now) {
    for (const [key, entry] of hits.entries()) {
      if (now >= entry.resetAt) {
        hits.delete(key);
      }
    }
  }

  const middleware = (req, res, next) => {
    const now = Date.now();
    if (hits.size > 1000) cleanup(now);

    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const current = hits.get(ip);

    if (!current || now >= current.resetAt) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
      res.setHeader('X-RateLimit-Limit', String(maxRequests));
      res.setHeader('X-RateLimit-Remaining', String(maxRequests - 1));
      return next();
    }

    if (current.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.setHeader('X-RateLimit-Limit', String(maxRequests));
      res.setHeader('X-RateLimit-Remaining', '0');
      return res.status(429).json({
        ok: false,
        error: message,
      });
    }

    current.count += 1;
    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(maxRequests - current.count));
    return next();
  };

  middleware.reset = () => hits.clear();
  return middleware;
}

module.exports = { createRateLimiter };
