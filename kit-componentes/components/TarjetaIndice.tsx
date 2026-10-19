import { View, Text, StyleSheet } from "react-native";
import type { IndiceGeneral } from "../models";
import { Variation } from "./Variacion";
import { colors, spacing, radius, fontSize } from "../theme";
import { fechaIso, num } from "../utils/formato";

type Props = { indice: IndiceGeneral; ejemplo?: boolean };

export function IndexCard({ indice, ejemplo }: Props) {
  const celdas: [string, number | undefined][] = [
    ["Apertura", indice.apertura],
    ["Máximo", indice.maximo],
    ["Mínimo", indice.minimo],
    ["Cierre", indice.cierre],
  ];
  const visibles = celdas.filter(([, v]) => v !== undefined) as [string, number][];

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Índice general</Text>
      <View style={styles.row}>
        <Text style={styles.value}>{num(indice.valor, 1)}</Text>
        <Variation value={indice.variacionPct} />
      </View>
      <Text style={styles.soft}>
        {num(indice.variacion, 1)} puntos vs cierre anterior
      </Text>

      {visibles.length > 0 && (
        <View style={styles.cells}>
          {visibles.map(([nombre, valor]) => (
            <View key={nombre} style={styles.cell}>
              <Text style={styles.label}>{nombre}</Text>
              <Text style={styles.cellValue}>{num(valor, 1)}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.note}>
        Cierre del {fechaIso(indice.fecha)}
        {ejemplo ? " · Datos de ejemplo" : ""}
      </Text>
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
  label: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  value: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 44,
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  soft: {
    fontFamily: "Manrope_400Regular",
    fontSize: fontSize.md,
    color: colors.textLight,
  },
  cells: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  cell: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  cellValue: {
    fontFamily: "Manrope_700Bold",
    fontSize: fontSize.lg,
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  note: {
    fontFamily: "Manrope_400Regular",
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.md,
  },
});
