// Modelo propio de Móvil. La API y los mocks se convierten a estos tipos en
// services/adaptadores.ts, así las pantallas no dependen de los nombres de campo.

export interface Entidad {
  id: string | number;
  codigo: string;
  nombre: string;
  sector: string;
  /** Índice de competitividad (IC) */
  indice: number;
  variacionPct: number;
}

export interface IndiceGeneral {
  fecha: string;
  valor: number;
  variacion: number;
  variacionPct: number;
  apertura?: number;
  maximo?: number;
  minimo?: number;
  cierre?: number;
  serie?: number[];
}

export interface TopMercado {
  fecha: string;
  ganadores: Entidad[];
  perdedores: Entidad[];
}

export interface DatosMercado {
  entidades: Entidad[];
  top: TopMercado;
  ejemplo: boolean;
}


/* --------------------- Ficha de entidad (HU-MO-04) --------------------- */

/** Vela diaria del IC de una entidad (entidad Cotizacion de Backend). */
export interface PuntoSerie {
  fecha: string; // ISO 8601: 2026-10-07
  apertura: number;
  maximo: number;
  minimo: number;
  cierre: number;
  variacionPct?: number;
}

export type Periodo = "1S" | "1M" | "3M";

export interface PosicionRanking {
  posicion: number;
  total: number;
}

export interface FichaEntidad {
  entidad: Entidad;
  /** null mientras Backend no entregue el ranking de la entidad */
  ranking: PosicionRanking | null;
  periodo: Periodo;
  serie: PuntoSerie[];
  ejemplo: boolean;
}
