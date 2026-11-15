import type { Entidad } from "../models";

import {
  peticionAutenticada,
  SesionExpiradaError,
} from "./api";

import {
  getEntidades,
  pedir,
  usarMocks,
  simularRed,
} from "./mercado";

import {
  actualizarCacheWatchlist,
  encolarMutacion,
  leerCache,
  guardarCache,
  obtenerMutacionesPendientes,
} from "./offline";

import {
  notificarDatosActualizados,
} from "./syncEvents";

import { MOCK_ENTIDADES } from "./mocks";

import {
  desdeApiEntidad,
  desdeMockEntidad,
} from "./adaptadores";

import {
  ErrorApi,
  type ProblemDetails,
} from "../utils/errores";

export type DimensionApi =
  | "Rentabilidad"
  | "Liquidez"
  | "Solvencia"
  | "Crecimiento";

export type PeriodoRanking =
  | "diario"
  | "mensual"
  | "trimestral";

export interface FilaRankingMovil {
  entidad: Entidad;
  posicion: number;
  cambioPosicion: number | null;
  dimensiones: Record<
    DimensionApi,
    number | undefined
  >;
}

async function obtenerMetricas(
  dimension: DimensionApi,
  periodo: PeriodoRanking,
  fecha?: string,
  tamano = 100
) {
  const todas: any[] = [];
  const size = tamano;

  for (let page = 1; page <= 20; page++) {
    const filtroFecha = fecha
      ? `&fecha=${encodeURIComponent(fecha)}`
      : "";

    const ruta =
      `/metricas?dimension=${encodeURIComponent(dimension)}` +
      `&periodo=${periodo}` +
      `${filtroFecha}` +
      `&page=${page}` +
      `&size=${size}` +
      `&sort=fecha&dir=desc`;

    let lote: any[];

    try {
      lote = await pedir<any[]>(ruta);
    } catch (error) {
      if (todas.length > 0) {
        break;
      }

      throw error;
    }

    if (!Array.isArray(lote) || lote.length === 0) {
      break;
    }

    todas.push(...lote);

    if (size === 1) {
      break;
    }

    if (lote.length < size) {
      break;
    }
  }

  return todas;
}

function puntajesPorEntidad(
  metricas: any[]
): Map<string, number> {
  const porEntidad = new Map<string, any[]>();

  for (const metrica of metricas) {
    if (metrica.valorNormalizado == null) {
      continue;
    }

    const id = String(metrica.entidadId);

    const grupo = porEntidad.get(id) ?? [];

    grupo.push(metrica);

    porEntidad.set(id, grupo);
  }

  const resultado = new Map<string, number>();

  for (const [id, grupo] of porEntidad) {
    // Se promedian únicamente las métricas del corte
    // más reciente de cada entidad.
    const fecha = grupo.reduce(
      (max, metrica) =>
        String(metrica.fecha) > max
          ? String(metrica.fecha)
          : max,
      ""
    );

    const corte = grupo.filter(
      (metrica) =>
        String(metrica.fecha) === fecha
    );

    const valores = corte
      .map((metrica) =>
        Number(metrica.valorNormalizado)
      )
      .filter(Number.isFinite);

    if (valores.length > 0) {
      resultado.set(
        id,
        (valores.reduce((a, b) => a + b, 0) /
          valores.length) *
          100
      );
    }
  }

  return resultado;
}

/**
 * El endpoint /ranking excluye expresamente al rol
 * Usuario móvil.
 *
 * Por eso se calculan los puntajes dimensionales
 * desde /metricas y el IC general desde /entidades.
 */
export async function getRankingMovil(
  periodo: PeriodoRanking
): Promise<FilaRankingMovil[]> {
  if (usarMocks()) {
    await simularRed();

    const entidades = MOCK_ENTIDADES.map(
      desdeMockEntidad
    );

    return entidades
      .sort((a, b) => b.indice - a.indice)
      .map((entidad, index) => ({
        entidad,
        posicion: index + 1,
        cambioPosicion: null,
        dimensiones: {
          Rentabilidad: undefined,
          Liquidez: undefined,
          Solvencia: undefined,
          Crecimiento: undefined,
        },
      }));
  }

  const dimensiones: DimensionApi[] = [
    "Rentabilidad",
    "Liquidez",
    "Solvencia",
    "Crecimiento",
  ];

  const [entidades, lotes] = await Promise.all([
    getEntidades(),

    Promise.all(
      dimensiones.map(async (dimension) => {
        let muestra: any[];

        try {
          muestra = await obtenerMetricas(
            dimension,
            periodo,
            undefined,
            1
          );
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.startsWith(
              "Sin conexión y no hay datos guardados"
            )
          ) {
            return [];
          }

          throw error;
        }

        const fechaCorte = muestra
          .map((metrica) =>
            String(metrica.fecha ?? "")
          )
          .filter(Boolean)
          .sort()
          .reverse()[0];

        if (!fechaCorte) {
          return [];
        }

        try {
          return await obtenerMetricas(
            dimension,
            periodo,
            fechaCorte
          );
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.startsWith(
              "Sin conexión y no hay datos guardados"
            )
          ) {
            return [];
          }

          throw error;
        }
      })
    ),
  ]);

  const puntajes = new Map<
    DimensionApi,
    Map<string, number>
  >();

  dimensiones.forEach((dimension, index) => {
    puntajes.set(
      dimension,
      puntajesPorEntidad(lotes[index])
    );
  });

  return entidades.map((entidad) => ({
    entidad,
    posicion: 0,
    cambioPosicion: null,
    dimensiones: {
      Rentabilidad: puntajes
        .get("Rentabilidad")
        ?.get(String(entidad.id)),

      Liquidez: puntajes
        .get("Liquidez")
        ?.get(String(entidad.id)),

      Solvencia: puntajes
        .get("Solvencia")
        ?.get(String(entidad.id)),

      Crecimiento: puntajes
        .get("Crecimiento")
        ?.get(String(entidad.id)),
    },
  }));
}

const PREFIJO = process.env.EXPO_PUBLIC_API_PREFIX ?? "/api/v1";
const CLAVE_WATCHLIST = `${PREFIJO}/watchlist`;

/**
 * La caché tiene la forma del DTO remoto; las operaciones pendientes se aplican
 * encima de la respuesta de la API para no perder cambios hechos sin conexión.
 */
export async function getWatchlist(): Promise<Entidad[]> {
  if (usarMocks()) return [];

  const pendientes = (await obtenerMutacionesPendientes()).filter(
    (m) => m.path.startsWith(`${CLAVE_WATCHLIST}/`)
  );

  const cache = await leerCache<any[]>(CLAVE_WATCHLIST);
  let datos: any[];

  try {
    const res = await peticionAutenticada(CLAVE_WATCHLIST);
    if (!res.ok) {
      let problema: ProblemDetails | undefined;
      try { problema = await res.json(); } catch {}
      if (res.status < 500) throw new ErrorApi(res.status, problema);
      if (!cache) throw new ErrorApi(res.status, problema);
      datos = cache.data;
    } else {
      datos = await res.json();
      if (!Array.isArray(datos)) throw new Error("Respuesta inválida de Watchlist");
    }
  } catch (error) {
    if (error instanceof SesionExpiradaError || error instanceof ErrorApi) throw error;
    if (!cache) throw new Error("Sin conexión y sin Watchlist guardada. Conéctate para cargarla por primera vez.");
    datos = cache.data;
  }

  const porId = new Map<string, any>();
  for (const item of datos) porId.set(String(item.id), item);

  // Aplicar las mutaciones en el orden en que se hicieron.
  const catalogo = await leerCache<any[]>(`${PREFIJO}/entidades?page=1&size=100&sort=ic&dir=desc`).catch(() => null);
  for (const op of pendientes) {
    const id = decodeURIComponent(op.path.slice(`${CLAVE_WATCHLIST}/`.length));
    if (op.method === "DELETE") {
      porId.delete(id);
    } else if (!porId.has(id)) {
      const anterior = cache?.data.find((e) => String(e.id) === id);
      const conocida = catalogo?.data.find((e) => String(e.id) === id);
      if (anterior || conocida) porId.set(id, anterior ?? conocida);
    }
  }

  const resultado = [...porId.values()];
  await guardarCache(CLAVE_WATCHLIST, resultado).catch(() => undefined);
  return resultado.map(desdeApiEntidad);
}

async function mutarWatchlist(
  id: string | number,
  method: "POST" | "DELETE",
  entidad?: Entidad
): Promise<void> {
  const idTexto = String(id);

  const path =
    `/watchlist/${encodeURIComponent(idTexto)}`;

  try {
    const res = await peticionAutenticada(
      `${PREFIJO}${path}`,
      {
        method,
      }
    );

    if (!res.ok) {
      let problema: ProblemDetails | undefined;

      try {
        problema = await res.json();
      } catch {
        // No se recibió información adicional.
      }

      throw new ErrorApi(res.status, problema);
    }
  } catch (error) {
    if (
      error instanceof ErrorApi ||
      error instanceof SesionExpiradaError
    ) {
      throw error;
    }

    const mensaje =
      error instanceof Error
        ? error.message
        : String(error);

    const falloRed =
      error instanceof TypeError ||
      /network request failed|failed to fetch|network error|internet connection/i.test(
        mensaje
      );

    if (!falloRed) {
      throw error;
    }

    // Guarda la intención para enviarla al Backend
    // cuando vuelva la conexión.
    await encolarMutacion(
      method,
      `${PREFIJO}${path}`
    );
  }

  await actualizarCacheWatchlist(
    CLAVE_WATCHLIST,
    method === "POST" ? "agregar" : "quitar",
    idTexto,
    entidad
  );

  notificarDatosActualizados();
}

export async function agregarWatchlist(
  id: string | number,
  entidad?: Entidad
): Promise<void> {
  await mutarWatchlist(id, "POST", entidad);
}

export async function quitarWatchlist(
  id: string | number
): Promise<void> {
  await mutarWatchlist(id, "DELETE");
}