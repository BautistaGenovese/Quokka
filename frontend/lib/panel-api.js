const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

/** Adaptador común del panel. La identidad se integrará en esta capa. */
export async function panelRequest(path, { body, ...options } = {}) {
  const token = typeof window !== "undefined" ? window.localStorage?.getItem("quokka_token") : null;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.error || "No pudimos completar la operación. Intentá nuevamente.");
    error.status = response.status;
    error.fields = data?.fields || {};
    throw error;
  }
  if (response.status !== 204 && data === null) throw new Error("El servidor devolvió una respuesta inesperada.");
  return data;
}

export async function panelList(path, options) {
  const data = await panelRequest(path, options);
  // El contrato permite integrar tanto un arreglo como un sobre (contactos / usuarios).
  const records = Array.isArray(data) ? data : (data?.contactos || data?.usuarios);
  if (!Array.isArray(records)) throw new Error("No pudimos interpretar el listado del servidor.");
  return records;
}

export function saveCatalogRecord(kind, id, values) {
  return panelRequest(`/api/admin/${kind}${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", body: values });
}

export function deleteCatalogRecord(kind, id) {
  return panelRequest(`/api/admin/${kind}/${id}`, { method: "DELETE" });
}

export function replyToContact(id, respuesta) {
  return panelRequest(`/api/operador/contactos/${id}/responder`, { method: "POST", body: { respuesta } });
}

export function updateUserRole(id, rol) {
  return panelRequest(`/api/admin/usuarios/${id}/rol`, { method: "PATCH", body: { rol } });
}

export function deleteUser(id) {
  return panelRequest(`/api/admin/usuarios/${id}`, { method: "DELETE" });
}


