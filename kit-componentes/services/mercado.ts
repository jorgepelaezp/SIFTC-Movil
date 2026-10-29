// Capa de datos del mercado (HU-MO-02). Las pantallas solo usan estas funciones.
//  - EXPO_PUBLIC_USAR_MOCKS=true  -> datos de ejemplo de Rafael (sin backend)
//  - en cualquier otro caso       -> API real con el token de la sesión
// EXPO_PUBLIC_MOCK_ESCENARIO (solo con mocks): normal | vacio | error | sinConexion
import type { DatosMercado, Entidad, IndiceGeneral, ItemRanking } from "../models";
import { PREFIJO_API, peticionAutenticada } from "./api";
import { MOCK_ENTIDADES, MOCK_INDICE_GENERAL } from "./mocks";
import {
  calcularTop,
  desdeApiEntidad,
  desdeApiRanking,
  desdeMockEntidad,
  desdeMockIndice,
} from "./adaptadores";
import { ErrorApi, type ProblemDetails } from "../utils/errores";


export const usarMocks = () => process.env.EXPO_PUBLIC_USAR_MOCKS === "true";
const escenario = () => process.env.EXPO_PUBLIC_MOCK_ESCENARIO ?? "normal";

/* ------------------------------ API real ------------------------------ */

export async function pedir<T>(ruta: string): Promise<T> {
  const res = await peticionAutenticada(`${PREFIJO_API}${ruta}`);
  if (!res.ok) {
    let problema: ProblemDetails | undefined;
    try {
      problema = await res.json();
    } catch {
      // la respuesta de error no es JSON
    }
    throw new ErrorApi(res.status, problema);
  }
  return (await res.json()) as T;
}

/* ------------------------------- Mocks -------------------------------- */

// "corte" simula que el mercado cambia entre actualizaciones. El corte 0 son
// exactamente los valores de Rafael; los siguientes los mueven un poco.
let corte = 0;
let cargas = 0;

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
const redondear = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;
const azar = (semilla: number) => {
  const x = Math.sin(semilla * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export async function simularRed(): Promise<void> {
  await esperar(700);
  if (escenario() === "sinConexion") throw new TypeError("Network request failed");
  if (escenario() === "error") {
    throw new ErrorApi(500, {
      title: "Internal Server Error",
      status: 500,
      detail: "Error de prueba simulado por el mock.",
    });
  }
}

function entidadesMock(): Entidad[] {
  if (escenario() === "vacio") return [];
  return MOCK_ENTIDADES.map(desdeMockEntidad).map((e, i) =>
    corte === 0
      ? e
      : {
          ...e,
          indice: redondear(e.indice + (azar(corte * 100 + i + 1) - 0.5) * 0.6, 1),
          variacionPct: redondear(e.variacionPct + (azar(corte * 100 + i + 51) - 0.5) * 0.3, 2),
        },
  );
}

/* --------------------------- Funciones públicas --------------------------- */

// Tablero, ticker, ranking y ficha necesitan la lista a la vez: comparten la
// misma petición y la reutilizan unos segundos para no repetir consultas.
const VIGENCIA_MS = 30_000;
let cache: { datos: Entidad[]; hora: number } | null = null;
let enCurso: Promise<Entidad[]> | null = null;

async function pedirEntidades(): Promise<Entidad[]> {
  if (usarMocks()) {
    await simularRed();
    return entidadesMock();
  }
  // GET /entidades devuelve como máximo 100 por página (size 1..100)
  const datos = await pedir<any[]>("/entidades?size=100&sort=ic&dir=desc");
  return datos.map(desdeApiEntidad);
}

/** Lista de entidades con su cotización actual. forzar = ignorar la caché. */
export function getEntidades(forzar = false): Promise<Entidad[]> {
  if (!forzar && cache && Date.now() - cache.hora < VIGENCIA_MS) {
    return Promise.resolve(cache.datos);
  }
  if (!enCurso) {
    enCurso = pedirEntidades()
      .then((datos) => {
        cache = { datos, hora: Date.now() };
        return datos;
      })
      .finally(() => {
        enCurso = null;
      });
  }
  return enCurso;
}

/**
 * Índice general del mercado. Backend aún no lo publica (no existe en
 * /docs): con la API real se devuelve null y el tablero lo indica.
 */
export async function getIndice(): Promise<IndiceGeneral | null> {
  if (!usarMocks()) return null;
  await simularRed();
  const base = desdeMockIndice(MOCK_INDICE_GENERAL);
  if (corte === 0) return base;
  const valor = redondear(base.valor + (azar(corte * 7) - 0.5) * 0.8, 1);
  const variacion = redondear(valor - base.valor + base.variacion, 1);
  return {
    ...base,
    valor,
    cierre: valor,
    variacion,
    variacionPct: redondear((variacion / (valor - variacion)) * 100, 2),
  };
}

export type PeriodoRanking = "diario" | "mensual" | "trimestral";

export interface FiltrosRanking {
  sector?: string;
  /** Rentabilidad, Liquidez, Solvencia o Crecimiento; sin dimensión = IC */
  dimension?: string;
  periodo?: PeriodoRanking;
}

/** GET /ranking (lo calcula el microservicio de Backend; puede responder 503). */
export async function getRanking(filtros: FiltrosRanking = {}): Promise<ItemRanking[]> {
  const entidades = await getEntidades();
  if (usarMocks()) {
    // Con datos de ejemplo se ordena por IC, igual que la ficha
    return entidades
      .filter((e) => !filtros.sector || e.sector === filtros.sector)
      .sort((a, b) => b.indice - a.indice)
      .map((e, i) => ({
        posicion: i + 1,
        cambioPosicion: 0,
        entidadId: e.id,
        nombre: e.nombre,
        codigo: e.codigo,
        sector: e.sector,
        ic: e.indice,
        variacionPct: e.variacionPct,
      }));
  }
  const parametros = Object.entries({ ...filtros, limit: "200" })
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");
  return desdeApiRanking(await pedir<any>(`/ranking?${parametros}`), entidades);
}

/** Carga todo lo que necesita el tablero; se usa al abrir y al deslizar para actualizar. */
export async function cargarMercado(forzar = false): Promise<DatosMercado> {
  if (usarMocks()) corte = cargas++;
  const [entidades, indice] = await Promise.all([
    getEntidades(forzar || usarMocks()),
    getIndice(),
  ]);
  // Top 5 con la misma regla que la web (orden por variación); Backend no
  // publica un endpoint de top.
  const top = calcularTop(entidades, indice?.fecha ?? "", 5);
  return { entidades, top, indice, ejemplo: usarMocks() };
}
