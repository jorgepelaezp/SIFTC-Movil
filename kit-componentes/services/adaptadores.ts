// Conversión de las respuestas (API real o mocks) al modelo propio de Móvil.
// Si Backend cambia nombres de campo, solo se toca este archivo.
import type {
  Entidad,
  PosicionRanking,
  PuntoSerie,
  TopMercado,
} from "../models";

/* ---------- API real (contrato OpenAPI v1.json, camelCase) ---------- */

export const desdeApiEntidad = (e: any): Entidad => ({
  id: e.id,
  codigo: e.codigo ?? "",
  nombre: e.nombre,
  sector: e.sector ?? "",
  indice: e.ic == null ? Number.NaN : Number(e.ic),
  variacionPct: e.variacionPct == null ? Number.NaN : Number(e.variacionPct),
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

/** Mismas reglas que getTop de la web: orden por variación y 5 por lado. */
export function calcularTop(entidades: Entidad[], fecha: string, limite = 5): TopMercado {
  const validas = entidades.filter((e) => Number.isFinite(e.variacionPct));
  const orden = [...validas].sort((a, b) => b.variacionPct - a.variacionPct);
  return {
    fecha,
    ganadores: orden.filter((e) => e.variacionPct > 0).slice(0, limite),
    perdedores: orden.filter((e) => e.variacionPct < 0).slice(-limite).reverse(),
  };
}

/* ---------- Ficha de entidad (HU-MO-04) ---------- */

// Campos de la respuesta OHLC documentada en v1.json.
export const desdeApiPunto = (p: any): PuntoSerie => ({
  fecha: String(p.fecha).slice(0, 10),
  apertura: Number(p.apertura),
  maximo: Number(p.maximo),
  minimo: Number(p.minimo),
  cierre: Number(p.cierre),
  variacionPct: p.variacionPct == null ? undefined : Number(p.variacionPct),
});

/**
 * Posición de la entidad ordenando por IC de mayor a menor. Provisional:
 * Backend todavía no publica el ranking de una entidad.
 */
export function posicionPorIndice(
  entidades: Entidad[],
  id: Entidad["id"],
): PosicionRanking | null {
  const orden = [...entidades].sort((a, b) => {
    const va = Number.isFinite(a.indice) ? a.indice : -Infinity;
    const vb = Number.isFinite(b.indice) ? b.indice : -Infinity;
    return vb - va;
  });
  const i = orden.findIndex((e) => e.id === id);
  return i < 0 ? null : { posicion: i + 1, total: orden.length };
}
