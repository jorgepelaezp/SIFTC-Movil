import { useCallback, useEffect, useRef, useState } from "react";
import { getEntidades, getRanking, usarMocks } from "../services/mercado";
import type { PeriodoRanking } from "../services/mercado";
import { ENTIDADES_MERCADO, EntidadMercado } from "../services/datosMercado";
import { SesionExpiradaError } from "../services/api";
import { mensajeError } from "../utils/errores";

export type PeriodoVista = "Diario" | "Mensual" | "Trimestral";

// Campo de EntidadMercado donde la pantalla de ranking lee cada dimensión
const CAMPO_DIMENSION: Record<string, keyof EntidadMercado> = {
  Rentabilidad: "rentabilidad",
  Liquidez: "liquidez",
  Solvencia: "solvencia",
  Crecimiento: "crecimiento",
};

type Filtros = {
  /** "Todos los sectores" = sin filtro */
  sector: string;
  /** "IC general" = sin dimensión */
  dimension: string;
  periodo: PeriodoVista;
};

/**
 * Ranking de competitividad (HU-MO-02) desde GET /ranking, en la forma
 * EntidadMercado que ya dibuja RankingScreen. Con mocks devuelve los datos de
 * ejemplo y la pantalla filtra y ordena como antes.
 */
export function useRanking({ sector, dimension, periodo }: Filtros) {
  const [entidades, setEntidades] = useState<EntidadMercado[]>([]);
  const [sectores, setSectores] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);
  const forzar = useRef(false);
  const ultima = useRef(0);

  useEffect(() => {
    const consulta = ++ultima.current;
    const vigente = () => consulta === ultima.current;
    // Solo al deslizar para actualizar se conservan los datos si la consulta falla
    const esRefresco = forzar.current;
    setCargando(true);

    const cargar = async (): Promise<EntidadMercado[]> => {
      if (usarMocks()) {
        await getEntidades(forzar.current); // simula la red y los escenarios de prueba
        setSectores(Array.from(new Set(ENTIDADES_MERCADO.map((e) => e.sector))));
        return ENTIDADES_MERCADO;
      }
      const lista = await getEntidades(forzar.current);
      if (vigente()) {
        setSectores(Array.from(new Set(lista.map((e) => e.sector))).filter(Boolean).sort());
      }
      const items = await getRanking({
        sector: sector === "Todos los sectores" ? undefined : sector,
        dimension: CAMPO_DIMENSION[dimension] ? dimension : undefined,
        periodo: periodo.toLowerCase() as PeriodoRanking,
      });
      const campo = CAMPO_DIMENSION[dimension];
      return items.map((i) => ({
        id: i.entidadId,
        codigo_entidad: i.codigo,
        nombre_entidad: i.nombre,
        sector: i.sector,
        periodo,
        // Con una dimensión elegida, "ic" trae el puntaje de esa dimensión
        indice_competitividad: campo ? NaN : i.ic,
        variacion_porcentual: i.variacionPct,
        direccion: i.variacionPct < 0 ? "DOWN" : "UP",
        ...(campo ? { [campo]: i.ic } : {}),
      }));
    };

    cargar()
      .then((lista) => {
        if (!vigente()) return;
        setEntidades(lista);
        setError(null);
      })
      .catch((e) => {
        // 401 / token vencido: App.tsx ya cerró la sesión y vuelve al login
        if (!vigente() || e instanceof SesionExpiradaError) return;
        setError(mensajeError(e));
        // Con otros filtros, los datos anteriores ya no corresponden
        if (!esRefresco) setEntidades([]);
      })
      .finally(() => {
        forzar.current = false;
        if (vigente()) {
          setCargando(false);
          setRefrescando(false);
        }
      });
  }, [sector, dimension, periodo, intento]);

  /** Deslizar para actualizar: vuelve a consultar sin usar la caché. */
  const refrescar = useCallback(() => {
    forzar.current = true;
    setRefrescando(true);
    setIntento((n) => n + 1);
  }, []);

  return { entidades, sectores, cargando, refrescando, error, refrescar, ejemplo: usarMocks() };
}
