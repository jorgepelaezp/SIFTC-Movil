// Datos de la ficha de entidad (HU-MO-04). La pantalla solo usa estas funciones.
//  - EXPO_PUBLIC_USAR_MOCKS=true -> velas de ejemplo generadas a partir de los
//    mocks de Rafael: terminan en el IC y la variación de cada entidad.
//  - en cualquier otro caso      -> API real:
//      GET /entidades/{id}/ohlc?periodo=Diaria|Mensual|Trimestral  (serie)
//      GET /ranking?periodo=diario|mensual|trimestral               (puesto)
import type { Entidad, FichaEntidad, Periodo, PosicionRanking, PuntoSerie } from "../models";
import { getRanking, pedir, simularRed, usarMocks } from "./mercado";
import type { PeriodoRanking } from "./mercado";
import { desdeApiOhlc, posicionPorIndice } from "./adaptadores";
import { MOCK_INDICE_GENERAL } from "./mocks";

// El periodo es la frecuencia de cada vela, como en Backend y en el ranking
export const PERIODOS: { clave: Periodo; etiqueta: string; ranking: PeriodoRanking }[] = [
  { clave: "Diaria", etiqueta: "Diario", ranking: "diario" },
  { clave: "Mensual", etiqueta: "Mensual", ranking: "mensual" },
  { clave: "Trimestral", etiqueta: "Trimestral", ranking: "trimestral" },
];

// HU-MO-04 CA2: más velas que estas no se leen bien en 5 pulgadas
const MAX_VELAS = 60;

/* ------------------------------- Mocks -------------------------------- */

const redondear = (v: number) => Math.round(v * 10) / 10;

// Generador pseudoaleatorio con semilla: la misma entidad da siempre la misma serie.
function generador(semilla: number) {
  let s = semilla * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function restarDias(fechaIso: string, dias: number): string {
  const d = new Date(`${fechaIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString().slice(0, 10);
}

/** Semilla numérica estable a partir del id (UUID o código ENT001). */
function semilla(id: string): number {
  let h = 7;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 233280;
  return h;
}

/**
 * Serie diaria de ejemplo de dos años que termina en la fecha de los mocks,
 * con el IC de la entidad como último cierre y su variación como último cambio.
 */
function serieDiariaMock(entidad: Entidad): PuntoSerie[] {
  const azar = generador(semilla(entidad.id));
  const total = 730;
  const cierres: number[] = new Array(total);
  cierres[total - 1] = entidad.indice;
  cierres[total - 2] = entidad.indice / (1 + entidad.variacionPct / 100);
  for (let i = total - 3; i >= 0; i--) {
    cierres[i] = cierres[i + 1] * (1 + (azar() - 0.5) * 0.016);
  }

  return cierres.map((cierre, i) => {
    const apertura = i === 0 ? cierre * (1 + (azar() - 0.5) * 0.01) : cierres[i - 1];
    return {
      fecha: restarDias(MOCK_INDICE_GENERAL.fecha, total - 1 - i),
      apertura: redondear(apertura),
      maximo: redondear(Math.max(apertura, cierre) + azar() * 0.6),
      minimo: redondear(Math.min(apertura, cierre) - azar() * 0.6),
      cierre: redondear(cierre),
      variacionPct:
        i === 0 ? undefined : Math.round(((cierre - cierres[i - 1]) / cierres[i - 1]) * 1e4) / 100,
    };
  });
}

/** Agrupa velas diarias en mensuales o trimestrales (como lo calcularía Backend). */
function agrupar(diaria: PuntoSerie[], periodo: Periodo): PuntoSerie[] {
  if (periodo === "Diaria") return diaria;
  const grupos = new Map<string, PuntoSerie[]>();
  for (const p of diaria) {
    const [anio, mes] = p.fecha.split("-").map(Number);
    const clave = periodo === "Mensual" ? `${anio}-${mes}` : `${anio}-T${Math.ceil(mes / 3)}`;
    grupos.set(clave, [...(grupos.get(clave) ?? []), p]);
  }
  let anterior: number | undefined;
  return Array.from(grupos.values()).map((velas) => {
    const cierre = velas[velas.length - 1].cierre;
    const punto: PuntoSerie = {
      fecha: velas[0].fecha,
      apertura: velas[0].apertura,
      maximo: Math.max(...velas.map((v) => v.maximo)),
      minimo: Math.min(...velas.map((v) => v.minimo)),
      cierre,
      variacionPct:
        anterior === undefined ? undefined : Math.round(((cierre - anterior) / anterior) * 1e4) / 100,
    };
    anterior = cierre;
    return punto;
  });
}

/* --------------------------- Funciones públicas --------------------------- */

export async function getSerie(entidad: Entidad, periodo: Periodo): Promise<PuntoSerie[]> {
  if (usarMocks()) {
    await simularRed();
    return agrupar(serieDiariaMock(entidad), periodo).slice(-MAX_VELAS);
  }
  const respuesta = await pedir<any>(
    `/entidades/${encodeURIComponent(entidad.id)}/ohlc?periodo=${periodo}`,
  );
  return desdeApiOhlc(respuesta).slice(-MAX_VELAS);
}

/**
 * Puesto de la entidad. Con la API real sale de GET /ranking; si el ranking no
 * responde (por ejemplo 503) o la entidad no aparece, la ficha se muestra sin puesto.
 */
async function getPosicion(
  entidad: Entidad,
  entidades: Entidad[],
  periodo: Periodo,
): Promise<PosicionRanking | null> {
  if (usarMocks()) return posicionPorIndice(entidades, entidad.id);
  const ranking = PERIODOS.find((p) => p.clave === periodo)?.ranking;
  try {
    const items = await getRanking({ periodo: ranking });
    const item = items.find((i) => i.entidadId === entidad.id);
    return item
      ? { posicion: item.posicion, total: items.length, cambio: item.cambioPosicion }
      : null;
  } catch {
    return null;
  }
}

/** Todo lo que necesita la ficha; se usa al elegir entidad o periodo. */
export async function cargarFicha(
  entidad: Entidad,
  entidades: Entidad[],
  periodo: Periodo,
): Promise<FichaEntidad> {
  const [serie, ranking] = await Promise.all([
    getSerie(entidad, periodo),
    getPosicion(entidad, entidades, periodo),
  ]);
  return { entidad, ranking, periodo, serie, ejemplo: usarMocks() };
}

/** Resumen del periodo para las tarjetas bajo la gráfica. */
export function resumenPeriodo(serie: PuntoSerie[]) {
  if (serie.length === 0) return null;
  return {
    apertura: serie[0].apertura,
    maximo: Math.max(...serie.map((p) => p.maximo)),
    minimo: Math.min(...serie.map((p) => p.minimo)),
    cierre: serie[serie.length - 1].cierre,
  };
}
