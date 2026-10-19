// Datos de ejemplo del tablero web ALZA (documento de Rafael Barriga).
// Formato de marketMocks.js: nombres del diccionario de datos, punto decimal.
// Sirven para avanzar mientras Backend libera la API real; NO cuentan como HU aceptada.

export const MOCK_ENTIDADES = [
  { codigo_entidad: "ENT001", nombre_entidad: "Entidad Alfa", sector: "Energía", periodo: "2026-09", indice_competitividad: 82.1, variacion_porcentual: 2.11, direccion: "UP" },
  { codigo_entidad: "ENT002", nombre_entidad: "Entidad Beta", sector: "Finanzas", periodo: "2026-09", indice_competitividad: 78.5, variacion_porcentual: 1.55, direccion: "UP" },
  { codigo_entidad: "ENT003", nombre_entidad: "Entidad Gamma", sector: "Tecnología", periodo: "2026-09", indice_competitividad: 74.9, variacion_porcentual: 1.22, direccion: "UP" },
  { codigo_entidad: "ENT004", nombre_entidad: "Entidad Delta", sector: "Salud", periodo: "2026-09", indice_competitividad: 70.2, variacion_porcentual: 0.43, direccion: "UP" },
  { codigo_entidad: "ENT005", nombre_entidad: "Entidad Épsilon", sector: "Comercio", periodo: "2026-09", indice_competitividad: 66.9, variacion_porcentual: 0.15, direccion: "UP" },
  { codigo_entidad: "ENT006", nombre_entidad: "Entidad Zeta", sector: "Transporte", periodo: "2026-09", indice_competitividad: 63.4, variacion_porcentual: -0.16, direccion: "DOWN" },
  { codigo_entidad: "ENT007", nombre_entidad: "Entidad Eta", sector: "Energía", periodo: "2026-09", indice_competitividad: 61.0, variacion_porcentual: -1.29, direccion: "DOWN" },
  { codigo_entidad: "ENT008", nombre_entidad: "Entidad Theta", sector: "Finanzas", periodo: "2026-09", indice_competitividad: 55.8, variacion_porcentual: -0.89, direccion: "DOWN" },
  { codigo_entidad: "ENT009", nombre_entidad: "Entidad Iota", sector: "Salud", periodo: "2026-09", indice_competitividad: 49.3, variacion_porcentual: -0.6, direccion: "DOWN" },
  { codigo_entidad: "ENT010", nombre_entidad: "Entidad Kappa", sector: "Comercio", periodo: "2026-09", indice_competitividad: 44.0, variacion_porcentual: -0.45, direccion: "DOWN" },
];

// En el documento de Rafael "variacion" es el porcentaje y "puntos" la variación en puntos.
export const MOCK_INDICE_GENERAL = {
  valor: 64.3,
  variacion: -0.62,
  puntos: -0.4,
  apertura: 64.7,
  maximo: 65.1,
  minimo: 63.9,
  cierre: 64.3,
  fecha: "2026-10-07",
  serie: [
    61.8, 62.2, 61.9, 62.7, 63.3, 63.1, 63.9, 64.4, 64.1, 63.7, 64.4, 64.9, 65.1,
    64.8, 64.2, 63.7, 64.1, 64.8, 65.2, 65.6, 65.9, 65.5, 65.1, 65.7, 66.0, 65.8,
    65.2, 64.9, 64.6, 64.3,
  ],
};
