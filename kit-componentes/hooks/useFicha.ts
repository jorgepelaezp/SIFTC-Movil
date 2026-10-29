import { useCallback, useEffect, useRef, useState } from "react";
import type { Entidad, FichaEntidad, Periodo } from "../models";
import { getEntidades } from "../services/mercado";
import { cargarFicha } from "../services/ficha";
import { SesionExpiradaError } from "../services/api";
import { mensajeError } from "../utils/errores";

/**
 * Estado de la ficha de entidad (HU-MO-04).
 *  - entidades: lista para el selector
 *  - seleccion: id de la entidad mostrada (por defecto la de mayor IC)
 *  - ficha:     datos de la entidad y su serie para el periodo elegido
 *  - error:     mensaje legible; si ya había ficha, se conserva en pantalla
 */
export function useFicha(idInicial?: Entidad["id"]) {
  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [seleccion, setSeleccion] = useState<Entidad["id"] | undefined>(idInicial);
  const [periodo, setPeriodo] = useState<Periodo>("Diaria");
  const [ficha, setFicha] = useState<FichaEntidad | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);
  // Solo vale la respuesta de la última consulta (el usuario puede cambiar rápido)
  const ultima = useRef(0);

  const manejarError = (e: unknown) => {
    // 401 / token vencido: App.tsx ya cerró la sesión y vuelve al login
    if (!(e instanceof SesionExpiradaError)) setError(mensajeError(e));
  };

  // Lista de entidades para el selector
  useEffect(() => {
    let vigente = true;
    setCargando(true);
    getEntidades()
      .then((lista) => {
        if (!vigente) return;
        setEntidades(lista);
        setError(null);
        if (lista.length === 0) setCargando(false);
        setSeleccion((actual) =>
          actual !== undefined && lista.some((e) => e.id === actual)
            ? actual
            : [...lista].sort((a, b) => (b.indice || 0) - (a.indice || 0))[0]?.id,
        );
      })
      .catch((e) => {
        if (!vigente) return;
        manejarError(e);
        setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [intento]);

  // Ficha de la entidad elegida en el periodo elegido
  useEffect(() => {
    const entidad = entidades.find((e) => e.id === seleccion);
    if (!entidad) return;
    const consulta = ++ultima.current;
    setCargando(true);
    cargarFicha(entidad, entidades, periodo)
      .then((nueva) => {
        if (consulta !== ultima.current) return;
        setFicha(nueva);
        setError(null);
      })
      .catch((e) => {
        if (consulta === ultima.current) manejarError(e);
      })
      .finally(() => {
        if (consulta === ultima.current) setCargando(false);
      });
  }, [entidades, seleccion, periodo]);

  const reintentar = useCallback(() => setIntento((n) => n + 1), []);

  return {
    entidades,
    seleccion,
    seleccionar: setSeleccion,
    periodo,
    setPeriodo,
    ficha,
    cargando,
    error,
    reintentar,
  };
}
