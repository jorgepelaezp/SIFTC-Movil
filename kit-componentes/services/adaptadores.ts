// Conversión de las respuestas (API real o mocks) al modelo propio de Móvil.
// Si Backend cambia nombres de campo, solo se toca este archivo.
import type {
  Entidad,
  IndiceGeneral,
  PosicionRanking,
  PuntoSerie,
  TopMercado,
} from "../models";

/* ---------- API real (guía de endpoints de Backend, camelCase) ---------- */

export const desdeApiEntidad = (e: any): Entidad => ({
  id: e.id,
  codigo: e.codigo ?? "",
  nombre: e.nombre,
  sector: e.sector ?? "",
  indice: e.ic,
  variacionPct: e.variacionPct,
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
  id: Number(String(e.codigo_entidad).replace(/\D/g, "")),
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
  const orden = [...entidades].sort((a, b) => b.variacionPct - a.variacionPct);
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

// Campos de la entidad Cotizacion de Backend (vela diaria del IC). El endpoint
// de la serie aún no está publicado: si cambian los nombres, se ajusta aquí.
export const desdeApiPunto = (p: any): PuntoSerie => ({
  fecha: String(p.fecha).slice(0, 10),
  apertura: p.apertura,
  maximo: p.maximo,
  minimo: p.minimo,
  cierre: p.cierre,
  variacionPct: p.variacionPct ?? undefined,
});

/**
 * Posición de la entidad ordenando por IC de mayor a menor. Provisional:
 * Backend todavía no publica el ranking de una entidad.
 */
export function posicionPorIndice(
  entidades: Entidad[],
  id: Entidad["id"],
): PosicionRanking | null {
  const orden = [...entidades].sort((a, b) => b.indice - a.indice);
  const i = orden.findIndex((e) => e.id === id);
  return i < 0 ? null : { posicion: i + 1, total: orden.length };
}
