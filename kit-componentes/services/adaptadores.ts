// Conversión de las respuestas (API real o mocks) al modelo propio de Móvil.
// Si Backend cambia nombres de campo, solo se toca este archivo.
import type {
  Entidad,
  IndiceGeneral,
  ItemRanking,
  PosicionRanking,
  PuntoSerie,
  TopMercado,
} from "../models";
import type { EntidadMercado } from "./datosMercado";

/**
 * Backend (.NET) puede enviar los decimales como número o como texto ("82.1")
 * y algunos como null. Lo que no sea un número válido queda en NaN, que las
 * pantallas muestran como "–".
 */
export function numero(v: unknown): number {
  if (v === null || v === undefined || v === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

/* ---------- API real (OpenAPI de https://siftc.onrender.com/docs) ---------- */

// EntidadDto: { id (uuid), codigo, nombre, sector, ic, variacion, variacionPct }
export const desdeApiEntidad = (e: any): Entidad => ({
  id: String(e.id),
  codigo: e.codigo ?? "",
  nombre: e.nombre ?? "",
  sector: e.sector ?? "",
  indice: numero(e.ic),
  variacionPct: numero(e.variacionPct),
});

export const desdeApiIndice = (i: any): IndiceGeneral => ({
  fecha: i.fecha,
  valor: i.valor,
  variacion: i.variacion,
  variacionPct: i.variacionPct,
  apertura: i.apertura,
  maximo: i.maximo,
  minimo: i.minimo,
  cierre: i.cierre,
  serie: i.serie,
});

// /mercado/top aún no trae codigo ni sector: se completan en cargarMercado.
export const desdeApiTop = (t: any): TopMercado => ({
  fecha: t.fecha,
  ganadores: (t.ganadores ?? []).map(desdeApiEntidad),
  perdedores: (t.perdedores ?? []).map(desdeApiEntidad),
});

/* ---------- Mocks de Rafael (snake_case del diccionario de datos) ---------- */

export const desdeMockEntidad = (e: any): Entidad => ({
  id: String(e.codigo_entidad),
  codigo: e.codigo_entidad,
  nombre: e.nombre_entidad,
  sector: e.sector,
  indice: e.indice_competitividad,
  variacionPct: e.variacion_porcentual,
});

export const desdeMockIndice = (i: any): IndiceGeneral => ({
  fecha: i.fecha,
  valor: i.valor,
  variacion: i.puntos,
  variacionPct: i.variacion,
  apertura: i.apertura,
  maximo: i.maximo,
  minimo: i.minimo,
  cierre: i.cierre,
  serie: i.serie,
});

/** Mismas reglas que getTop de la web: orden por variación y 5 por lado. */
export function calcularTop(entidades: Entidad[], fecha: string, limite = 5): TopMercado {
  // Las entidades sin cotización (variación nula) no entran al top
  const orden = entidades
    .filter((e) => Number.isFinite(e.variacionPct))
    .sort((a, b) => b.variacionPct - a.variacionPct);
  return {
    fecha,
    ganadores: orden.slice(0, limite),
    perdedores: orden.slice(-limite).reverse(),
  };
}

/** Completa codigo y sector del top usando la lista de entidades (por id). */
export function completarTop(top: TopMercado, entidades: Entidad[]): TopMercado {
  const porId = new Map(entidades.map((e) => [e.id, e]));
  const completar = (e: Entidad): Entidad => {
    const base = porId.get(e.id);
    return base ? { ...e, codigo: base.codigo, sector: base.sector } : e;
  };
  return {
    ...top,
    ganadores: top.ganadores.map(completar),
    perdedores: top.perdedores.map(completar),
  };
}

/* ---------- Ficha de entidad (HU-MO-04) ---------- */

// OhlcPuntoDto: { fecha, apertura, maximo, minimo, cierre, variacion, variacionPct }
export const desdeApiPunto = (p: any): PuntoSerie => {
  const variacionPct = numero(p.variacionPct);
  return {
    fecha: String(p.fecha).slice(0, 10),
    apertura: numero(p.apertura),
    maximo: numero(p.maximo),
    minimo: numero(p.minimo),
    cierre: numero(p.cierre),
    variacionPct: Number.isFinite(variacionPct) ? variacionPct : undefined,
  };
};

// OhlcResponseDto: { entidadId, entidad, periodo, serie[] } de la más antigua a
// la más reciente. Se descartan las velas incompletas para no romper la gráfica.
export const desdeApiOhlc = (r: any): PuntoSerie[] =>
  (r?.serie ?? [])
    .map(desdeApiPunto)
    .filter((p: PuntoSerie) =>
      [p.apertura, p.maximo, p.minimo, p.cierre].every(Number.isFinite),
    );

// RankingResponseDto: { periodo, total, items[] }. El ranking no trae el código
// (ticker): se completa con la lista de entidades, por id.
export function desdeApiRanking(r: any, entidades: Entidad[]): ItemRanking[] {
  const porId = new Map(entidades.map((e) => [e.id, e]));
  return (r?.items ?? []).map((i: any) => {
    const entidadId = String(i.entidadId);
    return {
      posicion: numero(i.posicion),
      cambioPosicion: numero(i.cambioPosicion) || 0,
      entidadId,
      nombre: i.entidad ?? porId.get(entidadId)?.nombre ?? "",
      codigo: porId.get(entidadId)?.codigo ?? "",
      sector: i.sector ?? "",
      ic: numero(i.ic),
      variacionPct: numero(i.variacionPct),
    };
  });
}

/**
 * Posición de la entidad ordenando por IC de mayor a menor. Se usa con los
 * datos de ejemplo; con la API real el puesto sale de GET /ranking.
 */
export function posicionPorIndice(
  entidades: Entidad[],
  id: Entidad["id"],
): PosicionRanking | null {
  const orden = entidades
    .filter((e) => Number.isFinite(e.indice))
    .sort((a, b) => b.indice - a.indice);
  const i = orden.findIndex((e) => e.id === id);
  return i < 0 ? null : { posicion: i + 1, total: orden.length };
}

/* ---------- Vistas de Daniel (ticker y ranking usan EntidadMercado) ---------- */

export const aEntidadMercado = (e: Entidad): EntidadMercado => ({
  id: e.id,
  codigo_entidad: e.codigo,
  nombre_entidad: e.nombre,
  sector: e.sector,
  periodo: "",
  indice_competitividad: e.indice,
  variacion_porcentual: e.variacionPct,
  direccion: e.variacionPct < 0 ? "DOWN" : "UP",
});
