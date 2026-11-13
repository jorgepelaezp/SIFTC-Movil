
import {
  peticionAutenticada,
  SesionExpiradaError,
} from "./api";

import {
  eliminarMutacionPendiente,
  obtenerMutacionesPendientes,
} from "./offline";

import { notificarDatosActualizados } from "./syncEvents";

let sincronizando = false;

export async function sincronizarPendientes(): Promise<number> {
  if (sincronizando) return 0;

  sincronizando = true;
  let completadas = 0;

  try {
    const pendientes = await obtenerMutacionesPendientes();

    for (const operacion of pendientes) {
      try {
        const respuesta = await peticionAutenticada(
          operacion.path,
          { method: operacion.method }
        );

        if (!respuesta.ok) {
          if (
            respuesta.status >= 400 &&
            respuesta.status < 500
          ) {
            await eliminarMutacionPendiente(operacion.id);
            continue;
          }

          break;
        }

        await eliminarMutacionPendiente(operacion.id);
        completadas += 1;
      } catch (error) {
        if (error instanceof SesionExpiradaError) break;

        // Si no hay red, se conserva la operación pendiente.
        break;
      }
    }

    if (completadas > 0) {
      notificarDatosActualizados();
    }

    return completadas;
  } finally {
    sincronizando = false;
  }
}
