import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { registrarParaNotificaciones } from '../services/notificaciones';

// Registra el celular para notificaciones y abre la ficha
// de la entidad cuando el usuario toca una notificación.
export function useNotificaciones(
  habilitado: boolean,
  abrirFicha: (entidadId: string) => void
) {
  // Evita abrir dos veces la misma notificación
  const ultimaAtendida = useRef<string | null>(null);

  useEffect(() => {
    if (!habilitado) return;

    registrarParaNotificaciones().catch((error) =>
      console.log('[notificaciones] Error al registrar:', error)
    );

    const manejar = (respuesta: Notifications.NotificationResponse) => {
      const id = respuesta.notification.request.identifier;
      if (ultimaAtendida.current === id) return;
      ultimaAtendida.current = id;

      const entidadId = respuesta.notification.request.content.data?.entidadId;
      if (entidadId != null) {
        abrirFicha(String(entidadId));
      }
    };

    // La app estaba cerrada y la abrieron tocando la notificación
    Notifications.getLastNotificationResponseAsync().then((respuesta) => {
      if (respuesta) manejar(respuesta);
    });

    // La app estaba abierta o en segundo plano
    const suscripcion =
      Notifications.addNotificationResponseReceivedListener(manejar);

    return () => suscripcion.remove();
  }, [habilitado, abrirFicha]);
}