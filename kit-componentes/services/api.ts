import { obtenerTokenActual, tokenVigente } from "./sesion";

export const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? "https://siftc.onrender.com").replace(/\/+$/, "");
const API_PREFIX = process.env.EXPO_PUBLIC_API_PREFIX ?? "/api/v1";

let alExpirarSesion: (() => void) | null = null;

export function configurarSesionExpirada(manejador: (() => void) | null) {
  alExpirarSesion = manejador;
}

export class SesionExpiradaError extends Error {
  constructor() {
    super("La sesión expiró. Inicia sesión nuevamente.");
    this.name = "SesionExpiradaError";
  }
}

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
  if (opciones.body && !(opciones.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${BASE_URL}${ruta.startsWith("/") ? ruta : `/${ruta}`}`, {
    ...opciones,
    headers,
  });

  if (res.status === 401) {
    alExpirarSesion?.();
    throw new SesionExpiradaError();
  }
  return res;
}

export type LoginResult =
  | { ok: true; token: string; usuario?: { id: string; nombre: string; rol: string }; expiraEn?: number }
  | { ok: false; error: "credenciales" | "sinConexion" };

export async function login(usuario: string, password: string): Promise<LoginResult> {
  try {
    const res = await fetch(`${BASE_URL}${API_PREFIX}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      // El contrato OpenAPI define "usuario", no "email".
      body: JSON.stringify({ usuario, password }),
    });

    if (res.status === 400 || res.status === 401) {
      return { ok: false, error: "credenciales" };
    }
    if (!res.ok) {
      console.warn("Login API:", res.status, await res.text().catch(() => ""));
      return { ok: false, error: "sinConexion" };
    }

    const data = await res.json();
    if (!data?.token || typeof data.token !== "string") {
      console.warn("La respuesta de login no contiene un token JWT.");
      return { ok: false, error: "sinConexion" };
    }
    return { ok: true, token: data.token, usuario: data.usuario, expiraEn: data.expiraEn };
  } catch (e) {
    console.log("Error de red al iniciar sesión:", e, "URL:", BASE_URL);
    return { ok: false, error: "sinConexion" };
  }
}
