import { useMemo } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { spacing, fontSize } from "../theme";
import { useTema } from "../theme/TemaContext";
import type { Paleta } from "../theme/paletas";

type Props = { message?: string };

export function LoadingIndicator({ message = "Cargando..." }: Props) {
  const { colores: colors } = useTema();
  const styles = useMemo(() => crearEstilos(colors), [colors]);
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
    container: { alignItems: "center", padding: spacing.lg },
    text: {
      marginTop: spacing.sm,
      color: colors.textLight,
      fontSize: fontSize.md,
    },
  });
