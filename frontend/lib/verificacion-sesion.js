const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
const CACHE_MS = 30_000;
const requests = new Map();

export function clearSessionVerification() { requests.clear(); }

/** Una petición por token, compartida entre consumidores y remontajes de React. */
export function verifySession(token) {
  for (const [key, entry] of requests) if (entry.until <= Date.now()) requests.delete(key);
  const cached = requests.get(token);
  if (cached) return cached.promise;
  const entry = { until: Infinity, promise: null };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  requests.set(token, entry);
  entry.promise = (async () => {
    let valid = false;
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
      });
      // Una respuesta vieja nunca debe restaurar una sesión cerrada o reemplazada.
      if (window.localStorage.getItem("quokka_token") !== token) return;
      if (response.status === 401) {
        window.localStorage.removeItem("quokka_token");
        window.localStorage.removeItem("quokka_user");
        window.dispatchEvent(new Event("quokka:auth-change"));
        return;
      }
      if (!response.ok) return;
      const data = await response.json().catch(() => null);
      if (!data?.usuario || window.localStorage.getItem("quokka_token") !== token) return;
      const nextToken = data.token || token;
      window.localStorage.setItem("quokka_token", nextToken);
      window.localStorage.setItem("quokka_user", JSON.stringify(data.usuario));
      entry.until = Date.now() + CACHE_MS;
      requests.set(nextToken, entry);
      valid = true;
      window.dispatchEvent(new Event("quokka:auth-change"));
    } catch {
      // Un fallo temporal conserva la sesión local y permite reintentar al montar.
    } finally {
      clearTimeout(timeout);
      if (!valid) for (const [key, current] of requests) if (current === entry) requests.delete(key);
    }
  })();
  return entry.promise;
}
