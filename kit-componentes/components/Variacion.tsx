import { Text, StyleSheet, StyleProp, TextStyle } from "react-native";
import { colors } from "../theme";
import { direccion, pct } from "../utils/formato";

// Colores de texto sobre fondo claro con contraste suficiente (documento de Rafael).
// El verde #10B981 del tema no cumple contraste como texto.
const TEXTO_SUBE = "#187A45";
const TEXTO_BAJA = "#B83232";

type Props = { value: number; style?: StyleProp<TextStyle> };

/** Variación con símbolo ▲/▼ además del color: nunca solo color. */
export function Variation({ value, style }: Props) {
  const dir = direccion(value);
  const simbolo = dir === "sube" ? "▲" : dir === "baja" ? "▼" : "–";
  const etiqueta =
    dir === "sube" ? "Sube" : dir === "baja" ? "Baja" : "Sin variación";
  return (
    <Text
      accessibilityLabel={`${etiqueta} ${pct(value)}`}
      style={[
        styles.base,
        dir === "sube" && { color: TEXTO_SUBE },
        dir === "baja" && { color: TEXTO_BAJA },
        style,
      ]}>
      {simbolo} {pct(value)}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: "Manrope_700Bold",
    fontSize: 14,
    color: colors.textLight,
    fontVariant: ["tabular-nums"],
  },
});
