/** El puntero puede expirar entre hasPointerCapture y release (cancelación,
 * cambio de pestaña o captura perdida). Ignorar solo ese estado del navegador. */
function captureOperation(element, pointerId, release) {
  if (!element || !Number.isInteger(pointerId) || pointerId < 0) return false;
  try {
    if (release && !element.hasPointerCapture?.(pointerId)) return false;
    const operation = release ? element.releasePointerCapture : element.setPointerCapture;
    if (!operation) return false;
    operation.call(element, pointerId);
    return true;
  } catch (error) {
    if (error.name === "NotFoundError" || error.name === "InvalidStateError") return false;
    throw error;
  }
}
export const capturePointer = (element, pointerId) => captureOperation(element, pointerId, false);
export const releasePointer = (element, pointerId) => captureOperation(element, pointerId, true);
