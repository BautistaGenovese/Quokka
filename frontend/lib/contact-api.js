const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * Envía una solicitud de cotización, asesoría técnica o consulta general al backend.
 * @param {{ name: string, email: string, type: string, message: string }} values
 */
export async function submitContactRequest(values) {
  const response = await fetch(`${API_BASE_URL}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || "No se pudo enviar el mensaje. Probá de nuevo.");
    if (data.fields) error.fields = data.fields;
    throw error;
  }

  return data;
}
