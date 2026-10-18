import { View, Text, StyleSheet } from "react-native";
import type { Entidad } from "../models";
import { colors, spacing, radius, fontSize } from "../theme";
import { pct } from "../utils/formato";

type Props = {
  entidades: Entidad[];
  mayorSubida?: Entidad;
  mayorBajada?: Entidad;
};

// Colores sobre fondo oscuro (documento de Rafael)
const SUBE_OSCURO = "#5FD08F";
const BAJA_OSCURO = "#FF8F8F";

export function DaySummary({ entidades, mayorSubida, mayorBajada }: Props) {
  const suben = entidades.filter((e) => e.variacionPct > 0).length;
  const bajan = entidades.filter((e) => e.variacionPct < 0).length;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Resumen del día</Text>
      <View style={styles.row}>
        <Text style={[styles.count, { color: SUBE_OSCURO }]}>▲ {suben} suben</Text>
        <Text style={[styles.count, { color: BAJA_OSCURO }]}>▼ {bajan} bajan</Text>
      </View>
      {mayorSubida && (
        <Text style={styles.line}>
          Mayor subida: {mayorSubida.codigo || mayorSubida.nombre}{" "}
          <Text style={{ color: SUBE_OSCURO }}>▲ {pct(mayorSubida.variacionPct)}</Text>
        </Text>
      )}
      {mayorBajada && (
        <Text style={styles.line}>
          Mayor bajada: {mayorBajada.codigo || mayorBajada.nombre}{" "}
          <Text style={{ color: BAJA_OSCURO }}>▼ {pct(mayorBajada.variacionPct)}</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.navy,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: fontSize.sm,
    color: "#AEB8D0",
  },
  row: { flexDirection: "row", gap: spacing.xl },
  count: { fontFamily: "Manrope_800ExtraBold", fontSize: fontSize.xl },
  line: {
    fontFamily: "Manrope_500Medium",
    fontSize: fontSize.md,
    color: colors.white,
  },
});
