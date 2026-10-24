/**
 * Datos estáticos para HU-MO-02: Mercado Móvil SIFTC
 * Contiene los diez registros base, los valores del índice general,
 * y funciones de cálculo y formateo en estándar colombiano (es-CO).
 */

export interface EntidadMercado {
  id?: number;
  codigo_entidad: string;
  nombre_entidad: string;
  sector: string;
  periodo: string;
  indice_competitividad: number;
  variacion_porcentual: number;
  direccion: "UP" | "DOWN";
  rentabilidad?: number;
  liquidez?: number;
  solvencia?: number;
  crecimiento?: number;
}

export interface IndiceGeneralMercado {
  valor_actual: number;
  variacion_porcentual: number;
  diferencia_puntos: number;
  periodo_grafico: string;
  apertura: number;
  maximo: number;
  minimo: number;
  cierre: number;
  fecha: string;
  etiqueta: string;
  historico_30_dias: number[];
}

export const PALETA_MERCADO = {
  azulNoche: "#151D33",
  azulAcero: "#264E7A",
  fondoClaro: "#F6F5F3",
  positivoTextoClaro: "#187A45",
  positivoFondoClaro: "#E6F8F0",
  negativoTextoClaro: "#B83232",
  negativoFondoClaro: "#FEE2E2",
  positivoTextoOscuro: "#5FD08F",
  negativoTextoOscuro: "#FF8F8F",
  textoMuted: "#64748B",
  bordeClaro: "#E2E8F0",
  blanco: "#FFFFFF",
  textoOscuro: "#151D33",
};

export const ENTIDADES_MERCADO: EntidadMercado[] = [
  {
    id: 1,
    codigo_entidad: "ENT001",
    nombre_entidad: "Entidad Alfa",
    sector: "Energía",
    periodo: "2026-09",
    indice_competitividad: 82.1,
    variacion_porcentual: 2.11,
    direccion: "UP",
    rentabilidad: 80.9,
    liquidez: 84.5,
    solvencia: 77.3,
    crecimiento: 80.9,
  },
  {
    id: 2,
    codigo_entidad: "ENT002",
    nombre_entidad: "Entidad Beta",
    sector: "Finanzas",
    periodo: "2026-09",
    indice_competitividad: 78.5,
    variacion_porcentual: 1.55,
    direccion: "UP",
    rentabilidad: 74.9,
    liquidez: 78.5,
    solvencia: 82.1,
    crecimiento: 74.9,
  },
  {
    id: 3,
    codigo_entidad: "ENT003",
    nombre_entidad: "Entidad Gamma",
    sector: "Tecnología",
    periodo: "2026-09",
    indice_competitividad: 74.9,
    variacion_porcentual: 1.22,
    direccion: "UP",
    rentabilidad: 79.7,
    liquidez: 72.5,
    solvencia: 76.1,
    crecimiento: 79.7,
  },
  {
    id: 4,
    codigo_entidad: "ENT004",
    nombre_entidad: "Entidad Delta",
    sector: "Salud",
    periodo: "2026-09",
    indice_competitividad: 70.2,
    variacion_porcentual: 0.43,
    direccion: "UP",
    rentabilidad: 72.6,
    liquidez: 65.4,
    solvencia: 69.0,
    crecimiento: 72.6,
  },
  {
    id: 5,
    codigo_entidad: "ENT005",
    nombre_entidad: "Entidad Épsilon",
    sector: "Comercio",
    periodo: "2026-09",
    indice_competitividad: 66.9,
    variacion_porcentual: 0.15,
    direccion: "UP",
    rentabilidad: 66.9,
    liquidez: 70.5,
    solvencia: 63.3,
    crecimiento: 66.9,
  },
  {
    id: 6,
    codigo_entidad: "ENT006",
    nombre_entidad: "Entidad Zeta",
    sector: "Transporte",
    periodo: "2026-09",
    indice_competitividad: 63.4,
    variacion_porcentual: -0.16,
    direccion: "DOWN",
    rentabilidad: 61.0,
    liquidez: 64.6,
    solvencia: 68.2,
    crecimiento: 61.0,
  },
  {
    id: 7,
    codigo_entidad: "ENT007",
    nombre_entidad: "Entidad Eta",
    sector: "Energía",
    periodo: "2026-09",
    indice_competitividad: 61.0,
    variacion_porcentual: -1.29,
    direccion: "DOWN",
    rentabilidad: 56.2,
    liquidez: 59.8,
    solvencia: 63.4,
    crecimiento: 56.2,
  },
  {
    id: 8,
    codigo_entidad: "ENT008",
    nombre_entidad: "Entidad Theta",
    sector: "Finanzas",
    periodo: "2026-09",
    indice_competitividad: 55.8,
    variacion_porcentual: -0.89,
    direccion: "DOWN",
    rentabilidad: 59.4,
    liquidez: 52.2,
    solvencia: 55.8,
    crecimiento: 59.4,
  },
  {
    id: 9,
    codigo_entidad: "ENT009",
    nombre_entidad: "Entidad Iota",
    sector: "Salud",
    periodo: "2026-09",
    indice_competitividad: 49.3,
    variacion_porcentual: -0.60,
    direccion: "DOWN",
    rentabilidad: 50.5,
    liquidez: 54.1,
    solvencia: 46.9,
    crecimiento: 50.5,
  },
  {
    id: 10,
    codigo_entidad: "ENT010",
    nombre_entidad: "Entidad Kappa",
    sector: "Comercio",
    periodo: "2026-09",
    indice_competitividad: 44.0,
    variacion_porcentual: -0.45,
    direccion: "DOWN",
    rentabilidad: 42.8,
    liquidez: 46.4,
    solvencia: 39.2,
    crecimiento: 42.8,
  },
];

export const INDICE_GENERAL: IndiceGeneralMercado = {
  valor_actual: 64.3,
  variacion_porcentual: -0.62,
  diferencia_puntos: -0.4,
  periodo_grafico: "Últimos 30 días",
  apertura: 64.7,
  maximo: 65.1,
  minimo: 63.9,
  cierre: 64.3,
  fecha: "2026-10-07",
  etiqueta: "Datos de ejemplo",
  historico_30_dias: [
    61.8, 62.2, 61.9, 62.7, 63.3, 63.1, 63.9, 64.4, 64.1, 63.7,
    64.4, 64.9, 65.1, 64.8, 64.2, 63.7, 64.1, 64.8, 65.2, 65.6,
    65.9, 65.5, 65.1, 65.7, 66.0, 65.8, 65.2, 64.9, 64.6, 64.3,
  ],
};

/**
 * Calcula el resumen del día a partir de la lista común de entidades
 */
export function obtenerResumenDia(entidades: EntidadMercado[] = ENTIDADES_MERCADO) {
  const suben = entidades.filter((e) => e.variacion_porcentual > 0);
  const bajan = entidades.filter((e) => e.variacion_porcentual < 0);

  // Mayor subida (máxima variación porcentual positiva)
  const ordenadosDesc = [...entidades].sort(
    (a, b) => b.variacion_porcentual - a.variacion_porcentual,
  );
  // Mayor bajada (mínima variación porcentual, mayor caída)
  const ordenadosAsc = [...entidades].sort(
    (a, b) => a.variacion_porcentual - b.variacion_porcentual,
  );

  return {
    cantidadSuben: suben.length,
    cantidadBajan: bajan.length,
    mayorSubida: ordenadosDesc[0],
    mayorBajada: ordenadosAsc[0],
  };
}

/**
 * Top 5 ganadores ordenados por variación de mayor a menor
 */
export function obtenerTopGanadores(
  entidades: EntidadMercado[] = ENTIDADES_MERCADO,
  limite = 5,
): EntidadMercado[] {
  return [...entidades]
    .sort((a, b) => b.variacion_porcentual - a.variacion_porcentual)
    .slice(0, limite);
}

/**
 * Top 5 perdedores ordenados por variación de menor a mayor (caída más pronunciada primero)
 */
export function obtenerTopPerdedores(
  entidades: EntidadMercado[] = ENTIDADES_MERCADO,
  limite = 5,
): EntidadMercado[] {
  return [...entidades]
    .sort((a, b) => a.variacion_porcentual - b.variacion_porcentual)
    .slice(0, limite);
}

/**
 * Top 10 ordenado por Índice de Competitividad (IC) de mayor a menor
 */
export function obtenerTop10Ranking(
  entidades: EntidadMercado[] = ENTIDADES_MERCADO,
): EntidadMercado[] {
  return [...entidades].sort(
    (a, b) => b.indice_competitividad - a.indice_competitividad,
  );
}

/**
 * Formatea número con coma decimal al estilo colombiano es-CO
 */
export function formatearNumeroCO(valor: number, decimales = 1): string {
  if (valor === undefined || valor === null || isNaN(valor)) return "0,0";
  const fijo = valor.toFixed(decimales);
  const partes = fijo.split(".");
  return `${partes[0]},${partes[1]}`;
}

/**
 * Formato de índice con 1 decimal: ej. 82,1
 */
export function formatearIndice(valor: number): string {
  return formatearNumeroCO(valor, 1);
}

/**
 * Formato de variación con 2 decimales, signo explícito e icono visual:
 * ej: "+2,11 %", "▲" | "-0,89 %", "▼" | "0,00 %", "–"
 */
export function formatearVariacion(valor: number): {
  texto: string;
  signo: string;
  icono: string;
  esPositivo: boolean;
  esNegativo: boolean;
} {
  const esPositivo = valor > 0;
  const esNegativo = valor < 0;
  const signo = esPositivo ? "+" : esNegativo ? "-" : "";
  const icono = esPositivo ? "▲" : esNegativo ? "▼" : "–";
  const numAbs = formatearNumeroCO(Math.abs(valor), 2);
  const texto = `${signo}${numAbs} %`;
  return { texto, signo, icono, esPositivo, esNegativo };
}

/**
 * Formato de fecha "YYYY-MM-DD" a "DD/MM/YYYY": ej. "07/10/2026"
 */
export function formatearFechaCO(fechaIso: string): string {
  if (!fechaIso) return "";
  const partes = fechaIso.split("-");
  if (partes.length === 3) {
    const [yyyy, mm, dd] = partes;
    return `${dd}/${mm}/${yyyy}`;
  }
  return fechaIso;
}

const MESES_CO = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

/**
 * Formatea un periodo "YYYY-MM" a "Mes YYYY": ej. "2026-09" -> "Septiembre 2026"
 */
export function formatearPeriodo(periodo: string): string {
  if (!periodo) return "";
  const partes = periodo.split("-");
  if (partes.length === 2) {
    const anio = partes[0];
    const mesIndex = parseInt(partes[1], 10) - 1;
    if (mesIndex >= 0 && mesIndex < 12) {
      return `${MESES_CO[mesIndex]} ${anio}`;
    }
  }
  return periodo;
}

