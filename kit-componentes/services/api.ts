import { obtenerTokenActual, tokenVigente } from "./sesion";

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
// const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Ruta base de la API publicada por Backend (https://siftc.onrender.com/docs).
export const PREFIJO_API = process.env.EXPO_PUBLIC_API_PREFIX ?? "/api/v1";

// HU-MO-01 CA2: cuando el token vence o el backend responde 401, se avisa a
// App.tsx para que cierre la sesión y vuelva al login.
let alExpirarSesion: (() => void) | null = null;

export function configurarSesionExpirada(manejador: (() => void) | null) {
  alExpirarSesion = manejador;
}

export class SesionExpiradaError extends Error {
  constructor() {
    super("La sesión expiró");
  }
}

/**
 * Petición a un endpoint protegido: envía el token en la cabecera
 * Authorization. Si no hay token vigente o el backend responde 401, cierra la
 * sesión y lanza SesionExpiradaError.
 */
export async function peticionAutenticada(
  ruta: string,
  opciones: RequestInit = {},
): Promise<Response> {
  const token = obtenerTokenActual();
  if (!token || !tokenVigente(token)) {
    alExpirarSesion?.();
    throw new SesionExpiradaError();
  }

  const headers = new Headers(opciones.headers);
  headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${BASE_URL}${ruta}`, { ...opciones, headers });

  if (res.status === 401) {
    alExpirarSesion?.();
    throw new SesionExpiradaError();
  }
  return res;
}

export type LoginResult =
  | { ok: true; token: string }
  | { ok: false; error: "credenciales" | "sinConexion" };

// POST /api/v1/auth/login { usuario, password } -> { token, expiraEn, usuario }
export async function login(
  usuario: string,
  password: string,
): Promise<LoginResult> {
  try {
    const res = await fetch(`${BASE_URL}${PREFIJO_API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, password }),
    });

    if (res.status === 400 || res.status === 401) {
      return { ok: false, error: "credenciales" };
    }
    if (!res.ok) {
      return { ok: false, error: "sinConexion" }; // 5xx: el servidor no responde bien
    }

    const data = await res.json();
    return { ok: true, token: data.token };
  } catch (e) {
    console.log("Error de red:", e, "URL:", BASE_URL);
    return { ok: false, error: "sinConexion" };
  }
}
