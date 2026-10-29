// Modelo propio de Móvil. La API y los mocks se convierten a estos tipos en
// services/adaptadores.ts, así las pantallas no dependen de los nombres de campo.

export interface Entidad {
  /** UUID en la API real; código (ENT001) en los datos de ejemplo */
  id: string;
  codigo: string;
  nombre: string;
  sector: string;
  /** Índice de competitividad (IC) */
  indice: number;
  variacionPct: number;
}

export interface IndiceGeneral {
  fecha: string; // ISO 8601: 2026-10-07
  valor: number;
  /** Variación en puntos frente al cierre anterior */
  variacion: number;
  variacionPct: number;
  // Los siguientes campos aún no los entrega /indice-general (pendiente con Backend)
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
  /** null: Backend aún no publica el índice general del mercado */
  indice: IndiceGeneral | null;
  /** true cuando los datos son de ejemplo (mocks) y no de la API real */
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

/** Frecuencia de las velas, como la recibe GET /entidades/{id}/ohlc */
export type Periodo = "Diaria" | "Mensual" | "Trimestral";

export interface PosicionRanking {
  posicion: number;
  total: number;
  /** Puestos ganados (+) o perdidos (-) frente al corte anterior */
  cambio?: number;
}

/** Fila de GET /ranking con el código de la entidad completado */
export interface ItemRanking {
  posicion: number;
  cambioPosicion: number;
  entidadId: string;
  nombre: string;
  codigo: string;
  sector: string;
  /** IC, o el puntaje de la dimensión cuando se filtra por una */
  ic: number;
  variacionPct: number;
}

export interface FichaEntidad {
  entidad: Entidad;
  /** null si /ranking no responde o la entidad no aparece en él */
  ranking: PosicionRanking | null;
  periodo: Periodo;
  serie: PuntoSerie[];
  ejemplo: boolean;
}
