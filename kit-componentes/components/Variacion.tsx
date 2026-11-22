import { useMemo } from "react";
import { Text, StyleSheet, StyleProp, TextStyle } from "react-native";
import { direccion, pct } from "../utils/formato";
import { useTema } from "../theme/TemaContext";
import type { Paleta } from "../theme/paletas";

// Colores de texto con contraste suficiente (documento de Rafael), ahora por tema:
// claro #187A45 / #B83232, oscuro #4ADE80 / #F87171 (paletas.ts: gainText / lossText).

type Props = { value: number; style?: StyleProp<TextStyle> };

/** Variación con símbolo ▲/▼ además del color: nunca solo color. */
export function Variation({ value, style }: Props) {
  const { colores: colors } = useTema();
  const styles = useMemo(() => crearEstilos(colors), [colors]);
  const dir = direccion(value);
  const simbolo = dir === "sube" ? "▲" : dir === "baja" ? "▼" : "–";
  const etiqueta =
    dir === "sube" ? "Sube" : dir === "baja" ? "Baja" : "Sin variación";
  return (
    <Text
      accessibilityLabel={`${etiqueta} ${pct(value)}`}
      style={[
        styles.base,
        dir === "sube" && { color: colors.gainText },
        dir === "baja" && { color: colors.lossText },
        style,
      ]}>
      {simbolo} {pct(value)}
    </Text>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
    base: {
      fontFamily: "Manrope_700Bold",
      fontSize: 14,
      color: colors.textLight,
      fontVariant: ["tabular-nums"],
    },
  });
