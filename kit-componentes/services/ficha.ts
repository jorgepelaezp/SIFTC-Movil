// Datos de la ficha de entidad (HU-MO-04). La pantalla solo usa estas funciones.
//  - EXPO_PUBLIC_USAR_MOCKS=true -> velas de ejemplo generadas a partir de los
//    mocks de Rafael: terminan en el IC y la variación de cada entidad.
//  - en cualquier otro caso      -> API real. La ruta es la de la guía de
//    endpoints; Backend aún no la publica ni decide entre
//    /entidades/{id}/ohlc y /series/{id} (docs/REVISION_BACKEND_SPRINT2.md).
import type { Entidad, FichaEntidad, Periodo, PuntoSerie } from "../models";
import { pedir, simularRed, usarMocks } from "./mercado";
import { desdeApiPunto, posicionPorIndice } from "./adaptadores";
import { MOCK_INDICE_GENERAL } from "./mocks";

export const PERIODOS: { clave: Periodo; etiqueta: string; dias: number }[] = [
  { clave: "1S", etiqueta: "1 sem", dias: 7 },
  { clave: "1M", etiqueta: "1 mes", dias: 30 },
  { clave: "3M", etiqueta: "3 meses", dias: 90 },
];

const diasDe = (periodo: Periodo) =>
  PERIODOS.find((p) => p.clave === periodo)?.dias ?? 30;

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

/**
 * Serie de ejemplo de 90 días que termina en la fecha de los mocks, con el IC
 * de la entidad como último cierre y su variación como último cambio.
 */
function serieMock(entidad: Entidad): PuntoSerie[] {
  const azar = generador(typeof entidad.id === "number" ? entidad.id : 1);
  const total = 90;
  const cierres: number[] = new Array(total);
  cierres[total - 1] = entidad.indice;
  cierres[total - 2] = entidad.indice / (1 + entidad.variacionPct / 100);
  for (let i = total - 3; i >= 0; i--) {
    cierres[i] = cierres[i + 1] * (1 + (azar() - 0.5) * 0.016);
  }

  return cierres.map((cierre, i) => {
    const apertura = i === 0 ? cierre * (1 + (azar() - 0.5) * 0.01) : cierres[i - 1];
    const maximo = Math.max(apertura, cierre) + azar() * 0.6;
    const minimo = Math.min(apertura, cierre) - azar() * 0.6;
    return {
      fecha: restarDias(MOCK_INDICE_GENERAL.fecha, total - 1 - i),
      apertura: redondear(apertura),
      maximo: redondear(maximo),
      minimo: redondear(minimo),
      cierre: redondear(cierre),
      variacionPct:
        i === 0 ? undefined : Math.round(((cierre - cierres[i - 1]) / cierres[i - 1]) * 1e4) / 100,
    };
  });
}

/* --------------------------- Funciones públicas --------------------------- */

export async function getSerie(entidad: Entidad, periodo: Periodo): Promise<PuntoSerie[]> {
  if (usarMocks()) {
    await simularRed();
    return serieMock(entidad).slice(-diasDe(periodo));
  }
  const datos = await pedir<any[]>(`/entidades/${entidad.id}/ohlc?periodo=${periodo}`);
  return datos.map(desdeApiPunto);
}

/** Todo lo que necesita la ficha; se usa al elegir entidad o periodo. */
export async function cargarFicha(
  entidad: Entidad,
  entidades: Entidad[],
  periodo: Periodo,
): Promise<FichaEntidad> {
  const serie = await getSerie(entidad, periodo);
  return {
    entidad,
    ranking: posicionPorIndice(entidades, entidad.id),
    periodo,
    serie,
    ejemplo: usarMocks(),
  };
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
