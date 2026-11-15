import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius, fontSize } from "../theme";

type Props = { total: number; ejemplo?: boolean };

/** Resumen de entidades reales; no representa un índice agregado del mercado. */
export function ResumenMercado({ total, ejemplo }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Mercado de entidades</Text>
      <View style={styles.row}>
        <Text style={styles.value}>{total}</Text>
        <Text style={styles.unit}>entidades disponibles</Text>
      </View>
      <Text style={styles.note}>{ejemplo ? "Datos de demostración" : "Información consultada directamente al backend SIFTC"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  label: { fontFamily: "Manrope_600SemiBold", fontSize: fontSize.sm, color: colors.textLight },
  row: { flexDirection: "row", alignItems: "baseline", gap: spacing.md, marginTop: spacing.xs },
  value: { fontFamily: "Manrope_800ExtraBold", fontSize: 44, color: colors.text, fontVariant: ["tabular-nums"] },
  unit: { fontFamily: "Manrope_500Medium", fontSize: fontSize.md, color: colors.textLight },
  note: { fontFamily: "Manrope_400Regular", fontSize: fontSize.sm, color: colors.textLight, marginTop: spacing.md },
});
