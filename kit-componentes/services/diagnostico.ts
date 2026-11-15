/** Estado público del servidor; no requiere JWT y no consulta la conectividad del dispositivo. */
import { BASE_URL } from "./api";
export type DiagnosticoServidor = "disponible" | "no-disponible" | "sin-conexion";
export async function comprobarServidor(): Promise<DiagnosticoServidor> {
  const controlador = new AbortController();
  const timeout = setTimeout(() => controlador.abort(), 7000);
  try {
    const respuesta = await fetch(`${BASE_URL}/health`, { signal: controlador.signal });
    return respuesta.ok ? "disponible" : "no-disponible";
  } catch {
    return "sin-conexion";
  } finally {
    clearTimeout(timeout);
  }
}
