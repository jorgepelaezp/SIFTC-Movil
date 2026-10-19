// Capa de datos del mercado (HU-MO-02). Las pantallas solo usan estas funciones.
//  - EXPO_PUBLIC_USAR_MOCKS=true  -> datos de ejemplo de Rafael (sin backend)
//  - en cualquier otro caso       -> API real con el token de la sesión
// EXPO_PUBLIC_MOCK_ESCENARIO (solo con mocks): normal | vacio | error | sinConexion
import type { DatosMercado, Entidad, IndiceGeneral, TopMercado } from "../models";
import { peticionAutenticada } from "./api";
import { MOCK_ENTIDADES, MOCK_INDICE_GENERAL } from "./mocks";
import {
  calcularTop,
  completarTop,
  desdeApiEntidad,
  desdeApiIndice,
  desdeApiTop,
  desdeMockEntidad,
  desdeMockIndice,
} from "./adaptadores";
import { ErrorApi, type ProblemDetails } from "../utils/errores";

// Ruta base de la API; por confirmar con Backend (la guía propone /api/v1).
const PREFIJO = process.env.EXPO_PUBLIC_API_PREFIX ?? "/api/v1";

export const usarMocks = () => process.env.EXPO_PUBLIC_USAR_MOCKS === "true";
const escenario = () => process.env.EXPO_PUBLIC_MOCK_ESCENARIO ?? "normal";

/* ------------------------------ API real ------------------------------ */

async function pedir<T>(ruta: string): Promise<T> {
  const res = await peticionAutenticada(`${PREFIJO}${ruta}`);
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

async function simularRed(): Promise<void> {
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
  return MOCK_ENTIDADES.map(desdeMockEntidad).map((e) =>
    corte === 0
      ? e
      : {
          ...e,
          indice: redondear(e.indice + (azar(corte * 100 + e.id) - 0.5) * 0.6, 1),
          variacionPct: redondear(e.variacionPct + (azar(corte * 100 + e.id + 50) - 0.5) * 0.3, 2),
        },
  );
}

/* --------------------------- Funciones públicas --------------------------- */

export async function getEntidades(): Promise<Entidad[]> {
  if (usarMocks()) {
    await simularRed();
    return entidadesMock();
  }
  const datos = await pedir<any[]>("/entidades");
  return datos.map(desdeApiEntidad);
}

export async function getTop(limite = 5): Promise<TopMercado> {
  if (usarMocks()) {
    await simularRed();
    return calcularTop(entidadesMock(), MOCK_INDICE_GENERAL.fecha, limite);
  }
  return desdeApiTop(await pedir<any>(`/mercado/top?limite=${limite}`));
}

export async function getIndice(): Promise<IndiceGeneral> {
  if (usarMocks()) {
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
  return desdeApiIndice(await pedir<any>("/indice-general"));
}

/** Carga todo lo que necesita el tablero; se usa al abrir y al deslizar para actualizar. */
export async function cargarMercado(): Promise<DatosMercado> {
  if (usarMocks()) corte = cargas++;
  const [entidades, top, indice] = await Promise.all([getEntidades(), getTop(), getIndice()]);
  return { entidades, top: completarTop(top, entidades), indice, ejemplo: usarMocks() };
}
