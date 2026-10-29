import { useEffect, useState } from "react";
import type { Entidad } from "../models";
import { getEntidades } from "../services/mercado";

// Cada cuánto se actualiza la lista mientras la pantalla está abierta
const ACTUALIZAR_MS = 60_000;

/**
 * Entidades con su cotización actual para componentes que siempre están
 * visibles (el ticker). Usa la misma consulta compartida que el tablero; si
 * falla, conserva la última lista (401: App.tsx ya vuelve al login).
 */
export function useEntidades() {
  const [entidades, setEntidades] = useState<Entidad[]>([]);

  useEffect(() => {
    let montado = true;
    const cargar = () =>
      getEntidades()
        .then((lista) => {
          if (montado) setEntidades(lista);
        })
        .catch(() => {
          // se mantiene la última lista
        });
    cargar();
    const intervalo = setInterval(cargar, ACTUALIZAR_MS);
    return () => {
      montado = false;
      clearInterval(intervalo);
    };
  }, []);

  return entidades;
}
