// Datos del mercado obtenidos de endpoints documentados de SIFTC,
// con almacenamiento persistente en SQLite.

import type {
  DatosMercado,
  Entidad,
  TopMercado,
} from "../models";

import {
  peticionAutenticada,
  SesionExpiradaError,
} from "./api";

import { MOCK_ENTIDADES } from "./mocks";

import {
  calcularTop,
  desdeApiEntidad,
  desdeMockEntidad,
} from "./adaptadores";

import {
  ErrorApi,
  type ProblemDetails,
} from "../utils/errores";

import {
  guardarCache,
  leerCache,
} from "./offline";

const PREFIJO =
  process.env.EXPO_PUBLIC_API_PREFIX ?? "/api/v1";

export const usarMocks = () =>
  process.env.EXPO_PUBLIC_USAR_MOCKS === "true";

const escenario = () =>
  process.env.EXPO_PUBLIC_MOCK_ESCENARIO ?? "normal";

function rutaCompleta(ruta: string): string {
  return `${PREFIJO}${
    ruta.startsWith("/") ? ruta : `/${ruta}`
  }`;
}

/**
 * Realiza una petición autenticada.
 *
 * Para GET:
 * 1. Intenta consultar el Backend.
 * 2. Guarda la respuesta en SQLite.
 * 3. Si no hay conexión, recupera los datos guardados.
 *
 * Para otros métodos, realiza la petición directamente.
 */
export async function pedir<T>(
  ruta: string,
  opciones: RequestInit = {}
): Promise<T> {
  const metodo = (
    opciones.method ?? "GET"
  ).toUpperCase();

  const clave = rutaCompleta(ruta);

  if (metodo !== "GET") {
    const res = await peticionAutenticada(
      clave,
      opciones
    );

    if (!res.ok) {
      let problema: ProblemDetails | undefined;

      try {
        problema = await res.json();
      } catch {
        // La respuesta no contiene JSON.
      }

      throw new ErrorApi(res.status, problema);
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return (await res.json()) as T;
  }

  try {
    const res = await peticionAutenticada(
      clave,
      opciones
    );

    if (!res.ok) {
      let problema: ProblemDetails | undefined;

      try {
        problema = await res.json();
      } catch {
        // La respuesta no contiene JSON.
      }

      // No se deben ocultar errores de autenticación,
      // permisos o validación utilizando datos antiguos.
      if (res.status < 500) {
        throw new ErrorApi(res.status, problema);
      }

      const cache = await leerCache<T>(clave).catch(
        () => null
      );

      if (cache) {
        return cache.data;
      }

      throw new ErrorApi(res.status, problema);
    }

    const datos = (await res.json()) as T;

    // Un fallo al guardar la caché no debe impedir
    // mostrar una respuesta obtenida correctamente.
    await guardarCache(clave, datos).catch((error) =>
      console.warn(
        "No se pudo actualizar la caché SQLite:",
        error
      )
    );

    return datos;
  } catch (error) {
    if (
      error instanceof SesionExpiradaError ||
      error instanceof ErrorApi
    ) {
      throw error;
    }

    const cache = await leerCache<T>(clave).catch(
      () => null
    );

    if (cache) {
      return cache.data;
    }

    throw new Error(
      "Sin conexión y no hay datos guardados para esta consulta. Conéctate a Internet y vuelve a intentarlo."
    );
  }
}

export async function simularRed(): Promise<void> {
  await new Promise((resolve) =>
    setTimeout(resolve, 500)
  );

  if (escenario() === "sinConexion") {
    throw new TypeError("Network request failed");
  }

  if (escenario() === "error") {
    throw new ErrorApi(500, {
      title: "Error de prueba",
      status: 500,
    });
  }
}

export async function getEntidades(): Promise<Entidad[]> {
  if (usarMocks()) {
    await simularRed();

    if (escenario() === "vacio") {
      return [];
    }

    return MOCK_ENTIDADES.map(desdeMockEntidad);
  }

  const todos: any[] = [];

  for (let page = 1; page <= 50; page++) {
    let lote: any[];

    try {
      lote = await pedir<any[]>(
        `/entidades?page=${page}&size=100&sort=ic&dir=desc`
      );
    } catch (error) {
      if (todos.length > 0) {
        break;
      }

      throw error;
    }

    if (!Array.isArray(lote) || lote.length === 0) {
      break;
    }

    todos.push(...lote);

    if (lote.length < 100) {
      break;
    }
  }

  return todos.map(desdeApiEntidad);
}

export async function getTop(
  limite = 5
): Promise<TopMercado> {
  const entidades = await getEntidades();

  return calcularTop(
    entidades,
    new Date().toISOString().slice(0, 10),
    limite
  );
}

export async function cargarMercado(): Promise<DatosMercado> {
  const entidades = await getEntidades();

  return {
    entidades,
    top: calcularTop(entidades, "", 5),
    ejemplo: usarMocks(),
  };
}