import { useMemo } from "react";
import { Pressable, Text, ActivityIndicator, StyleSheet } from "react-native";
import { spacing, radius, fontSize } from "../theme";
import { useTema } from "../theme/TemaContext";
import type { Paleta } from "../theme/paletas";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
}: Props) {
  const { colores: colors } = useTema();
  const styles = useMemo(() => crearEstilos(colors), [colors]);
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={[styles.button, inactive && styles.inactive]}>
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
    button: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      alignItems: "center",
    },
    inactive: { opacity: 0.6 },
    text: { color: colors.white, fontSize: fontSize.md, fontWeight: "600" },
  });
