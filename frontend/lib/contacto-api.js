const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * Envía una solicitud de cotización, asesoría técnica o consulta general al backend.
 * @param {{ name: string, email: string, type: string, message: string }} values
 */
export async function submitContactRequest(values) {
  const payload = {
    nombre: values.nombre ?? values.name,
    email: values.email,
    tipo: values.tipo ?? values.type,
    mensaje: values.mensaje ?? values.message,
  };

  const token = typeof window !== "undefined" ? window.localStorage?.getItem("quokka_token") : null;

  const response = await fetch(`${API_BASE_URL}/api/contacto`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || "No se pudo enviar el mensaje. Probá de nuevo.");
    if (data.fields) error.fields = data.fields;
    throw error;
  }

  return data;
}
