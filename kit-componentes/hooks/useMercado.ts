import { useCallback, useEffect, useRef, useState } from "react";
import type { DatosMercado } from "../models";
import { cargarMercado } from "../services/mercado";
import { SesionExpiradaError } from "../services/api";
import { mensajeError } from "../utils/errores";

/**
 * Estado del tablero de mercado.
 *  - cargando:   primera carga (aún no hay datos)
 *  - refrescando: el usuario deslizó para actualizar
 *  - error:      mensaje legible; si ya había datos, se conservan en pantalla
 */
export function useMercado() {
  const [datos, setDatos] = useState<DatosMercado | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const enCurso = useRef(false);
  const montado = useRef(true);

  const cargar = useCallback(async (esRefresco: boolean) => {
    if (enCurso.current) return; // evita consultas duplicadas
    enCurso.current = true;
    if (esRefresco) setRefrescando(true);
    else setCargando(true);

    try {
      const nuevos = await cargarMercado(esRefresco);
      if (!montado.current) return;
      setDatos(nuevos);
      setError(null);
    } catch (e) {
      // 401 / token vencido: App.tsx ya cerró la sesión y vuelve al login
      if (e instanceof SesionExpiradaError || !montado.current) return;
      setError(mensajeError(e));
    } finally {
      enCurso.current = false;
      if (montado.current) {
        setCargando(false);
        setRefrescando(false);
      }
    }
  }, []);

  useEffect(() => {
    montado.current = true;
    cargar(false);
    return () => {
      montado.current = false;
    };
  }, [cargar]);

  const refrescar = useCallback(() => cargar(true), [cargar]);

  return { datos, cargando, refrescando, error, refrescar };
}
