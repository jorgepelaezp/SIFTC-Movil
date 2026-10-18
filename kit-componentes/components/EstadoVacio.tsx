import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius, fontSize } from "../theme";

type Props = { message?: string; detail?: string };

/** Estado "sin datos": la pantalla sigue usable, no se bloquea. */
export function EmptyState({
  message = "No hay datos para mostrar",
  detail = "Desliza hacia abajo para actualizar.",
}: Props) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>{message}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: "center",
  },
  title: {
    fontFamily: "Manrope_700Bold",
    fontSize: fontSize.lg,
    color: colors.text,
    textAlign: "center",
  },
  detail: {
    fontFamily: "Manrope_400Regular",
    fontSize: fontSize.md,
    color: colors.textLight,
    textAlign: "center",
    marginTop: spacing.xs,
  },
});
