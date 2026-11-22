import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const USAR_MOCKS = process.env.EXPO_PUBLIC_USAR_MOCKS === 'true';

// Cómo se muestran las notificaciones cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registrarParaNotificaciones(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('[notificaciones] Usa un celular real para probar push');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alertas-umbral', {
      name: 'Alertas de umbral',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const { status: actual } = await Notifications.getPermissionsAsync();
  let estado = actual;
  if (actual !== 'granted') {
    estado = (await Notifications.requestPermissionsAsync()).status;
  }
  if (estado !== 'granted') {
    console.log('[notificaciones] Permiso denegado');
    return null;
  }

  const token = (await Notifications.getDevicePushTokenAsync()).data;
  console.log('[notificaciones] TOKEN FCM:', token);
  await enviarTokenAlBackend(token);
  return token;
}

async function enviarTokenAlBackend(token: string) {
  if (USAR_MOCKS) {
    console.log('[mock] token registrado en backend');
    return;
  }
  // PENDIENTE: endpoint que confirme Moisés
}

// Preferencias en memoria mientras se usan mocks (se pierden al cerrar la app)
const avisosMock = new Map<string, boolean>();

export async function obtenerAvisosEntidad(entidadId: string): Promise<boolean> {
  if (USAR_MOCKS) {
    return avisosMock.get(entidadId) ?? true;
  }
  // PENDIENTE: endpoint que confirme Moisés. Por ahora, activado por defecto.
  return true;
}

export async function cambiarAvisosEntidad(entidadId: string, activo: boolean) {
  if (USAR_MOCKS) {
    avisosMock.set(entidadId, activo);
    console.log('[mock] avisos de', entidadId, '=', activo);
    return;
  }
  // PENDIENTE: endpoint que confirme Moisés
  throw new Error('La configuración de alertas aún no está disponible.');
}