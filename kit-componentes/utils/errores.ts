// Errores de la API en formato Problem Details (RFC 7807).
// Misma regla de prioridad que usa la web (mensajeError en api.js).

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[] | string>;
}

export class ErrorApi extends Error {
  status: number;
  problema?: ProblemDetails;

  constructor(status: number, problema?: ProblemDetails) {
    super(problema?.detail ?? problema?.title ?? `Error ${status}`);
    Object.setPrototypeOf(this, ErrorApi.prototype);
    this.name = "ErrorApi";
    this.status = status;
    this.problema = problema;
  }
}

export const MSG_SIN_CONEXION = "No hay conexión con el servidor. Intenta de nuevo.";

/**
 * Texto que se muestra al usuario. Prioridad: detail -> errors -> title ->
 * mensaje según el estado. Sin respuesta del servidor: sin conexión.
 */
export function mensajeError(
  err: unknown,
  porDefecto = "Ocurrió un error. Intenta de nuevo.",
): string {
  if (err instanceof ErrorApi) {
    const p = err.problema;
    if (p?.detail) return p.detail;
    if (p?.errors) return Object.values(p.errors).flat().join(" ");
    if (p?.title) return p.title;
    if (err.status === 403) return "Tu rol no tiene permiso para esta acción.";
    if (err.status >= 500) return "Error del servidor. Intenta más tarde.";
    return porDefecto;
  }
  // fetch lanza TypeError cuando no logra comunicarse con el servidor
  if (err instanceof TypeError) return MSG_SIN_CONEXION;
  return porDefecto;
}
