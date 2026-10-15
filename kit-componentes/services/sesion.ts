import * as SecureStore from "expo-secure-store";

// Sesión segura (HU-MO-01 CA2): el token se guarda en el almacenamiento
// protegido del sistema (Keychain en iOS, Keystore en Android) y se descarta
// cuando vence. expo-secure-store no funciona en web: ahí la sesión no persiste.

const CLAVE_TOKEN = "siftc.token";

// Se da por vencido un poco antes de "exp" para no usar un token que caduca
// durante una petición.
const MARGEN_MS = 30_000;

let tokenActual: string | null = null;

/** Token de la sesión activa, para las peticiones autenticadas. */
export function obtenerTokenActual(): string | null {
  return tokenActual;
}

export async function guardarToken(token: string): Promise<void> {
  tokenActual = token;
  try {
    await SecureStore.setItemAsync(CLAVE_TOKEN, token);
  } catch {
    console.warn("No se pudo guardar la sesión en el almacenamiento seguro");
  }
}

export async function eliminarToken(): Promise<void> {
  tokenActual = null;
  try {
    await SecureStore.deleteItemAsync(CLAVE_TOKEN);
  } catch {
    // Sin almacenamiento seguro (web) no hay nada que borrar.
  }
}

/** Fecha de vencimiento del JWT (claim "exp") en milisegundos, o null si no se puede leer. */
export function vencimientoToken(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const relleno = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const { exp } = JSON.parse(atob(relleno));
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Indica si el token aún no vence. No valida la firma: eso lo hace el backend,
 * que responde 401 si el token no es válido.
 */
export function tokenVigente(token: string, ahora = Date.now()): boolean {
  const vence = vencimientoToken(token);
  return vence !== null && ahora < vence - MARGEN_MS;
}

export type SesionRestaurada = { token: string | null; vencida: boolean };

/**
 * Recupera la sesión guardada al abrir la app. Devuelve el token si sigue
 * vigente; si venció o no se puede leer, lo elimina y devuelve token null
 * (vencida = true indica que había una sesión y caducó).
 */
export async function restaurarSesion(): Promise<SesionRestaurada> {
  let token: string | null = null;
  try {
    token = await SecureStore.getItemAsync(CLAVE_TOKEN);
  } catch {
    return { token: null, vencida: false };
  }
  if (token && tokenVigente(token)) {
    tokenActual = token;
    return { token, vencida: false };
  }
  if (token) await eliminarToken();
  return { token: null, vencida: token !== null };
}
