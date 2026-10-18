const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const TOKEN_KEY = "quokka_auth_token";
const USER_KEY = "quokka_auth_user";

/**
 * Obtiene el token guardado en el navegador.
 */
export function getStoredToken() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Obtiene el usuario autenticado almacenado en el navegador.
 */
export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Guarda sesión en el navegador.
 */
export function saveSession(usuario, token) {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (usuario) localStorage.setItem(USER_KEY, JSON.stringify(usuario));
    window.dispatchEvent(new Event("quokka:auth-change"));
  } catch (error) {
    console.error("Error al persistir sesión en localStorage:", error);
  }
}

/**
 * Cierra la sesión activa.
 */
export function logout() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event("quokka:auth-change"));
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
}

/**
 * Inicia sesión contra el backend de Quokka.
 * @param {{ email: string, password: string }} credentials
 */
export async function loginRequest(credentials) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || "No se pudo iniciar sesión.");
    if (data.detalles) error.detalles = data.detalles;
    throw error;
  }

  saveSession(data.usuario, data.token);
  return data;
}

/**
 * Registra un nuevo usuario en la base de datos.
 * @param {{ nombre: string, email: string, password: string }} payload
 */
export async function registerRequest(payload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/registro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || "No se pudo registrar la cuenta.");
    if (data.detalles) error.detalles = data.detalles;
    throw error;
  }

  saveSession(data.usuario, data.token);
  return data;
}

/**
 * Consulta el perfil del usuario actual usando su token.
 */
export async function fetchCurrentUser() {
  const token = getStoredToken();
  if (!token) return null;

  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      logout();
    }
    return null;
  }

  const data = await response.json();
  if (data?.usuario) {
    saveSession(data.usuario, token);
    return data.usuario;
  }
  return null;
}

/**
 * Obtiene la lista de usuarios para el panel de administración.
 * @param {{ busqueda?: string, rol?: string }} [params={}]
 */
export async function getAdminUsers({ busqueda, rol } = {}) {
  const token = getStoredToken();
  if (!token) {
    throw new Error("Se requiere iniciar sesión como Administrador.");
  }

  const query = new URLSearchParams();
  if (busqueda) query.set("busqueda", busqueda);
  if (rol && rol !== "todos") query.set("rol", rol);

  const qs = query.toString() ? `?${query.toString()}` : "";
  const response = await fetch(`${API_BASE_URL}/api/admin/usuarios${qs}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "No se pudo cargar la lista de usuarios.");
  }

  return data;
}

/**
 * Modifica el rol de un usuario desde el panel del Administrador.
 * @param {number|string} userId
 * @param {'usuario'|'operador'|'administrador'} nuevoRol
 */
export async function updateAdminUserRol(userId, nuevoRol) {
  const token = getStoredToken();
  if (!token) {
    throw new Error("Se requiere iniciar sesión como Administrador.");
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/usuarios/${userId}/rol`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rol: nuevoRol }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "No se pudo actualizar el rol del usuario.");
  }

  return data;
}

/**
 * Elimina un usuario desde el panel de Administrador.
 * @param {number|string} userId
 */
export async function deleteAdminUser(userId) {
  const token = getStoredToken();
  if (!token) {
    throw new Error("Se requiere iniciar sesión como Administrador.");
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/usuarios/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "No se pudo eliminar el usuario.");
  }

  return data;
}
