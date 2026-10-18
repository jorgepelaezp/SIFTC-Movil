import { View, Text, Pressable, StyleSheet } from "react-native";
import type { Entidad } from "../models";
import { Variation } from "./Variacion";
import { colors, spacing, radius, fontSize } from "../theme";
import { num } from "../utils/formato";

type Props = {
  title: string;
  entidades: Entidad[];
  /** Al tocar una fila (más adelante abre la ficha de la entidad, HU-MO-04) */
  onPressEntidad?: (e: Entidad) => void;
};

export function TopList({ title, entidades, onPressEntidad }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {entidades.map((e, i) => (
        <Pressable
          key={e.id}
          style={styles.row}
          onPress={() => onPressEntidad?.(e)}
          accessibilityRole="button"
          accessibilityLabel={`${i + 1}. ${e.nombre}`}>
          <Text style={styles.pos}>{i + 1}</Text>
          <View style={styles.name}>
            <Text style={styles.nameText} numberOfLines={1}>
              {e.nombre}
            </Text>
            <Text style={styles.small} numberOfLines={1}>
              {[e.codigo, e.sector].filter(Boolean).join(" · ")}
            </Text>
          </View>
          <View style={styles.right}>
            <Text style={styles.index}>{num(e.indice, 1)}</Text>
            <Variation value={e.variacionPct} />
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  title: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: fontSize.lg,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  // Filas de al menos 56 px para tocarlas con comodidad (regla del tablero web)
  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pos: {
    width: 20,
    fontFamily: "Manrope_700Bold",
    fontSize: fontSize.md,
    color: colors.textLight,
  },
  name: { flex: 1 },
  nameText: {
    fontFamily: "Manrope_700Bold",
    fontSize: fontSize.md,
    color: colors.text,
  },
  small: {
    fontFamily: "Manrope_400Regular",
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  right: { alignItems: "flex-end" },
  index: {
    fontFamily: "Manrope_700Bold",
    fontSize: fontSize.md,
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
});
