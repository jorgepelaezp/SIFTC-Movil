import React, { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { ModoTema, Paleta, paletas } from "./paletas";

type Preferencia = ModoTema | "sistema";

interface ValorTema {
  modo: ModoTema;
  esOscuro: boolean;
  colores: Paleta;
  preferencia: Preferencia;
  alternarTema: () => void;
  setPreferencia: (p: Preferencia) => void;
}

const TemaContext = createContext<ValorTema | null>(null);

export function ProveedorTema({ children }: { children: ReactNode }) {
  const sistema = useColorScheme(); // modo del celular
  const [preferencia, setPreferencia] = useState<Preferencia>("sistema");

  const modo: ModoTema =
    preferencia === "sistema" ? (sistema === "dark" ? "oscuro" : "claro") : preferencia;

  const valor = useMemo<ValorTema>(
    () => ({
      modo,
      esOscuro: modo === "oscuro",
      colores: paletas[modo],
      preferencia,
      alternarTema: () => setPreferencia(modo === "oscuro" ? "claro" : "oscuro"),
      setPreferencia,
    }),
    [modo, preferencia]
  );

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

export function useTema(): ValorTema {
  const contexto = useContext(TemaContext);
  if (!contexto) {
    throw new Error("useTema debe usarse dentro de <ProveedorTema>");
  }
  return contexto;
}