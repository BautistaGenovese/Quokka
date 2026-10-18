/**
 * Utilidad compartida para combinar nombres de clases de Tailwind / CSS condicionales.
 * @param {...any} inputs - Lista de nombres de clases, arreglos o valores condicionales.
 * @returns {string} Cadena unificada de clases.
 */
export function cn(...inputs) {
  return inputs
    .flat(Infinity)
    .filter(Boolean)
    .join(" ");
}
